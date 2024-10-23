import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { SecretValue } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as path from 'path';

interface PipelineProps extends cdk.StackProps {
  ecrRepo: ecr.Repository;
  eksClusters: { [envName: string]: eks.Cluster }; // Map of clusters per environment
  configEnvironments: [{
    envName: string,
    account: string,
    region: string
  }]
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: PipelineProps) {
    super(scope, id, props);

    // Create a role for the CodePipeline
    const pipelineRole = new iam.Role(this, 'PipelineRole', {
      assumedBy: new iam.ServicePrincipal('codepipeline.amazonaws.com'),
    });

    // Grant permissions to access necessary services
    pipelineRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        's3:*',
        'codebuild:*',
        'cloudformation:*',
        'sts:AssumeRole',
        'secretsmanager:GetSecretValue',
        'ecr:*',
        'eks:*',
      ],
      resources: ['*'], // You can restrict this further as needed
    }));

    // Define the CodePipeline
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'IgnisPipeline',
    });

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact(); // Define the build output artifact

    // Source Stage - GitHub Repository
    this.addSourceStage(pipeline, sourceOutput);

    // Build Stage - Build & Push to ECR
    this.addBuildStage(pipeline, sourceOutput, buildOutput, props.ecrRepo);

    // Add CDK Infra Deployment Stage
    this.addCDKInfraDeploymentStage(pipeline, sourceOutput);

    // Add Helm Deployment Stages (for dev, test, prod)
    this.addHelmDeploymentStages(pipeline, buildOutput, props.ecrRepo, props.eksClusters, props);
  }

  private addSourceStage(pipeline: codepipeline.Pipeline, sourceOutput: codepipeline.Artifact) {
    const githubUsername = ssm.StringParameter.valueForStringParameter(this, '/github/username');
    const githubRepository = ssm.StringParameter.valueForStringParameter(this, '/github/repository');

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipeline_actions.GitHubSourceAction({
          actionName: 'GitHub_Source',
          owner: githubUsername,
          repo: githubRepository,
          branch: 'main',
          oauthToken: SecretValue.secretsManager('github-oauth-token'),
          output: sourceOutput,
        }),
      ],
    });
  }

  private addBuildStage(
    pipeline: codepipeline.Pipeline,
    sourceOutput: codepipeline.Artifact,
    buildOutput: codepipeline.Artifact,
    ecrRepo: ecr.Repository
  ) {
    const buildSpecPath = path.join(__dirname, '../buildspec/buildspec-frontend-build.yaml');
    
    const buildProject = new codebuild.PipelineProject(this, 'CDKBuildProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true, // required for Docker builds
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename(buildSpecPath),
      environmentVariables: {
        REPO_URI: { value: ecrRepo.repositoryUri },
        IMAGE_TAG: { value: 'latest' },
      },
    });

    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'CDK_Build',
          project: buildProject,
          input: sourceOutput,
          outputs: [buildOutput],
        }),
      ],
    });
  }

  private addCDKInfraDeploymentStage(
    pipeline: codepipeline.Pipeline,
    sourceOutput: codepipeline.Artifact
  ) {
    const cdkInfraBuildSpecPath = path.join(__dirname, '../buildspec/buildspec-cdk-infra.yaml');

    const cdkDeployProject = new codebuild.PipelineProject(this, `CDKInfraDeployProject`, {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename(cdkInfraBuildSpecPath),
    });

    pipeline.addStage({
      stageName: 'DeployInfrastructure',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Deploy_CDK_Infrastructure',
          project: cdkDeployProject,
          input: sourceOutput,
        }),
      ],
    });
  }

  private addHelmDeploymentStages(
    pipeline: codepipeline.Pipeline,
    buildOutput: codepipeline.Artifact,
    ecrRepo: ecr.Repository,
    eksClusters: { [envName: string]: eks.Cluster },
    props: PipelineProps
  ) {

    props.configEnvironments.forEach( env => {
      const helmBuildSpecPath = path.join(__dirname, '../buildspec/buildspec-helm-frontend-deploy.yaml');
      
      const helmDeployProject = new codebuild.PipelineProject(this, `HelmDeployProject-${env.envName}`, {
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        },
        buildSpec: codebuild.BuildSpec.fromSourceFilename(helmBuildSpecPath),
        environmentVariables: {
          REPO_URI: { value: ecrRepo.repositoryUri },
          IMAGE_TAG: { value: 'latest' },
          CLUSTER_NAME: { value: eksClusters[env.envName].clusterName }, // Dynamically reference the cluster per environment
          NAMESPACE: { value: `${env.envName}-namespace` }, // Can vary by environment if needed
          NODE_ENV: { value: `${env.envName}`}
        },
      });

      pipeline.addStage({
        stageName: `Deploy${env.envName.toUpperCase()}`,
        actions: [
          new codepipeline_actions.CodeBuildAction({
            actionName: `Helm_Deploy_${env.envName}`,
            project: helmDeployProject,
            input: buildOutput,
          }),
        ],
      });
    });
  }
}

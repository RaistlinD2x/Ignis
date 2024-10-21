import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { SecretValue } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
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
        'secretsmanager:GetSecretValue'
      ],
      resources: ['*'], // You can restrict this further as needed
    }));

    // Define the CodePipeline
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'IgnisPipeline',
    });

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact(); // Define the build output artifact

    try {
      // Retrieve GitHub username and repository from SSM Parameter Store
      const githubUsername = ssm.StringParameter.valueForStringParameter(this, '/github/username');
      const githubRepository = ssm.StringParameter.valueForStringParameter(this, '/github/repository');

      // Source Stage - GitHub Repository
      pipeline.addStage({
        stageName: 'Source',
        actions: [
          new codepipeline_actions.GitHubSourceAction({
            actionName: 'GitHub_Source',
            owner: githubUsername,    // GitHub username
            repo: githubRepository,   // GitHub repository
            branch: 'main',
            oauthToken: SecretValue.secretsManager('github-oauth-token'),  // Token from Secrets Manager
            output: sourceOutput,
          }),
        ],
      });
    } catch (err) {
      const e = err as Error;
      console.error(`Error setting up GitHub Source: ${e.message}`);
      throw new Error('Pipeline setup failed due to missing GitHub credentials.');
    }

    // Build Stage - CodeBuild Project for CDK
    const buildProject = new codebuild.PipelineProject(this, 'CDKBuildProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0, // AWS CodeBuild image with Node.js 14.x
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'npm install -g aws-cdk',
              'cd cdk',
              'npm install',
            ],
          },
          build: {
            commands: [
              'cdk synth --context BOOTSTRAP=false',
              'cdk deploy --require-approval never --verbose --all',
            ],
          },
        },
        artifacts: {
          'base-directory': 'cdk/cdk.out',
          files: ['**/*'],
        },
      }),
    });

    // Attach required policies to CodeBuild for deployment
    buildProject.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'cloudformation:CreateChangeSet',
        'cloudformation:DescribeChangeSet',
        'cloudformation:ExecuteChangeSet',
        'cloudformation:DescribeStacks',
        's3:*',
        'sts:AssumeRole',
      ],
      resources: ['*'],
    }));

    // Add Build Stage to Pipeline
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'CDK_Build',
          project: buildProject,
          input: sourceOutput,
          outputs: [buildOutput],  // Define the output artifact
        }),
      ],
    });

    // Add Deployment Stages
    this.addDeploymentStages(pipeline, buildOutput);
  }

  private addDeploymentStages(pipeline: codepipeline.Pipeline, buildOutput: codepipeline.Artifact) {
    const environments = ['dev', 'test', 'prod'];

    for (const env of environments) {
      pipeline.addStage({
        stageName: `Deploy${env.toUpperCase()}`,
        actions: [
          new codepipeline_actions.CloudFormationCreateUpdateStackAction({
            actionName: `Deploy${env.toUpperCase()}`,
            stackName: `EKSStack-${env}`,
            templatePath: buildOutput.atPath(`EKSStack-${env}.template.json`), // Reference build output here
            adminPermissions: true,
          }),
        ],
      });

      // Add manual approval step for Test and Prod environments
      if (env !== 'prod') {
        pipeline.addStage({
          stageName: `ApproveTo${env === 'dev' ? 'Test' : 'Prod'}`,
          actions: [new codepipeline_actions.ManualApprovalAction({
            actionName: `ApproveTo${env === 'dev' ? 'Test' : 'Prod'}`,
          })],
        });
      }
    }
  }
}

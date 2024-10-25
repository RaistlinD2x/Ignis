import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { Role, ServicePrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export class InfraPipelineStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();
    const deployOutput = new codepipeline.Artifact();

    // Retrieve GitHub repository name and owner from SSM
    const githubRepo = StringParameter.valueForStringParameter(
      this,
      "/github/repo-name"
    );
    const githubOwner = StringParameter.valueForStringParameter(
      this,
      "/github/repo-owner"
    );

    // Retrieve GitHub OAuth token from Secrets Manager
    const githubOauthToken = cdk.SecretValue.secretsManager("github-oauth-token");

    // Define the pipeline IAM role for SSM access
    const infraPipelineSSMRole = new Role(this, "InfraPipelineSSMRole", {
      assumedBy: new ServicePrincipal("codepipeline.amazonaws.com"),
      description: "Role with permissions to access SSM parameters and GitHub OAuth token for Infra CodePipeline",
      roleName: "InfraPipelineSSMRole",
    });

    // Define the SSM policy inline with dynamic account and region values
    const ssmPolicy = new PolicyStatement({
      actions: ["ssm:*"],
      resources: ["*"],
    });

    // Allow access to Secrets Manager for GitHub OAuth token
    const secretsPolicy = new PolicyStatement({
      actions: ["secretsmanager:*"],
      resources: ["*"],
    });

    // Attach the policies to the role
    infraPipelineSSMRole.addToPolicy(ssmPolicy);
    infraPipelineSSMRole.addToPolicy(secretsPolicy);

    // Define CodePipeline
    new codepipeline.Pipeline(this, 'InfraPipeline', {
      pipelineName: 'InfraPipeline',
      stages: [
        // Source Stage
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.GitHubSourceAction({
              actionName: 'GitHub_Source',
              owner: githubOwner,
              repo: githubRepo,
              branch: 'main',
              oauthToken: githubOauthToken,
              output: sourceOutput,
            }),
          ],
        },

        // Dev Build Stage
        {
          stageName: 'Dev_Deploy',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Dev_Build',
              project: this.createCodeBuildProject('./cdk/buildspecs/infra/buildspec-infra-cdk-dev-deploy.yaml'),
              input: sourceOutput,
              outputs: [buildOutput],
            }),
          ],
        },

        // Test Stage with Manual Approval and Deploy
        {
          stageName: 'Test_Deploy',
          actions: [
            new codepipeline_actions.ManualApprovalAction({
              actionName: 'Approve_Test_Deploy',
            }),
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Test_Deploy',
              project: this.createCodeBuildProject('./cdk/buildspecs/infra/buildspec-infra-cdk-test-deploy.yaml'),
              input: buildOutput,
              outputs: [deployOutput],
            }),
          ],
        },

        // Prod Stage with Manual Approval and Deploy
        {
          stageName: 'Prod_Deploy',
          actions: [
            new codepipeline_actions.ManualApprovalAction({
              actionName: 'Approve_Prod_Deploy',
            }),
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Prod_Deploy',
              project: this.createCodeBuildProject('./cdk/buildspecs/infra/buildspec-infra-cdk-prod-deploy.yaml'),
              input: deployOutput,
            }),
          ],
        },
      ],
    });
  }

  // Helper function to create CodeBuild project with a specific buildspec file
  private createCodeBuildProject(buildSpecFile: string): codebuild.PipelineProject {
    return new codebuild.PipelineProject(this, `PipelineProject_${buildSpecFile}`, {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0, // Node.js 18 support
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename(buildSpecFile),
    });
  }
}

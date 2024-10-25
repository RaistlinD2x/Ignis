import * as cdk from "aws-cdk-lib";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Role, ServicePrincipal, PolicyStatement } from "aws-cdk-lib/aws-iam";

import * as path from 'path'

interface InfraPipelineProps extends cdk.StackProps {
  stages: { stageName: string; account: string; region: string }[];
}

export class InfraPipelineStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: InfraPipelineProps) {
    super(scope, id, props);

    // Get the account and region dynamically
    const accountId = this.account;
    const region = this.region;

    // Define the pipeline IAM role
    const infraPipelineSSMRole = new Role(this, "InfraPipelineSSMRole", {
      assumedBy: new ServicePrincipal("codepipeline.amazonaws.com"),
      description:
        "Role with permissions to access SSM parameters for the Infra CodePipeline",
      roleName: "InfraPipelineSSMRole"
    });

    // Define the SSM policy inline with dynamic account and region values
    const ssmPolicy = new PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: ["ssm:GetParameter", "ssm:GetParameters"],
      resources: [
        `arn:aws:ssm:${region}:${accountId}:parameter/github/repo-name`,
        `arn:aws:ssm:${region}:${accountId}:parameter/github/repo-owner`
      ]
    });

    // Attach the policy to the role
    infraPipelineSSMRole.addToPolicy(ssmPolicy);

    // Define the CodePipeline
    const pipeline = new codepipeline.Pipeline(this, "InfraPipeline", {
      pipelineName: "InfraPipeline",
      role: infraPipelineSSMRole,
    });

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    // Retrieve GitHub credentials from SSM parameters (instead of dotenv)
    const githubOwner = ssm.StringParameter.valueForStringParameter(
      this,
      "/github/repo-owner"
    );
    const githubRepo = ssm.StringParameter.valueForStringParameter(
      this,
      "/github/repo-name"
    );
    const githubOauthToken =
      cdk.SecretValue.secretsManager("github-oauth-token");

    // Source Stage
    pipeline.addStage({
      stageName: "Source",
      actions: [
        new codepipeline_actions.GitHubSourceAction({
          actionName: "GitHub_Source",
          owner: githubOwner,
          repo: githubRepo,
          branch: "main",
          oauthToken: githubOauthToken,
          output: sourceOutput,
        }),
      ],
    });

    // Build Stage
    pipeline.addStage({
      stageName: "Build",
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: "Build",
          project: new codebuild.PipelineProject(this, "MyBuildProject", {
            buildSpec: codebuild.BuildSpec.fromSourceFilename('cdk/buildspecs/infra/buildspec-infra-cdk-deploy.yaml'),
          }),
          input: sourceOutput,
          outputs: [buildOutput],
        }),
      ],
    });

    // Loop through each stage (dev, test, prod) and add a deployment stage for each
    props.stages.forEach((stage, index) => {
      const deployStageName = `DeployTo${stage.stageName.charAt(0).toUpperCase() + stage.stageName.slice(1)}`;

      // Deploy to current environment
      pipeline.addStage({
        stageName: deployStageName,
        actions: [
          new codepipeline_actions.CodeBuildAction({
            actionName: `Deploy_${stage.stageName}`,
            project: new codebuild.PipelineProject(this, `DeployProject_${stage.stageName}`, {
              buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
              environmentVariables: {
                STAGE_NAME: { value: stage.stageName },  // Pass the environment name
              },
            }),
            input: buildOutput,
          }),
        ],
      });

      // Add a manual approval step between environments
      if (index < props.stages.length - 1) {
        pipeline.addStage({
          stageName: `ApprovalBefore${props.stages[index + 1].stageName}`,
          actions: [
            new codepipeline_actions.ManualApprovalAction({
              actionName: `ManualApproval_${stage.stageName}`,
            }),
          ],
        });
      }
    });
  }
}

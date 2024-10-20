import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { SecretValue } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dotenv from 'dotenv';

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
    try {
      dotenv.config();
      const githubUsername = process.env.GITHUB_USERNAME!;
      const githubRepository = process.env.GITHUB_REPOSITORY!;

      if (!githubUsername || !githubRepository) {
        throw new Error('GitHub username or repository name is missing. Please ensure they are set in the .env file.');
      }

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
              'npm install',
            ],
          },
          build: {
            commands: [
              'cdk synth',
              'cdk deploy --require-approval never --verbose',
            ],
          },
        },
        artifacts: {
          'base-directory': 'cdk.out',
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
        }),
      ],
    });
  }
}

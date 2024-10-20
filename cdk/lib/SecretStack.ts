import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class SecretStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Check if the .env file exists and load the values
    if (fs.existsSync('.env')) {
      dotenv.config();
      const githubToken = process.env.GITHUB_OAUTH_TOKEN;
      const githubUsername = process.env.GITHUB_USERNAME;
      const githubRepository = process.env.GITHUB_REPOSITORY;

      // Store GitHub OAuth token in Secrets Manager
      if (githubToken) {
        new secretsmanager.Secret(this, 'GitHubOAuthToken', {
          secretName: 'github-oauth-token',
          secretStringValue: cdk.SecretValue.unsafePlainText(githubToken),
        });
      } else {
        throw new Error('GitHub OAuth token not found in .env file. Please add it.');
      }

      // Store GitHub username and repository in SSM Parameter Store
      if (githubUsername && githubRepository) {
        new ssm.StringParameter(this, 'GitHubUsernameParam', {
          parameterName: '/github/username',
          stringValue: githubUsername,
        });

        new ssm.StringParameter(this, 'GitHubRepoParam', {
          parameterName: '/github/repository',
          stringValue: githubRepository,
        });
      } else {
        throw new Error('GitHub username or repository not found in .env file. Please add them.');
      }
    } else {
      throw new Error('.env file not found. Please ensure it exists.');
    }
  }
}

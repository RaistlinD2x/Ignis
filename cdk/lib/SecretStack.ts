import * as cdk from 'aws-cdk-lib';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class SecretStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Check if the .env file exists and load the GitHub OAuth token
    if (fs.existsSync('.env')) {
      dotenv.config();
      const githubToken = process.env.GITHUB_OAUTH_TOKEN;

      if (githubToken) {
        // Create the GitHub OAuth token secret in Secrets Manager using a secure format
        new secretsmanager.Secret(this, 'GitHubOAuthToken', {
          secretName: 'github-oauth-token',
          generateSecretString: {
            secretStringTemplate: JSON.stringify({ GITHUB_OAUTH_TOKEN: githubToken }),
            generateStringKey: 'GITHUB_OAUTH_TOKEN',
          },
        });

        console.log('GitHub OAuth token loaded from .env and pushed to Secrets Manager.');
      } else {
        throw new Error(
          'GitHub OAuth token not found in .env file. Please add it and try again.'
        );
      }
    } else {
      throw new Error(
        '.env file not found. Please make sure it exists with the GitHub OAuth token.'
      );
    }
  }
}


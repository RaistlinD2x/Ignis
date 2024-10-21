#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/PipelineStack';
import { SecretStack } from '../lib/SecretStack';
import { NetworkStack } from '../lib/NetworkStack';
import { EKSStack } from '../lib/EKSStack';
import * as fs from 'fs';
import * as yaml from 'js-yaml'
import * as path from 'path';

// TODO: move this to a helper function
const configPath = path.resolve(__dirname, '..', 'config.yaml');
console.log(configPath)
const config: any = yaml.load(fs.readFileSync(configPath, 'utf8'));
const configEnvironments = config.environments

const app = new cdk.App();

// Check if bootstrapping is needed (based on .env)
const isBootstrapping = fs.existsSync('.env');

if (isBootstrapping) {
  console.log('Bootstrapping: Deploying SecretStack');
  // Deploy the SecretStack only if bootstrapping is required
  new SecretStack(app, 'SecretStack', {});
} else {
  console.log('Skipping SecretStack as it is not needed.');
}

// Loop through each environment and create stacks
for (const env of configEnvironments) {
  const envName = env.envName;

  // Create a network stack for each environment
  const networkStack = new NetworkStack(app, `NetworkStack-${envName}`, {
    env: { account: env.account, region: env.region }
  });

  // Create an EKS Stack for each environment
  new EKSStack(app, `EKSStack-${envName}`, {
    vpc: networkStack.vpc,
    clusterStage: env.envName,
    env: { account: env.account, region: env.region }

  });
// This is change
}

// Deploy the pipeline globally, no need for namespace here
new PipelineStack(app, 'PipelineStack', {});


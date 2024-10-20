#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/PipelineStack';
import { SecretStack } from '../lib/SecretStack';
import { NetworkStack } from '../lib/NetworkStack';
import { EKSStack } from '../lib/EKSStack'
import * as fs from 'fs';

const app = new cdk.App();

// Check if bootstrapping is needed based on the presence of .env file or an environment variable
const isBootstrapping = fs.existsSync('.env');

if (isBootstrapping) {
  console.log('Bootstrapping: Deploying SecretStack');
  // Deploy the SecretStack only if bootstrapping is required
  new SecretStack(app, 'SecretStack', {});
} else {
  console.log('Skipping SecretStack as it is not needed.');
}

new PipelineStack(app, 'PipelineStack', {});

const networkStack = new NetworkStack(app, 'NetworkStack', {});

new EKSStack(app, 'EKSStack', {
  vpc: networkStack.vpc
});
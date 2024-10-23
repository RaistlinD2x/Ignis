#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/PipelineStack';
import { SecretStack } from '../lib/SecretStack';
import { NetworkStack } from '../lib/NetworkStack';
import { EKSStack } from '../lib/EKSStack';
import { ECRStack } from '../lib/ECRStack';
import { StorageStack } from '../lib/StorageStack';
import * as fs from 'fs';
import * as yaml from 'js-yaml'
import * as path from 'path';
import * as eks from 'aws-cdk-lib/aws-eks'


// TODO: move this to a helper function
const configPath = path.resolve(__dirname, '..', 'config.yaml');
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



const ecrStack = new ECRStack(app, 'ECRStack', {})

// map to capture EKS Cluster names
const eksClusters: { [envName: string]: eks.Cluster} = {};

// Loop through each environment and create stacks
for (const env of configEnvironments) {
  const envName = env.envName;

  // Create a network stack for each environment
  const networkStack = new NetworkStack(app, `NetworkStack-${envName}`, {
    env: { account: env.account, region: env.region },
    envName: envName
  });

  // Create an EKS Stack for each environment
  const eksCluster = new EKSStack(app, `EKSStack-${envName}`, {
    vpc: networkStack.vpc,
    envName: env.envName,
    env: { account: env.account, region: env.region },
    ecrRepo: ecrStack.repository
  });


  eksClusters[envName] = eksCluster.cluster
}

// instatiate Storage Stack
const storageStack = new StorageStack(app, 'StorageStack', {})

// Deploy the pipeline globally, no need for namespace here
new PipelineStack(app, 'PipelineStack', {
  helmBucket: storageStack.helmBucket,
  configEnvironments: configEnvironments,
  ecrRepo: ecrStack.repository,
  eksClusters: eksClusters
});




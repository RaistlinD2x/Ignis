#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfraPipelineStack } from '../lib/pipelines/InfraPipelineStack';
import { FrontendPipelineStack } from '../lib/pipelines/FrontendPipelineStack'
import { AuthStack } from '../lib/infra/auth/AuthStack';
import { stages } from '../scripts/util/stage-config-loader'; // Configuration for dev/test/prod environments
import { StorageStack } from '../lib/infra/storage/StorageStack';
import { NetworkStack } from '../lib/infra/network/NetworkStack';
import { ComputeStack } from '../lib/infra/compute/ComputeStack';
import { EKSStack } from '../lib/infra/eks/EKSStack';

const app = new cdk.App();


// Infra Stacks

// Create Network Stack
const networkStack = new NetworkStack(app, 'NetworkStack')

// Create Storage Stack
const storageStack = new StorageStack(app, 'StorageStack')

// Create AuthStack
const authStack = new AuthStack(app, "AuthStack")

// Create Compute Stack
const computeStack = new ComputeStack(app, 'ComputeStack')


// Create EKS Stack
const eksStack = new EKSStack(app, 'EKSStack')




/* ----------------------------------------------------------- */


// Frontend Stacks



/* ----------------------------------------------------------- */


// Backend Stacks




/* ----------------------------------------------------------- */


// Pipeline Stacks

// Create the PipelineStack that will manage deployments to dev/test/prod
new InfraPipelineStack(app, 'InfraPipelineStack', {
  stages: stages,
});

new FrontendPipelineStack(app, 'FrontendPipelineStack')
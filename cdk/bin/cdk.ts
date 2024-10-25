#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

// import infra
import { AuthStack } from "../lib/infra/auth/AuthStack";
import { StorageStack } from "../lib/infra/storage/StorageStack";
import { NetworkStack } from "../lib/infra/network/NetworkStack";
import { ComputeStack } from "../lib/infra/compute/ComputeStack";
import { EKSStack } from "../lib/infra/eks/EKSStack";

// import pipelines
import { InfraPipelineStack } from "../lib/pipelines/InfraPipelineStack";
import { FrontendPipelineStack } from "../lib/pipelines/FrontendPipelineStack";
import { BackendPipelineStack } from "../lib/pipelines/BackendPipelineStack";
import { AIMLPipelineStack } from "../lib/pipelines/AIMLPipelineStack";

const app = new cdk.App();

const stage = app.node.tryGetContext("stage") || "DEV"

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
}



// Infra Stacks

// Create Network Stack
const networkStack = new NetworkStack(app, `NetworkStack-${stage}`, {
  env: env,
});

// Create Storage Stack
const storageStack = new StorageStack(app, `StorageStack-${stage}`, {
  env: env,
});

// Create AuthStack
const authStack = new AuthStack(app, `AuthStack-${stage}`, {
  env: env,
});

// Create Compute Stack
const computeStack = new ComputeStack(app, `ComputeStack-${stage}`, {
  env: env,
});

// Create EKS Stack
const eksStack = new EKSStack(app, `EKSStack-${stage}`, {
  env: env
});

/* ----------------------------------------------------------- */

// Frontend Stacks

/* ----------------------------------------------------------- */

// Backend Stacks

/* ----------------------------------------------------------- */

// Pipeline Stacks

// Create the PipelineStack that will manage deployments to dev/test/prod
new InfraPipelineStack(app, "InfraPipelineStack");

new FrontendPipelineStack(app, "FrontendPipelineStack");

new BackendPipelineStack(app, "BackendPipelineStack");

new AIMLPipelineStack(app, "AIMLPipelineStack");

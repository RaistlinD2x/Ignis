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

// custom import
import { stages } from "../scripts/util/stage-config-loader"; // Load stages from stages.yaml

const app = new cdk.App();

// Get the target environment (STAGE_NAME) from the environment variables
const targetStage = process.env.STAGE_NAME || "DEV";

// validate stage ENV variable is provided
if (!targetStage) {
  throw new Error("No environment (STAGE_NAME) provided");
}

// Find the corresponding stage configuration from stages.yaml
const stageConfig = stages.find((stage) => stage.stageName === targetStage);

// validate stage ENV variable provided matches a name in the config
if (!stageConfig) {
  throw new Error(`No stage configuration found for ${targetStage}`);
}

// Namespace stacks by stage
const stageName = stageConfig.stageName;

// prepare account and region info in the correct data structure
const stackEnv = {
  account: stageConfig.account,
  region: stageConfig.region,
};

// Infra Stacks

// Create Network Stack
const networkStack = new NetworkStack(app, `NetworkStack-${stageName}`, {
  env: stackEnv,
});

// Create Storage Stack
const storageStack = new StorageStack(app, `StorageStack-${stageName}`, {
  env: stackEnv,
});

// Create AuthStack
const authStack = new AuthStack(app, `AuthStack-${stageName}`, {
  env: stackEnv,
});

// Create Compute Stack
const computeStack = new ComputeStack(app, `ComputeStack-${stageName}`, {
  env: stackEnv,
});

// Create EKS Stack
const eksStack = new EKSStack(app, `EKSStack-${stageName}`, { env: stackEnv });

/* ----------------------------------------------------------- */

// Frontend Stacks

/* ----------------------------------------------------------- */

// Backend Stacks

/* ----------------------------------------------------------- */

// Pipeline Stacks

// Create the PipelineStack that will manage deployments to dev/test/prod
new InfraPipelineStack(app, "InfraPipelineStack", {
  stages: stages,
});

new FrontendPipelineStack(app, "FrontendPipelineStack");

new BackendPipelineStack(app, "BackendPipelineStack");

new AIMLPipelineStack(app, "AIMLPipelineStack");

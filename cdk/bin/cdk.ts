#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfraPipelineStack } from '../lib/pipelines/InfraPipelineStack';
import { AuthStack } from '../lib/infra/auth/AuthStack';
import { stages } from '../scripts/util/stage-config-loader'; // Configuration for dev/test/prod environments

const app = new cdk.App();

// Create AuthStack
const authStack = new AuthStack(app, "AuthStack")

// Create the PipelineStack that will manage deployments to dev/test/prod
new InfraPipelineStack(app, 'InfraPipelineStack', {
  stages: stages,
});
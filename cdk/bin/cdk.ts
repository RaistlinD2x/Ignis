#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/PipelineStack';
import { SecretStack } from '../lib/SecretStack';

const app = new cdk.App();
new PipelineStack(app, 'PipelineStack', {});
new SecretStack(app, 'SecretStack', {});
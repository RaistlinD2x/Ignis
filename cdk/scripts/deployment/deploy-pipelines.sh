#!/bin/bash

# scripts/deployment/deploy-pipelines.sh
# Deploy all the pipelines

###### LIST OF PIPELINES ######
# InfraPipelineStack
# FrontendPipelineStack 
# BackendPipelineStack 
# AIMLPipelineStack

# Capture the arguments passed from the bootstrap script
PROFILE="$1"
CDK_REGION="$2"
ACCOUNT_ID="$3"
REQUIRE_APPROVAL="$4"

# move to cdk directory from scripts subdir
cd ..

echo $REQUIRE_APPROVAL

cdk deploy InfraPipelineStack --profile "$PROFILE" --region "$CDK_REGION" --require-approval "$REQUIRE_APPROVAL"
if [ $? -ne 0 ]; then
  echo "Failed to deploy PipelineStack"
  exit 1
fi

echo "Pipelines deployed successfully!"

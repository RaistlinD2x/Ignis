#!/bin/bash

# scripts/deploy-infra.sh
# Deploy all infrastructure stacks

echo "Deploying all infrastructure stacks..."

# Capture the arguments passed from the bootstrap script
PROFILE="$1"
CDK_REGION="$2"
ACCOUNT_ID="$3"
REQUIRE_APPROVAL="$4"

# move to cdk directory from scripts subdir
cd ..

# Deploy all stacks at once
cdk deploy --all --profile "$PROFILE" --region "$CDK_REGION" --require-approval "$REQUIRE_APPROVAL"
if [ $? -ne 0 ]; then
  echo "Failed to deploy infrastructure stacks"
  exit 1
fi

echo "All infrastructure stacks deployed successfully!"

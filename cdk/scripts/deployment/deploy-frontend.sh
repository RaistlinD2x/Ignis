#!/bin/bash

# scripts/deploy-frontend.sh
# Deploy frontend services

# Capture the arguments passed from the bootstrap script
PROFILE="$1"
CDK_REGION="$2"
ACCOUNT_ID="$3"
REQUIRE_APPROVAL="$4"

# move into cdk directory from scripts
cd .. 

echo "Deploying frontend services..."

# Deploy FrontendServiceA
cdk deploy FrontendServiceAStack --profile "$PROFILE" --region "$CDK_REGION" $REQUIRE_APPROVAL
if [ $? -ne 0 ]; then
  echo "Failed to deploy FrontendServiceAStack"
  exit 1
fi

# Deploy FrontendServiceB
cdk deploy FrontendServiceBStack --profile "$PROFILE" --region "$CDK_REGION" $REQUIRE_APPROVAL
if [ $? -ne 0 ]; then
  echo "Failed to deploy FrontendServiceBStack"
  exit 1
fi

echo "Frontend services deployed successfully!"

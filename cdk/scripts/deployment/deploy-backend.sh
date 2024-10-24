#!/bin/bash

# scripts/deploy-backend.sh
# Deploy backend services (microservices)

# Capture the arguments passed from the bootstrap script
PROFILE="$1"
CDK_REGION="$2"
ACCOUNT_ID="$3"
REQUIRE_APPROVAL="$4"

# move into cdk directory from scripts subdir
cd ..

echo "Deploying backend services..."

cdk deploy BackendServiceAStack --profile "$PROFILE" --region "$CDK_REGION" $REQUIRE_APPROVAL
if [ $? -ne 0 ]; then
  echo "Failed to deploy BackendServiceAStack"
  exit 1
fi

cdk deploy BackendServiceBStack --profile "$PROFILE" --region "$CDK_REGION" $REQUIRE_APPROVAL
if [ $? -ne 0 ]; then
  echo "Failed to deploy BackendServiceBStack"
  exit 1
fi

echo "Backend services deployed successfully!"

#!/bin/bash

# scripts/setup.sh
# Main bootstrap script to orchestrate everything

# Set your AWS profile and region
PROFILE="ignis"
CDK_REGION="us-east-1"
REQUIRE_APPROVAL="never"

echo $REQUIRE_APPROVAL

# Load AWS account info
ACCOUNT_ID=$(aws sts get-caller-identity --profile "$PROFILE" --query "Account" --output text)

# Step 0: Optionally delete existing secrets and SSM parameters
# echo "Deleting existing secrets and SSM parameters (if they exist)..."
# sh ./delete-secrets.sh "$PROFILE"
# if [ $? -ne 0 ]; then
#   echo "Failed to delete existing secrets or SSM parameters. Continuing with bootstrap process..."
# fi

# Step 1: Bootstrap secrets
echo "Bootstrapping secrets..."
pwd
ls bootstrap
sh ./bootstrap/bootstrap-secrets.sh "$PROFILE" "$CDK_REGION"
if [ $? -ne 0 ]; then
  echo "Failed to bootstrap secrets. Exiting..."
  exit 1
fi

# Step 2: Deploy infrastructure
echo "Deploying infrastructure..."
sh ./deployment/deploy-infra.sh "$PROFILE" "$CDK_REGION" "$ACCOUNT_ID" "$REQUIRE_APPROVAL"
if [ $? -ne 0 ]; then
  echo "Failed to deploy infrastructure. Exiting..."
  exit 1
fi

# Step 3: Deploy frontend services
# echo "Deploying frontend services..."
# sh ./deployment/deploy-frontend.sh "$PROFILE" "$CDK_REGION" "$ACCOUNT_ID" "$REQUIRE_APPROVAL"
# if [ $? -ne 0 ]; then
#   echo "Failed to deploy frontend services. Exiting..."
#   exit 1
# fi

# Step 4: Deploy backend services
# echo "Deploying backend services..."
# sh ./deployment/deploy-backend.sh "$PROFILE" "$CDK_REGION" "$ACCOUNT_ID" "$REQUIRE_APPROVAL"
# if [ $? -ne 0 ]; then
#   echo "Failed to deploy backend services. Exiting..."
#   exit 1
# fi

# Step 3: Deploy pipelines
# echo "Deploying pipelines..."
# sh ./deployment/deploy-pipelines.sh "$PROFILE" "$CDK_REGION" "$ACCOUNT_ID" "$REQUIRE_APPROVAL"
# if [ $? -ne 0 ]; then
#   echo "Failed to deploy pipelines. Exiting..."
#   exit 1
# fi

echo "Bootstrap process completed successfully!"

#!/bin/bash

# scripts/deploy-aiml.sh
# Deploy AIML services

# Capture the arguments passed from the bootstrap script
PROFILE="$1"
CDK_REGION="$2"
ACCOUNT_ID="$3"
REQUIRE_APPROVAL="$4"

# move into cdk directory from scripts subdir
cd ..

echo "Deploying AIML services..."

# Deploy AIMLServiceA
cdk deploy AIMLServiceAStack --profile "$PROFILE" --region "$CDK_REGION" $REQUIRE_APPROVAL
if [ $? -ne 0 ]; then
  echo "Failed to deploy AIMLServiceAStack"
  exit 1
fi

# Deploy AIMLServiceB
cdk deploy AIMLServiceBStack --profile "$PROFILE" --region "$CDK_REGION" $REQUIRE_APPROVAL
if [ $? -ne 0 ]; then
  echo "Failed to deploy AIMLServiceBStack"
  exit 1
fi

# Add more AIML services as needed
# cdk deploy AIMLServiceCStack --profile "$PROFILE" --region "$CDK_REGION" $REQUIRE_APPROVAL
# if [ $? -ne 0 ]; then
#  

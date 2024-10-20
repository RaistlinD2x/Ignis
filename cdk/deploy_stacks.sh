#!/bin/bash

# Set your AWS profile and options
PROFILE="ignis"
REQUIRE_APPROVAL="--require-approval never"
CDK_REGION="us-east-1"  # Specify your region
CDK_ACCOUNT=$(aws sts get-caller-identity --profile "$PROFILE" --query "Account" --output text)

# List of stacks to deploy
STACKS=(
  "SecretStack"
  "PipelineStack"
  # Add more stacks as needed
)

# Function to check if CDK is bootstrapped
check_bootstrap() {
  echo "Checking if CDK is bootstrapped for account $CDK_ACCOUNT in region $CDK_REGION..."

  # Run CDK bootstrap list to see if bootstrapping is required
  BOOTSTRAP_STATUS=$(cdk bootstrap aws://"$CDK_ACCOUNT"/"$CDK_REGION" --profile "$PROFILE" --show-template)

  if [[ $BOOTSTRAP_STATUS == *"Environment bootstrapped"* ]]; then
    echo "CDK is already bootstrapped for this environment."
  else
    echo "CDK is not bootstrapped. Bootstrapping now..."
    cdk bootstrap aws://"$CDK_ACCOUNT"/"$CDK_REGION" --profile "$PROFILE"
    
    if [ $? -ne 0 ]; then
      echo "Error bootstrapping CDK. Exiting."
      exit 1
    fi

    echo "CDK bootstrapping completed."
  fi
}

# Function to deploy a stack
deploy_stack() {
  local stack_name=$1
  echo "-------------------------------------"
  echo "Deploying $stack_name..."
  echo "-------------------------------------"

  cdk deploy "$stack_name" --profile "$PROFILE" $REQUIRE_APPROVAL

  if [ $? -ne 0 ]; then
    echo "Error deploying $stack_name. Exiting."
    exit 1
  fi

  echo "$stack_name deployed successfully."
  echo "-------------------------------------"
}

# Check if CDK needs to be bootstrapped
check_bootstrap

# Loop through each stack and deploy
for stack in "${STACKS[@]}"; do
  deploy_stack "$stack"
done

echo "All stacks deployed successfully!"

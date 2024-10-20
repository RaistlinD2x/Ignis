#!/bin/bash

# Set your AWS profile and options
PROFILE="ignis"
REQUIRE_APPROVAL="--require-approval never"

# List of stacks to deploy
STACKS=(
  "SecretStack"
  "PipelineStack"
  # Add more stacks as needed
)

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

# Loop through each stack and deploy
for stack in "${STACKS[@]}"; do
  deploy_stack "$stack"
done

echo "All stacks deployed successfully!"

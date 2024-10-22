#!/bin/bash

# Set your AWS profile and options
PROFILE="ignis"
REQUIRE_APPROVAL="--require-approval never"
CDK_REGION="us-east-1"  # Specify your region
CDK_ACCOUNT=$(aws sts get-caller-identity --profile "$PROFILE" --query "Account" --output text)

# Parse the YAML config file using Node.js
ENVIRONMENTS=$(node ./parseConfig.js)
if [ $? -ne 0 ]; then
  echo "Failed to parse YAML config. Exiting."
  exit 1
fi

# Function to check if CDK is bootstrapped
check_bootstrap() {
  local account=$1
  local region=$2

  echo "Checking if CDK is bootstrapped for account $account in region $region..."

  # Run CDK bootstrap list to see if bootstrapping is required
  BOOTSTRAP_STATUS=$(cdk bootstrap aws://"$account"/"$region" --profile "$PROFILE" --show-template)

  if [[ $BOOTSTRAP_STATUS == *"Environment bootstrapped"* ]]; then
    echo "CDK is already bootstrapped for this environment."
  else
    echo "CDK is not bootstrapped. Bootstrapping now..."
    cdk bootstrap aws://"$account"/"$region" --profile "$PROFILE"
    
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

# move into CDK directory
cd ..

# Deploy any stacks for bootstrapping environment
deploy_stack "SecretStack" # parses GitHub info before pipeline deployment

# Loop through environments parsed by Node.js
while IFS=" " read -r envName account region; do
  # Check if CDK needs to be bootstrapped for this environment
  check_bootstrap "$account" "$region"

  # Deploy dynamic stack based on environment name
  deploy_stack "NetworkStack-$envName"
  deploy_stack "EKSStack-$envName"
done <<< "$ENVIRONMENTS"

# deploy stacks that do not require envName modifiers
deploy_stack "ECRStack"
deploy_stack "PipelineStack" # depends on other stacks

echo "All stacks deployed successfully!"

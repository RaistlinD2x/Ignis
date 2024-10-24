#!/bin/bash

# scripts/bootstrap-secrets.sh
# Load sensitive info from .env
source ./bootstrap/.env

# Check if the secret exists or is scheduled for deletion
echo "Checking for GitHub OAuth token secret..."
secret_status=$(aws secretsmanager describe-secret --secret-id "github-oauth-token" --profile "$PROFILE" 2>&1)

if [[ $secret_status == *"ResourceNotFoundException"* ]]; then
  # Secret doesn't exist, so create it
  echo "Creating GitHub OAuth token secret..."
  aws secretsmanager create-secret --name "github-oauth-token" --secret-string "$GITHUB_OAUTH_TOKEN" --profile "$PROFILE"
  if [ $? -ne 0 ]; then
    echo "Failed to create GitHub OAuth token secret."
    exit 1
  fi
elif [[ $secret_status == *"Scheduled for deletion"* ]]; then
  # Secret is scheduled for deletion, so restore it
  echo "Cancelling deletion for GitHub OAuth token secret..."
  aws secretsmanager restore-secret --secret-id "github-oauth-token" --profile "$PROFILE"
  if [ $? -ne 0 ]; then
    echo "Failed to cancel deletion of GitHub OAuth token secret."
    exit 1
  else
    echo "Deletion of GitHub OAuth token secret cancelled. Updating secret..."
    aws secretsmanager put-secret-value --secret-id "github-oauth-token" --secret-string "$GITHUB_OAUTH_TOKEN" --profile "$PROFILE"
    if [ $? -ne 0 ]; then
      echo "Failed to update GitHub OAuth token secret."
      exit 1
    fi
  fi
else
  # Secret exists and is active, so update it
  echo "Updating GitHub OAuth token secret..."
  aws secretsmanager put-secret-value --secret-id "github-oauth-token" --secret-string "$GITHUB_OAUTH_TOKEN" --profile "$PROFILE"
  if [ $? -ne 0 ]; then
    echo "Failed to update GitHub OAuth token secret."
    exit 1
  fi
fi

# Push GitHub repository owner and repository name to SSM
echo "Pushing GitHub repository owner to SSM..."
aws ssm put-parameter --name " /github/repo-owner" --value "$GITHUB_OWNER" --type "String" --overwrite --profile "$PROFILE"
if [ $? -ne 0 ]; then
  echo "Failed to push GitHub repo owner to SSM."
  exit 1
fi

echo "Pushing GitHub repository name to SSM..."
aws ssm put-parameter --name " /github/repo-name" --value "$GITHUB_REPO" --type "String" --overwrite --profile "$PROFILE"
if [ $? -ne 0 ]; then
  echo "Failed to push GitHub repo name to SSM."
  exit 1
fi

echo "Secrets and parameters bootstrapped successfully!"

#!/bin/bash

# scripts/delete-secrets.sh
# Conditionally delete GitHub OAuth token secret and SSM parameters if they exist

# Load sensitive info from .env
source ../bootstrap/.env

# Check if the GitHub OAuth token secret exists, and delete if it does
echo "Checking for GitHub OAuth token secret..."
secret_exists=$(aws secretsmanager describe-secret --secret-id "github-oauth-token" --profile "$PROFILE" 2>&1)
if [[ $secret_exists != *"ResourceNotFoundException"* ]]; then
  echo "Deleting GitHub OAuth token secret..."
  aws secretsmanager delete-secret --secret-id "github-oauth-token" --force-delete-without-recovery --profile "$PROFILE"
  if [ $? -ne 0 ]; then
    echo "Failed to delete GitHub OAuth token secret."
  else
    echo "GitHub OAuth token secret deleted."
  fi
else
  echo "GitHub OAuth token secret does not exist. Skipping deletion."
fi

# Check if the GitHub repo owner SSM parameter exists, and delete if it does
echo "Checking for GitHub repo owner in SSM..."
param_owner_exists=$(aws ssm get-parameter --name "/github/repo-owner" --profile "$PROFILE" 2>&1)
if [[ $param_owner_exists != *"ParameterNotFound"* ]]; then
  echo "Deleting GitHub repo owner from SSM..."
  aws ssm delete-parameter --name "/github/repo-owner" --profile "$PROFILE"
  if [ $? -ne 0 ]; then
    echo "Failed to delete GitHub repo owner from SSM."
  else
    echo "GitHub repo owner deleted from SSM."
  fi
else
  echo "GitHub repo owner does not exist in SSM. Skipping deletion."
fi

# Check if the GitHub repo name SSM parameter exists, and delete if it does
echo "Checking for GitHub repo name in SSM..."
param_repo_exists=$(aws ssm get-parameter --name "/github/repo-name" --profile "$PROFILE" 2>&1)
if [[ $param_repo_exists != *"ParameterNotFound"* ]]; then
  echo "Deleting GitHub repo name from SSM..."
  aws ssm delete-parameter --name "/github/repo-name" --profile "$PROFILE"
  if [ $? -ne 0 ]; then
    echo "Failed to delete GitHub repo name from SSM."
  else
    echo "GitHub repo name deleted from SSM."
  fi
else
  echo "GitHub repo name does not exist in SSM. Skipping deletion."
fi

echo "Secrets and parameters deletion process completed!"

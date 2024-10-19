# Generating a GitHub OAuth Token for AWS CodePipeline

In this guide, you will learn how to generate a **GitHub OAuth Token** (Personal Access Token) that can be used for integrating **AWS CodePipeline** with GitHub.

## Steps to Generate the GitHub OAuth Token

### 1. Go to GitHub Settings
- Log into your GitHub account.
- In the top-right corner, click on your profile icon and select **Settings** from the dropdown menu.

### 2. Navigate to Developer Settings
- On the left sidebar, scroll down and click **Developer settings** near the bottom.

### 3. Go to Personal Access Tokens
- Under **Developer settings**, select **Personal access tokens**.
- Click on **Tokens (classic)** to manage your tokens.

### 4. Generate a New Token
- Click on **Generate new token**.
- Fill out the required fields:
  - **Note**: Add a description like `CodePipeline Access`.
  - **Expiration**: Optionally set an expiration date for security (or choose "No expiration").
  
### 5. Select Scopes (Permissions)
- Choose the following scopes (permissions):
  - **repo**: Full control of private repositories.
  - **workflow**: This allows pipeline integration with GitHub Actions.
  
### 6. Generate and Copy the Token
- Click **Generate token**.
- **Copy the token immediately** because GitHub will not show it again.
  
### 7. Store the Token Securely
- Save the token securely. You will use this token to authenticate AWS CodePipeline with your GitHub repository.
  
### 8. Add the Token to Your Project
- Create a `.env` file in the root of your project (if you don't have one already).
- Add the GitHub OAuth token like this:
  ```bash
  GITHUB_OAUTH_TOKEN=<your-github-oauth-token>

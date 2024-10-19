# **Setting Up Environment Variables**

Create a `.env` file in the root of the project to store sensitive information, such as your GitHub OAuth token.

### **1. Create the `.env` file**:

  ```bash
  touch .env
  ```

### **2. Add the following environment variables** to the `.env` file:

```bash
GITHUB_OAUTH_TOKEN=<your-github-oauth-token>
AWS_REGION=<your-aws-region>
```

To learn how to generate the GitHub OAuth token, see the [GitHub OAuth Setup Guide](../ci-cd/github-oauth.md).

For more information on managing environment variables, check the [Environment Configuration Guide](../configuration/environment.md).

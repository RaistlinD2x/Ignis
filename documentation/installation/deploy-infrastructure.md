# **Deploying the AWS Infrastructure**

After setting up the project structure and dependencies, it's time to deploy the AWS infrastructure using **AWS CDK**.

### **1. Set up your AWS CLI credentials**:

Ensure that your AWS CLI is configured correctly. You can set it up by running:

  ```bash
  aws configure

You will be prompted to enter your **AWS Access Key**, **Secret Key**, and **Region**.

### **2. Bootstrap the CDK environment**:

Before deploying, bootstrap the CDK to set up the necessary resources for the environment:

  ```bash
  cdk bootstrap

### **3. Deploy the CDK stacks**:

To deploy the AWS infrastructure, run the following command in the `cdk` directory:

  ```bash
  cdk deploy
  ```

This will deploy all the resources defined in your CDK project, including the EKS cluster, API Gateway, and other necessary services.

## **Next Steps**

Once the infrastructure is deployed, you can:

- **Run the frontend**: Navigate to the `frontend` directory and start the React application:

  ```bash
  npm start
  ```

- **Run the backend**: Navigate to the `backend` directory and start the Flask server:

  ```bash
  flask run
  ```

You can now access the React frontend at `http://localhost:3000` and the Flask API at `http://localhost:5000`.

For more detailed guides on configuration, continuous deployment, and API documentation, refer to the following:

- [Configuration Guide](../configuration/global-config.md)
- [CI/CD Pipeline Setup](../ci-cd/pipeline-setup.md)
- [API Documentation](../api/api-reference.md)

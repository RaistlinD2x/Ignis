# **Ignis** 🔥

**Ignis** is a fully-featured, cloud-native full-stack starter kit designed for rapid development and deployment of applications using AWS infrastructure. With a React frontend, Flask backend, and integrated machine learning capabilities, Ignis helps developers get up and running with scalable, production-ready solutions.

## **Features**
- **Cloud-Native Architecture**: Powered by AWS services, including EKS, API Gateway, SageMaker, and more.
- **Full Stack**: Pre-configured React frontend and Flask backend for seamless full-stack development.
- **CI/CD Integration**: Automated deployment pipelines using AWS CodePipeline and CodeBuild.
- **Machine Learning Ready**: Deploy models using AWS SageMaker and integrate with Bedrock for LLM capabilities.
- **Code Quality**: Integrated with SonarQube for static code analysis to ensure maintainable code.
- **Environment Configurations**: Manage multiple environments (dev, test, prod) with a global configuration file.

## **Getting Started**
For a step-by-step guide to setting up the project, refer to the [Installation Guide](docs/installation/INSTALLATION.md).

## **Configuration**
Learn how to configure environment variables, global settings, and deployment options in the [Configuration Guide](docs/configuration/CONFIGURATION.md).

## **Continuous Integration & Deployment (CI/CD)**
Set up automated deployments and integrate GitHub OAuth tokens using the instructions in the [CI/CD Guide](docs/ci-cd/CI-CD.md).

## **API Documentation**
For a detailed reference of API endpoints and their usage, see the [API Reference](docs/api/API-REFERENCE.md).

## **License**
This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## **Project Structure**
```
/project-root
├── /frontend
│   ├── /src
│   │   ├── /components
│   │   ├── /pages
│   │   └── /styles
│   ├── /buildspec
│   │   └── buildspec-frontend-build.yaml
│   ├── /helm
│   │   ├── /templates
│   │   ├── Chart.yaml
│   │   └── values.yaml
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── /backend
│   ├── /services
│   │   ├── /serviceA
│   │   │   ├── /src
│   │   │   ├── /tests
│   │   │   ├── Dockerfile
│   │   │   └── buildspec-serviceA.yaml
│   │   ├── /serviceB
│   │   │   ├── /src
│   │   │   ├── /tests
│   │   │   ├── Dockerfile
│   │   │   └── buildspec-serviceB.yaml
│   ├── /helm
│   │   ├── /serviceA-chart
│   │   │   ├── /templates
│   │   │   ├── Chart.yaml
│   │   │   └── values.yaml
│   │   ├── /serviceB-chart
│   │   │   ├── /templates
│   │   │   ├── Chart.yaml
│   │   │   └── values.yaml
│   └── /common
│       └── shared-libraries
│
├── /infra
│   ├── /cdk
│   │   ├── /lib
│   │   │   ├── /networking
│   │   │   ├── /eks
│   │   │   ├── /iam
│   │   │   └── /helm  # Infra Helm Charts (e.g., for Kubernetes or cluster-level resources)
│   │   ├── /buildspec
│   │   │   ├── buildspec-cdk-infra.yaml
│   │   │   ├── buildspec-helm-package.yaml
│   │   └── /pipelines
│   │       ├── frontend-pipeline.ts
│   │       ├── backend-pipeline.ts
│   │       ├── ai-ml-pipeline.ts  # Pipeline for deploying ML models via CDK, not Helm
│   │       └── infra-pipeline.ts
│   ├── cdk.json
│   └── tsconfig.json
│
├── /ai-ml
│   ├── /models
│   │   ├── /modelA
│   │   │   ├── /src
│   │   │   ├── /tests
│   │   │   └── /config
│   │   └── /modelB
│   │       ├── /src
│   │       ├── /tests
│   │       └── /config
│   ├── /buildspec
│   │   ├── buildspec-modelA.yaml
│   │   ├── buildspec-modelB.yaml
│   ├── /deployments
│   │   ├── /sagemaker
│   │   │   ├── /modelA-endpoint  # CDK-based SageMaker Endpoint
│   │   │   └── /modelB-endpoint  # CDK-based SageMaker Endpoint
│   ├── Dockerfile
│   └── README.md
│
└── /docs
    ├── /architecture
    │   ├── frontend-architecture.md
    │   ├── backend-architecture.md
    │   ├── ai-ml-architecture.md
    │   └── infra-architecture.md
    └── README.md
```

# **Cloning the Repository & Setting Up the Project Structure**

## **Cloning the Repository**

First, clone the **Ignis** repository to your local machine:

  ```bash
  git clone https://github.com/your-username/ignis.git
  cd ignis
  ```

## **Setting Up the Project Structure**

The Ignis project is structured as a monorepo, containing the frontend, backend, and infrastructure code. Here’s the structure:

/ignis 
    ├── /frontend # React app 
    ├── /backend # Flask app 
    ├── /cdk # CDK infrastructure (AWS services) 
    └── /docs # Documentation


Each component (frontend, backend, and CDK) has its own set of dependencies and setup processes. Follow the next steps in [Install Dependencies](install-dependencies.md) to install dependencies and configure the environment.
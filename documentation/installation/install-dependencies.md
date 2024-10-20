# **Installing Dependencies**

Once you’ve cloned the repository, you’ll need to install dependencies for each part of the project.

### **1. Frontend (React)**

Navigate to the `frontend` directory and install the dependencies:

  ```bash
  cd frontend
  npm install
  ```

This will install all the necessary packages for the React frontend application.

### **2. Backend (Flask)**

Next, install the dependencies for the Flask backend:

  ```bash
  cd ../backend
  pip install -r requirements.txt
  ```

This will install all the necessary Python libraries for the Flask application.

### **3. CDK Infrastructure**

Finally, install the dependencies for the CDK project:

  ```bash
  npm install -g aws-cdk
  cd ../cdk
  cdk init app --language typescript
  npm install
  ```

This will install all the necessary CDK modules and packages.

Once all the dependencies are installed, proceed to [Setting Up Environment Variables](env-setup.md).

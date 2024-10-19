# Frontend Local Setup and Testing

This guide explains how to set up and test the **Ignis** frontend locally.

## **1. Prerequisites**

Make sure you have the following installed:
- **Node.js** (v14 or later): [Install Node.js](https://nodejs.org/)
- **npm**: Installed with Node.js.

To verify that Node.js and npm are installed, run:
```bash
node -v
npm -v
```

## **2. Navigate to the Frontend Directory**

From the project root, navigate to the `frontend` folder:

```bash
cd frontend
```

## **3. Install Dependencies**

In the `frontend` folder, install the required dependencies by running:

```bash
npm install
```

This will install all the necessary Node modules.

## **4. Start the Development Server**

After installing dependencies, you can run the frontend development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`. You should see a basic React app.

## **5. Running Tests**

If you have any tests configured, you can run them using:

```bash
npm test
```

This will execute the test suite provided by Create React App.

## **6. Linting and Formatting**

You can also ensure your code is properly linted and formatted (if you've set up ESLint/Prettier):

```bash
npm run lint
npm run format
```

---

You can now make changes to the frontend, and they will be automatically reflected in your browser thanks to hot-reloading.

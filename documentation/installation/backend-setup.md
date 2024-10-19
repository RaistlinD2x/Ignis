# Backend Local Setup and Testing

This guide explains how to set up and test the **Ignis** backend locally.

## **1. Prerequisites**

Make sure you have the following installed:
- **Python 3.8+**: [Install Python](https://www.python.org/downloads/)
- **pip**: Python package manager.

To verify that Python and pip are installed, run:
```bash
python --version
pip --version
```

## **2. Navigate to the Backend Directory**

From the project root, navigate to the `backend` folder:

```bash
cd backend
```

## **3. Create a Virtual Environment**

Create and activate a Python virtual environment to isolate your dependencies:

```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

## **4. Install Dependencies**

Install the required dependencies from `requirements.txt`:

```bash
pip install -r requirements.txt
```

## **5. Run the Flask Server**

Start the Flask development server:

```bash
flask run
```

The API will be available at `http://localhost:5000`. You can now make requests to your backend routes.

## **6. Running Tests**

If you've configured unit tests, you can run them using `pytest` or another test framework. Here's an example using `pytest`:

```bash
pytest
```

## **7. Environment Variables**

Make sure you have a `.env` file in the `backend` folder with the necessary environment variables, such as API keys or database URLs.

Example `.env` file:

```bash
FLASK_ENV=development
SECRET_KEY=your_secret_key
```

---

You can now make changes to the backend, and the server will automatically restart to reflect the updates (thanks to Flask's hot-reloading feature).

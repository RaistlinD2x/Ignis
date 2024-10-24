# Use an official Python runtime as a base image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/requirements.txt

# Install the dependencies
RUN pip install -r requirements.txt

# Copy the current directory contents into the container
COPY . /app

# Expose the port that the app will run on
EXPOSE 5000

# Define the command to run the app
CMD ["python", "routes.py"]

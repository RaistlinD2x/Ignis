# test_flask_app.py

import subprocess
import time
import requests

def start_flask_app():
    """Starts the Flask app as a subprocess."""
    print("Starting Flask app...")
    # Start Flask app in the background
    flask_process = subprocess.Popen(
        ['python', 'routes.py'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    # Give the server a second to start up
    time.sleep(2)
    
    return flask_process

def test_get_example():
    """Sends a GET request to the /example/1 route."""
    print("Sending GET request to /example/1...")
    response = requests.get('http://localhost:5000/example/1')
    
    if response.status_code == 200:
        print("GET request successful.")
        print("Response:", response.json())
    else:
        print(f"GET request failed with status code {response.status_code}")
    
def stop_flask_app(flask_process):
    """Stops the Flask app subprocess."""
    print("Stopping Flask app...")
    flask_process.terminate()
    flask_process.wait()

if __name__ == "__main__":
    # Step 1: Start the Flask app
    flask_process = start_flask_app()
    
    try:
        # Step 2: Run the test (GET request)
        test_get_example()
    finally:
        # Step 3: Stop the Flask app
        stop_flask_app(flask_process)

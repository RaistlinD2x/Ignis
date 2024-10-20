# routes.py

from flask import Flask, jsonify, request
from example import process_example_data, create_new_example

app = Flask(__name__)

@app.route('/example/<int:example_id>', methods=['GET'])
def get_example(example_id):
    """
    GET endpoint to fetch data for a given example_id.
    """
    example_data = process_example_data(example_id)
    if example_data:
        return jsonify(example_data), 200
    else:
        return jsonify({"error": "Example not found"}), 404

@app.route('/example', methods=['POST'])
def create_example():
    """
    POST endpoint to create a new example entry.
    """
    request_data = request.get_json()
    if not request_data:
        return jsonify({"error": "Invalid input"}), 400
    
    new_example = create_new_example(request_data)
    return jsonify(new_example), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

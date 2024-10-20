# example.py

def process_example_data(example_id):
    """
    Simulate some business logic that processes data for a given example ID.
    This could be replaced with actual logic, such as a database call or complex calculations.
    """
    example_db = {
        1: {"name": "Example One", "description": "This is the first example."},
        2: {"name": "Example Two", "description": "This is the second example."},
        3: {"name": "Example Three", "description": "This is the third example."}
    }
    
    return example_db.get(example_id, None)

def create_new_example(example_data):
    """
    Simulates creating a new example entry by counting the existing number of entries and adding 1 to the length
    to assign a new unique key.
    """
    example_db = {
        1: {"name": "Example One", "description": "This is the first example."},
        2: {"name": "Example Two", "description": "This is the second example."},
        3: {"name": "Example Three", "description": "This is the third example."}
    }
    
    # Calculate the next available ID by getting the length of the dictionary and adding 1
    new_id = len(example_db) + 1
    
    # Add the new data to the dictionary (simulating a database insert)
    example_db[new_id] = example_data
    
    return {"id": new_id, "data": example_data}

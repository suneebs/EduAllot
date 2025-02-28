import firebase_admin
from firebase_admin import credentials, firestore
import random
from faker import Faker
from datetime import datetime
import sys

def initialize_firebase():
    """Initialize Firebase with error handling"""
    try:
        cred = credentials.Certificate('serviceAccountKey.json')
        firebase_admin.initialize_app(cred)
        return firestore.client()
    except FileNotFoundError:
        print("Error: serviceAccountKey.json not found!")
        sys.exit(1)
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        sys.exit(1)

def generate_unique_priorities(departments):
    """Generate unique priority choices"""
    selected = random.sample(departments, len(departments))
    return {
        "first": selected[0],
        "second": selected[1],
        "third": selected[2]
    }

def generate_temp_data():
    """Generate temporary data with validation"""
    departments = ["EE", "EC", "MECH"]
    education_levels = ["High School", "Bachelor's", "Master's", "PhD"]
    castes = ["General", "OBC", "SC", "ST"]
    
    age = random.randint(18, 60)
    
    # Ensure all fields are strings or numbers
    return {
        "name": str(fake.name()),
        "email": str(fake.email()),
        "age": int(age),
        "company": str(fake.company()),
        "experience": int(min(random.randint(0, 40), age - 18)),
        "address": str(fake.address()),
        "highestEducation": str(random.choice(education_levels)),
        "mark": int(random.randint(50, 100)),
        "caste": str(random.choice(castes)),
        "distance": int(random.randint(1, 100)),
        "priorityChoices": generate_unique_priorities(departments),
        "timestamp": firestore.SERVER_TIMESTAMP  # Use server timestamp instead of datetime
    }

def add_batch_data(db, num_entries=50, batch_size=500):
    """Add data in batches with error handling"""
    if num_entries > batch_size:
        print(f"Warning: Large number of entries ({num_entries}). This might take a while.")
    
    collection_ref = db.collection('form_submissions')
    entries_added = 0
    
    try:
        batch = db.batch()
        for _ in range(num_entries):
            temp_data = generate_temp_data()
            
            # Create a new document reference
            doc_ref = collection_ref.document()
            batch.set(doc_ref, temp_data)
            
            entries_added += 1
            
            # Commit every 500 entries
            if entries_added % 500 == 0:
                batch.commit()
                batch = db.batch()
                print(f"Progress: {entries_added}/{num_entries} entries added")
        
        # Commit any remaining entries
        if entries_added % 500 != 0:
            batch.commit()
            
        print(f"\nSuccessfully added {entries_added} entries to Firestore!")
        
    except Exception as e:
        print(f"\nError occurred after adding {entries_added} entries: {e}")
        return False
    
    return True

if __name__ == "__main__":
    # Initialize Faker
    fake = Faker()
    
    # Initialize Firebase
    db = initialize_firebase()
    
    # Number of entries to add
    NUM_ENTRIES = 50
    
    # Add data
    success = add_batch_data(db, NUM_ENTRIES)
    
    if not success:
        print("Script completed with errors.")
    else:
        print("Script completed successfully!")
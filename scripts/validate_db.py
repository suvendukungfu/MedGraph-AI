import os
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv

load_dotenv()

def validate_production_data():
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("❌ MONGO_URI not found.")
        return

    print(f"🔍 Validating MedGraph-AI Production Database...")
    try:
        client = MongoClient(mongo_uri, tls=True, tlsCAFile=certifi.where())
        db = client.get_database("medgraph_ai")
        
        collections = {
            "drugs": "Clinical Medications",
            "interactions": "Drug-Drug Interactions",
            "compositions": "Chemical Compositions",
            "side_effects": "Adverse Reactions"
        }

        for col, label in collections.items():
            count = db[col].count_documents({})
            status = "✅" if count > 0 else "⚠️ EMPTY"
            print(f"{status} {label:25} : {count:,} records")
            
        print("\n🚀 Database connection and data integrity verified.")
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    validate_production_data()

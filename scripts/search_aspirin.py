from app.infrastructure.db.database import get_mongo_db
import re

def search_drug():
    db = get_mongo_db()
    if db is None:
        print("Mongo DB not found")
        return
    
    query1 = {"drug1_name": {"$regex": "Bivalirudin", "$options": "i"}}
    docs = db["interactions"].find(query1).limit(2)
    for doc in docs:
        print(f"Interaction: {doc.get('drug1_name')} - {doc.get('drug2_name')}")

if __name__ == "__main__":
    search_drug()

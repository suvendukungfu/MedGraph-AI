from app.infrastructure.db.database import get_mongo_db

def inspect_interactions():
    db = get_mongo_db()
    if db is None:
        print("Mongo DB not found")
        return
    
    doc = db["interactions"].find_one()
    print(f"Sample Interaction Doc: {doc}")

if __name__ == "__main__":
    inspect_interactions()

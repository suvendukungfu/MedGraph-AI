from app.infrastructure.db.database import get_mongo_db

def inspect_drugs():
    db = get_mongo_db()
    if db is None:
        print("Mongo DB not found (None)")
        return
    
    doc = db["drugs"].find_one()
    print(f"Sample Drug Doc Keys: {doc.keys() if doc else 'No Doc Found'}")
    if doc:
        print(f"Full Doc: {doc}")

if __name__ == "__main__":
    inspect_drugs()

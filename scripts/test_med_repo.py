from app.api.dependencies import get_medication_repository
import os

def test_med_repo():
    print("🧪 Testing Medication Repository Production Connection...")
    try:
        meds = get_medication_repository()
        print(f"✅ Successfully fetched {len(meds)} canonical drug names from MongoDB.")
        if len(meds) > 0:
            print(f"Sample drugs: {meds[:10]}")
        else:
            print("⚠️ Repository returned 0 drugs. Check MongoDB 'drugs' collection name.")
    except Exception as e:
        print(f"❌ Failed to fetch meds: {e}")

if __name__ == "__main__":
    test_med_repo()

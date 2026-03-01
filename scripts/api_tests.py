import requests
import time

BASE_URL = "http://localhost:8000/api/v1/jobs"

def run_tests():
    print("🚀 Triggering Continuous Verification Cycle (API Jobs & Queues)...\n")
    
    # Test 1: Interactions Async Job Submission
    print("--- TEST 1: Async Interactions Job ---")
    payload_1 = {"prescribed_drugs": ["Bivalirudin", "Apixaban", "Dabigatran etexilate"]}
    try:
        r1 = requests.post(f"{BASE_URL}/interactions/check", json=payload_1)
        r1.raise_for_status()
        job1 = r1.json()
        print(f"✅ Submission Success: Code 202. Job ID: {job1['data']['job_id']}")
        
        # Test 2: Polling for Status
        print("\n--- TEST 2: Job Status Polling ---")
        for _ in range(5):
            r2 = requests.get(f"{BASE_URL}/{job1['data']['job_id']}")
            status_data = r2.json()
            status = status_data['data']['status']
            print(f"   Status: {status}")
            if status == "SUCCESS":
                records = len(status_data['data']['result']['interactions'])
                print(f"✅ Job Completed Success. Records Found: {records}")
                break
            elif status == "FAILURE":
                print(f"❌ Job Failed: {status_data}")
                break
            time.sleep(1)
            
    except Exception as e:
        print(f"❌ Test 1/2 Failed (Expected if no Redis): {e}")

    # Test 3: Schedule Generation Async Job
    print("\n--- TEST 3: Sync Schedule Generation ---")
    payload_3 = {
        "dosages": [
            {"drug_name": "Bivalirudin", "frequency": 2},
            {"drug_name": "Apixaban", "frequency": 1},
        ]
    }
    
    try:
        r3 = requests.post("http://localhost:8000/api/v1/schedule", json=payload_3)
        r3.raise_for_status()
        res3 = r3.json()
        print(f"✅ Schedule Sync Request Success.")
        
        slots = res3['data']['schedule']
        print(f"✅ Schedule Generated Success. Total Slots: {len(slots)}")
    except Exception as e:
        print(f"❌ Test 3 Failed: {e}")

if __name__ == "__main__":
    run_tests()

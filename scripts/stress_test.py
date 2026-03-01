import requests
import time
import concurrent.futures

BASE_URL = "http://localhost:8000/api/v1/check-interactions"

def mock_request(drugs):
    try:
        start = time.time()
        resp = requests.post(BASE_URL, json={"prescribed_drugs": drugs}, timeout=10)
        elapsed = time.time() - start
        return resp.status_code, resp.json(), elapsed
    except Exception as e:
        return 500, str(e), 0

def stress_test():
    print("🚀 Starting Final System Stress Test & Schema Validation...")
    
    test_scenarios = [
        ["Bivalirudin", "Alfuzosin"],
        ["Bivalirudin", "Acemetacin"],
        ["AMOXICILLIN"],
        ["Bivalirudin", "Apixaban", "Dabigatran etexilate"]
    ]
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_to_req = {executor.submit(mock_request, drugs): drugs for drugs in test_scenarios}
        for future in concurrent.futures.as_completed(future_to_req):
            drugs = future_to_req[future]
            try:
                status, body, elapsed = future.result()
                print(f"🔹 Request: {drugs}")
                print(f"   Status: {status} | Latency: {elapsed:.2f}s")
                if status == 200:
                    interactions = body.get('data', {}).get('interactions', [])
                    print(f"   Success: {body.get('success')} | Records Found: {len(interactions)}")
                    if not body.get('success'):
                        print("   ❌ SCHEMA ERROR: Envelope 'success' field is False")
                    if len(interactions) > 0:
                        print(f"   Detailed: {interactions}")
                else:
                    print(f"   ❌ FAILED: {body}")
            except Exception as exc:
                print(f"   ❌ EXCEPTION: {exc}")

if __name__ == "__main__":
    stress_test()

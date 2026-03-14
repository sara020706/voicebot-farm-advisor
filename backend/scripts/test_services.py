"""
Test script to verify both CUD and GraphQL services can start
"""

import sys
import os
import time
import requests
import subprocess
import threading

def test_service_startup(service_name, port, service_path):
    """Test if a service can start and respond to health checks"""
    print(f"\n🧪 Testing {service_name} service...")
    
    try:
        # Change to service directory and start uvicorn
        os.chdir(service_path)
        
        # Start the service in a subprocess
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", "--host", "0.0.0.0", "--port", str(port)
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a few seconds for startup
        time.sleep(5)
        
        # Test health endpoint
        try:
            response = requests.get(f"http://localhost:{port}/health", timeout=5)
            if response.status_code == 200:
                print(f"✅ {service_name} service started successfully on port {port}")
                print(f"   Health response: {response.json()}")
                return True
            else:
                print(f"❌ {service_name} service health check failed: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ {service_name} service not responding: {e}")
            return False
        finally:
            # Stop the process
            process.terminate()
            process.wait()
            
    except Exception as e:
        print(f"❌ Failed to start {service_name} service: {e}")
        return False

def main():
    """Test both services"""
    print("🚀 Testing VoiceBot Microservices...")
    
    # Get the current directory (should be backend/scripts)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(script_dir)
    
    # Test CUD service
    cud_path = os.path.join(backend_dir, "cud_service")
    cud_success = test_service_startup("CUD", 5000, cud_path)
    
    # Test GraphQL service
    graphql_path = os.path.join(backend_dir, "graphql_service")
    graphql_success = test_service_startup("GraphQL", 5001, graphql_path)
    
    # Summary
    print(f"\n📊 Test Results:")
    print(f"   CUD Service:     {'✅ PASS' if cud_success else '❌ FAIL'}")
    print(f"   GraphQL Service: {'✅ PASS' if graphql_success else '❌ FAIL'}")
    
    if cud_success and graphql_success:
        print(f"\n🎉 All services are working! You can now run scripts/run_all.bat")
    else:
        print(f"\n⚠️  Some services failed. Check the error messages above.")

if __name__ == "__main__":
    main()
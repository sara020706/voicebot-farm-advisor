"""
Supabase connection test script
Run this before implementing auth to verify database connectivity
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

from supabase import create_client

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

print("=" * 60)
print("SUPABASE CONNECTION TEST")
print("=" * 60)
print(f"URL found: {bool(url)}")
print(f"Key found: {bool(key)}")
print()

if not url or not key:
    print("❌ FAILED — Missing environment variables")
    print("\nCheck your SUPABASE_URL and SUPABASE_SERVICE_KEY in backend/.env")
    sys.exit(1)

try:
    supabase = create_client(url, key)
    
    # Test users table
    result = supabase.table("users").select("id").limit(1).execute()
    print("✅ SUCCESS — Supabase connected, users table exists")
    
    # Test scans table
    result2 = supabase.table("scans").select("id").limit(1).execute()
    print("✅ SUCCESS — scans table exists")
    
    # Test fertilizer_logs table
    result3 = supabase.table("fertilizer_logs").select("id").limit(1).execute()
    print("✅ SUCCESS — fertilizer_logs table exists")
    
    print()
    print("=" * 60)
    print("All checks passed. Ready to implement auth.")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ FAILED — {e}")
    print()
    print("=" * 60)
    print("Check your SUPABASE_URL and SUPABASE_SERVICE_KEY in backend/.env")
    print("Make sure you've run the SQL schema in Supabase SQL Editor")
    print("=" * 60)
    sys.exit(1)

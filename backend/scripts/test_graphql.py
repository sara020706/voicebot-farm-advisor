"""
Test script to verify GraphQL service is working
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'graphql_service'))

def test_imports():
    """Test if all GraphQL imports work"""
    try:
        print("Testing imports...")
        
        import strawberry
        print("✓ strawberry imported successfully")
        
        from app.schema.types import UserType, ScanType
        print("✓ GraphQL types imported successfully")
        
        from app.schema.queries import Query
        print("✓ GraphQL queries imported successfully")
        
        from app.schema.schema import schema
        print("✓ GraphQL schema imported successfully")
        
        from app.main import app
        print("✓ FastAPI app imported successfully")
        
        print("\n✅ All imports successful! GraphQL service should work.")
        return True
        
    except Exception as e:
        print(f"\n❌ Import error: {e}")
        return False

if __name__ == "__main__":
    test_imports()
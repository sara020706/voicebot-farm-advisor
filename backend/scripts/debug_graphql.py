"""
Debug script to start GraphQL service with detailed error reporting
"""

import sys
import os
import traceback

# Add the GraphQL service to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'graphql_service'))

def start_graphql_debug():
    """Start GraphQL service with debug information"""
    try:
        print("🔍 Starting GraphQL service in debug mode...")
        print("📁 Current directory:", os.getcwd())
        print("🐍 Python path:", sys.path[-1])
        
        # Test imports step by step
        print("\n📦 Testing imports...")
        
        import strawberry
        print("✓ strawberry imported")
        
        from fastapi import FastAPI
        print("✓ FastAPI imported")
        
        from app.schema.types import UserType
        print("✓ GraphQL types imported")
        
        from app.schema.queries import Query
        print("✓ GraphQL queries imported")
        
        from app.schema.schema import schema
        print("✓ GraphQL schema imported")
        
        from app.main import app
        print("✓ Main app imported")
        
        print("\n🚀 Starting uvicorn server...")
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=5001, reload=True)
        
    except Exception as e:
        print(f"\n❌ Error starting GraphQL service:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"\nFull traceback:")
        traceback.print_exc()
        input("\nPress Enter to exit...")

if __name__ == "__main__":
    start_graphql_debug()
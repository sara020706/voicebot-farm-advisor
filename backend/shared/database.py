from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Explicitly load .env from backend/ directory
env_path = os.path.join(os.path.dirname(__file__), '../.env')
load_dotenv(dotenv_path=env_path, override=True)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL:
    raise RuntimeError(f"SUPABASE_URL not found. Looked for .env at: {env_path}")
if not SUPABASE_KEY:
    raise RuntimeError(f"SUPABASE_SERVICE_KEY not found. Looked for .env at: {env_path}")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

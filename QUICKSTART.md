# Quick Start

## Prerequisites

- Python 3.10+ (with "Add to PATH" checked during installation)
- Node.js 18+ (includes npm)

## Setup

1. Clone the repo
2. Set up Supabase — paste `backend/SUPABASE_SCHEMA.sql` into Supabase SQL Editor
3. Copy `backend/.env.example` to `backend/.env` and fill in:
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY
   - SECRET_KEY (any string, min 32 characters)
   - WEATHER_API_KEY
4. Run `START_VOICEBOT.bat` (Windows) or `bash scripts/run_all.sh` (Mac/Linux)
5. Browser opens automatically to http://localhost:5173

## Troubleshooting

If you get "pip is not recognized" error, see `TROUBLESHOOTING.md`

# VoiceBot

AI-powered crop recommendation assistant for Indian farmers.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind — runs on http://localhost:5173
- Backend: FastAPI + Python — runs on http://localhost:5000
- Database: Supabase (PostgreSQL)

## Run

### Windows
```
scripts/run_all.bat
```

### Mac / Linux
```
bash scripts/run_all.sh
```

## Manual

### Backend
```
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000
```

### Frontend
```
cd frontend
npm install
npm run dev
```

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| API Docs | http://localhost:5000/docs |

## Features

1. Soil input + crop recommendation (ML model)
2. Fertilizer suggestion (rule-based)
3. Voice input → auto-fill → speak result
4. Weather auto-fill (OpenWeatherMap)
5. Multi-language UI (English, Hindi, Tamil)
6. Auth + user session (JWT + Supabase)
7. Crop history dashboard
8. Government scheme alerts

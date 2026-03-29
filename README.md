# 🌾 VoiceBot Farm Advisor

AI-powered agricultural assistant with multilingual voice support for Indian farmers.

## Features

- **Crop Recommendation** - ML-based crop suggestions using soil parameters
- **Voice Assistant** - Multilingual farming Q&A (English, Hindi, Tamil, Telugu)
- **Fertilizer Advisor** - NPK-based fertilizer recommendations
- **Yield Estimator** - Expected yield predictions for 22+ crops
- **Pest & Disease Guide** - Common pests and treatments
- **Seasonal Calendar** - Month-by-month farming activities
- **Government Schemes** - Agricultural schemes and subsidies
- **Weather Integration** - Real-time weather data

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Web Speech API (SpeechRecognition + SpeechSynthesis)

### Backend
- FastAPI (Python)
- Supabase (PostgreSQL)
- Google Gemini API
- Scikit-learn (ML model)

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase account
- Google Gemini API key

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd voicebot-farm-advisor
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your API keys
cd cud_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with backend URL
npm run dev
```

### 4. Open Browser
Navigate to `http://localhost:5173`

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_key
SECRET_KEY=your_jwt_secret_32_chars
GEMINI_API_KEY=your_gemini_key
WEATHER_API_KEY=your_weather_key
```

### Frontend (.env.local)
```
VITE_CUD_BASE=http://localhost:5000
VITE_GQL_BASE=http://localhost:5001
```

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

**Quick Deploy:**
- Frontend: Vercel (automatic)
- Backend: Render (automatic)

## Voice Assistant

Supports 4 languages:
- English (en-IN)
- Hindi (hi-IN) ✓ Works in Chrome
- Tamil (ta-IN) - Requires Microsoft Edge
- Telugu (te-IN) - Requires Microsoft Edge

**Note:** Chrome only supports Google cloud voices. For Tamil/Telugu, use Microsoft Edge browser which has better Windows TTS integration.

## Project Structure

```
voicebot-farm-advisor/
├── frontend/
│   ├── src/
│   │   ├── components/sections/
│   │   │   ├── CropAdvisor.tsx
│   │   │   ├── FarmVoiceAssistant.tsx
│   │   │   ├── FertilizerSection.tsx
│   │   │   ├── YieldEstimator.tsx
│   │   │   ├── PestLookup.tsx
│   │   │   └── SeasonalCalendar.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── voiceController.ts
│   │   │   └── translations.ts
│   │   └── App.tsx
│   └── package.json
├── backend/
│   ├── cud_service/
│   │   ├── app/
│   │   │   ├── routers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── main.py
│   │   └── requirements.txt
│   └── data/
│       ├── yield_data.json
│       ├── pest_data.json
│       └── calendar_data.json
└── README.md
```

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register user
- POST `/api/auth/login` - Login user

### Crop Services
- POST `/api/predict` - Get crop recommendation
- POST `/api/fertilizer` - Get fertilizer plan
- GET `/api/yield?crop=rice` - Get yield estimates
- GET `/api/pests?crop=rice` - Get pest information
- GET `/api/calendar?crop=rice` - Get seasonal calendar

### Voice Assistant
- POST `/api/farm-assistant` - Ask farming questions

### Other
- GET `/api/weather?location=Delhi` - Get weather
- GET `/api/schemes` - Get government schemes
- GET `/health` - Health check

## License

MIT

## Support

For issues or questions, open a GitHub issue.

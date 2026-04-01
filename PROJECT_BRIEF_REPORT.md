# VoiceBot Farm Advisor - Brief Report

## What It Is
An AI-powered web application that helps Indian farmers make better farming decisions through intelligent crop recommendations, multilingual voice assistance, and comprehensive agricultural data.

## Target Users
Small and marginal farmers in India who need expert agricultural advice in their local language.

## Core Technology
- **Frontend:** React + TypeScript + Vite
- **Backend:** FastAPI (Python) + Supabase (PostgreSQL)
- **AI:** Google Gemini API + Scikit-learn ML
- **Voice:** Web Speech API (browser-based)

---

## Key Features (12 Total)

### 1. Crop Recommendation
- Input 7 soil parameters (N, P, K, pH, temp, humidity, rainfall)
- AI suggests best crop from 22 options
- Shows confidence score
- Saves history for tracking

### 2. Voice Assistant
- Ask farming questions in 4 languages (English, Hindi, Tamil, Telugu)
- Speech-to-text input
- AI-powered answers via Gemini
- Text-to-speech output
- Conversation history saved

### 3. Fertilizer Advisor
- Input current NPK levels + crop
- Get specific fertilizer recommendations
- Shows deficiency/excess for each nutrient
- Dosage suggestions in kg/acre

### 4. Yield Estimator
- Select crop
- See min/avg/max expected yield
- Based on ICAR data
- Helps set realistic expectations

### 5. Pest & Disease Guide
- Select crop
- View common pests and diseases
- Symptoms for identification
- Treatment options (chemical + organic)

### 6. Seasonal Calendar
- Select crop
- See month-by-month farming tasks
- Week-wise activity breakdown
- Current month highlighted

### 7. Weather Integration
- Enter city name
- Get current weather data
- Auto-fill crop advisor with temp/humidity
- Helps with irrigation decisions

### 8. Government Schemes
- Browse agricultural subsidies
- Filter by crop and state
- Direct application links
- Eligibility information

### 9. Crop History
- View past recommendations
- Track farming decisions
- Compare soil parameters over time

### 10. Dashboard
- Quick access to all features
- Recent activity summary
- User statistics

### 11. Multi-language UI
- Interface in 4 languages
- All text translated
- Language preference saved

### 12. User Authentication
- Secure login/signup
- JWT-based sessions
- Personal data protection

---

## How Each Feature Works

### Crop Recommendation
1. User enters soil data via sliders
2. Backend runs ML model or rule-based algorithm
3. Matches parameters against 22 crop profiles
4. Returns best crop with confidence score
5. Saves to database for history

### Voice Assistant
1. User clicks mic and speaks question
2. Browser converts speech to text
3. Text sent to Gemini API
4. AI generates farming advice
5. Response cleaned and spoken back
6. Conversation saved locally

### Fertilizer Advisor
1. User enters NPK levels and selects crop
2. Backend loads crop nutrient requirements
3. Compares current vs optimal levels
4. Calculates deficiency for N, P, K
5. Recommends specific fertilizers with dosage

### Yield Estimator
1. User selects crop from dropdown
2. Backend loads yield data from JSON
3. Returns min/avg/max yield values
4. Frontend displays with visual indicators

### Pest Guide
1. User selects crop
2. Backend loads pest data from JSON
3. Returns list of common pests
4. User expands cards to see treatments

### Seasonal Calendar
1. User selects crop
2. Backend loads calendar from JSON
3. Shows 12-month timeline
4. User clicks month to see tasks

### Weather
1. User enters city name
2. Backend calls OpenWeatherMap API
3. Returns current conditions
4. Option to auto-fill crop advisor

### Government Schemes
1. User optionally filters by crop/state
2. Backend loads schemes from JSON
3. Filters based on criteria
4. Returns matching schemes with links

---

## Technical Architecture

```
User Browser (React)
       ↓
   REST API
       ↓
FastAPI Backend
   ↓   ↓   ↓
  DB  ML  APIs
```

**Frontend:** Single-page React app with voice controller
**Backend:** FastAPI with 10 routers for different features
**Database:** Supabase PostgreSQL with RLS
**External APIs:** Gemini (AI), OpenWeatherMap (weather)

---

## Data Flow Example (Crop Recommendation)

1. User adjusts sliders → React state updates
2. User clicks "Analyze" → API call to `/api/predict`
3. Backend receives soil data → validates with Pydantic
4. ML model predicts crop → or rule-based fallback
5. Result saved to database → linked to user_id
6. Response sent to frontend → displayed in UI
7. User sees crop name + confidence → can view history

---

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Row Level Security in database
- CORS protection
- HTTPS enforced
- Input validation

---

## Deployment

- **Frontend:** Vercel (automatic HTTPS, CDN)
- **Backend:** Render (auto-scaling, health checks)
- **Database:** Supabase (managed PostgreSQL)
- **CI/CD:** Auto-deploy on git push

---

## Supported Data

- **Crops:** 22 (rice, wheat, maize, cotton, etc.)
- **Languages:** 4 (English, Hindi, Tamil, Telugu)
- **Pests:** 30+ across 10 crops
- **Schemes:** 15+ government programs
- **Yield Data:** 22 crops with min/avg/max

---

## Performance

- Frontend build: 382 KB (gzipped: 117 KB)
- API response time: <500ms (warm)
- Voice recognition: Real-time
- TTS: Chunked for long responses
- Database queries: <100ms

---

## Limitations

- Voice requires Chrome/Edge browser
- Tamil/Telugu TTS needs Microsoft Edge
- Internet connection required
- Free tier has cold starts (30-60s first request)
- ML model optional (rule-based fallback works)

---

## Future Plans

- Image-based pest detection
- Soil testing integration
- Market price information
- Mobile app (React Native)
- Offline mode (PWA)
- SMS/WhatsApp integration

---

## Summary Statistics

- **Total Features:** 12
- **API Endpoints:** 15+
- **Supported Crops:** 22
- **Languages:** 4
- **Code Size:** ~50,000 lines
- **Build Time:** ~20 seconds
- **Deployment Time:** 5-10 minutes

---

## Key Differentiators

1. **Voice-First:** Multilingual voice interface for low-literacy users
2. **Comprehensive:** 12 integrated features covering entire farming cycle
3. **Intelligent:** ML + rule-based hybrid for reliability
4. **Localized:** 4 Indian languages with cultural context
5. **Free:** Open-source with free tier deployment
6. **Accessible:** Works on any modern browser, no app install

---

**Project Status:** Production Ready  
**Deployment:** Vercel + Render  
**License:** MIT  
**Version:** 1.0

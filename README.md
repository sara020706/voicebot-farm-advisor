# 🌾 VoiceBot - AI-Powered Crop Advisory System

An intelligent agricultural advisory platform that helps farmers make data-driven decisions about crop selection, fertilizer usage, and access to government schemes.

## 🎯 Features

- **Crop Recommendation**: ML-powered crop suggestions based on soil parameters (N, P, K, pH, temperature, humidity, rainfall)
- **Fertilizer Advisory**: Smart fertilizer recommendations based on soil analysis
- **Weather Integration**: Real-time weather data for farming decisions
- **Government Schemes**: Browse and search agricultural schemes by crop and state
- **Multi-language Support**: English, Hindi, and Tamil
- **History Tracking**: View past soil analyses and recommendations
- **Voice Input**: (Coming soon) Voice-based data entry for accessibility

## 🏗️ Architecture

### Microservices Design
```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│                    Port 5173                             │
└────────────┬────────────────────────────┬────────────────┘
             │                            │
             ▼                            ▼
┌────────────────────────┐  ┌────────────────────────────┐
│   CUD Service          │  │   GraphQL Service          │
│   (FastAPI)            │  │   (Strawberry GraphQL)     │
│   Port 5000            │  │   Port 5001                │
│                        │  │                            │
│ • Authentication       │  │ • User Queries             │
│ • Crop Prediction      │  │ • Scan History             │
│ • Fertilizer Advice    │  │ • Schemes Search           │
│ • Weather Data         │  │ • Profile Data             │
└────────────┬───────────┘  └────────────┬───────────────┘
             │                           │
             └───────────┬───────────────┘
                         ▼
              ┌──────────────────────┐
              │   Shared Layer       │
              │                      │
              │ • JWT Auth           │
              │ • Supabase Client    │
              └──────────┬───────────┘
                         ▼
              ┌──────────────────────┐
              │   Supabase Database  │
              │                      │
              │ • users              │
              │ • scans              │
              │ • fertilizer_logs    │
              └──────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Supabase account (free tier works)

### 1. Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd voicebot

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit backend/.env with your Supabase credentials
# Edit frontend/.env.local if needed (defaults should work)
```

### 2. Setup Database
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (or use existing)
3. Go to SQL Editor
4. Copy and run the contents of `backend/SUPABASE_SCHEMA.sql`

### 3. Install Dependencies
```bash
# Backend - CUD Service
cd backend/cud_service
pip install -r requirements.txt

# Backend - GraphQL Service
cd ../graphql_service
pip install -r requirements.txt

# Frontend
cd ../../frontend
npm install
```

### 4. Start Services
```bash
# From project root
scripts\run_all.bat
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **CUD API Docs**: http://localhost:5000/docs
- **GraphQL IDE**: http://localhost:5001/graphql

## 📁 Project Structure

```
voicebot/
├── backend/
│   ├── cud_service/          # Create/Update/Delete operations
│   │   ├── app/
│   │   │   ├── middleware/   # JWT authentication
│   │   │   ├── ml/           # ML model loader
│   │   │   ├── models/       # Pydantic models
│   │   │   ├── routers/      # API endpoints
│   │   │   ├── services/     # Business logic
│   │   │   └── main.py       # FastAPI app
│   │   └── requirements.txt
│   │
│   ├── graphql_service/      # GraphQL queries
│   │   ├── app/
│   │   │   ├── middleware/   # JWT authentication
│   │   │   ├── schema/       # GraphQL schema
│   │   │   └── main.py       # FastAPI + Strawberry
│   │   └── requirements.txt
│   │
│   ├── shared/               # Shared utilities
│   │   ├── auth.py           # JWT functions
│   │   └── database.py       # Supabase client
│   │
│   ├── data/                 # Static data (schemes.json)
│   ├── models/               # ML model files (.pkl)
│   ├── scripts/              # Utility scripts
│   └── SUPABASE_SCHEMA.sql   # Database schema
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   └── sections/     # Feature sections
│   │   ├── lib/              # Utilities
│   │   │   ├── api.ts        # API client
│   │   │   ├── store.ts      # Local storage
│   │   │   └── translations.ts
│   │   ├── App.tsx           # Main app
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── scripts/
│   ├── run_all.bat           # Start all services
│   ├── run_cud.bat           # Start CUD service
│   ├── run_graphql.bat       # Start GraphQL service
│   └── run_frontend.bat      # Start frontend
│
├── QUICK_START.md            # Detailed setup guide
├── SYSTEM_STATUS.md          # System documentation
└── README.md                 # This file
```

## 🔧 Configuration

### Backend Environment Variables (`backend/.env`)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SECRET_KEY=your-jwt-secret-key-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days
WEATHER_API_KEY=your-openweather-api-key  # Optional
```

### Frontend Environment Variables (`frontend/.env.local`)
```env
VITE_CUD_BASE=http://localhost:5000
VITE_GQL_BASE=http://localhost:5001
```

## 🐛 Troubleshooting

### Services won't start
- Check ports 5000, 5001, 5173 are available
- Verify Python and Node.js are installed
- Check environment variables in `.env` files

### "Supabase connection FAILED"
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `backend/.env`
- Check database schema is applied
- Verify internet connection

### "401 Unauthorized" errors
- Make sure you're logged in
- Token might be expired - login again
- Check browser console for JWT errors

### Predictions not saving
- Check CUD service logs for errors
- Verify RLS policies in Supabase
- Check user_id is being passed correctly

## 📊 Database Schema

### Users Table
```sql
users (
  id uuid PRIMARY KEY,
  name text,
  email text UNIQUE,
  hashed_password text,
  state text,
  acres numeric,
  created_at timestamptz
)
```

### Scans Table
```sql
scans (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  n, p, k, ph, temperature, humidity, rainfall numeric,
  recommended_crop text,
  confidence numeric,
  created_at timestamptz
)
```

### Fertilizer Logs Table
```sql
fertilizer_logs (
  id uuid PRIMARY KEY,
  scan_id uuid REFERENCES scans,
  user_id uuid REFERENCES users,
  nutrient text,
  fertilizer_name text,
  dosage text,
  status text,
  created_at timestamptz
)
```

## 🔐 Security

- **JWT Authentication**: All protected routes require valid JWT tokens
- **Password Hashing**: Bcrypt with automatic salt generation
- **Row Level Security**: Enabled on all Supabase tables
- **CORS**: Configured for localhost development
- **Service Role Key**: Used for backend operations only

## 🌐 API Endpoints

### CUD Service (Port 5000)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/predict` - Crop prediction (protected)
- `POST /api/fertilizer` - Fertilizer recommendation (protected)
- `GET /api/weather?city=<city>` - Weather data (protected)
- `GET /api/history` - Scan history (protected)
- `GET /health` - Health check
- `GET /docs` - Swagger UI

### GraphQL Service (Port 5001)
- `POST /graphql` - GraphQL endpoint
- `GET /graphql` - GraphiQL IDE
- `GET /health` - Health check

### GraphQL Queries
```graphql
query {
  me { id name email state acres }
  myScans(limit: 10) { id recommendedCrop confidence n p k ph }
  schemes(crop: "rice", state: "Tamil Nadu") { id name description }
}
```

## 🤖 ML Model

### Current Implementation
- **Rule-based fallback**: 22 crop types with parameter ranges
- **Crops supported**: Rice, Maize, Chickpea, Kidney Beans, Pigeon Peas, Moth Beans, Mung Bean, Black Gram, Lentil, Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut, Cotton, Jute, Coffee

### Future Enhancement
- Train custom ML model with scikit-learn
- Deploy model as `.pkl` file in `backend/models/`
- Automatic fallback to rule-based if model not found

## 🌍 Multi-language Support

- **English** (en)
- **Hindi** (hi) - हिंदी
- **Tamil** (ta) - தமிழ்

Language can be switched from the UI language selector.

## 🐛 Troubleshooting

See [QUICK_START.md](QUICK_START.md) for detailed troubleshooting guide.

### Common Issues

**Services won't start**
- Check ports 5000, 5001, 5173 are available
- Verify Python and Node.js are installed
- Check environment variables are set

**401 Unauthorized errors**
- Clear browser localStorage
- Login again to get fresh token
- Check JWT middleware logs

**Predictions not saving**
- Verify Supabase connection in logs
- Check RLS policies are applied
- Verify user_id is being passed

## 📝 Development

### Adding New Features
1. Backend: Add router in `backend/cud_service/app/routers/`
2. Service: Add business logic in `backend/cud_service/app/services/`
3. Frontend: Add component in `frontend/src/components/sections/`
4. API: Update `frontend/src/lib/api.ts`

### Code Style
- Python: Follow PEP 8
- TypeScript: ESLint configuration included
- Use type hints in Python
- Use TypeScript types (no `any`)

## 🚢 Deployment

### Backend
- Deploy CUD and GraphQL services separately
- Use environment variables for configuration
- Enable HTTPS in production
- Update CORS origins

### Frontend
- Build: `npm run build`
- Deploy `dist/` folder to static hosting
- Update API base URLs in environment

### Database
- Supabase handles scaling automatically
- Review and tighten RLS policies for production
- Enable database backups

## 📞 Support

For issues and questions, check the README or open an issue on GitHub.

---

Made with 🌾 for farmers everywhere

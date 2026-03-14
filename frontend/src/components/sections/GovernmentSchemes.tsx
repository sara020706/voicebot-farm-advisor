import { useState, useEffect } from 'react';
import { Spinner } from '@/components/Spinner';
import { useAppToast } from '@/components/Toast';
import { getToken, getUser } from '@/lib/store';

interface GovernmentSchemesProps {
  currentLang: 'en' | 'hi' | 'ta';
}

interface Scheme {
  id?: string;
  name: string;
  type: 'Central' | 'State';
  description: string;
  benefit?: string;
  applies_to?: string;
  link?: string;
}

const TRANSLATIONS = {
  en: {
    title: 'Government Schemes',
    description: 'Farming schemes available for your crop and state',
    cropName: 'Crop Name',
    yourState: 'Your State',
    findSchemes: 'Find Schemes',
    learnMore: 'Learn More',
    centralScheme: 'Central',
    stateScheme: 'State',
    noSchemesFound: 'No schemes found for this crop and state',
    noSchemesSubtext: 'Try a different crop name or check your state',
  },
  hi: {
    title: 'सरकारी योजनाएं',
    description: 'आपकी फसल और राज्य के लिए उपलब्ध कृषि योजनाएं',
    cropName: 'फसल का नाम',
    yourState: 'आपका राज्य',
    findSchemes: 'योजनाएं खोजें',
    learnMore: 'और जानें',
    centralScheme: 'केंद्रीय',
    stateScheme: 'राज्य',
    noSchemesFound: 'इस फसल और राज्य के लिए कोई योजना नहीं मिली',
    noSchemesSubtext: 'एक अलग फसल का नाम आज़माएं या अपना राज्य जांचें',
  },
  ta: {
    title: 'அரசு திட்டங்கள்',
    description: 'உங்கள் பயிர் மற்றும் மாநிலத்திற்கு கிடைக்கும் விவசாய திட்டங்கள்',
    cropName: 'பயிர் பெயர்',
    yourState: 'உங்கள் மாநிலம்',
    findSchemes: 'திட்டங்களை கண்டறி',
    learnMore: 'மேலும் அறிக',
    centralScheme: 'மத்திய',
    stateScheme: 'மாநில',
    noSchemesFound: 'இந்த பயிர் மற்றும் மாநிலத்திற்கு திட்டங்கள் இல்லை',
    noSchemesSubtext: 'வேறு பயிர் பெயரை முயற்சிக்கவும் அல்லது உங்கள் மாநிலத்தை சரிபார்க்கவும்',
  },
};

const FALLBACK_SCHEMES: Scheme[] = [
  {
    id: '1',
    name: 'PM-KISAN',
    type: 'Central',
    description: 'Direct income support of ₹6,000/year to farmer families',
    benefit: '₹6,000/year',
    applies_to: 'all crops',
    link: 'https://pmkisan.gov.in/',
  },
  {
    id: '2',
    name: 'PMFBY',
    type: 'Central',
    description: 'Crop insurance scheme covering losses due to natural calamities',
    benefit: 'Insurance coverage',
    applies_to: 'all crops',
    link: 'https://pmfby.gov.in/',
  },
  {
    id: '3',
    name: 'Soil Health Card Scheme',
    type: 'Central',
    description: 'Free soil testing and health card for every farmer',
    benefit: 'Free soil testing',
    applies_to: 'all crops',
    link: 'https://soilhealth.dac.gov.in/',
  },
  {
    id: '4',
    name: 'PM Kisan Maandhan Yojana',
    type: 'Central',
    description: 'Pension scheme providing ₹3,000/month after age 60',
    benefit: '₹3,000/month',
    applies_to: 'all crops',
    link: 'https://maandhan.in/',
  },
];

export default function GovernmentSchemes({ currentLang }: GovernmentSchemesProps) {
  const t = TRANSLATIONS[currentLang];
  const { showToast } = useAppToast();
  const [crop, setCrop] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Pre-fill from localStorage
    try {
      const history = JSON.parse(localStorage.getItem('vb_history') || '[]');
      if (history.length > 0) {
        setCrop(history[0].crop || '');
      }
    } catch {}

    const user = getUser();
    if (user?.state) {
      setState(user.state);
    }

    // Auto-trigger search if both are available
    if (crop && state) {
      setTimeout(() => findSchemes(), 500);
    }
  }, []);

  const findSchemes = async () => {
    if (!crop.trim() || !state.trim()) {
      showToast('Please enter crop name and state', 'error');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:5000/api/schemes?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.schemes && data.schemes.length > 0) {
          setSchemes(data.schemes);
        } else {
          setSchemes(FALLBACK_SCHEMES);
        }
      } else {
        setSchemes(FALLBACK_SCHEMES);
      }
    } catch (e) {
      setSchemes(FALLBACK_SCHEMES);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-2">{t.title}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.description}</p>

      <div className="bg-white border border-[#c8e0ce] rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
              {t.cropName}
            </label>
            <input
              type="text"
              className="w-full h-12 px-4 rounded-xl border border-[#c8e0ce] bg-[#f4f9f6] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#4a9b6f] transition-all duration-200"
              value={crop}
              onChange={e => setCrop(e.target.value)}
              placeholder="Rice"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
              {t.yourState}
            </label>
            <input
              type="text"
              className="w-full h-12 px-4 rounded-xl border border-[#c8e0ce] bg-[#f4f9f6] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#4a9b6f] transition-all duration-200"
              value={state}
              onChange={e => setState(e.target.value)}
              placeholder="Maharashtra"
            />
          </div>
        </div>
        <button
          onClick={findSchemes}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-[#1a4d2e] text-white font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Spinner /> : t.findSchemes}
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && searched && schemes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mb-4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <h3 className="font-heading text-xl font-bold mb-2">{t.noSchemesFound}</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">{t.noSchemesSubtext}</p>
        </div>
      )}

      {!loading && schemes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {schemes.map((scheme, i) => (
            <div key={i} className="bg-white border border-[#c8e0ce] rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-heading text-base font-bold text-[#1a4d2e]">{scheme.name}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    scheme.type === 'Central'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-green-100 text-green-700 border border-green-300'
                  }`}
                >
                  {scheme.type === 'Central' ? t.centralScheme : t.stateScheme}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{scheme.description}</p>
              {scheme.benefit && (
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#d4edda] text-[#1a4d2e] border border-[#4a9b6f]">
                    {scheme.benefit}
                  </span>
                </div>
              )}
              {scheme.link ? (
                <a
                  href={scheme.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#4a9b6f] hover:text-[#1a4d2e] transition-colors duration-200"
                >
                  {t.learnMore}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ) : (
                <span className="text-sm text-muted-foreground italic">{t.learnMore}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

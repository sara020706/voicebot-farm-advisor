import { useState, useEffect } from 'react';
import { apiPests } from '../../lib/api';
import { Spinner } from '../Spinner';

const CROPS = ['rice','wheat','maize','cotton','sugarcane','mungbean','blackgram',
  'lentil','pomegranate','banana','mango','grapes','watermelon','muskmelon',
  'apple','orange','papaya','coconut','jute','coffee','chickpea','kidneybeans','tomato'];

interface PestLookupProps {
  currentLang: string;
  onNav: (s: string) => void;
}

interface Pest {
  name: string;
  type: string;
  symptoms: string;
  treatment: string;
}

export default function PestLookup({ currentLang, onNav }: PestLookupProps) {
  const [crop, setCrop] = useState('');
  const [pests, setPests] = useState<Pest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const last = localStorage.getItem('vb_last_crop');
    if (last) {
      const normalized = last.toLowerCase().trim();
      setCrop(normalized);
      fetchPests(normalized);
    }
  }, []);

  const fetchPests = async (c: string) => {
    const cropKey = c.toLowerCase().trim();
    
    setLoading(true);
    setError('');
    setPests([]);
    setExpanded(null);
    
    try {
      const result = await apiPests(cropKey);
      
      if (!result || !result.pests || result.pests.length === 0) {
        setError(`No pest data available for ${cropKey}. Showing general pests.`);
        setPests([]);
        return;
      }
      
      setPests(result.pests);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch pest data');
    } finally {
      setLoading(false);
    }
  };

  const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = e.target.value;
    const cropKey = c.toLowerCase().trim();
    setCrop(cropKey);
    if (cropKey) {
      fetchPests(cropKey);
    } else {
      setPests([]);
      setError('');
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      insect: 'bg-amber-100 text-amber-700 border-amber-300',
      fungal: 'bg-red-100 text-red-700 border-red-300',
      bacterial: 'bg-blue-100 text-blue-700 border-blue-300',
      viral: 'bg-purple-100 text-purple-700 border-purple-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-6">Pest & Disease Guide</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Crop</label>
        <select
          value={crop}
          onChange={handleCropChange}
          className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">-- Choose a crop --</option>
          {CROPS.map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="vb-card bg-amber-50 border-amber-200 text-amber-800 p-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-medium mb-1">Limited Data</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        </div>
      )}

      {!loading && pests.length === 0 && !error && (
        <div className="vb-card text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth={1.5} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-4.35-4.35" />
          </svg>
          <p className="text-muted-foreground mb-2">Select a crop to see common pests and diseases</p>
          <p className="text-xs text-muted-foreground">Covers major pests, diseases, and treatments</p>
          {!crop && (
            <button
              onClick={() => onNav('cropAdvisor')}
              className="mt-4 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm hover:bg-accent/90 transition-colors"
            >
              Go to Crop Advisor
            </button>
          )}
        </div>
      )}

      {pests.length > 0 && !loading && (
        <div>
          <div className="mb-4 text-sm text-muted-foreground">
            Found {pests.length} common pest{pests.length !== 1 ? 's' : ''} and disease{pests.length !== 1 ? 's' : ''} for <span className="font-medium capitalize">{crop}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pests.map((pest, idx) => (
              <div key={idx} className="vb-card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-heading text-lg font-bold flex-1">{pest.name}</h3>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getTypeBadge(pest.type)}`}>
                    {pest.type}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Symptoms</div>
                  <p className="text-sm">{pest.symptoms}</p>
                </div>

                <button
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted hover:bg-accent/10 transition-colors">
                    <span className="text-xs font-medium text-accent">
                      {expanded === idx ? 'Hide Treatment' : 'Show Treatment'}
                    </span>
                    <svg
                      className={`w-4 h-4 text-accent transition-transform ${expanded === idx ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expanded === idx && (
                  <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="text-xs font-medium text-green-700 uppercase tracking-wider mb-1">Treatment</div>
                    <p className="text-sm text-green-800">{pest.treatment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

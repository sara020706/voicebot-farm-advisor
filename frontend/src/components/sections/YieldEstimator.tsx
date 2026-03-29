import { useState, useEffect } from 'react';
import { apiYield } from '../../lib/api';
import { Spinner } from '../Spinner';

const CROPS = ['rice','wheat','maize','cotton','sugarcane','mungbean','blackgram',
  'lentil','pomegranate','banana','mango','grapes','watermelon','muskmelon',
  'apple','orange','papaya','coconut','jute','coffee','chickpea','kidneybeans'];

interface YieldEstimatorProps {
  currentLang: string;
  onNav: (s: string) => void;
}

export default function YieldEstimator({ currentLang, onNav }: YieldEstimatorProps) {
  const [crop, setCrop] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const last = localStorage.getItem('vb_last_crop');
    if (last) {
      const normalized = last.toLowerCase().trim();
      setCrop(normalized);
      fetchYield(normalized);
    }
  }, []);

  const fetchYield = async (c: string) => {
    const cropKey = c.toLowerCase().trim();
    
    setLoading(true);
    setError('');
    setData(null);
    
    try {
      const result = await apiYield(cropKey);
      
      if (!result || (!result.min && !result.avg && !result.max)) {
        setError(`No yield data available for ${cropKey}. Try another crop.`);
        return;
      }
      
      setData(result);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch yield data');
    } finally {
      setLoading(false);
    }
  };

  const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = e.target.value;
    const cropKey = c.toLowerCase().trim();
    setCrop(cropKey);
    if (cropKey) {
      fetchYield(cropKey);
    } else {
      setData(null);
      setError('');
    }
  };

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-6">Yield Estimator</h2>
      
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
        <div className="vb-card bg-red-50 border-red-200 text-red-800 p-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-medium mb-1">Data Not Available</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        </div>
      )}

      {!loading && !data && !error && (
        <div className="vb-card text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v18h18M19 9l-5 5-4-4-3 3" />
          </svg>
          <p className="text-muted-foreground mb-2">Select a crop to see estimated yield</p>
          <p className="text-xs text-muted-foreground">Yield estimates based on ICAR data</p>
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

      {data && !loading && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="vb-card bg-red-50 border-red-200">
              <div className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1">Minimum</div>
              <div className="text-3xl font-heading font-bold text-red-700">{data.min || 0}</div>
              <div className="text-xs text-red-600 mt-1">{data.unit || 'quintals/acre'}</div>
            </div>
            <div className="vb-card bg-green-50 border-green-200">
              <div className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1">Average</div>
              <div className="text-3xl font-heading font-bold text-green-700">{data.avg || 0}</div>
              <div className="text-xs text-green-600 mt-1">{data.unit || 'quintals/acre'}</div>
            </div>
            <div className="vb-card bg-blue-50 border-blue-200">
              <div className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Maximum</div>
              <div className="text-3xl font-heading font-bold text-blue-700">{data.max || 0}</div>
              <div className="text-xs text-blue-600 mt-1">{data.unit || 'quintals/acre'}</div>
            </div>
          </div>

          <div className="vb-card">
            <div className="text-sm font-medium mb-3">Yield Range</div>
            <div className="relative h-8 bg-gradient-to-r from-red-200 via-green-200 to-blue-200 rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />
              <div className="absolute top-0 bottom-0 w-1 bg-green-600" style={{ left: '50%' }} />
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600" />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Min: {data.min || 0}</span>
              <span>Avg: {data.avg || 0}</span>
              <span>Max: {data.max || 0}</span>
            </div>
          </div>

          <div className="vb-card mt-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-amber-800">
                <strong>Note:</strong> Based on ICAR recommended practices under good management. Actual yield may vary based on soil health, irrigation, pest control, and weather conditions.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

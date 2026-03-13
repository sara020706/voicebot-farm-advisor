import { useState } from 'react';
import { Lang, TRANSLATIONS } from '@/lib/translations';
import { Spinner } from '@/components/Spinner';
import { useAppToast } from '@/components/Toast';
import { apiWeather } from '@/lib/api';
import { SoilValues } from './CropAdvisor';

interface Props {
  lang: Lang;
  onAutoFill: (data: Partial<SoilValues>) => void;
  onNavigate: (section: string) => void;
}

interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  description: string;
}

export default function WeatherSection({ lang, onAutoFill, onNavigate }: Props) {
  const t = TRANSLATIONS[lang];
  const { showToast } = useAppToast();
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const fetch_ = async () => {
    if (!city.trim()) return;
    setLoading(true);
    try {
      const data = await apiWeather(city);
      setWeather(data);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const autoFill = () => {
    if (!weather) return;
    onAutoFill({ temperature: weather.temperature, humidity: weather.humidity, rainfall: weather.rainfall });
    showToast('Weather data applied to crop form!', 'success');
    onNavigate('cropAdvisor');
  };

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-6">{t.weatherTitle}</h2>

      <div className="flex gap-3 mb-6">
        <input className="vb-input flex-1" value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city name…" onKeyDown={e => e.key === 'Enter' && fetch_()} />
        <button onClick={fetch_} disabled={loading} className="vb-btn-primary">
          {loading ? <Spinner /> : 'Get Weather →'}
        </button>
      </div>

      {weather && (
        <>
          <div className="vb-card bg-primary text-primary-foreground mb-4">
            <div className="text-sm opacity-80 mb-1">{weather.city}</div>
            <div className="font-heading text-5xl font-extrabold mb-1">{weather.temperature}°C</div>
            <div className="text-sm opacity-80 mb-4 capitalize">{weather.description}</div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><span className="opacity-70">Humidity</span><br/><span className="font-medium">{weather.humidity}%</span></div>
              <div><span className="opacity-70">Rainfall</span><br/><span className="font-medium">{weather.rainfall}mm</span></div>
              <div><span className="opacity-70">Feels like</span><br/><span className="font-medium">{weather.temperature}°C</span></div>
            </div>
          </div>
          <button onClick={autoFill} className="vb-btn-accent w-full">Auto-fill Crop Form</button>
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Lang, TRANSLATIONS } from '@/lib/translations';
import { Spinner } from '@/components/Spinner';
import { useAppToast } from '@/components/Toast';
import { apiPredict } from '@/lib/api';
import { addHistory } from '@/lib/store';

export interface SoilValues {
  N: number; P: number; K: number; pH: number; temperature: number; humidity: number; rainfall: number;
}

interface Props {
  lang: Lang;
  values: SoilValues;
  onChange: (v: SoilValues) => void;
}

const SLIDERS: { key: keyof SoilValues; label: string; min: number; max: number; step: number }[] = [
  { key: 'N', label: 'NITROGEN N', min: 0, max: 140, step: 1 },
  { key: 'P', label: 'PHOSPHORUS P', min: 0, max: 140, step: 1 },
  { key: 'K', label: 'POTASSIUM K', min: 0, max: 140, step: 1 },
  { key: 'pH', label: 'pH', min: 0, max: 14, step: 0.1 },
  { key: 'temperature', label: 'TEMPERATURE °C', min: 0, max: 50, step: 1 },
  { key: 'humidity', label: 'HUMIDITY %', min: 0, max: 100, step: 1 },
  { key: 'rainfall', label: 'RAINFALL mm', min: 0, max: 300, step: 1 },
];

export default function CropAdvisor({ lang, values, onChange }: Props) {
  const t = TRANSLATIONS[lang];
  const { showToast } = useAppToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ crop: string; confidence: number } | null>(null);

  const updateVal = (key: keyof SoilValues, val: number) => onChange({ ...values, [key]: val });

  const analyse = async () => {
    setLoading(true);
    try {
      const data = await apiPredict(values);
      setResult(data);
      addHistory({
        date: new Date().toLocaleDateString(),
        crop: data.crop,
        confidence: data.confidence,
        N: values.N, P: values.P, K: values.K,
      });
      showToast('Recommendation ready!', 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-6">{t.cropRecommendation}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mb-8">
        {SLIDERS.map(s => (
          <div key={s.key}>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</span>
              <span className="text-sm font-medium font-heading">{values[s.key]}</span>
            </div>
            <input
              type="range" min={s.min} max={s.max} step={s.step}
              value={values[s.key]}
              onChange={e => updateVal(s.key, parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-muted accent-accent cursor-pointer"
            />
          </div>
        ))}
      </div>

      <button onClick={analyse} disabled={loading} className="vb-btn-primary w-full h-[52px] text-base">
        {loading ? <Spinner /> : t.analyse}
      </button>

      {result && (
        <div className="vb-card mt-6">
          <div className="font-heading text-3xl font-extrabold mb-2">{result.crop}</div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${result.confidence * 100}%` }} />
            </div>
            <span className="text-sm font-medium">{(result.confidence * 100).toFixed(1)}%</span>
          </div>
          <p className="text-sm text-muted-foreground">Recommended based on your soil profile.</p>
        </div>
      )}
    </div>
  );
}

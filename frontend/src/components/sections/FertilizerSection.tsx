import { useState } from 'react';
import { Lang, TRANSLATIONS } from '@/lib/translations';
import { Spinner } from '@/components/Spinner';
import { useAppToast } from '@/components/Toast';
import { apiFertilizer } from '@/lib/api';

interface Props {
  lang: Lang;
  lastCrop: string;
}

interface Deficiency {
  nutrient: string;
  fertilizer: string;
  dosage: string;
  status: string;
}

const COLORS: Record<string, string> = {
  N: 'border-yellow-300 bg-yellow-50',
  P: 'border-red-300 bg-red-50',
  K: 'border-blue-300 bg-blue-50',
};

export default function FertilizerSection({ lang, lastCrop }: Props) {
  const t = TRANSLATIONS[lang];
  const { showToast } = useAppToast();
  const [N, setN] = useState(50);
  const [P, setP] = useState(50);
  const [K, setK] = useState(50);
  const [crop, setCrop] = useState(lastCrop);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Deficiency[]>([]);

  const submit = async () => {
    setLoading(true);
    try {
      const data = await apiFertilizer({ N, P, K, crop });
      setResults(data.deficiencies);
      showToast('Fertilizer plan ready!', 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-6">{t.fertilizerSuggestion}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {([['N', N, setN, 'NITROGEN N'], ['P', P, setP, 'PHOSPHORUS P'], ['K', K, setK, 'POTASSIUM K']] as const).map(([key, val, set, label]) => (
          <div key={key}>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
              <span className="text-sm font-medium font-heading">{val}</span>
            </div>
            <input type="range" min={0} max={140} value={val} onChange={e => set(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-muted accent-accent cursor-pointer" />
          </div>
        ))}
      </div>

      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Current Crop</label>
      <input className="vb-input w-full mb-6" value={crop} onChange={e => setCrop(e.target.value)} placeholder="Rice" />

      <button onClick={submit} disabled={loading} className="vb-btn-primary w-full">
        {loading ? <Spinner /> : 'Get Fertilizer Plan →'}
      </button>

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {results.map(r => (
            <div key={r.nutrient} className={`vb-card border-2 ${COLORS[r.nutrient] || 'border-border'}`}>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{r.nutrient}</div>
              <div className="font-heading text-lg font-bold flex items-center gap-2">
                {r.status}
                {r.status.toLowerCase() === 'sufficient' && <span className="text-accent">✓</span>}
              </div>
              <div className="text-sm mt-2">{r.fertilizer}</div>
              <div className="text-xs text-muted-foreground">{r.dosage}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

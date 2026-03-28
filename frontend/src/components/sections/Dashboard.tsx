import { useState, useEffect } from 'react';
import { Lang, TRANSLATIONS } from '@/lib/translations';
import { getHistory } from '@/lib/store';
import { apiHistory } from '@/lib/api';

interface Props {
  lang: Lang;
  onNavigate: (section: string) => void;
}

interface ScanEntry {
  date?: string;
  created_at?: string;
  crop?: string;
  recommended_crop?: string;
  confidence: number;
  N?: number;
  n?: number;
  P?: number;
  p?: number;
  K?: number;
  k?: number;
}

export default function Dashboard({ lang, onNavigate }: Props) {
  const t = TRANSLATIONS[lang];
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState<ScanEntry[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await apiHistory();
        if (data.scans && data.scans.length > 0) {
          setScans(data.scans);
        } else {
          setScans(getHistory());
        }
      } catch {
        setScans(getHistory());
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const lastCrop = localStorage.getItem('vb_last_crop') || scans[0]?.crop || scans[0]?.recommended_crop || '—';
  const scansDone = scans.length;
  const soilScore = scans.length > 0
    ? Math.round(scans.slice(0, 5).reduce((s, e) => s + ((e.N || e.n || 0) + (e.P || e.p || 0) + (e.K || e.k || 0)) / 3, 0) / Math.min(scans.length, 5))
    : 0;
  const recent = scans.slice(0, 3);

  if (loading) {
    return (
      <div>
        <h2 className="font-heading text-2xl font-bold mb-6">{t.dashboard}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-6">{t.dashboard}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: t.lastCrop, value: lastCrop },
          { label: t.scansDone, value: String(scansDone) },
          { label: t.soilScore, value: soilScore > 0 ? `${soilScore}` : '—' },
        ].map(s => (
          <div key={s.label} className="vb-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{s.label}</div>
            <div className="text-2xl font-heading font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="vb-card bg-primary text-primary-foreground mb-6">
        <h3 className="font-heading text-xl font-bold mb-2">{t.readyToAnalyse}</h3>
        <button onClick={() => onNavigate('cropAdvisor')} className="mt-2 h-12 rounded-xl bg-primary-foreground text-primary font-medium px-6 transition-all duration-200 hover:opacity-90">
          {t.startAnalysis}
        </button>
      </div>

      {recent.length > 0 && (
        <div>
          <h3 className="font-heading text-lg font-bold mb-3">{t.recentScans}</h3>
          <div className="vb-card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Crop</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Confidence</th>
              </tr></thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">{r.date ? new Date(r.date).toLocaleDateString() : r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 font-medium">{r.crop || r.recommended_crop || '—'}</td>
                    <td className="px-4 py-3">{((r.confidence || 0) * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

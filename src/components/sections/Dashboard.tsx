import { Lang, TRANSLATIONS } from '@/lib/translations';
import { getHistory } from '@/lib/store';

interface Props {
  lang: Lang;
  onNavigate: (section: string) => void;
}

export default function Dashboard({ lang, onNavigate }: Props) {
  const t = TRANSLATIONS[lang];
  const history = getHistory();
  const lastCrop = history[0]?.crop || '—';
  const scansDone = history.length;
  const soilScore = history.length > 0
    ? Math.round(history.slice(0, 5).reduce((s, e) => s + (e.N + e.P + e.K) / 3, 0) / Math.min(history.length, 5))
    : 0;
  const recent = history.slice(0, 3);

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
                    <td className="px-4 py-3">{r.date}</td>
                    <td className="px-4 py-3 font-medium">{r.crop}</td>
                    <td className="px-4 py-3">{(r.confidence * 100).toFixed(0)}%</td>
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

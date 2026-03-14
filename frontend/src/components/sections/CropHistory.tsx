import { useState, useEffect } from 'react';
import { Spinner } from '@/components/Spinner';
import { useAppToast } from '@/components/Toast';
import { getToken } from '@/lib/store';

interface CropHistoryProps {
  onNav: (section: string) => void;
  currentLang: 'en' | 'hi' | 'ta';
}

interface ScanEntry {
  id?: string;
  date?: string;
  created_at?: string;
  crop?: string;
  recommended_crop?: string;
  confidence: number;
  n?: number;
  N?: number;
  p?: number;
  P?: number;
  k?: number;
  K?: number;
  ph?: number;
  pH?: number;
}

const TRANSLATIONS = {
  en: {
    title: 'Crop History',
    description: 'Your last 5 soil analyses and recommendations',
    totalScans: 'Total Scans',
    mostRecommended: 'Most Recommended',
    lastScan: 'Last Scan',
    noScansYet: 'No scans yet',
    noScansSubtext: 'Complete your first soil analysis to see history here',
    goToCropAdvisor: 'Go to Crop Advisor',
    refresh: 'Refresh',
    clearLocal: 'Clear Local History',
    date: 'Date',
    cropRecommended: 'Crop Recommended',
    confidence: 'Confidence',
  },
  hi: {
    title: 'फसल इतिहास',
    description: 'आपके अंतिम 5 मिट्टी विश्लेषण और सिफारिशें',
    totalScans: 'कुल स्कैन',
    mostRecommended: 'सबसे अनुशंसित',
    lastScan: 'अंतिम स्कैन',
    noScansYet: 'अभी तक कोई स्कैन नहीं',
    noScansSubtext: 'इतिहास देखने के लिए अपना पहला मिट्टी विश्लेषण पूरा करें',
    goToCropAdvisor: 'फसल सलाहकार पर जाएं',
    refresh: 'ताज़ा करें',
    clearLocal: 'स्थानीय इतिहास साफ़ करें',
    date: 'तारीख',
    cropRecommended: 'अनुशंसित फसल',
    confidence: 'विश्वास',
  },
  ta: {
    title: 'பயிர் வரலாறு',
    description: 'உங்கள் கடைசி 5 மண் பகுப்பாய்வுகள் மற்றும் பரிந்துரைகள்',
    totalScans: 'மொத்த ஸ்கேன்கள்',
    mostRecommended: 'அதிகம் பரிந்துரைக்கப்பட்டது',
    lastScan: 'கடைசி ஸ்கேன்',
    noScansYet: 'இன்னும் ஸ்கேன் இல்லை',
    noScansSubtext: 'வரலாற்றைக் காண உங்கள் முதல் மண் பகுப்பாய்வை முடிக்கவும்',
    goToCropAdvisor: 'பயிர் ஆலோசகரிடம் செல்',
    refresh: 'புதுப்பி',
    clearLocal: 'உள்ளூர் வரலாற்றை அழி',
    date: 'தேதி',
    cropRecommended: 'பரிந்துரைக்கப்பட்ட பயிர்',
    confidence: 'நம்பிக்கை',
  },
};

export default function CropHistory({ onNav, currentLang }: CropHistoryProps) {
  const t = TRANSLATIONS[currentLang];
  const { showToast } = useAppToast();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<ScanEntry[]>([]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (token) {
        const res = await fetch('http://localhost:5000/api/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.scans && data.scans.length > 0) {
            setHistory(data.scans.slice(0, 5));
            setLoading(false);
            return;
          }
        }
      }
    } catch (e) {
      // Silently fall back to localStorage
    }

    // Fallback to localStorage
    try {
      const local = JSON.parse(localStorage.getItem('vb_history') || '[]');
      setHistory(local.slice(0, 5));
    } catch {
      setHistory([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clearLocalHistory = () => {
    localStorage.removeItem('vb_history');
    showToast('Local history cleared', 'success');
    fetchHistory();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return dateStr;
    }
  };

  const totalScans = history.length;
  const mostRecommended = history.length > 0
    ? Object.entries(
        history.reduce((acc, s) => {
          const crop = s.crop || s.recommended_crop || '';
          acc[crop] = (acc[crop] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
    : '—';
  const lastScanDate = history.length > 0
    ? formatDate(history[0].date || history[0].created_at).split(',')[0]
    : '—';

  if (loading) {
    return (
      <div>
        <h2 className="font-heading text-2xl font-bold mb-2">{t.title}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div>
        <h2 className="font-heading text-2xl font-bold mb-2">{t.title}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t.description}</p>
        <div className="flex flex-col items-center justify-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mb-4">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          <h3 className="font-heading text-xl font-bold mb-2">{t.noScansYet}</h3>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">{t.noScansSubtext}</p>
          <button onClick={() => onNav('cropAdvisor')} className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium transition-all duration-200 hover:opacity-90">
            {t.goToCropAdvisor}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-heading text-2xl font-bold">{t.title}</h2>
        <div className="flex gap-2">
          <button onClick={fetchHistory} className="px-4 py-2 rounded-xl text-sm font-medium bg-muted text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200">
            {t.refresh}
          </button>
          <button onClick={clearLocalHistory} className="px-4 py-2 rounded-xl text-sm font-medium bg-muted text-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-200">
            {t.clearLocal}
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{t.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#c8e0ce] rounded-2xl p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{t.totalScans}</div>
          <div className="text-3xl font-heading font-bold text-[#1a4d2e]">{totalScans}</div>
        </div>
        <div className="bg-white border border-[#c8e0ce] rounded-2xl p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{t.mostRecommended}</div>
          <div className="text-3xl font-heading font-bold text-[#1a4d2e]">{mostRecommended}</div>
        </div>
        <div className="bg-white border border-[#c8e0ce] rounded-2xl p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{t.lastScan}</div>
          <div className="text-3xl font-heading font-bold text-[#1a4d2e]">{lastScanDate}</div>
        </div>
      </div>

      <div className="bg-white border border-[#c8e0ce] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#c8e0ce] bg-[#f4f9f6]">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">{t.date}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">{t.cropRecommended}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">{t.confidence}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">N</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">P</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">K</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">pH</th>
              </tr>
            </thead>
            <tbody>
              {history.map((scan, i) => {
                const crop = scan.crop || scan.recommended_crop || '—';
                const n = scan.n ?? scan.N ?? 0;
                const p = scan.p ?? scan.P ?? 0;
                const k = scan.k ?? scan.K ?? 0;
                const ph = scan.ph ?? scan.pH ?? 0;
                const conf = scan.confidence || 0;

                return (
                  <tr key={i} className="border-b border-[#c8e0ce] last:border-0 hover:bg-[#f4f9f6] transition-colors duration-150">
                    <td className="px-4 py-3 text-xs">{formatDate(scan.date || scan.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#d4edda] text-[#1a4d2e] border border-[#4a9b6f]">
                        {crop}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden max-w-[80px]">
                          <div className="h-full bg-[#4a9b6f] rounded-full transition-all duration-500" style={{ width: `${conf * 100}%` }} />
                        </div>
                        <span className="text-xs font-medium">{(conf * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{n}</td>
                    <td className="px-4 py-3">{p}</td>
                    <td className="px-4 py-3">{k}</td>
                    <td className="px-4 py-3">{ph}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

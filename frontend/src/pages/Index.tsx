import { useState, useCallback } from 'react';
import { ToastProvider } from '@/components/Toast';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/sections/Dashboard';
import CropAdvisor, { SoilValues } from '@/components/sections/CropAdvisor';
import FertilizerSection from '@/components/sections/FertilizerSection';
import VoiceInput from '@/components/sections/VoiceInput';
import LanguageSection from '@/components/sections/LanguageSection';
import WeatherSection from '@/components/sections/WeatherSection';
import CropHistory from '@/components/sections/CropHistory';
import GovernmentSchemes from '@/components/sections/GovernmentSchemes';
import { getToken, getUser, getHistory } from '@/lib/store';
import { Lang } from '@/lib/translations';

type Page = 'login' | 'register' | 'app';

export default function Index() {
  const [page, setPage] = useState<Page>(getToken() ? 'app' : 'login');
  const [section, setSection] = useState('dashboard');
  const [lang, setLang] = useState<Lang>('en');
  const [soilValues, setSoilValues] = useState<SoilValues>({ N: 50, P: 50, K: 50, pH: 6.5, temperature: 25, humidity: 60, rainfall: 100 });
  const [predictionResult, setPredictionResult] = useState<string | null>(null);

  const user = getUser();
  const history = getHistory();
  const lastCrop = history[0]?.crop || '';

  const handleVoiceParsed = useCallback((partial: Partial<SoilValues>) => {
    setSoilValues(prev => ({ ...prev, ...partial }));
  }, []);

  const handleAutoFill = useCallback((partial: Partial<SoilValues>) => {
    setSoilValues(prev => ({ ...prev, ...partial }));
  }, []);

  const handlePredictionReady = useCallback((cropName: string) => {
    setPredictionResult(cropName);
  }, []);

  if (page === 'login') {
    return <ToastProvider><Login onLogin={() => setPage('app')} onGoRegister={() => setPage('register')} /></ToastProvider>;
  }
  if (page === 'register') {
    return <ToastProvider><Register onRegister={() => setPage('app')} onGoLogin={() => setPage('login')} /></ToastProvider>;
  }

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return <Dashboard lang={lang} onNavigate={setSection} />;
      case 'cropHistory': return <CropHistory onNav={setSection} currentLang={lang} />;
      case 'cropAdvisor': return <CropAdvisor lang={lang} values={soilValues} onChange={setSoilValues} />;
      case 'fertilizer': return <FertilizerSection lang={lang} lastCrop={lastCrop} />;
      case 'voiceInput': return <VoiceInput lang={lang} onParsed={handleVoiceParsed} onNavigate={setSection} onPredictionReady={handlePredictionReady} />;
      case 'language': return <LanguageSection currentLang={lang} onSelect={setLang} />;
      case 'weather': return <WeatherSection lang={lang} onAutoFill={handleAutoFill} onNavigate={setSection} />;
      case 'govSchemes': return <GovernmentSchemes currentLang={lang} />;
      default: return <Dashboard lang={lang} onNavigate={setSection} />;
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <Sidebar active={section} onNav={setSection} lang={lang} user={user} onLogout={() => setPage('login')} />
        <main className="md:ml-60 min-h-screen p-6 md:p-10 pb-24 md:pb-10">
          {renderSection()}
        </main>
      </div>
    </ToastProvider>
  );
}

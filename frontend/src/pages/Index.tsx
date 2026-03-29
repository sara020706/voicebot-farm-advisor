import { useState, useCallback } from 'react';
import { ToastProvider } from '@/components/Toast';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/sections/Dashboard';
import CropAdvisor, { SoilValues } from '@/components/sections/CropAdvisor';
import FertilizerSection from '@/components/sections/FertilizerSection';
import FarmVoiceAssistant from '@/components/sections/FarmVoiceAssistant';
import YieldEstimator from '@/components/sections/YieldEstimator';
import PestLookup from '@/components/sections/PestLookup';
import SeasonalCalendar from '@/components/sections/SeasonalCalendar';
import LanguageSection from '@/components/sections/LanguageSection';
import WeatherSection from '@/components/sections/WeatherSection';
import CropHistory from '@/components/sections/CropHistory';
import GovernmentSchemes from '@/components/sections/GovernmentSchemes';
import { getToken, getUser, getLang, setLang as saveLang } from '@/lib/store';
import { Lang } from '@/lib/translations';

type Page = 'login' | 'register' | 'app';

export default function Index() {
  const [page, setPage] = useState<Page>(getToken() ? 'app' : 'login');
  const [section, setSection] = useState('dashboard');
  const [currentLang, setCurrentLang] = useState<Lang>(getLang() as Lang);
  const [soilValues, setSoilValues] = useState<SoilValues>({ 
    N: 50, P: 50, K: 50, pH: 6.5, temperature: 25, humidity: 60, rainfall: 100 
  });

  const user = getUser();

  const handleVoiceParsed = useCallback((partial: Partial<SoilValues>) => {
    setSoilValues(prev => ({ ...prev, ...partial }));
  }, []);

  const handleAutoFill = useCallback((partial: Partial<SoilValues>) => {
    setSoilValues(prev => ({ ...prev, ...partial }));
  }, []);

  const handleLangChange = useCallback((lang: Lang) => {
    setCurrentLang(lang);
    saveLang(lang);
  }, []);

  if (page === 'login') {
    return <ToastProvider><Login onLogin={() => setPage('app')} onGoRegister={() => setPage('register')} /></ToastProvider>;
  }
  if (page === 'register') {
    return <ToastProvider><Register onRegister={() => setPage('app')} onGoLogin={() => setPage('login')} /></ToastProvider>;
  }

  const renderSection = () => {
    switch (section) {
      case 'dashboard': 
        return <Dashboard lang={currentLang} onNavigate={setSection} />;
      case 'voiceAssistant':
        return <FarmVoiceAssistant />;
      case 'cropHistory': 
        return <CropHistory onNav={setSection} currentLang={currentLang} />;
      case 'cropAdvisor': 
        return <CropAdvisor lang={currentLang} values={soilValues} onChange={setSoilValues} onNav={setSection} />;
      case 'fertilizer': 
        return <FertilizerSection lang={currentLang} />;
      case 'yieldEstimator':
        return <YieldEstimator currentLang={currentLang} onNav={setSection} />;
      case 'pestLookup':
        return <PestLookup currentLang={currentLang} onNav={setSection} />;
      case 'cropCalendar':
        return <SeasonalCalendar currentLang={currentLang} onNav={setSection} />;
      case 'language': 
        return <LanguageSection currentLang={currentLang} onSelect={handleLangChange} />;
      case 'weather': 
        return <WeatherSection lang={currentLang} onAutoFill={handleAutoFill} onNavigate={setSection} />;
      case 'govSchemes': 
        return <GovernmentSchemes currentLang={currentLang} />;
      default: 
        return <Dashboard lang={currentLang} onNavigate={setSection} />;
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <Sidebar active={section} onNav={setSection} lang={currentLang} user={user} onLogout={() => setPage('login')} />
        <main className="md:ml-60 min-h-screen p-6 md:p-10 pb-24 md:pb-10">
          {renderSection()}
        </main>
      </div>
    </ToastProvider>
  );
}

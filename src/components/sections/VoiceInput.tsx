import { useState, useRef } from 'react';
import { Lang, TRANSLATIONS } from '@/lib/translations';
import { SoilValues } from './CropAdvisor';

interface Props {
  lang: Lang;
  onParsed: (values: Partial<SoilValues>) => void;
  onNavigate: (section: string) => void;
}

const LANG_CODES: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN' };

export default function VoiceInput({ lang, onParsed, onNavigate }: Props) {
  const t = TRANSLATIONS[lang];
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'done'>('idle');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const statusLabels = { idle: 'Tap to speak', listening: 'Listening…', processing: 'Processing…', done: 'Done!' };

  const startListening = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { setTranscript('Speech recognition not supported'); return; }

    const recognition = new SR();
    recognition.lang = LANG_CODES[lang] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setStatus('listening');
    recognition.onresult = (e: any) => {
      setStatus('processing');
      const text = e.results[0][0].transcript;
      setTranscript(text);

      const nums = text.match(/[\d.]+/g)?.map(Number) || [];
      const keys: (keyof SoilValues)[] = ['N', 'P', 'K', 'pH', 'temperature', 'humidity', 'rainfall'];
      const parsed: Partial<SoilValues> = {};
      nums.forEach((n, i) => { if (i < keys.length) parsed[keys[i]] = n; });

      if (Object.keys(parsed).length > 0) onParsed(parsed);
      setStatus('done');
    };
    recognition.onerror = () => { setStatus('idle'); setTranscript('Error — try again'); };
    recognition.onend = () => { if (status === 'listening') setStatus('idle'); };
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setStatus('idle');
  };

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-8">{t.speakYourSoil}</h2>
      <div className="flex flex-col items-center">
        <div className="relative">
          {status === 'listening' && (
            <div className="absolute inset-0 rounded-full bg-accent/30 animate-pulse-ring" />
          )}
          <button
            onClick={status === 'listening' ? stopListening : startListening}
            className="relative w-[100px] h-[100px] rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all duration-200 hover:opacity-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
              <path d="M19 10v2a7 7 0 01-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>
        </div>

        <p className="mt-4 text-sm font-medium text-muted-foreground">{statusLabels[status]}</p>

        {transcript && (
          <div className="mt-6 w-full max-w-md bg-muted rounded-2xl p-4 italic text-sm text-foreground/80">
            {transcript}
          </div>
        )}

        {status === 'done' && (
          <button onClick={() => onNavigate('cropAdvisor')} className="vb-btn-accent mt-6">
            Fields updated — go to Crop Advisor →
          </button>
        )}
      </div>
    </div>
  );
}

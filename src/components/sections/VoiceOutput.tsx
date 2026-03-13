import { useState } from 'react';
import { Lang } from '@/lib/translations';
import { getHistory } from '@/lib/store';

const LANG_OPTIONS: { code: string; label: string; ttsLang: string }[] = [
  { code: 'en', label: 'English', ttsLang: 'en-IN' },
  { code: 'hi', label: 'हिन्दी', ttsLang: 'hi-IN' },
  { code: 'ta', label: 'தமிழ்', ttsLang: 'ta-IN' },
];

export default function VoiceOutput({ lang }: { lang: Lang }) {
  const history = getHistory();
  const defaultText = history[0] ? `Recommended crop: ${history[0].crop} with ${(history[0].confidence * 100).toFixed(0)}% confidence.` : '';
  const [text, setText] = useState(defaultText);
  const [selectedLang, setSelectedLang] = useState(lang);
  const [rate, setRate] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_OPTIONS.find(l => l.code === selectedLang)?.ttsLang || 'en-IN';
    utterance.rate = rate;
    utterance.onend = () => setSpeaking(false);
    speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const stop = () => { speechSynthesis.cancel(); setSpeaking(false); };

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-6">Listen to Recommendation</h2>

      <textarea
        className="vb-input w-full h-32 resize-none p-4 mb-4"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter text to read aloud…"
      />

      <div className="flex gap-2 mb-6">
        {LANG_OPTIONS.map(l => (
          <button
            key={l.code}
            onClick={() => setSelectedLang(l.code as Lang)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedLang === l.code ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Speed</span>
          <span className="text-sm font-heading">{rate}x</span>
        </div>
        <input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-muted accent-accent cursor-pointer" />
      </div>

      <div className="flex gap-3">
        <button onClick={speak} disabled={speaking} className="vb-btn-primary flex-1">Read Aloud</button>
        <button onClick={stop} disabled={!speaking} className="vb-btn-accent flex-1">Stop</button>
      </div>

      {speaking && (
        <div className="flex items-end justify-center gap-1.5 mt-6 h-10">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-2 bg-accent rounded-full animate-sound-bar"
              style={{ animationDelay: `${i * 0.15}s`, height: '8px' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

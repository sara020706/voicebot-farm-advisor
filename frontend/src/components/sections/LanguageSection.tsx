import { Lang, TRANSLATIONS } from '@/lib/translations';

interface Props {
  currentLang: Lang;
  onSelect: (lang: Lang) => void;
}

const LANGS: { code: Lang; name: string; sample: string }[] = [
  { code: 'en', name: 'English', sample: 'Get personalized crop recommendations for your farm.' },
  { code: 'hi', name: 'हिन्दी', sample: 'अपने खेत के लिए व्यक्तिगत फसल सिफारिशें प्राप्त करें।' },
  { code: 'ta', name: 'தமிழ்', sample: 'உங்கள் பண்ணைக்கான தனிப்பயனாக்கப்பட்ட பயிர் பரிந்துரைகளைப் பெறுங்கள்.' },
];

export default function LanguageSection({ currentLang, onSelect }: Props) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-6">{TRANSLATIONS[currentLang].languageTitle}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {LANGS.map(l => (
          <div key={l.code} className={`vb-card flex flex-col items-center text-center transition-all duration-200 ${currentLang === l.code ? 'border-accent border-2' : ''}`}>
            <div className="font-heading text-2xl font-bold mb-3">{l.name}</div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{l.sample}</p>
            <button
              onClick={() => onSelect(l.code)}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentLang === l.code ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {currentLang === l.code ? '✓ Selected' : 'Select'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

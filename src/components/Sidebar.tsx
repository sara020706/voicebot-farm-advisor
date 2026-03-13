import { Lang, TRANSLATIONS } from '@/lib/translations';
import { User, logout as doLogout } from '@/lib/store';

const NAV_ITEMS = [
  { key: 'dashboard', icon: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>, extra: <polyline points="9 22 9 12 15 12 15 22"/> },
  { key: 'cropAdvisor', icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></> },
  { key: 'fertilizer', icon: <><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></> },
  { key: 'voiceInput', icon: <><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></> },
  { key: 'voiceOutput', icon: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></> },
  { key: 'language', icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></> },
  { key: 'weather', icon: <><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></> },
];

interface Props {
  active: string;
  onNav: (key: string) => void;
  lang: Lang;
  user: User | null;
  onLogout: () => void;
}

export default function Sidebar({ active, onNav, lang, user, onLogout }: Props) {
  const t = TRANSLATIONS[lang];

  const handleLogout = () => {
    doLogout();
    onLogout();
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-30">
        <div className="p-6 pb-2">
          <h2 className="font-heading text-xl font-extrabold">VoiceBot</h2>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => onNav(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active === item.key
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {item.icon}
                {item.extra}
              </svg>
              {t[item.key as keyof typeof t]}
            </button>
          ))}
        </nav>
        {user && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-bold">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs opacity-70">{user.state}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="text-xs opacity-70 hover:opacity-100 transition-all duration-200">
              {t.logout}
            </button>
          </div>
        )}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-sidebar flex justify-around py-2 px-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => onNav(item.key)}
            className={`p-2 rounded-xl transition-all duration-200 ${active === item.key ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/70'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {item.icon}
              {item.extra}
            </svg>
          </button>
        ))}
      </nav>
    </>
  );
}

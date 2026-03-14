import { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastCtx {
  showToast: (message: string, type: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastCtx>({ showToast: () => {} });
export const useAppToast = () => useContext(ToastContext);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`vb-toast ${t.type === 'success' ? 'bg-accent' : 'bg-destructive'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

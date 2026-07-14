import { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null); // { title, message, danger, resolve }

  const confirm = useCallback(({ title = 'Are you sure?', message = '', danger = true } = {}) => {
    return new Promise((resolve) => {
      setState({ title, message, danger, resolve });
    });
  }, []);

  function handle(result) {
    state?.resolve(result);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease]">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface-dark p-6">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${state.danger ? 'bg-red-500/15' : 'bg-accent/15'}`}>
              <AlertTriangle size={20} className={state.danger ? 'text-red-400' : 'text-accent'} />
            </div>
            <p className="font-display text-2xl tracking-wide text-white mb-2">{state.title}</p>
            {state.message && <p className="text-sm text-muted-dark mb-6">{state.message}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => handle(false)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-muted-dark transition-colors duration-200 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handle(true)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-transform duration-200 active:scale-95 ${
                  state.danger ? 'bg-red-500 text-white' : 'bg-accent text-[#1a0a00]'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}
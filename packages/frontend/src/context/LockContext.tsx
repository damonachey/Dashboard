import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'dashboard.locked';

interface LockContextValue {
  locked: boolean;
  toggleLocked: () => void;
}

const LockContext = createContext<LockContextValue | null>(null);

function readInitialLocked(): boolean {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // Default to locked (read-only) when nothing's been saved yet.
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

export function LockProvider({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState(readInitialLocked);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(locked));
    } catch {
      // Private browsing / storage disabled — lock state just won't persist.
    }
  }, [locked]);

  return (
    <LockContext.Provider value={{ locked, toggleLocked: () => setLocked((l) => !l) }}>
      {children}
    </LockContext.Provider>
  );
}

export function useLocked(): LockContextValue {
  const ctx = useContext(LockContext);
  if (!ctx) throw new Error('useLocked must be used within a LockProvider');
  return ctx;
}

'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { lockScroll } from '@/lib/scroll';

interface UIState {
  /** True once the preloader has lifted and the world is on screen. */
  entered: boolean;
  menuOpen: boolean;
  briefOpen: boolean;
  enter: () => void;
  setMenuOpen: (open: boolean) => void;
  setBriefOpen: (open: boolean) => void;
}

const UIContext = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [entered, setEntered] = useState(false);
  const [menuOpen, setMenu] = useState(false);
  const [briefOpen, setBrief] = useState(false);

  useEffect(() => {
    lockScroll(!entered || menuOpen || briefOpen);
  }, [entered, menuOpen, briefOpen]);

  useEffect(() => {
    if (!menuOpen && !briefOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenu(false);
      setBrief(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, briefOpen]);

  const enter = useCallback(() => setEntered(true), []);
  const setMenuOpen = useCallback((open: boolean) => {
    setMenu(open);
    if (open) setBrief(false);
  }, []);
  const setBriefOpen = useCallback((open: boolean) => {
    setBrief(open);
    if (open) setMenu(false);
  }, []);

  const value = useMemo(
    () => ({ entered, menuOpen, briefOpen, enter, setMenuOpen, setBriefOpen }),
    [entered, menuOpen, briefOpen, enter, setMenuOpen, setBriefOpen],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used inside <UIProvider>');
  return context;
}

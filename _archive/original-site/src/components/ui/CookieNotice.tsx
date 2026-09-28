import React, { useState, useEffect } from 'react';
import { SoundEngine } from '../../lib/audio';

export const CookieNotice: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('kinetik_cookies_accepted');
    if (!dismissed) {
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAction = (accepted: boolean) => {
    SoundEngine.playTick();
    localStorage.setItem('kinetik_cookies_accepted', accepted ? '1' : '0');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      id="cookie-notice-banner"
      className="fixed bottom-4 left-4 z-[90] px-3.5 py-1.5 rounded-full bg-neutral-950/90 border border-neutral-800/80 backdrop-blur-xl text-white shadow-2xl flex items-center space-x-3 text-[10px] font-mono select-none"
    >
      <span className="text-neutral-400 tracking-wide uppercase text-[9px]">
        COOKIES: ENHANCE EXPERIENCE
      </span>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          type="button"
          onClick={() => handleAction(false)}
          className="text-neutral-500 hover:text-white uppercase transition-colors cursor-pointer text-[9px] tracking-wider"
        >
          DECLINE
        </button>
        <button
          type="button"
          onClick={() => handleAction(true)}
          className="px-2.5 py-0.5 rounded-full bg-white text-black font-semibold uppercase hover:bg-neutral-200 transition-colors cursor-pointer text-[9px] tracking-wider"
        >
          ACCEPT
        </button>
      </div>
    </div>
  );
};

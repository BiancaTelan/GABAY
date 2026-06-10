import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function TranslateToggle() {
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    const checkGoogleCookie = () => {
      const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
      if (match && match[1]) {
        setCurrentLang(match[1]);
      } else {
        setCurrentLang('en');
      }
    };
    
    checkGoogleCookie();
  }, []);

  const handleLanguageSwitch = (langCode) => {
    const host = window.location.hostname;
    const domainSlice = "." + host.split('.').slice(-2).join('.');

    if (langCode === 'en') {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domainSlice}`;
      
      setCurrentLang('en');
      window.location.reload();
      return;
    }

    if (langCode === 'tl') {
      document.cookie = "googtrans=/en/tl; path=/;";
      document.cookie = `googtrans=/en/tl; path=/; domain=${host}`;
      document.cookie = `googtrans=/en/tl; path=/; domain=${domainSlice}`;
      
      setCurrentLang('tl');
      window.location.reload();
      return;
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center p-1 bg-white border border-gray-200 rounded-full shadow-sm w-[115px] select-none h-9">
        
        <Globe size={16} className="ml-1.5 mr-0.5 text-gray-400 shrink-0 select-none" />
        
        <button
          type="button"
          onClick={() => handleLanguageSwitch('en')}
          className={`flex-1 flex justify-center items-center h-full rounded-full text-xs font-bold font-poppins transition-all tracking-wider ${
            currentLang === 'en'
              ? 'bg-gabay-blue text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          ENG
        </button>

        <button
          type="button"
          onClick={() => handleLanguageSwitch('tl')}
          className={`flex-1 flex justify-center items-center h-full rounded-full text-xs font-bold font-poppins transition-all tracking-wider ${
            currentLang === 'tl'
              ? 'bg-gabay-blue text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          FIL
        </button>
      </div>
    </div>
  );
}
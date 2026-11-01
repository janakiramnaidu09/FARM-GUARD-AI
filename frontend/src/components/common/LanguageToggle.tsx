import React from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { Languages } from 'lucide-react';

export const LanguageToggle: React.FC<{ variant?: 'header' | 'floating' }> = ({ variant = 'header' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200">
      <button
        type="button"
        onClick={() => setLanguage('te')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
          language === 'te'
            ? 'bg-white text-farm-700 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        తెలుగు
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
          language === 'en'
            ? 'bg-white text-farm-700 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        English
      </button>
    </div>
  );
};


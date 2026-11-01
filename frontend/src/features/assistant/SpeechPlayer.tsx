import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';

interface SpeechPlayerProps {
  text: string;
  lang?: 'en' | 'te';
}

export const SpeechPlayer: React.FC<SpeechPlayerProps> = ({ text, lang }) => {
  const { language, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
    }
  }, []);

  const handleToggleSpeak = () => {
    if (!supported || !text) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // clear previous queue
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = lang || language;
    utterance.lang = targetLang === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = targetLang === 'te' ? 0.9 : 1.0;

    // Try finding specific voice matching language
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(targetLang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      title={isSpeaking ? 'Stop speaking' : t.assistant.playAudio}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
        isSpeaking
          ? 'bg-farm-100 text-farm-800 border-farm-300'
          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
      }`}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-3.5 h-3.5 text-farm-700 animate-pulse" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.assistant.playAudio}</span>
        </>
      )}
    </button>
  );
};


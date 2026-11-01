import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription, disabled = false }) => {
  const { language, t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [supported, setSupported] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript.trim()) {
        onTranscription(finalTranscript.trim());
        setIsRecording(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition event error:', event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        setPermissionError('Microphone permission denied. Please allow microphone access in your browser.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [language, onTranscription]);

  const toggleRecording = () => {
    if (!supported || !recognitionRef.current) return;
    setPermissionError(null);

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.lang = language === 'te' ? 'te-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
      }
    }
  };

  if (!supported) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={toggleRecording}
        disabled={disabled}
        title={isRecording ? t.assistant.micListening : t.assistant.micStart}
        className={`relative inline-flex items-center justify-center p-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isRecording
            ? 'bg-rose-600 text-white shadow-lg ring-4 ring-rose-200 animate-pulse'
            : 'bg-farm-100 text-farm-800 hover:bg-farm-200 focus:ring-farm-500'
        }`}
      >
        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        {isRecording && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        )}
      </button>
      {permissionError && (
        <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3 h-3" /> {permissionError}
        </p>
      )}
    </div>
  );
};


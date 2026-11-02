import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useFarm } from '../context/FarmContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { VoiceRecorder } from '../features/assistant/VoiceRecorder.js';
import { SpeechPlayer } from '../features/assistant/SpeechPlayer.js';
import {
  Mic,
  Send,
  Bot,
  User as UserIcon,
  HelpCircle,
  ShieldAlert,
  Plus,
  Trash2,
  Sparkles,
  MapPin,
  Navigation,
  RefreshCw,
  X,
  CloudSun,
} from 'lucide-react';

interface GpsLocation {
  latitude: number;
  longitude: number;
  name?: string;
  weather?: string;
}

export const AssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedFarm, fields } = useFarm();
  const { t, language } = useLanguage();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);

  // GPS Location state
  const [gpsLocation, setGpsLocation] = useState<GpsLocation | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions in Telugu and English
  const suggestedQuestions =
    language === 'te'
      ? [
          '📍 నా ప్రస్తుత GPS ప్రదేశంలో ఈ రోజు వర్షం పడుతుందా? మందులు పిచికారీ చేయవచ్చా?',
          'వరి పంటలో అగ్గితెగులు (బ్లాస్ట్) నివారణ ఎలా?',
          'పత్తిలో ఆకుమచ్చ తెగులు లక్షణాలు మరియు నివారణ చర్యలు ఏమిటి?',
          'నల్లరేగడి నేలలో ఏ పంటలు బాగా పండుతాయి?',
        ]
      : [
          '📍 Will it rain at my current field location today and should I spray?',
          'How do I manage Rice Blast disease effectively?',
          'What are the symptoms and controls for Cotton Bacterial Blight?',
          'Which crops are best suited for black cotton soil with drip irrigation?',
        ];

  // Auto-detect GPS on first load if available
  useEffect(() => {
    handleDetectLocation(true);
  }, []);

  const handleDetectLocation = (silent: boolean = false) => {
    if (!navigator.geolocation) {
      if (!silent) setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        let locationName = '';
        let weatherSummary = '';

        try {
          // 1. Fetch current weather from Open-Meteo
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,weather_code`
          );
          if (weatherRes.ok) {
            const wData = await weatherRes.json();
            const temp = Math.round(wData.current?.temperature_2m);
            weatherSummary = `${temp}°C`;
          }
        } catch {}

        try {
          // 2. Reverse geocode city/district from OpenStreetMap / Nominatim
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${language}`,
            { headers: { 'User-Agent': 'FarmGuardAI/1.0' } }
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const addr = geoData.address || {};
            const district =
              addr.county || addr.district || addr.state_district || addr.city || addr.town || addr.village;
            const state = addr.state;
            locationName = [district, state].filter(Boolean).join(', ');
          }
        } catch {}

        setGpsLocation({
          latitude: lat,
          longitude: lon,
          name: locationName || `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`,
          weather: weatherSummary,
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (!silent) {
          setGpsError(err.message || 'Unable to retrieve GPS coordinates.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Load user conversations
  const loadConversations = async () => {
    try {
      const list = await api.getConversations();
      setConversations(list);
      if (list.length > 0 && !activeConvId) {
        setActiveConvId(list[0].id);
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConvId) return;
    const loadMessages = async () => {
      try {
        setLoadingConv(true);
        const data = await api.getConversation(activeConvId);
        setMessages(data.messages || []);
      } catch (err) {
        console.warn('Failed to load conversation messages:', err);
      } finally {
        setLoadingConv(false);
      }
    };
    loadMessages();
  }, [activeConvId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartNewConversation = async () => {
    try {
      const newConv = await api.createConversation({
        farmId: selectedFarm?.id || undefined,
        language: language as 'en' | 'te',
        title: language === 'te' ? 'నూతన వ్యవసాయ సలహా' : 'New Farm Consultation',
      });
      await loadConversations();
      setActiveConvId(newConv.id);
      setMessages([]);
    } catch (err: any) {
      alert(err.message || 'Failed to start conversation.');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || sending) return;

    try {
      setSending(true);
      setInputText('');

      let convId = activeConvId;
      if (!convId) {
        const newConv = await api.createConversation({
          farmId: selectedFarm?.id || undefined,
          language: language as 'en' | 'te',
        });
        convId = newConv.id;
        setActiveConvId(convId);
        await loadConversations();
      }

      if (!convId) return;

      // Optimistic user message with GPS coordinates if active
      const tempUserMsg = {
        id: Math.random().toString(),
        role: 'user',
        content: text,
        locationName: gpsLocation?.name,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      const res = await api.sendMessage(convId, {
        content: text,
        language: language as 'en' | 'te',
        latitude: gpsLocation?.latitude,
        longitude: gpsLocation?.longitude,
        locationName: gpsLocation?.name,
      });

      // Replace with confirmed response
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { ...res.userMessage, locationName: gpsLocation?.name },
        res.assistantMessage,
      ]);
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] max-w-5xl mx-auto flex flex-col md:flex-row gap-4">
      {/* Conversations Drawer */}
      <div className="w-full md:w-64 bg-white rounded-2xl border border-slate-200 p-3 flex flex-col shrink-0">
        <Button
          onClick={handleStartNewConversation}
          size="sm"
          className="w-full mb-3 gap-1.5"
          icon={<Plus className="w-4 h-4" />}
        >
          {language === 'te' ? 'కొత్త సంభాషణ' : 'New Consultation'}
        </Button>

        <div className="flex-1 overflow-y-auto space-y-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveConvId(c.id)}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-colors truncate block ${
                activeConvId === c.id
                  ? 'bg-farm-50 text-farm-800 border border-farm-200 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c.title || 'Agriculture Consultation'}
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-center py-6 text-xs text-slate-400">
              No conversations yet. Ask your first question!
            </p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-farm-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t.assistant.title}</h2>
              <p className="text-[11px] text-slate-500">
                Language: <strong className="text-farm-700">{language === 'te' ? 'తెలుగు (Telugu)' : 'English'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* GPS Location Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className={`w-4 h-4 shrink-0 ${gpsLocation ? 'text-emerald-600' : 'text-slate-400'}`} />
            {gpsLocation ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {gpsLocation.name}
                </span>
                {gpsLocation.weather && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium text-[11px] flex items-center gap-1">
                    <CloudSun className="w-3 h-3" /> {gpsLocation.weather}
                  </span>
                )}
                <span className="text-slate-400 text-[11px]">
                  ({gpsLocation.latitude.toFixed(3)}°, {gpsLocation.longitude.toFixed(3)}°)
                </span>
              </div>
            ) : (
              <span className="text-slate-500 text-xs">
                {language === 'te'
                  ? 'ఖచ్చితమైన వాతావరణం & ప్రాంతీయ పంట సలహా కోసం GPS ఆన్ చేయండి'
                  : 'Enable field GPS to receive hyper-local weather & crop advice for your location'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {gpsLocation ? (
              <>
                <button
                  type="button"
                  onClick={() => handleDetectLocation(false)}
                  disabled={gpsLoading}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                  {language === 'te' ? 'GPS తాజాకరించు' : 'Update GPS'}
                </button>
                <button
                  type="button"
                  onClick={() => setGpsLocation(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                  title="Clear GPS Location"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleDetectLocation(false)}
                disabled={gpsLoading}
                className="px-3 py-1.5 rounded-lg bg-farm-600 hover:bg-farm-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                {gpsLoading
                  ? language === 'te'
                    ? 'లొకేషన్ శోధిస్తోంది...'
                    : 'Detecting GPS...'
                  : language === 'te'
                  ? '📍 GPS గుర్తించు'
                  : '📍 Auto-detect GPS'}
              </button>
            )}
          </div>
        </div>

        {gpsError && (
          <div className="px-4 py-1.5 bg-rose-50 border-b border-rose-100 text-[11px] text-rose-700 flex items-center justify-between">
            <span>{gpsError}</span>
            <button onClick={() => setGpsError(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="py-8 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-farm-100 text-farm-700 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {language === 'te' ? 'నమస్కారం! నేను మీ ఫార్మ్‌గార్డ్ సహాయకుడిని' : 'Hello! I am your FarmGuard Assistant'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'te'
                    ? 'కింద మైక్రోఫోన్ నొక్కి మాట్లాడండి లేదా టైప్ చేసి మీ పంటల సమస్యలు అడగండి.'
                    : 'Speak or type your farming questions in Telugu or English for grounded advice.'}
                </p>
              </div>

              {/* Quick suggestions */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {t.assistant.suggestedQuestions}
                </span>
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:border-farm-400 hover:bg-farm-50/40 text-left text-xs text-slate-700 transition-colors shadow-2xs"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.role === 'user';
            const advice = m.structuredAdvice;

            return (
              <div key={m.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-farm-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-farm-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-900 border border-slate-200/90 rounded-bl-none shadow-xs space-y-3'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {/* Location badge on user message */}
                  {isUser && m.locationName && (
                    <div className="mt-1 pt-1 border-t border-farm-500/50 flex items-center gap-1 text-[10px] text-farm-100">
                      <MapPin className="w-3 h-3" />
                      <span>{m.locationName}</span>
                    </div>
                  )}

                  {!isUser && (
                    <>
                      {/* Audio Playback Control */}
                      <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                        <SpeechPlayer text={m.content} lang={language as 'en' | 'te'} />
                      </div>

                      {/* Uncertainty Disclosure if provided */}
                      {advice?.uncertainty && (
                        <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                          <strong>Note: </strong> {advice.uncertainty}
                        </div>
                      )}

                      {/* Follow-up Question Suggestions */}
                      {advice?.followUpQuestions && advice.followUpQuestions.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            {language === 'te' ? 'సంబంధిత ప్రశ్నలు:' : 'Suggested Follow-ups:'}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {advice.followUpQuestions.map((fq: string, fIdx: number) => (
                              <button
                                key={fIdx}
                                type="button"
                                onClick={() => handleSendMessage(fq)}
                                className="px-2.5 py-1 rounded-lg border border-farm-200 bg-farm-50 hover:bg-farm-100 text-farm-800 text-[11px] font-medium transition-colors text-left"
                              >
                                {fq}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Safety Disclaimer */}
                      {advice?.safetyNote && (
                        <div className="text-[11px] text-slate-500 flex items-start gap-1.5 pt-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{advice.safetyNote}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          {/* Voice Input with SpeechRecognition */}
          <VoiceRecorder onTranscription={(text) => handleSendMessage(text)} disabled={sending} />

          {/* Text Input Fallback */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              gpsLocation
                ? language === 'te'
                  ? `ప్రశ్న అడగండి (${gpsLocation.name})...`
                  : `Ask question for ${gpsLocation.name}...`
                : t.assistant.textPlaceholder
            }
            className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-farm-500"
          />

          <Button
            onClick={() => handleSendMessage()}
            loading={sending}
            disabled={!inputText.trim()}
            size="sm"
            className="rounded-xl px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

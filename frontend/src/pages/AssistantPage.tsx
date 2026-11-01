import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useFarm } from '../context/FarmContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardHeader, CardContent } from '../components/ui/Card.js';
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
} from 'lucide-react';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions in Telugu and English
  const suggestedQuestions =
    language === 'te'
      ? [
          'వరి పంటలో అగ్గితెగులు (బ్లాస్ట్) నివారణ ఎలా?',
          'పత్తిలో ఆకుమచ్చ తెగులు లక్షణాలు మరియు నివారణ చర్యలు ఏమిటి?',
          'నల్లరేగడి నేలలో ఏ పంటలు బాగా పండుతాయి?',
          'టొమాటో సాగులో బిందు సేద్యం (డ్రిప్) వాడకం వల్ల ప్రయోజనాలు?',
        ]
      : [
          'How do I manage Rice Blast disease effectively?',
          'What are the symptoms and controls for Cotton Bacterial Blight?',
          'Which crops are best suited for black cotton soil with drip irrigation?',
          'What are the optimal soil pH requirements for Tomato cultivation?',
        ];

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

      // Optimistic user message
      const tempUserMsg = {
        id: Math.random().toString(),
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      const res = await api.sendMessage(convId, {
        content: text,
        language: language as 'en' | 'te',
      });

      // Replace with confirmed response
      setMessages((prev) => [...prev.slice(0, -1), res.userMessage, res.assistantMessage]);
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

                      {/* Safety Disclaimer */}
                      {advice?.safetyNote && (
                        <div className="text-[11px] text-slate-500 flex items-start gap-1.5">
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
            placeholder={t.assistant.textPlaceholder}
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

import React from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { Card, CardHeader, CardContent } from '../components/ui/Card.js';
import { ShieldCheck, Lock, EyeOff, Trash2, Database, Mic } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { t, language } = useLanguage();

  const sections = [
    {
      icon: <Lock className="w-5 h-5 text-farm-600" />,
      title: 'PostgreSQL Row-Level Security (RLS) & Multi-Tenant Isolation',
      desc: 'All user records—including farms, field boundaries, soil tests, weather preferences, and chats—are partitioned with strict PostgreSQL Row-Level Security policies. Every query requires a verified server-side identity (app.user_id). No user can access or view another farmer’s holding.',
    },
    {
      icon: <EyeOff className="w-5 h-5 text-farm-600" />,
      title: 'Private Image Storage & No Public URLs',
      desc: 'Uploaded leaf photographs are validated for magic byte signatures and stored inside private storage. Images are never accessible through permanent public URLs. Access is strictly granted through short-lived, authenticated backend streaming.',
    },
    {
      icon: <Mic className="w-5 h-5 text-farm-600" />,
      title: 'Voice Recording & Audio Privacy',
      desc: 'FarmGuard AI processes Telugu and English speech in real time through the standard Web Speech API. Raw audio recordings are never stored on our servers unless explicitly requested by the user.',
    },
    {
      icon: <Database className="w-5 h-5 text-farm-600" />,
      title: 'Server-Side Only Gemini AI Integration',
      desc: 'All generative AI calls run exclusively on the Node.js server using official @google/genai SDKs. API keys and farmer contact credentials are never transmitted to the browser or logged in unencrypted logs.',
    },
    {
      icon: <Trash2 className="w-5 h-5 text-farm-600" />,
      title: 'Full Data Sovereignty: Export & Permanent Deletion',
      desc: 'Farmers retain full sovereignty over their agricultural records. You can download your complete historical archive in standard JSON format at any time from Settings, or permanently delete your account and all associated data with one click.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.privacy.title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.privacy.subtitle}</p>
      </div>

      <div className="space-y-4">
        {sections.map((s, idx) => (
          <Card key={idx}>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-farm-50 flex items-center justify-center shrink-0 mt-0.5">
                {s.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">Agronomic Disclaimer</p>
        <p className="leading-relaxed">
          FarmGuard AI provides digital advisory decision support. Crop disease classifications, soil interpretations, and crop suitability rankings are derived from mathematical models and published agronomic references. They do not substitute for on-field evaluations by certified Mandal Agricultural Officers or accredited laboratory tests.
        </p>
      </div>
    </div>
  );
};


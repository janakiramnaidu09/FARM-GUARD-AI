import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import {
  Sprout,
  ScanLine,
  FlaskConical,
  CloudSun,
  Sparkles,
  Mic,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const features = [
    {
      icon: <ScanLine className="w-6 h-6 text-emerald-600" />,
      title: t.landing.feature1Title,
      desc: t.landing.feature1Desc,
      tag: 'Computer Vision',
    },
    {
      icon: <FlaskConical className="w-6 h-6 text-emerald-600" />,
      title: t.landing.feature2Title,
      desc: t.landing.feature2Desc,
      tag: 'IoT Telemetry',
    },
    {
      icon: <CloudSun className="w-6 h-6 text-emerald-600" />,
      title: t.landing.feature3Title,
      desc: t.landing.feature3Desc,
      tag: 'Open-Meteo',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-emerald-600" />,
      title: t.landing.feature4Title,
      desc: t.landing.feature4Desc,
      tag: 'ICAR Agronomy',
    },
    {
      icon: <Mic className="w-6 h-6 text-emerald-600" />,
      title: t.landing.feature5Title,
      desc: t.landing.feature5Desc,
      tag: 'Telugu Speech AI',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      title: 'Farmer Privacy & Data Isolation',
      desc: 'Strict PostgreSQL Row-Level Security ensures no other user can access your private field records or scans.',
      tag: 'Security & RLS',
    },
  ];

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-farm-100 text-farm-800 text-xs sm:text-sm font-semibold border border-farm-200 shadow-sm">
          <Sprout className="w-4 h-4 text-farm-600" />
          <span>{language === 'te' ? 'రైతులకు నమ్మకమైన డిజిటల్ తోడు' : 'Trusted Decision Support for Indian Farmers'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t.landing.heroTitle}
        </h1>

        <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {t.landing.heroSubtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link to={user ? '/dashboard' : '/signup'}>
            <Button size="lg" className="w-full sm:w-auto shadow-md gap-2">
              <span>{user ? t.nav.dashboard : t.landing.startFree}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              {t.landing.exploreDemo}
            </Button>
          </Link>
        </div>

        {/* Value badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-farm-600" /> 100% Free & Open
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-farm-600" /> Works on Mobile Phones
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-farm-600" /> Telugu Voice Input & Audio
          </span>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {language === 'te' ? 'రైతుల కోసం సమగ్ర వ్యవసాయ వేదిక' : 'Complete Agricultural Advisory Platform'}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            Built with modern computer vision, live weather radar, and explainable agronomy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-farm-50 flex items-center justify-center border border-farm-100">
                  {f.icon}
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {f.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agronomic Attribution & Transparency */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-earth-50 rounded-2xl border border-earth-200 p-6 sm:p-8 text-center space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-earth-900">
            {language === 'te' ? 'ప్రామాణిక శాస్త్రీయ ఆధారాలు' : 'Attributable Agronomic Evidence'}
          </h3>
          <p className="text-sm text-earth-800 leading-relaxed max-w-2xl mx-auto">
            FarmGuard AI does not fabricate advice. Crop requirements, threshold warnings, and disease next steps are mapped directly to official publications from the Indian Council of Agricultural Research (ICAR), Professor Jayashankar Telangana State Agricultural University (PJTSAU), and Acharya N.G. Ranga Agricultural University (ANGRAU).
          </p>
          <div className="pt-2">
            <Link to="/recommendations" className="text-xs sm:text-sm font-semibold text-farm-700 hover:text-farm-800 underline">
              View Verified Agronomic Catalog &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};


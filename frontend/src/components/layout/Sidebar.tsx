import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.js';
import {
  LayoutDashboard,
  ScanLine,
  FlaskConical,
  CloudSun,
  Sparkles,
  Mic,
  Tractor,
  History,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { to: '/disease-check', label: t.nav.diseaseCheck, icon: ScanLine },
    { to: '/soil', label: t.nav.soilHealth, icon: FlaskConical },
    { to: '/weather', label: t.nav.weatherAlerts, icon: CloudSun },
    { to: '/recommendations', label: t.nav.cropPlanning, icon: Sparkles },
    { to: '/assistant', label: t.nav.voiceAssistant, icon: Mic },
    { to: '/farms', label: t.nav.farms, icon: Tractor },
    { to: '/history', label: t.nav.history, icon: History },
    { to: '/settings', label: t.nav.settings, icon: Settings },
    { to: '/privacy', label: t.nav.privacy, icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-farm-50 text-farm-700 shadow-sm border border-farm-200/60 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
      <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
        <p className="font-semibold text-slate-600">FarmGuard AI v1.0</p>
        <p className="mt-0.5">Decision support for Indian agriculture.</p>
      </div>
    </aside>
  );
};


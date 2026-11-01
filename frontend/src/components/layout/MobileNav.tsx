import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.js';
import {
  LayoutDashboard,
  ScanLine,
  FlaskConical,
  CloudSun,
  Mic,
  X,
  Sparkles,
  Tractor,
  History,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  const allItems = [
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

  const bottomBarItems = [
    { to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { to: '/disease-check', label: t.nav.diseaseCheck, icon: ScanLine },
    { to: '/assistant', label: 'తెలుగు AI', icon: Mic, highlight: true },
    { to: '/soil', label: t.nav.soilHealth, icon: FlaskConical },
    { to: '/weather', label: t.nav.weatherAlerts, icon: CloudSun },
  ];

  return (
    <>
      {/* Sliding Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl p-4 flex flex-col z-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900">{t.common.appName}</span>
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-1">
              {allItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-farm-50 text-farm-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar for Mobile thumb access */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {bottomBarItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-all ${
                  item.highlight
                    ? 'text-farm-700 font-bold -mt-3'
                    : isActive
                    ? 'text-farm-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              {item.highlight ? (
                <div className="w-11 h-11 rounded-full bg-farm-600 text-white flex items-center justify-center shadow-md border-2 border-white mb-0.5">
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <Icon className="w-5 h-5 mb-0.5" />
              )}
              <span className="truncate max-w-[64px]">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};


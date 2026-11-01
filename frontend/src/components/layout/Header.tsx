import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useFarm } from '../../context/FarmContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { LanguageToggle } from '../common/LanguageToggle.js';
import { Sprout, LogOut, User as UserIcon, Menu, MapPin, ChevronDown } from 'lucide-react';

export const Header: React.FC<{ onOpenMobileMenu: () => void }> = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const { farms, selectedFarm, selectFarm } = useFarm();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-farm-600 text-white flex items-center justify-center shadow-sm">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight block leading-tight">
                  {language === 'te' ? 'ఫార్మ్‌గార్డ్ AI' : 'FarmGuard AI'}
                </span>
                <span className="text-[10px] text-farm-700 font-semibold uppercase tracking-wider block">
                  {language === 'te' ? 'రైతు సలహాదారు' : 'Crop Advisory'}
                </span>
              </div>
            </Link>
          </div>

          {/* Farm Selector (if signed in) */}
          {user && (
            <div className="hidden sm:flex items-center">
              {farms.length > 0 ? (
                <div className="relative">
                  <select
                    value={selectedFarm?.id || ''}
                    onChange={(e) => {
                      const f = farms.find((farm) => farm.id === e.target.value);
                      if (f) selectFarm(f);
                    }}
                    className="appearance-none bg-farm-50 border border-farm-200 text-farm-900 text-xs sm:text-sm font-medium rounded-lg pl-8 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-farm-500 cursor-pointer"
                  >
                    {farms.map((farm) => (
                      <option key={farm.id} value={farm.id}>
                        {farm.name} ({farm.district || farm.state || 'India'})
                      </option>
                    ))}
                  </select>
                  <MapPin className="w-3.5 h-3.5 text-farm-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <ChevronDown className="w-3.5 h-3.5 text-farm-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : (
                <Link
                  to="/farms"
                  className="text-xs font-semibold text-farm-700 bg-farm-50 px-3 py-1.5 rounded-lg border border-farm-200 hover:bg-farm-100"
                >
                  + {t.dashboard.addFarmPrompt.split('.')[0]}
                </Link>
              )}
            </div>
          )}

          {/* Right Header: Language Toggle, User profile, Logout */}
          <div className="flex items-center gap-3">
            <LanguageToggle />

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/settings"
                  className="flex items-center gap-2 p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium hidden md:inline max-w-[120px] truncate">
                    {user.displayName}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  title={t.nav.logout}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/signup"
                  className="text-xs sm:text-sm font-semibold text-white bg-farm-600 hover:bg-farm-700 px-3.5 py-1.5 rounded-lg shadow-sm"
                >
                  {t.nav.signup}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


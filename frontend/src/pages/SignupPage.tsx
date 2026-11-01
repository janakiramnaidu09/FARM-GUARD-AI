import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Card, CardContent } from '../components/ui/Card.js';
import { Alert } from '../components/ui/Alert.js';
import { Sprout } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLang, setPreferredLang] = useState<'en' | 'te'>((language as 'en' | 'te') || 'te');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      await signup({
        email,
        password,
        displayName,
        preferredLanguage: preferredLang,
      });
      setLanguage(preferredLang);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-farm-600 rounded-2xl text-white flex items-center justify-center mx-auto shadow-md">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {language === 'te' ? 'రైతు ఖాతా సృష్టించండి' : 'Create FarmGuard Account'}
          </h2>
          <p className="text-sm text-slate-500">
            {language === 'te' ? 'ఉచితంగా నమోదు చేసుకోండి' : 'Free access to leaf diagnostics and soil insights'}
          </p>
        </div>

        <Card className="shadow-md">
          <CardContent className="space-y-4 pt-6">
            {error && <Alert type="error">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name / Farmer Name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ramesh Reddy (రమేష్ రెడ్డి)"
              />

              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                autoComplete="email"
              />

              <Input
                label="Password (min 8 characters)"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                  Preferred Language / ప్రాధాన్యత భాష
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPreferredLang('te')}
                    className={`py-2 px-3 rounded-lg border text-xs sm:text-sm font-semibold transition-all ${
                      preferredLang === 'te'
                        ? 'border-farm-600 bg-farm-50 text-farm-800'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    తెలుగు (Telugu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredLang('en')}
                    className={`py-2 px-3 rounded-lg border text-xs sm:text-sm font-semibold transition-all ${
                      preferredLang === 'en'
                        ? 'border-farm-600 bg-farm-50 text-farm-800'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <Button type="submit" loading={loading} className="w-full">
                {t.nav.signup}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs sm:text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-farm-700 hover:text-farm-800 underline">
            {t.nav.login}
          </Link>
        </p>
      </div>
    </div>
  );
};


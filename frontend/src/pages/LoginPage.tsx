import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Card, CardHeader, CardContent } from '../components/ui/Card.js';
import { Alert } from '../components/ui/Alert.js';
import { Sprout, KeyRound, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('farmer@farmguard.ai');
    setPassword('FarmGuard123!');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-8 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-farm-600 rounded-2xl text-white flex items-center justify-center mx-auto shadow-md">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {language === 'te' ? 'రైతు లాగిన్' : 'Sign in to FarmGuard AI'}
          </h2>
          <p className="text-sm text-slate-500">
            {language === 'te' ? 'మీ వ్యవసాయ క్షేత్ర వివరాలను వీక్షించండి' : 'Access your farm health records and AI advisory'}
          </p>
        </div>

        <Card className="shadow-md">
          <CardContent className="space-y-4 pt-6">
            {error && <Alert type="error">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />

              <Button type="submit" loading={loading} className="w-full">
                {t.nav.login}
              </Button>
            </form>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full py-2 px-3 border border-farm-200 bg-farm-50 hover:bg-farm-100 rounded-lg text-xs font-semibold text-farm-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-farm-600" />
                <span>Quick Fill Demo Farmer (రమేష్ రెడ్డి)</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs sm:text-sm text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-semibold text-farm-700 hover:text-farm-800 underline">
            {t.nav.signup}
          </Link>
        </p>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Card, CardHeader, CardContent } from '../components/ui/Card.js';
import { Modal } from '../components/ui/Modal.js';
import { Alert } from '../components/ui/Alert.js';
import { Badge } from '../components/ui/Badge.js';
import {
  Settings as SettingsIcon,
  Download,
  Trash2,
  CheckCircle,
  Activity,
  ShieldAlert,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [prefLang, setPrefLang] = useState<'en' | 'te'>((user?.preferredLanguage as any) || language);
  const [savingProfile, setSavingProfile] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ready & System Status
  const [systemReady, setSystemReady] = useState<any>(null);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setPrefLang((user.preferredLanguage as any) || language);
    }

    const checkSystem = async () => {
      try {
        const readyData = await api.getReady();
        setSystemReady(readyData);
      } catch (err) {
        console.warn('System status fetch failed:', err);
      }
    };
    checkSystem();
  }, [user, language]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setSuccessMsg(null);
      setErrorMsg(null);
      await api.updateSettings({
        displayName,
        preferredLanguage: prefLang,
      });
      setLanguage(prefLang);
      await refreshUser();
      setSuccessMsg('Profile updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update settings.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) return;

    try {
      setDeleting(true);
      await api.deleteAccount(deletePassword);
      await logout();
      window.location.href = '/';
    } catch (err: any) {
      alert(err.message || 'Account deletion failed.');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.settings.title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.settings.subtitle}</p>
      </div>

      {successMsg && <Alert type="success">{successMsg}</Alert>}
      {errorMsg && <Alert type="error">{errorMsg}</Alert>}

      {/* Profile Settings */}
      <Card>
        <CardHeader title="Farmer Profile" subtitle="Your identity and personal language settings" />
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t.settings.displayName}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email cannot be changed directly."
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                {t.settings.preferredLanguage}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPrefLang('te')}
                  className={`px-4 py-2 rounded-lg border text-xs sm:text-sm font-semibold transition-all ${
                    prefLang === 'te'
                      ? 'border-farm-600 bg-farm-50 text-farm-800'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  తెలుగు (Telugu)
                </button>
                <button
                  type="button"
                  onClick={() => setPrefLang('en')}
                  className={`px-4 py-2 rounded-lg border text-xs sm:text-sm font-semibold transition-all ${
                    prefLang === 'en'
                      ? 'border-farm-600 bg-farm-50 text-farm-800'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <Button type="submit" loading={savingProfile}>
              {t.settings.saveProfile}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* System Status & Dependencies */}
      <Card>
        <CardHeader
          title="System & Provider Status"
          subtitle="Operational readiness of database, weather, and AI services"
        />
        <CardContent>
          {systemReady ? (
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">PostgreSQL Database</span>
                    <span className="text-slate-500 text-xs">
                      Mode: {systemReady.dependencies?.database?.mode || 'in-memory-dev'}
                    </span>
                  </div>
                  <Badge variant={systemReady.dependencies?.database?.connected ? 'success' : 'warning'}>
                    {systemReady.dependencies?.database?.connected ? 'PostgreSQL Active' : 'Dev Memory'}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Weather Radar</span>
                    <span className="text-slate-500 text-xs">Provider: Open-Meteo</span>
                  </div>
                  <Badge variant="success">Online</Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Gemini AI Assistant</span>
                    <span className="text-slate-500 text-xs">Model: {systemReady.dependencies?.aiAssistant?.model}</span>
                  </div>
                  <Badge variant={systemReady.dependencies?.aiAssistant?.configured ? 'success' : 'neutral'}>
                    {systemReady.dependencies?.aiAssistant?.configured ? 'Configured' : 'Local Fallback'}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Disease Inference Service</span>
                    <span className="text-slate-500 text-xs">FastAPI / OpenCV</span>
                  </div>
                  <Badge variant={systemReady.dependencies?.diseaseInference?.reachable ? 'success' : 'neutral'}>
                    {systemReady.dependencies?.diseaseInference?.reachable ? 'Connected' : 'Offline / Setup Ready'}
                  </Badge>
                </div>
              </div>

              {systemReady.issues?.length > 0 && (
                <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-slate-700 block">Environment notices:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {systemReady.issues.map((iss: string, i: number) => (
                      <li key={i}>{iss}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Verifying system connectivity...</p>
          )}
        </CardContent>
      </Card>

      {/* Data Sovereignty & Export */}
      <Card>
        <CardHeader
          title={t.settings.dataPrivacyTitle}
          subtitle="Download a complete copy of all your agricultural data"
        />
        <CardContent className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t.settings.exportNotice}
          </p>
          <Button
            variant="outline"
            onClick={() => api.exportAccountData()}
            icon={<Download className="w-4 h-4 text-farm-600" />}
          >
            {t.settings.exportData}
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-rose-200">
        <CardHeader
          title={<span className="text-rose-700">{t.settings.deleteAccountTitle}</span>}
          subtitle="Permanently erase your farmer profile, fields, soil readings, and scans"
        />
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            {t.settings.deleteAccountDesc}
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            {t.settings.deleteButton}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Permanent Account Deletion"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p>
              Warning: This action is irreversible. All farms, field boundaries, soil readings, leaf scans, and assistant conversations will be permanently deleted from the database.
            </p>
          </div>

          <Input
            label="Enter your password to confirm deletion"
            type="password"
            required
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Your password"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsDeleteModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="danger" type="submit" loading={deleting}>
              Permanently Delete
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


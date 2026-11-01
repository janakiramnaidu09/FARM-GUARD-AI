import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useFarm } from '../context/FarmContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardHeader, CardContent } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Alert } from '../components/ui/Alert.js';
import { FreshnessBadge } from '../features/soil/FreshnessBadge.js';
import {
  ScanLine,
  FlaskConical,
  CloudSun,
  Sparkles,
  Mic,
  MapPin,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Droplets,
  Thermometer,
  Wind,
  Tractor,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedFarm, fields } = useFarm();
  const { t, language } = useLanguage();

  const [weatherData, setWeatherData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [soilReadings, setSoilReadings] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    if (!selectedFarm) return;

    // Fetch weather & alerts
    const loadWeather = async () => {
      try {
        setLoadingWeather(true);
        const res = await api.getFarmWeather(selectedFarm.id);
        setWeatherData(res);
        setAlerts(res.alerts || []);
      } catch (err) {
        console.warn('Weather fetch error:', err);
      } finally {
        setLoadingWeather(false);
      }
    };

    // Fetch field soil readings
    const loadSoil = async () => {
      try {
        if (fields.length > 0) {
          const readings = await api.getFieldSoilReadings(fields[0].id);
          setSoilReadings(readings);
        } else {
          setSoilReadings([]);
        }
      } catch (err) {
        console.warn('Soil fetch error:', err);
      }
    };

    // Fetch recent activity
    const loadHistory = async () => {
      try {
        const hist = await api.getHistory('all');
        setRecentActivities(hist.items.slice(0, 5));
      } catch (err) {
        console.warn('History fetch error:', err);
      }
    };

    loadWeather();
    loadSoil();
    loadHistory();
  }, [selectedFarm, fields]);

  const handleRefreshWeather = async () => {
    if (!selectedFarm) return;
    try {
      setLoadingWeather(true);
      const res = await api.refreshFarmWeather(selectedFarm.id);
      setWeatherData(res);
      setAlerts(res.alerts || []);
    } finally {
      setLoadingWeather(false);
    }
  };

  const latestSoil = soilReadings[0];

  return (
    <div className="space-y-6">
      {/* Welcome & Farm Context Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t.dashboard.welcome}, {user?.displayName}
          </h1>
          {selectedFarm ? (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-farm-600" />
              <span>{selectedFarm.name}</span>
              <span>•</span>
              <span>{selectedFarm.district || selectedFarm.state || 'India'}</span>
              <span>•</span>
              <span>{fields.length} {fields.length === 1 ? 'Field' : 'Fields'}</span>
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t.dashboard.addFarmPrompt}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/farms">
            <Button variant="outline" size="sm" icon={<Tractor className="w-4 h-4 text-farm-700" />}>
              {t.nav.farms}
            </Button>
          </Link>
          <Link to="/assistant">
            <Button size="sm" className="bg-farm-600 gap-1.5">
              <Mic className="w-4 h-4" />
              <span>{language === 'te' ? 'తెలుగు AI అడగండి' : 'Ask Assistant'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Alerts Banner (if any) */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <Alert
              key={idx}
              type={alert.severity === 'warning' ? 'warning' : 'info'}
              title={alert.alertCode.replace(/_/g, ' ')}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
                <span className="text-xs sm:text-sm">{alert.message}</span>
                <Link to="/weather" className="font-semibold text-xs underline shrink-0">
                  {t.common.viewDetails} &rarr;
                </Link>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Link
          to="/disease-check"
          className="bg-white p-4 rounded-xl border border-slate-200/90 hover:border-farm-400 hover:shadow-md transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ScanLine className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
            {t.dashboard.actionDisease}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">AI Crop Scan</p>
        </Link>

        <Link
          to="/soil"
          className="bg-white p-4 rounded-xl border border-slate-200/90 hover:border-farm-400 hover:shadow-md transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FlaskConical className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
            {t.dashboard.actionSoil}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Moisture & pH</p>
        </Link>

        <Link
          to="/weather"
          className="bg-white p-4 rounded-xl border border-slate-200/90 hover:border-farm-400 hover:shadow-md transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <CloudSun className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
            {t.dashboard.actionWeather}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">7-Day Forecast</p>
        </Link>

        <Link
          to="/recommendations"
          className="bg-white p-4 rounded-xl border border-slate-200/90 hover:border-farm-400 hover:shadow-md transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
            {t.dashboard.actionCrop}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Suitability Score</p>
        </Link>

        <Link
          to="/assistant"
          className="col-span-2 sm:col-span-1 bg-farm-600 text-white p-4 rounded-xl hover:bg-farm-700 shadow-sm transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-xs sm:text-sm text-white leading-snug">
            {t.dashboard.actionVoice}
          </h3>
          <p className="text-[11px] text-farm-100 mt-1">Voice & Text</p>
        </Link>
      </div>

      {/* Grid: Weather & Soil Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Card */}
        <Card>
          <CardHeader
            title={t.dashboard.currentWeather}
            subtitle={
              weatherData
                ? `Provider: ${weatherData.provider} • Updated ${new Date(weatherData.fetchedAt).toLocaleTimeString()}`
                : 'Live Meteorological Forecast'
            }
            action={
              <button
                type="button"
                onClick={handleRefreshWeather}
                disabled={loadingWeather}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title={t.common.refresh}
              >
                <RefreshCw className={`w-4 h-4 ${loadingWeather ? 'animate-spin text-farm-600' : ''}`} />
              </button>
            }
          />
          <CardContent>
            {weatherData?.forecast?.current ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                      {weatherData.forecast.current.temperatureC}°C
                    </span>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                      {weatherData.forecast.current.conditionText}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>High: {weatherData.forecast.daily[0]?.temperatureMaxC}°C</p>
                    <p>Low: {weatherData.forecast.daily[0]?.temperatureMinC}°C</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <Droplets className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                    <span className="text-slate-500 block">Humidity</span>
                    <span className="font-bold text-slate-800">{weatherData.forecast.current.humidityPct}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <Wind className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                    <span className="text-slate-500 block">Wind</span>
                    <span className="font-bold text-slate-800">{weatherData.forecast.current.windSpeedKmh} km/h</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <CloudSun className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                    <span className="text-slate-500 block">Rainfall</span>
                    <span className="font-bold text-slate-800">{weatherData.forecast.current.precipitationMm} mm</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500">7-Day Agricultural Outlook</span>
                  <Link to="/weather" className="font-semibold text-farm-700 hover:text-farm-800 flex items-center gap-1">
                    <span>Forecast details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-slate-400">
                {loadingWeather ? 'Fetching local meteorological data...' : 'No forecast available'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Soil Health Status */}
        <Card>
          <CardHeader
            title={t.dashboard.soilOverview}
            subtitle={fields.length > 0 ? `Field: ${fields[0].name}` : 'Field Observations'}
            action={
              <Link to="/soil">
                <Button variant="ghost" size="sm">
                  + {t.soil.addReading}
                </Button>
              </Link>
            }
          />
          <CardContent>
            {latestSoil ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Latest Moisture</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                      {latestSoil.moisturePct !== null ? `${latestSoil.moisturePct}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="text-right">
                    <FreshnessBadge observedAt={latestSoil.observedAt} source={latestSoil.source} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <span className="text-slate-500 block">Soil pH</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {latestSoil.ph !== null ? latestSoil.ph : 'Unmeasured'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <span className="text-slate-500 block">Temperature</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {latestSoil.temperatureC !== null ? `${latestSoil.temperatureC}°C` : 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <span className="text-slate-500 block">N-P-K Status</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {latestSoil.nitrogenValue ? `${latestSoil.nitrogenValue} N` : 'Recorded'}
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {latestSoil.source === 'sensor' ? 'Automated IoT telemetry' : 'Manual farmer observation'}
                  </span>
                  <Link to="/soil" className="font-semibold text-farm-700 hover:text-farm-800 flex items-center gap-1">
                    <span>View trend timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
                <span>{t.soil.noReadings}</span>
                <Link to="/soil">
                  <Button variant="outline" size="sm">
                    Enter First Soil Reading
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader
          title={t.dashboard.recentActivity}
          subtitle="Recent diagnostic scans, soil observations, and advisory consultations"
          action={
            <Link to="/history" className="text-xs font-semibold text-farm-700 hover:text-farm-800 flex items-center gap-1">
              <span>Full history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentActivities.map((act) => (
                <div key={act.id} className="py-3 flex items-start justify-between gap-4 text-xs sm:text-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{act.title}</span>
                      <Badge size="sm" variant={act.type === 'disease' ? 'warning' : act.type === 'soil' ? 'info' : 'success'}>
                        {act.type}
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-xs">{act.summary}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-xs sm:text-sm text-slate-400">
              {t.dashboard.noActivity}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


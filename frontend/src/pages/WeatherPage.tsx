import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFarm } from '../context/FarmContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardHeader, CardContent } from '../components/ui/Card.js';
import { Modal } from '../components/ui/Modal.js';
import { Input } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { Alert } from '../components/ui/Alert.js';
import {
  CloudSun,
  RefreshCw,
  Droplets,
  Wind,
  Sliders,
  AlertTriangle,
  Info,
  Calendar,
  Thermometer,
} from 'lucide-react';

export const WeatherPage: React.FC = () => {
  const { selectedFarm } = useFarm();
  const { t, language } = useLanguage();

  const [weatherData, setWeatherData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertExplanation, setAlertExplanation] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isPrefsModalOpen, setIsPrefsModalOpen] = useState<boolean>(false);

  // Preference thresholds
  const [heavyRainMm, setHeavyRainMm] = useState('25');
  const [extremeHeatC, setExtremeHeatC] = useState('38');
  const [frostC, setFrostC] = useState('4');
  const [highWindKmh, setHighWindKmh] = useState('35');

  const loadWeather = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);

      let res: any = null;
      if (selectedFarm?.id) {
        try {
          res = force
            ? await api.refreshFarmWeather(selectedFarm.id)
            : await api.getFarmWeather(selectedFarm.id);
        } catch (e) {
          console.warn('Selected farm weather fetch failed, trying live fallback:', e);
        }
      }

      if (!res) {
        let lat = selectedFarm?.latitude || 17.8524;
        let lon = selectedFarm?.longitude || 78.6833;
        if (navigator.geolocation && (!selectedFarm?.latitude || !selectedFarm?.longitude)) {
          try {
            const pos: GeolocationPosition = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
            });
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
          } catch {}
        }
        res = await api.getLiveWeather(lat, lon, force);
      }

      setWeatherData(res);
      setAlerts(res.alerts || []);

      // Load AI alert summary and alert thresholds if farm is selected
      if (selectedFarm?.id) {
        try {
          const alertRes = await api.getFarmAlerts(selectedFarm.id);
          setAlertExplanation(alertRes.explanation);
        } catch {}

        try {
          const prefs = await api.getAlertPreferences(selectedFarm.id);
          if (prefs.thresholds) {
            setHeavyRainMm(String(prefs.thresholds.heavyRainMm ?? 25));
            setExtremeHeatC(String(prefs.thresholds.extremeHeatC ?? 38));
            setFrostC(String(prefs.thresholds.frostC ?? 4));
            setHighWindKmh(String(prefs.thresholds.highWindKmh ?? 35));
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Weather load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, [selectedFarm]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarm) return;
    try {
      await api.updateAlertPreferences(selectedFarm.id, {
        thresholds: {
          heavyRainMm: parseFloat(heavyRainMm),
          extremeHeatC: parseFloat(extremeHeatC),
          frostC: parseFloat(frostC),
          highWindKmh: parseFloat(highWindKmh),
        },
      });
      setIsPrefsModalOpen(false);
      await loadWeather(true);
    } catch (err: any) {
      alert(err.message || 'Failed to update preferences.');
    }
  };

  const current = weatherData?.forecast?.current;
  const daily = weatherData?.forecast?.daily || [];
  const hourly = weatherData?.forecast?.hourly || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {!selectedFarm && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs sm:text-sm text-emerald-800 flex items-center justify-between">
          <span>🌾 Showing live meteorological radar for your current device location.</span>
          <Link to="/farms" className="font-semibold underline ml-2 shrink-0 text-emerald-900">
            Create Farm &rarr;
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.weather.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {selectedFarm
              ? `${selectedFarm.name} (${selectedFarm.district || selectedFarm.state || 'India'})`
              : 'Live Agricultural Radar (Device GPS Location)'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedFarm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPrefsModalOpen(true)}
              icon={<Sliders className="w-4 h-4" />}
            >
              {t.weather.alertPreferences}
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => loadWeather(true)}
            loading={refreshing}
            icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            {t.weather.refreshForecast}
          </Button>
        </div>
      </div>

      {/* Current Conditions Card */}
      {current && (
        <Card className="bg-gradient-to-br from-white to-slate-50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase text-farm-700 tracking-wider">
                  Live Agricultural Radar
                </span>
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900">
                    {current.temperatureC}°C
                  </span>
                  <span className="text-base sm:text-lg text-slate-600 font-medium">
                    {current.conditionText}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Refreshed: {new Date(weatherData.fetchedAt).toLocaleTimeString()} • Source: {weatherData.provider}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">Humidity</span>
                  <span className="font-bold text-slate-800 text-base">{current.humidityPct}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Wind Velocity</span>
                  <span className="font-bold text-slate-800 text-base">{current.windSpeedKmh} km/h</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Precipitation</span>
                  <span className="font-bold text-slate-800 text-base">{current.precipitationMm} mm</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts & AI Explanation */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Active Agricultural Risk Alerts</span>
          </h2>

          {alertExplanation?.summary && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-950 leading-relaxed">
              <span className="font-semibold block mb-1">Advisory Summary:</span>
              {alertExplanation.summary}
            </div>
          )}

          <div className="space-y-2">
            {alerts.map((a, i) => (
              <Alert key={i} type={a.severity === 'warning' ? 'warning' : 'info'} title={a.alertCode.replace(/_/g, ' ')}>
                <p className="text-xs sm:text-sm mt-0.5">{a.message}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-medium">
                  <span>Valid: {a.validFrom} to {a.validTo}</span>
                  <span>•</span>
                  <span>Source: {a.sourceIds?.join(', ')}</span>
                </div>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Forecast Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-farm-600" />
          <span>7-Day Agricultural Forecast</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {daily.map((day: any, idx: number) => {
            const dateObj = new Date(day.date);
            const isToday = idx === 0;
            const dayName = isToday
              ? 'Today'
              : dateObj.toLocaleDateString(undefined, { weekday: 'short' });
            const monthDay = dateObj.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });

            return (
              <Card key={day.date} className={`text-center p-3.5 ${isToday ? 'border-farm-400 ring-1 ring-farm-400 bg-farm-50/20' : ''}`}>
                <span className="text-xs font-bold text-slate-800 block">{dayName}</span>
                <span className="text-[10px] text-slate-400 block mb-2">{monthDay}</span>

                <CloudSun className="w-6 h-6 mx-auto text-amber-500 my-1" />

                <div className="text-xs font-semibold text-slate-800 mt-2">
                  <span>{day.temperatureMaxC}°</span>
                  <span className="text-slate-400 font-normal"> / {day.temperatureMinC}°</span>
                </div>

                <div className="text-[11px] text-slate-500 mt-2 space-y-0.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-center gap-1 text-sky-700 font-medium">
                    <Droplets className="w-3 h-3 text-sky-500" />
                    <span>{day.precipitationSumMm} mm</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {day.windSpeedMaxKmh} km/h wind
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Provider Attribution Note */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-700">Agronomic Weather Advisory Rules</p>
          <p className="leading-relaxed">
            Forecast data is retrieved from Open-Meteo through a server-side cached adapter. Alert conditions (heavy rain &gt;25mm, extreme heat &gt;38°C, frost &lt;4°C, and winds &gt;35 km/h) are derived algorithmically. Predictions represent decision support and not guarantees.
          </p>
        </div>
      </div>

      {/* Alert Preferences Configuration Modal */}
      <Modal isOpen={isPrefsModalOpen} onClose={() => setIsPrefsModalOpen(false)} title="Configure Alert Thresholds">
        <form onSubmit={handleSavePreferences} className="space-y-4">
          <p className="text-xs text-slate-500">
            Customize the sensitivity thresholds for automated weather alert generation on this farm.
          </p>

          <Input
            label="Heavy Rainfall Threshold (mm / day)"
            type="number"
            value={heavyRainMm}
            onChange={(e) => setHeavyRainMm(e.target.value)}
            unit="mm"
            helperText="Default: 25 mm"
          />

          <Input
            label="Extreme Heat Wave Threshold (°C)"
            type="number"
            value={extremeHeatC}
            onChange={(e) => setExtremeHeatC(e.target.value)}
            unit="°C"
            helperText="Default: 38 °C"
          />

          <Input
            label="Frost / Cold Warning Threshold (°C)"
            type="number"
            value={frostC}
            onChange={(e) => setFrostC(e.target.value)}
            unit="°C"
            helperText="Default: 4 °C"
          />

          <Input
            label="High Wind Gust Warning (km/h)"
            type="number"
            value={highWindKmh}
            onChange={(e) => setHighWindKmh(e.target.value)}
            unit="km/h"
            helperText="Default: 35 km/h"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsPrefsModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit">
              Save Thresholds
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


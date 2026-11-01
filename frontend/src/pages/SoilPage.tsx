import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Select } from '../components/ui/Select.js';
import { Card, CardHeader, CardContent } from '../components/ui/Card.js';
import { Modal } from '../components/ui/Modal.js';
import { Alert } from '../components/ui/Alert.js';
import { FreshnessBadge } from '../features/soil/FreshnessBadge.js';
import { SoilTrendChart } from '../features/soil/SoilTrendChart.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { FlaskConical, Plus, Trash2, Clock, CheckCircle } from 'lucide-react';

export const SoilPage: React.FC = () => {
  const { fields, selectedFarm } = useFarm();
  const { t, language } = useLanguage();

  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [moisturePct, setMoisturePct] = useState('');
  const [temperatureC, setTemperatureC] = useState('');
  const [ph, setPh] = useState('');
  const [nitrogenValue, setNitrogenValue] = useState('');
  const [phosphorusValue, setPhosphorusValue] = useState('');
  const [potassiumValue, setPotassiumValue] = useState('');
  const [npkUnit, setNpkUnit] = useState('kg_per_ha');
  const [source, setSource] = useState('manual');
  const [notes, setNotes] = useState('');

  // Default to first field
  useEffect(() => {
    if (fields.length > 0 && !selectedFieldId) {
      setSelectedFieldId(fields[0].id);
    }
  }, [fields, selectedFieldId]);

  const loadReadings = async () => {
    if (!selectedFieldId) return;
    try {
      setLoading(true);
      const data = await api.getFieldSoilReadings(selectedFieldId);
      setReadings(data);
    } catch (err) {
      console.warn('Failed to load soil readings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReadings();
  }, [selectedFieldId]);

  const handleOpenModal = () => {
    setMoisturePct('');
    setTemperatureC('');
    setPh('');
    setNitrogenValue('');
    setPhosphorusValue('');
    setPotassiumValue('');
    setNpkUnit('kg_per_ha');
    setSource('manual');
    setNotes('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFieldId) {
      setError('Please select a field first.');
      return;
    }

    const moisture = moisturePct ? parseFloat(moisturePct) : null;
    const phVal = ph ? parseFloat(ph) : null;
    const temp = temperatureC ? parseFloat(temperatureC) : null;

    // Range checks
    if (moisture !== null && (moisture < 0 || moisture > 100)) {
      setError('Moisture percentage must be between 0 and 100%.');
      return;
    }
    if (phVal !== null && (phVal < 0 || phVal > 14)) {
      setError('Soil pH must be between 0 and 14.');
      return;
    }
    if (temp !== null && (temp < -20 || temp > 70)) {
      setError('Soil temperature is out of realistic agricultural range (-20 to 70°C).');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.createSoilReading(selectedFieldId, {
        moisturePct: moisture ?? undefined,
        ph: phVal ?? undefined,
        temperatureC: temp ?? undefined,
        nitrogenValue: nitrogenValue ? parseFloat(nitrogenValue) : undefined,
        phosphorusValue: phosphorusValue ? parseFloat(phosphorusValue) : undefined,
        potassiumValue: potassiumValue ? parseFloat(potassiumValue) : undefined,
        npkUnit: npkUnit as any,
        source: source as any,
        notes: notes || undefined,
        observedAt: new Date().toISOString(),
      });
      await loadReadings();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save soil reading.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (readingId: string) => {
    if (!window.confirm('Delete this soil reading observation?')) return;
    try {
      await api.deleteSoilReading(readingId);
      await loadReadings();
    } catch (err: any) {
      alert(err.message || 'Failed to delete reading.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.soil.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.soil.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {fields.length > 0 && (
            <select
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-farm-500"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.areaValue || ''} {f.areaUnit})
                </option>
              ))}
            </select>
          )}

          <Button onClick={handleOpenModal} icon={<Plus className="w-4 h-4" />}>
            {t.soil.addReading}
          </Button>
        </div>
      </div>

      {fields.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="w-8 h-8" />}
          title="No Fields Available"
          description="You need to create a field in your farm profile before recording soil observations."
          action={
            <Button onClick={() => (window.location.href = '/farms')}>
              Go to Farms & Fields
            </Button>
          }
        />
      ) : (
        <>
          {/* Timeline Chart */}
          <SoilTrendChart readings={readings} />

          {/* Readings Table */}
          <Card>
            <CardHeader
              title={t.soil.recentReadings}
              subtitle="Chronological log of moisture, pH, and nutrient records"
            />
            <CardContent className="p-0">
              {readings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Observation Date</th>
                        <th className="py-3 px-4">Moisture</th>
                        <th className="py-3 px-4">pH</th>
                        <th className="py-3 px-4">Temp</th>
                        <th className="py-3 px-4">N - P - K</th>
                        <th className="py-3 px-4">Source / Age</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {readings.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 text-slate-800 font-medium">
                            {new Date(r.observedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-farm-700">
                            {r.moisturePct !== null ? `${r.moisturePct}%` : '—'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-amber-700">
                            {r.ph !== null ? r.ph : '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {r.temperatureC !== null ? `${r.temperatureC}°C` : '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {r.nitrogenValue !== null || r.phosphorusValue !== null || r.potassiumValue !== null
                              ? `${r.nitrogenValue ?? '-'}/${r.phosphorusValue ?? '-'}/${r.potassiumValue ?? '-'} ${r.npkUnit || ''}`
                              : '—'}
                          </td>
                          <td className="py-3 px-4">
                            <FreshnessBadge observedAt={r.observedAt} source={r.source} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDelete(r.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs sm:text-sm text-slate-400">
                  {t.soil.noReadings}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Reading Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Soil Reading">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert type="error">{error}</Alert>}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Moisture % (0 - 100)"
              type="number"
              step="0.1"
              value={moisturePct}
              onChange={(e) => setMoisturePct(e.target.value)}
              placeholder="e.g., 55.4"
              unit="%"
            />
            <Input
              label="Soil pH (0 - 14)"
              type="number"
              step="0.1"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              placeholder="e.g., 6.8"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Soil Temperature (°C)"
              type="number"
              step="0.1"
              value={temperatureC}
              onChange={(e) => setTemperatureC(e.target.value)}
              placeholder="e.g., 28.5"
              unit="°C"
            />
            <Select
              label="Measurement Source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              options={[
                { value: 'manual', label: 'Manual Field Test' },
                { value: 'sensor', label: 'IoT Sensor Probe' },
                { value: 'import', label: 'Soil Health Card Import' },
              ]}
            />
          </div>

          <div className="border-t border-slate-100 pt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
              Nutrients (NPK - Optional)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Nitrogen (N)"
                type="number"
                step="0.1"
                value={nitrogenValue}
                onChange={(e) => setNitrogenValue(e.target.value)}
                placeholder="120"
              />
              <Input
                label="Phosphorus (P)"
                type="number"
                step="0.1"
                value={phosphorusValue}
                onChange={(e) => setPhosphorusValue(e.target.value)}
                placeholder="22"
              />
              <Input
                label="Potassium (K)"
                type="number"
                step="0.1"
                value={potassiumValue}
                onChange={(e) => setPotassiumValue(e.target.value)}
                placeholder="180"
              />
            </div>
          </div>

          <Input
            label="Field Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Taken 2 days after irrigation, upper 15cm soil depth"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={submitting}>
              {t.common.save}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


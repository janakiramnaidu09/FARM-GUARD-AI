import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Select } from '../components/ui/Select.js';
import { Card, CardHeader, CardContent } from '../components/ui/Card.js';
import { Modal } from '../components/ui/Modal.js';
import { Alert } from '../components/ui/Alert.js';
import { Badge } from '../components/ui/Badge.js';
import { ArrowLeft, Plus, MapPin, Trash2, Sprout, Droplet } from 'lucide-react';

export const FarmDetailPage: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [farm, setFarm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Field Form state
  const [fieldName, setFieldName] = useState('');
  const [areaValue, setAreaValue] = useState('');
  const [areaUnit, setAreaUnit] = useState('acre');
  const [soilType, setSoilType] = useState('Clay loam');
  const [currentCropCode, setCurrentCropCode] = useState('rice');
  const [plantingDate, setPlantingDate] = useState('');
  const [irrigationType, setIrrigationType] = useState('Borewell / Drip');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    if (!farmId) return;
    try {
      setLoading(true);
      const f = await api.getFarm(farmId);
      setFarm(f);
      setFields(f.fields || []);
    } catch (err) {
      console.warn('Failed to load farm:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [farmId]);

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId || !fieldName) {
      setError('Please provide a field name.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.createField(farmId, {
        name: fieldName,
        areaValue: areaValue ? parseFloat(areaValue) : undefined,
        areaUnit: areaUnit as any,
        soilType: soilType || undefined,
        currentCropCode: currentCropCode || undefined,
        plantingDate: plantingDate || undefined,
        irrigationType: irrigationType || undefined,
        notes: notes || undefined,
      });
      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add field.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteField = async (fieldId: string, name: string) => {
    if (!window.confirm(`Delete field "${name}"?`)) return;
    try {
      await api.deleteField(fieldId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete field.');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-sm text-slate-500">{t.common.loading}</div>;
  }

  if (!farm) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-600">Farm record not found or unauthorized.</p>
        <Link to="/farms">
          <Button variant="outline">&larr; Back to Farms</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/farms">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            {t.common.back}
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{farm.name}</h1>
          <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-farm-600" />
            <span>{farm.locality ? `${farm.locality}, ` : ''}{farm.district}, {farm.state}</span>
          </p>
        </div>
      </div>

      {/* Farm Overview Card */}
      <Card>
        <CardContent className="p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 block text-xs">Total Fields</span>
            <span className="font-bold text-slate-800 text-base">{fields.length}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Country & State</span>
            <span className="font-bold text-slate-800 text-base">{farm.state || 'India'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">GPS Coordinates</span>
            <span className="font-bold text-slate-800 text-base">
              {farm.latitude ? `${farm.latitude.toFixed(2)}, ${farm.longitude?.toFixed(2)}` : 'Unset'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Timezone</span>
            <span className="font-bold text-slate-800 text-base">{farm.timezone || 'Asia/Kolkata'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Fields List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Fields / Plots (మడులు)</h2>
            <p className="text-xs text-slate-500">Add sub-plots to record field-specific soil readings and crop rotations</p>
          </div>
          <Button size="sm" onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Add Field
          </Button>
        </div>

        {fields.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => (
              <Card key={f.id} className="border-slate-200">
                <CardHeader
                  title={f.name}
                  subtitle={f.areaValue ? `${f.areaValue} ${f.areaUnit}` : 'Area not specified'}
                  action={
                    <button
                      type="button"
                      onClick={() => handleDeleteField(f.id, f.name)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  }
                />
                <CardContent className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-farm-600 shrink-0" />
                    <span>
                      Crop: <strong className="text-slate-800">{f.currentCropCode || 'Fallow / Unspecified'}</strong>
                      {f.plantingDate && ` (Sown: ${f.plantingDate})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Irrigation: {f.irrigationType || 'Rainfed'}</span>
                  </div>
                  <div className="text-slate-500">
                    <span>Soil Type: </span>
                    <Badge size="sm" variant="earth">
                      {f.soilType || 'Mixed Loam'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-2">
            <p className="text-sm text-slate-500">No fields added to this farm yet.</p>
            <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)}>
              + Add First Field
            </Button>
          </div>
        )}
      </div>

      {/* Add Field Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Field / Plot to Farm">
        <form onSubmit={handleAddField} className="space-y-4">
          {error && <Alert type="error">{error}</Alert>}

          <Input
            label="Field Name (మడి / చేను పేరు)"
            required
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            placeholder="e.g., North Wet Field (వరి చేను - ఉత్తర మడి)"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Area Value"
              type="number"
              step="0.1"
              value={areaValue}
              onChange={(e) => setAreaValue(e.target.value)}
              placeholder="e.g., 3.5"
            />
            <Select
              label="Unit"
              value={areaUnit}
              onChange={(e) => setAreaUnit(e.target.value)}
              options={[
                { value: 'acre', label: 'Acres (ఎకరాలు)' },
                { value: 'hectare', label: 'Hectares' },
                { value: 'gunta', label: 'Guntas (గుంటలు)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Soil Type"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              placeholder="e.g., Clay loam / Black soil"
            />
            <Input
              label="Current Crop Code"
              value={currentCropCode}
              onChange={(e) => setCurrentCropCode(e.target.value)}
              placeholder="e.g., rice / cotton / maize"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Planting / Sowing Date"
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
            />
            <Input
              label="Irrigation Method"
              value={irrigationType}
              onChange={(e) => setIrrigationType(e.target.value)}
              placeholder="e.g., Drip / Borewell flood"
            />
          </div>

          <Input
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Field drainage notes, slope, or previous crop history"
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


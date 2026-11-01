import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFarm } from '../context/FarmContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Card, CardHeader, CardContent } from '../components/ui/Card.js';
import { Modal } from '../components/ui/Modal.js';
import { Alert } from '../components/ui/Alert.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { Tractor, Plus, MapPin, Navigation, ArrowRight, Trash2 } from 'lucide-react';

export const FarmsPage: React.FC = () => {
  const { farms, selectedFarm, selectFarm, refreshFarms } = useFarm();
  const { t, language } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [state, setState] = useState('Telangana');
  const [district, setDistrict] = useState('');
  const [locality, setLocality] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenModal = () => {
    setName('');
    setState('Telangana');
    setDistrict('');
    setLocality('');
    setLatitude('');
    setLongitude('');
    setNotes('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
      },
      (err) => {
        setError(`Unable to retrieve location: ${err.message}`);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !state || !district) {
      setError('Please provide farm name, state, and district.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.createFarm({
        name,
        countryCode: 'IN',
        state,
        district,
        locality: locality || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        locationSource: latitude ? 'browser_gps' : 'manual',
        timezone: 'Asia/Kolkata',
        notes: notes || undefined,
      });
      await refreshFarms();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create farm.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (farmId: string, farmName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${farmName} and all its fields?`)) {
      return;
    }
    try {
      await api.deleteFarm(farmId);
      await refreshFarms();
    } catch (err: any) {
      alert(err.message || 'Failed to delete farm.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.nav.farms}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'te'
              ? 'మీ వ్యవసాయ భూములు మరియు సంబంధిత మడుల నిర్వహణ'
              : 'Manage your agricultural holdings, fields, and microclimate coordinates'}
          </p>
        </div>
        <Button onClick={handleOpenModal} icon={<Plus className="w-4 h-4" />}>
          {language === 'te' ? '+ కొత్త పొలం జోడించండి' : '+ Add New Farm'}
        </Button>
      </div>

      {farms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => {
            const isSelected = selectedFarm?.id === farm.id;
            return (
              <Card
                key={farm.id}
                className={`relative transition-all ${
                  isSelected ? 'ring-2 ring-farm-500 border-farm-500' : ''
                }`}
              >
                <CardHeader
                  title={farm.name}
                  subtitle={`${farm.district || ''}, ${farm.state || ''}`}
                  action={
                    <button
                      type="button"
                      onClick={() => handleDelete(farm.id, farm.name)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title={t.common.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  }
                />
                <CardContent className="space-y-3">
                  <div className="text-xs text-slate-600 space-y-1">
                    {farm.locality && <p>Locality: {farm.locality}</p>}
                    <p className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-farm-600" />
                      <span>
                        {farm.latitude ? `${farm.latitude.toFixed(4)}, ${farm.longitude?.toFixed(4)}` : 'Coordinates unset'}
                      </span>
                    </p>
                    {farm.notes && <p className="text-slate-500 italic mt-1">"{farm.notes}"</p>}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => selectFarm(farm)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-farm-100 text-farm-800'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ Active Farm' : 'Set as Active'}
                    </button>

                    <Link
                      to={`/farms/${farm.id}`}
                      className="text-xs font-semibold text-farm-700 hover:text-farm-800 flex items-center gap-1"
                    >
                      <span>Manage Fields</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Tractor className="w-8 h-8" />}
          title={language === 'te' ? 'ఇంకా పొలాలు నమోదు కాలేదు' : 'No farms added yet'}
          description={t.dashboard.addFarmPrompt}
          action={
            <Button onClick={handleOpenModal} icon={<Plus className="w-4 h-4" />}>
              Add Your First Farm
            </Button>
          }
        />
      )}

      {/* Create Farm Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Farm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert type="error">{error}</Alert>}

          <Input
            label="Farm Name (పొలం పేరు)"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Sri Venkateswara Farm (శ్రీ వెంకటేశ్వర క్షేత్రం)"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="State (రాష్ట్రం)"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Telangana / Andhra Pradesh"
            />
            <Input
              label="District (జిల్లా)"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g., Siddipet / Guntur"
            />
          </div>

          <Input
            label="Village / Town / Locality (గ్రామం / మండలం)"
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            placeholder="e.g., Gajwel"
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-medium text-slate-700">
                GPS Coordinates (Optional for precision weather)
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-xs font-semibold text-farm-700 hover:text-farm-800 flex items-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Use My Location</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Latitude (e.g. 17.8524)"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
              <Input
                placeholder="Longitude (e.g. 78.6833)"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>

          <Input
            label="Notes / Irrigation sources"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., 2 borewells, canal water access, black soil"
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


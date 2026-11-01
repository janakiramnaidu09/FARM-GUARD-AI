import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardHeader, CardContent } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Alert } from '../components/ui/Alert.js';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Sprout,
  Droplet,
  Compass,
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { selectedFarm, fields } = useFarm();
  const { t, language } = useLanguage();

  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [plannedSeason, setPlannedSeason] = useState<string>('kharif');
  const [hasIrrigation, setHasIrrigation] = useState<boolean>(true);
  const [overridePh, setOverridePh] = useState<string>('');
  const [overrideMoisture, setOverrideMoisture] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    if (!selectedFarm) {
      setError('Please select a farm first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.recommendCrops(selectedFarm.id, {
        fieldId: selectedFieldId || undefined,
        plannedSeason: plannedSeason as any,
        hasIrrigation,
        soilOverrides: {
          ph: overridePh ? parseFloat(overridePh) : undefined,
          moisturePct: overrideMoisture ? parseFloat(overrideMoisture) : undefined,
        },
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const suitabilityBadgeVariant = (level: string) => {
    switch (level) {
      case 'highly_suitable':
        return 'success';
      case 'moderately_suitable':
        return 'warning';
      case 'marginally_suitable':
        return 'earth';
      default:
        return 'neutral';
    }
  };

  const suitabilityLabel = (level: string) => {
    switch (level) {
      case 'highly_suitable':
        return language === 'te' ? 'అత్యంత అనుకూలం (Highly Suitable)' : 'Highly Suitable';
      case 'moderately_suitable':
        return language === 'te' ? 'మధ్యస్థ అనుకూలం (Moderately Suitable)' : 'Moderately Suitable';
      case 'marginally_suitable':
        return language === 'te' ? 'స్వల్ప అనుకూలం (Marginally Suitable)' : 'Marginally Suitable';
      default:
        return language === 'te' ? 'సిఫార్సు చేయబడదు (Not Recommended)' : 'Not Recommended';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.crops.title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.crops.subtitle}</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Query Form */}
      <Card>
        <CardHeader
          title="Agricultural Planning Parameters"
          subtitle="Configure season, irrigation, and field soil factors"
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t.crops.fieldLabel}
              </label>
              <select
                value={selectedFieldId}
                onChange={(e) => setSelectedFieldId(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900"
              >
                <option value="">General Farm Plot</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.soilType || 'Soil unspecified'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t.crops.seasonLabel}
              </label>
              <select
                value={plannedSeason}
                onChange={(e) => setPlannedSeason(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900"
              >
                <option value="kharif">{t.crops.seasonKharif}</option>
                <option value="rabi">{t.crops.seasonRabi}</option>
                <option value="zaid">{t.crops.seasonZaid}</option>
                <option value="all_year">{t.crops.seasonAllYear}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t.crops.irrigationLabel}
              </label>
              <div className="flex items-center h-10 gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-800">
                  <input
                    type="checkbox"
                    checked={hasIrrigation}
                    onChange={(e) => setHasIrrigation(e.target.checked)}
                    className="w-4 h-4 text-farm-600 rounded border-slate-300 focus:ring-farm-500"
                  />
                  <span>Assured irrigation available</span>
                </label>
              </div>
            </div>
          </div>

          {/* Optional Soil Overrides */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              Optional Soil Overrides / Testing Scenarios
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Override Soil pH</label>
                <input
                  type="number"
                  step="0.1"
                  value={overridePh}
                  onChange={(e) => setOverridePh(e.target.value)}
                  placeholder="e.g. 6.8 (default uses latest reading)"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Override Soil Moisture %</label>
                <input
                  type="number"
                  step="0.1"
                  value={overrideMoisture}
                  onChange={(e) => setOverrideMoisture(e.target.value)}
                  placeholder="e.g. 55% (default uses latest reading)"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            loading={loading}
            className="w-full sm:w-auto shadow-sm gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? t.crops.calculating : t.crops.calculateButton}</span>
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Missing inputs alert */}
          {result.explanation?.missingInputs?.length > 0 && (
            <Alert type="warning" title={t.crops.missingInputsTitle}>
              <p className="text-xs sm:text-sm">
                Rankings calculated without: <strong>{result.explanation.missingInputs.join(', ')}</strong>.
                For enhanced precision, record a soil measurement or perform a laboratory soil health test.
              </p>
            </Alert>
          )}

          {/* AI Explanation Summary */}
          {result.explanation?.summary && (
            <Card className="bg-gradient-to-r from-farm-50/50 to-white border-farm-200">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center gap-2 text-farm-800 font-bold text-xs uppercase tracking-wider">
                  <Compass className="w-4 h-4" />
                  <span>Agronomic Suitability Summary</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {result.explanation.summary}
                </p>
                {result.explanation.uncertainty && (
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    Note: {result.explanation.uncertainty}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ranked Crop Cards */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-farm-600" />
              <span>{t.crops.rankedResults}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.rankedCrops?.map((crop: any, idx: number) => {
                const displayName = language === 'te' ? crop.cropName.te : crop.cropName.en;
                const botanical = crop.cropName.botanical;

                return (
                  <Card key={crop.cropCode} className="border-slate-200/90 hover:shadow-md transition-shadow">
                    <CardHeader
                      title={
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span>{displayName}</span>
                        </div>
                      }
                      subtitle={botanical ? `Botanical: ${botanical}` : undefined}
                      action={
                        <Badge variant={suitabilityBadgeVariant(crop.suitabilityLevel)}>
                          {crop.overallScore}% • {suitabilityLabel(crop.suitabilityLevel).split('(')[0].trim()}
                        </Badge>
                      }
                    />
                    <CardContent className="space-y-3 text-xs">
                      {/* Factor Scores */}
                      <div className="grid grid-cols-5 gap-1 text-center py-2 bg-slate-50 rounded-lg">
                        <div>
                          <span className="text-[10px] text-slate-400 block">pH</span>
                          <span className="font-bold text-slate-700">{crop.scores.phScore}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Season</span>
                          <span className="font-bold text-slate-700">{crop.scores.seasonScore}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Water</span>
                          <span className="font-bold text-slate-700">{crop.scores.moistureScore}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Temp</span>
                          <span className="font-bold text-slate-700">{crop.scores.temperatureScore}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">NPK</span>
                          <span className="font-bold text-slate-700">{crop.scores.npkScore}%</span>
                        </div>
                      </div>

                      {/* Matching Factors */}
                      {crop.matchingFactors?.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-semibold text-emerald-800 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t.crops.matchingFactors}:</span>
                          </span>
                          <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                            {crop.matchingFactors.map((m: string, i: number) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Limiting Factors */}
                      {crop.limitingFactors?.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-slate-100">
                          <span className="font-semibold text-amber-800 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>{t.crops.limitingFactors}:</span>
                          </span>
                          <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                            {crop.limitingFactors.map((l: string, i: number) => (
                              <li key={i}>{l}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Sources */}
                      {crop.sources?.length > 0 && (
                        <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span className="truncate">Source: {crop.sources.map((s: any) => s.publisher || s.title).join(', ')}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


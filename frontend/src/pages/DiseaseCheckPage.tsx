import React, { useState, useRef } from 'react';
import { useFarm } from '../context/FarmContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardHeader, CardContent } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Alert } from '../components/ui/Alert.js';
import {
  UploadCloud,
  Camera,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileQuestion,
  RefreshCw,
  ShieldAlert,
  Sprout,
  Info,
} from 'lucide-react';

export const DiseaseCheckPage: React.FC = () => {
  const { fields } = useFarm();
  const { t, language } = useLanguage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [cropHint, setCropHint] = useState<string>('rice');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 8 * 1024 * 1024) {
        setError('Selected file exceeds maximum limit of 8 MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleScanSubmit = async () => {
    if (!selectedFile) {
      setError('Please select or capture a leaf photo first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (selectedFieldId) formData.append('fieldId', selectedFieldId);
      if (cropHint) formData.append('cropCode', cropHint);

      const res = await api.submitDiseaseAssessment(formData);
      setResult(res.diagnostic || res.assessment);
    } catch (err: any) {
      setError(err.message || 'Diagnostic assessment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.disease.title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.disease.subtitle}</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload & Capture Card */}
        <Card>
          <CardHeader title="1. Capture or Select Leaf Image" subtitle="Clear, focused photo in bright natural daylight" />
          <CardContent className="space-y-4">
            {/* Upload Area */}
            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-farm-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-farm-50/30 flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-farm-100 text-farm-700 flex items-center justify-center">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.disease.uploadPrompt}</p>
                  <p className="text-xs text-slate-500 mt-1">{t.disease.formatNotice}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    icon={<Camera className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                  >
                    Camera
                  </Button>
                  <Button type="button" size="sm" variant="outline">
                    Browse Files
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center max-h-72">
                <img src={previewUrl} alt="Leaf Preview" className="max-h-72 w-auto object-contain" />
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-3 right-3 bg-slate-900/70 hover:bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg backdrop-blur-sm transition-colors"
                >
                  Change Photo
                </button>
              </div>
            )}

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Context Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Crop (పంట)</label>
                <select
                  value={cropHint}
                  onChange={(e) => setCropHint(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs sm:text-sm text-slate-900"
                >
                  <option value="rice">Rice (వరి)</option>
                  <option value="cotton">Cotton (పత్తి)</option>
                  <option value="tomato">Tomato (టొమాటో)</option>
                  <option value="chilli">Chilli (మిరప)</option>
                  <option value="maize">Maize (మొక్కజొన్న)</option>
                  <option value="other">Other / General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Field (ఐచ్ఛికం)</label>
                <select
                  value={selectedFieldId}
                  onChange={(e) => setSelectedFieldId(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs sm:text-sm text-slate-900"
                >
                  <option value="">None / General</option>
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={handleScanSubmit}
              loading={loading}
              disabled={!selectedFile}
              className="w-full shadow-md"
            >
              {loading ? t.disease.scanning : t.disease.scanButton}
            </Button>

            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>Images are stored privately and never published publicly.</span>
            </p>
          </CardContent>
        </Card>

        {/* Diagnostic Assessment Result Card */}
        <Card className="flex flex-col">
          <CardHeader
            title="2. Diagnostic Result & Next Steps"
            subtitle="Decision support evaluated against trained models"
          />
          <CardContent className="flex-1 flex flex-col justify-between">
            {result ? (
              <div className="space-y-4">
                {/* Status Header */}
                <div className="p-4 rounded-xl border bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Diagnosis Status
                    </span>
                    <Badge
                      variant={
                        result.status === 'completed'
                          ? 'success'
                          : result.status === 'uncertain'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {result.status === 'completed'
                        ? t.disease.statusCompleted
                        : result.status === 'uncertain'
                        ? t.disease.statusUncertain
                        : result.status === 'unsupported'
                        ? t.disease.statusUnsupported
                        : t.disease.statusFailed}
                    </Badge>
                  </div>

                  {result.status === 'completed' && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {language === 'te'
                          ? result.predictedClassDisplayName?.te || result.predictedClass
                          : result.predictedClassDisplayName?.en || result.predictedClass}
                      </h3>
                      {result.confidence && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs text-slate-600 font-medium">
                            <span>{t.disease.confidenceLabel}</span>
                            <span>{(result.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-farm-600 h-full rounded-full transition-all"
                              style={{ width: `${result.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {result.abstentionReason && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
                      <strong>Abstention Notice: </strong>
                      {result.abstentionReason}
                    </div>
                  )}
                </div>

                {/* Next Steps for Farmer */}
                {result.nextSteps && result.nextSteps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {t.disease.nextStepsTitle}
                    </h4>
                    <div className="space-y-2">
                      {result.nextSteps.map((step: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-slate-200 bg-white shadow-xs text-xs space-y-1"
                        >
                          <span className="font-semibold text-slate-900 block">{step.action}</span>
                          <p className="text-slate-600 leading-relaxed">
                            {language === 'te' ? step.descriptionTe : step.descriptionEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety Warning */}
                <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>{result.uncertaintyWarning || t.disease.disclaimer}</span>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <FileQuestion className="w-10 h-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Awaiting Leaf Submission</p>
                <p className="text-xs max-w-xs">
                  Upload a leaf photo on the left and tap "Analyze Leaf Disease" to run the classification model.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../lib/api.js';
import { Card, CardHeader, CardContent } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';
import {
  History as HistoryIcon,
  Filter,
  ScanLine,
  FlaskConical,
  CloudSun,
  Sparkles,
  MessageSquare,
  Clock,
  Eye,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { t, language } = useLanguage();

  const [filterType, setFilterType] = useState<string>('all');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const loadHistory = async (type = filterType) => {
    try {
      setLoading(true);
      const res = await api.getHistory(type);
      setItems(res.items || []);
    } catch (err) {
      console.warn('History load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(filterType);
  }, [filterType]);

  const filterOptions = [
    { value: 'all', label: t.history.filterAll, icon: Filter },
    { value: 'disease', label: t.history.filterDisease, icon: ScanLine },
    { value: 'soil', label: t.history.filterSoil, icon: FlaskConical },
    { value: 'recommendation', label: t.history.filterRecommendation, icon: Sparkles },
    { value: 'conversation', label: t.history.filterConversation, icon: MessageSquare },
  ];

  const typeIcon = (type: string) => {
    switch (type) {
      case 'disease':
        return <ScanLine className="w-4 h-4 text-emerald-600" />;
      case 'soil':
        return <FlaskConical className="w-4 h-4 text-amber-600" />;
      case 'recommendation':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'conversation':
        return <MessageSquare className="w-4 h-4 text-sky-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.history.title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.history.subtitle}</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((opt) => {
          const Icon = opt.icon;
          const active = filterType === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilterType(opt.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                active
                  ? 'bg-farm-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* History Items List */}
      <Card>
        <CardContent className="p-0 divide-y divide-slate-100">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {typeIcon(item.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                      <Badge size="sm" variant={item.type === 'disease' ? 'warning' : item.type === 'soil' ? 'info' : 'earth'}>
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>
                    {item.farmName && (
                      <p className="text-[11px] text-slate-400">
                        {item.farmName} {item.fieldName ? `• ${item.fieldName}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedItem(item)}
                    icon={<Eye className="w-3.5 h-3.5" />}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs sm:text-sm text-slate-400">
              {loading ? t.common.loading : t.history.empty}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || 'Record Details'}
      >
        {selectedItem && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-slate-600">
              <p>
                <strong>Type: </strong> {selectedItem.type.toUpperCase()}
              </p>
              <p>
                <strong>Recorded: </strong> {new Date(selectedItem.timestamp).toLocaleString()}
              </p>
              {selectedItem.farmName && (
                <p>
                  <strong>Farm / Field: </strong> {selectedItem.farmName} {selectedItem.fieldName ? `• ${selectedItem.fieldName}` : ''}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-slate-800 block text-xs uppercase tracking-wider">
                Raw JSON Payload
              </span>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono max-h-64">
                {JSON.stringify(selectedItem.details, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedItem(null)}>
                {t.common.close}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};


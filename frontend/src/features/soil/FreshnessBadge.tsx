import React from 'react';
import { Badge } from '../../components/ui/Badge.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Clock, Cpu, UserCheck, FileSpreadsheet } from 'lucide-react';

interface FreshnessBadgeProps {
  observedAt: string;
  source?: 'manual' | 'sensor' | 'import';
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({ observedAt, source }) => {
  const { t } = useLanguage();

  const observedDate = new Date(observedAt);
  const diffDays = Math.floor((Date.now() - observedDate.getTime()) / (1000 * 60 * 60 * 24));

  let freshnessText = t.common.freshness.fresh;
  let variant: 'success' | 'warning' | 'danger' = 'success';

  if (diffDays >= 30) {
    freshnessText = t.common.freshness.veryStale;
    variant = 'danger';
  } else if (diffDays >= 7) {
    freshnessText = `${diffDays} days ago (${t.common.freshness.stale})`;
    variant = 'warning';
  } else if (diffDays === 0) {
    freshnessText = 'Today';
  } else {
    freshnessText = `${diffDays}d ago`;
  }

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <Badge variant={variant} size="sm" className="gap-1">
        <Clock className="w-3 h-3" />
        <span>{freshnessText}</span>
      </Badge>

      {source && (
        <Badge variant={source === 'sensor' ? 'info' : 'neutral'} size="sm" className="gap-1">
          {source === 'sensor' ? (
            <>
              <Cpu className="w-3 h-3" />
              <span>IoT Sensor</span>
            </>
          ) : source === 'import' ? (
            <>
              <FileSpreadsheet className="w-3 h-3" />
              <span>Lab Card</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3 h-3" />
              <span>Manual</span>
            </>
          )}
        </Badge>
      )}
    </div>
  );
};


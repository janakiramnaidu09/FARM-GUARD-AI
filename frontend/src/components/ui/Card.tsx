import React from 'react';

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden transition-all ${
      onClick ? 'cursor-pointer hover:border-farm-400 hover:shadow-md' : ''
    } ${className}`}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => (
  <div className={`p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-4 ${className}`}>
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`p-4 sm:p-5 ${className}`}>{children}</div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`p-3 sm:p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm ${className}`}>
    {children}
  </div>
);


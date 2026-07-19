import React from 'react';
import { Clock3, AlertTriangle, AlertCircle, CircleCheckBig } from 'lucide-react';

const AlertCard = ({ alert }) => {
  const severityConfig = {
    critical: {
      border: 'border-[#ef4444]/70',
      badge: 'status-chip-critical',
      icon: AlertTriangle,
      text: 'text-[#fca5a5]',
      subtext: 'text-[#fda4af]',
    },
    warning: {
      border: 'border-[#f59e0b]/70',
      badge: 'status-chip-warning',
      icon: AlertCircle,
      text: 'text-[#fcd34d]',
      subtext: 'text-[#fde68a]',
    },
    success: {
      border: 'border-[#22c55e]/70',
      badge: 'status-chip-success',
      icon: CircleCheckBig,
      text: 'text-[#86efac]',
      subtext: 'text-[#bbf7d0]',
    },
  };

  const config = severityConfig[alert.severity] || severityConfig.success;
  const Icon = config.icon;

  return (
    <div className={`panel-hover rounded-2xl border bg-[#0d1117] p-4 ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#161b22] ${config.text}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-[#f8fbff]">{alert.title}</h4>
            <span className={`status-chip ${config.badge}`}>{alert.severity}</span>
          </div>
          <p className={`mb-3 text-sm ${config.subtext}`}>{alert.message}</p>
          <div className="flex items-center gap-2 text-xs text-[#8b949e]">
            <Clock3 className="h-3.5 w-3.5" />
            <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;

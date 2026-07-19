import React from 'react';
import { Clock } from 'lucide-react';

const AlertCard = ({ alert }) => {
  const severityConfig = {
    critical: {
      bg: 'from-danger-50 to-danger-100',
      border: 'border-danger-200',
      emoji: '🔴',
      badge: 'status-danger',
      text: 'text-danger-900',
      subtext: 'text-danger-700',
    },
    warning: {
      bg: 'from-warning-50 to-warning-100',
      border: 'border-warning-200',
      emoji: '🟠',
      badge: 'status-warning',
      text: 'text-warning-900',
      subtext: 'text-warning-700',
    },
    success: {
      bg: 'from-success-50 to-success-100',
      border: 'border-success-200',
      emoji: '🟢',
      badge: 'status-success',
      text: 'text-success-900',
      subtext: 'text-success-700',
    },
  };

  const config = severityConfig[alert.severity] || severityConfig.success;

  return (
    <div className={`card-modern bg-gradient-to-br ${config.bg} border ${config.border} p-4`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-lg mt-1">
          {config.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={`font-semibold text-sm ${config.text}`}>
              {alert.title}
            </h4>
            <span className={`status-badge ${config.badge} text-xs flex-shrink-0`}>
              {alert.severity}
              {alert.severity === 'critical' && <span className="w-1.5 h-1.5 bg-current rounded-full ml-1 animate-pulse"></span>}
            </span>
          </div>
          <p className={`text-sm mb-2 ${config.subtext}`}>
            {alert.message}
          </p>
          <div className="flex items-center gap-1.5 text-xs opacity-70">
            <Clock className="w-3 h-3" />
            <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;

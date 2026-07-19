import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const KPICard = ({ title, value, unit = '', trend = null, color = 'primary', threshold = null, critical = false }) => {
  const isTrendPositive = trend ? trend > 0 : null;
  const isAboveThreshold = threshold && value > threshold;

  const colorMap = {
    primary: {
      bg: 'from-primary-50 to-primary-100',
      border: 'border-primary-200',
      text: 'text-primary-900',
      value: 'text-primary-700',
      icon: 'bg-primary-100 text-primary-600',
      trend: 'text-primary-600',
      emoji: '📊',
    },
    success: {
      bg: 'from-success-50 to-success-100',
      border: 'border-success-200',
      text: 'text-success-900',
      value: 'text-success-700',
      icon: 'bg-success-100 text-success-600',
      trend: 'text-success-600',
      emoji: '✅',
    },
    warning: {
      bg: 'from-warning-50 to-warning-100',
      border: 'border-warning-200',
      text: 'text-warning-900',
      value: 'text-warning-700',
      icon: 'bg-warning-100 text-warning-600',
      trend: 'text-warning-600',
      emoji: '📦',
    },
    danger: {
      bg: 'from-danger-50 to-danger-100',
      border: 'border-danger-200',
      text: 'text-danger-900',
      value: 'text-danger-700',
      icon: 'bg-danger-100 text-danger-600',
      trend: 'text-danger-600',
      emoji: '⚠️',
    },
  };

  const config = colorMap[color] || colorMap.primary;

  return (
    <div className={`card-modern bg-gradient-to-br ${config.bg} border ${config.border} p-6 group`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${config.icon}`}>
            {config.emoji}
          </div>
          <p className={`text-sm font-semibold ${config.text}`}>{title}</p>
        </div>
        {critical && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-danger-100 text-danger-700 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 bg-danger-600 rounded-full animate-pulse"></span>
            Critical
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 mb-4">
        <h3 className={`text-3xl font-bold ${config.value} tabular-nums`}>
          {value}
        </h3>
        {unit && (
          <span className={`text-base font-medium ${config.text} opacity-70`}>
            {unit}
          </span>
        )}
      </div>

      {(trend !== null || isAboveThreshold) && (
        <div className={`flex items-center gap-3 pt-3 border-t ${config.border}`}>
          {trend !== null && (
            <div className={`flex items-center gap-1.5 text-sm font-medium ${
              isTrendPositive ? 'text-danger-600' : 'text-success-600'
            }`}>
              {isTrendPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(trend)}% {isTrendPositive ? 'increase' : 'decrease'}</span>
            </div>
          )}
          {isAboveThreshold && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-warning-600 ml-auto">
              <AlertCircle className="w-4 h-4" />
              <span>Above threshold</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KPICard;

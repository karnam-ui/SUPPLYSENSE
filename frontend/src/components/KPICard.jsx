import React from 'react';
import { AlertTriangle, Activity, Package, TrendingUp, TrendingDown, AlertCircle, LayoutDashboard } from 'lucide-react';

const KPICard = ({ title, value, unit = '', trend = null, color = 'primary', threshold = null, critical = false, icon: IconProp }) => {
  const isTrendPositive = trend ? trend > 0 : null;
  const isAboveThreshold = threshold && value > threshold;

  const colorMap = {
    primary: {
      iconBg: 'bg-[#1d4ed8]/20 text-[#60a5fa]',
      accent: 'text-[#60a5fa]',
      border: critical ? 'border-[#ef4444]/50' : 'border-[#30363d]',
      value: 'text-[#f8fbff]',
      muted: 'text-[#8b949e]',
      defaultIcon: LayoutDashboard,
    },
    success: {
      iconBg: 'bg-[#16a34a]/15 text-[#86efac]',
      accent: 'text-[#86efac]',
      border: critical ? 'border-[#ef4444]/50' : 'border-[#30363d]',
      value: 'text-[#f8fbff]',
      muted: 'text-[#8b949e]',
      defaultIcon: Activity,
    },
    warning: {
      iconBg: 'bg-[#f59e0b]/15 text-[#fcd34d]',
      accent: 'text-[#fcd34d]',
      border: critical ? 'border-[#ef4444]/50' : 'border-[#30363d]',
      value: 'text-[#f8fbff]',
      muted: 'text-[#8b949e]',
      defaultIcon: Package,
    },
    danger: {
      iconBg: 'bg-[#ef4444]/15 text-[#fda4af]',
      accent: 'text-[#fda4af]',
      border: critical ? 'border-[#ef4444]/70' : 'border-[#30363d]',
      value: 'text-[#f8fbff]',
      muted: 'text-[#8b949e]',
      defaultIcon: AlertTriangle,
    },
  };

  const config = colorMap[color] || colorMap.primary;
  const Icon = IconProp || config.defaultIcon;

  return (
    <div className={`panel panel-hover border ${config.border} p-5`}> 
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#8b949e]">{title}</p>
          <div className="mt-3 flex items-end gap-2">
            <h3 className={`text-3xl font-semibold tabular-nums ${config.value}`}>{value}</h3>
            {unit && <span className={`pb-1 text-sm ${config.muted}`}>{unit}</span>}
          </div>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${config.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(trend !== null || isAboveThreshold) && (
        <div className="mt-4 flex items-center gap-3 border-t border-[#30363d] pt-3 text-sm">
          {trend !== null && (
            <div className={`flex items-center gap-1.5 ${isTrendPositive ? 'text-[#fca5a5]' : 'text-[#86efac]'}`}>
              {isTrendPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{Math.abs(trend)}% {isTrendPositive ? 'up' : 'down'}</span>
            </div>
          )}
          {isAboveThreshold && (
            <div className="ml-auto flex items-center gap-1.5 text-[#fcd34d]">
              <AlertCircle className="h-4 w-4" />
              <span>Threshold</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KPICard;

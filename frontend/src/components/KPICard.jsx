import React from 'react';

const KPICard = ({ title, value, unit = '', trend = null, color = 'accent', threshold = null, critical = false }) => {
  let bgColor = 'bg-supply-card';
  let textColor = 'text-white';
  let borderColor = 'border-supply-accent';

  if (critical) {
    borderColor = 'border-supply-critical';
  } else if (threshold && value > threshold) {
    borderColor = 'border-supply-critical';
  }

  return (
    <div className={`${bgColor} rounded-lg p-6 border-l-4 ${borderColor} shadow-lg`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`${textColor} text-3xl font-bold`}>{value}</h3>
            {unit && <span className="text-gray-500 text-sm">{unit}</span>}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend > 0 ? 'text-supply-critical' : 'text-supply-success'}`}>
            <span className="text-sm font-semibold">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      {threshold && value > threshold && (
        <p className="text-supply-critical text-xs mt-3">⚠️ Above threshold</p>
      )}
    </div>
  );
};

export default KPICard;

import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const SupplierCard = ({ supplier, onClick }) => {
  const getReliabilityColor = (reliability) => {
    if (reliability >= 90) return 'text-supply-success';
    if (reliability >= 75) return 'text-supply-warning';
    return 'text-supply-critical';
  };

  const getReliabilityBg = (reliability) => {
    if (reliability >= 90) return 'bg-green-900/20';
    if (reliability >= 75) return 'bg-yellow-900/20';
    return 'bg-red-900/20';
  };

  return (
    <div
      onClick={onClick}
      className="bg-supply-card rounded-lg p-4 border border-gray-700 hover:border-supply-accent transition-colors cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-white">{supplier.name}</h3>
          <p className="text-gray-400 text-sm">{supplier.location || 'Unknown'}</p>
        </div>
        <div className={`${getReliabilityBg(supplier.reliability)} rounded-full p-2`}>
          {supplier.trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-supply-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-supply-critical" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <p className="text-gray-500 text-xs">Reliability</p>
          <p className={`font-bold text-sm ${getReliabilityColor(supplier.reliability)}`}>
            {supplier.reliability}%
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">On-time</p>
          <p className="font-bold text-sm text-white">{supplier.on_time_delivery}%</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Lead Time</p>
          <p className="font-bold text-sm text-white">{supplier.avg_lead_time}d</p>
        </div>
      </div>

      {supplier.at_risk && (
        <div className="flex items-center gap-2 text-supply-critical text-xs bg-red-900/20 rounded px-2 py-1">
          <AlertCircle className="w-3 h-3" />
          <span>At Risk</span>
        </div>
      )}
    </div>
  );
};

export default SupplierCard;

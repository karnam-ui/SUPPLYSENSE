import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, MapPin } from 'lucide-react';

const SupplierCard = ({ supplier, onClick }) => {
  const getReliabilityColor = (reliability) => {
    if (reliability >= 90) return 'text-success-700';
    if (reliability >= 75) return 'text-warning-700';
    return 'text-danger-700';
  };

  const getReliabilityBg = (reliability) => {
    if (reliability >= 90) return 'bg-success-50 border-success-200';
    if (reliability >= 75) return 'bg-warning-50 border-warning-200';
    return 'bg-danger-50 border-danger-200';
  };

  const isTrendPositive = supplier.trend > 0;

  return (
    <div
      onClick={onClick}
      className="card-modern cursor-pointer p-5 hover:shadow-lg hover:border-primary-300 transition-all duration-300 hover:scale-105"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 mb-1 truncate">
            {supplier.name}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-600 text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{supplier.location || 'Unknown'}</span>
          </div>
        </div>
        <div className={`
          flex-shrink-0 ml-3 p-2.5 rounded-lg transition-all duration-200 ${
            isTrendPositive
              ? 'bg-success-100 text-success-600'
              : 'bg-danger-100 text-danger-600'
          }
        `}>
          {isTrendPositive ? (
            <TrendingUp className="w-5 h-5" />
          ) : (
            <TrendingDown className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={`grid grid-cols-3 gap-3 mb-4 p-4 border rounded-lg ${getReliabilityBg(supplier.reliability)}`}>
        <div className="text-center">
          <p className="text-slate-600 text-xs font-semibold mb-1 uppercase">Reliability</p>
          <p className={`font-bold text-lg ${getReliabilityColor(supplier.reliability)}`}>
            {supplier.reliability}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 text-xs font-semibold mb-1 uppercase">On-time</p>
          <p className="font-bold text-lg text-slate-900">
            {supplier.on_time_delivery}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 text-xs font-semibold mb-1 uppercase">Lead</p>
          <p className="font-bold text-lg text-slate-900">
            {supplier.avg_lead_time}d
          </p>
        </div>
      </div>

      {/* Risk Badge */}
      {supplier.at_risk && (
        <div className="flex items-center gap-2 px-3 py-2 bg-danger-100 border border-danger-200 text-danger-700 rounded-lg hover:shadow-md transition-all duration-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-semibold">🚨 At Risk</span>
        </div>
      )}
    </div>
  );
};

export default SupplierCard;

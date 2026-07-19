import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const AlertCard = ({ alert }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-supply-critical';
      case 'warning':
        return 'text-supply-warning';
      default:
        return 'text-supply-success';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-900/20';
      case 'warning':
        return 'bg-yellow-900/20';
      default:
        return 'bg-green-900/20';
    }
  };

  const getIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`${getSeverityBg(alert.severity)} border-l-4 ${getSeverityColor(alert.severity)} rounded-lg p-4 mb-3`}>
      <div className="flex items-start gap-3">
        <div className={`${getSeverityColor(alert.severity)} mt-0.5`}>
          {getIcon(alert.severity)}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white text-sm">{alert.title}</h4>
          <p className="text-gray-300 text-sm mt-1">{alert.message}</p>
          <div className="flex items-center gap-2 mt-2 text-gray-400 text-xs">
            <Clock className="w-3 h-3" />
            <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;

import React from 'react';
import { AlertCircle } from 'lucide-react';

export const EmptyState = ({
  title = 'No data found',
  description = 'There is no data to display at the moment.',
  icon: Icon = AlertCircle,
  action,
  actionText = 'Go back',
  className = '',
}) => {
  return (
    <div className={`
      flex flex-col items-center justify-center
      py-12 px-4
      ${className}
    `}>
      {Icon && (
        <div className="mb-4 p-4 bg-slate-700 bg-opacity-50 rounded-full">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-slate-200 mb-2">
        {title}
      </h3>
      
      <p className="text-slate-400 text-center max-w-sm mb-6">
        {description}
      </p>

      {action && (
        <button
          onClick={action}
          className={`
            px-4 py-2
            bg-blue-600 hover:bg-blue-700
            text-white font-medium
            rounded-lg
            transition-colors
          `}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

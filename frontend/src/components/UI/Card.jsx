import React from 'react';

const cardVariants = {
  default: 'bg-slate-800 border border-slate-700 hover:border-slate-600',
  primary: 'bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 hover:border-blue-600',
  success: 'bg-gradient-to-br from-emerald-900 to-emerald-800 border border-emerald-700 hover:border-emerald-600',
  warning: 'bg-gradient-to-br from-amber-900 to-amber-800 border border-amber-700 hover:border-amber-600',
  danger: 'bg-gradient-to-br from-red-900 to-red-800 border border-red-700 hover:border-red-600',
  elevated: 'bg-slate-800 border border-slate-700 shadow-xl hover:shadow-2xl',
};

export const Card = ({
  children,
  header,
  footer,
  variant = 'default',
  isLoading = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  ...props
}) => {
  return (
    <div
      className={`
        rounded-lg
        transition-all duration-200
        overflow-hidden
        ${cardVariants[variant]}
        ${className}
      `}
      {...props}
    >
      {header && (
        <div className={`
          px-6 py-4
          border-b border-slate-700
          ${headerClassName}
        `}>
          {header}
        </div>
      )}
      
      <div className={`
        relative
        ${bodyClassName}
      `}>
        {isLoading && (
          <div className="absolute inset-0 bg-slate-800 bg-opacity-50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
        <div className={isLoading ? 'opacity-50' : ''}>
          {children}
        </div>
      </div>

      {footer && (
        <div className="px-6 py-4 border-t border-slate-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

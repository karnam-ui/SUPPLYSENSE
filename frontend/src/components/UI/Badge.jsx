import React from 'react';

const badgeVariants = {
  critical: 'bg-gradient-to-r from-red-900 to-pink-900 border border-red-500/50 text-red-100 shadow-lg shadow-red-500/30',
  warning: 'bg-gradient-to-r from-amber-900 to-orange-900 border border-amber-500/50 text-amber-100 shadow-lg shadow-amber-500/30',
  success: 'bg-gradient-to-r from-emerald-900 to-green-900 border border-emerald-500/50 text-emerald-100 shadow-lg shadow-emerald-500/30',
  info: 'bg-gradient-to-r from-blue-900 to-cyan-900 border border-blue-500/50 text-blue-100 shadow-lg shadow-blue-500/30',
  neutral: 'bg-slate-700 border border-slate-600 text-slate-200',
};

const sizeVariants = {
  sm: 'px-2 py-1 text-xs font-medium rounded',
  md: 'px-3 py-1.5 text-sm font-medium rounded-md',
  lg: 'px-4 py-2 text-base font-medium rounded-lg',
};

export const Badge = ({
  children,
  variant = 'info',
  size = 'md',
  dot = false,
  animated = false,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-2
        ${badgeVariants[variant]}
        ${sizeVariants[size]}
        ${animated ? 'animate-pulse' : ''}
        ${className}
        transition-all duration-300
      `}
      {...props}
    >
      {dot && (
        <span className={`
          inline-block w-2 h-2 rounded-full
          ${animated ? 'animate-pulse' : ''}
          ${variant === 'critical' ? 'bg-red-400 shadow-lg shadow-red-400/50' : ''}
          ${variant === 'warning' ? 'bg-amber-400 shadow-lg shadow-amber-400/50' : ''}
          ${variant === 'success' ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : ''}
          ${variant === 'info' ? 'bg-blue-400 shadow-lg shadow-blue-400/50' : ''}
          ${variant === 'neutral' ? 'bg-slate-400' : ''}
        `} />
      )}
      {children}
    </span>
  );
};

export default Badge;

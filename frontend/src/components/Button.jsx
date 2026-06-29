import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary', // primary, secondary, danger, outline, glass
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/10 focus:ring-indigo-550',
    secondary: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700 focus:ring-slate-400',
    danger: 'bg-red-500 hover:bg-red-650 text-white shadow-md shadow-red-500/10 focus:ring-red-500',
    outline: 'border border-slate-250 dark:border-slate-800 bg-transparent text-slate-850 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-indigo-550',
    glass: 'bg-white/10 dark:bg-[#0f172a]/40 backdrop-blur-md border border-white/10 dark:border-slate-800/40 text-slate-900 dark:text-white hover:bg-white/20 dark:hover:bg-slate-800/60 shadow-sm'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4.5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5'
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className="h-4.5 w-4.5 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;

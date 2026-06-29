import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  id,
  placeholder,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-350">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4.5 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          id={id}
          placeholder={placeholder}
          className={`w-full py-2.5 rounded-xl border transition-all duration-200 text-sm focus:outline-none focus:ring-2 bg-white/50 dark:bg-[#0c1220]/50 backdrop-blur-sm ${
            Icon ? 'pl-11 pr-4.5' : 'px-4.5'
          } ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10 text-red-950 dark:text-red-300'
              : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10 text-slate-900 dark:text-white'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-red-500 mt-0.5 pl-1">
          {error.message || error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  options = [],
  error,
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
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={`w-full py-2.5 px-4.5 rounded-xl border appearance-none transition-all duration-200 text-sm focus:outline-none focus:ring-2 bg-white/50 dark:bg-[#0c1220]/50 backdrop-blur-sm pr-10 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10 text-red-950 dark:text-red-300'
              : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10 text-slate-900 dark:text-white'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option
              key={typeof opt === 'string' ? opt : opt.value}
              value={typeof opt === 'string' ? opt : opt.value}
              className="bg-white dark:bg-[#0f172a]"
            >
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-xs font-medium text-red-500 mt-0.5 pl-1">
          {error.message || error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

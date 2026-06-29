import React from 'react';

const Card = ({
  children,
  className = '',
  variant = 'glass', // glass, flat, outline
  hover = false,
  onClick,
  ...props
}) => {
  const baseStyles = 'rounded-3xl p-6 transition-all duration-300';
  
  const variants = {
    glass: 'glass-panel',
    flat: 'bg-slate-100 dark:bg-slate-900 border border-transparent',
    outline: 'border border-slate-200 dark:border-slate-800 bg-transparent'
  };

  const hoverStyles = hover
    ? 'hover:translate-y-[-2px] hover:shadow-lg dark:hover:shadow-indigo-500/5 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer'
    : '';

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

import React from 'react';

const Skeleton = ({
  className = '',
  variant = 'text', // text, circle, rect
  height,
  width
}) => {
  const baseStyle = 'shimmer bg-slate-200/50 dark:bg-slate-800/40 rounded-xl';
  
  const variants = {
    text: 'h-3.5 w-full',
    circle: 'rounded-full h-10 w-10 shrink-0',
    rect: 'w-full h-24'
  };

  const style = {
    ...(height && { height }),
    ...(width && { width })
  };

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${className}`}
      style={style}
    />
  );
};

export const TodoSkeleton = () => {
  return (
    <div className="flex items-center justify-between p-4.5 rounded-2xl border border-slate-100 dark:border-slate-850 bg-white/20 dark:bg-[#0c1220]/20 animate-pulse">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <Skeleton variant="circle" className="h-5 w-5 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" className="w-2/3" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton variant="circle" className="h-8 w-8" />
        <Skeleton variant="circle" className="h-8 w-8" />
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Grid of stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-panel p-6 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" className="w-24" />
              <Skeleton variant="circle" className="h-9 w-9" />
            </div>
            <Skeleton variant="text" className="w-12 h-6" />
            <Skeleton variant="text" className="w-20" />
          </div>
        ))}
      </div>

      {/* Main widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl h-80 flex flex-col justify-between">
          <Skeleton variant="text" className="w-32 h-5" />
          <Skeleton variant="rect" className="h-52 rounded-2xl" />
        </div>
        <div className="glass-panel p-6 rounded-3xl h-80 flex flex-col justify-between">
          <Skeleton variant="text" className="w-32 h-5" />
          <Skeleton variant="circle" className="h-44 w-44 mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;

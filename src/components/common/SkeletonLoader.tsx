import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100 animate-pulse">
      <div className="h-11 bg-slate-50 px-4 flex items-center gap-4">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/6"></div>
        <div className="h-4 bg-slate-200 rounded w-1/6"></div>
        <div className="h-4 bg-slate-200 rounded w-1/8"></div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-1/3">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
            <div className="space-y-1.5 w-full">
              <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-2.5 bg-slate-100 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-12"></div>
        </div>
      ))}
    </div>
  );
};

export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-100 rounded w-16"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3.5 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-100 rounded w-4/5"></div>
          </div>
          <div className="h-2 bg-slate-100 rounded w-full"></div>
          <div className="flex items-center justify-between pt-2">
            <div className="w-6 h-6 rounded-full bg-slate-200"></div>
            <div className="h-3 bg-slate-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const StatSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-20"></div>
            <div className="h-7 bg-slate-300 rounded w-14"></div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100"></div>
        </div>
      ))}
    </div>
  );
};

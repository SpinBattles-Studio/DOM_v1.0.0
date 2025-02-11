import React from 'react';

export function CardSkeleton() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
      <div className="h-4 bg-white/10 rounded w-5/6"></div>
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-10 bg-white/10 rounded w-64 mb-8 animate-pulse"></div>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 glass-card p-8 animate-pulse">
            <div className="h-8 bg-white/10 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-5/6 mb-6"></div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="h-32 bg-white/10 rounded"></div>
              <div className="h-32 bg-white/10 rounded"></div>
            </div>

            <div className="h-40 bg-white/10 rounded"></div>
          </div>
          
          <div className="space-y-6">
            <div className="glass-card p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
              <div className="h-40 bg-white/10 rounded"></div>
            </div>
            <div className="glass-card p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
              <div className="h-32 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

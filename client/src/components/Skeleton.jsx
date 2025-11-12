import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-800 ${className}`} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-7 w-20" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-4 px-4 mb-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 px-4">
            {[...Array(5)].map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

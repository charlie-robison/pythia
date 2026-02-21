import React from "react";

export const MarketDetailSkeleton: React.FC = () => {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="h-6 w-3/4 rounded bg-default/10 animate-pulse mb-2" />
          <div className="h-4 w-1/3 rounded bg-default/10 animate-pulse" />
        </div>
        <div className="h-9 w-20 rounded-full bg-default/10 animate-pulse" />
      </div>

      {/* Chart skeleton */}
      <div className="price-chart-container mb-6" style={{ height: 250 }}>
        <div className="w-full h-full rounded-xl bg-default/5 animate-pulse" />
      </div>

      {/* Order book skeleton */}
      <div className="h-5 w-32 rounded bg-default/10 animate-pulse mb-4" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-16 rounded bg-default/10 animate-pulse" />
            <div className="h-4 w-20 rounded bg-default/10 animate-pulse" />
            <div className="h-4 w-16 rounded bg-default/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

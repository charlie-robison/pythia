import React from "react";

export const MarketsSkeleton: React.FC = () => {
  return (
    <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="market-card-v2">
          {/* Title skeleton */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <div className="h-4 w-3/4 rounded bg-default/10 animate-pulse mb-1" />
              <div className="h-4 w-1/2 rounded bg-default/10 animate-pulse" />
            </div>
            <div className="w-10 h-10 rounded-full bg-default/10 animate-pulse shrink-0" />
          </div>

          {/* Outcome row skeletons */}
          <div className="space-y-3 mb-4">
            {[1, 2].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-default/10 animate-pulse shrink-0" />
                <div className="flex-1 h-4 rounded bg-default/10 animate-pulse" />
                <div className="w-10 h-4 rounded bg-default/10 animate-pulse" />
                <div className="w-14 h-8 rounded-full bg-default/10 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-28 rounded bg-default/10 animate-pulse" />
            <div className="h-3 w-16 rounded bg-default/10 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

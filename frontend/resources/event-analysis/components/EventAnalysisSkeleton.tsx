import React from "react";

export const EventAnalysisSkeleton: React.FC = () => {
  return (
    <div>
      {/* Description skeleton */}
      <div className="mb-6 p-5 rounded-2xl border border-[rgba(255,255,255,0.06)]">
        <div className="w-16 h-5 rounded-full bg-default/10 animate-pulse mb-3" />
        <div className="h-5 w-2/3 rounded bg-default/10 animate-pulse mb-2" />
        <div className="h-4 w-full rounded bg-default/10 animate-pulse mb-1" />
        <div className="h-4 w-3/4 rounded bg-default/10 animate-pulse" />
      </div>

      {/* Market grid skeleton */}
      <div className="analysis-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="market-card-v2">
            <div className="h-4 w-3/4 rounded bg-default/10 animate-pulse mb-2" />
            <div className="h-4 w-1/2 rounded bg-default/10 animate-pulse mb-3" />
            <div className="space-y-2 mb-3">
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded bg-default/10 animate-pulse" />
                <div className="h-3 w-8 rounded bg-default/10 animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-12 rounded bg-default/10 animate-pulse" />
                <div className="h-3 w-8 rounded bg-default/10 animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-3 w-14 rounded bg-default/10 animate-pulse" />
              <div className="h-7 w-14 rounded-full bg-default/10 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

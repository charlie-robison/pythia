import React from "react";

export const MarketsSkeleton: React.FC = () => {
  return (
    <div className="px-6 pb-6 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-default bg-surface p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-default/10 animate-pulse shrink-0" />
            <div className="flex-1">
              <div className="h-3 w-16 rounded bg-default/10 animate-pulse mb-2" />
              <div className="h-4 w-full rounded bg-default/10 animate-pulse mb-3" />
              <div className="flex gap-2 mb-2">
                <div className="flex-1 h-1.5 rounded-full bg-default/10 animate-pulse" />
                <div className="flex-1 h-1.5 rounded-full bg-default/10 animate-pulse" />
              </div>
              <div className="h-3 w-48 rounded bg-default/10 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

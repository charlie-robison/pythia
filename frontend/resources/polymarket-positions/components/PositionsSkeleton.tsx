import React from "react";

export const PositionsSkeleton: React.FC = () => {
  return (
    <div className="p-6">
      {/* Summary skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-default bg-surface p-3"
          >
            <div className="h-3 w-16 rounded bg-default/10 animate-pulse mb-2" />
            <div className="h-6 w-24 rounded bg-default/10 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Position cards skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-default bg-surface p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 w-48 rounded bg-default/10 animate-pulse mb-2" />
                <div className="h-3 w-24 rounded bg-default/10 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="h-4 w-16 rounded bg-default/10 animate-pulse mb-1" />
                <div className="h-3 w-12 rounded bg-default/10 animate-pulse" />
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-default/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

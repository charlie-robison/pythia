import React from "react";

export const EventExplorerSkeleton: React.FC = () => {
  return (
    <div>
      {/* Main event skeleton */}
      <div className="event-card mb-6">
        <div className="w-16 h-5 rounded-full bg-default/10 animate-pulse mb-3" />
        <div className="h-6 w-3/4 rounded bg-default/10 animate-pulse mb-2" />
        <div className="h-4 w-full rounded bg-default/10 animate-pulse mb-1" />
        <div className="h-4 w-2/3 rounded bg-default/10 animate-pulse mb-4" />
        <div className="flex gap-4 mb-4">
          <div className="h-3 w-16 rounded bg-default/10 animate-pulse" />
          <div className="h-3 w-20 rounded bg-default/10 animate-pulse" />
        </div>
        <div className="h-9 w-24 rounded-full bg-default/10 animate-pulse" />
      </div>

      {/* Related events skeleton */}
      <div className="h-5 w-32 rounded bg-default/10 animate-pulse mb-4" />
      <div className="related-events-row">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="event-card">
            <div className="w-14 h-5 rounded-full bg-default/10 animate-pulse mb-3" />
            <div className="h-4 w-3/4 rounded bg-default/10 animate-pulse mb-2" />
            <div className="h-4 w-1/2 rounded bg-default/10 animate-pulse mb-4" />
            <div className="flex gap-4 mb-4">
              <div className="h-3 w-14 rounded bg-default/10 animate-pulse" />
              <div className="h-3 w-16 rounded bg-default/10 animate-pulse" />
            </div>
            <div className="h-8 w-20 rounded-full bg-default/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

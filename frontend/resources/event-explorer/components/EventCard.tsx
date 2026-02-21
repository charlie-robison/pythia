import React from "react";
import type { EventSummary } from "../types";

interface EventCardProps {
  event: EventSummary;
  onAnalyze: (eventId: string, eventTitle: string) => void;
  isMain?: boolean;
}

function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value.toFixed(0)}`;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onAnalyze, isMain = false }) => {
  return (
    <div className={isMain ? "event-card event-card--main" : "event-card"}>
      {/* Category badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="category-badge">{event.category}</span>
      </div>

      {/* Title */}
      <h3 className={`font-bold text-default leading-snug ${isMain ? "text-lg mb-2" : "text-[15px] mb-2"}`}>
        {event.title}
      </h3>

      {/* Description (main card only) */}
      {isMain && (
        <p className="text-sm text-secondary leading-relaxed mb-4">
          {event.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-xs text-secondary">
        <span>{formatVolume(event.volume)} vol</span>
        <span>{event.marketCount} market{event.marketCount !== 1 ? "s" : ""}</span>
      </div>

      {/* Analyze button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAnalyze(event.id, event.title);
        }}
        className="analyze-button"
      >
        Analyze
      </button>
    </div>
  );
};

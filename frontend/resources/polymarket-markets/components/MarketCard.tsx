import React from "react";
import type { Market } from "../types";

interface MarketCardProps {
  market: Market;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function formatVolume(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  isSelected,
  onSelect,
}) => {
  const yesOutcome = market.outcomes.find((o) => o.name === "Yes");
  const noOutcome = market.outcomes.find((o) => o.name === "No");
  const yesPrice = yesOutcome?.price ?? 0;
  const noPrice = noOutcome?.price ?? 0;

  return (
    <div
      className={`market-card border border-default bg-surface ${
        isSelected ? "border-info bg-info/5" : "hover:bg-default/5"
      }`}
      onClick={() => onSelect(market.id)}
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        {market.imageUrl && (
          <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-default/5">
            <img
              src={market.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Category & Status */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-info">{market.category}</span>
            {market.isResolved && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-success/10 text-success uppercase tracking-wide">
                Resolved
              </span>
            )}
          </div>

          {/* Title */}
          <p className="text-sm font-semibold text-default leading-snug mb-2">
            {market.title}
          </p>

          {/* Outcome bars */}
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-medium text-success">Yes</span>
                <span className="text-[11px] font-bold text-success">
                  {(yesPrice * 100).toFixed(0)}c
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-default/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-success transition-all"
                  style={{ width: `${yesPrice * 100}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-medium text-danger">No</span>
                <span className="text-[11px] font-bold text-danger">
                  {(noPrice * 100).toFixed(0)}c
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-default/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-danger transition-all"
                  style={{ width: `${noPrice * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-[11px] text-secondary">
            <span>Vol: {formatVolume(market.volume)}</span>
            <span>Liq: {formatVolume(market.liquidity)}</span>
            <span>Ends: {formatDate(market.endDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

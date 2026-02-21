import React from "react";
import type { Market } from "../types";

interface MarketCardProps {
  market: Market;
  onBet: (marketId: string, outcome: string, price: number) => void;
}

function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value.toFixed(0)}`;
}

function formatFullVolume(value: number): string {
  return `$${value.toLocaleString("en-US")} vol`;
}

function getMultiplier(price: number): string {
  if (price <= 0) return "";
  const mult = 1 / price;
  return `${mult.toFixed(mult >= 10 ? 1 : 2)}x`;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market, onBet }) => {
  // Show top 2 outcomes sorted by price descending
  const sortedOutcomes = [...market.outcomes].sort((a, b) => b.price - a.price).slice(0, 2);

  return (
    <div className="market-card-v2">
      {/* Header: title + image */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-[15px] font-bold text-default leading-snug flex-1">
          {market.title}
        </h3>
        {market.imageUrl && (
          <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden">
            <img src={market.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Outcome rows */}
      <div className="space-y-3 mb-4">
        {sortedOutcomes.map((outcome) => {
          const pct = Math.round(outcome.price * 100);
          const multiplier = getMultiplier(outcome.price);

          return (
            <div key={outcome.name} className="flex items-center gap-3">
              {/* Outcome avatar */}
              {outcome.imageUrl && (
                <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-[#2a2a2a]">
                  <img src={outcome.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Outcome name */}
              <span className="flex-1 text-sm text-default font-medium truncate">
                {outcome.name}
              </span>

              {/* Multiplier */}
              {multiplier && (
                <span className="text-xs text-secondary tabular-nums">
                  {multiplier}
                </span>
              )}

              {/* Bet button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBet(market.id, outcome.name, outcome.price);
                }}
                className="bet-button"
              >
                {pct}%
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer: volume + sub-market count */}
      <div className="flex items-center justify-between text-xs text-secondary">
        <span>{formatFullVolume(market.volume)}</span>
        {market.subMarketCount && (
          <span>{market.subMarketCount} markets</span>
        )}
      </div>
    </div>
  );
};

import React from "react";
import type { MarketWithAction } from "../types";

interface MarketAnalysisCardProps {
  market: MarketWithAction;
  onOpenMarket: (marketId: string, marketTitle: string) => void;
}

function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value.toFixed(0)}`;
}

const actionButtonClass: Record<string, string> = {
  buy: "action-button--buy",
  sell: "action-button--sell",
  hold: "action-button--hold",
};

const actionLabel: Record<string, string> = {
  buy: "Buy",
  sell: "Sell",
  hold: "Hold",
};

export const MarketAnalysisCard: React.FC<MarketAnalysisCardProps> = ({ market, onOpenMarket }) => {
  const sortedOutcomes = [...market.outcomes].sort((a, b) => b.price - a.price).slice(0, 2);

  return (
    <div
      className="market-card-v2 cursor-pointer"
      onClick={() => onOpenMarket(market.id, market.title)}
    >
      <h4 className="text-[14px] font-bold text-default leading-snug mb-3 line-clamp-2">
        {market.title}
      </h4>

      <div className="space-y-2 mb-3">
        {sortedOutcomes.map((outcome) => (
          <div key={outcome.name} className="flex items-center justify-between gap-2">
            <span className="text-xs text-secondary truncate flex-1">
              {outcome.name}
            </span>
            <span className="text-xs font-semibold text-default tabular-nums">
              {Math.round(outcome.price * 100)}%
            </span>
          </div>
        ))}
      </div>

      {market.position && (
        <div className="text-xs text-secondary mb-3 py-2 border-t border-[rgba(255,255,255,0.06)]">
          <span className="text-default font-medium">{market.position.shares}</span> shares @ {Math.round(market.position.avgPrice * 100)}%
          <span className={market.position.pnl >= 0 ? " text-[#4ade80]" : " text-[#f87171]"}>
            {" "}({market.position.pnl >= 0 ? "+" : ""}{market.position.pnlPercent.toFixed(1)}%)
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-secondary">{formatVolume(market.volume)}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenMarket(market.id, market.title);
          }}
          className={actionButtonClass[market.userAction]}
        >
          {actionLabel[market.userAction]}
        </button>
      </div>
    </div>
  );
};

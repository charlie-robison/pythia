import React from "react";
import type { Market } from "../types";

interface MarketDetailProps {
  market: Market;
}

function formatVolume(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const MarketDetail: React.FC<MarketDetailProps> = ({ market }) => {
  return (
    <div className="mx-6 mb-6 rounded-2xl border border-default bg-surface p-5">
      <div className="flex items-center gap-3 mb-4">
        {market.imageUrl && (
          <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-default/5">
            <img
              src={market.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-info">
              {market.category}
            </span>
            {market.isResolved && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success">
                Resolved: {market.resolvedOutcome}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-default leading-snug">
            {market.title}
          </h3>
        </div>
      </div>

      {/* Outcome prices */}
      <div className="space-y-3 mb-4">
        {market.outcomes.map((outcome) => (
          <div key={outcome.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-default">
                {outcome.name}
              </span>
              <span className="text-sm font-bold text-default">
                {(outcome.price * 100).toFixed(1)}c
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-default/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  outcome.name === "Yes" ? "bg-success" : "bg-danger"
                }`}
                style={{ width: `${outcome.price * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Market stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-default">
        <div>
          <p className="text-xs text-secondary">Volume</p>
          <p className="text-sm font-semibold text-default">
            {formatVolume(market.volume)}
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary">Liquidity</p>
          <p className="text-sm font-semibold text-default">
            {formatVolume(market.liquidity)}
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary">End Date</p>
          <p className="text-sm font-semibold text-default">
            {formatDate(market.endDate)}
          </p>
        </div>
      </div>
    </div>
  );
};

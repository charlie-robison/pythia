import React from "react";
import type { Position } from "../types";

interface PositionCardProps {
  position: Position;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const PositionCard: React.FC<PositionCardProps> = ({
  position,
  isSelected,
  onSelect,
}) => {
  const isProfit = position.pnl >= 0;

  return (
    <div
      className={`position-card border border-default bg-surface ${
        isSelected ? "border-info bg-info/5" : "hover:bg-default/5"
      }`}
      onClick={() => onSelect(position.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-default truncate">
            {position.marketTitle}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                position.outcome === "Yes"
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              }`}
            >
              {position.outcome}
            </span>
            <span className="text-xs text-secondary">
              {position.shares.toFixed(1)} shares
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-default">
            ${(position.shares * position.currentPrice).toFixed(2)}
          </p>
          <p
            className={`text-xs font-medium ${
              isProfit ? "text-success" : "text-danger"
            }`}
          >
            {isProfit ? "+" : ""}
            {position.pnlPercent.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Price bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-secondary mb-1">
          <span>Avg: {(position.avgPrice * 100).toFixed(0)}c</span>
          <span>Now: {(position.currentPrice * 100).toFixed(0)}c</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-default/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isProfit ? "bg-success" : "bg-danger"
            }`}
            style={{ width: `${Math.min(position.currentPrice * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

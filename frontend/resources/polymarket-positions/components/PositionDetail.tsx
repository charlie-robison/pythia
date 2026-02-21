import React from "react";
import type { Position } from "../types";

interface PositionDetailProps {
  position: Position;
}

export const PositionDetail: React.FC<PositionDetailProps> = ({ position }) => {
  const isProfit = position.pnl >= 0;
  const currentValue = position.shares * position.currentPrice;
  const costBasis = position.shares * position.avgPrice;

  return (
    <div className="mx-6 mb-6 rounded-2xl border border-default bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-default">{position.marketTitle}</h3>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            position.outcome === "Yes"
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          }`}
        >
          {position.outcome}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-secondary">Shares</p>
          <p className="text-sm font-medium text-default">
            {position.shares.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary">Current Value</p>
          <p className="text-sm font-medium text-default">
            ${currentValue.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary">Avg Entry Price</p>
          <p className="text-sm font-medium text-default">
            {(position.avgPrice * 100).toFixed(1)}c
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary">Current Price</p>
          <p className="text-sm font-medium text-default">
            {(position.currentPrice * 100).toFixed(1)}c
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary">Cost Basis</p>
          <p className="text-sm font-medium text-default">
            ${costBasis.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary">P&L</p>
          <p
            className={`text-sm font-semibold ${
              isProfit ? "text-success" : "text-danger"
            }`}
          >
            {isProfit ? "+" : ""}${position.pnl.toFixed(2)} ({isProfit ? "+" : ""}
            {position.pnlPercent.toFixed(1)}%)
          </p>
        </div>
      </div>
    </div>
  );
};

import React from "react";

interface PortfolioSummaryProps {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  positionCount: number;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  totalValue,
  totalPnl,
  totalPnlPercent,
  positionCount,
}) => {
  const isProfit = totalPnl >= 0;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="rounded-xl border border-default bg-surface p-3">
        <p className="text-xs text-secondary mb-0.5">Portfolio Value</p>
        <p className="text-lg font-bold text-default">
          ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="rounded-xl border border-default bg-surface p-3">
        <p className="text-xs text-secondary mb-0.5">Total P&L</p>
        <p
          className={`text-lg font-bold ${
            isProfit ? "text-success" : "text-danger"
          }`}
        >
          {isProfit ? "+" : ""}${totalPnl.toFixed(2)}
        </p>
      </div>

      <div className="rounded-xl border border-default bg-surface p-3">
        <p className="text-xs text-secondary mb-0.5">Positions</p>
        <p className="text-lg font-bold text-default">{positionCount}</p>
      </div>
    </div>
  );
};

import { McpUseProvider, useWidget, useCallTool, type WidgetMetadata } from "mcp-use/react";
import React, { useState } from "react";
import "../styles.css";
import { MarketCard } from "./components/MarketCard";
import { MarketsSkeleton } from "./components/MarketsSkeleton";
import type { PolymarketMarketsProps } from "./types";
import { propsSchema } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description: "Display Polymarket prediction markets with search and filtering",
  props: propsSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: false,
    invoking: "Searching markets...",
    invoked: "Markets loaded",
  },
};

type Props = PolymarketMarketsProps;

interface BetState {
  marketId: string;
  marketTitle: string;
  outcome: string;
  price: number;
  amount: string;
}

const PolymarketMarkets: React.FC = () => {
  const { props, isPending } = useWidget<Props>();
  const { callTool: placeBet, isPending: isBetting } = useCallTool("place-bet");
  const [bet, setBet] = useState<BetState | null>(null);

  if (isPending) {
    return (
      <McpUseProvider>
        <div className="markets-container">
          <div className="p-6 pb-4">
            <h2 className="text-xl font-bold text-default mb-1">Top Markets</h2>
            <div className="h-4 w-48 rounded-md bg-default/10 animate-pulse" />
          </div>
          <MarketsSkeleton />
        </div>
      </McpUseProvider>
    );
  }

  const { markets, query, totalCount } = props;

  const handleBet = (marketId: string, outcome: string, price: number) => {
    const market = markets.find((m) => m.id === marketId);
    if (!market) return;
    setBet({
      marketId,
      marketTitle: market.title,
      outcome,
      price,
      amount: "",
    });
  };

  const handlePlaceBet = () => {
    if (!bet || !bet.amount || Number(bet.amount) <= 0) return;
    placeBet(
      {
        marketId: bet.marketId,
        outcome: bet.outcome,
        amount: Number(bet.amount),
      },
      {
        onSuccess: () => setBet(null),
        onError: () => alert("Failed to place bet"),
      }
    );
  };

  const potentialPayout = bet && bet.amount && bet.price > 0
    ? (Number(bet.amount) / bet.price).toFixed(2)
    : "0.00";

  return (
    <McpUseProvider>
      <div className="markets-container">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold text-default">
            {query ? `Results for "${query}"` : "Top Markets"}
          </h2>
          {totalCount > 0 && (
            <p className="text-sm text-secondary mt-1">{totalCount} markets</p>
          )}
        </div>

        {/* Market Grid */}
        <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} onBet={handleBet} />
          ))}
        </div>

        {markets.length === 0 && (
          <div className="px-6 pb-6 text-center text-secondary text-sm">
            No markets found
          </div>
        )}

        {/* Bet Modal */}
        {bet && (
          <div className="bet-modal-overlay" onClick={() => setBet(null)}>
            <div className="bet-modal" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-default">Place Bet</h3>
                <button
                  onClick={() => setBet(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-default/10 text-secondary"
                >
                  &times;
                </button>
              </div>

              <p className="text-sm text-secondary mb-1">{bet.marketTitle}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1a3a2a] text-[#4ade80]">
                  {bet.outcome}
                </span>
                <span className="text-sm text-secondary">
                  at {Math.round(bet.price * 100)}%
                </span>
              </div>

              <label className="text-xs text-secondary mb-1.5 block">Amount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={bet.amount}
                onChange={(e) => setBet({ ...bet, amount: e.target.value })}
                className="bet-input"
                autoFocus
              />

              {/* Quick amount buttons */}
              <div className="flex gap-2 mt-2 mb-4">
                {[5, 10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBet({ ...bet, amount: String(amt) })}
                    className="quick-amount-btn"
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Payout info */}
              <div className="flex items-center justify-between py-3 border-t border-[#333] mb-4">
                <span className="text-xs text-secondary">Potential payout</span>
                <span className="text-sm font-bold text-[#4ade80]">
                  ${potentialPayout}
                </span>
              </div>

              <button
                onClick={handlePlaceBet}
                disabled={isBetting || !bet.amount || Number(bet.amount) <= 0}
                className="place-bet-btn"
              >
                {isBetting ? "Placing bet..." : "Place Bet"}
              </button>
            </div>
          </div>
        )}
      </div>
    </McpUseProvider>
  );
};

export default PolymarketMarkets;

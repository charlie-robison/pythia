import { McpUseProvider, useWidget, useCallTool, type WidgetMetadata } from "mcp-use/react";
import React, { useState } from "react";
import "../styles.css";
import { PriceChart } from "./components/PriceChart";
import { OrderBookTable } from "./components/OrderBookTable";
import { MarketDetailSkeleton } from "./components/MarketDetailSkeleton";
import type { MarketDetailProps } from "./types";
import { propsSchema } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description: "Display detailed market view with price chart, order book, and trading actions",
  props: propsSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: false,
    invoking: "Loading market detail...",
    invoked: "Market detail loaded",
  },
};

type Props = MarketDetailProps;

interface BetState {
  marketId: string;
  marketTitle: string;
  outcome: string;
  price: number;
  amount: string;
  side: "buy" | "sell";
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

const MarketDetailWidget: React.FC = () => {
  const { props, isPending } = useWidget<Props>();
  const { callTool: placeBet, isPending: isBetting } = useCallTool("place-bet");
  const [bet, setBet] = useState<BetState | null>(null);
  const [activeTab, setActiveTab] = useState<"orderbook" | "chart">("chart");

  if (isPending) {
    return (
      <McpUseProvider>
        <div className="markets-container">
          <div className="p-6">
            <MarketDetailSkeleton />
          </div>
        </div>
      </McpUseProvider>
    );
  }

  const { market, userAction, position } = props;
  const topOutcome = market.outcomes[0];

  const handleOpenBet = (side: "buy" | "sell", outcome: string, price: number) => {
    setBet({
      marketId: market.id,
      marketTitle: market.title,
      outcome,
      price,
      amount: "",
      side,
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
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="category-badge">{market.category}</span>
                <span className="text-xs text-secondary">
                  {formatVolume(market.volume)} vol
                </span>
              </div>
              <h2 className="text-xl font-bold text-default leading-snug">
                {market.title}
              </h2>
            </div>

            {/* Action button */}
            <div className="flex gap-2 shrink-0">
              {userAction === "buy" && topOutcome && (
                <button
                  onClick={() => handleOpenBet("buy", topOutcome.name, topOutcome.price)}
                  className="action-button--buy"
                >
                  Buy {Math.round(topOutcome.price * 100)}¢
                </button>
              )}
              {(userAction === "sell" || userAction === "hold") && (
                <>
                  <button
                    onClick={() => {
                      if (position && topOutcome) {
                        handleOpenBet("sell", position.outcome, topOutcome.price);
                      }
                    }}
                    className="action-button--sell"
                  >
                    Sell
                  </button>
                  <button className="action-button--hold">Hold</button>
                </>
              )}
            </div>
          </div>

          {/* Outcome probabilities */}
          <div className="flex items-center gap-3 mt-4">
            {market.outcomes.map((outcome) => (
              <button
                key={outcome.name}
                onClick={() => handleOpenBet("buy", outcome.name, outcome.price)}
                className="bet-button"
              >
                {outcome.name} {Math.round(outcome.price * 100)}%
              </button>
            ))}
          </div>

          {/* Position info */}
          {position && (
            <div className="mt-4 p-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary">Your position</span>
                <span className={position.pnl >= 0 ? "text-[#4ade80] font-semibold" : "text-[#f87171] font-semibold"}>
                  {position.pnl >= 0 ? "+" : ""}{position.pnlPercent.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-secondary mt-1">
                <span>{position.shares} shares "{position.outcome}" @ {Math.round(position.avgPrice * 100)}¢</span>
                <span>{position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-1 border-b border-[rgba(255,255,255,0.06)]">
          {(["chart", "orderbook"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-default border-b-2 border-[#4ade80]"
                  : "text-secondary hover:text-default"
              }`}
            >
              {tab === "chart" ? "Chart" : "Order Book"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-6 py-6">
          {activeTab === "chart" && (
            <PriceChart data={market.priceHistory} />
          )}
          {activeTab === "orderbook" && (
            <div className="order-book-container">
              <OrderBookTable orderBook={market.orderBook} />
            </div>
          )}
        </div>

        {/* Bet Modal */}
        {bet && (
          <div className="bet-modal-overlay" onClick={() => setBet(null)}>
            <div className="bet-modal" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-default">
                  {bet.side === "buy" ? "Buy" : "Sell"}
                </h3>
                <button
                  onClick={() => setBet(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-default/10 text-secondary"
                >
                  &times;
                </button>
              </div>

              <p className="text-sm text-secondary mb-1">{bet.marketTitle}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  bet.side === "buy"
                    ? "bg-[#1a3a2a] text-[#4ade80]"
                    : "bg-[#3a1a1a] text-[#f87171]"
                }`}>
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
                className={bet.side === "buy" ? "place-bet-btn" : "place-bet-btn place-bet-btn--sell"}
              >
                {isBetting
                  ? (bet.side === "buy" ? "Placing buy..." : "Placing sell...")
                  : (bet.side === "buy" ? "Buy" : "Sell")
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </McpUseProvider>
  );
};

export default MarketDetailWidget;

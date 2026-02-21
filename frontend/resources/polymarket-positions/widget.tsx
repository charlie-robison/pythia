import { McpUseProvider, useWidget, type WidgetMetadata } from "mcp-use/react";
import React, { useState } from "react";
import "../styles.css";
import { PositionCard } from "./components/PositionCard";
import { PositionDetail } from "./components/PositionDetail";
import { PortfolioSummary } from "./components/PortfolioSummary";
import { PositionsSkeleton } from "./components/PositionsSkeleton";
import type { PolymarketPositionsProps } from "./types";
import { propsSchema } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description: "Display user's Polymarket positions with portfolio summary",
  props: propsSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: false,
    invoking: "Loading positions...",
    invoked: "Positions loaded",
  },
};

type Props = PolymarketPositionsProps;

type SortKey = "value" | "pnl" | "name";

const PolymarketPositions: React.FC = () => {
  const { props, isPending } = useWidget<Props>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("value");
  const [filterOutcome, setFilterOutcome] = useState<"all" | "Yes" | "No">(
    "all"
  );

  if (isPending) {
    return (
      <McpUseProvider>
        <div className="relative bg-surface-elevated border border-default rounded-3xl">
          <div className="p-6 pb-4">
            <h5 className="text-secondary mb-1">Polymarket</h5>
            <h2 className="heading-xl mb-3">Your Positions</h2>
          </div>
          <PositionsSkeleton />
        </div>
      </McpUseProvider>
    );
  }

  const { positions, totalValue, totalPnl, totalPnlPercent } = props;

  const filtered =
    filterOutcome === "all"
      ? positions
      : positions.filter((p) => p.outcome === filterOutcome);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "value")
      return (
        b.shares * b.currentPrice - a.shares * a.currentPrice
      );
    if (sortBy === "pnl") return Math.abs(b.pnl) - Math.abs(a.pnl);
    return a.marketTitle.localeCompare(b.marketTitle);
  });

  const selectedPosition = selectedId
    ? positions.find((p) => p.id === selectedId)
    : null;

  return (
    <McpUseProvider>
      <div className="relative bg-surface-elevated border border-default rounded-3xl">
        {/* Header */}
        <div className="p-6 pb-4">
          <h5 className="text-secondary mb-1">Polymarket</h5>
          <h2 className="heading-xl mb-1">Your Positions</h2>
          <p className="text-sm text-secondary">
            {positions.length} active position{positions.length !== 1 && "s"}
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="px-6">
          <PortfolioSummary
            totalValue={totalValue}
            totalPnl={totalPnl}
            totalPnlPercent={totalPnlPercent}
            positionCount={positions.length}
          />
        </div>

        {/* Controls */}
        <div className="px-6 mb-4 flex items-center gap-2 flex-wrap">
          {/* Outcome filter */}
          {(["all", "Yes", "No"] as const).map((outcome) => (
            <button
              key={outcome}
              onClick={() => setFilterOutcome(outcome)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                filterOutcome === outcome
                  ? "bg-info/10 text-info"
                  : "bg-surface text-secondary hover:bg-default/5"
              }`}
            >
              {outcome === "all" ? "All" : outcome}
            </button>
          ))}

          <div className="w-px h-5 bg-default/10 mx-1" />

          {/* Sort */}
          {(
            [
              ["value", "Value"],
              ["pnl", "P&L"],
              ["name", "Name"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key as SortKey)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                sortBy === key
                  ? "bg-info/10 text-info"
                  : "bg-surface text-secondary hover:bg-default/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Position List */}
        <div className="px-6 pb-2 space-y-2">
          {sorted.map((position) => (
            <PositionCard
              key={position.id}
              position={position}
              isSelected={selectedId === position.id}
              onSelect={setSelectedId}
            />
          ))}

          {sorted.length === 0 && (
            <div className="py-8 text-center text-secondary text-sm">
              No positions match the current filter
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedPosition && <PositionDetail position={selectedPosition} />}
      </div>
    </McpUseProvider>
  );
};

export default PolymarketPositions;

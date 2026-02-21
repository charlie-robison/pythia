import { McpUseProvider, useWidget, type WidgetMetadata } from "mcp-use/react";
import React from "react";
import "../styles.css";
import { MarketAnalysisCard } from "./components/MarketAnalysisCard";
import { EventAnalysisSkeleton } from "./components/EventAnalysisSkeleton";
import type { EventAnalysisProps } from "./types";
import { propsSchema } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description: "Display event analysis with markets and buy/sell/hold recommendations",
  props: propsSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: false,
    invoking: "Analyzing event...",
    invoked: "Analysis complete",
  },
};

type Props = EventAnalysisProps;

function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value.toFixed(0)}`;
}

const EventAnalysis: React.FC = () => {
  const { props, isPending, sendFollowUpMessage } = useWidget<Props>();

  if (isPending) {
    return (
      <McpUseProvider>
        <div className="markets-container">
          <div className="p-6 pb-4">
            <h2 className="text-xl font-bold text-default mb-1">Event Analysis</h2>
            <div className="h-4 w-48 rounded-md bg-default/10 animate-pulse" />
          </div>
          <div className="px-6 pb-6">
            <EventAnalysisSkeleton />
          </div>
        </div>
      </McpUseProvider>
    );
  }

  const { event, markets } = props;

  const handleMarketClick = (marketId: string, marketTitle: string) => {
    sendFollowUpMessage(
      `Show me the detail for market "${marketTitle}" (marketId: ${marketId})`
    );
  };

  return (
    <McpUseProvider>
      <div className="markets-container">
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="category-badge">{event.category}</span>
          </div>
          <h2 className="text-xl font-bold text-default mb-1">
            {event.title}
          </h2>
        </div>

        {/* Event Description */}
        <div className="px-6 pb-4">
          <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
            <p className="text-sm text-secondary leading-relaxed mb-2">
              {event.description}
            </p>
            <span className="text-xs text-secondary">
              {formatVolume(event.volume)} total volume
            </span>
          </div>
        </div>

        {/* Markets Grid */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-semibold text-secondary mb-4">
            {markets.length} Market{markets.length !== 1 ? "s" : ""}
          </h3>
          <div className="analysis-grid">
            {markets.map((market) => (
              <MarketAnalysisCard
                key={market.id}
                market={market}
                onClick={handleMarketClick}
              />
            ))}
          </div>
        </div>
      </div>
    </McpUseProvider>
  );
};

export default EventAnalysis;

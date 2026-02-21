import { McpUseProvider, useWidget, type WidgetMetadata } from "mcp-use/react";
import React, { useState } from "react";
import "../styles.css";
import { MarketCard } from "./components/MarketCard";
import { MarketDetail } from "./components/MarketDetail";
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

type SortKey = "volume" | "liquidity" | "ending" | "price";

const PolymarketMarkets: React.FC = () => {
  const { props, isPending } = useWidget<Props>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("volume");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  if (isPending) {
    return (
      <McpUseProvider>
        <div className="relative bg-surface-elevated border border-default rounded-3xl">
          <div className="p-6 pb-4">
            <h5 className="text-secondary mb-1">Polymarket</h5>
            <h2 className="heading-xl mb-3">Markets</h2>
            <div className="h-5 w-48 rounded-md bg-default/10 animate-pulse" />
          </div>
          <MarketsSkeleton />
        </div>
      </McpUseProvider>
    );
  }

  const { markets, query, totalCount } = props;

  const categories = [
    "all",
    ...Array.from(new Set(markets.map((m) => m.category))),
  ];

  let filtered = markets;

  if (filterCategory !== "all") {
    filtered = filtered.filter((m) => m.category === filterCategory);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((m) => m.title.toLowerCase().includes(q));
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "volume") return b.volume - a.volume;
    if (sortBy === "liquidity") return b.liquidity - a.liquidity;
    if (sortBy === "ending")
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    if (sortBy === "price") {
      const aYes = a.outcomes.find((o) => o.name === "Yes")?.price ?? 0;
      const bYes = b.outcomes.find((o) => o.name === "Yes")?.price ?? 0;
      return bYes - aYes;
    }
    return 0;
  });

  const selectedMarket = selectedId
    ? markets.find((m) => m.id === selectedId)
    : null;

  return (
    <McpUseProvider>
      <div className="relative bg-surface-elevated border border-default rounded-3xl">
        {/* Header */}
        <div className="p-6 pb-4">
          <h5 className="text-secondary mb-1">Polymarket</h5>
          <h2 className="heading-xl mb-1">Markets</h2>
          <p className="text-sm text-secondary">
            {query
              ? `${totalCount} result${totalCount !== 1 ? "s" : ""} for "${query}"`
              : `${totalCount} markets`}
          </p>
        </div>

        {/* Search */}
        <div className="px-6 mb-3">
          <input
            type="text"
            placeholder="Filter markets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-default bg-surface text-default placeholder:text-secondary/50 outline-none focus:border-info transition-colors"
          />
        </div>

        {/* Category filters */}
        <div className="px-6 mb-3 flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                filterCategory === cat
                  ? "bg-info/10 text-info"
                  : "bg-surface text-secondary hover:bg-default/5"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>

        {/* Sort controls */}
        <div className="px-6 mb-4 flex items-center gap-1.5">
          <span className="text-xs text-secondary mr-1">Sort:</span>
          {(
            [
              ["volume", "Volume"],
              ["liquidity", "Liquidity"],
              ["ending", "Ending Soon"],
              ["price", "Yes Price"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key as SortKey)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                sortBy === key
                  ? "bg-info/10 text-info"
                  : "bg-surface text-secondary hover:bg-default/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Market List */}
        <div className="px-6 pb-2 space-y-2">
          {sorted.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              isSelected={selectedId === market.id}
              onSelect={setSelectedId}
            />
          ))}

          {sorted.length === 0 && (
            <div className="py-8 text-center text-secondary text-sm">
              No markets match the current filters
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedMarket && <MarketDetail market={selectedMarket} />}
      </div>
    </McpUseProvider>
  );
};

export default PolymarketMarkets;

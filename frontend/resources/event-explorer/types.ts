import { z } from "zod";

export const eventMarketSchema = z.object({
  id: z.string().optional().describe("Market ID"),
  title: z.string().optional().describe("Market title"),
  question: z.string().optional().describe("Market question"),
  category: z.string().nullable().optional().describe("Market category"),
  outcomes: z.string().nullable().optional().describe("Market outcomes (CSV or JSON string)"),
  outcomePrices: z.string().nullable().optional().describe("Market outcome prices (CSV or JSON string)"),
  volume: z.union([z.string(), z.number()]).nullable().optional().describe("Market volume"),
  liquidity: z.union([z.string(), z.number()]).nullable().optional().describe("Market liquidity"),
  endDate: z.string().nullable().optional().describe("Market end date"),
  active: z.boolean().nullable().optional().describe("Whether market is active"),
  closed: z.boolean().nullable().optional().describe("Whether market is closed"),
  slug: z.string().nullable().optional().describe("Market slug"),
  conditionId: z.string().nullable().optional().describe("Condition ID"),
});

export const marketResultSchema = z.object({
  id: z.string().describe("Market ID"),
  title: z.string().nullable().optional().describe("Event title"),
  description: z.string().nullable().optional().describe("Event description"),
  question: z.string().nullable().optional().describe("Market question"),
  category: z.string().nullable().optional().describe("Market category"),
  outcomes: z.string().nullable().optional().describe("Comma-separated outcomes"),
  outcomePrices: z.string().nullable().optional().describe("Comma-separated outcome prices"),
  volume: z.union([z.string(), z.number()]).nullable().optional().describe("Trading volume"),
  volumeNum: z.number().nullable().optional().describe("Trading volume as number"),
  liquidity: z.union([z.string(), z.number()]).nullable().optional().describe("Liquidity"),
  liquidityNum: z.number().nullable().optional().describe("Liquidity as number"),
  endDate: z.string().nullable().optional().describe("Market end date"),
  active: z.boolean().nullable().optional().describe("Whether market is active"),
  closed: z.boolean().nullable().optional().describe("Whether market is closed"),
  slug: z.string().nullable().optional().describe("Market slug"),
  conditionId: z.string().nullable().optional().describe("Condition ID"),
  markets: z.array(eventMarketSchema).optional().describe("Event markets"),
  relevance_score: z.number().describe("Relevance score from search"),
});

export const propsSchema = z.object({
  results: z.array(marketResultSchema).describe("Search results"),
  expandedQueries: z.array(z.string()).describe("Expanded search queries"),
  query: z.string().describe("The original search query"),
});

export type MarketResult = z.infer<typeof marketResultSchema>;
export type EventExplorerProps = z.infer<typeof propsSchema>;

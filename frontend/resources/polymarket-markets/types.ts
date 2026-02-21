import { z } from "zod";

export const outcomeSchema = z.object({
  name: z.string().describe("Outcome name (e.g. a candidate name or Yes/No)"),
  price: z.number().describe("Current price (0-1)"),
  imageUrl: z.string().optional().describe("Avatar or icon URL for this outcome"),
});

export const marketSchema = z.object({
  id: z.string().describe("Market ID"),
  title: z.string().describe("Market question"),
  slug: z.string().describe("Market slug for linking"),
  category: z.string().describe("Market category (e.g. Politics, Sports, Crypto)"),
  volume: z.number().describe("Total trading volume in dollars"),
  liquidity: z.number().describe("Available liquidity in dollars"),
  endDate: z.string().describe("Market end date as ISO string"),
  outcomes: z.array(outcomeSchema),
  imageUrl: z.string().optional().describe("Market thumbnail image URL"),
  isResolved: z.boolean().describe("Whether the market has resolved"),
  resolvedOutcome: z.string().optional().describe("Winning outcome if resolved"),
  subMarketCount: z.number().optional().describe("Number of sub-markets in this event"),
});

export const propsSchema = z.object({
  markets: z.array(marketSchema).describe("List of markets"),
  query: z.string().optional().describe("Search query used to find these markets"),
  totalCount: z.number().describe("Total number of matching markets"),
});

export type Outcome = z.infer<typeof outcomeSchema>;
export type Market = z.infer<typeof marketSchema>;
export type PolymarketMarketsProps = z.infer<typeof propsSchema>;

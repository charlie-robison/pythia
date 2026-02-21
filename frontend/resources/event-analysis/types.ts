import { z } from "zod";

export const positionInfoSchema = z.object({
  id: z.string(),
  outcome: z.string(),
  shares: z.number(),
  avgPrice: z.number(),
  currentPrice: z.number(),
  pnl: z.number(),
  pnlPercent: z.number(),
});

export const outcomeSchema = z.object({
  name: z.string(),
  price: z.number(),
  imageUrl: z.string().optional(),
});

export const marketWithActionSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  category: z.string(),
  volume: z.number(),
  liquidity: z.number(),
  endDate: z.string(),
  outcomes: z.array(outcomeSchema),
  imageUrl: z.string().optional(),
  isResolved: z.boolean(),
  resolvedOutcome: z.string().optional(),
  subMarketCount: z.number().optional(),
  userAction: z.enum(["buy", "sell", "hold"]).describe("Recommended action based on user's position"),
  position: positionInfoSchema.nullable().describe("User's position in this market, if any"),
});

export const eventInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  category: z.string(),
  volume: z.number(),
});

export const propsSchema = z.object({
  event: eventInfoSchema.describe("Event metadata"),
  markets: z.array(marketWithActionSchema).describe("Markets in this event with user action recommendations"),
});

export type PositionInfo = z.infer<typeof positionInfoSchema>;
export type MarketWithAction = z.infer<typeof marketWithActionSchema>;
export type EventInfo = z.infer<typeof eventInfoSchema>;
export type EventAnalysisProps = z.infer<typeof propsSchema>;

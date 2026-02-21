import { z } from "zod";

export const outcomeSchema = z.object({
  name: z.string(),
  price: z.number(),
  imageUrl: z.string().optional(),
});

export const pricePointSchema = z.object({
  timestamp: z.string().describe("ISO date string"),
  price: z.number().describe("Price at this point in time"),
});

export const orderBookEntrySchema = z.object({
  price: z.number().describe("Price level"),
  shares: z.number().describe("Number of shares at this level"),
  total: z.number().describe("Total dollar value"),
});

export const orderBookSchema = z.object({
  asks: z.array(orderBookEntrySchema).describe("Sell orders (ascending price)"),
  bids: z.array(orderBookEntrySchema).describe("Buy orders (descending price)"),
  spread: z.number().describe("Spread between best bid and best ask"),
  lastTradePrice: z.number().describe("Last trade price"),
});

export const positionInfoSchema = z.object({
  id: z.string(),
  outcome: z.string(),
  shares: z.number(),
  avgPrice: z.number(),
  currentPrice: z.number(),
  pnl: z.number(),
  pnlPercent: z.number(),
});

export const marketDetailSchema = z.object({
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
  priceHistory: z.array(pricePointSchema),
  orderBook: orderBookSchema,
});

export const propsSchema = z.object({
  market: marketDetailSchema.describe("Market with full detail including price history and order book"),
  userAction: z.enum(["buy", "sell", "hold"]).describe("Recommended action"),
  position: positionInfoSchema.nullable().describe("User's position if any"),
});

export type Outcome = z.infer<typeof outcomeSchema>;
export type PricePoint = z.infer<typeof pricePointSchema>;
export type OrderBookEntry = z.infer<typeof orderBookEntrySchema>;
export type OrderBook = z.infer<typeof orderBookSchema>;
export type PositionInfo = z.infer<typeof positionInfoSchema>;
export type MarketDetail = z.infer<typeof marketDetailSchema>;
export type MarketDetailProps = z.infer<typeof propsSchema>;

import { z } from "zod";

export const positionSchema = z.object({
  id: z.string().describe("Position ID"),
  marketTitle: z.string().describe("Title of the market"),
  outcome: z.string().describe("The outcome the user holds (e.g. Yes/No)"),
  shares: z.number().describe("Number of shares held"),
  avgPrice: z.number().describe("Average entry price per share"),
  currentPrice: z.number().describe("Current price per share"),
  pnl: z.number().describe("Profit/loss in dollars"),
  pnlPercent: z.number().describe("Profit/loss percentage"),
  marketSlug: z.string().describe("Market slug for linking"),
});

export const propsSchema = z.object({
  positions: z.array(positionSchema).describe("User's open positions"),
  totalValue: z.number().describe("Total portfolio value in dollars"),
  totalPnl: z.number().describe("Total profit/loss in dollars"),
  totalPnlPercent: z.number().describe("Total profit/loss percentage"),
});

export type Position = z.infer<typeof positionSchema>;
export type PolymarketPositionsProps = z.infer<typeof propsSchema>;

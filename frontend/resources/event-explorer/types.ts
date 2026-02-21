import { z } from "zod";

export const eventSummarySchema = z.object({
  id: z.string().describe("Event ID"),
  title: z.string().describe("Event title"),
  description: z.string().describe("Event description"),
  slug: z.string().describe("Event slug"),
  category: z.string().describe("Event category"),
  volume: z.number().describe("Total trading volume across all markets"),
  marketCount: z.number().describe("Number of markets in this event"),
});

export const propsSchema = z.object({
  mainEvent: eventSummarySchema.nullable().describe("The primary event matching the query"),
  relatedEvents: z.array(eventSummarySchema).describe("Related events"),
  query: z.string().describe("The search query used"),
});

export type EventSummary = z.infer<typeof eventSummarySchema>;
export type EventExplorerProps = z.infer<typeof propsSchema>;

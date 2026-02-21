import { McpUseProvider, useWidget, type WidgetMetadata } from "mcp-use/react";
import React from "react";
import "../styles.css";
import { EventCard } from "./components/EventCard";
import { EventExplorerSkeleton } from "./components/EventExplorerSkeleton";
import type { EventExplorerProps } from "./types";
import { propsSchema } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description: "Display prediction market events with a main event and related events",
  props: propsSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: false,
    invoking: "Searching events...",
    invoked: "Events loaded",
  },
};

type Props = EventExplorerProps;

const EventExplorer: React.FC = () => {
  const { props, isPending, sendFollowUpMessage } = useWidget<Props>();

  if (isPending) {
    return (
      <McpUseProvider>
        <div className="markets-container">
          <div className="p-6 pb-4">
            <h2 className="text-xl font-bold text-default mb-1">Events</h2>
            <div className="h-4 w-48 rounded-md bg-default/10 animate-pulse" />
          </div>
          <div className="px-6 pb-6">
            <EventExplorerSkeleton />
          </div>
        </div>
      </McpUseProvider>
    );
  }

  const { mainEvent, relatedEvents, query } = props;

  const handleAnalyze = (eventId: string, eventTitle: string) => {
    sendFollowUpMessage(
      `Analyze the prediction market event "${eventTitle}" (eventId: ${eventId})`
    );
  };

  return (
    <McpUseProvider>
      <div className="markets-container">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold text-default">
            Events for "{query}"
          </h2>
        </div>

        <div className="px-6 pb-6">
          {mainEvent ? (
            <>
              {/* Main Event */}
              <EventCard
                event={mainEvent}
                onAnalyze={handleAnalyze}
                isMain
              />

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-secondary mt-6 mb-4">
                    Related Events
                  </h3>
                  <div className="related-events-row">
                    {relatedEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onAnalyze={handleAnalyze}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-secondary text-sm">
              No events found matching "{query}"
            </div>
          )}
        </div>
      </div>
    </McpUseProvider>
  );
};

export default EventExplorer;

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { StatusBadge, StatusType } from "./StatusBadge";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  actor?: string;
  actorRole?: string;
  status?: StatusType;
  metadata?: Record<string, any>;
  linkedEntity?: {
    type: string;
    id: string;
    label: string;
    href?: string;
  };
  changes?: Array<{
    field: string;
    before: string | number;
    after: string | number;
  }>;
  icon?: React.ComponentType<any>;
  iconColor?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  maxVisible?: number;
  showExpandButton?: boolean;
  compact?: boolean;
}

export function Timeline({ events, maxVisible = 10, showExpandButton = true, compact = false }: TimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const visibleEvents = expanded ? events : events.slice(0, maxVisible);
  const hasMore = events.length > maxVisible;

  const toggleEventDetails = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  return (
    <div className="space-y-0">
      {visibleEvents.map((event, index) => {
        const isLast = index === visibleEvents.length - 1;
        const isExpanded = expandedEvents.has(event.id);
        const hasDetails = event.changes || event.metadata || event.description;
        const EventIcon = event.icon;

        return (
          <div key={event.id} className="relative">
            {/* Timeline line */}
            {!isLast && (
              <div
                className="absolute left-[15px] top-8 bottom-0 w-[2px]"
                style={{ background: "var(--border-medium)" }}
              />
            )}

            {/* Event content */}
            <div className={`relative flex gap-4 ${compact ? "pb-4" : "pb-6"}`}>
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div
                  className={`${compact ? "w-8 h-8" : "w-9 h-9"} rounded-xl flex items-center justify-center`}
                  style={{
                    background: event.iconColor ? `${event.iconColor}15` : "var(--input-background)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  {EventIcon ? (
                    <EventIcon size={compact ? 14 : 16} style={{ color: event.iconColor || "var(--text-secondary)" }} />
                  ) : (
                    <div
                      className={`${compact ? "w-2 h-2" : "w-2.5 h-2.5"} rounded-full`}
                      style={{ background: event.iconColor || "var(--accent-navy-light)" }}
                    />
                  )}
                </div>
              </div>

              {/* Event details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`${compact ? "text-[13px]" : "text-[13px]"}`} style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {event.title}
                      </p>
                      {event.status && <StatusBadge status={event.status} size="sm" />}
                    </div>
                    {event.actor && (
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {event.actor}
                        {event.actorRole && <span style={{ color: "var(--text-quaternary)" }}> • {event.actorRole}</span>}
                      </p>
                    )}
                  </div>
                  <span className={`${compact ? "text-[10px]" : "text-[11px]"} whitespace-nowrap`} style={{ color: "var(--text-tertiary)" }}>
                    {event.timestamp}
                  </span>
                </div>

                {/* Linked entity */}
                {event.linkedEntity && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {event.linkedEntity.type}:
                    </span>
                    {event.linkedEntity.href ? (
                      <a
                        href={event.linkedEntity.href}
                        className="text-[11px] flex items-center gap-1 hover:underline"
                        style={{ color: "var(--accent-navy-light)", fontWeight: 500 }}
                      >
                        {event.linkedEntity.label}
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-[11px]" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                        {event.linkedEntity.label}
                      </span>
                    )}
                  </div>
                )}

                {/* Expandable details */}
                {hasDetails && (
                  <div>
                    {!isExpanded && event.description && (
                      <p className="text-[12px] mb-2" style={{ color: "var(--text-secondary)" }}>
                        {event.description}
                      </p>
                    )}

                    {isExpanded && (
                      <div
                        className="mt-2 p-3 rounded-lg space-y-2"
                        style={{
                          background: "var(--input-background)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        {event.description && (
                          <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                            {event.description}
                          </p>
                        )}

                        {event.changes && event.changes.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                              Changes
                            </p>
                            {event.changes.map((change, i) => (
                              <div key={i} className="flex items-center gap-2 text-[11px]">
                                <span style={{ color: "var(--text-tertiary)" }}>{change.field}:</span>
                                <span style={{ color: "var(--text-quaternary)" }}>{change.before}</span>
                                <span style={{ color: "var(--text-tertiary)" }}>→</span>
                                <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{change.after}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                              Details
                            </p>
                            {Object.entries(event.metadata).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2 text-[11px]">
                                <span style={{ color: "var(--text-tertiary)" }}>{key}:</span>
                                <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {(event.changes || event.metadata) && (
                      <button
                        onClick={() => toggleEventDetails(event.id)}
                        className="mt-2 text-[11px] flex items-center gap-1 transition-colors"
                        style={{ color: "var(--accent-navy-light)" }}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={12} />
                            Hide details
                          </>
                        ) : (
                          <>
                            <ChevronDown size={12} />
                            Show details
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Expand/Collapse button */}
      {showExpandButton && hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 rounded-lg text-[12px] flex items-center justify-center gap-2 transition-all"
          style={{
            background: "var(--input-background)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-light)",
            fontWeight: 500,
          }}
        >
          {expanded ? (
            <>
              <ChevronUp size={14} />
              Show less
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              Show {events.length - maxVisible} more events
            </>
          )}
        </button>
      )}
    </div>
  );
}

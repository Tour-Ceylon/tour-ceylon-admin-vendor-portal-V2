import { ExternalLink, Plane, Repeat, StickyNote } from "lucide-react";
import { flightTrackLinks, parseRequestNotes } from "./transportFormat";
import type { FlightTrackLink } from "./transportFormat";

/**
 * The customer's request, split into the things a dispatcher or driver acts on:
 * flight number, return trip and free-text notes. Renders nothing when there is no request.
 */
export function RequestNotes({
  text,
  variant = "admin",
}: {
  text?: string | null;
  variant?: "admin" | "driver";
}) {
  const parsed = parseRequestNotes(text);
  if (!parsed || (!parsed.flight && !parsed.returnTrip && !parsed.notes)) return null;

  const trackLinks = flightTrackLinks(parsed.flight);

  const rows = [
    parsed.flight && { icon: Plane, label: "Flight", value: parsed.flight, emphasis: true, links: trackLinks },
    parsed.returnTrip && { icon: Repeat, label: "Return trip", value: parsed.returnTrip, emphasis: true, links: [] },
    parsed.notes && { icon: StickyNote, label: "Customer notes", value: parsed.notes, emphasis: false, links: [] },
  ].filter(Boolean) as { icon: typeof Plane; label: string; value: string; emphasis: boolean; links: FlightTrackLink[] }[];

  if (variant === "driver") {
    return (
      <div className="space-y-2">
        {rows.map(({ icon: Icon, label, value, emphasis, links }) => (
          <div key={label} className="flex items-start gap-2.5 bg-amber-500/[0.08] border border-amber-500/20 rounded-xl px-3.5 py-2.5">
            <Icon size={13} className="text-amber-400 mt-0.5 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-amber-400/80 uppercase tracking-wide">{label}</p>
              <p className={`text-amber-200 leading-snug whitespace-pre-line break-words ${emphasis ? "text-sm font-semibold" : "text-xs"}`}>{value}</p>
              {links.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {links.map((link) => (
                    <a
                      key={link.flight}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Track flight ${link.flight} on Flightradar24 (opens in a new tab)`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold hover:bg-sky-500/25 transition-colors touch-manipulation"
                    >
                      <ExternalLink size={12} aria-hidden />
                      {links.length > 1 ? `Track ${link.flight}` : "Track flight"}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map(({ icon: Icon, label, value, emphasis, links }) => (
        <div key={label} className="flex items-start gap-3">
          <Icon size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} aria-hidden />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</p>
            <p
              className="text-[13px] whitespace-pre-line break-words"
              style={{ color: "var(--text-primary)", fontWeight: emphasis ? 600 : 400 }}
            >
              {value}
            </p>
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1.5">
                {links.map((link) => (
                  <a
                    key={link.flight}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Track flight ${link.flight} on Flightradar24 (opens in a new tab)`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                    style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--accent-navy-light)" }}
                  >
                    <ExternalLink size={12} aria-hidden />
                    {links.length > 1 ? `Track ${link.flight}` : "Track flight"}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      {parsed.fromLegacyInquiry && (
        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          Created through the older inquiry flow, so only the details above were kept as notes.
        </p>
      )}
    </div>
  );
}

import { Plane, Repeat, StickyNote } from "lucide-react";
import { parseRequestNotes } from "./transportFormat";

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

  const rows = [
    parsed.flight && { icon: Plane, label: "Flight", value: parsed.flight, emphasis: true },
    parsed.returnTrip && { icon: Repeat, label: "Return trip", value: parsed.returnTrip, emphasis: true },
    parsed.notes && { icon: StickyNote, label: "Customer notes", value: parsed.notes, emphasis: false },
  ].filter(Boolean) as { icon: typeof Plane; label: string; value: string; emphasis: boolean }[];

  if (variant === "driver") {
    return (
      <div className="space-y-2">
        {rows.map(({ icon: Icon, label, value, emphasis }) => (
          <div key={label} className="flex items-start gap-2.5 bg-amber-500/[0.08] border border-amber-500/20 rounded-xl px-3.5 py-2.5">
            <Icon size={13} className="text-amber-400 mt-0.5 shrink-0" aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] text-amber-400/80 uppercase tracking-wide">{label}</p>
              <p className={`text-amber-200 leading-snug whitespace-pre-line break-words ${emphasis ? "text-sm font-semibold" : "text-xs"}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map(({ icon: Icon, label, value, emphasis }) => (
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

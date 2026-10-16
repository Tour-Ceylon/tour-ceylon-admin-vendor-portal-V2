import { useState } from "react";
import { Loader2, Megaphone } from "lucide-react";
import { AdminTransportBooking, setDriverNote } from "../../api/adminTransportApi";
import { DetailCard } from "./BookingDetailCards";
import { formatDateTime } from "./transportFormat";

const LIMIT = 1000;

/**
 * A note for the driver on this trip, written by the admin team. The assigned driver sees it on the trip;
 * the customer never does. Kept apart from the internal notes (team only) and the customer's own request.
 */
export function DriverNoteEditor({
  booking,
  onSaved,
}: {
  booking: AdminTransportBooking;
  onSaved: (updated: AdminTransportBooking) => void;
}) {
  const saved = booking.driver_note || "";
  const [text, setText] = useState(saved);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dirty = text.trim() !== saved.trim();

  const save = async () => {
    setBusy(true);
    setErrorMsg(null);
    try {
      const updated = await setDriverNote(booking.id, text);
      setText(updated.driver_note || "");
      onSaved(updated);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not save the note. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DetailCard
      title="Note for the driver"
      aside={
        <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          <Megaphone size={12} aria-hidden /> The driver sees this. The customer doesn't.
        </span>
      }
    >
      <label htmlFor="driver-note" className="sr-only">Note for the driver</label>
      <textarea
        id="driver-note"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={LIMIT}
        placeholder="e.g. Meet the customer at gate 2. They have a wheelchair."
        className="w-full px-3 py-2 text-[13px] rounded-lg resize-none"
        style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
      />
      <div className="flex items-center justify-between gap-3 mt-3">
        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }} aria-live="polite">
          {errorMsg ? (
            <span style={{ color: "var(--error)" }} role="alert">{errorMsg}</span>
          ) : dirty ? (
            "Unsaved changes"
          ) : saved ? (
            `Saved ${formatDateTime(booking.driver_note_updated_at)}`
          ) : booking.driver ? (
            "No note yet"
          ) : (
            "No driver assigned yet. A note you save now shows once a driver is assigned."
          )}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>{text.length}/{LIMIT}</span>
          <button
            onClick={save}
            disabled={!dirty || busy}
            className="px-4 py-2 text-[13px] rounded-lg flex items-center gap-2 disabled:opacity-50"
            style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600 }}
          >
            {busy && <Loader2 size={14} className="animate-spin" aria-hidden />}
            {saved && !text.trim() ? "Remove note" : "Save note"}
          </button>
        </div>
      </div>
    </DetailCard>
  );
}

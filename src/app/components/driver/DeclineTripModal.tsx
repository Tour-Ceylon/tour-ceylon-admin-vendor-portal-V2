import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { declineTrip } from "../api/driverTripApi";

export const DECLINE_REASONS = [
  "Vehicle mechanical issue",
  "Distance too far / Location unreachable",
  "Personal emergency",
  "Schedule conflict / Shift ending",
  "Traffic / Extreme road conditions",
  "Other",
];

/**
 * Asks the driver why they are declining, sends it, and reports failure instead of closing silently.
 * Shared by the dispatch inbox and the trip detail screen.
 */
export function DeclineTripModal({
  tripId,
  bookingReference,
  onClose,
  onDeclined,
}: {
  tripId: string;
  bookingReference: string;
  onClose: () => void;
  onDeclined: () => void;
}) {
  const [reason, setReason] = useState(DECLINE_REASONS[0]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await declineTrip(tripId, reason, note.trim() || undefined);
      onDeclined();
    } catch (err: any) {
      setErrorMsg(err?.message || "Could not decline this trip. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={submitting ? undefined : onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Decline trip ${bookingReference}`}
        className="fixed inset-x-4 bottom-4 lg:inset-0 lg:m-auto lg:max-w-md lg:h-fit z-50 rounded-2xl overflow-hidden bg-[#070E1D] border border-white/[0.08]"
      >
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-3">
          <div>
            <p className="text-white font-bold text-sm">Decline assignment</p>
            <p className="text-slate-500 text-xs mt-0.5">Trip {bookingReference} will go back to dispatch</p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-slate-400 text-xs font-medium">Select a reason:</p>
          <div className="space-y-1.5" role="radiogroup" aria-label="Reason for declining">
            {DECLINE_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={reason === r}
                onClick={() => setReason(r)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                  reason === r
                    ? "bg-blue-600/15 border border-blue-500/25 text-blue-300"
                    : "bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
                }`}
              >
                <span>{r}</span>
                {reason === r && <CheckCircle2 size={13} className="text-blue-400 shrink-0" aria-hidden />}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="decline-note" className="text-slate-400 text-xs font-medium block mb-1.5">
              Note for dispatch (optional)
            </label>
            <textarea
              id="decline-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Give dispatch a little context…"
              rows={2}
              maxLength={500}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white/[0.03] border border-white/[0.06] text-slate-300 placeholder-slate-600 outline-none resize-none focus:border-blue-500/40 transition-colors"
            />
          </div>

          {errorMsg && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
              <AlertCircle size={13} className="shrink-0 mt-0.5" aria-hidden />
              {errorMsg}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-500 disabled:opacity-60 transition-all"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Confirm decline
            </button>
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-400 text-sm hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

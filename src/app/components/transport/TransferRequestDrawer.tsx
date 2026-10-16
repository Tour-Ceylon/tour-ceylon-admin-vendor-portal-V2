import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Loader2, Mail, Phone, RotateCcw, X, XCircle } from "lucide-react";
import { DriverAssignmentSection } from "./DriverAssignmentSection";
import { DriverNoteEditor } from "./shared/DriverNoteEditor";
import {
  AdminTransportBooking,
  TransportBookingStatus,
  updateTransportBookingNotes,
  updateTransportBookingStatus,
} from "../api/adminTransportApi";
import { AssignmentStatusBadge, BookingStatusBadge, PaymentStatusBadge } from "./shared/TransportStatusBadges";
import {
  CustomerCard,
  DeclineHistoryCard,
  DetailCard,
  FareCard,
  RouteCard,
  TripCard,
} from "./shared/BookingDetailCards";

interface TransferRequestDrawerProps {
  booking: AdminTransportBooking;
  onClose: () => void;
  onRefresh?: () => void;
}

const actionButton = {
  base: "flex-1 px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60",
};

export function TransferRequestDrawer({ booking: initialBooking, onClose, onRefresh }: TransferRequestDrawerProps) {
  const [booking, setBooking] = useState<AdminTransportBooking>(initialBooking);
  const [notes, setNotes] = useState(initialBooking.internal_notes || "");
  const [savedNotes, setSavedNotes] = useState(initialBooking.internal_notes || "");
  const [busy, setBusy] = useState<"status" | "notes" | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const applyUpdate = (updated: AdminTransportBooking) => {
    setBooking(updated);
    onRefresh?.();
  };

  const changeStatus = async (status: TransportBookingStatus) => {
    setBusy("status");
    setErrorMsg(null);
    try {
      applyUpdate(await updateTransportBookingStatus(booking.id, status));
      setConfirmingCancel(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not update the booking status. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const saveNotes = async () => {
    setBusy("notes");
    setErrorMsg(null);
    try {
      const updated = await updateTransportBookingNotes(booking.id, notes);
      setSavedNotes(updated.internal_notes || "");
      applyUpdate(updated);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not save the notes. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const notesDirty = notes !== savedNotes;
  const status = booking.booking_status;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} style={{ animation: "fadeIn 0.2s ease-out" }} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Transfer booking ${booking.booking_reference}`}
        className="fixed right-0 top-0 h-full w-full max-w-[750px] z-50 overflow-y-auto"
        style={{
          background: "var(--bg-main)",
          borderLeft: "1px solid var(--border-light)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
          animation: "slideInRight 0.3s ease-out",
        }}
      >
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-start justify-between gap-4"
          style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border-light)" }}
        >
          <div className="min-w-0">
            <h2 className="text-[18px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              Transfer booking
            </h2>
            <p className="text-[12px] font-mono mb-2" style={{ color: "var(--text-tertiary)" }}>
              {booking.booking_reference}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <BookingStatusBadge status={booking.booking_status} />
              <PaymentStatusBadge status={booking.payment_status} />
              <AssignmentStatusBadge status={booking.assignment_status} />
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0"
            style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-tertiary)" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-[12px]"
              style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "var(--error)" }}
            >
              <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden />
              {errorMsg}
            </div>
          )}

          {/* Booking decision */}
          {status !== "completed" && (
            <DetailCard title="Booking decision">
              {status === "cancelled" ? (
                <button
                  onClick={() => changeStatus("pending")}
                  disabled={busy === "status"}
                  className={actionButton.base}
                  style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)", width: "100%" }}
                >
                  {busy === "status" ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                  Reopen as pending
                </button>
              ) : (
                <div className="flex gap-3">
                  {status === "pending" && (
                    <button
                      onClick={() => changeStatus("confirmed")}
                      disabled={busy === "status"}
                      className={actionButton.base}
                      style={{ background: "var(--success)", color: "white", fontWeight: 600 }}
                    >
                      {busy === "status" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Confirm booking
                    </button>
                  )}
                  {confirmingCancel ? (
                    <>
                      <button
                        onClick={() => changeStatus("cancelled")}
                        disabled={busy === "status"}
                        className={actionButton.base}
                        style={{ background: "var(--error)", color: "white", fontWeight: 600 }}
                      >
                        {busy === "status" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        Yes, cancel booking
                      </button>
                      <button
                        onClick={() => setConfirmingCancel(false)}
                        className={actionButton.base}
                        style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                      >
                        Keep booking
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmingCancel(true)}
                      className={actionButton.base}
                      style={{ background: "var(--input-background)", border: "1px solid var(--error)", color: "var(--error)", fontWeight: 600 }}
                    >
                      <XCircle size={14} />
                      Cancel booking
                    </button>
                  )}
                </div>
              )}
              {confirmingCancel && booking.driver && (
                <p className="text-[12px] mt-3" style={{ color: "var(--text-tertiary)" }}>
                  A driver is assigned. Let them know the trip is off before cancelling.
                </p>
              )}
            </DetailCard>
          )}

          <DriverAssignmentSection
            bookingId={booking.id}
            currentDriver={booking.driver}
            assignmentStatus={booking.assignment_status || "unassigned"}
            assignedAt={booking.assigned_at}
            onDriverAssigned={applyUpdate}
          />

          <DriverNoteEditor booking={booking} onSaved={applyUpdate} />

          <DeclineHistoryCard booking={booking} />
          <CustomerCard booking={booking} />
          <RouteCard booking={booking} />
          <TripCard booking={booking} />
          <FareCard booking={booking} />

          <DetailCard
            title="Internal notes"
            aside={<span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Only your team sees these</span>}
          >
            <label htmlFor="internal-notes" className="sr-only">Internal notes</label>
            <textarea
              id="internal-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add operational notes for this transfer…"
              rows={4}
              className="w-full px-3 py-2 text-[13px] rounded-lg resize-none"
              style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }} aria-live="polite">
                {notesDirty ? "Unsaved changes" : savedNotes ? "Saved" : ""}
              </span>
              <button
                onClick={saveNotes}
                disabled={!notesDirty || busy === "notes"}
                className="px-4 py-2 text-[13px] rounded-lg flex items-center gap-2 disabled:opacity-50"
                style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600 }}
              >
                {busy === "notes" && <Loader2 size={14} className="animate-spin" />}
                Save notes
              </button>
            </div>
          </DetailCard>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`mailto:${booking.customer_email}?subject=${encodeURIComponent(`Your transfer ${booking.booking_reference}`)}`}
              className="px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
              style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              <Mail size={14} aria-hidden /> Email customer
            </a>
            <a
              href={`tel:${booking.customer_phone.replace(/\s+/g, "")}`}
              className="px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
              style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              <Phone size={14} aria-hidden /> Call customer
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @media (prefers-reduced-motion: reduce) {
          [role="dialog"], .fixed.inset-0 { animation: none !important; }
        }
      `}</style>
    </>
  );
}

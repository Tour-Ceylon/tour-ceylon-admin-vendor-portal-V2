import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  Clock,
  MapPin,
  Users,
  Luggage,
  CheckCircle2,
  Loader2,
  RefreshCw,
  X,
  AlertTriangle,
  Ruler,
  InboxIcon,
} from "lucide-react";
import {
  DriverTripSummary,
  acknowledgeTrip,
  declineTrip,
  fetchMyTrips,
} from "../api/driverTripApi";

const DECLINE_REASONS = [
  "Vehicle mechanical issue",
  "Distance too far / Location unreachable",
  "Personal emergency",
  "Schedule conflict / Shift ending",
  "Traffic / Extreme road conditions",
  "Other",
];

function formatTime(t?: string | null) {
  if (!t) return "--";
  return t.substring(0, 5);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DeclineModal({
  trip,
  onClose,
  onConfirm,
}: {
  trip: DriverTripSummary;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [reason, setReason] = useState(DECLINE_REASONS[0]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await declineTrip(trip.id, reason, note || undefined);
      onConfirm();
    } catch (err: any) {
      console.error("Failed to decline:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-x-4 bottom-4 lg:inset-0 lg:m-auto lg:max-w-md lg:h-fit z-50 rounded-2xl overflow-hidden bg-[#070E1D] border border-white/[0.08]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-3">
          <div>
            <p className="text-white font-bold text-sm">Decline Assignment</p>
            <p className="text-slate-500 text-xs mt-0.5">
              Trip {trip.booking_reference} will be returned to dispatch
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-slate-400 text-xs font-medium">Select reason:</p>
          <div className="space-y-1.5">
            {DECLINE_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                  reason === r
                    ? "bg-blue-600/15 border border-blue-500/25 text-blue-300"
                    : "bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
                }`}
              >
                <span>{r}</span>
                {reason === r && (
                  <CheckCircle2 size={13} className="text-blue-400 shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div>
            <p className="text-slate-400 text-xs font-medium mb-1.5">
              Additional note (optional):
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Provide brief context for dispatch..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white/[0.03] border border-white/[0.06] text-slate-300 placeholder-slate-600 outline-none resize-none focus:border-blue-500/40 transition-colors"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-500 disabled:opacity-60 transition-all"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Confirm Decline
            </button>
            <button
              onClick={onClose}
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

function DispatchCard({
  trip,
  onAccepted,
  onDeclined,
}: {
  trip: DriverTripSummary;
  onAccepted: (id: string) => void;
  onDeclined: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [accepting, setAccepting] = useState(false);
  const [showDecline, setShowDecline] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await acknowledgeTrip(trip.id);
      onAccepted(trip.id);
      navigate(`/driver/trips/${trip.id}`);
    } catch (err) {
      console.error("Failed to accept:", err);
      setAccepting(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-white/[0.06] flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/60">
                {trip.booking_reference}
              </span>
            </div>
            <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-1">
              <Clock size={11} />
              {formatDate(trip.travel_date)} at {formatTime(trip.pickup_time)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-emerald-400 font-extrabold text-2xl leading-none">
              ${Number(trip.total_price).toFixed(2)}
            </p>
            <p className="text-slate-500 text-[10px] mt-0.5">{trip.currency}</p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Route */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mt-0.5 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Pickup</p>
                <p className="text-slate-200 text-sm leading-snug">{trip.pickup_location}</p>
              </div>
            </div>
            <div className="ml-2 pl-[6px] border-l border-dashed border-slate-700 h-3" />
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mt-0.5 shrink-0">
                <MapPin size={8} className="text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Drop-off</p>
                <p className="text-slate-200 text-sm leading-snug">
                  {trip.destination_location}
                </p>
              </div>
            </div>
          </div>

          {/* Distance + duration chips */}
          <div className="flex gap-2 flex-wrap">
            {trip.distance_km && (
              <span className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-full text-xs text-slate-400">
                <Ruler size={11} />
                {trip.distance_km} km
              </span>
            )}
            {trip.estimated_duration_minutes && (
              <span className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-full text-xs text-slate-400">
                <Clock size={11} />
                ~{trip.estimated_duration_minutes} mins
              </span>
            )}
          </div>

          {/* Pax + luggage + payment chips */}
          <div className="flex gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 bg-blue-500/[0.08] border border-blue-500/15 px-3 py-1.5 rounded-full text-xs text-blue-300">
              <Users size={11} />
              {trip.passengers_count} {trip.passengers_count === 1 ? "Passenger" : "Passengers"}
            </span>
            <span className="flex items-center gap-1.5 bg-blue-500/[0.08] border border-blue-500/15 px-3 py-1.5 rounded-full text-xs text-blue-300">
              <Luggage size={11} />
              {trip.luggage_count} {trip.luggage_count === 1 ? "Bag" : "Bags"}
            </span>
            <span
              className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase border ${
                trip.payment_status === "paid"
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/25 text-amber-400"
              }`}
            >
              {trip.payment_status}
            </span>
          </div>

          {/* Special requests */}
          {trip.special_requests && (
            <div className="flex items-start gap-2.5 bg-amber-500/[0.08] border border-amber-500/20 rounded-xl px-3.5 py-2.5">
              <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-amber-300 text-xs leading-snug">{trip.special_requests}</p>
            </div>
          )}

          {/* Action pair */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => setShowDecline(true)}
              className="py-3.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/[0.08] transition-all flex items-center justify-center gap-2"
            >
              <X size={15} />
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {accepting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={15} />
              )}
              {accepting ? "Accepting..." : "Accept Trip"}
            </button>
          </div>
        </div>
      </div>

      {showDecline && (
        <DeclineModal
          trip={trip}
          onClose={() => setShowDecline(false)}
          onConfirm={() => {
            setShowDecline(false);
            onDeclined(trip.id);
          }}
        />
      )}
    </>
  );
}

export function DriverInboxScreen() {
  const { refreshDriverState } = useOutletContext<{
    refreshDriverState: () => void;
  }>();

  const [trips, setTrips] = useState<DriverTripSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInbox = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const list = await fetchMyTrips("assigned");
      setTrips(list);
    } catch (err) {
      console.error("Failed to load inbox:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const remove = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    refreshDriverState();
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl lg:max-w-none mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-white font-bold text-xl">Dispatch Inbox</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {loading
              ? "Loading..."
              : trips.length > 0
              ? `${trips.length} ${trips.length === 1 ? "trip" : "trips"} pending your response`
              : "No pending dispatches"}
          </p>
        </div>
        <button
          onClick={() => loadInbox(true)}
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] transition-all"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-slate-500 text-xs">
          <Loader2 size={16} className="animate-spin text-blue-400" />
          Checking for incoming assignments...
        </div>
      ) : trips.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <p className="text-white font-bold text-base">Inbox is Clear</p>
          <p className="text-slate-500 text-sm mt-1.5 max-w-xs">
            No trips are waiting for a response. New dispatches will appear here
            automatically.
          </p>
          <div className="mt-6 flex items-center gap-2 text-slate-500 text-xs">
            <InboxIcon size={12} />
            Polling every 20 seconds
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <DispatchCard
              key={trip.id}
              trip={trip}
              onAccepted={remove}
              onDeclined={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

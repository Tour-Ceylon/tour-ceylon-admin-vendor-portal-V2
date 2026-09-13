import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Navigation,
  Clock,
  Users,
  Luggage,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Car,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import {
  DriverTripDetail,
  fetchMyTripDetail,
  updateTripProgressStatus,
} from "../api/driverTripApi";

type AssignmentStatus =
  | "acknowledged"
  | "en_route"
  | "arrived"
  | "in_progress"
  | "completed";

const STEPS: {
  key: AssignmentStatus;
  label: string;
  description: string;
}[] = [
  { key: "acknowledged", label: "Accepted", description: "Trip confirmed by you" },
  { key: "en_route", label: "En Route", description: "Driving to passenger pickup point" },
  { key: "arrived", label: "Arrived", description: "Waiting at pickup location" },
  { key: "in_progress", label: "Trip Started", description: "Passengers onboard, driving to destination" },
  { key: "completed", label: "Completed", description: "Passengers dropped off safely" },
];

const STEP_ORDER: AssignmentStatus[] = [
  "acknowledged",
  "en_route",
  "arrived",
  "in_progress",
  "completed",
];

const CTA_LABEL: Record<AssignmentStatus, string> = {
  acknowledged: "Start Heading to Pickup (En Route)",
  en_route: "I Have Arrived at Pickup",
  arrived: "Start Trip with Passenger",
  in_progress: "Complete Trip & Record Fare",
  completed: "",
};

function formatTime(t?: string | null) {
  if (!t) return "--";
  return t.substring(0, 5);
}

function buildMapsUrl(trip: DriverTripDetail, status: AssignmentStatus) {
  const target =
    status === "acknowledged" || status === "en_route"
      ? trip.pickup_location
      : trip.destination_location;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}`;
}

export function DriverTripDetailScreen() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<DriverTripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadTrip = async () => {
    if (!bookingId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchMyTripDetail(bookingId);
      setTrip(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load trip details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrip();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
        <Loader2 size={26} className="animate-spin text-blue-400" />
        <p className="text-xs">Loading trip console...</p>
      </div>
    );
  }

  if (errorMsg || !trip) {
    return (
      <div className="px-4 py-16 text-center space-y-4 max-w-sm mx-auto">
        <AlertCircle size={32} className="text-red-400 mx-auto" />
        <p className="text-white font-bold text-base">
          {errorMsg || "Trip not found"}
        </p>
        <Link
          to="/driver/trips"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-slate-300"
        >
          <ArrowLeft size={14} />
          Return to Schedule
        </Link>
      </div>
    );
  }

  const currentIdx = STEP_ORDER.indexOf(trip.assignment_status as AssignmentStatus);
  const nextStatus =
    currentIdx >= 0 && currentIdx < STEP_ORDER.length - 1
      ? STEP_ORDER[currentIdx + 1]
      : null;

  const isTripFinished = trip.assignment_status === "completed";

  const advance = async () => {
    if (!nextStatus || !bookingId) return;
    setAdvancing(true);
    setErrorMsg(null);
    try {
      const updated = await updateTripProgressStatus(bookingId, nextStatus);
      setTrip(updated);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update trip progress");
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl lg:max-w-none mx-auto space-y-4">
      {/* Back + booking ref */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <span className="font-mono text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded border border-slate-700/60">
          {trip.booking_reference}
        </span>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
          <AlertCircle size={13} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Completion banner */}
      {isTripFinished && (
        <div className="rounded-2xl p-6 text-center space-y-2 bg-emerald-500/8 border border-emerald-500/25">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 size={26} className="text-emerald-400" />
          </div>
          <p className="text-white font-bold text-lg">Trip Completed!</p>
          <p className="text-emerald-300 text-sm">
            ${Number(trip.total_price).toFixed(2)} has been recorded to your
            payout balance.
          </p>
        </div>
      )}

      {/* Milestone stepper */}
      {!isTripFinished && (
        <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">
                Live Trip Progression
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Tap button below as you reach each milestone
              </p>
            </div>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
              Step {Math.max(1, currentIdx + 1)} / 5
            </span>
          </div>

          <div className="px-5 py-4 space-y-0">
            {STEPS.map((step, idx) => {
              const isPast = idx < currentIdx;
              const isActive = idx === currentIdx;

              return (
                <div key={step.key} className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPast
                          ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                          : isActive
                          ? "bg-blue-600 text-white step-pulse"
                          : "bg-slate-800 border border-slate-700 text-slate-500"
                      }`}
                    >
                      {isPast ? <CheckCircle2 size={14} /> : idx + 1}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`w-px h-7 my-1 ${
                          isPast ? "bg-emerald-500/40" : "bg-slate-700"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1 pb-6">
                    <p
                      className={`text-sm font-bold ${
                        isActive
                          ? "text-blue-300"
                          : isPast
                          ? "text-emerald-300"
                          : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        isActive ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Advance CTA */}
          {nextStatus && (
            <div className="px-5 pb-5">
              <button
                onClick={advance}
                disabled={advancing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2.5 hover:from-blue-600 hover:to-blue-500 disabled:opacity-60 transition-all shadow-lg shadow-blue-900/30"
              >
                <Navigation size={16} />
                {advancing
                  ? "Updating..."
                  : CTA_LABEL[trip.assignment_status as AssignmentStatus]}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Route & navigation */}
      <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-white/[0.06]">
          <p className="text-white font-bold text-sm">Route & Navigation</p>
        </div>
        <div className="px-5 py-4 space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mt-0.5 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Pickup</p>
              <p className="text-slate-200 text-sm">{trip.pickup_location}</p>
            </div>
          </div>
          <div className="ml-2 w-px h-3 bg-slate-700" />
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mt-0.5 shrink-0">
              <MapPin size={8} className="text-red-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Drop-off</p>
              <p className="text-slate-200 text-sm">{trip.destination_location}</p>
            </div>
          </div>

          {/* Distance + duration */}
          <div className="flex gap-2 pt-0.5">
            {trip.distance_km && (
              <span className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-full text-xs text-slate-400">
                <Navigation size={11} />
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

          {/* Maps button */}
          <a
            href={buildMapsUrl(trip, trip.assignment_status as AssignmentStatus)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#0284C7]/15 border border-[#0284C7]/30 text-sky-400 text-sm font-semibold hover:bg-[#0284C7]/25 transition-all"
          >
            <ExternalLink size={15} />
            Open in Google Maps
          </a>
        </div>
      </div>

      {/* Passenger contact */}
      <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-white/[0.06]">
          <p className="text-white font-bold text-sm">Passenger Contact</p>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold text-base">{trip.customer.name}</p>
            <p className="text-slate-400 text-sm mt-0.5">{trip.customer.phone}</p>
            {trip.customer.country && (
              <p className="text-slate-600 text-xs mt-0.5">{trip.customer.country}</p>
            )}
          </div>
          <a
            href={`tel:${trip.customer.phone}`}
            className="flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/30 shrink-0"
          >
            <Phone size={16} />
            Call Passenger
          </a>
        </div>
      </div>

      {/* Specs + fare */}
      <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-white/[0.06]">
          <p className="text-white font-bold text-sm">Vehicle & Trip Specs</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          {/* Vehicle + pickup time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] rounded-xl p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                Pickup Time
              </p>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" />
                <p className="text-slate-200 text-sm font-semibold">
                  {formatTime(trip.pickup_time)}
                </p>
              </div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                Vehicle
              </p>
              <div className="flex items-center gap-1.5">
                <Car size={13} className="text-slate-400" />
                <p className="text-slate-200 text-xs font-semibold leading-snug">
                  {trip.vehicle_category_name || "Standard Sedan"}
                </p>
              </div>
            </div>
          </div>

          {/* Pax + luggage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] rounded-xl p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                Passengers
              </p>
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-blue-400" />
                <p className="text-slate-200 text-sm font-semibold">
                  {trip.passengers_count}
                </p>
              </div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                Luggage
              </p>
              <div className="flex items-center gap-1.5">
                <Luggage size={13} className="text-blue-400" />
                <p className="text-slate-200 text-sm font-semibold">
                  {trip.luggage_count} items
                </p>
              </div>
            </div>
          </div>

          {/* Special requests */}
          {trip.special_requests && (
            <div className="flex items-start gap-2.5 bg-amber-500/[0.08] border border-amber-500/20 rounded-xl px-3.5 py-2.5">
              <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-amber-300 text-xs leading-snug">
                {trip.special_requests}
              </p>
            </div>
          )}
        </div>

        {/* Fare footer */}
        <div className="mx-5 mb-5 rounded-xl bg-gradient-to-r from-slate-800/60 to-slate-800/30 border border-white/[0.06] px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-[10px] uppercase tracking-wide">
              Total Trip Fare
            </p>
            <p className="text-white font-extrabold text-2xl mt-0.5">
              ${Number(trip.total_price).toFixed(2)}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border ${
              trip.payment_status === "paid"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-amber-500/15 border-amber-500/30 text-amber-400"
            }`}
          >
            {trip.payment_status}
          </span>
        </div>
      </div>
    </div>
  );
}

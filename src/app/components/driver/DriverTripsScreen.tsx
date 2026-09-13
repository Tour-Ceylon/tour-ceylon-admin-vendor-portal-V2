import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { DriverTripSummary, fetchMyTrips } from "../api/driverTripApi";

function formatTime(t?: string | null) {
  if (!t) return "--";
  return t.substring(0, 5);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  acknowledged: {
    label: "Accepted",
    cls: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  },
  en_route: {
    label: "En Route",
    cls: "bg-sky-500/15 text-sky-300 border-sky-500/25",
  },
  arrived: {
    label: "Arrived",
    cls: "bg-sky-500/15 text-sky-300 border-sky-500/25",
  },
  in_progress: {
    label: "In Progress",
    cls: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  },
};

export function DriverTripsScreen() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<DriverTripSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadTrips = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchMyTrips("upcoming");
      setTrips(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load upcoming trips");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl lg:max-w-none mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-white font-bold text-xl">Upcoming Schedule</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {loading
              ? "Loading..."
              : `${trips.length} confirmed ${trips.length === 1 ? "trip" : "trips"} scheduled`}
          </p>
        </div>
        <button
          onClick={() => loadTrips(true)}
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] transition-all"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs mb-4">
          <AlertCircle size={14} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-slate-500 text-xs">
          <Loader2 size={16} className="animate-spin text-blue-400" />
          Loading upcoming schedule...
        </div>
      ) : trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-white/[0.06] flex items-center justify-center mb-4">
            <Clock size={28} className="text-slate-500" />
          </div>
          <p className="text-white font-bold text-base">No Upcoming Trips</p>
          <p className="text-slate-500 text-sm mt-1.5 max-w-xs">
            Accepted trip dispatches will appear here. Check your Inbox to
            review new assignments.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => {
            const badge = STATUS_BADGE[trip.assignment_status] ?? {
              label: trip.assignment_status.replace("_", " "),
              cls: "bg-slate-700/40 text-slate-400 border-slate-700/40",
            };
            const isActive = ["en_route", "arrived", "in_progress"].includes(
              trip.assignment_status
            );

            return (
              <button
                key={trip.id}
                onClick={() => navigate(`/driver/trips/${trip.id}`)}
                className={`w-full text-left rounded-2xl bg-[#070E1D] overflow-hidden group transition-all hover:bg-[#080F20] ${
                  isActive
                    ? "border border-blue-500/30"
                    : "border border-white/[0.06]"
                }`}
              >
                {/* Card header row */}
                <div className="px-5 pt-4 pb-2.5 border-b border-white/[0.04] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/60">
                      {trip.booking_reference}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium group-hover:gap-2.5 transition-all shrink-0">
                    <span>Manage</span>
                    <ChevronRight size={14} />
                  </div>
                </div>

                <div className="px-5 py-4 space-y-3.5">
                  {/* Date + time */}
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Clock size={12} className="text-slate-500" />
                    {formatDate(trip.travel_date)} · Pickup at{" "}
                    {formatTime(trip.pickup_time)}
                  </div>

                  {/* Passenger */}
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-slate-500" />
                    <span className="text-slate-200 text-sm font-medium">
                      {trip.customer_name}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500 text-xs">
                      {trip.passengers_count} pax, {trip.luggage_count} bags
                    </span>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-2.5 text-xs">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div className="w-px h-4 bg-slate-700" />
                      <MapPin size={8} className="text-red-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-slate-300 leading-snug">
                        {trip.pickup_location.split(",").slice(0, 2).join(",")}
                      </p>
                      <p className="text-slate-400 leading-snug">
                        {trip.destination_location
                          .split(",")
                          .slice(0, 2)
                          .join(",")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-emerald-400 font-bold text-base">
                        ${Number(trip.total_price).toFixed(2)}
                      </p>
                      {trip.distance_km && (
                        <p className="text-slate-600 text-[10px]">
                          {trip.distance_km} km
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

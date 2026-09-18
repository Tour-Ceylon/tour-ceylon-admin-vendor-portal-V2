import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  MapPin,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { DriverTripSummary, fetchMyTrips } from "../api/driverTripApi";

type Filter = "all" | "completed" | "declined";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusPill({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/25 text-emerald-400">
        <CheckCircle2 size={9} />
        Completed
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border bg-red-500/10 border-red-500/25 text-red-400">
      <XCircle size={9} />
      Declined
    </span>
  );
}

function HistoryCard({
  trip,
  onView,
}: {
  trip: DriverTripSummary;
  onView: () => void;
}) {
  return (
    <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-white/[0.04] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/60">
            {trip.booking_reference}
          </span>
          <StatusPill status={trip.assignment_status} />
        </div>
        <span className="text-emerald-400 font-bold text-base shrink-0">
          {trip.assignment_status === "completed"
            ? `$${Number(trip.total_price).toFixed(2)}`
            : "—"}
        </span>
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* Passenger + date */}
        <div className="flex items-center justify-between">
          <p className="text-slate-200 text-sm font-medium">{trip.customer_name}</p>
          <p className="text-slate-500 text-xs">{formatDate(trip.travel_date)}</p>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="w-px h-3 bg-slate-700" />
            <MapPin size={8} className="text-red-400" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-slate-400 leading-snug">
              {trip.pickup_location.split(",").slice(0, 2).join(",")}
            </p>
            <p className="text-slate-500 leading-snug">
              {trip.destination_location.split(",").slice(0, 2).join(",")}
            </p>
          </div>
        </div>

        {/* View record link */}
        <button
          onClick={onView}
          className="w-full flex items-center justify-between py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors group border-t border-white/[0.04] pt-3"
        >
          <span>View Record</span>
          <ChevronRight
            size={13}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>
    </div>
  );
}

export function DriverHistoryScreen() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<DriverTripSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadHistory = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchMyTrips("history");
      setTrips(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load trip history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const completedCount = trips.filter((t) => t.assignment_status === "completed").length;
  const declinedCount = trips.filter((t) => t.assignment_status === "declined").length;

  const filtered =
    filter === "all"
      ? trips
      : trips.filter((t) => t.assignment_status === filter);

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All Records", count: trips.length },
    { key: "completed", label: "Completed", count: completedCount },
    { key: "declined", label: "Declined", count: declinedCount },
  ];

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl lg:max-w-none mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-white font-bold text-xl">Trip History</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {loading ? "Loading..." : `${trips.length} records total`}
          </p>
        </div>
        <button
          onClick={() => loadHistory(true)}
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] transition-all"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs mb-4">
          <AlertCircle size={13} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Segmented filter tabs */}
      <div className="flex gap-2 mb-5 p-1 bg-[#070E1D] border border-white/[0.06] rounded-xl">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === key
                ? "bg-blue-600/15 border border-blue-500/25 text-blue-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {label}
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                filter === key
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-slate-500 text-xs">
          <Loader2 size={16} className="animate-spin text-blue-400" />
          Loading historical records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-white font-bold text-base">No Records Found</p>
          <p className="text-slate-500 text-sm mt-1.5">
            No{filter === "all" ? "" : ` ${filter}`} trips in your history yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((trip) => (
            <HistoryCard
              key={trip.id}
              trip={trip}
              onView={() => navigate(`/driver/trips/${trip.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  XCircle,
  Ban,
  ChevronRight,
  MapPin,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  DriverTripDeclineRecord,
  DriverTripSummary,
  fetchMyDeclines,
  fetchMyTrips,
} from "../api/driverTripApi";
import { formatDay, formatMoney } from "../transport/shared/transportFormat";

type Filter = "all" | "completed" | "cancelled" | "declined";

type Entry =
  | { kind: "trip"; sortKey: string; trip: DriverTripSummary }
  | { kind: "decline"; sortKey: string; record: DriverTripDeclineRecord };

function Pill({ tone, icon: Icon, label }: { tone: "green" | "red" | "slate"; icon: typeof XCircle; label: string }) {
  const classes = {
    green: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
    red: "bg-red-500/10 border-red-500/25 text-red-400",
    slate: "bg-slate-500/10 border-slate-500/25 text-slate-400",
  }[tone];
  return (
    <span className={`flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${classes}`}>
      <Icon size={9} aria-hidden />
      {label}
    </span>
  );
}

function Route({ pickup, destination }: { pickup?: string; destination?: string }) {
  const short = (value?: string) => (value || "—").split(",").slice(0, 2).join(",");
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <div className="w-px h-3 bg-slate-700" />
        <MapPin size={8} className="text-red-400" aria-hidden />
      </div>
      <div className="flex-1 space-y-1 min-w-0">
        <p className="text-slate-400 leading-snug truncate">{short(pickup)}</p>
        <p className="text-slate-500 leading-snug truncate">{short(destination)}</p>
      </div>
    </div>
  );
}

function TripCard({ trip, onView }: { trip: DriverTripSummary; onView: () => void }) {
  const completed = trip.assignment_status === "completed";
  const cancelled = trip.booking_status === "cancelled";

  return (
    <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-white/[0.04] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/60">
            {trip.booking_reference}
          </span>
          {cancelled && !completed ? (
            <Pill tone="slate" icon={Ban} label="Cancelled" />
          ) : (
            <Pill tone="green" icon={CheckCircle2} label="Completed" />
          )}
        </div>
        <span className="text-emerald-400 font-bold text-base shrink-0 tabular-nums">
          {completed ? formatMoney(trip.total_price, trip.currency) : "—"}
        </span>
      </div>

      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-slate-200 text-sm font-medium truncate">{trip.customer_name}</p>
          <p className="text-slate-500 text-xs shrink-0">{formatDay(trip.travel_date, "d MMM yyyy")}</p>
        </div>
        <Route pickup={trip.pickup_location} destination={trip.destination_location} />
        <button
          onClick={onView}
          className="w-full flex items-center justify-between py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors group border-t border-white/[0.04] pt-3"
        >
          <span>View record</span>
          <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** A trip this driver declined. It went back to dispatch, so there is no trip page to open. */
function DeclineCard({ record }: { record: DriverTripDeclineRecord }) {
  return (
    <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-white/[0.04] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/60">
            {record.booking_reference || "Unknown trip"}
          </span>
          <Pill tone="red" icon={XCircle} label="Declined" />
        </div>
        <span className="text-slate-500 text-xs shrink-0">{formatDay(record.created_at?.slice(0, 10), "d MMM yyyy")}</span>
      </div>

      <div className="px-5 py-4 space-y-3">
        {record.travel_date && (
          <p className="text-slate-500 text-xs">Trip date: {formatDay(record.travel_date, "d MMM yyyy")}</p>
        )}
        <Route pickup={record.pickup_location} destination={record.destination_location} />
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3.5 py-2.5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Your reason</p>
          <p className="text-slate-300 text-xs">{record.reason}</p>
          {record.note && <p className="text-slate-500 text-xs mt-1 whitespace-pre-line">{record.note}</p>}
        </div>
      </div>
    </div>
  );
}

export function DriverHistoryScreen() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<DriverTripSummary[]>([]);
  const [declines, setDeclines] = useState<DriverTripDeclineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadHistory = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg(null);
    try {
      const [tripData, declineData] = await Promise.all([fetchMyTrips("history"), fetchMyDeclines()]);
      setTrips(tripData);
      setDeclines(declineData);
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

  const entries = useMemo<Entry[]>(() => {
    const tripEntries: Entry[] = trips.map((trip) => ({ kind: "trip", sortKey: trip.travel_date, trip }));
    const declineEntries: Entry[] = declines.map((record) => ({
      kind: "decline",
      sortKey: record.created_at || record.travel_date || "",
      record,
    }));
    return [...tripEntries, ...declineEntries].sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1));
  }, [trips, declines]);

  const isCancelled = (t: DriverTripSummary) => t.booking_status === "cancelled" && t.assignment_status !== "completed";
  const completedCount = trips.filter((t) => t.assignment_status === "completed").length;
  const cancelledCount = trips.filter(isCancelled).length;

  const filtered = entries.filter((entry) => {
    if (filter === "all") return true;
    if (filter === "declined") return entry.kind === "decline";
    if (entry.kind === "decline") return false;
    return filter === "completed" ? entry.trip.assignment_status === "completed" : isCancelled(entry.trip);
  });

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: entries.length },
    { key: "completed", label: "Completed", count: completedCount },
    { key: "cancelled", label: "Cancelled", count: cancelledCount },
    { key: "declined", label: "Declined", count: declines.length },
  ];

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl lg:max-w-none mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-white font-bold text-xl">Trip history</h1>
          <p className="text-slate-500 text-xs mt-0.5">{loading ? "Loading…" : `${entries.length} records`}</p>
        </div>
        <button
          onClick={() => loadHistory(true)}
          aria-label="Refresh history"
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] transition-all"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {errorMsg && (
        <div role="alert" className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs mb-4">
          <AlertCircle size={13} className="shrink-0" aria-hidden />
          {errorMsg}
        </div>
      )}

      <div role="tablist" aria-label="Filter history" className="flex gap-1.5 mb-5 p-1 bg-[#070E1D] border border-white/[0.06] rounded-xl overflow-x-auto">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            role="tab"
            aria-selected={filter === key}
            onClick={() => setFilter(key)}
            className={`flex-1 min-w-fit flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === key ? "bg-blue-600/15 border border-blue-500/25 text-blue-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {label}
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${filter === key ? "bg-blue-500/20 text-blue-300" : "bg-slate-800 text-slate-500"}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-slate-500 text-xs">
          <Loader2 size={16} className="animate-spin text-blue-400" />
          Loading your records…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-white font-bold text-base">Nothing here yet</p>
          <p className="text-slate-500 text-sm mt-1.5">
            {filter === "all" ? "Completed, cancelled and declined trips will appear here." : `You have no ${filter} trips.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) =>
            entry.kind === "trip" ? (
              <TripCard key={`trip-${entry.trip.id}`} trip={entry.trip} onView={() => navigate(`/driver/trips/${entry.trip.id}`)} />
            ) : (
              <DeclineCard key={`decline-${entry.record.id}`} record={entry.record} />
            )
          )}
        </div>
      )}
    </div>
  );
}

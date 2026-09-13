import { useState, useEffect } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import {
  Wifi,
  WifiOff,
  BellDot,
  Navigation,
  MapPin,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Inbox,
  History,
  Banknote,
  Loader2,
} from "lucide-react";
import {
  DriverTripSummary,
  DriverEarningsData,
  fetchMyTrips,
  fetchMyEarnings,
} from "../api/driverTripApi";

function formatTime(t?: string) {
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

export function DriverHomeScreen() {
  const { isOnline, inboxCount, refreshDriverState } = useOutletContext<{
    isOnline: boolean;
    inboxCount: number;
    refreshDriverState: () => void;
  }>();
  const navigate = useNavigate();

  const [upcomingTrips, setUpcomingTrips] = useState<DriverTripSummary[]>([]);
  const [earnings, setEarnings] = useState<DriverEarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [trips, earn] = await Promise.all([
          fetchMyTrips("upcoming"),
          fetchMyEarnings("today"),
        ]);
        setUpcomingTrips(trips);
        setEarnings(earn);
      } catch (err) {
        console.error("Failed to load driver home data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const activeTrip = upcomingTrips.find((t) =>
    ["en_route", "arrived", "in_progress", "acknowledged"].includes(
      t.assignment_status
    )
  );

  const previewTrips = upcomingTrips.slice(0, 3);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl lg:max-w-none mx-auto space-y-4">
      {/* Availability Hero Banner */}
      <div
        className={`rounded-2xl p-5 border flex items-center justify-between gap-4 ${
          isOnline
            ? "bg-emerald-500/8 border-emerald-500/20"
            : "bg-slate-800/40 border-slate-700/30"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isOnline ? "bg-emerald-500/15" : "bg-slate-700/40"
            }`}
          >
            {isOnline ? (
              <Wifi size={22} className="text-emerald-400" />
            ) : (
              <WifiOff size={22} className="text-slate-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-emerald-400 pulse-dot" : "bg-slate-500"
                }`}
              />
              <p className="text-white font-bold text-base">
                {isOnline ? "Online & Available" : "Currently Offline"}
              </p>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              {isOnline
                ? "Dispatch can assign you new trips"
                : "You will not receive new assignments"}
            </p>
          </div>
        </div>
      </div>

      {/* Inbox Action Banner */}
      {inboxCount > 0 && (
        <button
          onClick={() => navigate("/driver/inbox")}
          className="w-full rounded-2xl p-4 bg-red-500/8 border border-red-500/25 flex items-center gap-4 hover:bg-red-500/12 transition-all group text-left"
        >
          <div className="relative w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
            <BellDot size={20} className="text-red-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold badge-glow">
              {inboxCount}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-red-300 font-bold text-sm">
              {inboxCount} {inboxCount === 1 ? "Dispatch" : "Dispatches"} Awaiting Response
            </p>
            <p className="text-red-400/70 text-[11px] mt-0.5">Tap to review and accept or decline</p>
          </div>
          <ChevronRight
            size={18}
            className="text-red-400/60 group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      )}

      {/* Active Trip Callout */}
      {activeTrip && (
        <div className="rounded-2xl overflow-hidden border border-blue-500/20">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation size={14} className="text-blue-300" />
              <span className="text-blue-200 text-xs font-semibold tracking-wide uppercase">
                Active Trip In Progress
              </span>
            </div>
            <span className="font-mono text-[10px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700/40">
              {activeTrip.booking_reference}
            </span>
          </div>

          <div className="bg-[#070E1D] px-5 py-4 space-y-3">
            {/* Status + fare row */}
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                  STATUS_BADGE[activeTrip.assignment_status]?.cls ?? ""
                }`}
              >
                {STATUS_BADGE[activeTrip.assignment_status]?.label ??
                  activeTrip.assignment_status}
              </span>
              <span className="text-emerald-400 font-extrabold text-lg">
                ${Number(activeTrip.total_price).toFixed(2)}
              </span>
            </div>

            {/* Passenger + pickup time */}
            <div className="text-slate-300 text-sm">
              <span className="text-white font-semibold">{activeTrip.customer_name}</span>
              <span className="text-slate-500 mx-1.5">·</span>
              <span className="text-slate-400 text-xs">
                Pickup {formatTime(activeTrip.pickup_time)}
              </span>
            </div>

            {/* Route */}
            <div className="space-y-1.5">
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mt-0.5 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-slate-300 text-xs leading-snug">
                  {activeTrip.pickup_location}
                </p>
              </div>
              <div className="ml-2 w-px h-3 bg-slate-700" />
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mt-0.5 shrink-0">
                  <MapPin size={8} className="text-red-400" />
                </div>
                <p className="text-slate-300 text-xs leading-snug">
                  {activeTrip.destination_location}
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              to={`/driver/trips/${activeTrip.id}`}
              className="w-full mt-1 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-500 transition-all"
            >
              Resume Active Trip Flow
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Upcoming Schedule Preview */}
      <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <p className="text-white font-bold text-sm">Upcoming Schedule</p>
          <button
            onClick={() => navigate("/driver/trips")}
            className="text-blue-400 text-xs font-medium hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            View all ({upcomingTrips.length})
            <ChevronRight size={13} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-slate-500 text-xs">
            <Loader2 size={14} className="animate-spin" />
            Loading schedule...
          </div>
        ) : previewTrips.length === 0 ? (
          <p className="px-5 py-8 text-slate-500 text-xs text-center">
            No upcoming trips. Accept new dispatches from your Inbox.
          </p>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {previewTrips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => navigate(`/driver/trips/${trip.id}`)}
                className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors text-left group"
              >
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                      {trip.booking_reference}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {formatDate(trip.travel_date)} · {formatTime(trip.pickup_time)}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs truncate">
                    {trip.customer_name}
                    <span className="text-slate-600 mx-1">·</span>
                    {trip.pickup_location.split(",")[0]} →{" "}
                    {trip.destination_location.split(",")[0]}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-emerald-400 font-semibold text-sm">
                    ${Number(trip.total_price).toFixed(2)}
                  </p>
                  <ChevronRight
                    size={13}
                    className="text-slate-600 ml-auto group-hover:text-slate-400 transition-colors"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Today's KPI Card */}
      <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={15} className="text-blue-400" />
          <p className="text-white font-bold text-sm">Today's Performance</p>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
            <Loader2 size={13} className="animate-spin" />
            Loading metrics...
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wide mb-1">Earnings</p>
              <p className="text-emerald-400 font-extrabold text-xl">
                ${earnings ? Number(earnings.total_earnings).toFixed(2) : "0.00"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wide mb-1">Completed</p>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <p className="text-white font-extrabold text-xl">{earnings?.trip_count ?? 0}</p>
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wide mb-1">Upcoming</p>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-blue-400" />
                <p className="text-white font-extrabold text-xl">{upcomingTrips.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Nav Hub */}
      <div className="grid grid-cols-3 gap-3 pb-2">
        {[
          {
            label: "Inbox",
            icon: Inbox,
            to: "/driver/inbox",
            color: "text-red-400",
            bg: "bg-red-500/[0.08] border-red-500/15",
          },
          {
            label: "History",
            icon: History,
            to: "/driver/history",
            color: "text-slate-300",
            bg: "bg-white/[0.03] border-white/[0.06]",
          },
          {
            label: "Earnings",
            icon: Banknote,
            to: "/driver/earnings",
            color: "text-emerald-400",
            bg: "bg-emerald-500/[0.08] border-emerald-500/15",
          },
        ].map(({ label, icon: Icon, to, color, bg }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className={`rounded-xl p-4 border flex flex-col items-center gap-2 hover:scale-[1.02] transition-all ${bg}`}
          >
            <Icon size={20} className={color} />
            <span className="text-slate-400 text-[11px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

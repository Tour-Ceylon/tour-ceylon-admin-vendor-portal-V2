import { useState, useEffect, useCallback } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import {
  Home,
  Inbox,
  Calendar,
  History,
  DollarSign,
  Wifi,
  WifiOff,
  Car,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchMyAvailability,
  fetchMyTrips,
  updateMyAvailability,
} from "../api/driverTripApi";

const NAV_ITEMS = [
  { to: "/driver/home", icon: Home, label: "Dashboard" },
  { to: "/driver/inbox", icon: Inbox, label: "Inbox" },
  { to: "/driver/trips", icon: Calendar, label: "Trips" },
  { to: "/driver/history", icon: History, label: "History" },
  { to: "/driver/earnings", icon: DollarSign, label: "Earnings" },
];

export function DriverLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [inboxCount, setInboxCount] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [avail, assignedTrips] = await Promise.all([
        fetchMyAvailability(),
        fetchMyTrips("assigned"),
      ]);
      setIsOnline(avail.is_online);
      setInboxCount(assignedTrips.length);
    } catch (err) {
      console.error("Failed to load driver state:", err);
    } finally {
      setLoadingAvailability(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20_000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleToggleOnline = async () => {
    setTogglingOnline(true);
    try {
      const res = await updateMyAvailability(!isOnline);
      setIsOnline(res.is_online);
    } catch (err) {
      console.error("Failed to toggle online status:", err);
    } finally {
      setTogglingOnline(false);
    }
  };

  const driverInitials = user?.name
    ? user.name.substring(0, 2).toUpperCase()
    : "DR";

  return (
    <div className="flex h-screen bg-[#060D1A] overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#050B16] border-r border-white/[0.06] shrink-0">
        {/* Brand */}
        <div className="px-6 pt-7 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Car size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Voyage</p>
              <p className="text-slate-500 text-[10px] mt-0.5">Driver Portal</p>
            </div>
          </div>
        </div>

        {/* Driver Card */}
        <div className="mx-4 my-4 p-3.5 rounded-xl bg-[#070E1D] border border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-900/60 border border-blue-700/40 flex items-center justify-center shrink-0">
              <User size={16} className="text-blue-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {user?.name || "Approved Driver"}
              </p>
              <p className="text-slate-500 text-[10px] truncate">Driver · Verified Partner</p>
            </div>
          </div>

          {/* Online toggle */}
          <button
            onClick={handleToggleOnline}
            disabled={togglingOnline || loadingAvailability}
            className={`mt-3 w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-60 ${
              isOnline
                ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:bg-slate-700/60"
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-emerald-400 pulse-dot" : "bg-slate-500"
                }`}
              />
              {isOnline ? "Online & Available" : "Offline"}
            </span>
            {isOnline ? <WifiOff size={12} /> : <Wifi size={12} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{label}</span>
                  {label === "Inbox" && inboxCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full badge-glow">
                      {inboxCount}
                    </span>
                  )}
                  {isActive && label !== "Inbox" && (
                    <span className="ml-auto">
                      <ChevronRight size={12} className="text-blue-400" />
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 pb-6">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#050B16] border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
              <Car size={13} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">Voyage</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Online toggle compact */}
            <button
              onClick={handleToggleOnline}
              disabled={togglingOnline || loadingAvailability}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all disabled:opacity-60 ${
                isOnline
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-slate-700/60 text-slate-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? "bg-emerald-400 pulse-dot" : "bg-slate-500"
                }`}
              />
              {isOnline ? "Online" : "Offline"}
            </button>

            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-blue-900/60 border border-blue-700/40 flex items-center justify-center">
              <User size={13} className="text-blue-300" />
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <Outlet context={{ isOnline, inboxCount, refreshDriverState: loadData }} />
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#050B16] border-t border-white/[0.06] z-50">
          <div className="flex">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-colors ${
                    isActive ? "text-blue-400" : "text-slate-500"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon size={20} strokeWidth={isActive ? 2.2 : 1.7} />
                      {label === "Inbox" && inboxCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[7px] font-bold badge-glow">
                          {inboxCount}
                        </span>
                      )}
                    </div>
                    <span>{label}</span>
                    {isActive && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-400 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

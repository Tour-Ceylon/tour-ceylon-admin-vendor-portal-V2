import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router";
import {
  Car,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  MapPin,
  Plane,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Users,
  ShieldCheck,
  Navigation,
  ChevronRight,
  Loader2,
  Luggage,
  ArrowUpRight,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  AdminTransportBooking,
  fetchAdminTransportBookings,
} from "../api/adminTransportApi";
import {
  AdminDriverItem,
  fetchAdminDrivers,
} from "../api/adminDriverApi";
import {
  TransferRequestData,
  TransferRequestDrawer,
} from "./TransferRequestDrawer";

export function TransportDashboard() {
  const [bookings, setBookings] = useState<AdminTransportBooking[]>([]);
  const [drivers, setDrivers] = useState<AdminDriverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "all">("all");
  const [selectedRequest, setSelectedRequest] = useState<TransferRequestData | null>(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [bookingsRes, driversRes] = await Promise.all([
        fetchAdminTransportBookings({ per_page: 100 }),
        fetchAdminDrivers({ per_page: 100 }),
      ]);
      setBookings(Array.isArray(bookingsRes) ? bookingsRes : (bookingsRes as any)?.bookings || []);
      setDrivers(Array.isArray(driversRes) ? driversRes : (driversRes as any)?.drivers || []);
    } catch (err: any) {
      console.error("Failed to load transport dashboard data:", err);
      setErrorMsg(err.message || "Failed to load live transport operations data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Date filtering logic
  const filteredBookings = useMemo(() => {
    const list = Array.isArray(bookings) ? bookings : [];
    const today = new Date().toISOString().split("T")[0];
    if (timeRange === "today") {
      return list.filter((b) => b.travel_date === today);
    }
    if (timeRange === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekStr = weekAgo.toISOString().split("T")[0];
      return list.filter((b) => b.travel_date >= weekStr);
    }
    if (timeRange === "month") {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthStr = monthAgo.toISOString().split("T")[0];
      return list.filter((b) => b.travel_date >= monthStr);
    }
    return list;
  }, [bookings, timeRange]);

  // Real-time KPI Stats
  const stats = useMemo(() => {
    const list = Array.isArray(bookings) ? bookings : [];
    const driverList = Array.isArray(drivers) ? drivers : [];

    const unassigned = list.filter(
      (b) => !b.driver_id || b.assignment_status === "unassigned" || b.assignment_status === "declined"
    ).length;

    const inProgress = list.filter((b) =>
      ["assigned", "acknowledged", "en_route", "arrived", "in_progress"].includes(b.assignment_status)
    ).length;

    const completed = list.filter((b) => b.assignment_status === "completed").length;

    const onlineDrivers = driverList.filter((d) => d.is_online).length;
    const approvedDrivers = driverList.filter((d) => d.status === "approved").length;

    const airportTrips = list.filter(
      (b) =>
        (b.pickup_location || "").toLowerCase().includes("airport") ||
        (b.pickup_location || "").toLowerCase().includes("cmb") ||
        (b.destination_location || "").toLowerCase().includes("airport") ||
        (b.destination_location || "").toLowerCase().includes("cmb")
    ).length;

    const totalRevenue = list
      .filter((b) => b.assignment_status === "completed" || b.booking_status === "completed" || b.payment_status === "paid")
      .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

    const cancelled = list.filter((b) => b.booking_status === "cancelled").length;

    return {
      unassigned,
      inProgress,
      completed,
      onlineDrivers,
      approvedDrivers,
      airportTrips,
      totalRevenue,
      cancelled,
      totalBookings: list.length,
    };
  }, [bookings, drivers]);

  // Live Transfer Requests (Unassigned Only - Needs Driver Dispatch)
  const pendingRequests = useMemo(() => {
    const list = Array.isArray(bookings) ? bookings : [];
    return list
      .filter((b) => {
        const isUnassigned = !b.driver_id || b.assignment_status === "unassigned" || b.assignment_status === "declined";
        const isNotFinished = b.booking_status !== "cancelled" && b.assignment_status !== "completed";
        return isUnassigned && isNotFinished;
      })
      .slice(0, 5);
  }, [bookings]);

  // Upcoming Pickups (Scheduled / En Route)
  const upcomingPickups = useMemo(() => {
    const list = Array.isArray(bookings) ? bookings : [];
    return list
      .filter((b) => ["acknowledged", "en_route", "arrived", "in_progress", "assigned"].includes(b.assignment_status))
      .sort((a, b) => (a.travel_date > b.travel_date ? 1 : -1))
      .slice(0, 5);
  }, [bookings]);

  // Route Popularity Distribution Chart Data
  const routePopularityData = useMemo(() => {
    const list = Array.isArray(bookings) ? bookings : [];
    const routeCounts: Record<string, { bookings: number; revenue: number }> = {};

    list.forEach((b) => {
      const from = (b.pickup_location || "Unknown").split(",")[0].trim();
      const to = (b.destination_location || "Unknown").split(",")[0].trim();
      const routeKey = `${from} → ${to}`;

      if (!routeCounts[routeKey]) {
        routeCounts[routeKey] = { bookings: 0, revenue: 0 };
      }
      routeCounts[routeKey].bookings += 1;
      routeCounts[routeKey].revenue += Number(b.total_price || 0);
    });

    const items = Object.entries(routeCounts).map(([route, val]) => ({
      route,
      bookings: val.bookings,
      revenue: Math.round(val.revenue),
    }));

    items.sort((a, b) => b.bookings - a.bookings);
    return items.length > 0
      ? items.slice(0, 5)
      : [
          { route: "Airport (CMB) → Colombo", bookings: 12, revenue: 710 },
          { route: "Colombo → Nuwara Eliya", bookings: 8, revenue: 1980 },
          { route: "Airport (CMB) → Galle Fort", bookings: 6, revenue: 980 },
          { route: "Kandy → Sigiriya", bookings: 4, revenue: 520 },
        ];
  }, [bookings]);

  // Revenue by Vehicle Category
  const vehicleRevenueData = useMemo(() => {
    const list = Array.isArray(bookings) ? bookings : [];
    const catMap: Record<string, { revenue: number; bookings: number }> = {};

    list.forEach((b) => {
      const catName = b.vehicle_category?.name || "Standard Sedan";
      if (!catMap[catName]) {
        catMap[catName] = { revenue: 0, bookings: 0 };
      }
      catMap[catName].bookings += 1;
      catMap[catName].revenue += Number(b.total_price || 0);
    });

    const items = Object.entries(catMap).map(([category, val]) => ({
      category,
      revenue: Math.round(val.revenue),
      bookings: val.bookings,
    }));

    return items.length > 0
      ? items
      : [
          { category: "Sedan Standard", revenue: 59, bookings: 1 },
          { category: "Luxury Van", revenue: 266, bookings: 1 },
          { category: "SUV", revenue: 164, bookings: 1 },
        ];
  }, [bookings]);

  // Booking Trend Timeline Data
  const bookingTrendData = useMemo(() => {
    const dayMap: Record<string, { month: string; bookings: number; revenue: number }> = {};

    // Group bookings by travel date
    bookings.forEach((b) => {
      const dateKey = b.travel_date || "Today";
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = { month: dateKey, bookings: 0, revenue: 0 };
      }
      dayMap[dateKey].bookings += 1;
      dayMap[dateKey].revenue += Number(b.total_price || 0);
    });

    const list = Object.values(dayMap);
    list.sort((a, b) => (a.month > b.month ? 1 : -1));

    return list.length > 0
      ? list.slice(-7)
      : [
          { month: "Aug 25", bookings: 1, revenue: 130 },
          { month: "Aug 27", bookings: 1, revenue: 45 },
          { month: "Aug 28", bookings: 1, revenue: 59 },
          { month: "Aug 29", bookings: 2, revenue: 325 },
        ];
  }, [bookings]);

  // Convert booking to drawer data format
  const handleOpenBookingDrawer = (b: AdminTransportBooking) => {
    const drawerData: TransferRequestData = {
      id: b.id,
      bookingId: b.booking_reference,
      customer: b.customer_name,
      customerEmail: b.customer_email || "customer@example.com",
      pickup: b.pickup_location,
      destination: b.destination_location,
      pickupDate: b.travel_date,
      pickupTime: b.pickup_time ? b.pickup_time.substring(0, 5) : "12:00",
      passengers: b.passengers_count,
      luggage: b.luggage_count,
      vehicleCategory: b.vehicle_category?.name || "Standard Sedan",
      estimatedFare: Number(b.total_price),
      distance: b.distance_km || 0,
      duration: b.estimated_duration_minutes ? `${b.estimated_duration_minutes} min` : "—",
      bookingStatus: b.booking_status,
      paymentStatus: b.payment_status,
      assignmentStatus: b.assignment_status,
      assignedAt: b.assigned_at,
      createdDate: b.created_at,
      notes: b.special_requests,
      driver: b.driver,
    };
    setSelectedRequest(drawerData);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = [
      "Booking Reference",
      "Customer",
      "Email",
      "Pickup Location",
      "Destination",
      "Travel Date",
      "Pickup Time",
      "Passengers",
      "Vehicle Category",
      "Total Fare ($)",
      "Assignment Status",
      "Assigned Driver",
    ];

    const rows = bookings.map((b) => [
      b.booking_reference,
      `"${b.customer_name}"`,
      b.customer_email || "",
      `"${b.pickup_location}"`,
      `"${b.destination_location}"`,
      b.travel_date,
      b.pickup_time,
      b.passengers_count,
      b.vehicle_category?.name || "",
      b.total_price,
      b.assignment_status,
      b.driver ? `"${b.driver.full_name}"` : "Unassigned",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tour_ceylon_transport_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Transport Operations Center
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Operations
            </span>
          </div>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Real-time transfer dispatch management, driver fleet readiness, and revenue analytics
          </p>
        </div>

        {/* Date Filter & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <div
            className="flex items-center p-1 rounded-xl"
            style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
          >
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "week", label: "7 Days" },
              { id: "month", label: "30 Days" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id as any)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={{
                  background: timeRange === tab.id ? "var(--active-overlay)" : "transparent",
                  color: timeRange === tab.id ? "var(--accent-navy-light)" : "var(--text-secondary)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl transition-all"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
            }}
            title="Refresh Live Data"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-[13px] flex items-center gap-2">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Top KPI Cards Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Pending / Unassigned Dispatches */}
        <Link
          to="/transport/requests"
          className="rounded-2xl p-4 transition-all hover:scale-[1.02] flex flex-col justify-between"
          style={{
            background: stats.unassigned > 0 ? "rgba(245, 158, 11, 0.1)" : "var(--bg-panel)",
            border: stats.unassigned > 0 ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid var(--border-light)",
            boxShadow: stats.unassigned > 0 ? "0 0 16px rgba(245, 158, 11, 0.15)" : "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/20 text-amber-400">
              <Clock size={18} />
            </div>
            {stats.unassigned > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                Needs Driver
              </span>
            )}
          </div>
          <div className="mt-3">
            <p className="text-[11px] uppercase font-bold text-slate-400">Unassigned Requests</p>
            <p className="text-[22px] font-extrabold text-amber-400">{stats.unassigned}</p>
            <p className="text-[10px] text-slate-400">Awaiting dispatch</p>
          </div>
        </Link>

        {/* Confirmed / Active Rides */}
        <div
          className="rounded-2xl p-4 flex flex-col justify-between"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-sky-500/20 text-sky-400">
              <Navigation size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[11px] uppercase font-bold text-slate-400">Active / En Route</p>
            <p className="text-[22px] font-extrabold text-sky-400">{stats.inProgress}</p>
            <p className="text-[10px] text-slate-400">In-flight journeys</p>
          </div>
        </div>

        {/* Online Drivers */}
        <Link
          to="/transport/drivers"
          className="rounded-2xl p-4 transition-all hover:scale-[1.02] flex flex-col justify-between"
          style={{
            background: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            boxShadow: "0 0 16px rgba(34, 197, 94, 0.1)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/20 text-emerald-400">
              <Car size={18} />
            </div>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] uppercase font-bold text-slate-400">Online Fleet</p>
            <p className="text-[22px] font-extrabold text-emerald-400">{stats.onlineDrivers}</p>
            <p className="text-[10px] text-slate-400">of {stats.approvedDrivers} approved</p>
          </div>
        </Link>

        {/* Airport Transfers */}
        <div
          className="rounded-2xl p-4 flex flex-col justify-between"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-500/20 text-cyan-400">
              <Plane size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[11px] uppercase font-bold text-slate-400">Airport Pickups</p>
            <p className="text-[22px] font-extrabold text-cyan-400">{stats.airportTrips}</p>
            <p className="text-[10px] text-slate-400">CMB Airport routes</p>
          </div>
        </div>

        {/* Total Fleet Revenue */}
        <div
          className="rounded-2xl p-4 flex flex-col justify-between"
          style={{
            background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
            border: "1px solid var(--border-accent)",
            boxShadow: "0 0 20px var(--border-accent)",
          }}
        >
          <div className="flex items-center justify-between text-white/70">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 text-emerald-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[11px] uppercase font-bold text-white/70">Transfer Revenue</p>
            <p className="text-[22px] font-extrabold text-white">${stats.totalRevenue.toFixed(2)}</p>
            <p className="text-[10px] text-white/60">Gross fare volume</p>
          </div>
        </div>

        {/* Completed Transfers */}
        <div
          className="rounded-2xl p-4 flex flex-col justify-between"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-400">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[11px] uppercase font-bold text-slate-400">Completed Trips</p>
            <p className="text-[22px] font-extrabold text-purple-400">{stats.completed}</p>
            <p className="text-[10px] text-slate-400">Fulfillments</p>
          </div>
        </div>
      </div>

      {/* ── Operational Dispatch Feeds (Live Requests & Upcoming Pickups) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Transfer Requests Requiring Dispatch */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                Live Transfer Requests Queue
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {pendingRequests.length} Unassigned
              </span>
            </div>
            <Link
              to="/transport/requests"
              className="text-[12px] text-sky-400 font-medium hover:underline flex items-center gap-1"
            >
              View Full Queue <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex items-center justify-center gap-2" style={{ color: "var(--text-tertiary)" }}>
              <Loader2 size={16} className="animate-spin text-sky-400" />
              <span className="text-[12px]">Loading unassigned requests...</span>
            </div>
          ) : pendingRequests.length === 0 ? (
            <p className="text-[13px] py-8 text-center text-slate-400">
              No unassigned transfer requests right now. All bookings have a driver assigned.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => handleOpenBookingDrawer(req)}
                  className="rounded-xl p-4 cursor-pointer transition-all hover:bg-white/5 flex flex-col justify-between space-y-2.5"
                  style={{
                    background: "var(--input-background)",
                    border: !req.driver_id ? "1px solid rgba(245,158,11,0.3)" : "1px solid var(--border-light)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">
                        {req.booking_reference}
                      </span>
                      <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                        {req.customer_name}
                      </span>
                    </div>
                    <span className="text-[14px] font-bold text-emerald-400">
                      ${Number(req.total_price).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">
                      {req.pickup_location} → {req.destination_location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    <span>
                      {req.travel_date} at {req.pickup_time ? req.pickup_time.substring(0, 5) : ""} • {req.passengers_count} pax
                    </span>
                    <span className="text-sky-400 font-bold flex items-center gap-1 hover:underline">
                      Assign Driver <ArrowUpRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Pickups & In-Progress Schedule */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                Upcoming & Active Journeys
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                {upcomingPickups.length} Trips
              </span>
            </div>
            <Link
              to="/transport/requests"
              className="text-[12px] text-sky-400 font-medium hover:underline flex items-center gap-1"
            >
              All Bookings <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex items-center justify-center gap-2" style={{ color: "var(--text-tertiary)" }}>
              <Loader2 size={16} className="animate-spin text-sky-400" />
              <span className="text-[12px]">Loading schedule...</span>
            </div>
          ) : upcomingPickups.length === 0 ? (
            <p className="text-[13px] py-8 text-center text-slate-400">
              No active or scheduled journeys in the immediate pipeline.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingPickups.map((pickup) => (
                <div
                  key={pickup.id}
                  onClick={() => handleOpenBookingDrawer(pickup)}
                  className="rounded-xl p-4 cursor-pointer transition-all hover:bg-white/5 flex flex-col justify-between space-y-2.5"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">
                        {pickup.booking_reference}
                      </span>
                      <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                        {pickup.customer_name}
                      </span>
                    </div>
                    <span className="text-[11px] capitalize px-2 py-0.5 rounded-full font-bold bg-sky-500/10 text-sky-300">
                      {pickup.assignment_status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-1 text-[12px]">
                    <div className="flex items-center gap-1.5 text-slate-300 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">{pickup.pickup_location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 truncate">
                      <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                      <span className="truncate">{pickup.destination_location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    <span>
                      {pickup.travel_date} at {pickup.pickup_time ? pickup.pickup_time.substring(0, 5) : ""}
                    </span>
                    <span className="font-semibold text-purple-400">
                      {pickup.driver ? `Driver: ${pickup.driver.full_name}` : "Vehicle: " + (pickup.vehicle_category?.name || "Standard")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Operational Analytics Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking & Revenue Timeline Chart */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
              Transfer Volume & Revenue Distribution
            </h3>
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Live booking volume
            </span>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "var(--text-primary)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue ($)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  name="Bookings Count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Busiest Routes Chart */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
              Busiest Routes & Destinations
            </h3>
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              By ride frequency
            </span>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routePopularityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis
                  dataKey="route"
                  type="category"
                  stroke="var(--text-tertiary)"
                  fontSize={10}
                  width={160}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="bookings" name="Bookings" fill="#0891b2" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Revenue by Vehicle Category ── */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
              Revenue by Vehicle Category
            </h3>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              Earnings distribution breakdown across registered vehicle classes
            </p>
          </div>
          <Link
            to="/transport/vehicles"
            className="text-[12px] text-sky-400 font-medium hover:underline flex items-center gap-1"
          >
            Manage Vehicle Categories <ChevronRight size={14} />
          </Link>
        </div>

        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vehicleRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="category" stroke="var(--text-tertiary)" fontSize={11} />
              <YAxis stroke="var(--text-tertiary)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="revenue" name="Total Revenue ($)" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Transport Alerts & Fleet Health ── */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
          Real-Time Transport Alerts & Capacity Health
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/transport/requests"
            className="rounded-xl p-4 transition-all hover:bg-white/5 block"
            style={{
              background: stats.unassigned > 0 ? "rgba(239, 68, 68, 0.08)" : "var(--input-background)",
              border: stats.unassigned > 0 ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid var(--border-light)",
            }}
          >
            <p className="text-[11px] text-slate-400 uppercase font-bold">Unassigned Dispatches</p>
            <p className="text-[22px] font-extrabold text-red-400 mt-1">{stats.unassigned}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Need approved driver assigned</p>
          </Link>

          <Link
            to="/transport/drivers"
            className="rounded-xl p-4 transition-all hover:bg-white/5 block"
            style={{
              background: "rgba(34, 197, 94, 0.08)",
              border: "1px solid rgba(34, 197, 94, 0.25)",
            }}
          >
            <p className="text-[11px] text-slate-400 uppercase font-bold">Online Dispatch Ready</p>
            <p className="text-[22px] font-extrabold text-emerald-400 mt-1">{stats.onlineDrivers}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Active drivers broadcasting</p>
          </Link>

          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
            }}
          >
            <p className="text-[11px] text-slate-400 uppercase font-bold">CMB Airport Pickups</p>
            <p className="text-[22px] font-extrabold text-sky-400 mt-1">{stats.airportTrips}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Airport transfer bookings</p>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(168, 85, 247, 0.08)",
              border: "1px solid rgba(168, 85, 247, 0.25)",
            }}
          >
            <p className="text-[11px] text-slate-400 uppercase font-bold">Fulfilled Trips</p>
            <p className="text-[22px] font-extrabold text-purple-400 mt-1">{stats.completed}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Total completed transfers</p>
          </div>
        </div>
      </div>

      {/* ── Slide-Over Transfer Request Drawer for Dispatching ── */}
      {selectedRequest && (
        <TransferRequestDrawer
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onRefresh={loadDashboardData}
        />
      )}
    </div>
  );
}

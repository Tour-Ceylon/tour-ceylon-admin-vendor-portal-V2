import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
  Car,
  Loader2,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { TransferRequestDrawer, TransferRequestData } from "./TransferRequestDrawer";
import {
  AdminTransportBooking,
  fetchAdminTransportBookings,
} from "../api/adminTransportApi";

const BOOKING_STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", dot: "#f59e0b" },
  confirmed: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e" },
  completed: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8", dot: "#64748b" },
  cancelled: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444" },
  rejected: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444" },
};

const PAYMENT_STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  paid: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80" },
  unpaid: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24" },
  pay_later: { bg: "rgba(59, 130, 246, 0.1)", text: "#60a5fa" },
  refunded: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8" },
};

const ASSIGNMENT_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  unassigned: { label: "Unassigned", bg: "rgba(245, 158, 11, 0.12)", text: "#fbbf24", dot: "#f59e0b" },
  assigned: { label: "Assigned", bg: "rgba(59, 130, 246, 0.12)", text: "#60a5fa", dot: "#3b82f6" },
  acknowledged: { label: "Accepted", bg: "rgba(168, 85, 247, 0.12)", text: "#c084fc", dot: "#a855f7" },
  en_route: { label: "En Route", bg: "rgba(14, 165, 233, 0.12)", text: "#38bdf8", dot: "#0ea5e9" },
  arrived: { label: "Arrived", bg: "rgba(20, 184, 166, 0.12)", text: "#2dd4bf", dot: "#14b8a6" },
  in_progress: { label: "In Progress", bg: "rgba(99, 102, 241, 0.12)", text: "#818cf8", dot: "#6366f1" },
  completed: { label: "Completed", bg: "rgba(34, 197, 94, 0.12)", text: "#4ade80", dot: "#22c55e" },
  declined: { label: "Declined", bg: "rgba(239, 68, 68, 0.12)", text: "#f87171", dot: "#ef4444" },
};

function formatBookingToRequestData(b: AdminTransportBooking): TransferRequestData {
  return {
    id: b.id,
    bookingId: b.booking_reference,
    customer: b.customer_name,
    customerEmail: b.customer_email,
    pickup: b.pickup_location,
    destination: b.destination_location,
    pickupDate: b.travel_date,
    pickupTime: b.pickup_time ? b.pickup_time.substring(0, 5) : "",
    passengers: b.passengers_count,
    luggage: b.luggage_count,
    vehicleCategory: b.vehicle_category?.name || "Standard",
    estimatedFare: Number(b.total_price),
    distance: Number(b.distance_km || 0),
    duration: b.estimated_duration_minutes ? `${b.estimated_duration_minutes} mins` : "—",
    bookingStatus: b.booking_status,
    paymentStatus: b.payment_status,
    assignmentStatus: b.assignment_status || "unassigned",
    assignedAt: b.assigned_at,
    createdDate: b.created_at ? new Date(b.created_at).toLocaleDateString() : "",
    notes: b.internal_notes || b.special_requests,
    driver: b.driver,
  };
}

export function TransferRequestsPage() {
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<TransferRequestData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [bookings, setBookings] = useState<AdminTransportBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statsMeta, setStatsMeta] = useState({
    total: 0,
    unassigned_count: 0,
    assigned_count: 0,
    in_progress_count: 0,
    completed_count: 0,
  });

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let assignmentStatusParam: string | undefined = undefined;
      let bookingStatusParam: string | undefined = undefined;

      if (filterTab === "unassigned") {
        assignmentStatusParam = "unassigned";
      } else if (filterTab === "assigned") {
        assignmentStatusParam = "assigned";
      } else if (filterTab === "in_progress") {
        assignmentStatusParam = "in_progress";
      } else if (filterTab === "completed") {
        assignmentStatusParam = "completed";
      } else if (filterTab === "cancelled") {
        bookingStatusParam = "cancelled";
      }

      const res = await fetchAdminTransportBookings({
        assignment_status: assignmentStatusParam,
        booking_status: bookingStatusParam,
        search: search || undefined,
        per_page: 50,
      });

      setBookings(res.bookings || []);
      setStatsMeta({
        total: res.total || 0,
        unassigned_count: res.unassigned_count || 0,
        assigned_count: res.assigned_count || 0,
        in_progress_count: res.in_progress_count || 0,
        completed_count: res.completed_count || 0,
      });
    } catch (err: any) {
      console.error("Failed to load admin transport bookings:", err);
      setErrorMsg(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [filterTab, search]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleViewRequest = (b: AdminTransportBooking) => {
    setSelectedRequest(formatBookingToRequestData(b));
    setDrawerOpen(true);
  };

  const statusTabs = [
    { id: "all", label: "All Bookings", count: statsMeta.total },
    { id: "unassigned", label: "New / Unassigned", count: statsMeta.unassigned_count, isHighlight: statsMeta.unassigned_count > 0 },
    { id: "assigned", label: "Assigned", count: statsMeta.assigned_count },
    { id: "in_progress", label: "In Progress", count: statsMeta.in_progress_count },
    { id: "completed", label: "Completed", count: statsMeta.completed_count },
    { id: "cancelled", label: "Cancelled", count: bookings.filter((b) => b.booking_status === "cancelled").length },
  ];

  const totalRevenue = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, b) => sum + Number(b.total_price), 0);

  const avgFare = bookings.length > 0
    ? Math.round(bookings.reduce((sum, b) => sum + Number(b.total_price), 0) / bookings.length)
    : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Transfer Dispatch & Requests Queue
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Dispatch transfer requests to approved drivers and monitor real-time trip execution
          </p>
        </div>
        <button
          onClick={loadBookings}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-all"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(59, 130, 246, 0.1)" }}
            >
              <MapPin size={18} style={{ color: "#3b82f6" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Total Transfer Requests
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {statsMeta.total}
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: statsMeta.unassigned_count > 0 ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(245, 158, 11, 0.1)" }}
            >
              <Clock size={18} style={{ color: "var(--warning)" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Awaiting Driver Assignment
          </p>
          <p className="text-[20px]" style={{ color: statsMeta.unassigned_count > 0 ? "#fbbf24" : "var(--text-primary)", fontWeight: 700 }}>
            {statsMeta.unassigned_count}
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(34, 197, 94, 0.1)" }}
            >
              <DollarSign size={18} style={{ color: "var(--success)" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Total Paid Revenue
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${totalRevenue.toLocaleString()}
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(8, 145, 178, 0.1)" }}
            >
              <TrendingUp size={18} style={{ color: "#0891b2" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Average Trip Fare
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${avgFare.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="rounded-xl"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Filters */}
        <div className="p-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
              }}
            >
              <Search size={14} style={{ color: "var(--text-tertiary)" }} />
              <input
                type="text"
                placeholder="Search by booking reference, customer name, email, pickup or destination..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-[13px] outline-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 flex-wrap">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className="px-4 py-2 text-[12px] rounded-lg transition-all flex items-center gap-2"
                style={
                  filterTab === tab.id
                    ? {
                        background: "var(--active-overlay)",
                        color: "var(--accent-navy-light)",
                        border: "1px solid var(--border-accent)",
                        fontWeight: 600,
                      }
                    : {
                        color: "var(--text-secondary)",
                        border: "1px solid transparent",
                      }
                }
              >
                {tab.label}
                <span
                  className="px-2 py-0.5 rounded text-[10px]"
                  style={{
                    background:
                      filterTab === tab.id
                        ? "var(--accent-navy)"
                        : tab.isHighlight
                        ? "rgba(245, 158, 11, 0.2)"
                        : "var(--input-background)",
                    color:
                      filterTab === tab.id
                        ? "white"
                        : tab.isHighlight
                        ? "#fbbf24"
                        : "var(--text-tertiary)",
                    fontWeight: tab.isHighlight ? 700 : 500,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="p-12 flex items-center justify-center gap-2" style={{ color: "var(--text-tertiary)" }}>
            <Loader2 size={18} className="animate-spin" />
            <span className="text-[13px]">Loading transfer bookings...</span>
          </div>
        )}

        {!loading && errorMsg && (
          <div className="p-8 text-center" style={{ color: "var(--error)" }}>
            <AlertCircle size={24} className="mx-auto mb-2" />
            <p className="text-[13px] font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Table */}
        {!loading && !errorMsg && bookings.length === 0 ? (
          <div className="p-12 text-center" style={{ color: "var(--text-tertiary)" }}>
            <Car size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-[13px]">No bookings found in this view.</p>
          </div>
        ) : (
          !loading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                      BOOKING ID
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                      CUSTOMER
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                      ROUTE
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                      DATE & TIME
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                      VEHICLE
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                      FARE
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                      DISPATCH STATUS
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                      ASSIGNED DRIVER
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const assignConfig = ASSIGNMENT_STATUS_CONFIG[b.assignment_status || "unassigned"] || ASSIGNMENT_STATUS_CONFIG.unassigned;
                    const bookingStatusConfig = BOOKING_STATUS_CONFIG[b.booking_status] || BOOKING_STATUS_CONFIG.pending;

                    return (
                      <tr
                        key={b.id}
                        className="group cursor-pointer transition-all"
                        style={{ borderBottom: "1px solid var(--border-light)" }}
                        onClick={() => handleViewRequest(b)}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                        }}
                      >
                        <td className="px-4 py-3">
                          <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                            {b.booking_reference}
                          </p>
                          <span
                            className="text-[10px] px-1.5 py-0.2 rounded capitalize inline-block mt-0.5"
                            style={{
                              background: bookingStatusConfig.bg,
                              color: bookingStatusConfig.text,
                            }}
                          >
                            {b.booking_status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                            {b.customer_name}
                          </p>
                          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            {b.customer_phone}
                          </p>
                        </td>
                        <td className="px-4 py-3 max-w-[220px]">
                          <p className="text-[12px] truncate" style={{ color: "var(--text-primary)" }}>
                            {b.pickup_location}
                          </p>
                          <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                            → {b.destination_location}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[12px]" style={{ color: "var(--text-primary)" }}>
                            {b.travel_date}
                          </p>
                          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            {b.pickup_time ? b.pickup_time.substring(0, 5) : ""}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[11px] px-2 py-0.5 rounded"
                            style={{
                              background: "var(--input-background)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {b.vehicle_category?.name || "Standard"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                            ${Number(b.total_price).toFixed(2)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: assignConfig.dot }}
                            />
                            <span
                              className="text-[12px] font-medium"
                              style={{ color: assignConfig.text }}
                            >
                              {assignConfig.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {b.driver ? (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                                  {b.driver.full_name || "Assigned Driver"}
                                </p>
                                {b.driver.is_online ? (
                                  <Wifi size={11} className="text-emerald-400" title="Online" />
                                ) : (
                                  <WifiOff size={11} className="text-slate-500" title="Offline" />
                                )}
                              </div>
                              <p className="text-[10px] font-mono" style={{ color: "var(--text-tertiary)" }}>
                                {b.driver.vehicle_plate_number}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[11px] italic" style={{ color: "var(--text-tertiary)" }}>
                              None assigned
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewRequest(b);
                            }}
                            className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{
                              background: "var(--input-background)",
                              border: "1px solid var(--border-light)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Transfer Request Drawer */}
      {drawerOpen && selectedRequest && (
        <TransferRequestDrawer
          request={selectedRequest}
          onClose={() => setDrawerOpen(false)}
          onRefresh={loadBookings}
        />
      )}
    </div>
  );
}

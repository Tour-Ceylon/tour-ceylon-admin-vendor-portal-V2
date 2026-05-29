import { useState } from "react";
import { useNavigate } from "react-router";
import {
  TrendingUp,
  Layers,
  Clock,
  CheckCircle,
  DollarSign,
  Eye,
  Edit2,
  Calendar,
  Star,
  ArrowUpRight,
  Plus,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Package,
  User,
  MapPin,
  X,
  Check,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { vendorMockData } from "../../services/vendorMockData";

// Icon mapping for KPIs
const ICON_MAP = {
  "layers": Layers,
  "clock": Clock,
  "calendar": Calendar,
  "dollar-sign": DollarSign,
  "star": Star,
  "eye": Eye,
};

// Priority colors for tasks
const PRIORITY_COLORS = {
  high: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
  medium: { bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  low: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
};

// Status colors for bookings and listings
const STATUS_COLORS = {
  pending: { bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  confirmed: { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
  completed: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  cancelled: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
  active: { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
  draft: { bg: "rgba(100,116,139,0.1)", color: "#94a3b8", border: "rgba(100,116,139,0.3)" },
  pending_review: { bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  needs_changes: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
};

export function VendorDashboard() {
  const { user, effectiveUser } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get vendor-specific data from mock service using effectiveUser.id as vendorId
  const vendorId = effectiveUser?.id;
  const kpis = vendorMockData.getVendorKPIs(vendorId);
  const tasks = vendorMockData.getVendorTasks(vendorId);
  const recentBookings = vendorMockData.getRecentBookings(vendorId);
  const vendorListings = vendorMockData.getVendorListings(vendorId);
  const recentReviews = vendorMockData.getRecentReviews(vendorId);
  const revenueData = vendorMockData.getVendorRevenue(vendorId);

  // Calculate listing status counts
  const listingStats = {
    active: vendorListings.filter(l => l.status === "active").length,
    draft: vendorListings.filter(l => l.status === "draft").length,
    pending_review: vendorListings.filter(l => l.status === "pending_review").length,
    needs_changes: vendorListings.filter(l => l.status === "needs_changes").length,
  };

  // Calculate revenue change percentage
  const revenueChange = ((revenueData.thisMonth - revenueData.lastMonth) / revenueData.lastMonth * 100).toFixed(1);

  // Helper functions
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConfirmBooking = (bookingRef: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast(`Booking ${bookingRef} confirmed successfully`, "success");
    }, 1000);
  };

  const handleViewBooking = (bookingRef: string) => {
    navigate(`/vendor/bookings/${bookingRef}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Dashboard
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Welcome back, {user?.name}! Here's what's happening with your business.
          </p>
        </div>
        <button
          onClick={() => navigate("/listings/create")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] transition-all"
          style={{
            background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
            color: "white",
            boxShadow: "0 0 16px var(--border-accent)",
            border: "1px solid var(--border-accent)",
            fontWeight: 500,
          }}
        >
          <Plus size={14} />
          Add Listing
        </button>
      </div>

      {/* Quick KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const IconComponent = ICON_MAP[kpi.icon as keyof typeof ICON_MAP];
          return (
            <div
              key={kpi.label}
              className="rounded-xl p-4"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(59,130,246,0.15)" }}
                >
                  <IconComponent size={18} style={{ color: "#3b82f6" }} />
                </div>
                {kpi.trend === "up" && (
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px]"
                    style={{
                      background: "rgba(34,197,94,0.1)",
                      color: "#4ade80",
                      fontWeight: 600,
                    }}
                  >
                    <ArrowUpRight size={11} />
                    {kpi.change?.includes("%") ? kpi.change : ""}
                  </div>
                )}
              </div>
              <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                {kpi.value}
              </p>
              <p className="text-[12px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                {kpi.label}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                {kpi.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tasks & Revenue */}
      <div className="grid grid-cols-3 gap-6">
        {/* Today / This Week Tasks */}
        <div
          className="col-span-2 rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div>
              <h2 className="text-[14px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Action Items
              </h2>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Tasks that need your attention
              </p>
            </div>
            <div
              className="px-2.5 py-1 rounded-lg text-[11px]"
              style={{
                background: "rgba(239,68,68,0.1)",
                color: "#f87171",
                fontWeight: 600,
              }}
            >
              {tasks.filter(t => t.priority === "high").length} urgent
            </div>
          </div>
          <div className="p-5 space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all"
                style={{ background: "var(--input-background)" }}
                onClick={() => navigate(task.actionUrl)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--input-background)";
                }}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0 mt-2"
                  style={{ background: PRIORITY_COLORS[task.priority].color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded shrink-0 ml-2"
                        style={{
                          background: PRIORITY_COLORS[task.priority].bg,
                          color: PRIORITY_COLORS[task.priority].color,
                          fontWeight: 600,
                        }}
                      >
                        {task.dueDate}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {task.description}
                  </p>
                </div>
                <ChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Snapshot */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[14px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  Revenue
                </h2>
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  This month vs last month
                </p>
              </div>
              <DollarSign size={20} style={{ color: "var(--success)" }} />
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                  ${revenueData.thisMonth.toLocaleString()}
                </span>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    color: "#4ade80",
                    fontWeight: 600,
                  }}
                >
                  <ArrowUpRight size={9} />
                  +{revenueChange}%
                </div>
              </div>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                This month
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                Last month
              </span>
              <span className="text-[13px]" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                ${revenueData.lastMonth.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                Pending payout
              </span>
              <span className="text-[13px]" style={{ color: "var(--success)", fontWeight: 600 }}>
                ${revenueData.pendingPayout.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="px-5 py-3" style={{ background: "var(--input-background)", borderTop: "1px solid var(--border-light)" }}>
            <button
              onClick={() => navigate("/vendor/revenue")}
              className="text-[12px] w-full py-2 rounded-lg transition-all"
              style={{
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-light)",
              }}
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Recent Bookings
          </h2>
          <button
            onClick={() => navigate("/vendor/bookings")}
            className="text-[11px] px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: "var(--active-overlay)",
              color: "var(--accent-navy-light)",
              border: "1px solid var(--border-accent)",
            }}
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 800 }}>
            <thead>
              <tr style={{ background: "var(--input-background)" }}>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Booking Ref
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Customer
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Listing
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Date
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Status
                  </span>
                </th>
                <th className="px-5 py-3 text-right" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Amount
                  </span>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Action
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.slice(0, 5).map((booking, index) => (
                <tr
                  key={booking.id}
                  className="group cursor-pointer transition-all"
                  style={{ borderBottom: index < 4 ? "1px solid var(--border-light)" : "none" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {booking.urgent && (
                        <div className="w-2 h-2 rounded-full" style={{ background: "#f87171" }} />
                      )}
                      <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {booking.bookingRef}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] shrink-0"
                        style={{
                          background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                          color: "white",
                          fontWeight: 600,
                        }}
                      >
                        {booking.customer.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                          {booking.customer}
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          {booking.customerEmail}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {booking.listing}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} style={{ color: "var(--text-tertiary)" }} />
                      <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {booking.date}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] capitalize"
                      style={{
                        background: STATUS_COLORS[booking.status].bg,
                        color: STATUS_COLORS[booking.status].color,
                        border: `1px solid ${STATUS_COLORS[booking.status].border}`,
                        fontWeight: 600,
                      }}
                    >
                      {booking.status}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-[14px]" style={{ color: "var(--success)", fontWeight: 600 }}>
                      {booking.amount}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {booking.status === "pending" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmBooking(booking.bookingRef);
                        }}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg text-[11px] transition-all disabled:opacity-50"
                        style={{
                          background: "rgba(34,197,94,0.1)",
                          color: "#4ade80",
                          border: "1px solid rgba(34,197,94,0.3)",
                          fontWeight: 500,
                        }}
                      >
                        {isLoading ? "..." : "Confirm"}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewBooking(booking.bookingRef);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: "var(--input-background)",
                          border: "1px solid var(--border-light)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <Eye size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Listing Status & Recent Reviews */}
      <div className="grid grid-cols-2 gap-6">
        {/* My Listing Status */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              My Listings
            </h2>
            <button
              onClick={() => navigate("/listings")}
              className="text-[11px] px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "var(--active-overlay)",
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
              }}
            >
              Manage
            </button>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: "Active", count: listingStats.active, status: "active" },
              { label: "Draft", count: listingStats.draft, status: "draft" },
              { label: "Pending Review", count: listingStats.pending_review, status: "pending_review" },
              { label: "Needs Changes", count: listingStats.needs_changes, status: "needs_changes" },
            ].map(({ label, count, status }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: STATUS_COLORS[status as keyof typeof STATUS_COLORS].color }}
                  />
                  <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                    {label}
                  </span>
                </div>
                <span className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div>
              <h2 className="text-[14px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Recent Reviews
              </h2>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                {recentReviews.filter(r => !r.responded).length} need response
              </p>
            </div>
            <Star size={20} style={{ color: "#eab308" }} />
          </div>
          <div>
            {recentReviews.slice(0, 3).map((review, i) => (
              <div
                key={review.id}
                className="px-5 py-4 group cursor-pointer transition-all"
                style={{ borderBottom: i < 2 ? "1px solid var(--border-light)" : "none" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {review.customer}
                    </p>
                    <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                      {review.listing}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: "var(--text-secondary)" }}>
                      {review.comment}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <Star size={12} style={{ color: "#eab308", fill: "#eab308" }} />
                    <span className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {review.rating}.0
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    {review.date}
                  </p>
                  {!review.responded && (
                    <button
                      onClick={() => navigate("/vendor/reviews")}
                      className="px-3 py-1 rounded-lg text-[10px] transition-all"
                      style={{
                        background: "var(--active-overlay)",
                        color: "var(--accent-navy-light)",
                        border: "1px solid var(--border-accent)",
                        fontWeight: 500,
                      }}
                    >
                      <MessageSquare size={10} className="inline mr-1" />
                      Respond
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3" style={{ background: "var(--input-background)", borderTop: "1px solid var(--border-light)" }}>
            <button
              onClick={() => navigate("/vendor/reviews")}
              className="text-[12px] w-full py-2 rounded-lg transition-all"
              style={{
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-light)",
              }}
            >
              View All Reviews
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all"
          style={{
            background: toast.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: toast.type === "success" ? "#4ade80" : "#f87171",
          }}
        >
          {toast.type === "success" ? (
            <Check size={16} />
          ) : (
            <X size={16} />
          )}
          <span className="text-[13px] font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 p-1 rounded-lg transition-all"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "inherit",
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

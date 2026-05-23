import { useState } from "react";
import { useNavigate } from "react-router";
import {
  TrendingUp,
  Users,
  Layers,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Activity,
  Eye,
  MoreHorizontal,
  AlertCircle,
  Package,
  Car,
  Bell,
  Calendar,
  MapPin,
  Star,
  Smartphone,
  CreditCard,
  TrendingDown,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Zap,
  BarChart3,
  ShoppingBag,
  FileText,
} from "lucide-react";
import { FloatingActionButton } from "../common/QuickActions";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  // Operational status overview
  const operationalAlerts = [
    {
      label: "Vendor Approvals",
      value: 7,
      urgent: 3,
      color: "#f59e0b",
      icon: Users,
      action: "Review",
    },
    {
      label: "Listings Pending",
      value: 12,
      urgent: 5,
      color: "#3b82f6",
      icon: Layers,
      action: "Review",
    },
    {
      label: "Transport Requests",
      value: 4,
      urgent: 2,
      color: "#8b5cf6",
      icon: Car,
      action: "Assign",
    },
    {
      label: "Support Tickets",
      value: 9,
      urgent: 1,
      color: "#ef4444",
      icon: Bell,
      action: "View",
    },
  ];

  // Real-time metrics
  const realtimeMetrics = [
    {
      label: "Active Bookings Today",
      value: "28",
      change: "+12 vs yesterday",
      icon: Calendar,
      color: "#22c55e",
      glow: "rgba(34,197,94,0.15)",
    },
    {
      label: "Revenue Today",
      value: "$4,890",
      change: "+18% vs avg",
      icon: DollarSign,
      color: "#10b981",
      glow: "rgba(16,185,129,0.15)",
    },
    {
      label: "Active Vendors",
      value: "42",
      change: "+3 this week",
      icon: Users,
      color: "#3b82f6",
      glow: "rgba(59,130,246,0.2)",
    },
    {
      label: "Total Listings",
      value: "247",
      change: "+12 this month",
      icon: Layers,
      color: "#60a5fa",
      glow: "rgba(96,165,250,0.15)",
    },
  ];

  // Live bookings data
  const liveBookings = [
    {
      id: "BK-2847",
      customer: "James Wilson",
      listing: "Jetwing Yala Resort",
      vendor: "Jetwing Hotels",
      type: "Stay",
      amount: "$890",
      status: "confirmed",
      paymentStatus: "paid",
      time: "2 min ago",
      typeColor: "#60a5fa",
    },
    {
      id: "BK-2846",
      customer: "Sarah Chen",
      listing: "Yala National Park Safari",
      vendor: "Safari Adventures LK",
      type: "Safari",
      amount: "$240",
      status: "pending",
      paymentStatus: "pending",
      time: "8 min ago",
      typeColor: "#34d399",
    },
    {
      id: "BK-2845",
      customer: "David Kumar",
      listing: "Colombo Airport Transfer",
      vendor: "TukTuk Pro",
      type: "Transfer",
      amount: "$35",
      status: "confirmed",
      paymentStatus: "paid",
      time: "15 min ago",
      typeColor: "#94a3b8",
    },
    {
      id: "BK-2844",
      customer: "Emma Thompson",
      listing: "Galle Fort Heritage Walk",
      vendor: "Heritage Tours",
      type: "Tour",
      amount: "$65",
      status: "confirmed",
      paymentStatus: "paid",
      time: "23 min ago",
      typeColor: "#22d3ee",
    },
  ];

  // Vendor approval queue
  const vendorQueue = [
    {
      id: "V-2847",
      company: "Ceylon Luxury Retreats",
      categories: ["Stay", "Experience"],
      submitted: "2h ago",
      riskScore: "low",
      email: "info@ceylonluxury.com",
      documents: 8,
    },
    {
      id: "V-2846",
      company: "Wild Adventures Sri Lanka",
      categories: ["Safari", "Tour"],
      submitted: "5h ago",
      riskScore: "medium",
      email: "booking@wildadventures.lk",
      documents: 6,
    },
    {
      id: "V-2845",
      company: "Kandy Express Transfers",
      categories: ["Transfer"],
      submitted: "1d ago",
      riskScore: "low",
      email: "contact@kandyexpress.com",
      documents: 7,
    },
  ];

  // Listings review queue
  const listingsQueue = [
    {
      id: "L-8942",
      title: "Luxury Beach Villa - Mirissa",
      vendor: "Ceylon Luxury Retreats",
      type: "Stay",
      qualityScore: 92,
      issues: [],
      submitted: "3h ago",
      typeColor: "#60a5fa",
    },
    {
      id: "L-8941",
      title: "Udawalawe Elephant Safari",
      vendor: "Wild Adventures",
      type: "Safari",
      qualityScore: 78,
      issues: ["Missing pricing info"],
      submitted: "6h ago",
      typeColor: "#34d399",
    },
    {
      id: "L-8940",
      title: "Colombo City Food Tour",
      vendor: "Taste of Lanka",
      type: "Experience",
      qualityScore: 88,
      issues: [],
      submitted: "1d ago",
      typeColor: "#fbbf24",
    },
  ];

  // Transport operations
  const transportRequests = [
    {
      id: "TR-4721",
      pickup: "CMB Airport",
      destination: "Galle Fort Hotel",
      time: "Today, 3:30 PM",
      passengers: 4,
      status: "pending",
      driver: null,
    },
    {
      id: "TR-4720",
      pickup: "Jetwing Yala",
      destination: "Ella Station",
      time: "Today, 5:00 PM",
      passengers: 2,
      status: "assigned",
      driver: "Rohan Silva",
    },
    {
      id: "TR-4719",
      pickup: "Kandy City",
      destination: "Nuwara Eliya",
      time: "Tomorrow, 8:00 AM",
      passengers: 6,
      status: "pending",
      driver: null,
    },
  ];

  // Revenue analytics
  const revenueMetrics = [
    {
      label: "MTD Revenue",
      value: "$48.2K",
      change: "+24%",
      trend: "up",
    },
    {
      label: "Avg. Booking Value",
      value: "$312",
      change: "+8%",
      trend: "up",
    },
    {
      label: "Cancellation Rate",
      value: "3.2%",
      change: "-1.1%",
      trend: "down",
    },
    {
      label: "Vendor Payout Pending",
      value: "$12.8K",
      change: "8 vendors",
      trend: "neutral",
    },
  ];

  // Category performance
  const categoryPerformance = [
    { name: "Stay", bookings: 142, revenue: "$28.4K", growth: "+18%", color: "#60a5fa" },
    { name: "Safari", bookings: 89, revenue: "$12.7K", growth: "+24%", color: "#34d399" },
    { name: "Tour", bookings: 76, revenue: "$5.2K", growth: "+12%", color: "#22d3ee" },
    { name: "Experience", bookings: 34, revenue: "$1.6K", growth: "+8%", color: "#fbbf24" },
    { name: "Transfer", bookings: 58, revenue: "$1.1K", growth: "+6%", color: "#94a3b8" },
  ];

  // Enhanced activity feed
  const activityFeed = [
    {
      type: "booking_confirmed",
      text: "New booking confirmed",
      detail: "Jetwing Yala Resort • $890",
      time: "2 min ago",
      icon: CheckCircle,
      color: "var(--success)",
    },
    {
      type: "vendor_approved",
      text: "Vendor approved",
      detail: "Ceylon Luxury Retreats • Stay, Experience",
      time: "15 min ago",
      icon: ThumbsUp,
      color: "var(--accent-navy)",
    },
    {
      type: "listing_published",
      text: "Listing published",
      detail: "Udawalawe Safari • Wild Adventures",
      time: "28 min ago",
      icon: Zap,
      color: "#22c55e",
    },
    {
      type: "payout_processed",
      text: "Payout processed",
      detail: "Safari Adventures LK • $2,450",
      time: "1h ago",
      icon: DollarSign,
      color: "#10b981",
    },
    {
      type: "transport_assigned",
      text: "Driver assigned",
      detail: "TR-4720 • Rohan Silva",
      time: "1h ago",
      icon: Car,
      color: "#8b5cf6",
    },
    {
      type: "booking_cancelled",
      text: "Booking cancelled",
      detail: "BK-2823 • Customer request • $120 refunded",
      time: "2h ago",
      icon: XCircle,
      color: "#ef4444",
    },
    {
      type: "review_submitted",
      text: "New review submitted",
      detail: "Galle Fort Walk • 5 stars",
      time: "3h ago",
      icon: Star,
      color: "#fbbf24",
    },
  ];

  // Helper function for quality score color
  const getQualityScoreColor = (score: number) => {
    if (score >= 90) return { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80", border: "rgba(34,197,94,0.3)" };
    if (score >= 75) return { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59,130,246,0.3)" };
    return { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245,158,11,0.3)" };
  };

  // Helper function for risk score badge
  const getRiskBadge = (risk: string) => {
    if (risk === "low") return { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80" };
    if (risk === "medium") return { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24" };
    return { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171" };
  };

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Operations Dashboard
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Real-time marketplace operations for Travel Ready Tours
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["today", "week", "month"].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className="px-3 py-1.5 rounded-lg text-[12px] transition-all capitalize"
              style={
                selectedPeriod === period
                  ? {
                      background: "var(--active-overlay)",
                      color: "var(--accent-navy-light)",
                      border: "1px solid var(--border-accent)",
                    }
                  : {
                      background: "var(--input-background)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-light)",
                    }
              }
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Operational Alerts - Priority Actions Needed */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-accent)",
          boxShadow: "0 0 0 1px var(--border-accent), var(--shadow-md)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={16} style={{ color: "var(--warning)" }} />
          <h2 className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Requires Attention
          </h2>
          <span
            className="ml-auto text-[11px] px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#f87171",
            }}
          >
            {operationalAlerts.reduce((sum, alert) => sum + alert.urgent, 0)} urgent
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {operationalAlerts.map((alert) => (
            <div
              key={alert.label}
              className="relative rounded-lg p-3 cursor-pointer transition-all group"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
                (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)";
                (e.currentTarget as HTMLElement).style.background = "var(--input-background)";
              }}
            >
              {alert.urgent > 0 && (
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] animate-pulse"
                  style={{
                    background: "#ef4444",
                    color: "white",
                    fontWeight: 600,
                    boxShadow: "0 0 12px rgba(239, 68, 68, 0.6)",
                  }}
                >
                  {alert.urgent}
                </div>
              )}
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: `${alert.color}20`,
                  }}
                >
                  <alert.icon size={14} style={{ color: alert.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-[18px]" style={{ color: "var(--text-primary)", fontWeight: 700, lineHeight: 1 }}>
                    {alert.value}
                  </p>
                </div>
              </div>
              <p className="text-[11px] mb-2" style={{ color: "var(--text-secondary)" }}>
                {alert.label}
              </p>
              <button
                className="text-[10px] px-2 py-1 rounded transition-all"
                style={{
                  background: "var(--active-overlay)",
                  color: "var(--accent-navy-light)",
                  border: "1px solid var(--border-accent)",
                  fontWeight: 500,
                }}
              >
                {alert.action} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {realtimeMetrics.map((metric) => (
          <div
            key={metric.label}
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
                style={{ background: metric.glow }}
              >
                <metric.icon size={18} style={{ color: metric.color }} />
              </div>
            </div>
            <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {metric.value}
            </p>
            <p className="text-[12px] mb-1" style={{ color: "var(--text-tertiary)" }}>
              {metric.label}
            </p>
            <p className="text-[11px]" style={{ color: "#4ade80" }}>
              {metric.change}
            </p>
          </div>
        ))}
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Live Bookings Operations */}
        <div
          className="col-span-2 rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#22c55e", boxShadow: "0 0 8px #22c55e" }}
              />
              <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Live Booking Operations
              </h2>
            </div>
            <button
              className="text-[11px] px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "var(--input-background)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-light)",
              }}
            >
              View All →
            </button>
          </div>
          <div>
            {liveBookings.map((booking, index) => (
              <div
                key={booking.id}
                className="px-5 py-3.5 group cursor-pointer transition-all"
                style={{
                  borderBottom: index < liveBookings.length - 1 ? "1px solid var(--border-light)" : "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {booking.id}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded"
                        style={{
                          background: `${booking.typeColor}20`,
                          color: booking.typeColor,
                          border: `1px solid ${booking.typeColor}40`,
                        }}
                      >
                        {booking.type}
                      </span>
                      {booking.status === "confirmed" ? (
                        <CheckCircle size={12} style={{ color: "#22c55e" }} />
                      ) : (
                        <Clock size={12} style={{ color: "#f59e0b" }} />
                      )}
                    </div>
                    <p className="text-[12px] mb-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
                      {booking.customer} • {booking.listing}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                      {booking.vendor}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {booking.amount}
                    </p>
                    <div
                      className="text-[10px] px-2 py-0.5 rounded mb-1"
                      style={
                        booking.paymentStatus === "paid"
                          ? { background: "rgba(34, 197, 94, 0.1)", color: "#4ade80" }
                          : { background: "rgba(245, 158, 11, 0.1)", color: "#fbbf24" }
                      }
                    >
                      {booking.paymentStatus}
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                      {booking.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="text-[10px] px-2.5 py-1 rounded transition-all"
                    style={{
                      background: "var(--active-overlay)",
                      color: "var(--accent-navy-light)",
                      border: "1px solid var(--border-accent)",
                    }}
                  >
                    View
                  </button>
                  <button
                    className="text-[10px] px-2.5 py-1 rounded transition-all"
                    style={{
                      background: "rgba(34, 197, 94, 0.1)",
                      color: "#4ade80",
                      border: "1px solid rgba(34,197,94,0.3)",
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="text-[10px] px-2.5 py-1 rounded transition-all"
                    style={{
                      color: "var(--text-tertiary)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    Contact Vendor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue & Performance */}
        <div className="space-y-5">
          {/* Revenue Metrics */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h2 className="text-[13px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Revenue Metrics
            </h2>
            <div className="space-y-3">
              {revenueMetrics.map((metric) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {metric.label}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={
                        metric.trend === "up"
                          ? { background: "rgba(34, 197, 94, 0.1)", color: "#4ade80" }
                          : metric.trend === "down"
                          ? { background: "rgba(34, 197, 94, 0.1)", color: "#4ade80" }
                          : { background: "var(--input-background)", color: "var(--text-tertiary)" }
                      }
                    >
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h2 className="text-[13px] mb-3" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Category Performance
            </h2>
            <div className="space-y-2.5">
              {categoryPerformance.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                      <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#4ade80" }}>
                      {cat.growth}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {cat.revenue}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                      {cat.bookings} bookings
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Approval Queue & Listings Review */}
      <div className="grid grid-cols-2 gap-5">
        {/* Vendor Approval Queue */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}
          >
            <div>
              <h2 className="text-[14px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Vendor Approval Queue
              </h2>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Pending applications requiring review
              </p>
            </div>
            <span
              className="text-[11px] px-2 py-1 rounded"
              style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", fontWeight: 500 }}
            >
              {vendorQueue.length} pending
            </span>
          </div>
          <div>
            {vendorQueue.map((vendor, index) => (
              <div
                key={vendor.id}
                className="px-5 py-4 transition-all"
                style={{
                  borderBottom: index < vendorQueue.length - 1 ? "1px solid var(--border-light)" : "none",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {vendor.company}
                      </p>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide"
                        style={getRiskBadge(vendor.riskScore)}
                      >
                        {vendor.riskScore} risk
                      </span>
                    </div>
                    <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>
                      {vendor.email} • {vendor.documents} documents
                    </p>
                    <div className="flex gap-1">
                      {vendor.categories.map((cat) => (
                        <span
                          key={cat}
                          className="text-[10px] px-2 py-0.5 rounded"
                          style={{
                            background: "var(--active-overlay)",
                            color: "var(--accent-navy-light)",
                            border: "1px solid var(--border-accent)",
                          }}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: "var(--text-tertiary)" }}>
                    {vendor.submitted}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 text-[11px] px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: "rgba(34, 197, 94, 0.1)",
                      color: "#4ade80",
                      border: "1px solid rgba(34,197,94,0.3)",
                      fontWeight: 500,
                    }}
                  >
                    <ThumbsUp size={12} />
                    Approve
                  </button>
                  <button
                    className="flex-1 text-[11px] px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#f87171",
                      border: "1px solid rgba(239,68,68,0.3)",
                      fontWeight: 500,
                    }}
                  >
                    <ThumbsDown size={12} />
                    Reject
                  </button>
                  <button
                    className="text-[11px] px-3 py-2 rounded-lg transition-all"
                    style={{
                      background: "var(--input-background)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listings Review Queue */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}
          >
            <div>
              <h2 className="text-[14px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Listings Review Queue
              </h2>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Content moderation & quality check
              </p>
            </div>
            <span
              className="text-[11px] px-2 py-1 rounded"
              style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", fontWeight: 500 }}
            >
              {listingsQueue.length} pending
            </span>
          </div>
          <div>
            {listingsQueue.map((listing, index) => (
              <div
                key={listing.id}
                className="px-5 py-4 transition-all"
                style={{
                  borderBottom: index < listingsQueue.length - 1 ? "1px solid var(--border-light)" : "none",
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-lg shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${listing.typeColor}40, ${listing.typeColor}20)`,
                      border: `1px solid ${listing.typeColor}30`,
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[13px] truncate" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {listing.title}
                      </p>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded shrink-0"
                        style={{
                          background: `${listing.typeColor}20`,
                          color: listing.typeColor,
                          border: `1px solid ${listing.typeColor}40`,
                        }}
                      >
                        {listing.type}
                      </span>
                    </div>
                    <p className="text-[11px] mb-2 truncate" style={{ color: "var(--text-tertiary)" }}>
                      {listing.vendor} • {listing.submitted}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Star size={11} style={{ color: "#fbbf24" }} />
                        <span
                          className="text-[11px] px-2 py-0.5 rounded"
                          style={{
                            ...getQualityScoreColor(listing.qualityScore),
                            border: `1px solid ${getQualityScoreColor(listing.qualityScore).border}`,
                            fontWeight: 500,
                          }}
                        >
                          {listing.qualityScore}% quality
                        </span>
                      </div>
                      {listing.issues.length > 0 && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
                        >
                          {listing.issues.length} issue{listing.issues.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="w-full text-[11px] px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: "var(--active-overlay)",
                    color: "var(--accent-navy-light)",
                    border: "1px solid var(--border-accent)",
                    fontWeight: 500,
                  }}
                >
                  Review Listing
                  <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transport Operations & Activity Feed */}
      <div className="grid grid-cols-3 gap-5">
        {/* Transport Operations */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}
          >
            <div>
              <h2 className="text-[14px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Transport Requests
              </h2>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Driver assignment needed
              </p>
            </div>
            <Car size={16} style={{ color: "#8b5cf6" }} />
          </div>
          <div>
            {transportRequests.map((req, index) => (
              <div
                key={req.id}
                className="px-5 py-3.5 transition-all"
                style={{
                  borderBottom: index < transportRequests.length - 1 ? "1px solid var(--border-light)" : "none",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {req.id}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={
                      req.status === "assigned"
                        ? { background: "rgba(34, 197, 94, 0.1)", color: "#4ade80" }
                        : { background: "rgba(245, 158, 11, 0.1)", color: "#fbbf24" }
                    }
                  >
                    {req.status}
                  </span>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-start gap-2">
                    <MapPin size={11} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                    <div className="flex-1">
                      <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                        {req.pickup}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                        {req.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} style={{ color: "var(--text-tertiary)" }} />
                      <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        {req.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={11} style={{ color: "var(--text-tertiary)" }} />
                      <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        {req.passengers} pax
                      </span>
                    </div>
                  </div>
                  {req.driver && (
                    <p className="text-[10px]" style={{ color: "#4ade80" }}>
                      Driver: {req.driver}
                    </p>
                  )}
                </div>
                {req.status === "pending" && (
                  <button
                    className="w-full text-[11px] px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: "rgba(139, 92, 246, 0.1)",
                      color: "#a78bfa",
                      border: "1px solid rgba(139,92,246,0.3)",
                      fontWeight: 500,
                    }}
                  >
                    Assign Driver
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Activity Feed */}
        <div
          className="col-span-2 rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}
          >
            <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Marketplace Activity Feed
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="space-y-3.5">
              {activityFeed.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `${activity.color}15`,
                      border: `1px solid ${activity.color}30`,
                    }}
                  >
                    <activity.icon size={14} style={{ color: activity.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {activity.text}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: "var(--text-secondary)" }}>
                      {activity.detail}
                    </p>
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: "var(--text-tertiary)" }}>
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={[
          {
            label: "Create Listing",
            icon: ShoppingBag,
            color: "#10b981",
            onClick: () => navigate("/listings/create"),
          },
          {
            label: "Add Vendor",
            icon: Users,
            color: "#3b82f6",
            onClick: () => navigate("/vendors"),
          },
          {
            label: "View Bookings",
            icon: Calendar,
            color: "#f59e0b",
            onClick: () => navigate("/bookings"),
          },
          {
            label: "Generate Report",
            icon: FileText,
            color: "#8b5cf6",
            onClick: () => navigate("/analytics"),
          },
        ]}
      />
    </div>
  );
}

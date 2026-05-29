import { useState } from "react";
import {
  TrendingUp,
  Layers,
  Clock,
  CheckCircle,
  DollarSign,
  Eye,
  Edit2,
  Package,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Bed,
  Star,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function VendorDashboard() {
  const { user } = useAuth();
  const approvedCategories = user?.approvedCategories || [];

  const kpis = [
    {
      label: "Active Listings",
      value: "12",
      change: "+2 this month",
      trend: "+16.7%",
      icon: Layers,
      color: "#3b82f6",
      glow: "rgba(59,130,246,0.2)",
    },
    {
      label: "Bookings This Month",
      value: "47",
      change: "+12 vs last month",
      trend: "+34.3%",
      icon: CheckCircle,
      color: "#10b981",
      glow: "rgba(16,185,129,0.15)",
    },
    {
      label: "Revenue This Month",
      value: "$12.4K",
      change: "+$2.8K increase",
      trend: "+29.1%",
      icon: DollarSign,
      color: "#22c55e",
      glow: "rgba(34,197,94,0.15)",
    },
    {
      label: "Pending Requests",
      value: "8",
      change: "Awaiting response",
      trend: "2 urgent",
      icon: Clock,
      color: "#f59e0b",
      glow: "rgba(245,158,11,0.15)",
    },
    {
      label: "Average Rating",
      value: "4.8",
      change: "Based on 127 reviews",
      trend: "+0.2",
      icon: Star,
      color: "#eab308",
      glow: "rgba(234,179,8,0.15)",
    },
    {
      label: "Listing Views",
      value: "1,847",
      change: "+18% vs last month",
      trend: "+280",
      icon: Eye,
      color: "#06b6d4",
      glow: "rgba(6,182,212,0.15)",
    },
  ];

  const recentListings = [
    {
      id: "lst_001",
      title: "Yala National Park Safari",
      category: "Safari",
      status: "approved",
      views: 342,
      bookings: 18,
      lastUpdated: "2 hours ago",
    },
    {
      id: "lst_002",
      title: "Minneriya Wildlife Safari",
      category: "Safari",
      status: "pending",
      views: 0,
      bookings: 0,
      lastUpdated: "5 hours ago",
    },
    {
      id: "lst_003",
      title: "Galle Fort Heritage Walk",
      category: "Tour",
      status: "approved",
      views: 256,
      bookings: 12,
      lastUpdated: "1 day ago",
    },
  ];

  const recentBookings = [
    {
      id: "bkg_001",
      listing: "Yala National Park Safari",
      customer: "John Smith",
      date: "May 25, 2026",
      amount: "$170",
      status: "confirmed",
    },
    {
      id: "bkg_002",
      listing: "Galle Fort Heritage Walk",
      customer: "Emma Wilson",
      date: "May 24, 2026",
      amount: "$85",
      status: "confirmed",
    },
    {
      id: "bkg_003",
      listing: "Yala National Park Safari",
      customer: "Michael Brown",
      date: "May 26, 2026",
      amount: "$170",
      status: "pending",
    },
  ];

  // Quick access availability calendar data (for Stay vendors)
  const getNext7Days = () => {
    const days = [];
    const today = new Date(2026, 4, 18); // May 18, 2026
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.getDate(),
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        month: date.toLocaleDateString("en-US", { month: "short" }),
      });
    }
    return days;
  };

  const roomTypes = [
    { id: "deluxe", name: "Deluxe Room", total: 15 },
    { id: "suite", name: "Suite", total: 8 },
    { id: "villa", name: "Private Villa", total: 4 },
  ];

  // Mock availability data (available rooms per day)
  const availabilityData: Record<string, Record<string, number>> = {
    deluxe: { "18": 8, "19": 5, "20": 2, "21": 0, "22": 3, "23": 7, "24": 12 },
    suite: { "18": 6, "19": 4, "20": 1, "21": 2, "22": 5, "23": 6, "24": 7 },
    villa: { "18": 2, "19": 1, "20": 0, "21": 0, "22": 1, "23": 3, "24": 4 },
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage === 0) return { bg: "rgba(239,68,68,0.15)", text: "#f87171", border: "rgba(239,68,68,0.3)" };
    if (percentage < 30) return { bg: "rgba(245,158,11,0.15)", text: "#fbbf24", border: "rgba(245,158,11,0.3)" };
    if (percentage < 70) return { bg: "rgba(59,130,246,0.15)", text: "#60a5fa", border: "rgba(59,130,246,0.3)" };
    return { bg: "rgba(34,197,94,0.15)", text: "#4ade80", border: "rgba(34,197,94,0.3)" };
  };

  const hasStayCategory = approvedCategories.includes("Stay");

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Vendor Dashboard
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Welcome back, {user?.name}! Manage your listings and track performance.
        </p>
      </div>

      {/* Approved Categories Info */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--accent-navy-subtle)",
          border: "1px solid var(--border-accent)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] mb-1" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
              Your Approved Categories
            </p>
            <div className="flex gap-2">
              {approvedCategories.map((cat) => (
                <span
                  key={cat}
                  className="text-[11px] px-2.5 py-1 rounded-lg"
                  style={{
                    background: "var(--active-overlay)",
                    color: "var(--accent-navy-light)",
                    border: "1px solid var(--border-accent)",
                    fontWeight: 500,
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <CheckCircle size={20} style={{ color: "var(--success)" }} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => (
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
                style={{ background: kpi.glow }}
              >
                <kpi.icon size={18} style={{ color: kpi.color }} />
              </div>
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px]"
                style={{
                  background: "rgba(34,197,94,0.1)",
                  color: "#4ade80",
                  fontWeight: 600,
                }}
              >
                <ArrowUpRight size={11} />
                {kpi.trend}
              </div>
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
        ))}
      </div>

      {/* Quick Access Availability Calendar - Only for Stay vendors */}
      {hasStayCategory && (
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
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(37,99,235,0.15)", boxShadow: "0 0 12px rgba(37,99,235,0.2)" }}
              >
                <Bed size={16} style={{ color: "#60a5fa" }} />
              </div>
              <div>
                <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  Quick Availability Overview
                </h2>
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  Next 7 days - Room availability at a glance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                <ChevronRight size={14} />
              </button>
              <button
                className="text-[11px] px-3 py-1.5 rounded-lg transition-all ml-2"
                style={{
                  background: "var(--active-overlay)",
                  color: "var(--accent-navy-light)",
                  border: "1px solid var(--border-accent)",
                  fontWeight: 500,
                }}
              >
                Full Calendar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 650 }}>
              <thead>
                <tr style={{ background: "var(--input-background)" }}>
                  <th
                    className="px-5 py-3 text-left"
                    style={{
                      borderBottom: "1px solid var(--border-light)",
                      borderRight: "1px solid var(--border-light)",
                    }}
                  >
                    <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                      Room Type
                    </span>
                  </th>
                  {getNext7Days().map((day, i) => (
                    <th
                      key={i}
                      className="px-3 py-3 text-center"
                      style={{
                        borderBottom: "1px solid var(--border-light)",
                        background: i === 0 ? "var(--active-overlay)" : "transparent",
                      }}
                    >
                      <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {day.day}
                      </div>
                      <div className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {day.date}
                      </div>
                      <div className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>
                        {day.month}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roomTypes.map((room, rowIndex) => (
                  <tr
                    key={room.id}
                    style={{
                      borderBottom: rowIndex < roomTypes.length - 1 ? "1px solid var(--border-light)" : "none",
                    }}
                  >
                    <td
                      className="px-5 py-4"
                      style={{
                        borderRight: "1px solid var(--border-light)",
                        background: "var(--input-background)",
                      }}
                    >
                      <div>
                        <p className="text-[12px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                          {room.name}
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          {room.total} total units
                        </p>
                      </div>
                    </td>
                    {getNext7Days().map((day, colIndex) => {
                      const available = availabilityData[room.id][day.date.toString()];
                      const colors = getAvailabilityColor(available, room.total);
                      return (
                        <td key={colIndex} className="px-3 py-4 text-center">
                          <div
                            className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-[12px] min-w-[50px]"
                            style={{
                              background: colors.bg,
                              color: colors.text,
                              border: `1px solid ${colors.border}`,
                              fontWeight: 600,
                            }}
                          >
                            {available}/{room.total}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }} />
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>70%+ Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }} />
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>30-70% Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }} />
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Low Availability</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }} />
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Sold Out</span>
              </div>
            </div>
            <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              Click "Full Calendar" for detailed room management
            </p>
          </div>
        </div>
      )}

      {/* Payout Summary & Review Alerts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Payout Summary */}
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
                  Payout Summary
                </h2>
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  Next payout on May 25, 2026
                </p>
              </div>
              <DollarSign size={20} style={{ color: "var(--success)" }} />
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                Pending Payout
              </span>
              <span className="text-[18px]" style={{ color: "var(--success)", fontWeight: 700 }}>
                $8,450
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                Commission Deducted
              </span>
              <span className="text-[13px]" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                $1,266 (15%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                Total Earnings (30d)
              </span>
              <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                $12,400
              </span>
            </div>
          </div>
          <div className="px-5 py-3" style={{ background: "var(--input-background)", borderTop: "1px solid var(--border-light)" }}>
            <button
              className="text-[12px] w-full py-2 rounded-lg transition-all"
              style={{
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-light)",
              }}
            >
              View Revenue Details
            </button>
          </div>
        </div>

        {/* Review Alerts */}
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
                  Recent Reviews
                </h2>
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  Average rating: 4.8/5.0
                </p>
              </div>
              <Star size={20} style={{ color: "#eab308" }} />
            </div>
          </div>
          <div>
            {[
              { customer: "Sarah Johnson", listing: "Yala Safari", rating: 5, comment: "Amazing experience! Highly recommend...", date: "2 hours ago" },
              { customer: "Mike Chen", listing: "Galle Fort Tour", rating: 4, comment: "Great tour guide, very informative...", date: "5 hours ago" },
              { customer: "Emma Wilson", listing: "Yala Safari", rating: 5, comment: "Best safari experience of our trip...", date: "1 day ago" },
            ].map((review, i) => (
              <div
                key={i}
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
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  {review.date}
                </p>
              </div>
            ))}
          </div>
          <div className="px-5 py-3" style={{ background: "var(--input-background)", borderTop: "1px solid var(--border-light)" }}>
            <button
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

      {/* Recent Listings & Bookings */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Listings */}
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
              Your Listings
            </h2>
            <button
              className="text-[11px] px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "var(--active-overlay)",
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
              }}
            >
              Create New
            </button>
          </div>
          <div>
            {recentListings.map((listing) => (
              <div
                key={listing.id}
                className="px-5 py-4 group cursor-pointer transition-all"
                style={{ borderBottom: "1px solid var(--border-light)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] mb-0.5 truncate" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {listing.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--active-overlay)",
                          color: "var(--accent-navy-light)",
                        }}
                      >
                        {listing.category}
                      </span>
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                        style={
                          listing.status === "pending"
                            ? { background: "rgba(245,158,11,0.1)", color: "#fbbf24" }
                            : { background: "rgba(34,197,94,0.1)", color: "#4ade80" }
                        }
                      >
                        {listing.status === "pending" ? <Clock size={9} /> : <CheckCircle size={9} />}
                        {listing.status}
                      </div>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 size={14} style={{ color: "var(--accent-navy-light)" }} />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    <Eye size={10} className="inline mr-1" />
                    {listing.views} views
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    <Package size={10} className="inline mr-1" />
                    {listing.bookings} bookings
                  </span>
                  <span className="text-[11px] ml-auto" style={{ color: "var(--text-tertiary)" }}>
                    {listing.lastUpdated}
                  </span>
                </div>
              </div>
            ))}
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
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Recent Bookings
            </h2>
          </div>
          <div>
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="px-5 py-4 group cursor-pointer transition-all"
                style={{ borderBottom: "1px solid var(--border-light)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] mb-0.5 truncate" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {booking.listing}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                      {booking.customer}
                    </p>
                  </div>
                  <span
                    className="text-[13px] shrink-0 ml-2"
                    style={{ color: "var(--success)", fontWeight: 600 }}
                  >
                    {booking.amount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={10} style={{ color: "var(--text-tertiary)" }} />
                    <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      {booking.date}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                    style={
                      booking.status === "confirmed"
                        ? { background: "rgba(34,197,94,0.1)", color: "#4ade80" }
                        : { background: "rgba(245,158,11,0.1)", color: "#fbbf24" }
                    }
                  >
                    {booking.status === "confirmed" ? <CheckCircle size={9} /> : <Clock size={9} />}
                    {booking.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3" style={{ background: "var(--input-background)" }}>
            <button
              className="text-[12px] w-full py-2 rounded-lg transition-all"
              style={{
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-light)",
              }}
            >
              View All Bookings
            </button>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div
        className="rounded-xl p-6"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h2 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Performance Overview (Last 30 Days)
        </h2>
        <div
          className="rounded-lg flex items-center justify-center"
          style={{
            height: 200,
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
          }}
        >
          <div className="text-center">
            <TrendingUp size={32} style={{ color: "var(--text-tertiary)", margin: "0 auto 8px" }} />
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              Performance chart - Views, Bookings & Revenue trends
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

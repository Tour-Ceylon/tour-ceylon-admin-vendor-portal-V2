import { useState } from "react";
import {
  TrendingUp,
  Eye,
  MousePointerClick,
  CheckCircle,
  Star,
  Calendar,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function ListingPerformancePage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const performanceStats = [
    {
      label: "Total Views",
      value: "1,847",
      change: "+18%",
      trend: "+280",
      icon: Eye,
      color: "#3b82f6",
    },
    {
      label: "Click-Through Rate",
      value: "12.4%",
      change: "+2.1%",
      trend: "↑",
      icon: MousePointerClick,
      color: "#10b981",
    },
    {
      label: "Booking Conversion",
      value: "8.7%",
      change: "+1.3%",
      trend: "↑",
      icon: CheckCircle,
      color: "#22c55e",
    },
    {
      label: "Average Rating",
      value: "4.8",
      change: "+0.2",
      trend: "↑",
      icon: Star,
      color: "#eab308",
    },
  ];

  const trafficTrendData = [
    { date: "Apr 20", views: 45, clicks: 12, bookings: 3 },
    { date: "Apr 23", views: 52, clicks: 15, bookings: 4 },
    { date: "Apr 26", views: 48, clicks: 14, bookings: 5 },
    { date: "Apr 29", views: 61, clicks: 18, bookings: 6 },
    { date: "May 2", views: 58, clicks: 16, bookings: 4 },
    { date: "May 5", views: 67, clicks: 21, bookings: 7 },
    { date: "May 8", views: 72, clicks: 24, bookings: 8 },
    { date: "May 11", views: 69, clicks: 22, bookings: 6 },
    { date: "May 14", views: 78, clicks: 26, bookings: 9 },
    { date: "May 17", views: 84, clicks: 29, bookings: 10 },
  ];

  const listingPerformance = [
    {
      id: "1",
      name: "Yala National Park Safari",
      category: "Safari",
      views: 842,
      clicks: 127,
      bookings: 34,
      conversion: 4.0,
      revenue: "$5,780",
      rating: 4.9,
      trend: "+24%",
    },
    {
      id: "2",
      name: "Galle Fort Heritage Walk",
      category: "Tour",
      views: 512,
      clicks: 89,
      bookings: 21,
      conversion: 4.1,
      revenue: "$1,785",
      rating: 4.7,
      trend: "+18%",
    },
    {
      id: "3",
      name: "Minneriya Wildlife Safari",
      category: "Safari",
      views: 389,
      clicks: 54,
      bookings: 15,
      conversion: 3.9,
      revenue: "$2,550",
      rating: 4.8,
      trend: "+12%",
    },
    {
      id: "4",
      name: "Sigiriya Rock Fortress Tour",
      category: "Tour",
      views: 104,
      clicks: 18,
      bookings: 3,
      conversion: 2.9,
      revenue: "$255",
      rating: 4.5,
      trend: "New",
    },
  ];

  const conversionFunnelData = [
    { stage: "Views", count: 1847, percentage: 100 },
    { stage: "Clicks", count: 288, percentage: 15.6 },
    { stage: "Inquiries", count: 124, percentage: 6.7 },
    { stage: "Bookings", count: 73, percentage: 4.0 },
  ];

  const seasonalDemand = [
    { month: "Jan", bookings: 42 },
    { month: "Feb", bookings: 48 },
    { month: "Mar", bookings: 56 },
    { month: "Apr", bookings: 64 },
    { month: "May", bookings: 73 },
    { month: "Jun", bookings: 68 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Listing Performance
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Track views, conversions, and booking trends across all your listings
          </p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className="px-4 py-2 rounded-lg text-[12px] transition-all"
              style={
                timeRange === range
                  ? {
                      background: "var(--active-overlay)",
                      color: "var(--accent-navy-light)",
                      border: "1px solid var(--border-accent)",
                      fontWeight: 500,
                    }
                  : {
                      background: "var(--input-background)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-light)",
                    }
              }
            >
              Last {range}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-4 gap-4">
        {performanceStats.map((stat) => (
          <div
            key={stat.label}
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
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
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
                {stat.change}
              </div>
            </div>
            <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {stat.value}
            </p>
            <p className="text-[12px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
              {stat.label}
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              {stat.trend} vs last period
            </p>
          </div>
        ))}
      </div>

      {/* Traffic Trends Chart */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <h2 className="text-[14px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Traffic & Conversion Trends
          </h2>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Views, clicks, and booking activity over time
          </p>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trafficTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="date" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} name="Views" />
              <Line type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={2} name="Clicks" />
              <Line type="monotone" dataKey="bookings" stroke="#22c55e" strokeWidth={2} name="Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel & Seasonal Demand */}
      <div className="grid grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <h2 className="text-[14px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Conversion Funnel
            </h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Customer journey from view to booking
            </p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionFunnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis type="number" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Demand */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <h2 className="text-[14px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Booking Trends
            </h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Monthly booking patterns
            </p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={seasonalDemand}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="month" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="bookings" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Individual Listing Performance */}
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
            Top Performing Listings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 900 }}>
            <thead>
              <tr style={{ background: "var(--input-background)" }}>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Listing
                  </span>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Views
                  </span>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Clicks
                  </span>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Bookings
                  </span>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Conversion
                  </span>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Revenue
                  </span>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Rating
                  </span>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Trend
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {listingPerformance.map((listing, index) => (
                <tr
                  key={listing.id}
                  className="group cursor-pointer transition-all"
                  style={{ borderBottom: index < listingPerformance.length - 1 ? "1px solid var(--border-light)" : "none" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <td className="px-5 py-4">
                    <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {listing.name}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {listing.category}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {listing.views}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {listing.clicks}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {listing.bookings}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-[13px]" style={{ color: "var(--success)", fontWeight: 600 }}>
                      {listing.conversion}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-[13px]" style={{ color: "var(--success)", fontWeight: 600 }}>
                      {listing.revenue}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <Star size={12} style={{ color: "#eab308", fill: "#eab308" }} />
                      <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {listing.rating}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px]"
                      style={{
                        background: "rgba(34,197,94,0.1)",
                        color: "#4ade80",
                        fontWeight: 600,
                      }}
                    >
                      <ArrowUpRight size={11} />
                      {listing.trend}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

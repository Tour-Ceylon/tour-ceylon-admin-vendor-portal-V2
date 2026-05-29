import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  CreditCard,
  Calendar,
  ArrowUpRight,
  Download,
  CheckCircle,
  Clock,
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function VendorRevenueCenter() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  const revenueStats = [
    {
      label: "Total Earnings",
      value: "$24,850",
      change: "+29.1%",
      subtext: "Last 30 days",
      icon: DollarSign,
      color: "#10b981",
    },
    {
      label: "Pending Payout",
      value: "$8,450",
      change: "15 bookings",
      subtext: "Next payout: May 25",
      icon: Wallet,
      color: "#3b82f6",
    },
    {
      label: "Commission Deducted",
      value: "$3,728",
      change: "15% avg",
      subtext: "Platform fees",
      icon: CreditCard,
      color: "#f59e0b",
    },
    {
      label: "Highest Earning",
      value: "$5,780",
      change: "Yala Safari",
      subtext: "Best performer",
      icon: TrendingUp,
      color: "#22c55e",
    },
  ];

  const revenueChartData = [
    { month: "Nov", revenue: 8200, commission: 1230, net: 6970 },
    { month: "Dec", revenue: 12400, commission: 1860, net: 10540 },
    { month: "Jan", revenue: 15800, commission: 2370, net: 13430 },
    { month: "Feb", revenue: 18200, commission: 2730, net: 15470 },
    { month: "Mar", revenue: 21500, commission: 3225, net: 18275 },
    { month: "Apr", revenue: 24850, commission: 3728, net: 21122 },
  ];

  const listingRevenue = [
    {
      id: "1",
      name: "Yala National Park Safari",
      category: "Safari",
      bookings: 34,
      grossRevenue: "$5,780",
      commission: "$867",
      netRevenue: "$4,913",
      trend: "+24%",
    },
    {
      id: "2",
      name: "Minneriya Wildlife Safari",
      category: "Safari",
      bookings: 28,
      grossRevenue: "$4,760",
      commission: "$714",
      netRevenue: "$4,046",
      trend: "+18%",
    },
    {
      id: "3",
      name: "Galle Fort Heritage Walk",
      category: "Tour",
      bookings: 21,
      grossRevenue: "$1,785",
      commission: "$268",
      netRevenue: "$1,517",
      trend: "+12%",
    },
    {
      id: "4",
      name: "Sigiriya Rock Fortress Tour",
      category: "Tour",
      bookings: 15,
      grossRevenue: "$1,275",
      commission: "$191",
      netRevenue: "$1,084",
      trend: "+8%",
    },
  ];

  const payoutHistory = [
    {
      id: "1",
      date: "Apr 25, 2026",
      amount: "$18,275",
      status: "completed" as const,
      bookings: 47,
      method: "Bank Transfer",
    },
    {
      id: "2",
      date: "Mar 25, 2026",
      amount: "$15,470",
      status: "completed" as const,
      bookings: 39,
      method: "Bank Transfer",
    },
    {
      id: "3",
      date: "Feb 25, 2026",
      amount: "$13,430",
      status: "completed" as const,
      bookings: 34,
      method: "Bank Transfer",
    },
    {
      id: "4",
      date: "May 25, 2026",
      amount: "$8,450",
      status: "pending" as const,
      bookings: 15,
      method: "Bank Transfer",
    },
  ];

  const monthlyComparison = [
    { metric: "Gross Revenue", current: "$24,850", previous: "$19,250", change: "+29.1%" },
    { metric: "Commission", current: "$3,728", previous: "$2,888", change: "+29.1%" },
    { metric: "Net Revenue", current: "$21,122", previous: "$16,362", change: "+29.1%" },
    { metric: "Average per Booking", current: "$340", previous: "$315", change: "+7.9%" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Revenue Center
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Track earnings, payouts, and financial performance
          </p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d", "1y"] as const).map((range) => (
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
              {range === "1y" ? "1 Year" : `Last ${range}`}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-4 gap-4">
        {revenueStats.map((stat) => (
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
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue Trends Chart */}
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
              Revenue Trends
            </h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Monthly gross revenue, commission, and net earnings
            </p>
          </div>
          <button
            className="px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-2"
            style={{
              background: "var(--input-background)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
              fontWeight: 500,
            }}
          >
            <Download size={12} />
            Export
          </button>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueGradient)" name="Gross Revenue" />
              <Area type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} fill="url(#netGradient)" name="Net Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Comparison & Payout History */}
      <div className="grid grid-cols-2 gap-6">
        {/* Monthly Comparison */}
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
              Monthly Comparison
            </h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Current vs previous month
            </p>
          </div>
          <div className="p-5 space-y-4">
            {monthlyComparison.map((item) => (
              <div key={item.metric} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[12px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    {item.metric}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                      {item.current}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      vs {item.previous}
                    </span>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px]"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    color: "#4ade80",
                    fontWeight: 600,
                  }}
                >
                  <ArrowUpRight size={11} />
                  {item.change}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payout History */}
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
              Payout History
            </h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Recent and upcoming payouts
            </p>
          </div>
          <div>
            {payoutHistory.map((payout, i) => (
              <div
                key={payout.id}
                className="px-5 py-4 group cursor-pointer transition-all"
                style={{ borderBottom: i < payoutHistory.length - 1 ? "1px solid var(--border-light)" : "none" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} style={{ color: "var(--text-tertiary)" }} />
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {payout.date}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                    style={
                      payout.status === "completed"
                        ? { background: "rgba(34,197,94,0.1)", color: "#4ade80" }
                        : { background: "rgba(245,158,11,0.1)", color: "#fbbf24" }
                    }
                  >
                    {payout.status === "completed" ? <CheckCircle size={9} /> : <Clock size={9} />}
                    {payout.status}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[16px] mb-0.5" style={{ color: "var(--success)", fontWeight: 700 }}>
                      {payout.amount}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {payout.bookings} bookings • {payout.method}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listing Revenue Breakdown */}
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
            Revenue by Listing
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 800 }}>
            <thead>
              <tr style={{ background: "var(--input-background)" }}>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Listing
                  </span>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Bookings
                  </span>
                </th>
                <th className="px-5 py-3 text-right" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Gross Revenue
                  </span>
                </th>
                <th className="px-5 py-3 text-right" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Commission
                  </span>
                </th>
                <th className="px-5 py-3 text-right" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Net Revenue
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
              {listingRevenue.map((listing, index) => (
                <tr
                  key={listing.id}
                  className="group cursor-pointer transition-all"
                  style={{ borderBottom: index < listingRevenue.length - 1 ? "1px solid var(--border-light)" : "none" }}
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
                      {listing.bookings}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {listing.grossRevenue}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-[13px]" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                      {listing.commission}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-[14px]" style={{ color: "var(--success)", fontWeight: 700 }}>
                      {listing.netRevenue}
                    </span>
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

import { useState } from "react";
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  Building2,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Globe,
  Compass,
  Anchor,
  Car,
  BedDouble,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const REVENUE_TREND = [
  { month: "Mar", revenue: 1240000, bookings: 412 },
  { month: "Apr", revenue: 1580000, bookings: 485 },
  { month: "May", revenue: 1820000, bookings: 532 },
  { month: "Jun", revenue: 1650000, bookings: 498 },
  { month: "Jul", revenue: 1980000, bookings: 581 },
  { month: "Aug", revenue: 2340000, bookings: 642 },
];

const REVENUE_BY_CATEGORY = [
  { name: "Stay", value: 845000, percentage: 36, color: "#3b82f6" },
  { name: "Tour", value: 620000, percentage: 26, color: "#10b981" },
  { name: "Safari", value: 480000, percentage: 21, color: "#f59e0b" },
  { name: "Experience", value: 285000, percentage: 12, color: "#8b5cf6" },
  { name: "Transfer", value: 110000, percentage: 5, color: "#0891b2" },
];

const TOP_DESTINATIONS = [
  { name: "Colombo", bookings: 142, revenue: 385000 },
  { name: "Yala", bookings: 98, revenue: 520000 },
  { name: "Galle", bookings: 87, revenue: 312000 },
  { name: "Kandy", bookings: 76, revenue: 285000 },
  { name: "Ella", bookings: 64, revenue: 245000 },
];

const BOOKING_TRENDS = [
  { week: "Week 1", bookings: 142 },
  { week: "Week 2", bookings: 168 },
  { week: "Week 3", bookings: 155 },
  { week: "Week 4", bookings: 177 },
];

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("30d");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={15} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>
              Analytics
            </span>
          </div>
          <h1 className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Executive Dashboard
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Marketplace performance and business intelligence
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          {["7d", "30d", "90d", "1y"].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className="px-3 py-1.5 rounded-lg text-[12px] transition-all"
              style={{
                background: dateRange === range ? "var(--accent-navy)" : "var(--bg-card)",
                color: dateRange === range ? "white" : "var(--text-secondary)",
                border: `1px solid ${dateRange === range ? "transparent" : "var(--border-light)"}`,
                fontWeight: dateRange === range ? 600 : 400,
              }}
            >
              {range === "7d" && "Last 7 Days"}
              {range === "30d" && "Last 30 Days"}
              {range === "90d" && "Last 90 Days"}
              {range === "1y" && "Last Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: "LKR 2.34M",
            change: "+24.3%",
            up: true,
            icon: DollarSign,
            color: "#22c55e",
            subtitle: "vs last month",
          },
          {
            label: "Total Bookings",
            value: "642",
            change: "+10.5%",
            up: true,
            icon: ShoppingCart,
            color: "#3b82f6",
            subtitle: "this month",
          },
          {
            label: "GMV",
            value: "LKR 8.12M",
            change: "+18.2%",
            up: true,
            icon: TrendingUp,
            color: "#8b5cf6",
            subtitle: "gross merchandise",
          },
          {
            label: "Active Vendors",
            value: "128",
            change: "+8",
            up: true,
            icon: Building2,
            color: "#f59e0b",
            subtitle: "approved vendors",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${kpi.color}15` }}
              >
                <kpi.icon size={20} style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
              {kpi.label}
            </p>
            <p className="text-[28px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700, lineHeight: 1 }}>
              {kpi.value}
            </p>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-0.5 text-[12px] px-1.5 py-0.5 rounded"
                style={{
                  background: kpi.up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color: kpi.up ? "var(--success)" : "var(--error)",
                  fontWeight: 600,
                }}
              >
                {kpi.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                {kpi.change}
              </div>
              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                {kpi.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Avg Booking Value", value: "LKR 3,645", icon: Calendar, color: "#ec4899" },
          { label: "Monthly Growth", value: "+24.3%", icon: TrendingUp, color: "#22c55e" },
          { label: "Cancellation Rate", value: "4.2%", icon: TrendingDown, color: "#f87171" },
          { label: "Customer Retention", value: "68%", icon: Users, color: "#0891b2" },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${metric.color}15` }}
              >
                <metric.icon size={14} style={{ color: metric.color }} />
              </div>
            </div>
            <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
              {metric.label}
            </p>
            <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700, lineHeight: 1 }}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Revenue Trend Chart */}
        <div
          className="col-span-8 rounded-xl overflow-hidden"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} style={{ color: "var(--accent-navy)" }} />
              <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Revenue & Booking Trends
              </span>
            </div>
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Last 6 months</span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={REVENUE_TREND}>
                <XAxis dataKey="month" stroke="var(--text-tertiary)" style={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-tertiary)" style={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 4 }} name="Revenue (LKR)" />
                <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} name="Bookings" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Category */}
        <div
          className="col-span-4 rounded-xl overflow-hidden"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="flex items-center gap-2">
              <DollarSign size={14} style={{ color: "var(--accent-navy)" }} />
              <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Revenue by Category
              </span>
            </div>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={REVENUE_BY_CATEGORY}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {REVENUE_BY_CATEGORY.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {REVENUE_BY_CATEGORY.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ background: cat.color }} />
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      LKR {(cat.value / 1000).toFixed(0)}K
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{cat.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Destinations */}
        <div
          className="col-span-6 rounded-xl overflow-hidden"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <Globe size={14} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Top Destinations
            </span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={TOP_DESTINATIONS}>
                <XAxis dataKey="name" stroke="var(--text-tertiary)" style={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-tertiary)" style={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Booking Trend */}
        <div
          className="col-span-6 rounded-xl overflow-hidden"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <Calendar size={14} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Weekly Booking Volume
            </span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={BOOKING_TRENDS}>
                <XAxis dataKey="week" stroke="var(--text-tertiary)" style={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-tertiary)" style={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="bookings" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

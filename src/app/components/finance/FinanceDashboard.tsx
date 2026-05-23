import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CreditCard,
  Wallet,
  RefreshCw,
  Building2,
  Compass,
  Globe,
  Anchor,
  Car,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Sample revenue trend data
const revenueTrendData = [
  { month: "Jan", revenue: 145000, bookings: 120 },
  { month: "Feb", revenue: 168000, bookings: 145 },
  { month: "Mar", revenue: 192000, bookings: 165 },
  { month: "Apr", revenue: 185000, bookings: 158 },
  { month: "May", revenue: 215000, bookings: 185 },
  { month: "Jun", revenue: 238000, bookings: 205 },
];

// Category revenue data
const categoryRevenueData = [
  { name: "Stay", value: 485000, percentage: 42, color: "#3b82f6" },
  { name: "Tour", value: 315000, percentage: 27, color: "#0891b2" },
  { name: "Safari", value: 185000, percentage: 16, color: "#059669" },
  { name: "Experience", value: 125000, percentage: 11, color: "#d97706" },
  { name: "Transfer", value: 48000, percentage: 4, color: "#64748b" },
];

// Vendor performance data
const vendorPerformanceData = [
  { vendor: "Ceylon Luxury", revenue: 125000, commission: 15000, payouts: 110000 },
  { vendor: "Heritage Tours", revenue: 98000, commission: 14700, payouts: 83300 },
  { vendor: "Wild Adventures", revenue: 85000, commission: 8500, payouts: 76500 },
  { vendor: "Ocean View", revenue: 72000, commission: 8640, payouts: 63360 },
  { vendor: "Premium Trans", revenue: 45000, commission: 4500, payouts: 40500 },
];

export function FinanceDashboard() {
  const kpiCards = [
    {
      label: "Total Revenue",
      value: "$1,158,000",
      change: "+18.2%",
      trend: "up",
      icon: DollarSign,
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.1)",
    },
    {
      label: "Pending Payouts",
      value: "$284,500",
      change: "142 vendors",
      trend: "neutral",
      icon: Wallet,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.1)",
    },
    {
      label: "Platform Commission",
      value: "$138,960",
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp,
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      label: "Refund Requests",
      value: "$12,450",
      change: "8 pending",
      trend: "neutral",
      icon: RefreshCw,
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.1)",
    },
    {
      label: "Unpaid Bookings",
      value: "$45,200",
      change: "18 bookings",
      trend: "down",
      icon: AlertCircle,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.1)",
    },
    {
      label: "Monthly Growth",
      value: "+24.3%",
      change: "vs last month",
      trend: "up",
      icon: TrendingUp,
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.1)",
    },
  ];

  const categoryCards = [
    { name: "Stay", revenue: "$485,000", bookings: 285, icon: Building2, color: "#3b82f6", bg: "rgba(37, 99, 235, 0.12)" },
    { name: "Tour", revenue: "$315,000", bookings: 412, icon: Compass, color: "#0891b2", bg: "rgba(8, 145, 178, 0.12)" },
    { name: "Safari", revenue: "$185,000", bookings: 158, icon: Globe, color: "#059669", bg: "rgba(5, 150, 105, 0.12)" },
    { name: "Experience", revenue: "$125,000", bookings: 245, icon: Anchor, color: "#d97706", bg: "rgba(217, 119, 6, 0.12)" },
    { name: "Transfer", revenue: "$48,000", bookings: 186, icon: Car, color: "#64748b", bg: "rgba(100, 116, 139, 0.12)" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Finance Dashboard
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Overview of revenue, payouts, and financial operations
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 text-[13px] rounded-lg flex items-center gap-2 transition-all"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
            }}
          >
            <Calendar size={14} />
            Last 6 Months
          </button>
          <button
            className="px-4 py-2 text-[13px] rounded-lg flex items-center gap-2 transition-all"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
            }}
          >
            <Download size={14} />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-6 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
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
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: kpi.bg }}
                >
                  <Icon size={18} style={{ color: kpi.color }} />
                </div>
                {kpi.trend === "up" && <ArrowUpRight size={14} style={{ color: "var(--success)" }} />}
                {kpi.trend === "down" && <ArrowDownRight size={14} style={{ color: "var(--error)" }} />}
              </div>
              <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                {kpi.label}
              </p>
              <p className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                {kpi.value}
              </p>
              <p className="text-[11px]" style={{ color: kpi.trend === "up" ? "var(--success)" : "var(--text-tertiary)" }}>
                {kpi.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <div
          className="rounded-xl p-5"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Revenue Trends
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={11} />
              <YAxis stroke="var(--text-tertiary)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Revenue Split */}
        <div
          className="rounded-xl p-5"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Revenue by Category
          </h3>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryRevenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-panel)",
                      border: "1px solid var(--border-light)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {categoryRevenueData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                  <div>
                    <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {cat.name}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {cat.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Revenue Cards */}
      <div>
        <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Category Performance
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {categoryCards.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.name}
                className="rounded-xl p-4"
                style={{
                  background: category.bg,
                  border: `1px solid ${category.color}33`,
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <Icon size={16} className="mb-3" style={{ color: category.color }} />
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  {category.name}
                </p>
                <p className="text-[18px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                  {category.revenue}
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  {category.bookings} bookings
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vendor Performance */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Top Vendor Performance
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={vendorPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="vendor" stroke="var(--text-tertiary)" fontSize={11} />
            <YAxis stroke="var(--text-tertiary)" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[8, 8, 0, 0]} />
            <Bar dataKey="commission" fill="#f59e0b" name="Commission" radius={[8, 8, 0, 0]} />
            <Bar dataKey="payouts" fill="#22c55e" name="Payouts" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Financial Alerts */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Financial Risk & Alerts
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div
            className="rounded-lg p-4"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
              Failed Payments
            </p>
            <p className="text-[20px] mb-1" style={{ color: "var(--error)", fontWeight: 700 }}>
              12
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              $18,450 pending retry
            </p>
          </div>
          <div
            className="rounded-lg p-4"
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
              Suspicious Refunds
            </p>
            <p className="text-[20px] mb-1" style={{ color: "var(--warning)", fontWeight: 700 }}>
              3
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Requires review
            </p>
          </div>
          <div
            className="rounded-lg p-4"
            style={{
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
              Payout Holds
            </p>
            <p className="text-[20px] mb-1" style={{ color: "#3b82f6", fontWeight: 700 }}>
              5
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              $32,800 on hold
            </p>
          </div>
          <div
            className="rounded-lg p-4"
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
              Overdue Balances
            </p>
            <p className="text-[20px] mb-1" style={{ color: "var(--warning)", fontWeight: 700 }}>
              8
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              $24,150 overdue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Sample data
const bookingTrendData = [
  { month: "Jan", bookings: 145, revenue: 12400 },
  { month: "Feb", bookings: 168, revenue: 14200 },
  { month: "Mar", bookings: 192, revenue: 16800 },
  { month: "Apr", bookings: 185, revenue: 15600 },
  { month: "May", bookings: 215, revenue: 18400 },
  { month: "Jun", bookings: 238, revenue: 21200 },
];

const routePopularityData = [
  { route: "CMB Airport → Colombo", bookings: 245, revenue: 18400 },
  { route: "Colombo → Kandy", bookings: 198, revenue: 15840 },
  { route: "CMB Airport → Galle", bookings: 165, revenue: 14850 },
  { route: "Kandy → Sigiriya", bookings: 142, revenue: 12780 },
  { route: "Galle → Mirissa", bookings: 128, revenue: 8960 },
];

const vehicleRevenueData = [
  { category: "Standard Car", revenue: 32400, bookings: 485 },
  { category: "SUV", revenue: 28600, bookings: 325 },
  { category: "Van", revenue: 22800, bookings: 215 },
  { category: "Luxury Van", revenue: 18200, bookings: 125 },
];

export function TransportDashboard() {
  const kpiCards = [
    {
      label: "Pending Requests",
      value: "24",
      change: "8 urgent",
      trend: "urgent",
      icon: Clock,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.1)",
    },
    {
      label: "Confirmed Today",
      value: "42",
      change: "+8 vs yesterday",
      trend: "up",
      icon: CheckCircle,
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.1)",
    },
    {
      label: "Active Categories",
      value: "4",
      change: "All operational",
      trend: "neutral",
      icon: Car,
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      label: "Airport Pickups",
      value: "18",
      change: "Next 24 hours",
      trend: "neutral",
      icon: Plane,
      color: "#0891b2",
      bg: "rgba(8, 145, 178, 0.1)",
    },
    {
      label: "Transfer Revenue",
      value: "$21,240",
      change: "+18.5%",
      trend: "up",
      icon: DollarSign,
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.1)",
    },
    {
      label: "Cancelled Today",
      value: "3",
      change: "2.1% rate",
      trend: "down",
      icon: XCircle,
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.1)",
    },
  ];

  // Live transfer requests
  const liveRequests = [
    {
      id: "TR-8945",
      customer: "Sarah Johnson",
      route: "CMB Airport → Colombo Hotels",
      time: "Today 14:30",
      status: "urgent",
      passengers: 2,
    },
    {
      id: "TR-8944",
      customer: "Michael Chen",
      route: "Colombo → Kandy",
      time: "Today 16:00",
      status: "pending",
      passengers: 4,
    },
    {
      id: "TR-8943",
      customer: "Emma Wilson",
      route: "Galle → Mirissa Beach",
      time: "Tomorrow 09:00",
      status: "pending",
      passengers: 3,
    },
  ];

  // Upcoming pickups
  const upcomingPickups = [
    {
      id: "TR-8940",
      customer: "David Brown",
      pickup: "Shangri-La Colombo",
      destination: "CMB Airport",
      time: "2 hours",
      vehicle: "SUV",
    },
    {
      id: "TR-8939",
      customer: "Lisa Martinez",
      pickup: "Galle Fort Hotel",
      destination: "Mirissa",
      time: "3 hours",
      vehicle: "Standard Car",
    },
    {
      id: "TR-8938",
      customer: "James Taylor",
      pickup: "CMB Airport",
      destination: "Kandy Hotels",
      time: "4 hours",
      vehicle: "Van",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Transport Operations Center
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Real-time transfer management and vehicle operations
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
            Today
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
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
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
              </div>
              <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                {kpi.label}
              </p>
              <p className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                {kpi.value}
              </p>
              <p
                className="text-[11px]"
                style={{
                  color: kpi.trend === "up" ? "var(--success)" : kpi.trend === "urgent" ? "var(--warning)" : "var(--text-tertiary)",
                }}
              >
                {kpi.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Operational Widgets Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Live Transfer Requests */}
        <div
          className="rounded-xl p-5"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Live Transfer Requests
            </h3>
            <span
              className="text-[11px] px-2.5 py-1 rounded"
              style={{
                background: "var(--active-overlay)",
                color: "var(--accent-navy-light)",
              }}
            >
              {liveRequests.length} pending
            </span>
          </div>
          <div className="space-y-3">
            {liveRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg p-3 cursor-pointer transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--input-background)";
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {request.id}
                    </p>
                    {request.status === "urgent" && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded"
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                          color: "var(--error)",
                          fontWeight: 600,
                        }}
                      >
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {request.time}
                  </p>
                </div>
                <p className="text-[13px] mb-1" style={{ color: "var(--text-primary)" }}>
                  {request.customer}
                </p>
                <div className="flex items-center gap-2">
                  <MapPin size={11} style={{ color: "var(--text-tertiary)" }} />
                  <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {request.route}
                  </p>
                </div>
                <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                  {request.passengers} passengers
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Pickups */}
        <div
          className="rounded-xl p-5"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Upcoming Pickups
            </h3>
            <span
              className="text-[11px] px-2.5 py-1 rounded"
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                color: "#3b82f6",
              }}
            >
              Next 6 hours
            </span>
          </div>
          <div className="space-y-3">
            {upcomingPickups.map((pickup) => (
              <div
                key={pickup.id}
                className="rounded-lg p-3"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {pickup.id} • {pickup.customer}
                  </p>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded"
                    style={{
                      background: "rgba(34, 197, 94, 0.1)",
                      color: "var(--success)",
                      fontWeight: 600,
                    }}
                  >
                    {pickup.time}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "var(--success)" }} />
                    <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      {pickup.pickup}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "var(--error)" }} />
                    <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      {pickup.destination}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] mt-2" style={{ color: "var(--text-tertiary)" }}>
                  Vehicle: {pickup.vehicle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Booking Trend */}
        <div
          className="rounded-xl p-5"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Transfer Bookings Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={bookingTrendData}>
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
              <Line key="bookings-line" type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Route Popularity */}
        <div
          className="rounded-xl p-5"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Busiest Routes
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={routePopularityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="var(--text-tertiary)" fontSize={11} />
              <YAxis dataKey="route" type="category" stroke="var(--text-tertiary)" fontSize={10} width={150} />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar key="route-bookings-bar" dataKey="bookings" fill="#0891b2" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vehicle Revenue */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Revenue by Vehicle Category
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={vehicleRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="category" stroke="var(--text-tertiary)" fontSize={11} />
            <YAxis stroke="var(--text-tertiary)" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar key="vehicle-revenue-bar" dataKey="revenue" fill="#22c55e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transport Alerts */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Transport Alerts & Issues
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
              Unconfirmed Pickups
            </p>
            <p className="text-[20px] mb-1" style={{ color: "var(--error)", fontWeight: 700 }}>
              8
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Within 24 hours
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
              Failed Payments
            </p>
            <p className="text-[20px] mb-1" style={{ color: "var(--warning)", fontWeight: 700 }}>
              5
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Requires attention
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
              Same-Day Requests
            </p>
            <p className="text-[20px] mb-1" style={{ color: "#3b82f6", fontWeight: 700 }}>
              12
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Urgent processing
            </p>
          </div>
          <div
            className="rounded-lg p-4"
            style={{
              background: "rgba(100, 116, 139, 0.08)",
              border: "1px solid rgba(100, 116, 139, 0.2)",
            }}
          >
            <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
              Pricing Conflicts
            </p>
            <p className="text-[20px] mb-1" style={{ color: "#64748b", fontWeight: 700 }}>
              2
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Needs review
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

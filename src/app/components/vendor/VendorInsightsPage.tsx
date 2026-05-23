import { TrendingUp, MapPin, Users, Calendar, BarChart3, Target, Globe } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function VendorInsightsPage() {
  const topDestinations = [
    { name: "Yala National Park", bookings: 62, percentage: 42 },
    { name: "Minneriya", bookings: 43, percentage: 29 },
    { name: "Galle Fort", bookings: 33, percentage: 22 },
    { name: "Sigiriya", bookings: 10, percentage: 7 },
  ];

  const customerDemographics = [
    { region: "North America", count: 58, color: "#3b82f6" },
    { region: "Europe", count: 42, color: "#10b981" },
    { region: "Asia", count: 28, color: "#eab308" },
    { region: "Other", count: 20, color: "#8b5cf6" },
  ];

  const bookingSourceData = [
    { source: "Organic Search", bookings: 52 },
    { source: "Direct", bookings: 38 },
    { source: "Social Media", bookings: 24 },
    { source: "Referrals", bookings: 18 },
    { source: "Email", bookings: 12 },
  ];

  const repeatCustomers = [
    { month: "Jan", new: 28, repeat: 12 },
    { month: "Feb", new: 32, repeat: 16 },
    { month: "Mar", new: 38, repeat: 18 },
    { month: "Apr", new: 42, repeat: 22 },
    { month: "May", new: 47, repeat: 26 },
  ];

  const peakTimes = [
    { time: "Morning (6-9)", bookings: 45 },
    { time: "Mid-Day (9-12)", bookings: 68 },
    { time: "Afternoon (12-15)", bookings: 52 },
    { time: "Evening (15-18)", bookings: 23 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Business Insights
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Understand your customers, performance patterns, and growth opportunities
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Repeat Customer Rate", value: "35.6%", trend: "+4.2%", icon: Users, color: "#10b981" },
          { label: "Average Booking Value", value: "$168", trend: "+$12", icon: TrendingUp, color: "#3b82f6" },
          { label: "Peak Season", value: "May-Aug", trend: "High demand", icon: Calendar, color: "#eab308" },
          { label: "Top Destination", value: "Yala", trend: "42% of bookings", icon: MapPin, color: "#22c55e" },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${metric.color}15` }}
              >
                <metric.icon size={16} style={{ color: metric.color }} />
              </div>
            </div>
            <p className="text-[22px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {metric.value}
            </p>
            <p className="text-[12px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
              {metric.label}
            </p>
            <p className="text-[11px]" style={{ color: "var(--success)" }}>
              {metric.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Top Destinations & Customer Demographics */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Destinations */}
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
              Top Destinations
            </h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Most popular listing locations
            </p>
          </div>
          <div className="p-5 space-y-3">
            {topDestinations.map((dest, i) => (
              <div key={dest.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {i + 1}.
                    </span>
                    <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {dest.name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {dest.bookings}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      ({dest.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--input-background)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${dest.percentage}%`,
                      background: "linear-gradient(90deg, var(--accent-navy), var(--accent-navy-light))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Demographics */}
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
              Customer Demographics
            </h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Customers by region
            </p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={customerDemographics}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {customerDemographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {customerDemographics.map((demo) => (
                <div key={demo.region} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ background: demo.color }} />
                  <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {demo.region}: {demo.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Source & Peak Times */}
      <div className="grid grid-cols-2 gap-6">
        {/* Booking Source */}
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
              Booking Sources
            </h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Where your customers find you
            </p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bookingSourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="source" tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Booking Times */}
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
              Peak Booking Times
            </h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Most popular times for bookings
            </p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={peakTimes} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis type="number" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
                <YAxis dataKey="time" type="category" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} width={100} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="bookings" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* New vs Repeat Customers */}
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
            New vs Repeat Customers
          </h2>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Customer retention and growth trends
          </p>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={repeatCustomers}>
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
              <Bar dataKey="new" fill="#3b82f6" radius={[8, 8, 0, 0]} name="New Customers" />
              <Bar dataKey="repeat" fill="#10b981" radius={[8, 8, 0, 0]} name="Repeat Customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

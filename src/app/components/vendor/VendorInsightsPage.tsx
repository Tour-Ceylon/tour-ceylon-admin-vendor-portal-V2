import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  MapPin, 
  Users, 
  Calendar, 
  BarChart3, 
  Target, 
  Globe,
  Download,
  X,
  Check,
  Clock,
  DollarSign,
  MessageSquare,
  Star,
  ArrowUpRight,
  TrendingDown,
  AlertCircle,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";

type TimeRange = "30d" | "90d" | "6m" | "1y";

interface RecommendedAction {
  id: string;
  type: "marketing" | "pricing" | "customer" | "seasonal" | "operational";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  icon: any;
}

export function VendorInsightsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("90d");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Dynamic data based on time range
  const generateInsightsData = (range: TimeRange) => {
    const baseData = {
      "30d": {
        repeatRate: 32.4,
        avgBookingValue: 156,
        peakSeason: "May",
        topDestination: "Yala",
        topDestinationPercentage: 38,
        customerDemographics: [
          { region: "North America", count: 45, color: "#3b82f6" },
          { region: "Europe", count: 38, color: "#10b981" },
          { region: "Asia", count: 22, color: "#eab308" },
          { region: "Other", count: 15, color: "#8b5cf6" },
        ],
        bookingSources: [
          { source: "Organic Search", bookings: 42 },
          { source: "Direct", bookings: 28 },
          { source: "Social Media", bookings: 18 },
          { source: "Referrals", bookings: 12 },
        ],
        peakTimes: [
          { time: "Morning (6-9)", bookings: 35 },
          { time: "Mid-Day (9-12)", bookings: 52 },
          { time: "Afternoon (12-15)", bookings: 38 },
          { time: "Evening (15-18)", bookings: 18 },
        ],
        customerRetention: [
          { month: "Feb", new: 22, repeat: 8 },
          { month: "Mar", new: 28, repeat: 12 },
          { month: "Apr", new: 32, repeat: 15 },
          { month: "May", new: 35, repeat: 18 },
        ]
      },
      "90d": {
        repeatRate: 35.6,
        avgBookingValue: 168,
        peakSeason: "Apr-May",
        topDestination: "Yala",
        topDestinationPercentage: 42,
        customerDemographics: [
          { region: "North America", count: 58, color: "#3b82f6" },
          { region: "Europe", count: 42, color: "#10b981" },
          { region: "Asia", count: 28, color: "#eab308" },
          { region: "Other", count: 20, color: "#8b5cf6" },
        ],
        bookingSources: [
          { source: "Organic Search", bookings: 52 },
          { source: "Direct", bookings: 38 },
          { source: "Social Media", bookings: 24 },
          { source: "Referrals", bookings: 18 },
          { source: "Email", bookings: 12 },
        ],
        peakTimes: [
          { time: "Morning (6-9)", bookings: 45 },
          { time: "Mid-Day (9-12)", bookings: 68 },
          { time: "Afternoon (12-15)", bookings: 52 },
          { time: "Evening (15-18)", bookings: 23 },
        ],
        customerRetention: [
          { month: "Feb", new: 28, repeat: 12 },
          { month: "Mar", new: 32, repeat: 16 },
          { month: "Apr", new: 38, repeat: 18 },
          { month: "May", new: 42, repeat: 22 },
        ]
      },
      "6m": {
        repeatRate: 38.2,
        avgBookingValue: 175,
        peakSeason: "Dec-May",
        topDestination: "Yala",
        topDestinationPercentage: 45,
        customerDemographics: [
          { region: "North America", count: 72, color: "#3b82f6" },
          { region: "Europe", count: 58, color: "#10b981" },
          { region: "Asia", count: 35, color: "#eab308" },
          { region: "Other", count: 28, color: "#8b5cf6" },
        ],
        bookingSources: [
          { source: "Organic Search", bookings: 68 },
          { source: "Direct", bookings: 45 },
          { source: "Social Media", bookings: 32 },
          { source: "Referrals", bookings: 24 },
          { source: "Email", bookings: 18 },
        ],
        peakTimes: [
          { time: "Morning (6-9)", bookings: 58 },
          { time: "Mid-Day (9-12)", bookings: 85 },
          { time: "Afternoon (12-15)", bookings: 68 },
          { time: "Evening (15-18)", bookings: 32 },
        ],
        customerRetention: [
          { month: "Dec", new: 35, repeat: 18 },
          { month: "Jan", new: 42, repeat: 22 },
          { month: "Feb", new: 38, repeat: 25 },
          { month: "Mar", new: 45, repeat: 28 },
          { month: "Apr", new: 52, repeat: 32 },
          { month: "May", new: 48, repeat: 35 },
        ]
      },
      "1y": {
        repeatRate: 41.8,
        avgBookingValue: 185,
        peakSeason: "Dec-Mar",
        topDestination: "Yala",
        topDestinationPercentage: 48,
        customerDemographics: [
          { region: "North America", count: 125, color: "#3b82f6" },
          { region: "Europe", count: 98, color: "#10b981" },
          { region: "Asia", count: 65, color: "#eab308" },
          { region: "Other", count: 42, color: "#8b5cf6" },
        ],
        bookingSources: [
          { source: "Organic Search", bookings: 145 },
          { source: "Direct", bookings: 98 },
          { source: "Social Media", bookings: 68 },
          { source: "Referrals", bookings: 45 },
          { source: "Email", bookings: 32 },
        ],
        peakTimes: [
          { time: "Morning (6-9)", bookings: 125 },
          { time: "Mid-Day (9-12)", bookings: 185 },
          { time: "Afternoon (12-15)", bookings: 142 },
          { time: "Evening (15-18)", bookings: 68 },
        ],
        customerRetention: [
          { month: "Q1", new: 145, repeat: 68 },
          { month: "Q2", new: 168, repeat: 85 },
          { month: "Q3", new: 152, repeat: 92 },
          { month: "Q4", new: 178, repeat: 105 },
        ]
      }
    };
    return baseData[range];
  };

  const currentData = generateInsightsData(timeRange);

  // Top destinations with more details
  const topDestinations = [
    { name: "Yala National Park", bookings: Math.round(currentData.topDestinationPercentage * 3), percentage: currentData.topDestinationPercentage, trend: "+12%" },
    { name: "Minneriya", bookings: Math.round(currentData.topDestinationPercentage * 2.1), percentage: Math.round(currentData.topDestinationPercentage * 0.7), trend: "+8%" },
    { name: "Galle Fort", bookings: Math.round(currentData.topDestinationPercentage * 1.8), percentage: Math.round(currentData.topDestinationPercentage * 0.5), trend: "+15%" },
    { name: "Sigiriya", bookings: Math.round(currentData.topDestinationPercentage * 0.8), percentage: Math.round(currentData.topDestinationPercentage * 0.2), trend: "+5%" },
  ];

  // Strategic recommended actions
  const recommendedActions: RecommendedAction[] = [
    {
      id: "1",
      type: "seasonal",
      title: "Optimize Peak Season Pricing",
      description: `${currentData.peakSeason} shows 40% higher demand. Consider increasing prices by 15-20% during peak months to maximize revenue.`,
      impact: "high",
      effort: "low",
      icon: DollarSign,
    },
    {
      id: "2",
      type: "marketing",
      title: "Expand Social Media Marketing",
      description: "Social media drives 24% of bookings but has room to grow. Invest in Instagram and Facebook ads targeting your top customer regions.",
      impact: "high",
      effort: "medium",
      icon: Target,
    },
    {
      id: "3",
      type: "customer",
      title: "Improve Customer Retention",
      description: `Your repeat rate is ${currentData.repeatRate}%. Implement a loyalty program or follow-up email campaigns to increase repeat bookings.`,
      impact: "medium",
      effort: "medium",
      icon: Users,
    },
    {
      id: "4",
      type: "operational",
      title: "Focus on Mid-Day Bookings",
      description: "Mid-day (9-12) is your peak booking time. Ensure availability and consider premium pricing for these popular slots.",
      impact: "medium",
      effort: "low",
      icon: Clock,
    },
    {
      id: "5",
      type: "marketing",
      title: "Target North American Market",
      description: "North America represents your largest customer segment. Create targeted campaigns highlighting unique Sri Lankan experiences.",
      impact: "high",
      effort: "medium",
      icon: Globe,
    },
    {
      id: "6",
      type: "operational",
      title: "Diversify Beyond Yala",
      description: `${currentData.topDestinationPercentage}% of bookings are Yala-focused. Promote other destinations to reduce dependency and capture more market share.`,
      impact: "medium",
      effort: "high",
      icon: MapPin,
    },
  ];

  // Helper functions
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setIsLoading(true);
    setTimeRange(range);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleExport = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast("Business insights report exported successfully", "success");
    }, 1500);
  };

  const getImpactColor = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return { bg: "rgba(34,197,94,0.1)", color: "#22c55e", border: "rgba(34,197,94,0.2)" };
      case "medium":
        return { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.2)" };
      case "low":
        return { bg: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "rgba(59,130,246,0.2)" };
    }
  };

  const getEffortColor = (effort: "low" | "medium" | "high") => {
    switch (effort) {
      case "low":
        return "#22c55e";
      case "medium":
        return "#f59e0b";
      case "high":
        return "#ef4444";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed top-4 right-4 px-4 py-3 rounded-lg text-[13px] z-50 flex items-center gap-2"
          style={{
            background: toast.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: toast.type === "success" ? "#22c55e" : "#ef4444",
          }}
        >
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Business Insights
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Strategic insights about your customers, market trends, and growth opportunities
          </p>
        </div>
        <div className="flex gap-2">
          {(["30d", "90d", "6m", "1y"] as const).map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-[12px] transition-all disabled:opacity-50"
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
              {range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : range === "6m" ? "6 Months" : "1 Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { 
            label: "Repeat Customer Rate", 
            value: `${currentData.repeatRate}%`, 
            trend: "+4.2%", 
            insight: "Above industry avg",
            icon: Users, 
            color: "#10b981" 
          },
          { 
            label: "Average Booking Value", 
            value: `$${currentData.avgBookingValue}`, 
            trend: "+$12", 
            insight: "Growing steadily",
            icon: TrendingUp, 
            color: "#3b82f6" 
          },
          { 
            label: "Peak Season", 
            value: currentData.peakSeason, 
            trend: "High demand", 
            insight: "Optimize pricing",
            icon: Calendar, 
            color: "#eab308" 
          },
          { 
            label: "Top Destination", 
            value: currentData.topDestination, 
            trend: `${currentData.topDestinationPercentage}% of bookings`, 
            insight: "Consider diversifying",
            icon: MapPin, 
            color: "#22c55e" 
          },
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
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${metric.color}15` }}
              >
                <metric.icon size={18} style={{ color: metric.color }} />
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
                {metric.trend}
              </div>
            </div>
            <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {metric.value}
            </p>
            <p className="text-[12px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
              {metric.label}
            </p>
            <p className="text-[11px]" style={{ color: "var(--success)" }}>
              {metric.insight}
            </p>
          </div>
        ))}
      </div>

      {/* Strategic Recommendations */}
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
              Strategic Recommendations
            </h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Data-driven actions to grow your business
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-2 disabled:opacity-50"
            style={{
              background: "var(--input-background)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
              fontWeight: 500,
            }}
          >
            <Download size={12} />
            {isLoading ? "Exporting..." : "Export Report"}
          </button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedActions.map((action) => (
              <div
                key={action.id}
                className="rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  background: getImpactColor(action.impact).bg,
                  border: `1px solid ${getImpactColor(action.impact).border}`,
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ 
                      background: getImpactColor(action.impact).color + "20",
                      color: getImpactColor(action.impact).color 
                    }}
                  >
                    <action.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {action.title}
                      </h3>
                      <ChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                          Impact:
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider"
                          style={{
                            background: getImpactColor(action.impact).color,
                            color: "white",
                            fontWeight: 600,
                          }}
                        >
                          {action.impact}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                          Effort:
                        </span>
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: getEffortColor(action.effort) }}
                        />
                        <span className="text-[10px] capitalize" style={{ color: "var(--text-secondary)" }}>
                          {action.effort}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  {action.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Demographics & Booking Sources */}
      <div className="grid grid-cols-2 gap-6">
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
              Where your customers come from
            </p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={currentData.customerDemographics}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {currentData.customerDemographics.map((entry, index) => (
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
              {currentData.customerDemographics.map((demo) => (
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

        {/* Booking Sources */}
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
              How customers find you
            </p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={currentData.bookingSources}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis 
                  dataKey="source" 
                  tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                />
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
      </div>

      {/* Top Destinations & Peak Times */}
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
          <div className="p-5 space-y-4">
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
                  <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {dest.bookings}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        ({dest.percentage}%)
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                      style={{
                        background: "rgba(34,197,94,0.1)",
                        color: "#4ade80",
                        fontWeight: 600,
                      }}
                    >
                      <ArrowUpRight size={9} />
                      {dest.trend}
                    </div>
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
              When customers book most often
            </p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={currentData.peakTimes} layout="horizontal">
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

      {/* Customer Retention Trends */}
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
            Customer Acquisition & Retention
          </h2>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            New vs repeat customer trends over time
          </p>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentData.customerRetention}>
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
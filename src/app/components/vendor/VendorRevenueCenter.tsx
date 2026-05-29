import { useState, useMemo } from "react";
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
  Search,
  Eye,
  AlertCircle,
  TrendingDown,
  X,
  Check,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { vendorMockData } from "../../services/vendorMockData";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type TimeRange = "7d" | "30d" | "90d" | "1y";
type PayoutStatus = "pending" | "processing" | "completed" | "failed" | "on_hold";
type SortField = "name" | "bookings" | "grossRevenue" | "netRevenue";
type SortDirection = "asc" | "desc";

interface RevenueData {
  date: string;
  grossRevenue: number;
  commission: number;
  netRevenue: number;
}

interface PayoutHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: PayoutStatus;
  bookings: number;
  method: string;
  transactionId?: string;
}

interface ListingRevenueItem {
  id: string;
  name: string;
  category: string;
  bookings: number;
  grossRevenue: number;
  commission: number;
  netRevenue: number;
  trend: number;
}

export function VendorRevenueCenter() {
  const { effectiveUser } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("grossRevenue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showPayoutDetails, setShowPayoutDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Get vendor-specific data
  const vendorId = effectiveUser?.id;

  // Mock data that changes based on time range
  const generateRevenueData = (range: TimeRange) => {
    const baseData = {
      "7d": {
        totalEarnings: 3420,
        pendingPayout: 1250,
        commission: 513,
        highestEarning: { amount: 890, name: "Yala Safari" },
        chartData: [
          { period: "Mon", grossRevenue: 420, commission: 63, netRevenue: 357 },
          { period: "Tue", grossRevenue: 380, commission: 57, netRevenue: 323 },
          { period: "Wed", grossRevenue: 520, commission: 78, netRevenue: 442 },
          { period: "Thu", grossRevenue: 610, commission: 92, netRevenue: 518 },
          { period: "Fri", grossRevenue: 720, commission: 108, netRevenue: 612 },
          { period: "Sat", grossRevenue: 890, commission: 134, netRevenue: 756 },
          { period: "Sun", grossRevenue: 680, commission: 102, netRevenue: 578 },
        ]
      },
      "30d": {
        totalEarnings: 24850,
        pendingPayout: 8450,
        commission: 3728,
        highestEarning: { amount: 5780, name: "Yala Safari" },
        chartData: [
          { period: "Week 1", grossRevenue: 5200, commission: 780, netRevenue: 4420 },
          { period: "Week 2", grossRevenue: 6100, commission: 915, netRevenue: 5185 },
          { period: "Week 3", grossRevenue: 6800, commission: 1020, netRevenue: 5780 },
          { period: "Week 4", grossRevenue: 6750, commission: 1013, netRevenue: 5737 },
        ]
      },
      "90d": {
        totalEarnings: 68200,
        pendingPayout: 8450,
        commission: 10230,
        highestEarning: { amount: 15600, name: "Yala Safari" },
        chartData: [
          { period: "Feb", grossRevenue: 18200, commission: 2730, netRevenue: 15470 },
          { period: "Mar", grossRevenue: 21500, commission: 3225, netRevenue: 18275 },
          { period: "Apr", grossRevenue: 24850, commission: 3728, netRevenue: 21122 },
          { period: "May", grossRevenue: 3650, commission: 547, netRevenue: 3103 },
        ]
      },
      "1y": {
        totalEarnings: 285400,
        pendingPayout: 8450,
        commission: 42810,
        highestEarning: { amount: 28500, name: "Yala Safari" },
        chartData: [
          { period: "Q2 2025", grossRevenue: 45200, commission: 6780, netRevenue: 38420 },
          { period: "Q3 2025", grossRevenue: 58600, commission: 8790, netRevenue: 49810 },
          { period: "Q4 2025", grossRevenue: 72800, commission: 10920, netRevenue: 61880 },
          { period: "Q1 2026", grossRevenue: 108800, commission: 16320, netRevenue: 92480 },
        ]
      }
    };
    return baseData[range];
  };

  const currentData = generateRevenueData(timeRange);

  // Dynamic KPI cards based on time range
  const revenueStats = useMemo(() => [
    {
      label: "Total Earnings",
      value: `$${currentData.totalEarnings.toLocaleString()}`,
      change: "+29.1%",
      subtext: `Last ${timeRange === "1y" ? "year" : timeRange}`,
      icon: DollarSign,
      color: "#10b981",
    },
    {
      label: "Pending Payout",
      value: `$${currentData.pendingPayout.toLocaleString()}`,
      change: "15 bookings",
      subtext: "Next payout: May 25",
      icon: Wallet,
      color: "#3b82f6",
    },
    {
      label: "Commission Deducted",
      value: `$${currentData.commission.toLocaleString()}`,
      change: "15% avg",
      subtext: "Platform fees",
      icon: CreditCard,
      color: "#f59e0b",
    },
    {
      label: "Highest Earning",
      value: `$${currentData.highestEarning.amount.toLocaleString()}`,
      change: currentData.highestEarning.name,
      subtext: "Best performer",
      icon: TrendingUp,
      color: "#22c55e",
    },
  ], [timeRange, currentData]);

  // Dynamic chart data
  const revenueChartData = currentData.chartData;

  // Mock listing revenue data
  const allListingRevenue: ListingRevenueItem[] = [
    {
      id: "1",
      name: "Yala National Park Safari",
      category: "Safari",
      bookings: 34,
      grossRevenue: 5780,
      commission: 867,
      netRevenue: 4913,
      trend: 24,
    },
    {
      id: "2",
      name: "Minneriya Wildlife Safari",
      category: "Safari",
      bookings: 28,
      grossRevenue: 4760,
      commission: 714,
      netRevenue: 4046,
      trend: 18,
    },
    {
      id: "3",
      name: "Galle Fort Heritage Walk",
      category: "Tour",
      bookings: 21,
      grossRevenue: 1785,
      commission: 268,
      netRevenue: 1517,
      trend: 12,
    },
    {
      id: "4",
      name: "Sigiriya Rock Fortress Tour",
      category: "Tour",
      bookings: 15,
      grossRevenue: 1275,
      commission: 191,
      netRevenue: 1084,
      trend: 8,
    },
    {
      id: "5",
      name: "Kandy Cultural Experience",
      category: "Experience",
      bookings: 12,
      grossRevenue: 960,
      commission: 144,
      netRevenue: 816,
      trend: -5,
    },
    {
      id: "6",
      name: "Ella Hiking Adventure",
      category: "Adventure",
      bookings: 8,
      grossRevenue: 640,
      commission: 96,
      netRevenue: 544,
      trend: 15,
    },
  ];

  // Mock payout history with different statuses
  const payoutHistory: PayoutHistoryItem[] = [
    {
      id: "1",
      date: "2026-04-25",
      amount: 18275,
      status: "completed",
      bookings: 47,
      method: "Bank Transfer",
      transactionId: "TXN-2026-04-001",
    },
    {
      id: "2",
      date: "2026-03-25",
      amount: 15470,
      status: "completed",
      bookings: 39,
      method: "Bank Transfer",
      transactionId: "TXN-2026-03-001",
    },
    {
      id: "3",
      date: "2026-02-25",
      amount: 13430,
      status: "completed",
      bookings: 34,
      method: "Bank Transfer",
      transactionId: "TXN-2026-02-001",
    },
    {
      id: "4",
      date: "2026-05-25",
      amount: 8450,
      status: "pending",
      bookings: 15,
      method: "Bank Transfer",
    },
    {
      id: "5",
      date: "2026-01-25",
      amount: 12800,
      status: "processing",
      bookings: 32,
      method: "Bank Transfer",
      transactionId: "TXN-2026-01-001",
    },
    {
      id: "6",
      date: "2025-12-25",
      amount: 9200,
      status: "failed",
      bookings: 28,
      method: "Bank Transfer",
    },
    {
      id: "7",
      date: "2025-11-25",
      amount: 11500,
      status: "on_hold",
      bookings: 30,
      method: "Bank Transfer",
    },
  ];

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    let filtered = allListingRevenue.filter(listing =>
      listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortField) {
        case "name":
          return sortDirection === "asc" 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case "bookings":
          aValue = a.bookings;
          bValue = b.bookings;
          break;
        case "grossRevenue":
          aValue = a.grossRevenue;
          bValue = b.grossRevenue;
          break;
        case "netRevenue":
          aValue = a.netRevenue;
          bValue = b.netRevenue;
          break;
        default:
          return 0;
      }
      
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [searchQuery, sortField, sortDirection, allListingRevenue]);

  const monthlyComparison = [
    { metric: "Gross Revenue", current: `$${currentData.totalEarnings.toLocaleString()}`, previous: "$19,250", change: "+29.1%" },
    { metric: "Commission", current: `$${currentData.commission.toLocaleString()}`, previous: "$2,888", change: "+29.1%" },
    { metric: "Net Revenue", current: `$${(currentData.totalEarnings - currentData.commission).toLocaleString()}`, previous: "$16,362", change: "+29.1%" },
    { metric: "Average per Booking", current: "$340", previous: "$315", change: "+7.9%" },
  ];

  // Helper functions
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setIsLoading(true);
    setTimeRange(range);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleExport = () => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      showToast("Revenue data exported successfully", "success");
    }, 1500);
  };

  const handleViewPayoutDetails = (payoutId: string) => {
    setShowPayoutDetails(payoutId);
  };

  const handleDownloadPayoutSummary = (payoutId: string) => {
    showToast("Payout summary downloaded", "success");
  };

  const handleRequestPayout = () => {
    showToast("Payout request submitted successfully", "success");
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getPayoutStatusColor = (status: PayoutStatus) => {
    switch (status) {
      case "completed":
        return { bg: "rgba(34,197,94,0.1)", color: "#4ade80", icon: CheckCircle };
      case "pending":
        return { bg: "rgba(245,158,11,0.1)", color: "#fbbf24", icon: Clock };
      case "processing":
        return { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", icon: Clock };
      case "failed":
        return { bg: "rgba(239,68,68,0.1)", color: "#f87171", icon: AlertCircle };
      case "on_hold":
        return { bg: "rgba(156,163,175,0.1)", color: "#9ca3af", icon: AlertCircle };
      default:
        return { bg: "rgba(156,163,175,0.1)", color: "#9ca3af", icon: Clock };
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
            {isLoading ? "Exporting..." : "Export"}
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
              <XAxis dataKey="period" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
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
              <Area type="monotone" dataKey="grossRevenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueGradient)" name="Gross Revenue" />
              <Area type="monotone" dataKey="netRevenue" stroke="#3b82f6" strokeWidth={2} fill="url(#netGradient)" name="Net Revenue" />
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
                      {formatDate(payout.date)}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] capitalize"
                    style={{
                      background: getPayoutStatusColor(payout.status).bg,
                      color: getPayoutStatusColor(payout.status).color,
                    }}
                  >
                    {(() => {
                      const StatusIcon = getPayoutStatusColor(payout.status).icon;
                      return <StatusIcon size={9} />;
                    })()}
                    {payout.status.replace('_', ' ')}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[16px] mb-0.5" style={{ color: "var(--success)", fontWeight: 700 }}>
                      ${payout.amount.toLocaleString()}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {payout.bookings} bookings • {payout.method}
                    </p>
                    {payout.transactionId && (
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        ID: {payout.transactionId}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPayoutDetails(payout.id);
                      }}
                      className="w-7 h-7 rounded flex items-center justify-center hover:bg-opacity-80 transition-all"
                      style={{
                        background: "var(--input-background)",
                        border: "1px solid var(--border-light)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPayoutSummary(payout.id);
                      }}
                      className="w-7 h-7 rounded flex items-center justify-center hover:bg-opacity-80 transition-all"
                      style={{
                        background: "var(--input-background)",
                        border: "1px solid var(--border-light)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      <Download size={12} />
                    </button>
                    {payout.status === "pending" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestPayout();
                        }}
                        className="w-7 h-7 rounded flex items-center justify-center hover:bg-opacity-80 transition-all"
                        style={{
                          background: "var(--active-overlay)",
                          border: "1px solid var(--border-accent)",
                          color: "var(--accent-navy-light)",
                        }}
                      >
                        <ExternalLink size={12} />
                      </button>
                    )}
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
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <div>
            <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Revenue by Listing
            </h2>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg text-[12px] w-64"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            />
          </div>
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
              {filteredAndSortedListings.map((listing, index) => (
                <tr
                  key={listing.id}
                  className="group cursor-pointer transition-all"
                  style={{ borderBottom: index < filteredAndSortedListings.length - 1 ? "1px solid var(--border-light)" : "none" }}
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
                      ${listing.grossRevenue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-[13px]" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                      ${listing.commission.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-[14px]" style={{ color: "var(--success)", fontWeight: 700 }}>
                      ${listing.netRevenue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px]"
                      style={{
                        background: listing.trend >= 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        color: listing.trend >= 0 ? "#4ade80" : "#f87171",
                        fontWeight: 600,
                      }}
                    >
                      {listing.trend >= 0 ? <ArrowUpRight size={11} /> : <TrendingDown size={11} />}
                      {listing.trend >= 0 ? "+" : ""}{listing.trend}%
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

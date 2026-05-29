import { useState, useMemo } from "react";
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
  Download,
  Search,
  Filter,
  X,
  Check,
  AlertCircle,
  Image,
  MessageSquare,
  DollarSign,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type TimeRange = "7d" | "30d" | "90d" | "1y";
type CategoryFilter = "all" | "safari" | "tour" | "experience" | "adventure" | "stay";
type SortField = "name" | "views" | "clicks" | "bookings" | "conversion" | "revenue" | "rating";
type SortDirection = "asc" | "desc";

interface ListingPerformanceItem {
  id: string;
  name: string;
  category: string;
  views: number;
  clicks: number;
  bookings: number;
  conversion: number;
  revenue: number;
  rating: number;
  trend: number;
  images: number;
  reviews: number;
}

interface RecommendedAction {
  id: string;
  type: "images" | "reviews" | "availability" | "pricing" | "description";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  listingName?: string;
  icon: any;
}

export function ListingPerformancePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("views");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Dynamic data based on time range
  const generatePerformanceData = (range: TimeRange) => {
    const baseData = {
      "7d": {
        totalViews: 1247,
        clickRate: 11.2,
        conversionRate: 7.8,
        avgRating: 4.7,
        chartData: [
          { date: "Mon", views: 145, clicks: 18, bookings: 4 },
          { date: "Tue", views: 162, clicks: 21, bookings: 6 },
          { date: "Wed", views: 189, clicks: 24, bookings: 5 },
          { date: "Thu", views: 201, clicks: 28, bookings: 8 },
          { date: "Fri", views: 178, clicks: 22, bookings: 7 },
          { date: "Sat", views: 195, clicks: 26, bookings: 9 },
          { date: "Sun", views: 177, clicks: 19, bookings: 6 },
        ]
      },
      "30d": {
        totalViews: 1847,
        clickRate: 12.4,
        conversionRate: 8.7,
        avgRating: 4.8,
        chartData: [
          { date: "Week 1", views: 420, clicks: 52, bookings: 12 },
          { date: "Week 2", views: 485, clicks: 61, bookings: 18 },
          { date: "Week 3", views: 512, clicks: 68, bookings: 21 },
          { date: "Week 4", views: 430, clicks: 55, bookings: 16 },
        ]
      },
      "90d": {
        totalViews: 4250,
        clickRate: 13.8,
        conversionRate: 9.2,
        avgRating: 4.9,
        chartData: [
          { date: "Feb", views: 1200, clicks: 156, bookings: 42 },
          { date: "Mar", views: 1450, clicks: 189, bookings: 58 },
          { date: "Apr", views: 1600, clicks: 208, bookings: 67 },
        ]
      },
      "1y": {
        totalViews: 18500,
        clickRate: 14.2,
        conversionRate: 10.1,
        avgRating: 4.8,
        chartData: [
          { date: "Q1", views: 4200, clicks: 546, bookings: 145 },
          { date: "Q2", views: 4800, clicks: 624, bookings: 178 },
          { date: "Q3", views: 5100, clicks: 663, bookings: 195 },
          { date: "Q4", views: 4400, clicks: 572, bookings: 162 },
        ]
      }
    };
    return baseData[range];
  };

  const currentData = generatePerformanceData(timeRange);

  // Dynamic performance stats
  const performanceStats = useMemo(() => [
    {
      label: "Total Views",
      value: currentData.totalViews.toLocaleString(),
      change: "+18%",
      trend: "+280",
      icon: Eye,
      color: "#3b82f6",
    },
    {
      label: "Click-Through Rate",
      value: `${currentData.clickRate}%`,
      change: "+2.1%",
      trend: "↑",
      icon: MousePointerClick,
      color: "#10b981",
    },
    {
      label: "Booking Conversion",
      value: `${currentData.conversionRate}%`,
      change: "+1.3%",
      trend: "↑",
      icon: CheckCircle,
      color: "#22c55e",
    },
    {
      label: "Average Rating",
      value: currentData.avgRating.toString(),
      change: "+0.2",
      trend: "↑",
      icon: Star,
      color: "#eab308",
    },
  ], [timeRange, currentData]);

  // Mock listing data with more details
  const allListingPerformance: ListingPerformanceItem[] = [
    {
      id: "1",
      name: "Yala National Park Safari",
      category: "safari",
      views: 842,
      clicks: 127,
      bookings: 34,
      conversion: 4.0,
      revenue: 5780,
      rating: 4.9,
      trend: 24,
      images: 8,
      reviews: 45,
    },
    {
      id: "2",
      name: "Galle Fort Heritage Walk",
      category: "tour",
      views: 512,
      clicks: 89,
      bookings: 21,
      conversion: 4.1,
      revenue: 1785,
      rating: 4.7,
      trend: 18,
      images: 12,
      reviews: 28,
    },
    {
      id: "3",
      name: "Minneriya Wildlife Safari",
      category: "safari",
      views: 389,
      clicks: 54,
      bookings: 15,
      conversion: 3.9,
      revenue: 2550,
      rating: 4.8,
      trend: 12,
      images: 6,
      reviews: 22,
    },
    {
      id: "4",
      name: "Sigiriya Rock Fortress Tour",
      category: "tour",
      views: 204,
      clicks: 18,
      bookings: 3,
      conversion: 1.5,
      revenue: 255,
      rating: 4.5,
      trend: -8,
      images: 4,
      reviews: 8,
    },
    {
      id: "5",
      name: "Kandy Cultural Experience",
      category: "experience",
      views: 156,
      clicks: 24,
      bookings: 8,
      conversion: 5.1,
      revenue: 640,
      rating: 4.6,
      trend: 15,
      images: 3,
      reviews: 12,
    },
    {
      id: "6",
      name: "Ella Hiking Adventure",
      category: "adventure",
      views: 98,
      clicks: 12,
      bookings: 2,
      conversion: 2.0,
      revenue: 180,
      rating: 4.3,
      trend: -12,
      images: 2,
      reviews: 5,
    },
  ];

  // Recommended actions based on performance data
  const recommendedActions: RecommendedAction[] = [
    {
      id: "1",
      type: "images",
      title: "Add More Images",
      description: "Sigiriya Rock Fortress Tour has only 4 images. Listings with 8+ images get 40% more clicks.",
      priority: "high",
      listingName: "Sigiriya Rock Fortress Tour",
      icon: Image,
    },
    {
      id: "2",
      type: "reviews",
      title: "Respond to Reviews",
      description: "You have 3 pending reviews to respond to. Quick responses improve your rating by 0.2 points on average.",
      priority: "medium",
      icon: MessageSquare,
    },
    {
      id: "3",
      type: "availability",
      title: "Update Peak Season Availability",
      description: "June-August shows high demand. Update your availability calendar for better bookings.",
      priority: "high",
      icon: Calendar,
    },
    {
      id: "4",
      type: "description",
      title: "Improve Low-Performing Descriptions",
      description: "Ella Hiking Adventure has low conversion. Consider updating the description with more details.",
      priority: "medium",
      listingName: "Ella Hiking Adventure",
      icon: AlertCircle,
    },
    {
      id: "5",
      type: "pricing",
      title: "Add Seasonal Pricing",
      description: "Peak months (Dec-Mar) could support 15-20% higher pricing based on demand patterns.",
      priority: "low",
      icon: DollarSign,
    },
  ];

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    let filtered = allListingPerformance.filter(listing => {
      const matchesSearch = listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           listing.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || listing.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case "name":
          return sortDirection === "asc" 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case "views":
          aValue = a.views;
          bValue = b.views;
          break;
        case "clicks":
          aValue = a.clicks;
          bValue = b.clicks;
          break;
        case "bookings":
          aValue = a.bookings;
          bValue = b.bookings;
          break;
        case "conversion":
          aValue = a.conversion;
          bValue = b.conversion;
          break;
        case "revenue":
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
          break;
        default:
          return 0;
      }
      
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [searchQuery, categoryFilter, sortField, sortDirection, allListingPerformance]);

  const conversionFunnelData = [
    { stage: "Views", count: currentData.totalViews, percentage: 100 },
    { stage: "Clicks", count: Math.round(currentData.totalViews * (currentData.clickRate / 100)), percentage: currentData.clickRate },
    { stage: "Inquiries", count: Math.round(currentData.totalViews * 0.067), percentage: 6.7 },
    { stage: "Bookings", count: Math.round(currentData.totalViews * (currentData.conversionRate / 100)), percentage: currentData.conversionRate },
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
      showToast("Performance report exported successfully", "success");
    }, 1500);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.2)" };
      case "medium":
        return { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.2)" };
      case "low":
        return { bg: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "rgba(59,130,246,0.2)" };
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
            Listing Performance
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Track views, clicks, and booking conversion for each of your listings
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

      {/* Recommended Actions */}
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
            Recommended Actions
          </h2>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Improve your listing performance with these suggestions
          </p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedActions.map((action) => (
              <div
                key={action.id}
                className="rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  background: getPriorityColor(action.priority).bg,
                  border: `1px solid ${getPriorityColor(action.priority).border}`,
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ 
                      background: getPriorityColor(action.priority).color + "20",
                      color: getPriorityColor(action.priority).color 
                    }}
                  >
                    <action.icon size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {action.title}
                      </h3>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider"
                        style={{
                          background: getPriorityColor(action.priority).color,
                          color: "white",
                          fontWeight: 600,
                        }}
                      >
                        {action.priority}
                      </span>
                    </div>
                    {action.listingName && (
                      <p className="text-[11px] mb-1" style={{ color: "var(--text-secondary)" }}>
                        {action.listingName}
                      </p>
                    )}
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

      {/* Traffic Trends Chart */}
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
              Traffic & Conversion Trends
            </h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Views, clicks, and booking activity over time
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
            <LineChart data={currentData.chartData}>
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

      {/* Individual Listing Performance */}
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
              Listing Performance Details
            </h2>
          </div>
          <div className="flex gap-3">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
              className="px-3 py-2 rounded-lg text-[12px]"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            >
              <option value="all">All Categories</option>
              <option value="safari">Safari</option>
              <option value="tour">Tour</option>
              <option value="experience">Experience</option>
              <option value="adventure">Adventure</option>
              <option value="stay">Stay</option>
            </select>
            
            {/* Search */}
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
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 1000 }}>
            <thead>
              <tr style={{ background: "var(--input-background)" }}>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1 text-[11px] uppercase tracking-wider hover:opacity-80"
                    style={{ color: "var(--text-tertiary)", fontWeight: 600 }}
                  >
                    Listing
                    {sortField === "name" && (
                      sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <button
                    onClick={() => handleSort("views")}
                    className="flex items-center gap-1 text-[11px] uppercase tracking-wider hover:opacity-80"
                    style={{ color: "var(--text-tertiary)", fontWeight: 600 }}
                  >
                    Views
                    {sortField === "views" && (
                      sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <button
                    onClick={() => handleSort("clicks")}
                    className="flex items-center gap-1 text-[11px] uppercase tracking-wider hover:opacity-80"
                    style={{ color: "var(--text-tertiary)", fontWeight: 600 }}
                  >
                    Clicks
                    {sortField === "clicks" && (
                      sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <button
                    onClick={() => handleSort("bookings")}
                    className="flex items-center gap-1 text-[11px] uppercase tracking-wider hover:opacity-80"
                    style={{ color: "var(--text-tertiary)", fontWeight: 600 }}
                  >
                    Bookings
                    {sortField === "bookings" && (
                      sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <button
                    onClick={() => handleSort("conversion")}
                    className="flex items-center gap-1 text-[11px] uppercase tracking-wider hover:opacity-80"
                    style={{ color: "var(--text-tertiary)", fontWeight: 600 }}
                  >
                    Conversion
                    {sortField === "conversion" && (
                      sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <button
                    onClick={() => handleSort("revenue")}
                    className="flex items-center gap-1 text-[11px] uppercase tracking-wider hover:opacity-80"
                    style={{ color: "var(--text-tertiary)", fontWeight: 600 }}
                  >
                    Revenue
                    {sortField === "revenue" && (
                      sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <button
                    onClick={() => handleSort("rating")}
                    className="flex items-center gap-1 text-[11px] uppercase tracking-wider hover:opacity-80"
                    style={{ color: "var(--text-tertiary)", fontWeight: 600 }}
                  >
                    Rating
                    {sortField === "rating" && (
                      sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Trend
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedListings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={24} style={{ color: "var(--text-tertiary)" }} />
                      <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
                        No listings found matching your criteria
                      </p>
                      <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        Try adjusting your search or category filter
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedListings.map((listing, index) => (
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
                      <div>
                        <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                          {listing.name}
                        </p>
                        <div className="flex items-center gap-3">
                          <p className="text-[11px] capitalize" style={{ color: "var(--text-tertiary)" }}>
                            {listing.category}
                          </p>
                          <div className="flex items-center gap-1">
                            <Image size={10} style={{ color: "var(--text-tertiary)" }} />
                            <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                              {listing.images}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare size={10} style={{ color: "var(--text-tertiary)" }} />
                            <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                              {listing.reviews}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {listing.views.toLocaleString()}
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
                        ${listing.revenue.toLocaleString()}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
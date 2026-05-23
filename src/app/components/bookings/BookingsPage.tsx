import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Calendar,
  ChevronDown,
  CheckSquare,
  MoreHorizontal,
  Eye,
  Edit2,
  XCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  User,
  MapPin,
  Car,
  CreditCard,
  TrendingUp,
  RefreshCw,
  FileText,
  Phone,
  Mail,
  Wallet,
  Building2,
  Compass,
  Globe,
  Anchor,
  BarChart3,
} from "lucide-react";
import { BookingDetailDrawer } from "./BookingDetailDrawer";
import { useCommonActions } from "../../hooks/useCommonActions";
import { FilterModal, type FilterOption } from "../shared/FilterModal";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "rejected" | "refunded";
type PaymentStatus = "unpaid" | "paid" | "partially_paid" | "refunded" | "failed" | "pay_later";
type BookingType = "Stay" | "Tour" | "Safari" | "Experience" | "Transfer";

interface Booking {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  type: BookingType;
  listing: string;
  vendor: string;
  travelDate: string;
  checkIn?: string;
  checkOut?: string;
  amount: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  passengers?: number;
  duration?: string;
  specialRequests?: string;
  riskFlags?: string[];
}

const BOOKING_STATUS_CONFIG: Record<BookingStatus, { bg: string; text: string; dot: string; icon: any }> = {
  pending: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", dot: "#f59e0b", icon: Clock },
  confirmed: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e", icon: CheckCircle },
  completed: { bg: "rgba(59, 130, 246, 0.1)", text: "#60a5fa", dot: "#3b82f6", icon: CheckSquare },
  cancelled: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8", dot: "#64748b", icon: XCircle },
  rejected: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444", icon: XCircle },
  refunded: { bg: "rgba(168, 85, 247, 0.1)", text: "#a78bfa", dot: "#8b5cf6", icon: RefreshCw },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { bg: string; text: string }> = {
  paid: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80" },
  unpaid: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171" },
  partially_paid: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24" },
  refunded: { bg: "rgba(168, 85, 247, 0.1)", text: "#a78bfa" },
  failed: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171" },
  pay_later: { bg: "rgba(59, 130, 246, 0.1)", text: "#60a5fa" },
};

const TYPE_COLORS: Record<BookingType, { bg: string; text: string; border: string; icon: any }> = {
  Stay: { bg: "rgba(37, 99, 235, 0.12)", text: "#60a5fa", border: "rgba(37,99,235,0.25)", icon: Building2 },
  Tour: { bg: "rgba(8, 145, 178, 0.12)", text: "#22d3ee", border: "rgba(8,145,178,0.25)", icon: Compass },
  Safari: { bg: "rgba(5, 150, 105, 0.12)", text: "#34d399", border: "rgba(5,150,105,0.25)", icon: Globe },
  Experience: { bg: "rgba(217, 119, 6, 0.12)", text: "#fbbf24", border: "rgba(217,119,6,0.25)", icon: Anchor },
  Transfer: { bg: "rgba(100, 116, 139, 0.12)", text: "#94a3b8", border: "rgba(100,116,139,0.25)", icon: Car },
};

// Sample booking data
const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: "BK-2847",
    customer: { name: "James Wilson", email: "james.w@email.com", phone: "+94 77 123 4567" },
    type: "Stay",
    listing: "Jetwing Yala Resort - Deluxe Suite",
    vendor: "Jetwing Hotels",
    travelDate: "Jun 15, 2026",
    checkIn: "Jun 15, 2026",
    checkOut: "Jun 18, 2026",
    amount: 890,
    bookingStatus: "confirmed",
    paymentStatus: "paid",
    createdAt: "May 19, 2026",
    passengers: 2,
    duration: "3 nights",
  },
  {
    id: "BK-2846",
    customer: { name: "Sarah Chen", email: "sarah.c@email.com", phone: "+94 71 234 5678" },
    type: "Safari",
    listing: "Yala National Park Full Day Safari",
    vendor: "Safari Adventures LK",
    travelDate: "Jun 20, 2026",
    amount: 240,
    bookingStatus: "pending",
    paymentStatus: "unpaid",
    createdAt: "May 19, 2026",
    passengers: 4,
    duration: "Full day",
    riskFlags: ["payment_pending_48h"],
  },
  {
    id: "BK-2845",
    customer: { name: "David Kumar", email: "david.k@email.com", phone: "+94 76 345 6789" },
    type: "Transfer",
    listing: "CMB Airport to Galle Fort Hotel",
    vendor: "TukTuk Pro Transfers",
    travelDate: "Jun 12, 2026",
    amount: 35,
    bookingStatus: "confirmed",
    paymentStatus: "pay_later",
    createdAt: "May 18, 2026",
    passengers: 2,
    specialRequests: "Need baby car seat",
  },
  {
    id: "BK-2844",
    customer: { name: "Emma Thompson", email: "emma.t@email.com", phone: "+94 75 456 7890" },
    type: "Tour",
    listing: "Galle Fort Heritage Walking Tour",
    vendor: "Heritage Tours Lanka",
    travelDate: "Jun 10, 2026",
    amount: 65,
    bookingStatus: "completed",
    paymentStatus: "paid",
    createdAt: "May 17, 2026",
    passengers: 2,
    duration: "3 hours",
  },
  {
    id: "BK-2843",
    customer: { name: "Michael Brown", email: "michael.b@email.com", phone: "+94 77 567 8901" },
    type: "Experience",
    listing: "Colombo Street Food Evening Tour",
    vendor: "Taste of Lanka",
    travelDate: "Jun 8, 2026",
    amount: 45,
    bookingStatus: "cancelled",
    paymentStatus: "refunded",
    createdAt: "May 16, 2026",
    passengers: 1,
    duration: "2 hours",
  },
  {
    id: "BK-2842",
    customer: { name: "Lisa Anderson", email: "lisa.a@email.com", phone: "+94 71 678 9012" },
    type: "Stay",
    listing: "Shangri-La Colombo - Ocean View Room",
    vendor: "Shangri-La Hotels",
    travelDate: "Jul 1, 2026",
    checkIn: "Jul 1, 2026",
    checkOut: "Jul 5, 2026",
    amount: 1240,
    bookingStatus: "confirmed",
    paymentStatus: "partially_paid",
    createdAt: "May 15, 2026",
    passengers: 2,
    duration: "4 nights",
    riskFlags: ["partial_payment"],
  },
  {
    id: "BK-2841",
    customer: { name: "Robert Garcia", email: "robert.g@email.com", phone: "+94 76 789 0123" },
    type: "Safari",
    listing: "Udawalawe Elephant Safari Experience",
    vendor: "Wild Adventures",
    travelDate: "Jun 25, 2026",
    amount: 180,
    bookingStatus: "pending",
    paymentStatus: "failed",
    createdAt: "May 14, 2026",
    passengers: 3,
    duration: "Half day",
    riskFlags: ["payment_failed"],
  },
  {
    id: "BK-2840",
    customer: { name: "Jennifer Lee", email: "jennifer.l@email.com", phone: "+94 75 890 1234" },
    type: "Transfer",
    listing: "Kandy to Nuwara Eliya Private Transfer",
    vendor: "Ceylon Express",
    travelDate: "Jun 18, 2026",
    amount: 55,
    bookingStatus: "confirmed",
    paymentStatus: "paid",
    createdAt: "May 13, 2026",
    passengers: 4,
  },
];

export function BookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState("all_time");
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const { handleExport } = useCommonActions();

  const statusTabs = [
    { id: "all", label: "All", count: SAMPLE_BOOKINGS.length },
    { id: "pending", label: "Pending", count: SAMPLE_BOOKINGS.filter(b => b.bookingStatus === "pending").length },
    { id: "confirmed", label: "Confirmed", count: SAMPLE_BOOKINGS.filter(b => b.bookingStatus === "confirmed").length },
    { id: "completed", label: "Completed", count: SAMPLE_BOOKINGS.filter(b => b.bookingStatus === "completed").length },
    { id: "cancelled", label: "Cancelled", count: SAMPLE_BOOKINGS.filter(b => b.bookingStatus === "cancelled").length },
    { id: "refunded", label: "Refunded", count: SAMPLE_BOOKINGS.filter(b => b.bookingStatus === "refunded").length },
    { id: "pay_later", label: "Pay Later", count: SAMPLE_BOOKINGS.filter(b => b.paymentStatus === "pay_later").length },
  ];

  // Revenue metrics
  const totalRevenue = SAMPLE_BOOKINGS.reduce((sum, b) => sum + b.amount, 0);
  const pendingPayments = SAMPLE_BOOKINGS.filter(b => b.paymentStatus === "unpaid" || b.paymentStatus === "partially_paid").reduce((sum, b) => sum + b.amount, 0);
  const refundsAmount = SAMPLE_BOOKINGS.filter(b => b.paymentStatus === "refunded").reduce((sum, b) => sum + b.amount, 0);

  // Category breakdown
  const categoryStats = {
    Stay: SAMPLE_BOOKINGS.filter(b => b.type === "Stay").length,
    Tour: SAMPLE_BOOKINGS.filter(b => b.type === "Tour").length,
    Safari: SAMPLE_BOOKINGS.filter(b => b.type === "Safari").length,
    Experience: SAMPLE_BOOKINGS.filter(b => b.type === "Experience").length,
    Transfer: SAMPLE_BOOKINGS.filter(b => b.type === "Transfer").length,
  };

  const filteredBookings = SAMPLE_BOOKINGS.filter((booking) => {
    const matchStatus = filterStatus === "all" ||
      (filterStatus === "pay_later" ? booking.paymentStatus === "pay_later" : booking.bookingStatus === filterStatus);
    const matchSearch = !search ||
      booking.id.toLowerCase().includes(search.toLowerCase()) ||
      booking.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      booking.listing.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const toggleSelect = (id: string) => {
    setSelectedBookings(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedBookings.size === filteredBookings.length) {
      setSelectedBookings(new Set());
    } else {
      setSelectedBookings(new Set(filteredBookings.map(b => b.id)));
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Booking Management
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Manage and monitor all marketplace bookings
        </p>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.15)" }}
            >
              <DollarSign size={18} style={{ color: "#10b981" }} />
            </div>
          </div>
          <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${totalRevenue.toLocaleString()}
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Total Bookings Value
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(245,158,11,0.15)" }}
            >
              <Clock size={18} style={{ color: "#f59e0b" }} />
            </div>
          </div>
          <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${pendingPayments.toLocaleString()}
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Pending Payments
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(168,85,247,0.15)" }}
            >
              <RefreshCw size={18} style={{ color: "#8b5cf6" }} />
            </div>
          </div>
          <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${refundsAmount.toLocaleString()}
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Refunds This Month
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.15)" }}
            >
              <CheckCircle size={18} style={{ color: "#22c55e" }} />
            </div>
          </div>
          <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {SAMPLE_BOOKINGS.filter(b => b.bookingStatus === "confirmed").length}
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Active Bookings
          </p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 h-9 rounded-lg flex-1 max-w-sm"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
          }}
        >
          <Search size={14} style={{ color: "var(--text-tertiary)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings, customers, listings..."
            className="flex-1 bg-transparent outline-none text-[12px]"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* Date Range */}
        <div className="relative">
          <button
            className="flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] transition-all"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
            }}
          >
            <Calendar size={13} />
            {dateRange === "all_time" ? "All Time" : dateRange}
            <ChevronDown size={12} />
          </button>
        </div>

        {/* Filter */}
        <button
          onClick={() => setFilterModalOpen(true)}
          className="flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] transition-all"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          <Filter size={13} />
          More Filters
        </button>

        <div className="flex-1" />

        {/* Bulk Actions */}
        {selectedBookings.size > 0 && (
          <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            {selectedBookings.size} selected
          </span>
        )}

        {/* Export */}
        <button
          onClick={() => handleExport("Bookings", filteredBookings)}
          className="flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] transition-all"
          style={{
            background: "var(--active-overlay)",
            color: "var(--accent-navy-light)",
            border: "1px solid var(--border-accent)",
          }}
        >
          <Download size={13} />
          Export
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2">
        {statusTabs.map((tab) => {
          const isActive = filterStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className="px-3.5 py-2 rounded-lg text-[12px] transition-all"
              style={
                isActive
                  ? {
                      background: "var(--active-overlay)",
                      color: "var(--accent-navy-light)",
                      border: "1px solid var(--border-accent)",
                      boxShadow: "0 0 8px var(--border-accent)",
                    }
                  : {
                      background: "var(--input-background)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-light)",
                    }
              }
            >
              {tab.label}
              <span
                className="ml-2 px-1.5 py-0.5 rounded text-[10px]"
                style={{
                  background: isActive ? "rgba(255,255,255,0.1)" : "var(--bg-elevated)",
                  color: isActive ? "var(--accent-navy-light)" : "var(--text-tertiary)",
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Table Header */}
        <div
          className="grid items-center px-4 py-3"
          style={{
            gridTemplateColumns: "36px 100px 180px 100px 220px 140px 120px 90px 120px 120px 100px 80px",
            borderBottom: "1px solid var(--border-light)",
            background: "var(--bg-elevated)",
          }}
        >
          <button onClick={toggleSelectAll} className="flex items-center justify-center">
            <div
              className="w-4 h-4 rounded flex items-center justify-center"
              style={{
                border: selectedBookings.size === filteredBookings.length && filteredBookings.length > 0
                  ? "1.5px solid var(--accent-navy)"
                  : "1.5px solid var(--border-medium)",
                background: selectedBookings.size === filteredBookings.length && filteredBookings.length > 0
                  ? "var(--accent-navy)"
                  : "transparent",
              }}
            >
              {selectedBookings.size === filteredBookings.length && filteredBookings.length > 0 && (
                <CheckSquare size={10} className="text-white" />
              )}
            </div>
          </button>
          {["Booking ID", "Customer", "Type", "Listing / Package", "Vendor", "Travel Date", "Amount", "Booking Status", "Payment Status", "Created", "Actions"].map((col) => (
            <div key={col} className="flex items-center gap-1">
              <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                {col}
              </span>
            </div>
          ))}
        </div>

        {/* Table Rows */}
        <div>
          {filteredBookings.map((booking, i) => {
            const isSelected = selectedBookings.has(booking.id);
            const bookingConfig = BOOKING_STATUS_CONFIG[booking.bookingStatus];
            const paymentConfig = PAYMENT_STATUS_CONFIG[booking.paymentStatus];
            const typeConfig = TYPE_COLORS[booking.type];
            const hasRisk = booking.riskFlags && booking.riskFlags.length > 0;

            return (
              <div
                key={booking.id}
                className="grid items-center px-4 py-3 transition-all group cursor-pointer"
                style={{
                  gridTemplateColumns: "36px 100px 180px 100px 220px 140px 120px 90px 120px 120px 100px 80px",
                  borderBottom: i < filteredBookings.length - 1 ? "1px solid var(--border-light)" : "none",
                  background: isSelected ? "var(--active-overlay)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
                onClick={() => handleViewBooking(booking)}
              >
                {/* Checkbox */}
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleSelect(booking.id)}
                    className="w-4 h-4 rounded flex items-center justify-center"
                    style={{
                      border: isSelected ? "1.5px solid var(--accent-navy)" : "1.5px solid var(--border-medium)",
                      background: isSelected ? "var(--accent-navy)" : "transparent",
                    }}
                  >
                    {isSelected && <CheckSquare size={10} className="text-white" />}
                  </button>
                </div>

                {/* Booking ID */}
                <div className="flex items-center gap-2">
                  <span className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {booking.id}
                  </span>
                  {hasRisk && (
                    <AlertTriangle size={12} style={{ color: "#ef4444" }} className="animate-pulse" />
                  )}
                </div>

                {/* Customer */}
                <div className="min-w-0">
                  <p className="text-[12px] truncate" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {booking.customer.name}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>
                    {booking.customer.email}
                  </p>
                </div>

                {/* Type */}
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px]"
                    style={{
                      background: typeConfig.bg,
                      color: typeConfig.text,
                      border: `1px solid ${typeConfig.border}`,
                    }}
                  >
                    <typeConfig.icon size={11} />
                    {booking.type}
                  </span>
                </div>

                {/* Listing */}
                <div className="min-w-0">
                  <p className="text-[12px] truncate" style={{ color: "var(--text-secondary)" }}>
                    {booking.listing}
                  </p>
                </div>

                {/* Vendor */}
                <div className="min-w-0">
                  <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                    {booking.vendor}
                  </p>
                </div>

                {/* Travel Date */}
                <div>
                  <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    {booking.travelDate}
                  </p>
                  {booking.duration && (
                    <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                      {booking.duration}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    ${booking.amount}
                  </p>
                </div>

                {/* Booking Status */}
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]"
                    style={{
                      background: bookingConfig.bg,
                      color: bookingConfig.text,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: bookingConfig.dot, boxShadow: `0 0 4px ${bookingConfig.dot}` }}
                    />
                    {booking.bookingStatus}
                  </span>
                </div>

                {/* Payment Status */}
                <div>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px]"
                    style={{
                      background: paymentConfig.bg,
                      color: paymentConfig.text,
                    }}
                  >
                    {booking.paymentStatus.replace("_", " ")}
                  </span>
                </div>

                {/* Created */}
                <div>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {booking.createdAt}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleViewBooking(booking)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <MoreHorizontal size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}
        >
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Showing <span style={{ color: "var(--text-secondary)" }}>{filteredBookings.length}</span> of{" "}
            <span style={{ color: "var(--text-secondary)" }}>{SAMPLE_BOOKINGS.length}</span> bookings
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] transition-all"
                style={
                  p === 1
                    ? { background: "var(--active-overlay)", color: "var(--accent-navy-light)", border: "1px solid var(--border-accent)" }
                    : { color: "var(--text-tertiary)" }
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Detail Drawer */}
      {drawerOpen && selectedBooking && (
        <BookingDetailDrawer
          booking={selectedBooking}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={(filters) => {
          console.log("Filters applied:", filters);
        }}
        filters={[
          {
            id: "type",
            label: "Booking Type",
            type: "select",
            options: [
              { value: "Stay", label: "Stay" },
              { value: "Tour", label: "Tour" },
              { value: "Safari", label: "Safari" },
              { value: "Experience", label: "Experience" },
              { value: "Transfer", label: "Transfer" },
            ],
          },
          {
            id: "minAmount",
            label: "Min Amount",
            type: "number",
            placeholder: "Min $",
          },
          {
            id: "maxAmount",
            label: "Max Amount",
            type: "number",
            placeholder: "Max $",
          },
          {
            id: "dateFrom",
            label: "Travel Date From",
            type: "date",
          },
          {
            id: "dateTo",
            label: "Travel Date To",
            type: "date",
          },
          {
            id: "hasRisks",
            label: "Risk Flags Only",
            type: "checkbox",
            placeholder: "Show only bookings with risk flags",
          },
        ]}
      />
    </div>
  );
}

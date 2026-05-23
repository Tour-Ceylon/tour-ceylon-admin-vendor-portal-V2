import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Eye,
  MessageSquare,
} from "lucide-react";
import { RefundDetailDrawer } from "./RefundDetailDrawer";

type RefundStatus = "requested" | "under_review" | "approved" | "rejected" | "refunded";

interface Refund {
  id: string;
  refundId: string;
  bookingId: string;
  customer: string;
  vendor: string;
  bookingType: string;
  originalAmount: number;
  refundAmount: number;
  refundType: "full" | "partial";
  reason: string;
  status: RefundStatus;
  requestDate: string;
  processedDate?: string;
}

const STATUS_CONFIG: Record<RefundStatus, { bg: string; text: string; dot: string }> = {
  requested: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", dot: "#f59e0b" },
  under_review: { bg: "rgba(59, 130, 246, 0.1)", text: "#60a5fa", dot: "#3b82f6" },
  approved: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e" },
  rejected: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444" },
  refunded: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8", dot: "#64748b" },
};

const SAMPLE_REFUNDS: Refund[] = [
  {
    id: "1",
    refundId: "REF-5421",
    bookingId: "BKG-5421",
    customer: "Sarah Johnson",
    vendor: "Ceylon Luxury Retreats",
    bookingType: "Stay",
    originalAmount: 1250.00,
    refundAmount: 1250.00,
    refundType: "full",
    reason: "Travel plans changed due to family emergency",
    status: "requested",
    requestDate: "2024-03-18 14:30",
  },
  {
    id: "2",
    refundId: "REF-5420",
    bookingId: "BKG-5420",
    customer: "Michael Chen",
    vendor: "Heritage Tours Lanka",
    bookingType: "Tour",
    originalAmount: 450.00,
    refundAmount: 225.00,
    refundType: "partial",
    reason: "Weather conditions not suitable for tour",
    status: "under_review",
    requestDate: "2024-03-17 12:15",
  },
  {
    id: "3",
    refundId: "REF-5419",
    bookingId: "BKG-5419",
    customer: "Emma Wilson",
    vendor: "Wild Adventures",
    bookingType: "Safari",
    originalAmount: 680.00,
    refundAmount: 680.00,
    refundType: "full",
    reason: "Safari vehicle breakdown, tour cancelled by vendor",
    status: "approved",
    requestDate: "2024-03-16 10:45",
  },
  {
    id: "4",
    refundId: "REF-5418",
    bookingId: "BKG-5418",
    customer: "David Brown",
    vendor: "Taste of Lanka",
    bookingType: "Experience",
    originalAmount: 180.00,
    refundAmount: 180.00,
    refundType: "full",
    reason: "Duplicate booking made by mistake",
    status: "refunded",
    requestDate: "2024-03-15 16:20",
    processedDate: "2024-03-16 09:30",
  },
  {
    id: "5",
    refundId: "REF-5417",
    bookingId: "BKG-5417",
    customer: "Lisa Martinez",
    vendor: "Premium Transfers LK",
    bookingType: "Transfer",
    originalAmount: 85.00,
    refundAmount: 85.00,
    refundType: "full",
    reason: "Flight cancelled, transfer no longer needed",
    status: "refunded",
    requestDate: "2024-03-14 14:10",
    processedDate: "2024-03-15 11:20",
  },
  {
    id: "6",
    refundId: "REF-5416",
    bookingId: "BKG-5416",
    customer: "James Taylor",
    vendor: "Cinnamon Hotels",
    bookingType: "Stay",
    originalAmount: 895.00,
    refundAmount: 895.00,
    refundType: "full",
    reason: "Medical emergency preventing travel",
    status: "requested",
    requestDate: "2024-03-18 11:30",
  },
  {
    id: "7",
    refundId: "REF-5415",
    bookingId: "BKG-5415",
    customer: "Anna Garcia",
    vendor: "Ocean Adventures",
    bookingType: "Experience",
    originalAmount: 320.00,
    refundAmount: 160.00,
    refundType: "partial",
    reason: "Service quality did not meet expectations",
    status: "under_review",
    requestDate: "2024-03-17 09:45",
  },
  {
    id: "8",
    refundId: "REF-5414",
    bookingId: "BKG-5414",
    customer: "Robert Lee",
    vendor: "Ancient Wonders Tours",
    bookingType: "Tour",
    originalAmount: 540.00,
    refundAmount: 540.00,
    refundType: "full",
    reason: "Visa application denied",
    status: "rejected",
    requestDate: "2024-03-13 15:20",
    processedDate: "2024-03-14 10:15",
  },
];

export function RefundsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const statusTabs = [
    { id: "all", label: "All", count: SAMPLE_REFUNDS.length },
    { id: "requested", label: "Requested", count: SAMPLE_REFUNDS.filter(r => r.status === "requested").length },
    { id: "under_review", label: "Under Review", count: SAMPLE_REFUNDS.filter(r => r.status === "under_review").length },
    { id: "approved", label: "Approved", count: SAMPLE_REFUNDS.filter(r => r.status === "approved").length },
    { id: "rejected", label: "Rejected", count: SAMPLE_REFUNDS.filter(r => r.status === "rejected").length },
    { id: "refunded", label: "Refunded", count: SAMPLE_REFUNDS.filter(r => r.status === "refunded").length },
  ];

  const filteredRefunds = SAMPLE_REFUNDS.filter((refund) => {
    const matchStatus = filterStatus === "all" || refund.status === filterStatus;
    const matchSearch = !search ||
      refund.refundId.toLowerCase().includes(search.toLowerCase()) ||
      refund.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      refund.customer.toLowerCase().includes(search.toLowerCase()) ||
      refund.vendor.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleViewRefund = (refund: Refund) => {
    setSelectedRefund(refund);
    setDrawerOpen(true);
  };

  // Calculate stats
  const stats = {
    totalRequested: SAMPLE_REFUNDS.filter(r => r.status === "requested" || r.status === "under_review").reduce((sum, r) => sum + r.refundAmount, 0),
    totalRefunded: SAMPLE_REFUNDS.filter(r => r.status === "refunded").reduce((sum, r) => sum + r.refundAmount, 0),
    pendingReview: SAMPLE_REFUNDS.filter(r => r.status === "requested" || r.status === "under_review").length,
    approvalRate: Math.round((SAMPLE_REFUNDS.filter(r => r.status === "approved" || r.status === "refunded").length / SAMPLE_REFUNDS.length) * 100),
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Refund Management
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Review and process customer refund requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(245, 158, 11, 0.1)" }}
            >
              <Clock size={18} style={{ color: "var(--warning)" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Total Requested
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${stats.totalRequested.toLocaleString()}
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
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239, 68, 68, 0.1)" }}
            >
              <TrendingDown size={18} style={{ color: "var(--error)" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Total Refunded
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${stats.totalRefunded.toLocaleString()}
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
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(59, 130, 246, 0.1)" }}
            >
              <AlertTriangle size={18} style={{ color: "#3b82f6" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Pending Review
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.pendingReview}
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
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(34, 197, 94, 0.1)" }}
            >
              <CheckCircle size={18} style={{ color: "var(--success)" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Approval Rate
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.approvalRate}%
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="rounded-xl"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Filters */}
        <div className="p-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
              }}
            >
              <Search size={14} style={{ color: "var(--text-tertiary)" }} />
              <input
                type="text"
                placeholder="Search by refund ID, booking, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-[13px] outline-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
            <button
              className="px-4 py-2 text-[13px] rounded-lg flex items-center gap-2"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
              }}
            >
              <Filter size={14} />
              Filters
            </button>
            <button
              className="px-4 py-2 text-[13px] rounded-lg flex items-center gap-2"
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

          {/* Status Tabs */}
          <div className="flex gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className="px-4 py-2 text-[12px] rounded-lg transition-all"
                style={
                  filterStatus === tab.id
                    ? {
                        background: "var(--active-overlay)",
                        color: "var(--accent-navy-light)",
                        border: "1px solid var(--border-accent)",
                        fontWeight: 600,
                      }
                    : {
                        color: "var(--text-secondary)",
                        border: "1px solid transparent",
                      }
                }
              >
                {tab.label}
                <span
                  className="ml-2 px-2 py-0.5 rounded text-[10px]"
                  style={{
                    background: filterStatus === tab.id ? "var(--accent-navy)" : "var(--input-background)",
                    color: filterStatus === tab.id ? "white" : "var(--text-tertiary)",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  REFUND ID
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  BOOKING
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  CUSTOMER
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  VENDOR
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  ORIGINAL
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  REFUND AMOUNT
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  TYPE
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  STATUS
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  REQUESTED
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.map((refund) => (
                <tr
                  key={refund.id}
                  className="group cursor-pointer transition-all"
                  style={{ borderBottom: "1px solid var(--border-light)" }}
                  onClick={() => handleViewRefund(refund)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {refund.refundId}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                      {refund.bookingId}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                      {refund.customer}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                      {refund.vendor}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                      ${refund.originalAmount.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--error)", fontWeight: 600 }}>
                      ${refund.refundAmount.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] px-2.5 py-1 rounded capitalize"
                      style={{
                        background: refund.refundType === "full" ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
                        color: refund.refundType === "full" ? "var(--error)" : "var(--warning)",
                      }}
                    >
                      {refund.refundType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: STATUS_CONFIG[refund.status].dot }}
                      />
                      <span
                        className="text-[12px] capitalize"
                        style={{ color: STATUS_CONFIG[refund.status].text }}
                      >
                        {refund.status.replace("_", " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                      {refund.requestDate}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewRefund(refund);
                      }}
                      className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background: "var(--input-background)",
                        border: "1px solid var(--border-light)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Detail Drawer */}
      {drawerOpen && selectedRefund && (
        <RefundDetailDrawer
          refund={selectedRefund}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}

import { useState } from "react";
import {
  DollarSign,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Calendar,
  User,
  ChevronDown,
  X,
} from "lucide-react";

type RefundStatus = "requested" | "under-review" | "approved" | "rejected" | "refunded";

interface RefundDispute {
  id: string;
  refundId: string;
  ticketId: string;
  customer: string;
  bookingRef: string;
  bookingType: string;
  bookingAmount: number;
  refundAmount: number;
  refundType: "full" | "partial";
  reason: string;
  status: RefundStatus;
  requestedOn: string;
  vendorName: string;
  vendorResponse?: string;
  adminDecision?: string;
  paymentStatus: "paid" | "partial" | "unpaid";
}

const SAMPLE_REFUNDS: RefundDispute[] = [
  {
    id: "1",
    refundId: "RF-4521",
    ticketId: "TKT-2451",
    customer: "Priya Sharma",
    bookingRef: "BK-8432",
    bookingType: "Safari Tour",
    bookingAmount: 85000,
    refundAmount: 85000,
    refundType: "full",
    reason: "Family emergency - medical documentation provided",
    status: "approved",
    requestedOn: "Aug 18, 2025",
    vendorName: "Wild Sri Lanka Tours",
    vendorResponse: "Agreed to waive cancellation fee given emergency circumstances",
    adminDecision: "Full refund approved based on medical emergency",
    paymentStatus: "paid",
  },
  {
    id: "2",
    refundId: "RF-4520",
    ticketId: "TKT-2443",
    customer: "David Kim",
    bookingRef: "BK-8401",
    bookingType: "Mountain Tour",
    bookingAmount: 62000,
    refundAmount: 31000,
    refundType: "partial",
    reason: "Tour cancelled due to severe weather conditions",
    status: "refunded",
    requestedOn: "Aug 17, 2025",
    vendorName: "Peak Adventures",
    vendorResponse: "Weather cancellation covered under force majeure - 50% refund approved",
    adminDecision: "Partial refund (50%) as per weather cancellation policy",
    paymentStatus: "paid",
  },
  {
    id: "3",
    refundId: "RF-4519",
    ticketId: "TKT-2439",
    customer: "Marcus Weber",
    bookingRef: "BK-8421",
    bookingType: "Hotel Stay",
    bookingAmount: 120000,
    refundAmount: 120000,
    refundType: "full",
    reason: "Property condition significantly below advertised standards",
    status: "under-review",
    requestedOn: "Aug 16, 2025",
    vendorName: "Ocean View Resort",
    vendorResponse: "Dispute claim - property meets all listed standards",
    paymentStatus: "paid",
  },
  {
    id: "4",
    refundId: "RF-4518",
    ticketId: "TKT-2435",
    customer: "Yuki Tanaka",
    bookingRef: "BK-8398",
    bookingType: "Experience Package",
    bookingAmount: 45000,
    refundAmount: 45000,
    refundType: "full",
    reason: "Vendor no-show - service not provided",
    status: "approved",
    requestedOn: "Aug 15, 2025",
    vendorName: "Cultural Experiences LK",
    adminDecision: "Full refund approved - vendor confirmed no-show incident",
    paymentStatus: "paid",
  },
  {
    id: "5",
    refundId: "RF-4517",
    ticketId: "TKT-2428",
    customer: "Sophie Chen",
    bookingRef: "BK-8385",
    bookingType: "Transport",
    bookingAmount: 8500,
    refundAmount: 8500,
    refundType: "full",
    reason: "Customer cancellation - within free cancellation period",
    status: "refunded",
    requestedOn: "Aug 14, 2025",
    vendorName: "Lanka Transfer Services",
    paymentStatus: "paid",
  },
  {
    id: "6",
    refundId: "RF-4516",
    ticketId: "TKT-2421",
    customer: "Anika Roth",
    bookingRef: "BK-8372",
    bookingType: "Safari Tour",
    bookingAmount: 95000,
    refundAmount: 95000,
    refundType: "full",
    reason: "Late cancellation - outside policy window",
    status: "rejected",
    requestedOn: "Aug 13, 2025",
    vendorName: "Wild Sri Lanka Tours",
    adminDecision: "Cancellation made 1 day before tour - falls under no-refund policy",
    paymentStatus: "paid",
  },
  {
    id: "7",
    refundId: "RF-4515",
    ticketId: "TKT-2415",
    customer: "Tom Eriksson",
    bookingRef: "BK-8361",
    bookingType: "Hotel Stay",
    bookingAmount: 78000,
    refundAmount: 39000,
    refundType: "partial",
    reason: "Check-in delay and amenities not available",
    status: "requested",
    requestedOn: "Aug 12, 2025",
    vendorName: "Beach Paradise Hotel",
    paymentStatus: "paid",
  },
];

const STATUS_CONFIG: Record<RefundStatus, { label: string; bg: string; text: string; icon: React.ComponentType<any> }> = {
  requested: { label: "Requested", bg: "rgba(59,130,246,0.12)", text: "#60a5fa", icon: MessageSquare },
  "under-review": { label: "Under Review", bg: "rgba(251,191,36,0.12)", text: "#fbbf24", icon: Clock },
  approved: { label: "Approved", bg: "rgba(34,197,94,0.12)", text: "#4ade80", icon: CheckCircle },
  rejected: { label: "Rejected", bg: "rgba(239,68,68,0.12)", text: "#f87171", icon: XCircle },
  refunded: { label: "Refunded", bg: "rgba(100,116,139,0.12)", text: "#94a3b8", icon: CheckCircle },
};

function RefundDetailModal({ refund, onClose }: { refund: RefundDispute; onClose: () => void }) {
  const statusCfg = STATUS_CONFIG[refund.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div
        className="w-[650px] rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <div>
            <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: "var(--accent-navy)" }}>
              Refund Request
            </p>
            <p className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {refund.refundId}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-card)", color: "var(--text-tertiary)" }}>
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[600px] overflow-y-auto">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full"
              style={{ background: statusCfg.bg, color: statusCfg.text, border: `1px solid ${statusCfg.text}40` }}
            >
              <statusCfg.icon size={11} />
              {statusCfg.label}
            </span>
            <div className="text-right">
              <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>Requested On</p>
              <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{refund.requestedOn}</p>
            </div>
          </div>

          {/* Customer & Booking */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
              <div className="flex items-center gap-2 mb-3">
                <User size={12} style={{ color: "var(--text-tertiary)" }} />
                <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>Customer</p>
              </div>
              <p className="text-[14px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{refund.customer}</p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Ticket: {refund.ticketId}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={12} style={{ color: "var(--text-tertiary)" }} />
                <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>Booking</p>
              </div>
              <p className="text-[13px] font-mono mb-1" style={{ color: "var(--accent-navy-light)", fontWeight: 600 }}>{refund.bookingRef}</p>
              <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{refund.bookingType}</p>
            </div>
          </div>

          {/* Amounts */}
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
              <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Financial Details</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>Original Amount</span>
                <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  LKR {refund.bookingAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>Refund Amount</span>
                <span className="text-[16px]" style={{ color: "var(--success)", fontWeight: 700 }}>
                  LKR {refund.refundAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border-light)" }}>
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Refund Type</span>
                <span
                  className="text-[11px] px-2 py-0.5 rounded capitalize"
                  style={{
                    background: refund.refundType === "full" ? "rgba(34,197,94,0.12)" : "rgba(251,191,36,0.12)",
                    color: refund.refundType === "full" ? "#4ade80" : "#fbbf24",
                  }}
                >
                  {refund.refundType}
                </span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
            <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>Reason</p>
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{refund.reason}</p>
          </div>

          {/* Vendor */}
          <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
            <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>Vendor</p>
            <p className="text-[13px] mb-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{refund.vendorName}</p>
            {refund.vendorResponse && (
              <>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>Vendor Response:</p>
                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{refund.vendorResponse}</p>
              </>
            )}
          </div>

          {/* Admin Decision */}
          {refund.adminDecision && (
            <div
              className="rounded-xl p-4"
              style={{
                background: refund.status === "approved" ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
                border: `1px solid ${refund.status === "approved" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              }}
            >
              <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>Admin Decision</p>
              <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{refund.adminDecision}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {refund.status === "requested" || refund.status === "under-review" ? (
          <div className="px-6 py-4 flex gap-2" style={{ borderTop: "1px solid var(--border-light)" }}>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-[13px]"
              style={{
                background: "rgba(34,197,94,0.12)",
                color: "#4ade80",
                border: "1px solid rgba(34,197,94,0.25)",
                fontWeight: 600,
              }}
            >
              Approve Refund
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-[13px]"
              style={{
                background: "rgba(239,68,68,0.08)",
                color: "#f87171",
                border: "1px solid rgba(239,68,68,0.2)",
                fontWeight: 600,
              }}
            >
              Reject Request
            </button>
          </div>
        ) : (
          <div className="px-6 py-4" style={{ borderTop: "1px solid var(--border-light)" }}>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg text-[13px]"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function RefundDisputePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RefundStatus | "all">("all");
  const [selectedRefund, setSelectedRefund] = useState<RefundDispute | null>(null);

  const filtered = SAMPLE_REFUNDS.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      r.refundId.toLowerCase().includes(q) ||
      r.customer.toLowerCase().includes(q) ||
      r.bookingRef.toLowerCase().includes(q) ||
      r.vendorName.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s] = SAMPLE_REFUNDS.filter((r) => r.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const stats = {
    totalRequested: SAMPLE_REFUNDS.reduce((sum, r) => sum + r.refundAmount, 0),
    totalRefunded: SAMPLE_REFUNDS.filter((r) => r.status === "refunded").reduce((sum, r) => sum + r.refundAmount, 0),
    pendingReview: SAMPLE_REFUNDS.filter((r) => r.status === "requested" || r.status === "under-review").length,
    approvalRate: Math.round(
      (SAMPLE_REFUNDS.filter((r) => r.status === "approved" || r.status === "refunded").length / SAMPLE_REFUNDS.length) * 100
    ),
  };

  return (
    <div className="p-6 space-y-5 max-w-[1800px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign size={15} style={{ color: "var(--accent-navy)" }} />
          <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>
            Refunds & Disputes
          </span>
        </div>
        <h1 className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Refund Management
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Process refund requests and manage customer disputes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Requested", value: `LKR ${stats.totalRequested.toLocaleString()}`, icon: DollarSign, color: "#3b82f6" },
          { label: "Total Refunded", value: `LKR ${stats.totalRefunded.toLocaleString()}`, icon: CheckCircle, color: "#22c55e" },
          { label: "Pending Review", value: stats.pendingReview, icon: Clock, color: "#fbbf24" },
          { label: "Approval Rate", value: `${stats.approvalRate}%`, icon: RefreshCw, color: "#8b5cf6" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
              {stat.label}
            </p>
            <p className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700, lineHeight: 1 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className="px-3 py-1.5 rounded-lg text-[12px] transition-all"
          style={{
            background: statusFilter === "all" ? "var(--accent-navy)" : "var(--bg-card)",
            color: statusFilter === "all" ? "white" : "var(--text-secondary)",
            border: `1px solid ${statusFilter === "all" ? "transparent" : "var(--border-light)"}`,
            fontWeight: statusFilter === "all" ? 600 : 400,
          }}
        >
          All ({SAMPLE_REFUNDS.length})
        </button>
        {(Object.entries(STATUS_CONFIG) as [RefundStatus, typeof STATUS_CONFIG[RefundStatus]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all"
            style={{
              background: statusFilter === key ? cfg.bg : "var(--bg-card)",
              color: statusFilter === key ? cfg.text : "var(--text-secondary)",
              border: `1px solid ${statusFilter === key ? cfg.text + "40" : "var(--border-light)"}`,
            }}
          >
            <cfg.icon size={11} />
            {cfg.label} ({statusCounts[key] ?? 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative" style={{ maxWidth: 400 }}>
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search refunds, customers, bookings..."
          className="w-full pl-8 pr-3 py-2 rounded-lg text-[13px] outline-none"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
        />
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
      >
        <div
          className="grid text-[11px] uppercase tracking-wider px-5 py-3"
          style={{
            gridTemplateColumns: "90px 150px 1fr 120px 100px 100px 120px 100px 50px",
            borderBottom: "1px solid var(--border-light)",
            color: "var(--text-tertiary)",
            background: "var(--bg-panel)",
          }}
        >
          <div>Refund ID</div>
          <div>Customer</div>
          <div>Booking</div>
          <div>Vendor</div>
          <div>Amount</div>
          <div>Type</div>
          <div>Requested</div>
          <div>Status</div>
          <div></div>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
          {filtered.map((refund) => {
            const statusCfg = STATUS_CONFIG[refund.status];
            return (
              <div
                key={refund.id}
                className="grid items-center px-5 py-3.5 cursor-pointer transition-all"
                style={{ gridTemplateColumns: "90px 150px 1fr 120px 100px 100px 120px 100px 50px" }}
                onClick={() => setSelectedRefund(refund)}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <div className="text-[12px] font-mono" style={{ color: "var(--accent-navy-light)" }}>
                  {refund.refundId}
                </div>

                <div>
                  <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {refund.customer}
                  </p>
                  <p className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>
                    {refund.ticketId}
                  </p>
                </div>

                <div>
                  <p className="text-[12px] font-mono mb-0.5" style={{ color: "var(--accent-navy-light)" }}>
                    {refund.bookingRef}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {refund.bookingType}
                  </p>
                </div>

                <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  {refund.vendorName}
                </div>

                <div className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  LKR {refund.refundAmount.toLocaleString()}
                </div>

                <div>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded capitalize"
                    style={{
                      background: refund.refundType === "full" ? "rgba(34,197,94,0.12)" : "rgba(251,191,36,0.12)",
                      color: refund.refundType === "full" ? "#4ade80" : "#fbbf24",
                    }}
                  >
                    {refund.refundType}
                  </span>
                </div>

                <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  {refund.requestedOn}
                </div>

                <div>
                  <span
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: statusCfg.bg, color: statusCfg.text }}
                  >
                    <statusCfg.icon size={9} />
                    {statusCfg.label}
                  </span>
                </div>

                <div>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: "var(--bg-panel)", color: "var(--text-tertiary)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRefund(refund);
                    }}
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRefund && <RefundDetailModal refund={selectedRefund} onClose={() => setSelectedRefund(null)} />}
    </div>
  );
}

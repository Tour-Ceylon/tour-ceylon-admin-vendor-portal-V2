import { useState } from "react";
import {
  Activity,
  Calendar,
  Building2,
  Layers,
  CreditCard,
  DollarSign,
  Car,
  MessageSquare,
  UserCheck,
  XCircle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Clock,
  User,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

type ActivityType =
  | "booking_created"
  | "booking_cancelled"
  | "vendor_approved"
  | "listing_submitted"
  | "payment_received"
  | "payout_processed"
  | "refund_approved"
  | "support_updated"
  | "transport_confirmed"
  | "listing_updated"
  | "vendor_rejected"
  | "payment_failed";

interface ActivityEvent {
  id: string;
  type: ActivityType;
  user: string;
  role: "admin" | "vendor" | "customer" | "system";
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  status?: "success" | "failed" | "pending";
  metadata?: Record<string, any>;
}

const SAMPLE_ACTIVITIES: ActivityEvent[] = [
  {
    id: "1",
    type: "booking_created",
    user: "Marcus Weber",
    role: "customer",
    action: "created new booking",
    entity: "Safari Tour - BK-8445",
    entityId: "BK-8445",
    timestamp: "2 min ago",
    status: "success",
    metadata: { amount: "LKR 95,000", vendor: "Wild Sri Lanka Tours" },
  },
  {
    id: "2",
    type: "support_updated",
    user: "Sarah Johnson",
    role: "admin",
    action: "escalated support ticket",
    entity: "TKT-2451",
    entityId: "TKT-2451",
    timestamp: "15 min ago",
    status: "pending",
    metadata: { priority: "urgent", category: "Refund Request" },
  },
  {
    id: "3",
    type: "vendor_approved",
    user: "Mike Chen",
    role: "admin",
    action: "approved vendor application",
    entity: "Colombo City Tours",
    entityId: "VND-2142",
    timestamp: "1 hr ago",
    status: "success",
    metadata: { category: "Tour", location: "Colombo" },
  },
  {
    id: "4",
    type: "payment_failed",
    user: "Priya Sharma",
    role: "customer",
    action: "payment failed",
    entity: "BK-8432",
    entityId: "BK-8432",
    timestamp: "2 hr ago",
    status: "failed",
    metadata: { amount: "LKR 85,000", reason: "Insufficient funds" },
  },
  {
    id: "5",
    type: "listing_submitted",
    user: "Jetwing Hotels",
    role: "vendor",
    action: "submitted new listing",
    entity: "Ocean Villa - Premium Suite",
    entityId: "LST-7821",
    timestamp: "3 hr ago",
    status: "pending",
    metadata: { category: "Stay", price: "$380/night" },
  },
  {
    id: "6",
    type: "payout_processed",
    user: "System",
    role: "system",
    action: "processed vendor payout",
    entity: "Payout to Wild Sri Lanka Tours",
    entityId: "PO-3421",
    timestamp: "4 hr ago",
    status: "success",
    metadata: { amount: "LKR 450,000", method: "Bank Transfer" },
  },
  {
    id: "7",
    type: "refund_approved",
    user: "Anna Lee",
    role: "admin",
    action: "approved refund request",
    entity: "RF-4520",
    entityId: "RF-4520",
    timestamp: "5 hr ago",
    status: "success",
    metadata: { amount: "LKR 31,000", booking: "BK-8401" },
  },
  {
    id: "8",
    type: "transport_confirmed",
    user: "Lanka Transfer Services",
    role: "vendor",
    action: "confirmed airport transfer",
    entity: "Transfer Request - TR-1892",
    entityId: "TR-1892",
    timestamp: "6 hr ago",
    status: "success",
    metadata: { route: "Airport → Colombo Hotel", time: "Tomorrow 8:00 AM" },
  },
  {
    id: "9",
    type: "booking_cancelled",
    user: "Yuki Tanaka",
    role: "customer",
    action: "cancelled booking",
    entity: "BK-8425",
    entityId: "BK-8425",
    timestamp: "8 hr ago",
    status: "success",
    metadata: { refund: "Partial - LKR 22,500", reason: "Schedule change" },
  },
  {
    id: "10",
    type: "listing_updated",
    user: "Beach Paradise Hotel",
    role: "vendor",
    action: "updated listing pricing",
    entity: "Deluxe Room - LST-6543",
    entityId: "LST-6543",
    timestamp: "1 day ago",
    status: "success",
    metadata: { oldPrice: "$120", newPrice: "$135" },
  },
];

const TYPE_CONFIG: Record<ActivityType, { icon: React.ComponentType<any>; color: string; bg: string }> = {
  booking_created: { icon: Calendar, color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  booking_cancelled: { icon: XCircle, color: "#f87171", bg: "rgba(239,68,68,0.12)" },
  vendor_approved: { icon: UserCheck, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  vendor_rejected: { icon: XCircle, color: "#f87171", bg: "rgba(239,68,68,0.12)" },
  listing_submitted: { icon: Layers, color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  listing_updated: { icon: Edit, color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  payment_received: { icon: CreditCard, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  payment_failed: { icon: AlertCircle, color: "#f87171", bg: "rgba(239,68,68,0.12)" },
  payout_processed: { icon: DollarSign, color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  refund_approved: { icon: CheckCircle, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  support_updated: { icon: MessageSquare, color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  transport_confirmed: { icon: Car, color: "#0891b2", bg: "rgba(8,145,178,0.12)" },
};

const STATUS_CONFIG = {
  success: { color: "#4ade80", bg: "rgba(34,197,94,0.12)" },
  failed: { color: "#f87171", bg: "rgba(239,68,68,0.12)" },
  pending: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
};

export function ActivityFeedPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "vendor" | "customer" | "system">("all");

  const filtered = SAMPLE_ACTIVITIES.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.action.toLowerCase().includes(q) ||
      a.entity.toLowerCase().includes(q) ||
      a.user.toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || a.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Activity size={15} style={{ color: "var(--accent-navy)" }} />
          <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>
            Activity Feed
          </span>
        </div>
        <h1 className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Marketplace Activity Timeline
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Real-time operational events across the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: "2,847", icon: Activity, color: "#3b82f6" },
          { label: "Today", value: "142", icon: Clock, color: "#10b981" },
          { label: "Active Users", value: "89", icon: User, color: "#8b5cf6" },
          { label: "Trend", value: "+18%", icon: TrendingUp, color: "#22c55e" },
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
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
              {stat.label}
            </p>
            <p className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700, lineHeight: 1 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1" style={{ maxWidth: 350 }}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities..."
            className="w-full pl-8 pr-3 py-2 rounded-lg text-[13px] outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          {(["all", "admin", "vendor", "customer", "system"] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className="px-3 py-1.5 rounded-lg text-[12px] capitalize transition-all"
              style={{
                background: roleFilter === role ? "var(--active-overlay)" : "var(--bg-card)",
                color: roleFilter === role ? "var(--accent-navy-light)" : "var(--text-secondary)",
                border: `1px solid ${roleFilter === role ? "var(--border-accent)" : "var(--border-light)"}`,
              }}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
      >
        <div className="p-6">
          <div className="space-y-4">
            {filtered.map((activity, idx) => {
              const typeCfg = TYPE_CONFIG[activity.type];
              const statusCfg = activity.status ? STATUS_CONFIG[activity.status] : null;

              return (
                <div key={activity.id} className="flex gap-4">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: typeCfg.bg, border: `1px solid ${typeCfg.color}40` }}
                    >
                      <typeCfg.icon size={16} style={{ color: typeCfg.color }} />
                    </div>
                    {idx < filtered.length - 1 && (
                      <div className="w-px flex-1 mt-2" style={{ background: "var(--border-light)", minHeight: 30 }} />
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 pb-4">
                    <div
                      className="rounded-xl p-4 cursor-pointer transition-all"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-card)")}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                            {activity.user}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded uppercase"
                            style={{
                              background: "var(--bg-panel)",
                              color: "var(--text-tertiary)",
                              border: "1px solid var(--border-light)",
                            }}
                          >
                            {activity.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {statusCfg && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded capitalize"
                              style={{ background: statusCfg.bg, color: statusCfg.color }}
                            >
                              {activity.status}
                            </span>
                          )}
                          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            {activity.timestamp}
                          </span>
                        </div>
                      </div>

                      <p className="text-[13px] mb-2" style={{ color: "var(--text-secondary)" }}>
                        {activity.action}{" "}
                        <span style={{ color: "var(--accent-navy-light)", fontWeight: 600 }}>{activity.entity}</span>
                      </p>

                      {activity.metadata && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <div
                              key={key}
                              className="text-[11px] px-2 py-1 rounded"
                              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}
                            >
                              <span style={{ color: "var(--text-tertiary)" }}>{key}:</span>{" "}
                              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

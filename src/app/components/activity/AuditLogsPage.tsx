import { useState } from "react";
import {
  Shield,
  Search,
  Download,
  ChevronDown,
  Eye,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Lock,
  Unlock,
  DollarSign,
  Settings,
  Filter,
} from "lucide-react";

type AuditSeverity = "info" | "warning" | "critical";
type AuditModule = "bookings" | "vendors" | "listings" | "payments" | "users" | "settings" | "transport" | "support";

interface AuditLog {
  id: string;
  user: string;
  role: "admin" | "vendor" | "system";
  action: string;
  module: AuditModule;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
  severity: AuditSeverity;
  timestamp: string;
  success: boolean;
}

const SAMPLE_AUDIT_LOGS: AuditLog[] = [
  {
    id: "1",
    user: "Sarah Johnson",
    role: "admin",
    action: "Approved vendor payout",
    module: "payments",
    entityType: "Payout",
    entityId: "PO-3421",
    oldValue: "pending",
    newValue: "approved",
    ipAddress: "192.168.1.45",
    userAgent: "Chrome 120.0 / macOS",
    severity: "info",
    timestamp: "2024-08-18 14:32:15",
    success: true,
  },
  {
    id: "2",
    user: "Mike Chen",
    role: "admin",
    action: "Updated listing status",
    module: "listings",
    entityType: "Listing",
    entityId: "LST-7821",
    oldValue: "pending",
    newValue: "approved",
    ipAddress: "192.168.1.67",
    userAgent: "Firefox 119.0 / Windows",
    severity: "info",
    timestamp: "2024-08-18 13:45:22",
    success: true,
  },
  {
    id: "3",
    user: "Anna Lee",
    role: "admin",
    action: "Changed commission rate",
    module: "settings",
    entityType: "Commission",
    entityId: "CAT-Safari",
    oldValue: "10%",
    newValue: "12%",
    ipAddress: "192.168.1.89",
    userAgent: "Chrome 120.0 / macOS",
    severity: "warning",
    timestamp: "2024-08-18 12:18:43",
    success: true,
  },
  {
    id: "4",
    user: "System",
    role: "system",
    action: "Failed payment attempt",
    module: "payments",
    entityType: "Payment",
    entityId: "PAY-8945",
    oldValue: "processing",
    newValue: "failed",
    ipAddress: "10.0.0.1",
    userAgent: "System Process",
    severity: "critical",
    timestamp: "2024-08-18 11:52:31",
    success: false,
  },
  {
    id: "5",
    user: "Jetwing Hotels",
    role: "vendor",
    action: "Updated listing pricing",
    module: "listings",
    entityType: "Listing",
    entityId: "LST-6543",
    oldValue: "$120",
    newValue: "$135",
    ipAddress: "203.94.255.42",
    userAgent: "Safari 16.5 / iOS",
    severity: "info",
    timestamp: "2024-08-18 10:23:17",
    success: true,
  },
  {
    id: "6",
    user: "Mike Chen",
    role: "admin",
    action: "Rejected vendor application",
    module: "vendors",
    entityType: "Vendor",
    entityId: "VND-2134",
    oldValue: "pending",
    newValue: "rejected",
    ipAddress: "192.168.1.67",
    userAgent: "Firefox 119.0 / Windows",
    severity: "warning",
    timestamp: "2024-08-18 09:41:09",
    success: true,
  },
  {
    id: "7",
    user: "Sarah Johnson",
    role: "admin",
    action: "Deleted user account",
    module: "users",
    entityType: "User",
    entityId: "USR-4521",
    oldValue: "active",
    newValue: "deleted",
    ipAddress: "192.168.1.45",
    userAgent: "Chrome 120.0 / macOS",
    severity: "critical",
    timestamp: "2024-08-18 08:12:55",
    success: true,
  },
  {
    id: "8",
    user: "System",
    role: "system",
    action: "Auto-cancelled stale booking",
    module: "bookings",
    entityType: "Booking",
    entityId: "BK-8301",
    oldValue: "pending_payment",
    newValue: "cancelled",
    ipAddress: "10.0.0.1",
    userAgent: "System Process",
    severity: "info",
    timestamp: "2024-08-17 23:59:45",
    success: true,
  },
  {
    id: "9",
    user: "Wild Sri Lanka Tours",
    role: "vendor",
    action: "Updated availability calendar",
    module: "listings",
    entityType: "Availability",
    entityId: "LST-5678",
    oldValue: "available",
    newValue: "blocked",
    ipAddress: "203.94.245.18",
    userAgent: "Chrome 120.0 / Android",
    severity: "info",
    timestamp: "2024-08-17 18:34:22",
    success: true,
  },
  {
    id: "10",
    user: "Anna Lee",
    role: "admin",
    action: "Approved refund request",
    module: "support",
    entityType: "Refund",
    entityId: "RF-4520",
    oldValue: "under_review",
    newValue: "approved",
    ipAddress: "192.168.1.89",
    userAgent: "Chrome 120.0 / macOS",
    severity: "warning",
    timestamp: "2024-08-17 16:22:11",
    success: true,
  },
];

const MODULE_CONFIG: Record<AuditModule, { label: string; color: string }> = {
  bookings: { label: "Bookings", color: "#3b82f6" },
  vendors: { label: "Vendors", color: "#8b5cf6" },
  listings: { label: "Listings", color: "#10b981" },
  payments: { label: "Payments", color: "#f59e0b" },
  users: { label: "Users", color: "#ec4899" },
  settings: { label: "Settings", color: "#64748b" },
  transport: { label: "Transport", color: "#0891b2" },
  support: { label: "Support", color: "#f97316" },
};

const SEVERITY_CONFIG = {
  info: { label: "Info", color: "#60a5fa", bg: "rgba(59,130,246,0.12)", icon: CheckCircle },
  warning: { label: "Warning", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", icon: AlertCircle },
  critical: { label: "Critical", color: "#f87171", bg: "rgba(239,68,68,0.12)", icon: AlertCircle },
};

export function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<AuditModule | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | "all">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "vendor" | "system">("all");

  const filtered = SAMPLE_AUDIT_LOGS.filter((log) => {
    const q = search.toLowerCase();
    const matchSearch =
      log.action.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q);
    const matchModule = moduleFilter === "all" || log.module === moduleFilter;
    const matchSeverity = severityFilter === "all" || log.severity === severityFilter;
    const matchRole = roleFilter === "all" || log.role === roleFilter;
    return matchSearch && matchModule && matchSeverity && matchRole;
  });

  return (
    <div className="p-6 space-y-5 max-w-[1800px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={15} style={{ color: "var(--accent-navy)" }} />
          <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>
            Audit Logs
          </span>
        </div>
        <h1 className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Enterprise Audit Trail
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Complete activity tracking and compliance logging
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Logs", value: "18,472", change: "+142", icon: Shield, color: "#3b82f6" },
          { label: "Today", value: "247", change: "+18%", icon: Calendar, color: "#10b981" },
          { label: "Critical Events", value: "8", change: "-3", icon: AlertCircle, color: "#f87171" },
          { label: "Active Admins", value: "12", change: "+2", icon: User, color: "#8b5cf6" },
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
            <div className="flex items-baseline gap-2">
              <p className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700, lineHeight: 1 }}>
                {stat.value}
              </p>
              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1" style={{ minWidth: 280, maxWidth: 400 }}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs, users, actions..."
            className="w-full pl-8 pr-3 py-2 rounded-lg text-[13px] outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Module Filter */}
        <div className="relative">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value as AuditModule | "all")}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-[13px] outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            <option value="all">All Modules</option>
            {Object.entries(MODULE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
        </div>

        {/* Severity Filter */}
        <div className="relative">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as AuditSeverity | "all")}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-[13px] outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "vendor" | "system")}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-[13px] outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="vendor">Vendor</option>
            <option value="system">System</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
        </div>

        {/* Export */}
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] ml-auto"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          <Download size={14} />
          Export Logs
        </button>
      </div>

      {/* Audit Logs Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
      >
        <div
          className="grid text-[11px] uppercase tracking-wider px-5 py-3"
          style={{
            gridTemplateColumns: "140px 120px 1fr 100px 120px 150px 120px 50px",
            borderBottom: "1px solid var(--border-light)",
            color: "var(--text-tertiary)",
            background: "var(--bg-panel)",
          }}
        >
          <div>User</div>
          <div>Action</div>
          <div>Details</div>
          <div>Module</div>
          <div>Severity</div>
          <div>Timestamp</div>
          <div>IP Address</div>
          <div></div>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
          {filtered.map((log) => {
            const moduleCfg = MODULE_CONFIG[log.module];
            const severityCfg = SEVERITY_CONFIG[log.severity];

            return (
              <div
                key={log.id}
                className="grid items-center px-5 py-3.5 cursor-pointer transition-all"
                style={{ gridTemplateColumns: "140px 120px 1fr 100px 120px 150px 120px 50px" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                {/* User */}
                <div>
                  <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {log.user}
                  </p>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded uppercase"
                    style={{ background: "var(--bg-panel)", color: "var(--text-tertiary)" }}
                  >
                    {log.role}
                  </span>
                </div>

                {/* Action */}
                <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  {log.action}
                </div>

                {/* Details */}
                <div>
                  <p className="text-[12px] mb-1" style={{ color: "var(--text-secondary)" }}>
                    {log.entityType} <span style={{ color: "var(--accent-navy-light)", fontWeight: 600 }}>{log.entityId}</span>
                  </p>
                  {log.oldValue && log.newValue && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
                      >
                        {log.oldValue}
                      </span>
                      <span style={{ color: "var(--text-tertiary)" }}>→</span>
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80" }}
                      >
                        {log.newValue}
                      </span>
                    </div>
                  )}
                </div>

                {/* Module */}
                <div>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded"
                    style={{ background: `${moduleCfg.color}15`, color: moduleCfg.color }}
                  >
                    {moduleCfg.label}
                  </span>
                </div>

                {/* Severity */}
                <div>
                  <span
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded"
                    style={{ background: severityCfg.bg, color: severityCfg.color }}
                  >
                    <severityCfg.icon size={10} />
                    {severityCfg.label}
                  </span>
                </div>

                {/* Timestamp */}
                <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  {log.timestamp}
                </div>

                {/* IP Address */}
                <div className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>
                  {log.ipAddress}
                </div>

                {/* Actions */}
                <div>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: "var(--bg-panel)", color: "var(--text-tertiary)" }}
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

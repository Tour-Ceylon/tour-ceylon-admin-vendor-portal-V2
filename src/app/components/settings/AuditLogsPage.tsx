import { FileText, Search, Download, Filter, Shield, User, Settings as SettingsIcon } from "lucide-react";

type LogType = "security" | "settings" | "user" | "finance" | "vendor";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  type: LogType;
  ip: string;
  changes?: { field: string; before: string; after: string }[];
}

export function SystemAuditLogsPage() {
  const auditLogs: AuditLog[] = [
    {
      id: "1",
      timestamp: "2026-05-19 14:32:18",
      user: "Admin User",
      action: "Updated commission rate",
      entity: "System Settings",
      type: "settings",
      ip: "192.168.1.100",
      changes: [{ field: "Commission Rate", before: "15%", after: "12%" }],
    },
    {
      id: "2",
      timestamp: "2026-05-19 13:15:42",
      user: "Finance Admin",
      action: "Processed payout",
      entity: "Vendor #247",
      type: "finance",
      ip: "192.168.1.105",
    },
    {
      id: "3",
      timestamp: "2026-05-19 12:08:35",
      user: "Operations Admin",
      action: "Approved vendor",
      entity: "Vendor Application #142",
      type: "vendor",
      ip: "192.168.1.110",
    },
    {
      id: "4",
      timestamp: "2026-05-19 11:45:22",
      user: "System",
      action: "Failed login attempt",
      entity: "Unknown User",
      type: "security",
      ip: "198.51.100.42",
    },
    {
      id: "5",
      timestamp: "2026-05-19 10:12:58",
      user: "Admin User",
      action: "Created new admin role",
      entity: "Role: Content Moderator",
      type: "user",
      ip: "192.168.1.100",
    },
  ];

  const getTypeStyle = (type: LogType) => {
    switch (type) {
      case "security":
        return { color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
      case "settings":
        return { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" };
      case "user":
        return { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" };
      case "finance":
        return { color: "#22c55e", bg: "rgba(34,197,94,0.1)" };
      case "vendor":
        return { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Audit & System Logs
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Track system changes, user actions, and security events
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-[12px] flex items-center gap-2"
          style={{
            background: "var(--input-background)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-light)",
            fontWeight: 500,
          }}
        >
          <Download size={14} />
          Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Events Today", value: "142", icon: FileText, color: "#3b82f6" },
          { label: "Security Events", value: "8", icon: Shield, color: "#ef4444" },
          { label: "User Changes", value: "24", icon: User, color: "#8b5cf6" },
          { label: "Settings Updates", value: "5", icon: SettingsIcon, color: "#22c55e" },
          { label: "Failed Actions", value: "3", icon: FileText, color: "#f59e0b" },
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
            <p className="text-[22px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {stat.value}
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <input
              type="text"
              placeholder="Search logs by user, action, or entity..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-[13px]"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Type Filter */}
          <select
            className="px-4 py-2 rounded-lg text-[12px]"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
          >
            <option>All Types</option>
            <option>Security</option>
            <option>Settings</option>
            <option>User</option>
            <option>Finance</option>
            <option>Vendor</option>
          </select>

          {/* Date Range */}
          <select
            className="px-4 py-2 rounded-lg text-[12px]"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
          >
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Custom Range</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 1000 }}>
            <thead>
              <tr style={{ background: "var(--input-background)" }}>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Timestamp
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    User
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Action
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Entity
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Type
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    IP Address
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, index) => (
                <tr
                  key={log.id}
                  className="group cursor-pointer transition-all"
                  style={{ borderBottom: index < auditLogs.length - 1 ? "1px solid var(--border-light)" : "none" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <td className="px-5 py-4">
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>
                      {log.timestamp}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {log.user}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                      {log.action}
                    </p>
                    {log.changes && (
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {log.changes[0].field}: {log.changes[0].before} → {log.changes[0].after}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {log.entity}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] capitalize"
                      style={{
                        background: getTypeStyle(log.type).bg,
                        color: getTypeStyle(log.type).color,
                        fontWeight: 600,
                      }}
                    >
                      {log.type}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12px]" style={{ color: "var(--text-tertiary)", fontFamily: "monospace" }}>
                      {log.ip}
                    </span>
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

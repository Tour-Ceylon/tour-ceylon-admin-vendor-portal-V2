import { Lock, Shield, Key, Activity, AlertTriangle, CheckCircle } from "lucide-react";

export function SecuritySettingsPage() {
  const activeSessions = [
    { id: "1", user: "Admin User", location: "Colombo, Sri Lanka", ip: "192.168.1.100", device: "Chrome on macOS", lastActive: "2 minutes ago", current: true },
    { id: "2", user: "Operations Admin", location: "Galle, Sri Lanka", ip: "192.168.1.105", device: "Firefox on Windows", lastActive: "15 minutes ago", current: false },
    { id: "3", user: "Finance Admin", location: "Kandy, Sri Lanka", ip: "192.168.1.112", device: "Safari on iOS", lastActive: "1 hour ago", current: false },
  ];

  const securityEvents = [
    { id: "1", event: "Failed Login Attempt", user: "unknown@email.com", severity: "medium", time: "5 minutes ago" },
    { id: "2", event: "Password Changed", user: "admin@voyage.com", severity: "low", time: "2 hours ago" },
    { id: "3", event: "Multiple Login Failures", user: "suspicious@test.com", severity: "high", time: "3 hours ago" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Security & Access Control
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Manage security policies, sessions, and access controls
        </p>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Sessions", value: "24", icon: Activity, color: "#3b82f6" },
          { label: "Failed Logins (24h)", value: "8", icon: AlertTriangle, color: "#f59e0b" },
          { label: "2FA Enabled", value: "18/25", icon: Shield, color: "#22c55e" },
          { label: "Password Strength", value: "Strong", icon: Key, color: "#10b981" },
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

      {/* Security Settings */}
      <div className="grid grid-cols-2 gap-6">
        {/* Password Policy */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.15)" }}
              >
                <Key size={16} style={{ color: "#3b82f6" }} />
              </div>
              <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Password Policy
              </h2>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: "Minimum Password Length", value: "12 characters" },
              { label: "Require Uppercase", value: true },
              { label: "Require Numbers", value: true },
              { label: "Require Special Characters", value: true },
              { label: "Password Expiry", value: "90 days" },
              { label: "Prevent Password Reuse", value: "Last 5 passwords" },
            ].map((setting, i) => (
              <div key={i}>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  {setting.label}
                </label>
                {typeof setting.value === "boolean" ? (
                  <div
                    className="w-10 h-6 rounded-full relative transition-all"
                    style={{
                      background: setting.value ? "#3b82f6" : "var(--border-medium)",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full absolute top-1 transition-all"
                      style={{
                        background: "white",
                        left: setting.value ? "20px" : "4px",
                      }}
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    defaultValue={setting.value}
                    className="w-full px-3 py-2 rounded-lg text-[13px]"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Session Management */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(16,185,129,0.15)" }}
              >
                <Activity size={16} style={{ color: "#10b981" }} />
              </div>
              <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Session Management
              </h2>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: "Session Timeout", value: "30 minutes" },
              { label: "Maximum Concurrent Sessions", value: "3" },
              { label: "Require Re-authentication", value: "Sensitive actions" },
              { label: "Auto Logout on Inactivity", value: true },
              { label: "Remember Me Duration", value: "30 days" },
              { label: "IP Restriction", value: false },
            ].map((setting, i) => (
              <div key={i}>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  {setting.label}
                </label>
                {typeof setting.value === "boolean" ? (
                  <div
                    className="w-10 h-6 rounded-full relative transition-all"
                    style={{
                      background: setting.value ? "#10b981" : "var(--border-medium)",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full absolute top-1 transition-all"
                      style={{
                        background: "white",
                        left: setting.value ? "20px" : "4px",
                      }}
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    defaultValue={setting.value}
                    className="w-full px-3 py-2 rounded-lg text-[13px]"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Active Sessions
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 800 }}>
            <thead>
              <tr style={{ background: "var(--input-background)" }}>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>User</span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Location</span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Device</span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Last Active</span>
                </th>
                <th className="px-5 py-3 text-right" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {activeSessions.map((session, index) => (
                <tr
                  key={session.id}
                  style={{ borderBottom: index < activeSessions.length - 1 ? "1px solid var(--border-light)" : "none" }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {session.user}
                      </p>
                      {session.current && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded"
                          style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", fontWeight: 600 }}
                        >
                          Current
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[12px] mb-0.5" style={{ color: "var(--text-secondary)" }}>{session.location}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{session.ip}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{session.device}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{session.lastActive}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {!session.current && (
                      <button
                        className="text-[11px] px-3 py-1.5 rounded-lg"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          color: "#f87171",
                          border: "1px solid rgba(239,68,68,0.3)",
                          fontWeight: 500,
                        }}
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Events */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Recent Security Events
          </h2>
        </div>
        <div>
          {securityEvents.map((event, index) => (
            <div
              key={event.id}
              className="px-5 py-4"
              style={{ borderBottom: index < securityEvents.length - 1 ? "1px solid var(--border-light)" : "none" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full`}
                    style={{
                      background: event.severity === "high" ? "#ef4444" : event.severity === "medium" ? "#f59e0b" : "#64748b",
                    }}
                  />
                  <div>
                    <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {event.event}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {event.user} • {event.time}
                    </p>
                  </div>
                </div>
                <div
                  className="px-2.5 py-1 rounded text-[10px] capitalize"
                  style={{
                    background: event.severity === "high" ? "rgba(239,68,68,0.1)" : event.severity === "medium" ? "rgba(245,158,11,0.1)" : "rgba(100,116,139,0.1)",
                    color: event.severity === "high" ? "#f87171" : event.severity === "medium" ? "#fbbf24" : "#94a3b8",
                    fontWeight: 600,
                  }}
                >
                  {event.severity}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          className="px-4 py-2 rounded-lg text-[12px]"
          style={{
            background: "var(--input-background)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-light)",
            fontWeight: 500,
          }}
        >
          Reset Changes
        </button>
        <button
          className="px-4 py-2 rounded-lg text-[12px]"
          style={{
            background: "var(--active-overlay)",
            color: "var(--accent-navy-light)",
            border: "1px solid var(--border-accent)",
            fontWeight: 500,
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

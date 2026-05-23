import { useState } from "react";
import { Search, Plus, Shield, Clock, CheckCircle, MoreHorizontal, Mail } from "lucide-react";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: "active" | "inactive";
}

const ADMINS: Admin[] = [
  {
    id: "adm_001",
    name: "Admin User",
    email: "admin@voyage.com",
    role: "Super Admin",
    lastLogin: "2 hours ago",
    status: "active",
  },
  {
    id: "adm_002",
    name: "Sarah Johnson",
    email: "sarah@voyage.com",
    role: "Content Manager",
    lastLogin: "1 day ago",
    status: "active",
  },
  {
    id: "adm_003",
    name: "Michael Chen",
    email: "michael@voyage.com",
    role: "Vendor Manager",
    lastLogin: "3 days ago",
    status: "active",
  },
];

export function AdminManagement() {
  const [search, setSearch] = useState("");

  const filtered = ADMINS.filter(
    (admin) =>
      admin.name.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Admin Management
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Manage system administrators and their permissions
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] transition-all"
          style={{
            background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
            color: "white",
            boxShadow: "0 0 16px var(--border-accent)",
            border: "1px solid var(--border-accent)",
            fontWeight: 500,
          }}
        >
          <Plus size={14} />
          Add Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Admins", value: ADMINS.length, color: "#3b82f6" },
          { label: "Active", value: ADMINS.filter((a) => a.status === "active").length, color: "#22c55e" },
          { label: "Roles", value: new Set(ADMINS.map((a) => a.role)).size, color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <p className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: "var(--text-tertiary)" }}>
              {label}
            </p>
            <p className="text-[24px]" style={{ color, fontWeight: 700 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 h-9 rounded-lg max-w-md"
        style={{
          background: "var(--input-background)",
          border: "1px solid var(--border-light)",
        }}
      >
        <Search size={14} style={{ color: "var(--text-tertiary)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search admins..."
          className="flex-1 bg-transparent outline-none text-[13px]"
          style={{ color: "var(--text-secondary)" }}
        />
      </div>

      {/* Admin Table */}
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
          className="grid items-center px-5 py-3"
          style={{
            gridTemplateColumns: "2fr 1.5fr 1fr 120px 80px",
            borderBottom: "1px solid var(--border-light)",
            background: "var(--bg-elevated)",
          }}
        >
          {["Admin", "Email", "Role", "Last Login", "Actions"].map((col) => (
            <div key={col}>
              <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                {col}
              </span>
            </div>
          ))}
        </div>

        {/* Table Rows */}
        <div>
          {filtered.map((admin) => (
            <div
              key={admin.id}
              className="grid items-center px-5 py-4 transition-all group"
              style={{
                gridTemplateColumns: "2fr 1.5fr 1fr 120px 80px",
                borderBottom: "1px solid var(--border-light)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {/* Admin */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[12px]"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {admin.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {admin.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: admin.status === "active" ? "var(--success)" : "var(--text-tertiary)" }}
                    />
                    <span className="text-[11px] capitalize" style={{ color: "var(--text-tertiary)" }}>
                      {admin.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail size={12} style={{ color: "var(--text-tertiary)" }} />
                <p className="text-[12px] truncate" style={{ color: "var(--text-secondary)" }}>
                  {admin.email}
                </p>
              </div>

              {/* Role */}
              <div>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px]"
                  style={{
                    background: "var(--active-overlay)",
                    color: "var(--accent-navy-light)",
                    border: "1px solid var(--border-accent)",
                  }}
                >
                  <Shield size={10} />
                  {admin.role}
                </span>
              </div>

              {/* Last Login */}
              <div className="flex items-center gap-1.5">
                <Clock size={11} style={{ color: "var(--text-tertiary)" }} />
                <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  {admin.lastLogin}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center">
                <button
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  }}
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}
        >
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Showing <span style={{ color: "var(--text-secondary)" }}>{filtered.length}</span> of{" "}
            <span style={{ color: "var(--text-secondary)" }}>{ADMINS.length}</span> admins
          </p>
        </div>
      </div>
    </div>
  );
}

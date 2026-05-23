import { Users, Shield, Eye, Edit, UserPlus, Mail, Calendar, Check, X } from "lucide-react";

type Role = "owner" | "admin" | "editor" | "viewer";
type Status = "active" | "invited" | "inactive";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joinedDate: string;
  lastActive: string;
}

export function VendorTeamPage() {
  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "You",
      email: "vendor@example.com",
      role: "owner",
      status: "active",
      joinedDate: "Jan 15, 2025",
      lastActive: "Just now",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "admin",
      status: "active",
      joinedDate: "Mar 10, 2026",
      lastActive: "2 hours ago",
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike@example.com",
      role: "editor",
      status: "invited",
      joinedDate: "May 18, 2026",
      lastActive: "Never",
    },
  ];

  const rolePermissions = {
    owner: {
      label: "Owner",
      description: "Full access to all features and settings",
      color: "#8b5cf6",
      permissions: [
        "Manage all listings",
        "View and manage bookings",
        "Access financial data",
        "Manage team members",
        "Edit account settings",
        "Delete account",
      ],
    },
    admin: {
      label: "Admin",
      description: "Can manage listings and bookings",
      color: "#3b82f6",
      permissions: [
        "Manage all listings",
        "View and manage bookings",
        "Access financial data",
        "Manage team members",
        "Edit account settings",
      ],
    },
    editor: {
      label: "Editor",
      description: "Can edit listings and view bookings",
      color: "#10b981",
      permissions: [
        "Edit listings",
        "View bookings",
        "Respond to reviews",
        "Access analytics",
      ],
    },
    viewer: {
      label: "Viewer",
      description: "Read-only access to view data",
      color: "#64748b",
      permissions: [
        "View listings",
        "View bookings",
        "View reviews",
        "View analytics",
      ],
    },
  };

  const getRoleStyle = (role: Role) => {
    const roleInfo = rolePermissions[role];
    return {
      bg: `${roleInfo.color}15`,
      color: roleInfo.color,
      border: `${roleInfo.color}30`,
    };
  };

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case "active":
        return { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.3)" };
      case "invited":
        return { bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" };
      case "inactive":
        return { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.3)" };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Team Management
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Manage team members and permissions (Coming Soon)
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-[12px] flex items-center gap-2 opacity-50 cursor-not-allowed"
          style={{
            background: "var(--active-overlay)",
            color: "var(--accent-navy-light)",
            border: "1px solid var(--border-accent)",
            fontWeight: 500,
          }}
          disabled
        >
          <UserPlus size={14} />
          Invite Team Member
        </button>
      </div>

      {/* Coming Soon Notice */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--accent-navy-subtle)",
          border: "1px solid var(--border-accent)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(59,130,246,0.2)" }}
          >
            <Users size={18} style={{ color: "var(--accent-navy-light)" }} />
          </div>
          <div>
            <p className="text-[13px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Team Collaboration Feature - Coming Soon
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Team management features will allow you to invite team members, assign roles, and collaborate on managing your listings and bookings. This page demonstrates the UI structure that will be available in a future update.
            </p>
          </div>
        </div>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: "3", icon: Users, color: "#3b82f6" },
          { label: "Active", value: "2", icon: Check, color: "#22c55e" },
          { label: "Pending Invites", value: "1", icon: Mail, color: "#f59e0b" },
          { label: "Roles Defined", value: "4", icon: Shield, color: "#8b5cf6" },
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

      {/* Team Members */}
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
            Team Members
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 800 }}>
            <thead>
              <tr style={{ background: "var(--input-background)" }}>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Member
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Role
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Status
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Joined
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Last Active
                  </span>
                </th>
                <th className="px-5 py-3 text-right" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member, index) => (
                <tr
                  key={member.id}
                  style={{ borderBottom: index < teamMembers.length - 1 ? "1px solid var(--border-light)" : "none" }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] shrink-0"
                        style={{
                          background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                          color: "white",
                          fontWeight: 600,
                        }}
                      >
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                          {member.name}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] capitalize"
                      style={{
                        background: getRoleStyle(member.role).bg,
                        color: getRoleStyle(member.role).color,
                        border: `1px solid ${getRoleStyle(member.role).border}`,
                        fontWeight: 600,
                      }}
                    >
                      <Shield size={10} />
                      {member.role}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] capitalize"
                      style={{
                        background: getStatusStyle(member.status).bg,
                        color: getStatusStyle(member.status).color,
                        border: `1px solid ${getStatusStyle(member.status).border}`,
                        fontWeight: 600,
                      }}
                    >
                      {member.status === "active" && <Check size={10} />}
                      {member.status === "invited" && <Mail size={10} />}
                      {member.status === "inactive" && <X size={10} />}
                      {member.status}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} style={{ color: "var(--text-tertiary)" }} />
                      <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {member.joinedDate}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {member.lastActive}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center opacity-50 cursor-not-allowed"
                        style={{
                          background: "var(--input-background)",
                          border: "1px solid var(--border-light)",
                          color: "var(--text-secondary)",
                        }}
                        disabled
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions */}
      <div>
        <h2 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Role Permissions Reference
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(rolePermissions) as Role[]).map((role) => {
            const roleInfo = rolePermissions[role];
            return (
              <div
                key={role}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-light)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={16} style={{ color: roleInfo.color }} />
                    <h3 className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {roleInfo.label}
                    </h3>
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {roleInfo.description}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <ul className="space-y-2">
                    {roleInfo.permissions.map((permission, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check size={12} style={{ color: roleInfo.color }} />
                        <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                          {permission}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

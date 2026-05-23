import { useState } from "react";
import { Shield, Users, Check, X, Edit, Plus, Search } from "lucide-react";

type Permission = {
  id: string;
  category: string;
  name: string;
  description: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
  color: string;
  userCount: number;
  permissions: string[];
};

export function RolesPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<string>("super-admin");

  const permissions: Permission[] = [
    // Vendor Management
    { id: "vendor.view", category: "Vendor Management", name: "View Vendors", description: "View vendor profiles and listings" },
    { id: "vendor.approve", category: "Vendor Management", name: "Approve Vendors", description: "Approve or reject vendor applications" },
    { id: "vendor.edit", category: "Vendor Management", name: "Edit Vendors", description: "Modify vendor information" },
    { id: "vendor.delete", category: "Vendor Management", name: "Delete Vendors", description: "Remove vendors from platform" },

    // Listing Management
    { id: "listing.view", category: "Listing Management", name: "View Listings", description: "View all listings" },
    { id: "listing.approve", category: "Listing Management", name: "Approve Listings", description: "Approve or reject listing submissions" },
    { id: "listing.edit", category: "Listing Management", name: "Edit Listings", description: "Modify listing details" },
    { id: "listing.delete", category: "Listing Management", name: "Delete Listings", description: "Remove listings" },

    // Booking Management
    { id: "booking.view", category: "Booking Management", name: "View Bookings", description: "View all bookings" },
    { id: "booking.manage", category: "Booking Management", name: "Manage Bookings", description: "Modify booking status" },
    { id: "booking.cancel", category: "Booking Management", name: "Cancel Bookings", description: "Cancel customer bookings" },
    { id: "booking.refund", category: "Booking Management", name: "Process Refunds", description: "Issue refunds to customers" },

    // Finance
    { id: "finance.view", category: "Finance", name: "View Finance", description: "View financial reports" },
    { id: "finance.payouts", category: "Finance", name: "Manage Payouts", description: "Process vendor payouts" },
    { id: "finance.commission", category: "Finance", name: "Edit Commission", description: "Modify commission rates" },
    { id: "finance.refunds", category: "Finance", name: "Process Refunds", description: "Approve refund requests" },

    // Analytics
    { id: "analytics.view", category: "Analytics", name: "View Analytics", description: "Access analytics dashboard" },
    { id: "analytics.export", category: "Analytics", name: "Export Reports", description: "Download analytics reports" },

    // Settings
    { id: "settings.view", category: "Settings", name: "View Settings", description: "Access system settings" },
    { id: "settings.edit", category: "Settings", name: "Edit Settings", description: "Modify platform settings" },
    { id: "settings.security", category: "Settings", name: "Security Settings", description: "Manage security configurations" },

    // Admin Management
    { id: "admin.view", category: "Admin Management", name: "View Admins", description: "View admin users" },
    { id: "admin.create", category: "Admin Management", name: "Create Admins", description: "Add new admin users" },
    { id: "admin.edit", category: "Admin Management", name: "Edit Admins", description: "Modify admin permissions" },
    { id: "admin.delete", category: "Admin Management", name: "Delete Admins", description: "Remove admin users" },

    // Support
    { id: "support.view", category: "Support", name: "View Tickets", description: "View support tickets" },
    { id: "support.manage", category: "Support", name: "Manage Tickets", description: "Respond to support tickets" },
  ];

  const roles: Role[] = [
    {
      id: "super-admin",
      name: "Super Admin",
      description: "Full system access with all permissions",
      color: "#8b5cf6",
      userCount: 2,
      permissions: permissions.map(p => p.id),
    },
    {
      id: "operations-admin",
      name: "Operations Admin",
      description: "Manage vendors, listings, and bookings",
      color: "#3b82f6",
      userCount: 5,
      permissions: [
        "vendor.view", "vendor.approve", "vendor.edit",
        "listing.view", "listing.approve", "listing.edit",
        "booking.view", "booking.manage", "booking.cancel",
        "analytics.view", "support.view", "support.manage",
      ],
    },
    {
      id: "vendor-manager",
      name: "Vendor Manager",
      description: "Manage vendor approvals and relations",
      color: "#10b981",
      userCount: 3,
      permissions: [
        "vendor.view", "vendor.approve", "vendor.edit",
        "listing.view", "listing.approve",
        "support.view", "support.manage",
      ],
    },
    {
      id: "booking-manager",
      name: "Booking Manager",
      description: "Handle booking operations and customer support",
      color: "#f59e0b",
      userCount: 4,
      permissions: [
        "booking.view", "booking.manage", "booking.cancel", "booking.refund",
        "support.view", "support.manage",
        "analytics.view",
      ],
    },
    {
      id: "finance-admin",
      name: "Finance Admin",
      description: "Manage payments, payouts, and financial operations",
      color: "#22c55e",
      userCount: 2,
      permissions: [
        "finance.view", "finance.payouts", "finance.commission", "finance.refunds",
        "booking.view", "vendor.view",
        "analytics.view", "analytics.export",
      ],
    },
    {
      id: "support-admin",
      name: "Support Admin",
      description: "Handle customer and vendor support tickets",
      color: "#06b6d4",
      userCount: 6,
      permissions: [
        "support.view", "support.manage",
        "booking.view", "vendor.view", "listing.view",
      ],
    },
    {
      id: "content-moderator",
      name: "Content Moderator",
      description: "Review and moderate listing content",
      color: "#ec4899",
      userCount: 3,
      permissions: [
        "listing.view", "listing.approve", "listing.edit",
        "vendor.view",
      ],
    },
  ];

  const selectedRoleData = roles.find(r => r.id === selectedRole);
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const hasPermission = (permId: string) => {
    return selectedRoleData?.permissions.includes(permId) || false;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Roles & Permissions
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Manage admin roles and permission assignments
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-[12px] flex items-center gap-2"
          style={{
            background: "var(--active-overlay)",
            color: "var(--accent-navy-light)",
            border: "1px solid var(--border-accent)",
            fontWeight: 500,
          }}
        >
          <Plus size={14} />
          Create Role
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Roles", value: "7", color: "#8b5cf6" },
          { label: "Total Admins", value: "25", color: "#3b82f6" },
          { label: "Permission Groups", value: "8", color: "#10b981" },
          { label: "Active Sessions", value: "18", color: "#22c55e" },
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
                <Shield size={16} style={{ color: stat.color }} />
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

      <div className="grid grid-cols-3 gap-6">
        {/* Roles List */}
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
              Admin Roles
            </h2>
          </div>
          <div>
            {roles.map((role, index) => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className="px-5 py-4 cursor-pointer transition-all"
                style={{
                  background: selectedRole === role.id ? "var(--active-overlay)" : "transparent",
                  borderBottom: index < roles.length - 1 ? "1px solid var(--border-light)" : "none",
                  borderLeft: selectedRole === role.id ? `3px solid ${role.color}` : "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (selectedRole !== role.id) {
                    (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedRole !== role.id) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${role.color}15` }}
                    >
                      <Shield size={14} style={{ color: role.color }} />
                    </div>
                    <div>
                      <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {role.name}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {role.userCount} user{role.userCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Matrix */}
        <div
          className="col-span-2 rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div>
              <h2 className="text-[14px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {selectedRoleData?.name} Permissions
              </h2>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                {selectedRoleData?.permissions.length} of {permissions.length} permissions enabled
              </p>
            </div>
            <button
              className="px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-2"
              style={{
                background: "var(--input-background)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-light)",
                fontWeight: 500,
              }}
            >
              <Edit size={12} />
              Edit Role
            </button>
          </div>

          <div className="p-5 max-h-[600px] overflow-y-auto space-y-5">
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <div key={category}>
                <h3 className="text-[12px] mb-3 uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                  {category}
                </h3>
                <div className="space-y-2">
                  {perms.map((perm) => {
                    const enabled = hasPermission(perm.id);
                    return (
                      <div
                        key={perm.id}
                        className="flex items-start justify-between p-3 rounded-lg"
                        style={{
                          background: "var(--input-background)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        <div className="flex-1">
                          <p className="text-[12px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                            {perm.name}
                          </p>
                          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            {perm.description}
                          </p>
                        </div>
                        <div
                          className="w-10 h-6 rounded-full relative transition-all ml-3 shrink-0"
                          style={{
                            background: enabled ? selectedRoleData?.color : "var(--border-medium)",
                          }}
                        >
                          <div
                            className="w-4 h-4 rounded-full absolute top-1 transition-all flex items-center justify-center"
                            style={{
                              background: "white",
                              left: enabled ? "20px" : "4px",
                            }}
                          >
                            {enabled ? (
                              <Check size={10} style={{ color: selectedRoleData?.color }} />
                            ) : (
                              <X size={10} style={{ color: "var(--text-tertiary)" }} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

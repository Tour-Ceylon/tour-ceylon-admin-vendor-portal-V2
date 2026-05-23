import { useState } from "react";
import {
  X,
  Shield,
  Check,
  CheckCircle,
  Settings,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface PromoteToAdminModalProps {
  user: User;
  onClose: () => void;
}

type AdminRole = "super_admin" | "operations_admin" | "vendor_manager" | "booking_manager" | "finance_admin";

const ADMIN_ROLES: { id: AdminRole; label: string; description: string; icon: any }[] = [
  {
    id: "super_admin",
    label: "Super Admin",
    description: "Full system access and all permissions",
    icon: Shield,
  },
  {
    id: "operations_admin",
    label: "Operations Admin",
    description: "Manage bookings, transport, and operations",
    icon: Settings,
  },
  {
    id: "vendor_manager",
    label: "Vendor Manager",
    description: "Manage vendors, approvals, and listings",
    icon: Users,
  },
  {
    id: "booking_manager",
    label: "Booking Manager",
    description: "Handle bookings, cancellations, and refunds",
    icon: Calendar,
  },
  {
    id: "finance_admin",
    label: "Finance Admin",
    description: "Manage payments, payouts, and revenue",
    icon: DollarSign,
  },
];

const PERMISSIONS = {
  super_admin: [
    "Full system access",
    "User management",
    "Vendor management",
    "Admin management",
    "Financial operations",
    "System settings",
    "All reports and analytics",
  ],
  operations_admin: [
    "Booking management",
    "Transport operations",
    "Support tickets",
    "Operations reports",
  ],
  vendor_manager: [
    "Vendor approvals",
    "Listing reviews",
    "Vendor support",
    "Vendor performance reports",
  ],
  booking_manager: [
    "Booking confirmations",
    "Cancellations",
    "Refund processing",
    "Booking reports",
  ],
  finance_admin: [
    "Payment management",
    "Vendor payouts",
    "Revenue tracking",
    "Financial reports",
  ],
};

export function PromoteToAdminModal({ user, onClose }: PromoteToAdminModalProps) {
  const [selectedRole, setSelectedRole] = useState<AdminRole>("operations_admin");

  const handlePromote = () => {
    // Handle promotion logic
    console.log({
      userId: user.id,
      adminRole: selectedRole,
    });
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease-out" }}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl z-50 max-h-[90vh] overflow-y-auto"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          borderRadius: "16px",
          animation: "scaleIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{
            background: "var(--bg-panel)",
            borderBottom: "1px solid var(--border-light)",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <div>
            <h2 className="text-[18px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              Promote to Admin
            </h2>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {user.name} • {user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-tertiary)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Role Selection */}
            <div>
              <label className="block text-[13px] mb-3" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Select Admin Role *
              </label>
              <div className="space-y-3">
                {ADMIN_ROLES.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left"
                      style={
                        isSelected
                          ? {
                              background: "rgba(239, 68, 68, 0.08)",
                              border: "1px solid rgba(239,68,68,0.3)",
                              boxShadow: "0 0 8px rgba(239,68,68,0.2)",
                            }
                          : {
                              background: "var(--input-background)",
                              border: "1px solid var(--border-light)",
                            }
                      }
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: isSelected ? "rgba(239,68,68,0.15)" : "var(--bg-elevated)",
                        }}
                      >
                        <role.icon
                          size={18}
                          style={{ color: isSelected ? "#ef4444" : "var(--text-tertiary)" }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                          {role.label}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          {role.description}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle size={18} style={{ color: "#ef4444" }} className="shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Permissions Preview */}
            <div>
              <label className="block text-[13px] mb-3" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Assigned Permissions
              </label>
              <div
                className="rounded-lg p-4"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <Shield size={16} style={{ color: "#ef4444" }} />
                  <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {ADMIN_ROLES.find(r => r.id === selectedRole)?.label}
                  </span>
                </div>
                <div className="space-y-2">
                  {PERMISSIONS[selectedRole].map((permission, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: "#22c55e" }} />
                      <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {permission}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div
                className="rounded-lg p-3 mt-4"
                style={{
                  background: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(245,158,11,0.25)",
                }}
              >
                <div className="flex items-start gap-2">
                  <Shield size={14} className="shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                  <div>
                    <p className="text-[11px] mb-1" style={{ color: "#fbbf24", fontWeight: 600 }}>
                      Important
                    </p>
                    <p className="text-[11px]" style={{ color: "#fbbf24" }}>
                      Admin access grants elevated permissions. Ensure this user is authorized for administrative duties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-end gap-3"
          style={{
            borderTop: "1px solid var(--border-light)",
            background: "var(--bg-elevated)",
            borderRadius: "0 0 16px 16px",
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-[12px] transition-all"
            style={{
              background: "var(--input-background)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-light)",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handlePromote}
            className="px-4 py-2.5 rounded-lg text-[12px] transition-all"
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.3)",
              boxShadow: "0 0 12px rgba(239,68,68,0.2)",
              fontWeight: 500,
            }}
          >
            Promote to Admin
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}

import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Building2,
  DollarSign,
  Package,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  role: string;
  status: string;
  joinedDate: string;
  lastLogin: string;
  company?: string;
  vendorCategories?: string[];
  adminRole?: string;
  totalBookings?: number;
  totalSpent?: number;
}

interface UserDetailDrawerProps {
  user: UserData;
  onClose: () => void;
}

export function UserDetailDrawer({ user, onClose }: UserDetailDrawerProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease-out" }}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-[500px] z-50 overflow-y-auto"
        style={{
          background: "var(--bg-main)",
          borderLeft: "1px solid var(--border-light)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
          animation: "slideInRight 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{
            background: "var(--bg-panel)",
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <div>
            <h2 className="text-[18px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              User Profile
            </h2>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {user.id}
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
        <div className="p-6 space-y-5">
          {/* User Info */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Personal Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Name
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {user.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Email
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Phone
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {user.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Country
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {user.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Account Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Role
                </p>
                <p className="text-[13px] capitalize" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {user.role}
                </p>
              </div>
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Status
                </p>
                <p className="text-[13px] capitalize" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {user.status.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Joined
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {user.joinedDate}
                </p>
              </div>
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Last Login
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {user.lastLogin}
                </p>
              </div>
            </div>
          </div>

          {/* Vendor Info */}
          {user.role === "vendor" && user.company && (
            <div
              className="rounded-xl p-5"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Vendor Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Company
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {user.company}
                  </p>
                </div>
                {user.vendorCategories && user.vendorCategories.length > 0 && (
                  <div>
                    <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>
                      Categories
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {user.vendorCategories.map((cat) => (
                        <span
                          key={cat}
                          className="text-[11px] px-2.5 py-1 rounded"
                          style={{
                            background: "var(--active-overlay)",
                            color: "var(--accent-navy-light)",
                            border: "1px solid var(--border-accent)",
                          }}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Info */}
          {user.role === "admin" && user.adminRole && (
            <div
              className="rounded-xl p-5"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Admin Information
              </h3>
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Admin Role
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {user.adminRole}
                </p>
              </div>
            </div>
          )}

          {/* Customer Stats */}
          {user.role === "customer" && user.totalBookings !== undefined && (
            <div
              className="rounded-xl p-5"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Booking Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Total Bookings
                  </p>
                  <p className="text-[18px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                    {user.totalBookings}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Total Spent
                  </p>
                  <p className="text-[18px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                    ${user.totalSpent?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

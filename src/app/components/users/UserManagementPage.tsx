import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  CheckSquare,
  MoreHorizontal,
  Eye,
  UserPlus,
  Shield,
  XCircle,
  Lock,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
  User,
  Users,
  Building2,
  Calendar,
} from "lucide-react";
import { PromoteToVendorModal } from "./PromoteToVendorModal";
import { PromoteToAdminModal } from "./PromoteToAdminModal";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { useCommonActions } from "../../hooks/useCommonActions";
import { FilterModal } from "../shared/FilterModal";

type UserRole = "customer" | "vendor" | "admin";
type UserStatus = "active" | "pending" | "suspended" | "banned" | "incomplete_profile";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  role: UserRole;
  status: UserStatus;
  joinedDate: string;
  lastLogin: string;
  company?: string;
  vendorCategories?: string[];
  adminRole?: string;
  totalBookings?: number;
  totalSpent?: number;
}

const STATUS_CONFIG: Record<UserStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e" },
  pending: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", dot: "#f59e0b" },
  suspended: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444" },
  banned: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8", dot: "#64748b" },
  incomplete_profile: { bg: "rgba(168, 85, 247, 0.1)", text: "#a78bfa", dot: "#8b5cf6" },
};

const ROLE_CONFIG: Record<UserRole, { bg: string; text: string; border: string }> = {
  customer: { bg: "rgba(59, 130, 246, 0.12)", text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  vendor: { bg: "rgba(168, 85, 247, 0.12)", text: "#a78bfa", border: "rgba(168,85,247,0.25)" },
  admin: { bg: "rgba(239, 68, 68, 0.12)", text: "#f87171", border: "rgba(239,68,68,0.25)" },
};

// Sample user data
const SAMPLE_USERS: User[] = [
  {
    id: "USR-001",
    name: "James Wilson",
    email: "james.w@email.com",
    phone: "+94 77 123 4567",
    country: "Sri Lanka",
    role: "customer",
    status: "active",
    joinedDate: "Mar 15, 2026",
    lastLogin: "2 hours ago",
    totalBookings: 12,
    totalSpent: 4520,
  },
  {
    id: "USR-002",
    name: "Rohan Silva",
    email: "rohan@jetwing.com",
    phone: "+94 71 234 5678",
    country: "Sri Lanka",
    role: "vendor",
    status: "active",
    joinedDate: "Jan 10, 2026",
    lastLogin: "1 day ago",
    company: "Jetwing Hotels",
    vendorCategories: ["Stay"],
  },
  {
    id: "USR-003",
    name: "Sarah Chen",
    email: "sarah.c@email.com",
    phone: "+1 555 234 5678",
    country: "USA",
    role: "customer",
    status: "active",
    joinedDate: "May 5, 2026",
    lastLogin: "3 hours ago",
    totalBookings: 3,
    totalSpent: 1250,
  },
  {
    id: "USR-004",
    name: "Priya Perera",
    email: "priya@safaris.lk",
    phone: "+94 76 345 6789",
    country: "Sri Lanka",
    role: "vendor",
    status: "pending",
    joinedDate: "May 18, 2026",
    lastLogin: "5 hours ago",
    company: "Safari Adventures LK",
    vendorCategories: ["Safari", "Tour"],
  },
  {
    id: "USR-005",
    name: "Admin User",
    email: "admin@voyage.com",
    phone: "+94 11 234 5678",
    country: "Sri Lanka",
    role: "admin",
    status: "active",
    joinedDate: "Dec 1, 2025",
    lastLogin: "Just now",
    adminRole: "Super Admin",
  },
  {
    id: "USR-006",
    name: "David Kumar",
    email: "david.k@email.com",
    phone: "+94 75 456 7890",
    country: "India",
    role: "customer",
    status: "suspended",
    joinedDate: "Apr 20, 2026",
    lastLogin: "2 weeks ago",
    totalBookings: 1,
    totalSpent: 85,
  },
  {
    id: "USR-007",
    name: "Emma Thompson",
    email: "emma.t@email.com",
    phone: "+44 20 7123 4567",
    country: "UK",
    role: "customer",
    status: "incomplete_profile",
    joinedDate: "May 19, 2026",
    lastLogin: "6 hours ago",
    totalBookings: 0,
    totalSpent: 0,
  },
  {
    id: "USR-008",
    name: "Kasun Fernando",
    email: "kasun@heritage.lk",
    phone: "+94 77 567 8901",
    country: "Sri Lanka",
    role: "vendor",
    status: "active",
    joinedDate: "Feb 14, 2026",
    lastLogin: "Yesterday",
    company: "Heritage Tours Lanka",
    vendorCategories: ["Tour", "Experience"],
  },
];

export function UserManagementPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [promoteVendorModalOpen, setPromoteVendorModalOpen] = useState(false);
  const [promoteAdminModalOpen, setPromoteAdminModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const { handleExport } = useCommonActions();

  const filterTabs = [
    { id: "all", label: "All Users", count: SAMPLE_USERS.length },
    { id: "customer", label: "Customers", count: SAMPLE_USERS.filter(u => u.role === "customer").length },
    { id: "vendor_applicants", label: "Vendor Applicants", count: SAMPLE_USERS.filter(u => u.role === "vendor" && u.status === "pending").length },
    { id: "vendor", label: "Approved Vendors", count: SAMPLE_USERS.filter(u => u.role === "vendor" && u.status === "active").length },
    { id: "admin", label: "Admins", count: SAMPLE_USERS.filter(u => u.role === "admin").length },
    { id: "suspended", label: "Suspended", count: SAMPLE_USERS.filter(u => u.status === "suspended").length },
  ];

  // Stats
  const stats = {
    totalUsers: SAMPLE_USERS.length,
    customers: SAMPLE_USERS.filter(u => u.role === "customer").length,
    vendors: SAMPLE_USERS.filter(u => u.role === "vendor").length,
    admins: SAMPLE_USERS.filter(u => u.role === "admin").length,
  };

  const filteredUsers = SAMPLE_USERS.filter((user) => {
    let matchRole = false;

    if (filterRole === "all") {
      matchRole = true;
    } else if (filterRole === "vendor_applicants") {
      matchRole = user.role === "vendor" && user.status === "pending";
    } else if (filterRole === "suspended") {
      matchRole = user.status === "suspended";
    } else {
      matchRole = user.role === filterRole;
      if (filterRole === "vendor") {
        matchRole = matchRole && user.status === "active";
      }
    }

    const matchSearch = !search ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(search.toLowerCase()));

    return matchRole && matchSearch;
  });

  const toggleSelect = (id: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setDetailDrawerOpen(true);
  };

  const handlePromoteToVendor = (user: User) => {
    setSelectedUser(user);
    setPromoteVendorModalOpen(true);
  };

  const handlePromoteToAdmin = (user: User) => {
    setSelectedUser(user);
    setPromoteAdminModalOpen(true);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          User Management
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Manage all platform users, customers, vendors, and admins
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.15)" }}
            >
              <Users size={18} style={{ color: "#3b82f6" }} />
            </div>
          </div>
          <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.totalUsers}
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Total Users
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.15)" }}
            >
              <User size={18} style={{ color: "#22c55e" }} />
            </div>
          </div>
          <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.customers}
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Customers
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(168,85,247,0.15)" }}
            >
              <Building2 size={18} style={{ color: "#a78bfa" }} />
            </div>
          </div>
          <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.vendors}
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Vendors
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.15)" }}
            >
              <Shield size={18} style={{ color: "#ef4444" }} />
            </div>
          </div>
          <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.admins}
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Admins
          </p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 h-9 rounded-lg flex-1 max-w-sm"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
          }}
        >
          <Search size={14} style={{ color: "var(--text-tertiary)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, company..."
            className="flex-1 bg-transparent outline-none text-[12px]"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* Filter */}
        <button
          onClick={() => setFilterModalOpen(true)}
          className="flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] transition-all"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          <Filter size={13} />
          More Filters
        </button>

        <div className="flex-1" />

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            {selectedUsers.size} selected
          </span>
        )}

        {/* Export */}
        <button
          onClick={() => handleExport("Users", filteredUsers)}
          className="flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] transition-all"
          style={{
            background: "var(--active-overlay)",
            color: "var(--accent-navy-light)",
            border: "1px solid var(--border-accent)",
          }}
        >
          <Download size={13} />
          Export Users
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {filterTabs.map((tab) => {
          const isActive = filterRole === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              className="px-3.5 py-2 rounded-lg text-[12px] transition-all whitespace-nowrap"
              style={
                isActive
                  ? {
                      background: "var(--active-overlay)",
                      color: "var(--accent-navy-light)",
                      border: "1px solid var(--border-accent)",
                      boxShadow: "0 0 8px var(--border-accent)",
                    }
                  : {
                      background: "var(--input-background)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-light)",
                    }
              }
            >
              {tab.label}
              <span
                className="ml-2 px-1.5 py-0.5 rounded text-[10px]"
                style={{
                  background: isActive ? "rgba(255,255,255,0.1)" : "var(--bg-elevated)",
                  color: isActive ? "var(--accent-navy-light)" : "var(--text-tertiary)",
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Users Table */}
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
          className="grid items-center px-4 py-3"
          style={{
            gridTemplateColumns: "36px 180px 200px 130px 100px 100px 110px 110px 110px 80px",
            borderBottom: "1px solid var(--border-light)",
            background: "var(--bg-elevated)",
          }}
        >
          <button onClick={toggleSelectAll} className="flex items-center justify-center">
            <div
              className="w-4 h-4 rounded flex items-center justify-center"
              style={{
                border: selectedUsers.size === filteredUsers.length && filteredUsers.length > 0
                  ? "1.5px solid var(--accent-navy)"
                  : "1.5px solid var(--border-medium)",
                background: selectedUsers.size === filteredUsers.length && filteredUsers.length > 0
                  ? "var(--accent-navy)"
                  : "transparent",
              }}
            >
              {selectedUsers.size === filteredUsers.length && filteredUsers.length > 0 && (
                <CheckSquare size={10} className="text-white" />
              )}
            </div>
          </button>
          {["User Name", "Email", "Phone", "Country", "Role", "Status", "Joined", "Last Login", "Actions"].map((col) => (
            <div key={col} className="flex items-center gap-1">
              <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                {col}
              </span>
            </div>
          ))}
        </div>

        {/* Table Rows */}
        <div>
          {filteredUsers.map((user, i) => {
            const isSelected = selectedUsers.has(user.id);
            const statusConfig = STATUS_CONFIG[user.status];
            const roleConfig = ROLE_CONFIG[user.role];

            return (
              <div
                key={user.id}
                className="grid items-center px-4 py-3 transition-all group cursor-pointer"
                style={{
                  gridTemplateColumns: "36px 180px 200px 130px 100px 100px 110px 110px 110px 80px",
                  borderBottom: i < filteredUsers.length - 1 ? "1px solid var(--border-light)" : "none",
                  background: isSelected ? "var(--active-overlay)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
                onClick={() => handleViewUser(user)}
              >
                {/* Checkbox */}
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleSelect(user.id)}
                    className="w-4 h-4 rounded flex items-center justify-center"
                    style={{
                      border: isSelected ? "1.5px solid var(--accent-navy)" : "1.5px solid var(--border-medium)",
                      background: isSelected ? "var(--accent-navy)" : "transparent",
                    }}
                  >
                    {isSelected && <CheckSquare size={10} className="text-white" />}
                  </button>
                </div>

                {/* Name */}
                <div className="min-w-0">
                  <p className="text-[13px] truncate" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {user.name}
                  </p>
                  {user.company && (
                    <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>
                      {user.company}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="min-w-0">
                  <p className="text-[12px] truncate" style={{ color: "var(--text-secondary)" }}>
                    {user.email}
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {user.phone}
                  </p>
                </div>

                {/* Country */}
                <div>
                  <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {user.country}
                  </p>
                </div>

                {/* Role */}
                <div>
                  <span
                    className="inline-flex items-center px-2 py-1 rounded text-[11px]"
                    style={{
                      background: roleConfig.bg,
                      color: roleConfig.text,
                      border: `1px solid ${roleConfig.border}`,
                    }}
                  >
                    {user.role}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px]"
                    style={{
                      background: statusConfig.bg,
                      color: statusConfig.text,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: statusConfig.dot, boxShadow: `0 0 4px ${statusConfig.dot}` }}
                    />
                    {user.status.replace("_", " ")}
                  </span>
                </div>

                {/* Joined */}
                <div>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {user.joinedDate}
                  </p>
                </div>

                {/* Last Login */}
                <div>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {user.lastLogin}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <div className="relative group/actions">
                    <button
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <MoreHorizontal size={13} />
                    </button>

                    {/* Action Menu */}
                    <div
                      className="absolute right-0 top-full mt-1 w-48 rounded-xl overflow-hidden z-50 opacity-0 invisible group-hover/actions:opacity-100 group-hover/actions:visible transition-all"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-accent)",
                        boxShadow: "var(--shadow-lg)",
                      }}
                    >
                      <button
                        onClick={() => handleViewUser(user)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] transition-all text-left"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                        }}
                      >
                        <Eye size={12} />
                        View Profile
                      </button>
                      {user.role === "customer" && (
                        <>
                          <button
                            onClick={() => handlePromoteToVendor(user)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] transition-all text-left"
                            style={{ color: "var(--text-secondary)" }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "transparent";
                            }}
                          >
                            <UserPlus size={12} />
                            Promote to Vendor
                          </button>
                          <button
                            onClick={() => handlePromoteToAdmin(user)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] transition-all text-left"
                            style={{ color: "var(--text-secondary)" }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "transparent";
                            }}
                          >
                            <Shield size={12} />
                            Promote to Admin
                          </button>
                        </>
                      )}
                      <div style={{ borderTop: "1px solid var(--border-light)" }}>
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-[11px] transition-all text-left"
                          style={{ color: "#f59e0b" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                          }}
                        >
                          <XCircle size={12} />
                          Suspend User
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-[11px] transition-all text-left"
                          style={{ color: "#ef4444" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                          }}
                        >
                          <Ban size={12} />
                          Ban User
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}
        >
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Showing <span style={{ color: "var(--text-secondary)" }}>{filteredUsers.length}</span> of{" "}
            <span style={{ color: "var(--text-secondary)" }}>{SAMPLE_USERS.length}</span> users
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] transition-all"
                style={
                  p === 1
                    ? { background: "var(--active-overlay)", color: "var(--accent-navy-light)", border: "1px solid var(--border-accent)" }
                    : { color: "var(--text-tertiary)" }
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {promoteVendorModalOpen && selectedUser && (
        <PromoteToVendorModal
          user={selectedUser}
          onClose={() => setPromoteVendorModalOpen(false)}
        />
      )}

      {promoteAdminModalOpen && selectedUser && (
        <PromoteToAdminModal
          user={selectedUser}
          onClose={() => setPromoteAdminModalOpen(false)}
        />
      )}

      {detailDrawerOpen && selectedUser && (
        <UserDetailDrawer
          user={selectedUser}
          onClose={() => setDetailDrawerOpen(false)}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={(filters) => {
          console.log("Filters applied:", filters);
        }}
        filters={[
          {
            id: "status",
            label: "Account Status",
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
              { value: "suspended", label: "Suspended" },
              { value: "banned", label: "Banned" },
            ],
          },
          {
            id: "country",
            label: "Country",
            type: "text",
            placeholder: "Enter country name",
          },
          {
            id: "joinedFrom",
            label: "Joined From",
            type: "date",
          },
          {
            id: "joinedTo",
            label: "Joined To",
            type: "date",
          },
        ]}
      />
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Building2,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  Download,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Search,
  Shield,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { useCommonActions } from "../../hooks/useCommonActions";
import { FilterModal } from "../shared/FilterModal";
import { apiFetch } from "../api/apiClient";

type UserRole = "tourist" | "vendor" | "admin" | "support";
type UserStatus = "active" | "pending" | "suspended" | "incomplete_profile";
type FilterRole = "all" | "tourist" | "vendor_applicants" | "vendor" | "admin" | "support" | "suspended";

interface ApiUser {
  id: string;
  email: string;
  full_name: string | null;
  name?: string | null;
  country: string | null;
  role: UserRole | string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  vendor_status: string | null;
  vendorStatus?: string | null;
  approved_categories: string[] | null;
  approvedCategories?: string[] | null;
  company_name: string | null;
  company?: string | null;
  business_profile: Record<string, unknown> | null;
  businessProfile?: Record<string, unknown> | null;
}

interface UserListResponse {
  users: ApiUser[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface UiUser {
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
  raw: ApiUser;
}

interface UserSearchRequest {
  email?: string;
  role?: Exclude<UserRole, "tourist"> | UserRole;
  is_active?: boolean;
  vendor_status?: string;
  page: number;
  per_page: number;
}

const STATUS_CONFIG: Record<UserStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e" },
  pending: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", dot: "#f59e0b" },
  suspended: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444" },
  incomplete_profile: { bg: "rgba(168, 85, 247, 0.1)", text: "#a78bfa", dot: "#8b5cf6" },
};

// Unified status options for all users
type DropdownStatusValue = "pending" | "approved" | "suspended";
const DROPDOWN_STATUS_CONFIG: Record<DropdownStatusValue, { bg: string; text: string; border: string; label: string }> = {
  pending:   { bg: "rgba(245,158,11,0.12)",  text: "#fbbf24", border: "rgba(245,158,11,0.3)",  label: "waiting for approve" },
  approved:  { bg: "rgba(34,197,94,0.12)",   text: "#4ade80", border: "rgba(34,197,94,0.3)",   label: "approved" },
  suspended: { bg: "rgba(249,115,22,0.12)",  text: "#fb923c", border: "rgba(249,115,22,0.3)",  label: "suspended" },
};

const ROLE_CONFIG: Record<UserRole, { bg: string; text: string; border: string; label: string }> = {
  tourist: { bg: "rgba(59, 130, 246, 0.12)", text: "#60a5fa", border: "rgba(59,130,246,0.25)", label: "customer" },
  vendor: { bg: "rgba(168, 85, 247, 0.12)", text: "#a78bfa", border: "rgba(168,85,247,0.25)", label: "vendor" },
  admin: { bg: "rgba(239, 68, 68, 0.12)", text: "#f87171", border: "rgba(239,68,68,0.25)", label: "admin" },
  support: { bg: "rgba(8, 145, 178, 0.12)", text: "#22d3ee", border: "rgba(8,145,178,0.25)", label: "support" },
};

function normalizeRole(role: string): UserRole {
  const value = role.toLowerCase();
  if (value === "customer") return "tourist";
  if (value === "vendor" || value === "admin" || value === "support" || value === "tourist") return value;
  return "tourist";
}

function userStatus(user: ApiUser): UserStatus {
  if (!user.is_active) return "suspended";
  const vs = user.vendor_status || user.vendorStatus;
  const role = normalizeRole(String(user.role));
  if (role === "vendor" && vs === "suspended") return "suspended";
  if (role === "vendor" && vs === "pending") return "pending";
  if (!user.full_name && !user.name) return "incomplete_profile";
  return "active";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function mapUser(user: ApiUser): UiUser {
  const profile = user.business_profile || user.businessProfile || {};
  const role = normalizeRole(String(user.role));
  const categories = user.approved_categories || user.approvedCategories || [];

  return {
    id: user.id,
    name: user.full_name || user.name || user.email.split("@")[0],
    email: user.email,
    phone: typeof profile.phone === "string" ? profile.phone : "Not provided",
    country: user.country || "Not provided",
    role,
    status: userStatus(user),
    joinedDate: formatDate(user.created_at),
    lastLogin: formatDate(user.updated_at),
    company: user.company_name || user.company || undefined,
    vendorCategories: categories,
    adminRole: role === "admin" ? "Admin" : role === "support" ? "Support" : undefined,
    totalBookings: 0,
    totalSpent: 0,
    raw: user,
  };
}

function apiRole(role: UserRole) {
  return role;
}

export function UserManagementPage() {
  const [users, setUsers] = useState<UiUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<UiUser | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { handleExport } = useCommonActions();

  const loadUsers = async (searchValue: string, roleFilter: FilterRole) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload: UserSearchRequest = {
        page: 1,
        per_page: 100,
      };

      const trimmedSearch = searchValue.trim();
      if (trimmedSearch) {
        payload.email = trimmedSearch;
      }

      if (roleFilter === "tourist" || roleFilter === "vendor" || roleFilter === "admin" || roleFilter === "support") {
        payload.role = roleFilter;
      }
      if (roleFilter === "vendor_applicants") {
        payload.role = "vendor";
        payload.vendor_status = "pending";
      }
      if (roleFilter === "suspended") {
        payload.is_active = false;
      }

      const response = await apiFetch<UserListResponse>("/users/search", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setUsers(response.users.map(mapUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load real users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUsers(search, filterRole);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [filterRole, search]);

  const stats = useMemo(
    () => ({
      totalUsers: users.length,
      customers: users.filter((user) => user.role === "tourist").length,
      vendors: users.filter((user) => user.role === "vendor").length,
      admins: users.filter((user) => user.role === "admin" || user.role === "support").length,
    }),
    [users]
  );

  const filterTabs = [
    { id: "all" as const, label: "All Users", count: users.length },
    { id: "tourist" as const, label: "Customers", count: users.filter((user) => user.role === "tourist").length },
    { id: "vendor_applicants" as const, label: "Vendor Applicants", count: users.filter((user) => user.role === "vendor" && user.status === "pending").length },
    { id: "vendor" as const, label: "Approved Vendors", count: users.filter((user) => user.role === "vendor" && user.status === "active").length },
    { id: "admin" as const, label: "Admins", count: users.filter((user) => user.role === "admin").length },
    { id: "support" as const, label: "Support", count: users.filter((user) => user.role === "support").length },
    { id: "suspended" as const, label: "Suspended", count: users.filter((user) => user.status === "suspended").length },
  ];

  const filteredUsers = users.filter((user) => {
    let matchRole = false;
    if (filterRole === "all") matchRole = true;
    else if (filterRole === "vendor_applicants") matchRole = user.role === "vendor" && user.status === "pending";
    else if (filterRole === "suspended") matchRole = user.status === "suspended";
    else if (filterRole === "vendor") matchRole = user.role === "vendor" && user.status === "active";
    else matchRole = user.role === filterRole;

    const query = search.trim().toLowerCase();
    const matchSearch =
      !query ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.country.toLowerCase().includes(query) ||
      (user.company && user.company.toLowerCase().includes(query));

    return matchRole && matchSearch;
  });

  const toggleSelect = (id: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) setSelectedUsers(new Set());
    else setSelectedUsers(new Set(filteredUsers.map((user) => user.id)));
  };

  const handleViewUser = (user: UiUser) => {
    setSelectedUser(user);
    setDetailDrawerOpen(true);
  };

  const updateUser = async (user: UiUser, payload: Record<string, unknown>) => {
    setIsUpdating(user.id);
    setError(null);
    try {
      await apiFetch(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      await loadUsers(search, filterRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update user.");
    } finally {
      setIsUpdating(null);
    }
  };

  const changeRole = async (user: UiUser, role: UserRole) => {
    const payload: Record<string, any> = {
      role: apiRole(role),
      vendor_status: role === "vendor" ? user.raw.vendor_status || "pending" : user.raw.vendor_status,
    };
    if (role === "vendor") {
      const currentCats = user.vendorCategories || [];
      if (currentCats.length === 0) {
        payload.approved_categories = ["Stay", "Tour", "Safari", "Experience", "Transfer"];
      }
    }
    await updateUser(user, payload);
  };

  const changeDropdownStatus = async (user: UiUser, status: DropdownStatusValue) => {
    // Update both vendor_status (for the 3-state label) and is_active (to actually block/allow login)
    const payload: Record<string, any> = { 
      vendor_status: status,
      is_active: status !== "suspended" 
    };
    if (status === "approved" && user.role === "vendor") {
      const currentCats = user.vendorCategories || [];
      if (currentCats.length === 0) {
        payload.approved_categories = ["Stay", "Tour", "Safari", "Experience", "Transfer"];
      }
    }
    await updateUser(user, payload);
  };

  const toggleActive = async (user: UiUser) => {
    setIsUpdating(user.id);
    setError(null);
    try {
      await apiFetch(`/users/${user.id}/${user.raw.is_active ? "deactivate" : "activate"}`, {
        method: "PATCH",
      });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change user status.");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          User Management
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Manage real platform users, DB roles, vendor status, and account access
        </p>
      </div>

      {error && (
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          <AlertTriangle size={16} />
          <span className="text-[13px]" style={{ fontWeight: 600 }}>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Users size={18} style={{ color: "#3b82f6" }} />} label="Total Users" value={stats.totalUsers} bg="rgba(59,130,246,0.15)" />
        <StatCard icon={<User size={18} style={{ color: "#22c55e" }} />} label="Customers" value={stats.customers} bg="rgba(34,197,94,0.15)" />
        <StatCard icon={<Building2 size={18} style={{ color: "#a78bfa" }} />} label="Vendors" value={stats.vendors} bg="rgba(168,85,247,0.15)" />
        <StatCard icon={<Shield size={18} style={{ color: "#ef4444" }} />} label="Admins & Support" value={stats.admins} bg="rgba(239,68,68,0.15)" />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 h-9 rounded-lg flex-1 max-w-sm" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
          <Search size={14} style={{ color: "var(--text-tertiary)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, country, company..."
            className="flex-1 bg-transparent outline-none text-[12px]"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        <button
          onClick={() => setFilterModalOpen(true)}
          className="flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] transition-all"
          style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
        >
          <Filter size={13} />
          More Filters
        </button>

        <div className="flex-1" />

        {selectedUsers.size > 0 && (
          <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            {selectedUsers.size} selected
          </span>
        )}

        <button
          onClick={() => handleExport("Users", filteredUsers)}
          className="flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] transition-all"
          style={{ background: "var(--active-overlay)", color: "var(--accent-navy-light)", border: "1px solid var(--border-accent)" }}
        >
          <Download size={13} />
          Export Users
        </button>
      </div>

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
                  ? { background: "var(--active-overlay)", color: "var(--accent-navy-light)", border: "1px solid var(--border-accent)", boxShadow: "0 0 8px var(--border-accent)" }
                  : { background: "var(--input-background)", color: "var(--text-secondary)", border: "1px solid var(--border-light)" }
              }
            >
              {tab.label}
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px]" style={{ background: isActive ? "rgba(255,255,255,0.1)" : "var(--bg-elevated)", color: isActive ? "var(--accent-navy-light)" : "var(--text-tertiary)" }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}>
        <div className="grid items-center px-4 py-3" style={{ gridTemplateColumns: "36px 190px 230px 130px 120px 110px 120px 110px 110px", borderBottom: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}>
          <button onClick={toggleSelectAll} className="flex items-center justify-center">
            <CheckboxIcon checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0} />
          </button>
          {["User Name", "Email", "Country", "Role", "Status", "Joined", "Updated", "Actions"].map((col) => (
            <div key={col} className="flex items-center gap-1">
              <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>{col}</span>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="p-10 flex items-center justify-center gap-3">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-[13px]" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Loading real users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>No users found.</div>
        ) : (
          filteredUsers.map((user, i) => {
            const isSelected = selectedUsers.has(user.id);
            const statusConfig = STATUS_CONFIG[user.status];
            const roleConfig = ROLE_CONFIG[user.role];
            const busy = isUpdating === user.id;

            return (
              <div
                key={user.id}
                className="grid items-center px-4 py-3 transition-all group cursor-pointer"
                style={{ gridTemplateColumns: "36px 190px 230px 130px 120px 110px 120px 110px 110px", borderBottom: i < filteredUsers.length - 1 ? "1px solid var(--border-light)" : "none", background: isSelected ? "var(--active-overlay)" : "transparent" }}
                onClick={() => handleViewUser(user)}
              >
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => toggleSelect(user.id)}>
                    <CheckboxIcon checked={isSelected} />
                  </button>
                </div>

                <div className="min-w-0">
                  <p className="text-[13px] truncate" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{user.name}</p>
                  {user.company && <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>{user.company}</p>}
                </div>

                <p className="text-[12px] truncate" style={{ color: "var(--text-secondary)" }}>{user.email}</p>
                <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{user.country}</p>

                <select
                  value={user.role}
                  disabled={busy}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => changeRole(user, e.target.value as UserRole)}
                  className="h-8 rounded-lg px-2 text-[11px] outline-none"
                  style={{ background: roleConfig.bg, color: roleConfig.text, border: `1px solid ${roleConfig.border}`, fontWeight: 700 }}
                >
                  <option value="tourist">customer</option>
                  <option value="vendor">vendor</option>
                  <option value="admin">admin</option>
                  <option value="support">support</option>
                </select>

                {/* STATUS — all users get the same 3-option dropdown */}
                <div onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    // Treat null/empty as "approved" for non-vendors, or "pending" for vendors
                    let rawVs = (user.raw.vendor_status || user.raw.vendorStatus) as string;
                    if (!rawVs) {
                      rawVs = user.role === "vendor" ? "pending" : "approved";
                    }
                    if (user.raw.is_active === false) rawVs = "suspended";

                    const vs: DropdownStatusValue = ["pending", "approved", "suspended"].includes(rawVs) 
                      ? (rawVs as DropdownStatusValue) 
                      : "pending";
                    const vsCfg = DROPDOWN_STATUS_CONFIG[vs];

                    return (
                      <div
                        className="relative inline-flex items-center h-7 rounded-full"
                        style={{ background: vsCfg.bg, opacity: busy ? 0.65 : 1 }}
                      >
                        <span
                          className="absolute left-2 w-1.5 h-1.5 rounded-full pointer-events-none"
                          style={{ background: vsCfg.text, boxShadow: `0 0 4px ${vsCfg.text}` }}
                        />
                        <select
                          value={vs}
                          disabled={busy}
                          onChange={(e) => changeDropdownStatus(user, e.target.value as DropdownStatusValue)}
                          className="h-7 w-[130px] rounded-full text-[10px] outline-none cursor-pointer"
                          style={{
                            appearance: "none",
                            WebkitAppearance: "none",
                            background: "transparent",
                            border: `1px solid ${vsCfg.border}`,
                            color: vsCfg.text,
                            paddingLeft: 18,
                            paddingRight: 6,
                            fontWeight: 600,
                          }}
                          aria-label={`Change status for ${user.name}`}
                        >
                          <option value="pending">waiting for approve</option>
                          <option value="approved">approved</option>
                          <option value="suspended">suspended</option>
                        </select>
                        <ChevronDown size={9} className="absolute right-1.5 pointer-events-none" style={{ color: vsCfg.text }} />
                      </div>
                    );
                  })()}
                </div>

                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{user.joinedDate}</p>
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{user.lastLogin}</p>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleViewUser(user)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
                    <Eye size={13} />
                  </button>
                  <button onClick={() => toggleActive(user)} disabled={busy} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: user.raw.is_active ? "#f59e0b" : "#22c55e" }}>
                    {busy ? <Loader2 size={13} className="animate-spin" /> : user.raw.is_active ? <Ban size={13} /> : <CheckCircle size={13} />}
                  </button>
                  <MoreHorizontal size={13} style={{ color: "var(--text-tertiary)" }} />
                </div>
              </div>
            );
          })
        )}

        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Showing <span style={{ color: "var(--text-secondary)" }}>{filteredUsers.length}</span> of <span style={{ color: "var(--text-secondary)" }}>{users.length}</span> real users
          </p>
        </div>
      </div>

      {detailDrawerOpen && selectedUser && (
        <UserDetailDrawer user={{ ...selectedUser, role: ROLE_CONFIG[selectedUser.role].label }} onClose={() => setDetailDrawerOpen(false)} />
      )}

      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={(filters) => console.log("Filters applied:", filters)}
        filters={[
          { id: "status", label: "Account Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "pending", label: "Pending" }, { value: "suspended", label: "Suspended" }] },
          { id: "country", label: "Country", type: "text", placeholder: "Enter country name" },
          { id: "joinedFrom", label: "Joined From", type: "date" },
          { id: "joinedTo", label: "Joined To", type: "date" },
        ]}
      />
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>{icon}</div>
      <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>{value}</p>
      <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{label}</p>
    </div>
  );
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <div className="w-4 h-4 rounded flex items-center justify-center" style={{ border: checked ? "1.5px solid var(--accent-navy)" : "1.5px solid var(--border-medium)", background: checked ? "var(--accent-navy)" : "transparent" }}>
      {checked && <CheckSquare size={10} className="text-white" />}
    </div>
  );
}

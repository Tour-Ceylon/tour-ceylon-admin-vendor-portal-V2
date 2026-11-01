import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  FileText,
  Mail,
  Phone,
  Building2,
  ChevronDown,
  RefreshCw,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { FilterModal } from "./shared/FilterModal";
import { PromptModal } from "./shared/PromptModal";
import { ConfirmModal } from "./shared/Modal";
import { apiFetch } from "./api/apiClient";
import { useToast } from "./shared/Toast";

type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

interface ApiUser {
  id: string;
  email: string;
  full_name: string | null;
  name?: string | null;
  country: string | null;
  role: string;
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

interface Vendor {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  categories: string[];
  status: VendorStatus;
  dateApplied: string;
  hasDocuments: boolean;
  raw: ApiUser;
}

const STATUS_COLORS: Record<VendorStatus, { bg: string; text: string; dot: string; icon: React.ComponentType<any> }> = {
  pending: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", dot: "#f59e0b", icon: Clock },
  approved: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e", icon: CheckCircle },
  rejected: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444", icon: XCircle },
  suspended: { bg: "rgba(156, 163, 175, 0.1)", text: "#9ca3af", dot: "#6b7280", icon: AlertTriangle },
};

function formatDate(value?: string | null): string {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function mapUserToVendor(user: ApiUser): Vendor {
  const profile = (user.business_profile || user.businessProfile || {}) as Record<string, any>;
  const categories = user.approved_categories || user.approvedCategories || [];

  let status: VendorStatus = "pending";
  const vs = (user.vendor_status || user.vendorStatus || "").toLowerCase();
  if (vs === "approved") {
    status = user.is_active ? "approved" : "suspended";
  } else if (vs === "rejected") {
    status = "rejected";
  } else if (vs === "suspended" || !user.is_active) {
    status = "suspended";
  } else if (vs === "pending") {
    status = "pending";
  } else {
    status = user.is_active ? "approved" : "pending";
  }

  const hasDocuments = Boolean(
    profile.documents ||
    profile.license ||
    profile.br_number ||
    profile.business_registration ||
    profile.registration_number ||
    profile.tax_id ||
    profile.hasDocuments
  );

  return {
    id: user.id,
    name: user.full_name || user.name || user.email.split("@")[0],
    company: user.company_name || user.company || profile.company_name || profile.company || "Independent Vendor",
    email: user.email,
    phone: (profile.phone as string) || (user as any).phone || "Not provided",
    categories: categories.length > 0 ? categories : ["Stay"],
    status,
    dateApplied: formatDate(user.created_at),
    hasDocuments,
    raw: user,
  };
}

export function VendorManagement() {
  const toast = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VendorStatus | "all">("all");
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadVendors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch<UserListResponse>("/users/search", {
        method: "POST",
        body: JSON.stringify({ page: 1, per_page: 100 }),
      });

      // Filter for vendors: users with role VENDOR or with vendor_status (and not ADMIN)
      const vendorUsers = (response.users || []).filter((user) => {
        const role = String(user.role || "").trim().toUpperCase();
        const hasVendorStatus = Boolean(user.vendor_status || user.vendorStatus);
        return role === "VENDOR" || (hasVendorStatus && role !== "ADMIN");
      });

      const mapped = vendorUsers.map(mapUserToVendor);
      setVendors(mapped);
    } catch (err: any) {
      const msg = err?.message || "Unable to load vendors from server.";
      setError(msg);
      toast.error("Fetch Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadVendors();
  }, []);

  const copyToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(text);
    toast.info("Copied", "Vendor ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApproveVendor = async (vendor: Vendor) => {
    setActionLoading(true);
    try {
      const payload: Record<string, any> = {
        vendor_status: "approved",
        is_active: true,
        approved_categories: vendor.categories.length > 0 ? vendor.categories : ["Stay", "Tour", "Safari", "Experience"],
      };
      await apiFetch(`/users/${vendor.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.success("Vendor Approved", `${vendor.name} has been approved.`);
      setSelectedVendor(null);
      await loadVendors();
    } catch (err: any) {
      toast.error("Approval Failed", err?.message || "Failed to approve vendor.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectVendor = async (vendor: Vendor, reason: string) => {
    setActionLoading(true);
    try {
      const existingProfile = vendor.raw?.business_profile || {};
      const payload: Record<string, any> = {
        vendor_status: "rejected",
        is_active: false,
        business_profile: {
          ...existingProfile,
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
        },
      };
      await apiFetch(`/users/${vendor.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.warning("Vendor Rejected", `${vendor.name}'s application has been rejected.`);
      setSelectedVendor(null);
      setRejectModalOpen(false);
      await loadVendors();
    } catch (err: any) {
      toast.error("Rejection Failed", err?.message || "Failed to reject vendor.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendVendor = async (vendor: Vendor) => {
    setActionLoading(true);
    try {
      const payload: Record<string, any> = {
        vendor_status: "suspended",
        is_active: false,
      };
      await apiFetch(`/users/${vendor.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.warning("Vendor Suspended", `${vendor.name} has been suspended.`);
      setSelectedVendor(null);
      setSuspendModalOpen(false);
      await loadVendors();
    } catch (err: any) {
      toast.error("Suspension Failed", err?.message || "Failed to suspend vendor.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateVendor = async (vendor: Vendor) => {
    setActionLoading(true);
    try {
      const payload: Record<string, any> = {
        vendor_status: "approved",
        is_active: true,
      };
      await apiFetch(`/users/${vendor.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.success("Vendor Reactivated", `${vendor.name} has been reactivated and approved.`);
      setSelectedVendor(null);
      await loadVendors();
    } catch (err: any) {
      toast.error("Activation Failed", err?.message || "Failed to reactivate vendor.");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const query = search.trim().toLowerCase();
      const matchSearch =
        !query ||
        v.id.toLowerCase().includes(query) ||
        v.name.toLowerCase().includes(query) ||
        v.company.toLowerCase().includes(query) ||
        v.email.toLowerCase().includes(query) ||
        v.phone.toLowerCase().includes(query);

      const matchStatus = statusFilter === "all" || v.status === statusFilter;

      let matchCategory = true;
      if (appliedFilters.category) {
        matchCategory = v.categories.some((c) =>
          c.toLowerCase().includes(String(appliedFilters.category).toLowerCase())
        );
      }

      let matchDocuments = true;
      if (appliedFilters.hasDocuments) {
        matchDocuments = v.hasDocuments;
      }

      let matchDateFrom = true;
      if (appliedFilters.dateFrom && v.raw?.created_at) {
        matchDateFrom = new Date(v.raw.created_at) >= new Date(appliedFilters.dateFrom);
      }

      let matchDateTo = true;
      if (appliedFilters.dateTo && v.raw?.created_at) {
        matchDateTo = new Date(v.raw.created_at) <= new Date(appliedFilters.dateTo);
      }

      return matchSearch && matchStatus && matchCategory && matchDocuments && matchDateFrom && matchDateTo;
    });
  }, [vendors, search, statusFilter, appliedFilters]);

  const stats = useMemo(() => {
    return {
      total: vendors.length,
      pending: vendors.filter((v) => v.status === "pending").length,
      approved: vendors.filter((v) => v.status === "approved").length,
      rejected: vendors.filter((v) => v.status === "rejected" || v.status === "suspended").length,
    };
  }, [vendors]);

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Vendor Management
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Review and manage vendor applications, identity credentials, and permissions
          </p>
        </div>

        <button
          onClick={() => void loadVendors()}
          disabled={isLoading}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-medium transition-all"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
          title="Refresh vendors"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Vendors", value: stats.total, color: "#3b82f6" },
          { label: "Pending Review", value: stats.pending, color: "#f59e0b" },
          { label: "Approved", value: stats.approved, color: "#22c55e" },
          { label: "Rejected / Suspended", value: stats.rejected, color: "#ef4444" },
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

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 h-9 rounded-lg flex-1 max-w-md"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
          }}
        >
          <Search size={14} style={{ color: "var(--text-tertiary)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vendor ID, name, email, company..."
            className="flex-1 bg-transparent outline-none text-[13px]"
            style={{ color: "var(--text-secondary)" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-[11px] px-1.5 py-0.5 rounded"
              style={{ color: "var(--text-tertiary)" }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VendorStatus | "all")}
            className="pl-3 pr-8 py-2 rounded-lg text-[12px] outline-none appearance-none"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-tertiary)" }}
          />
        </div>

        <button
          onClick={() => setFilterModalOpen(true)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] transition-all"
          style={{
            background: Object.keys(appliedFilters).length > 0 ? "var(--active-overlay)" : "var(--input-background)",
            border: "1px solid var(--border-light)",
            color: Object.keys(appliedFilters).length > 0 ? "var(--accent-navy-light)" : "var(--text-secondary)",
          }}
        >
          <Filter size={12} />
          More Filters
          {Object.keys(appliedFilters).length > 0 && (
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          )}
        </button>

        {Object.keys(appliedFilters).length > 0 && (
          <button
            onClick={() => setAppliedFilters({})}
            className="text-[12px] text-red-400 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Vendor Table */}
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
            gridTemplateColumns: "2fr 1.5fr 1fr 1fr 120px 80px",
            borderBottom: "1px solid var(--border-light)",
            background: "var(--bg-elevated)",
          }}
        >
          {["Vendor", "Company", "Categories", "Date Applied", "Status", "Actions"].map((col) => (
            <div key={col}>
              <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                {col}
              </span>
            </div>
          ))}
        </div>

        {/* Table Rows */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={24} className="animate-spin text-blue-500" />
              <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                Loading vendors from server...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <AlertTriangle size={24} className="text-red-500" />
              <p className="text-[13px] text-red-400">{error}</p>
              <button
                onClick={() => void loadVendors()}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                Retry Loading
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
              <p className="text-[14px]" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                No vendors found
              </p>
              <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                {vendors.length === 0
                  ? "There are currently no registered vendor accounts."
                  : "Try adjusting your search criteria or clearing active filters."}
              </p>
            </div>
          ) : (
            filtered.map((vendor) => {
              const statusStyle = STATUS_COLORS[vendor.status];

              return (
                <div
                  key={vendor.id}
                  className="grid items-center px-5 py-4 transition-all group cursor-pointer"
                  style={{
                    gridTemplateColumns: "2fr 1.5fr 1fr 1fr 120px 80px",
                    borderBottom: "1px solid var(--border-light)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                  onClick={() => setSelectedVendor(vendor)}
                >
                  {/* Vendor */}
                  <div className="min-w-0 pr-2">
                    <p className="text-[13px] mb-0.5 truncate" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {vendor.name}
                    </p>
                    <div className="flex items-center gap-2 mb-1">
                      <Mail size={10} style={{ color: "var(--text-tertiary)" }} />
                      <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                        {vendor.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          background: "var(--bg-elevated)",
                          color: "var(--text-tertiary)",
                          border: "1px solid var(--border-light)",
                        }}
                        title="Click to copy ID"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(vendor.id);
                        }}
                      >
                        {copiedId === vendor.id ? "Copied!" : `#${vendor.id.slice(0, 8)}`}
                      </span>
                    </div>
                  </div>

                  {/* Company */}
                  <div className="min-w-0 pr-2">
                    <p className="text-[12px] truncate" style={{ color: "var(--text-secondary)" }}>
                      {vendor.company}
                    </p>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 pr-2">
                    {vendor.categories.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--active-overlay)",
                          color: "var(--accent-navy-light)",
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                    {vendor.categories.length > 2 && (
                      <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        +{vendor.categories.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Date Applied */}
                  <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                    {vendor.dateApplied}
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]"
                      style={{
                        background: statusStyle.bg,
                        color: statusStyle.text,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: statusStyle.dot, boxShadow: `0 0 4px ${statusStyle.dot}` }}
                      />
                      {vendor.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {vendor.hasDocuments && (
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ color: "var(--text-secondary)" }}
                        title="Documents on file"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVendor(vendor);
                        }}
                      >
                        <FileText size={14} />
                      </button>
                    )}
                    <button
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ color: "var(--text-secondary)" }}
                      title="View vendor details"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVendor(vendor);
                      }}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ color: "var(--text-secondary)" }}
                      title="Manage vendor"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVendor(vendor);
                      }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}
        >
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Showing <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{filtered.length}</span> of{" "}
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{vendors.length}</span> real vendors
          </p>
        </div>
      </div>

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6 z-50"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setSelectedVendor(null)}
        >
          <div
            className="w-full max-w-2xl rounded-xl p-6"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                Vendor Details
              </h2>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]"
                style={{
                  background: STATUS_COLORS[selectedVendor.status].bg,
                  color: STATUS_COLORS[selectedVendor.status].text,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: STATUS_COLORS[selectedVendor.status].dot,
                    boxShadow: `0 0 4px ${STATUS_COLORS[selectedVendor.status].dot}`,
                  }}
                />
                {selectedVendor.status.toUpperCase()}
              </span>
            </div>

            {/* Vendor Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Vendor Name
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {selectedVendor.name}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Company
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {selectedVendor.company}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Email
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {selectedVendor.email}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Phone
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {selectedVendor.phone}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Applied Categories
                </p>
                <div className="flex gap-1 flex-wrap">
                  {selectedVendor.categories.map((cat) => (
                    <span
                      key={cat}
                      className="text-[11px] px-2 py-0.5 rounded"
                      style={{
                        background: "var(--active-overlay)",
                        color: "var(--accent-navy-light)",
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Date Applied
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {selectedVendor.dateApplied}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Vendor ID
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] px-2 py-1 rounded" style={{ background: "var(--input-background)", color: "var(--text-secondary)" }}>
                    {selectedVendor.id}
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedVendor.id)}
                    className="p-1 rounded text-[11px] flex items-center gap-1 transition-all"
                    style={{ color: "var(--text-tertiary)" }}
                    title="Copy full ID"
                  >
                    {copiedId === selectedVendor.id ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {/* Rejection reason if any */}
              {(selectedVendor.raw?.business_profile as any)?.rejection_reason && (
                <div className="col-span-2 p-3 rounded-lg" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                  <p className="text-[11px] uppercase tracking-wider text-red-400 font-semibold mb-1">Rejection Reason</p>
                  <p className="text-[12px] text-red-300">{(selectedVendor.raw?.business_profile as any).rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedVendor.status === "pending" && (
              <div className="flex gap-3">
                <button
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-lg text-[13px] transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: "rgba(34, 197, 94, 0.15)",
                    color: "#22c55e",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    fontWeight: 500,
                  }}
                  onClick={() => void handleApproveVendor(selectedVendor)}
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Approve Vendor
                </button>
                <button
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-lg text-[13px] transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    fontWeight: 500,
                  }}
                  onClick={() => setRejectModalOpen(true)}
                >
                  <XCircle size={14} />
                  Reject Application
                </button>
              </div>
            )}

            {selectedVendor.status === "approved" && (
              <button
                disabled={actionLoading}
                className="w-full py-2.5 rounded-lg text-[13px] transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: "rgba(156, 163, 175, 0.15)",
                  color: "#9ca3af",
                  border: "1px solid rgba(156, 163, 175, 0.3)",
                  fontWeight: 500,
                }}
                onClick={() => setSuspendModalOpen(true)}
              >
                <AlertTriangle size={14} />
                Suspend Vendor
              </button>
            )}

            {(selectedVendor.status === "suspended" || selectedVendor.status === "rejected") && (
              <button
                disabled={actionLoading}
                className="w-full py-2.5 rounded-lg text-[13px] transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: "rgba(34, 197, 94, 0.15)",
                  color: "#22c55e",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  fontWeight: 500,
                }}
                onClick={() => void handleReactivateVendor(selectedVendor)}
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Re-activate & Approve Vendor
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={(filters) => {
          setAppliedFilters(filters);
        }}
        filters={[
          {
            id: "category",
            label: "Category",
            type: "select",
            options: [
              { value: "stay", label: "Stay" },
              { value: "tour", label: "Tour" },
              { value: "safari", label: "Safari" },
              { value: "experience", label: "Experience" },
              { value: "transfer", label: "Transfer" },
            ],
          },
          {
            id: "dateFrom",
            label: "Applied From",
            type: "date",
          },
          {
            id: "dateTo",
            label: "Applied To",
            type: "date",
          },
          {
            id: "hasDocuments",
            label: "Has Documents",
            type: "checkbox",
            placeholder: "Only show vendors with documents",
          },
        ]}
      />

      {/* Reject Modal */}
      {selectedVendor && (
        <PromptModal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          onSubmit={async (reason) => {
            await handleRejectVendor(selectedVendor, reason);
          }}
          title="Reject Vendor Application"
          description={`Provide a reason for rejecting ${selectedVendor.name}'s application`}
          placeholder="Enter rejection reason..."
          confirmText="Reject Application"
          variant="danger"
          required
          multiline
        />
      )}

      {/* Suspend Modal */}
      {selectedVendor && (
        <ConfirmModal
          isOpen={suspendModalOpen}
          onClose={() => setSuspendModalOpen(false)}
          onConfirm={() => void handleSuspendVendor(selectedVendor)}
          title="Suspend Vendor"
          description={`Are you sure you want to suspend "${selectedVendor.name}"? They will no longer be able to manage listings or accept bookings.`}
          confirmText="Suspend Vendor"
          cancelText="Cancel"
          variant="danger"
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}

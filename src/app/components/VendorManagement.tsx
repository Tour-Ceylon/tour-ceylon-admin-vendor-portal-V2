import { useState } from "react";
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
} from "lucide-react";
import { useCommonActions } from "../hooks/useCommonActions";
import { FilterModal, type FilterOption } from "./shared/FilterModal";
import { PromptModal } from "./shared/PromptModal";
import { ConfirmModal } from "./shared/Modal";

type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

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
}

const VENDORS: Vendor[] = [
  {
    id: "vnd_001",
    name: "Safari Adventures LK",
    company: "Safari Adventures Lanka (Pvt) Ltd",
    email: "info@safariadventures.lk",
    phone: "+94 77 123 4567",
    categories: ["Safari", "Tour"],
    status: "pending",
    dateApplied: "May 18, 2026",
    hasDocuments: true,
  },
  {
    id: "vnd_002",
    name: "Ella View Stays",
    company: "Ella View Hotels & Resorts",
    email: "contact@ellaview.com",
    phone: "+94 77 234 5678",
    categories: ["Stay"],
    status: "pending",
    dateApplied: "May 17, 2026",
    hasDocuments: true,
  },
  {
    id: "vnd_003",
    name: "Ceylon Explorer",
    company: "Ceylon Explorer Tours",
    email: "tours@ceylonexplorer.lk",
    phone: "+94 77 345 6789",
    categories: ["Tour", "Experience"],
    status: "approved",
    dateApplied: "May 10, 2026",
    hasDocuments: true,
  },
  {
    id: "vnd_004",
    name: "Colombo Transfers Pro",
    company: "Colombo Executive Transfers",
    email: "booking@colombotransfers.lk",
    phone: "+94 77 456 7890",
    categories: ["Transfer"],
    status: "approved",
    dateApplied: "May 08, 2026",
    hasDocuments: true,
  },
  {
    id: "vnd_005",
    name: "Budget Safari Tours",
    company: "Budget Safari Lanka",
    email: "contact@budgetsafari.lk",
    phone: "+94 77 567 8901",
    categories: ["Safari"],
    status: "rejected",
    dateApplied: "May 12, 2026",
    hasDocuments: false,
  },
];

const STATUS_COLORS: Record<VendorStatus, { bg: string; text: string; dot: string; icon: React.ComponentType<any> }> = {
  pending: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", dot: "#f59e0b", icon: Clock },
  approved: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e", icon: CheckCircle },
  rejected: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444", icon: XCircle },
  suspended: { bg: "rgba(156, 163, 175, 0.1)", text: "#9ca3af", dot: "#6b7280", icon: AlertTriangle },
};

export function VendorManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VendorStatus | "all">("all");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { handleApprove, handleSuspend } = useCommonActions();

  const filtered = VENDORS.filter((v) => {
    const matchSearch =
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.company.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: VENDORS.length,
    pending: VENDORS.filter((v) => v.status === "pending").length,
    approved: VENDORS.filter((v) => v.status === "approved").length,
    rejected: VENDORS.filter((v) => v.status === "rejected").length,
  };

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Vendor Management
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Review and manage vendor applications and permissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Vendors", value: stats.total, color: "#3b82f6" },
          { label: "Pending Review", value: stats.pending, color: "#f59e0b" },
          { label: "Approved", value: stats.approved, color: "#22c55e" },
          { label: "Rejected", value: stats.rejected, color: "#ef4444" },
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
            placeholder="Search vendors..."
            className="flex-1 bg-transparent outline-none text-[13px]"
            style={{ color: "var(--text-secondary)" }}
          />
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
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          <Filter size={12} />
          More Filters
        </button>
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
          {filtered.map((vendor) => {
            const statusStyle = STATUS_COLORS[vendor.status];
            const StatusIcon = statusStyle.icon;

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
                <div className="min-w-0">
                  <p className="text-[13px] mb-0.5 truncate" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {vendor.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <Mail size={10} style={{ color: "var(--text-tertiary)" }} />
                    <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                      {vendor.email}
                    </p>
                  </div>
                </div>

                {/* Company */}
                <div className="min-w-0">
                  <p className="text-[12px] truncate" style={{ color: "var(--text-secondary)" }}>
                    {vendor.company}
                  </p>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1">
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
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        (e.currentTarget as HTMLElement).style.background = "var(--active-overlay)";
                        (e.currentTarget as HTMLElement).style.color = "var(--accent-navy-light)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileText size={14} />
                    </button>
                  )}
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      (e.currentTarget as HTMLElement).style.background = "var(--active-overlay)";
                      (e.currentTarget as HTMLElement).style.color = "var(--accent-navy-light)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal size={14} />
                  </button>
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
            Showing <span style={{ color: "var(--text-secondary)" }}>{filtered.length}</span> of{" "}
            <span style={{ color: "var(--text-secondary)" }}>{VENDORS.length}</span> vendors
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
            <h2 className="text-[18px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              Vendor Details
            </h2>

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
            </div>

            {/* Actions */}
            {selectedVendor.status === "pending" && (
              <div className="flex gap-3">
                <button
                  className="flex-1 py-2.5 rounded-lg text-[13px] transition-all"
                  style={{
                    background: "rgba(34, 197, 94, 0.15)",
                    color: "#22c55e",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    fontWeight: 500,
                  }}
                  onClick={() => handleApprove(selectedVendor.name, () => setSelectedVendor(null))}
                >
                  <CheckCircle size={14} className="inline mr-1.5" />
                  Approve Vendor
                </button>
                <button
                  className="flex-1 py-2.5 rounded-lg text-[13px] transition-all"
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    fontWeight: 500,
                  }}
                  onClick={() => setRejectModalOpen(true)}
                >
                  <XCircle size={14} className="inline mr-1.5" />
                  Reject Application
                </button>
              </div>
            )}

            {selectedVendor.status === "approved" && (
              <button
                className="w-full py-2.5 rounded-lg text-[13px] transition-all"
                style={{
                  background: "rgba(156, 163, 175, 0.15)",
                  color: "#9ca3af",
                  border: "1px solid rgba(156, 163, 175, 0.3)",
                  fontWeight: 500,
                }}
                onClick={() => handleSuspend(selectedVendor.name, () => setSelectedVendor(null))}
              >
                <AlertTriangle size={14} className="inline mr-1.5" />
                Suspend Vendor
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
          console.log("Filters applied:", filters);
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
            await handleApprove(`Vendor "${selectedVendor.name}"`, () => {
              setSelectedVendor(null);
              setRejectModalOpen(false);
            });
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
    </div>
  );
}

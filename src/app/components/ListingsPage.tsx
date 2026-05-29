import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  MoreHorizontal,
  Image,
  Layers,
  TrendingUp,
  FileText,
  Archive,
  ChevronDown,
  CheckSquare,
  Filter,
  Copy,
  Send,
  Trash2,
  ExternalLink,
  X,
  AlertTriangle,
  Check,
} from "lucide-react";
import { vendorMockData, VendorListing } from "../services/vendorMockData";
import { useAuth } from "../contexts/AuthContext";
import { getAccessibleCategories, canCreateListing, isAdmin } from "../utils/permissions";

type Category = "All" | "Stay" | "Tour" | "Safari" | "Experience" | "Transfer";
type Status = "All" | "approved" | "draft" | "pending_review" | "needs_changes" | "rejected" | "archived";

const CATEGORY_COLORS: Record<Exclude<Category, "All">, { bg: string; text: string; border: string }> = {
  Stay: { bg: "rgba(37, 99, 235, 0.12)", text: "#60a5fa", border: "rgba(37,99,235,0.25)" },
  Tour: { bg: "rgba(8, 145, 178, 0.12)", text: "#22d3ee", border: "rgba(8,145,178,0.25)" },
  Safari: { bg: "rgba(5, 150, 105, 0.12)", text: "#34d399", border: "rgba(5,150,105,0.25)" },
  Experience: { bg: "rgba(217, 119, 6, 0.12)", text: "#fbbf24", border: "rgba(217,119,6,0.25)" },
  Transfer: { bg: "rgba(100, 116, 139, 0.12)", text: "#94a3b8", border: "rgba(100,116,139,0.25)" },
};

const STATUS_COLORS: Record<Exclude<Status, "All">, { bg: string; text: string; dot: string }> = {
  approved: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e" },
  draft: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8", dot: "#64748b" },
  pending_review: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", dot: "#f59e0b" },
  needs_changes: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444" },
  rejected: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444" },
  archived: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8", dot: "#64748b" },
};

const CATEGORIES: Category[] = ["All", "Stay", "Tour", "Safari", "Experience", "Transfer"];
const STATUSES: Status[] = ["All", "approved", "draft", "pending_review", "needs_changes", "rejected", "archived"];

const THUMBNAIL_GRADIENTS: Record<Exclude<Category, "All">, string> = {
  Safari: "linear-gradient(135deg, #052e16 0%, #064e3b 50%, #065f46 100%)",
  Tour: "linear-gradient(135deg, #0c2d48 0%, #0e4f6d 50%, #0891b2 100%)",
  Stay: "linear-gradient(135deg, #1e1b4b 0%, #1d4ed8 50%, #2563eb 100%)",
  Experience: "linear-gradient(135deg, #431407 0%, #92400e 50%, #d97706 100%)",
  Transfer: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
};

function ListingThumbnail({ category, color }: { category: Exclude<Category, "All">; color: string }) {
  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: THUMBNAIL_GRADIENTS[category], border: `1px solid ${color}30` }}
    >
      <Image size={14} style={{ color, opacity: 0.8 }} />
    </div>
  );
}

// Action Menu Component
function ActionMenu({ listing, onAction }: { listing: VendorListing; onAction: (action: string, listing: VendorListing) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: "view", label: "View Details", icon: Eye },
    { id: "edit", label: "Edit Listing", icon: Edit2 },
    { id: "preview", label: "Preview", icon: ExternalLink },
    { id: "duplicate", label: "Duplicate", icon: Copy },
    ...(listing.status === "draft" || listing.status === "needs_changes" 
      ? [{ id: "submit", label: "Submit for Review", icon: Send }] 
      : []
    ),
    { id: "archive", label: "Archive", icon: Archive },
    { id: "delete", label: "Delete", icon: Trash2 },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
          (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
          }
        }}
      >
        <MoreHorizontal size={13} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 top-8 z-20 py-2 rounded-lg shadow-lg border min-w-[160px]"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  onAction(action.id, listing);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-[12px] transition-all"
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
                <action.icon size={12} />
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Delete Confirmation Modal
function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  listingTitle 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  listingTitle: string; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative rounded-xl p-6 max-w-md w-full mx-4"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.1)" }}
          >
            <AlertTriangle size={18} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold" style={{ color: "var(--text-primary)" }}>
              Delete Listing
            </h3>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              This action cannot be undone
            </p>
          </div>
        </div>
        
        <p className="text-[13px] mb-6" style={{ color: "var(--text-secondary)" }}>
          Are you sure you want to delete "<strong>{listingTitle}</strong>"? This will permanently remove the listing and all associated data.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{
              background: "var(--input-background)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-light)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{
              background: "#ef4444",
              color: "white",
              border: "1px solid #ef4444",
            }}
          >
            Delete Listing
          </button>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ type, searchTerm }: { type: "no-listings" | "no-results" | "no-category"; searchTerm?: string }) {
  const content = {
    "no-listings": {
      title: "No listings yet",
      description: "Create your first listing to start showcasing your offerings to customers.",
      action: "Create First Listing"
    },
    "no-results": {
      title: "No results found",
      description: `No listings match "${searchTerm}". Try adjusting your search or filters.`,
      action: "Clear Search"
    },
    "no-category": {
      title: "No listings in this category",
      description: "You don't have any listings in this category yet.",
      action: "Add Listing"
    }
  };

  const { title, description, action } = content[type];

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: "var(--input-background)" }}
      >
        <Layers size={24} style={{ color: "var(--text-tertiary)" }} />
      </div>
      <h3 className="text-[16px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
        {title}
      </h3>
      <p className="text-[13px] text-center mb-6 max-w-sm" style={{ color: "var(--text-tertiary)" }}>
        {description}
      </p>
      <button
        className="px-4 py-2 rounded-lg text-[13px] transition-all"
        style={{
          background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
          color: "white",
          border: "1px solid var(--border-accent)",
        }}
      >
        {action}
      </button>
    </div>
  );
}

export function ListingsPage() {
  const navigate = useNavigate();
  const { effectiveUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [activeStatus, setActiveStatus] = useState<Status>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; listing?: VendorListing }>({ isOpen: false });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Get user permissions
  const userIsAdmin = isAdmin(effectiveUser);
  const accessibleCategories = getAccessibleCategories(effectiveUser);
  const canCreate = canCreateListing(effectiveUser);
  
  // Filter categories based on user permissions
  const availableCategories = useMemo(() => {
    if (userIsAdmin) return CATEGORIES;
    return ["All", ...accessibleCategories] as Category[];
  }, [userIsAdmin, accessibleCategories]);
  
  // Get vendor-specific listings from mock service
  const vendorId = effectiveUser?.id;
  const [listings, setListings] = useState<VendorListing[]>(vendorMockData.getVendorListings(vendorId));

  // Helper function for toast notifications
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter and search logic
  const filtered = useMemo(() => {
    return listings.filter((listing) => {
      const matchCategory = activeCategory === "All" || listing.category === activeCategory;
      const matchStatus = activeStatus === "All" || listing.status === activeStatus;
      const matchSearch = !search || 
        listing.title.toLowerCase().includes(search.toLowerCase()) ||
        listing.destination.toLowerCase().includes(search.toLowerCase()) ||
        listing.category.toLowerCase().includes(search.toLowerCase()) ||
        listing.status.toLowerCase().includes(search.toLowerCase());
      
      return matchCategory && matchStatus && matchSearch;
    });
  }, [listings, activeCategory, activeStatus, search]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: listings.length,
    approved: listings.filter((l) => l.status === "approved").length,
    pending: listings.filter((l) => l.status === "pending_review").length,
    draft: listings.filter((l) => l.status === "draft").length,
  }), [listings]);

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((l) => l.id)));
    }
  };

  // Action handlers
  const handleAction = (action: string, listing: VendorListing) => {
    switch (action) {
      case "view":
        showToast(`Opening details for "${listing.title}"`, "success");
        // Navigate to view page or open modal
        navigate(`/listings/${listing.id}/view`);
        break;
      case "edit":
        navigate(`/listings/${listing.id}/edit`);
        break;
      case "preview":
        showToast(`Opening preview for "${listing.title}"`, "success");
        // Open preview in new tab
        window.open(`/listings/${listing.id}/preview`, '_blank');
        break;
      case "duplicate":
        const duplicated = {
          ...listing,
          id: `${listing.id}_copy`,
          title: `${listing.title} (Copy)`,
          status: "draft" as const,
          views: 0,
          bookings: 0,
          revenue: 0,
          lastUpdated: "Just now",
          createdDate: new Date().toISOString().split('T')[0],
        };
        setListings(prev => [duplicated, ...prev]);
        showToast(`"${listing.title}" duplicated successfully`, "success");
        break;
      case "submit":
        setListings(prev => prev.map(l => 
          l.id === listing.id ? { ...l, status: "pending_review" as const, lastUpdated: "Just now" } : l
        ));
        showToast(`"${listing.title}" submitted for review`, "success");
        break;
      case "archive":
        setListings(prev => prev.map(l => 
          l.id === listing.id ? { ...l, status: "archived" as const, lastUpdated: "Just now" } : l
        ));
        showToast(`"${listing.title}" archived successfully`, "success");
        break;
      case "delete":
        setDeleteModal({ isOpen: true, listing });
        break;
    }
  };

  const handleDelete = () => {
    if (deleteModal.listing) {
      setListings(prev => prev.filter(l => l.id !== deleteModal.listing!.id));
      setSelected(prev => {
        const next = new Set(prev);
        next.delete(deleteModal.listing!.id);
        return next;
      });
    }
    setDeleteModal({ isOpen: false });
  };

  // Bulk actions
  const handleBulkAction = (action: string) => {
    const selectedIds = Array.from(selected);
    const count = selectedIds.length;
    
    switch (action) {
      case "submit":
        const eligibleCount = listings.filter(l => 
          selectedIds.includes(l.id) && (l.status === "draft" || l.status === "needs_changes")
        ).length;
        
        setListings(prev => prev.map(l => 
          selectedIds.includes(l.id) && (l.status === "draft" || l.status === "needs_changes")
            ? { ...l, status: "pending_review" as const, lastUpdated: "Just now" } 
            : l
        ));
        showToast(`${eligibleCount} listing${eligibleCount > 1 ? 's' : ''} submitted for review`, "success");
        break;
      case "archive":
        setListings(prev => prev.map(l => 
          selectedIds.includes(l.id) ? { ...l, status: "archived" as const, lastUpdated: "Just now" } : l
        ));
        showToast(`${count} listing${count > 1 ? 's' : ''} archived successfully`, "success");
        break;
      case "delete":
        setListings(prev => prev.filter(l => !selectedIds.includes(l.id)));
        showToast(`${count} listing${count > 1 ? 's' : ''} deleted successfully`, "success");
        break;
    }
    setSelected(new Set());
  };

  return (
    <div className="p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Listings", value: stats.total, icon: Layers, color: "#3b82f6", glow: "rgba(59,130,246,0.2)" },
          { label: "Approved", value: stats.approved, icon: TrendingUp, color: "#22c55e", glow: "rgba(34,197,94,0.15)" },
          { label: "Pending Review", value: stats.pending, icon: FileText, color: "#f59e0b", glow: "rgba(245,158,11,0.15)" },
          { label: "Draft", value: stats.draft, icon: Archive, color: "#64748b", glow: "rgba(100,116,139,0.12)" },
        ].map(({ label, value, icon: Icon, color, glow }) => (
          <div
            key={label}
            className="rounded-xl p-4 flex items-center gap-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: glow, boxShadow: `0 0 12px ${glow}` }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                {label}
              </p>
              <p className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700, lineHeight: 1 }}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Category pills */}
        <div className="flex items-center gap-1.5 flex-1">
          {availableCategories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3.5 py-1.5 rounded-lg text-[12px] transition-all shrink-0"
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
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 h-8 rounded-lg w-52"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
          }}
        >
          <Search size={13} style={{ color: "var(--text-tertiary)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="flex-1 bg-transparent outline-none text-[12px]"
            style={{ color: "var(--text-secondary)" }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={12} style={{ color: "var(--text-tertiary)" }} />
            </button>
          )}
        </div>

        {/* Filter */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] transition-all"
          style={{
            background: showFilters ? "var(--active-overlay)" : "var(--input-background)",
            border: "1px solid var(--border-light)",
            color: showFilters ? "var(--accent-navy-light)" : "var(--text-secondary)",
          }}
        >
          <Filter size={12} />
          Filter
        </button>

        {/* Add Listing */}
        {canCreate && (
          <button
            onClick={() => navigate("/listings/create")}
            className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-[12px] transition-all shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
              color: "white",
              boxShadow: "0 0 16px var(--border-accent)",
              border: "1px solid var(--border-accent)",
              fontWeight: 500,
            }}
          >
            <Plus size={13} />
            Add Listing
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-6">
            <div>
              <label className="text-[11px] uppercase tracking-wider mb-2 block" style={{ color: "var(--text-tertiary)" }}>
                Status
              </label>
              <div className="flex gap-2">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveStatus(status)}
                    className="px-3 py-1.5 rounded-lg text-[12px] transition-all capitalize"
                    style={
                      activeStatus === status
                        ? {
                            background: "var(--active-overlay)",
                            color: "var(--accent-navy-light)",
                            border: "1px solid var(--border-accent)",
                          }
                        : {
                            background: "var(--input-background)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-light)",
                          }
                    }
                  >
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div
          className="flex items-center justify-between p-4 rounded-xl"
          style={{
            background: "var(--active-overlay)",
            border: "1px solid var(--border-accent)",
          }}
        >
          <span className="text-[13px]" style={{ color: "var(--accent-navy-light)" }}>
            {selected.size} listing{selected.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("submit")}
              className="px-3 py-1.5 rounded-lg text-[12px] transition-all"
              style={{
                background: "rgba(34,197,94,0.1)",
                color: "#4ade80",
                border: "1px solid rgba(34,197,94,0.3)",
              }}
            >
              Submit for Review
            </button>
            <button
              onClick={() => handleBulkAction("archive")}
              className="px-3 py-1.5 rounded-lg text-[12px] transition-all"
              style={{
                background: "rgba(100,116,139,0.1)",
                color: "#94a3b8",
                border: "1px solid rgba(100,116,139,0.3)",
              }}
            >
              Archive
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1.5 rounded-lg text-[12px] transition-all"
              style={{
                background: "rgba(239,68,68,0.1)",
                color: "#f87171",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {filtered.length === 0 ? (
          <EmptyState 
            type={
              listings.length === 0 ? "no-listings" : 
              search ? "no-results" : 
              "no-category"
            } 
            searchTerm={search}
          />
        ) : (
          <>
            {/* Table header */}
            <div
              className="grid items-center px-4 py-3"
              style={{
                gridTemplateColumns: "36px 2fr 1fr 1fr 80px 80px 100px 110px 80px",
                borderBottom: "1px solid var(--border-light)",
                background: "var(--bg-elevated)",
              }}
            >
              <button onClick={toggleAll} className="flex items-center justify-center">
                <div
                  className="w-4 h-4 rounded flex items-center justify-center"
                  style={{
                    border: selected.size === filtered.length && filtered.length > 0
                      ? "1.5px solid var(--accent-navy)"
                      : "1.5px solid var(--border-medium)",
                    background: selected.size === filtered.length && filtered.length > 0
                      ? "var(--accent-navy)"
                      : "transparent",
                  }}
                >
                  {selected.size === filtered.length && filtered.length > 0 && (
                    <CheckSquare size={10} className="text-white" />
                  )}
                </div>
              </button>
              {["Listing", "Category", "Destination", "Media", "Variants", "Status", "Last Updated", "Actions"].map(
                (col) => (
                  <div key={col} className="flex items-center gap-1">
                    <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                      {col}
                    </span>
                    {["Listing", "Last Updated"].includes(col) && (
                      <ChevronDown size={10} style={{ color: "var(--text-tertiary)" }} />
                    )}
                  </div>
                )
              )}
            </div>

            {/* Rows */}
            <div>
              {filtered.map((listing, i) => {
                const catStyle = CATEGORY_COLORS[listing.category];
                const statStyle = STATUS_COLORS[listing.status as Exclude<Status, "All">];
                const isSelected = selected.has(listing.id);
                return (
                  <div
                    key={listing.id}
                    className="grid items-center px-4 py-3 transition-all group"
                    style={{
                      gridTemplateColumns: "36px 2fr 1fr 1fr 80px 80px 100px 110px 80px",
                      borderBottom: i < filtered.length - 1 ? "1px solid var(--border-light)" : "none",
                      background: isSelected ? "var(--active-overlay)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {/* Checkbox */}
                    <div className="flex items-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(listing.id); }}
                        className="w-4 h-4 rounded flex items-center justify-center"
                        style={{
                          border: isSelected
                            ? "1.5px solid var(--accent-navy)"
                            : "1.5px solid var(--border-medium)",
                          background: isSelected ? "var(--accent-navy)" : "transparent",
                        }}
                      >
                        {isSelected && <CheckSquare size={10} className="text-white" />}
                      </button>
                    </div>

                    {/* Listing */}
                    <div className="flex items-center gap-3 min-w-0">
                      <ListingThumbnail category={listing.category} color={listing.color} />
                      <div className="min-w-0">
                        <p
                          className="text-[13px] truncate"
                          style={{ color: "var(--text-primary)", fontWeight: 500 }}
                        >
                          {listing.title}
                        </p>
                        <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                          {listing.location}
                        </p>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px]"
                        style={{
                          background: catStyle.bg,
                          color: catStyle.text,
                          border: `1px solid ${catStyle.border}`,
                        }}
                      >
                        {listing.category}
                      </span>
                    </div>

                    {/* Destination */}
                    <div
                      className="text-[12px] truncate pr-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {listing.destination}
                    </div>

                    {/* Media */}
                    <div className="flex items-center gap-1.5">
                      <Image size={11} style={{ color: "var(--text-tertiary)" }} />
                      <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {listing.media}
                      </span>
                    </div>

                    {/* Variants */}
                    <div className="flex items-center gap-1.5">
                      <Layers size={11} style={{ color: "var(--text-tertiary)" }} />
                      <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {listing.variants}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] capitalize"
                        style={{
                          background: statStyle.bg,
                          color: statStyle.text,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: statStyle.dot, boxShadow: `0 0 4px ${statStyle.dot}` }}
                        />
                        {listing.status.replace("_", " ")}
                      </span>
                    </div>

                    {/* Last Updated */}
                    <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                      {listing.lastUpdated}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleAction("view", listing)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "var(--active-overlay)";
                          (e.currentTarget as HTMLElement).style.color = "var(--accent-navy-light)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                        }}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => handleAction("edit", listing)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "var(--active-overlay)";
                          (e.currentTarget as HTMLElement).style.color = "var(--accent-navy-light)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                        }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <ActionMenu listing={listing} onAction={handleAction} />
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
                <span style={{ color: "var(--text-secondary)" }}>{listings.length}</span> listings
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
          </>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleDelete}
        listingTitle={deleteModal.listing?.title || ""}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all"
          style={{
            background: toast.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: toast.type === "success" ? "#4ade80" : "#f87171",
          }}
        >
          {toast.type === "success" ? (
            <Check size={16} />
          ) : (
            <X size={16} />
          )}
          <span className="text-[13px] font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 p-1 rounded-lg transition-all"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "inherit",
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

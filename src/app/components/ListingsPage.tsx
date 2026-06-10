import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "./api/apiClient";
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
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";

type Category = "All" | "Stay" | "Tour" | "Safari" | "Experience" | "Transfer";
type Status = "Active" | "Draft" | "Pending Review" | "Approved" | "Rejected" | "Archived";

interface Listing {
  id: string;
  title: string;
  location: string;
  category: Exclude<Category, "All">;
  destination: string;
  media: number;
  variants: number;
  status: Status;
  lastUpdated: string;
  color: string;
  coverUrl?: string;
}

interface ListingResponse {
  id: string;
  title: string;
  slug?: string;
  listing_type: "hotel" | "tour" | "safari" | "experience" | "transfer";
  status: "draft" | "submitted" | "published" | "rejected" | "archived";
  is_active: boolean;
  destination?: { name?: string | null } | null;
  base_currency?: string;
  created_at: string;
  updated_at: string;
  media?: Array<{ url?: string; role?: string }>;
  variants?: unknown[];
}

interface ListingSearchResponse {
  listings: ListingResponse[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

const CATEGORY_COLORS: Record<Exclude<Category, "All">, { bg: string; text: string; border: string }> = {
  Stay: { bg: "rgba(37, 99, 235, 0.12)", text: "#60a5fa", border: "rgba(37,99,235,0.25)" },
  Tour: { bg: "rgba(8, 145, 178, 0.12)", text: "#22d3ee", border: "rgba(8,145,178,0.25)" },
  Safari: { bg: "rgba(5, 150, 105, 0.12)", text: "#34d399", border: "rgba(5,150,105,0.25)" },
  Experience: { bg: "rgba(217, 119, 6, 0.12)", text: "#fbbf24", border: "rgba(217,119,6,0.25)" },
  Transfer: { bg: "rgba(100, 116, 139, 0.12)", text: "#94a3b8", border: "rgba(100,116,139,0.25)" },
};

const STATUS_COLORS: Record<Status, { bg: string; text: string; dot: string }> = {
  Active: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e" },
  Draft: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8", dot: "#64748b" },
  "Pending Review": { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", dot: "#f59e0b" },
  Approved: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e" },
  Rejected: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444" },
  Archived: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8", dot: "#64748b" },
};

const ACTION_BUTTON_CLASS =
  "w-9 h-9 rounded-lg inline-flex items-center justify-center transition-all duration-150 ease-in-out border border-transparent bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed";

const CATEGORIES: Category[] = ["All", "Stay", "Tour", "Safari", "Experience", "Transfer"];

const THUMBNAIL_GRADIENTS: Record<Exclude<Category, "All">, string> = {
  Safari: "linear-gradient(135deg, #052e16 0%, #064e3b 50%, #065f46 100%)",
  Tour: "linear-gradient(135deg, #0c2d48 0%, #0e4f6d 50%, #0891b2 100%)",
  Stay: "linear-gradient(135deg, #1e1b4b 0%, #1d4ed8 50%, #2563eb 100%)",
  Experience: "linear-gradient(135deg, #431407 0%, #92400e 50%, #d97706 100%)",
  Transfer: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
};

function mapStayStatus(status: string): Status {
  const normalized = status.toLowerCase();
  if (normalized === "submitted" || normalized === "pending" || normalized === "pending_review") return "Pending Review";
  if (normalized === "approved" || normalized === "published") return "Approved";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "archived") return "Archived";
  return "Draft";
}

function formatListingDate(value?: string) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function listingResponseToListing(item: ListingResponse): Listing {
  const category = listingTypeToCategory(item.listing_type);
  const coverUrl = item.media?.find((media) => media.role === "cover" && media.url)?.url || 
                   item.media?.find((media) => media.url)?.url;
  const destination = item.destination?.name || "Destination not set";

  return {
    id: item.id,
    title: item.title,
    location: destination,
    category,
    destination,
    media: item.media?.length ?? 0,
    variants: item.variants?.length ?? 0,
    status: mapListingStatus(item.status, item.is_active),
    lastUpdated: formatListingDate(item.updated_at),
    color: CATEGORY_COLORS[category].text,
    coverUrl,
  };
}

function listingTypeToCategory(listingType: "hotel" | "tour" | "safari" | "experience" | "transfer"): Exclude<Category, "All"> {
  const mapping: Record<string, Exclude<Category, "All">> = {
    hotel: "Stay",
    tour: "Tour",
    safari: "Safari",
    experience: "Experience",
    transfer: "Transfer",
  };
  return mapping[listingType] || "Stay";
}

function categoryToListingType(category: Category): "hotel" | "tour" | "safari" | "experience" | "transfer" | null {
  if (category === "All") return null;
  const mapping: Record<Exclude<Category, "All">, string> = {
    Stay: "hotel",
    Tour: "tour",
    Safari: "safari",
    Experience: "experience",
    Transfer: "transfer",
  };
  return mapping[category] as any;
}

function mapListingStatus(status: string, isActive: boolean): Status {
  const normalized = status.toLowerCase();
  if (normalized === "submitted") return "Pending Review";
  if (normalized === "published" && isActive) return "Approved";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "archived" || !isActive) return "Archived";
  return "Draft";
}

function ListingThumbnail({ category, color, imageUrl }: { category: Exclude<Category, "All">; color: string; imageUrl?: string }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="w-10 h-10 rounded-lg shrink-0 object-cover"
        style={{ border: `1px solid ${color}30` }}
      />
    );
  }

  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: THUMBNAIL_GRADIENTS[category], border: `1px solid ${color}30` }}
    >
      <Image size={14} style={{ color, opacity: 0.8 }} />
    </div>
  );
}

interface ArchiveModalProps {
  listing: Listing;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

function ArchiveModal({ listing, onConfirm, onCancel, loading = false }: ArchiveModalProps) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="max-w-md w-full mx-4 rounded-xl p-6"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}
          >
            <Archive size={18} />
          </div>
          <div>
            <h3 className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Archive Listing
            </h3>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {listing.title}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-[12px] mb-2" style={{ color: "var(--text-secondary)" }}>
            Archive Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for archiving..."
            className="w-full px-3 py-2 rounded-lg text-[12px] resize-none"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-[12px] transition-all"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason || undefined)}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-[12px] transition-all"
            style={{
              background: "#f59e0b",
              color: "white",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Archiving..." : "Archive Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface DeleteModalProps {
  listing: Listing;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

function DeleteModal({ listing, onConfirm, onCancel, loading = false }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="max-w-md w-full mx-4 rounded-xl p-6"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}
          >
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Delete Listing
            </h3>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {listing.title}
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-[13px] mb-2" style={{ color: "var(--text-primary)" }}>
            This action cannot be undone. Only draft listings can be permanently deleted.
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            Are you sure you want to permanently delete this listing?
          </p>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-[12px] transition-all"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-[12px] transition-all"
            style={{
              background: "#ef4444",
              color: "white",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ListingsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [archiveModal, setArchiveModal] = useState<Listing | null>(null);
  const [deleteModal, setDeleteModal] = useState<Listing | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [statusLoadingIds, setStatusLoadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      setLoading(true);
      setLoadError(null);
      try {
        // Use the listings search endpoint with no filters to get all listings
        const response = await apiFetch<ListingSearchResponse>("/listings/search", {
          method: "POST",
          body: JSON.stringify({
            page: 1,
            per_page: 1000 // Get all listings
          }),
        });

        if (!cancelled) {
          const mappedListings = response.listings.map(listingResponseToListing);
          setListings(mappedListings);
        }
      } catch (error: any) {
        if (!cancelled) {
          setLoadError(error?.message || "Unable to load listings.");
          setListings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadListings();
    return () => {
      cancelled = true;
    };
  }, []);

  // CATEGORY FILTER FIX: Normalize both sides to handle case sensitivity and category variations
  const normalizeCategory = (value: string) => String(value || "").toLowerCase();
  
  const filtered = listings.filter((l) => {
    const listingCategory = normalizeCategory(l.category);
    const filterCategory = normalizeCategory(activeCategory);
    
    // Stay filter should match both "stay" and "hotel" variants
    const matchCat = activeCategory === "All" || 
                     listingCategory === filterCategory ||
                     (filterCategory === "stay" && (listingCategory === "hotel" || listingCategory === "stay"));
    
    const matchSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.destination.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total: listings.length,
    approved: listings.filter((l) => l.status === "Approved").length,
    pending: listings.filter((l) => l.status === "Pending Review").length,
    draft: listings.filter((l) => l.status === "Draft").length,
  };

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

  const handleArchiveListing = async (reason?: string) => {
    if (!archiveModal) return;

    setOperationLoading(true);
    try {
      // Use the listings archive endpoint for all listing types
      await apiFetch(`/listings/${archiveModal.id}/archive`, {
        method: "PATCH",
      });

      // Update local state
      setListings(prev => 
        prev.map(listing => 
          listing.id === archiveModal.id 
            ? { ...listing, status: "Archived" as Status }
            : listing
        )
      );
      
      setArchiveModal(null);
    } catch (error: any) {
      setLoadError(error?.message || "Failed to archive listing");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!deleteModal) return;

    setOperationLoading(true);
    try {
      // Use the listings delete endpoint for all listing types
      await apiFetch(`/listings/${deleteModal.id}`, {
        method: "DELETE",
      });

      // Remove from local state
      setListings(prev => prev.filter(listing => listing.id !== deleteModal.id));
      
      setDeleteModal(null);
    } catch (error: any) {
      setLoadError(error?.message || "Failed to delete listing");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleApproveStatus = async (listing: Listing) => {
    setStatusLoadingIds((prev) => new Set(prev).add(listing.id));
    try {
      // For now, still use the stay-specific endpoint until we have a generic one
      await apiFetch(`/admin/stays/${listing.id}/approve`, {
        method: "POST",
      });
      setListings((prev) =>
        prev.map((item) =>
          item.id === listing.id ? { ...item, status: "Approved" } : item
        )
      );
    } catch (error: any) {
      setLoadError(error?.message || "Failed to approve listing");
    } finally {
      setStatusLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(listing.id);
        return next;
      });
    }
  };

  const handleRejectStatus = async (listing: Listing) => {
    setStatusLoadingIds((prev) => new Set(prev).add(listing.id));
    try {
      // For now, still use the stay-specific endpoint until we have a generic one
      await apiFetch(`/admin/stays/${listing.id}/reject`, {
        method: "POST",
      });
      setListings((prev) =>
        prev.map((item) =>
          item.id === listing.id ? { ...item, status: "Rejected" } : item
        )
      );
    } catch (error: any) {
      setLoadError(error?.message || "Failed to reject listing");
    } finally {
      setStatusLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(listing.id);
        return next;
      });
    }
  };

  const handleChangeStatus = async (listing: Listing, newStatus: Status) => {
    if (newStatus === listing.status) return;
    if (newStatus === "Approved") {
      await handleApproveStatus(listing);
      return;
    }
    if (newStatus === "Rejected") {
      await handleRejectStatus(listing);
      return;
    }

    setListings((prev) =>
      prev.map((item) =>
        item.id === listing.id ? { ...item, status: "Pending Review" } : item
      )
    );
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
          {CATEGORIES.map((cat) => {
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
        </div>

        {/* Filter */}
        <button
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] transition-all"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          <Filter size={12} />
          Filter
        </button>

        {/* Add Listing */}
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
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px var(--border-accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px var(--border-accent)";
          }}
        >
          <Plus size={13} />
          Add Listing
        </button>
      </div>

      {loadError && (
        <div
          className="rounded-lg px-3 py-2 text-[12px]"
          style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#f87171" }}
        >
          {loadError}
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
          {loading ? (
            <div className="px-5 py-10 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              Loading saved listings...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              No listings found.
            </div>
          ) : filtered.map((listing, i) => {
            const catStyle = CATEGORY_COLORS[listing.category];
            const statStyle = STATUS_COLORS[listing.status];
            const isSelected = selected.has(listing.id);
            return (
              <div
                key={listing.id}
                className="grid items-center px-4 py-3 transition-all group cursor-pointer"
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
                  <ListingThumbnail category={listing.category} color={listing.color} imageUrl={listing.coverUrl} />
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
                  {listing.category === "Stay" && ["Pending Review", "Approved", "Rejected"].includes(listing.status) ? (
                    <select
                      value={listing.status}
                      onChange={(e) => handleChangeStatus(listing, e.target.value as Status)}
                      disabled={statusLoadingIds.has(listing.id)}
                      className="text-[11px] rounded-full px-3 py-1.5 border border-slate-200 bg-white text-slate-900 shadow-sm outline-none transition duration-150 focus:ring-2 focus:ring-accent/30"
                      style={{
                        background: statStyle.bg,
                        color: statStyle.text,
                        borderColor: statStyle.dot,
                        minWidth: "140px",
                      }}
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px]"
                      style={{
                        background: statStyle.bg,
                        color: statStyle.text,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: statStyle.dot, boxShadow: `0 0 4px ${statStyle.dot}` }}
                      />
                      {listing.status}
                    </span>
                  )}
                </div>

                {/* Last Updated */}
                <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  {listing.lastUpdated}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className={ACTION_BUTTON_CLASS}
                    style={{ color: "var(--text-secondary)" }}
                    onClick={() => navigate(`/listings/${listing.id}/edit`)}
                    aria-label="Edit listing"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className={ACTION_BUTTON_CLASS}
                    style={{ color: "var(--text-secondary)" }}
                    onClick={() => navigate(`/listings/${listing.id}`)}
                    aria-label="View listing"
                  >
                    <Eye size={13} />
                  </button>
                  {listing.category === "Stay" && listing.status === "Pending Review" && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveStatus(listing);
                        }}
                        disabled={statusLoadingIds.has(listing.id)}
                        className={ACTION_BUTTON_CLASS}
                        style={{ color: statusLoadingIds.has(listing.id) ? "#94a3b8" : "#22c55e" }}
                        aria-label="Approve listing"
                      >
                        {statusLoadingIds.has(listing.id) ? (
                          <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-current animate-spin" />
                        ) : (
                          <CheckSquare size={13} />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectStatus(listing);
                        }}
                        disabled={statusLoadingIds.has(listing.id)}
                        className={ACTION_BUTTON_CLASS}
                        style={{ color: statusLoadingIds.has(listing.id) ? "#94a3b8" : "#ef4444" }}
                        aria-label="Reject listing"
                      >
                        <X size={13} />
                      </button>
                    </>
                  )}
                  {listing.category === "Stay" && listing.status !== "Pending Review" && (
                    <>
                      <button
                        onClick={() => setArchiveModal(listing)}
                        className={ACTION_BUTTON_CLASS}
                        style={{ color: "#f59e0b" }}
                        aria-label="Archive listing"
                      >
                        <Archive size={13} />
                      </button>
                      {listing.status === "Draft" && (
                        <button
                          onClick={() => setDeleteModal(listing)}
                          className={ACTION_BUTTON_CLASS}
                          style={{ color: "#ef4444" }}
                          aria-label="Delete listing"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </>
                  )}
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
      </div>

      {/* Modals */}
      {archiveModal && (
        <ArchiveModal
          listing={archiveModal}
          onConfirm={handleArchiveListing}
          onCancel={() => setArchiveModal(null)}
          loading={operationLoading}
        />
      )}
      
      {deleteModal && (
        <DeleteModal
          listing={deleteModal}
          onConfirm={handleDeleteListing}
          onCancel={() => setDeleteModal(null)}
          loading={operationLoading}
        />
      )}
    </div>
  );
}

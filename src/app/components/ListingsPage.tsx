import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../contexts/AuthContext";
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
} from "lucide-react";

type Category = "All" | "Stay" | "Tour" | "Safari" | "Experience" | "Transfer";
type Status = "Active" | "Draft" | "Pending Review" | "Approved" | "Rejected" | "Archived";
type ApiListingStatus = "draft" | "submitted" | "published" | "rejected" | "archived";

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

interface AdminListingResponse {
  id: string;
  category: "stay" | "tour" | "safari" | "experience" | "transfer";
  title: string;
  description?: string | null;
  isActive?: boolean;
  status?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  destination?: { name?: string | null } | null;
  coverImage?: { url?: string | null } | null;
  cover_image?: { url?: string | null } | null;
  gallery?: Array<{ url?: string | null }>;
  fromPrice?: { amount?: number | null } | null;
  variants?: unknown[];
  hotelDetail?: {
    propertyName?: string | null;
    shortLocation?: string | null;
    addressLine1?: string | null;
    city?: string | null;
    district?: string | null;
  } | null;
  safariDetail?: { nationalPark?: string | null } | null;
  tourDetail?: { routeSummary?: string | null; meetingPoint?: string | null } | null;
  activityDetail?: { meetingPoint?: string | null; activityType?: string | null } | null;
  transferDetail?: { originType?: string | null; destinationType?: string | null } | null;
}

interface AdminSnapshotResponse {
  listings: Record<"stay" | "tour" | "safari" | "experience" | "transfer", AdminListingResponse[]>;
}

type AdminCategoryQuery = "all" | "stay" | "tour" | "safari" | "experience" | "transfer";
type VendorCategoryQuery = "all" | "stay" | "safari" | "experience";

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

const CATEGORIES: Category[] = ["All", "Stay", "Tour", "Safari", "Experience", "Transfer"];
const VENDOR_CATEGORIES: Category[] = ["All", "Stay", "Safari", "Experience"];
const STATUS_OPTIONS: Status[] = ["Draft", "Pending Review", "Approved", "Rejected", "Archived"];
const PAGE_SIZE = 10;

const STATUS_TO_API: Record<Status, ApiListingStatus> = {
  Active: "published",
  Draft: "draft",
  "Pending Review": "submitted",
  Approved: "published",
  Rejected: "rejected",
  Archived: "archived",
};

const THUMBNAIL_GRADIENTS: Record<Exclude<Category, "All">, string> = {
  Safari: "linear-gradient(135deg, #052e16 0%, #064e3b 50%, #065f46 100%)",
  Tour: "linear-gradient(135deg, #0c2d48 0%, #0e4f6d 50%, #0891b2 100%)",
  Stay: "linear-gradient(135deg, #1e1b4b 0%, #1d4ed8 50%, #2563eb 100%)",
  Experience: "linear-gradient(135deg, #431407 0%, #92400e 50%, #d97706 100%)",
  Transfer: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
};

const CATEGORY_LABELS: Record<AdminListingResponse["category"], Exclude<Category, "All">> = {
  stay: "Stay",
  tour: "Tour",
  safari: "Safari",
  experience: "Experience",
  transfer: "Transfer",
};

const CATEGORY_HEX: Record<Exclude<Category, "All">, string> = {
  Stay: "#2563eb",
  Tour: "#0891b2",
  Safari: "#059669",
  Experience: "#d97706",
  Transfer: "#64748b",
};

const ADMIN_QUERY_TO_CATEGORY: Record<AdminCategoryQuery, Category> = {
  all: "All",
  stay: "Stay",
  tour: "Tour",
  safari: "Safari",
  experience: "Experience",
  transfer: "Transfer",
};

const CATEGORY_TO_ADMIN_QUERY: Partial<Record<Category, AdminCategoryQuery>> = {
  Stay: "stay",
  Tour: "tour",
  Safari: "safari",
  Experience: "experience",
  Transfer: "transfer",
};

const ADMIN_CATEGORY_ENDPOINTS: Partial<Record<AdminCategoryQuery, string>> = {
  stay: "/admin/listings/stay",
  tour: "/admin/listings/tour",
  safari: "/admin/listings/safari",
  experience: "/admin/listings/experience",
  transfer: "/admin/listings/transfer",
};

function normalizeAdminCategoryQuery(value: string | null): AdminCategoryQuery {
  if (value === "stay" || value === "tour" || value === "safari" || value === "experience" || value === "transfer" || value === "all") {
    return value;
  }
  return "all";
}

function normalizeVendorCategoryQuery(value: string | null): VendorCategoryQuery {
  if (value === "stay" || value === "safari" || value === "experience" || value === "all") {
    return value;
  }
  return "all";
}

function mapListingStatus(listing: AdminListingResponse): Status {
  const normalized = (listing.status || "").toLowerCase();
  if (normalized === "draft") return "Draft";
  if (normalized === "published" || normalized === "approved" || normalized === "active") return "Approved";
  if (normalized === "archived") return "Archived";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "pending" || normalized === "pending_review" || normalized === "submitted") return "Pending Review";
  if (listing.isActive !== false && listing.fromPrice?.amount != null && listing.fromPrice.amount > 0) return "Approved";
  return "Draft";
}

function formatListingDate(value?: string) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function listingLocation(listing: AdminListingResponse) {
  const detail = listing.hotelDetail;
  if (detail) {
    return [detail.city || detail.shortLocation || detail.addressLine1, detail.district].filter(Boolean).join(", ");
  }
  if (listing.safariDetail?.nationalPark) return listing.safariDetail.nationalPark;
  if (listing.tourDetail?.meetingPoint) return listing.tourDetail.meetingPoint;
  if (listing.activityDetail?.meetingPoint) return listing.activityDetail.meetingPoint;
  if (listing.transferDetail?.originType || listing.transferDetail?.destinationType) {
    return [listing.transferDetail.originType, listing.transferDetail.destinationType].filter(Boolean).join(" to ");
  }
  return listing.destination?.name || "Location not set";
}

function adminListingToListing(listing: AdminListingResponse): Listing {
  const category = CATEGORY_LABELS[listing.category];
  const cover = listing.coverImage?.url || listing.cover_image?.url || listing.gallery?.find((item) => item.url)?.url || undefined;
  const location = listingLocation(listing) || "Location not set";
  return {
    id: listing.id,
    title: listing.title,
    location,
    category,
    destination: listing.destination?.name || location,
    media: listing.gallery?.length ?? (cover ? 1 : 0),
    variants: listing.variants?.length ?? 0,
    status: mapListingStatus(listing),
    lastUpdated: formatListingDate(listing.updatedAt || listing.createdAt || undefined),
    color: CATEGORY_HEX[category],
    coverUrl: cover,
  };
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

export function ListingsPage() {
  const navigate = useNavigate();
  const { effectiveUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = effectiveUser?.role === "admin";
  const isVendor = effectiveUser?.role === "vendor";
  const isPendingVendor = effectiveUser?.role === "vendor" && effectiveUser?.vendorStatus !== "approved";
  const adminQueryCategory = normalizeAdminCategoryQuery(searchParams.get("category"));
  const vendorQueryCategory = normalizeVendorCategoryQuery(searchParams.get("category"));
  const [activeCategory, setActiveCategory] = useState<Category>(() =>
    isAdmin ? ADMIN_QUERY_TO_CATEGORY[adminQueryCategory] : ADMIN_QUERY_TO_CATEGORY[vendorQueryCategory]
  );
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isAdmin) {
      setActiveCategory(ADMIN_QUERY_TO_CATEGORY[adminQueryCategory]);
      return;
    }
    if (isVendor) {
      setActiveCategory(ADMIN_QUERY_TO_CATEGORY[vendorQueryCategory]);
    }
  }, [adminQueryCategory, isAdmin, isVendor, vendorQueryCategory]);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      setLoading(true);
      setLoadError(null);
      try {
        const queryCategory = isAdmin ? adminQueryCategory : vendorQueryCategory;
        const endpoint = ADMIN_CATEGORY_ENDPOINTS[queryCategory] || "/admin/snapshot";
        const response = await apiFetch<AdminSnapshotResponse | AdminListingResponse[]>(endpoint);
        if (!cancelled) {
          const rawListings = Array.isArray(response)
            ? response
            : Object.values(response.listings).flat();
          const realListings = rawListings.map(adminListingToListing);
          setListings(realListings);
        }
      } catch (error: any) {
        if (!cancelled) {
          setLoadError(error?.message || "Unable to load saved listings.");
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
  }, [adminQueryCategory, isAdmin, vendorQueryCategory]);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category);

    if (!isAdmin && !isVendor) {
      return;
    }

    const nextQueryCategory = category === "All" ? "all" : CATEGORY_TO_ADMIN_QUERY[category];
    if (!nextQueryCategory || nextQueryCategory === "all") {
      setSearchParams(new URLSearchParams());
      return;
    }

    const nextParams = new URLSearchParams();
    nextParams.set("category", nextQueryCategory);
    setSearchParams(nextParams);
  };

  const visibleCategories = isVendor ? VENDOR_CATEGORIES : CATEGORIES;

  const filtered = listings.filter((l) => {
    const matchCat = activeCategory === "All" || l.category === activeCategory;
    const matchSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.destination.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginatedListings = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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
    const pageIds = paginatedListings.map((l) => l.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const visiblePageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter((pageNumber) => {
    if (totalPages <= 5) return true;
    return pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - currentPage) <= 1;
  });

  const changePage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  const allCurrentPageSelected =
    paginatedListings.length > 0 && paginatedListings.every((listing) => selected.has(listing.id));

  const clearSelectionIfHidden = () => {
    const visibleIds = new Set(filtered.map((listing) => listing.id));
    setSelected((prev) => {
      const next = new Set([...prev].filter((id) => visibleIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  };

  useEffect(() => {
    clearSelectionIfHidden();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, search, listings.length]);

  const updateListingStatus = async (listing: Listing, nextStatus: Status) => {
    if (listing.status === nextStatus || updatingStatusId) return;

    const previousListings = listings;
    const previousStatus = listing.status;
    setUpdatingStatusId(listing.id);
    setLoadError(null);
    setListings((current) =>
      current.map((item) => (item.id === listing.id ? { ...item, status: nextStatus } : item))
    );

    try {
      const response = await apiFetch<AdminListingResponse>(
        `/admin/listings/${listing.category.toLowerCase()}/${listing.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: STATUS_TO_API[nextStatus] }),
        }
      );
      const updated = adminListingToListing(response);
      setListings((current) => current.map((item) => (item.id === listing.id ? updated : item)));
    } catch (error: any) {
      setListings(previousListings);
      setLoadError(error?.message || `Unable to change status from ${previousStatus} to ${nextStatus}.`);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const deleteListing = async (listing: Listing) => {
    const confirmed = window.confirm(`Delete "${listing.title}" permanently? This cannot be undone.`);
    if (!confirmed || deletingListingId) return;

    const previousListings = listings;
    setDeletingListingId(listing.id);
    setOpenActionId(null);
    setLoadError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(listing.id);
      return next;
    });
    setListings((current) => current.filter((item) => item.id !== listing.id));

    try {
      await apiFetch(`/admin/listings/${listing.category.toLowerCase()}/${listing.id}`, {
        method: "DELETE",
      });
    } catch (error: any) {
      setListings(previousListings);
      setLoadError(error?.message || `Unable to delete "${listing.title}".`);
    } finally {
      setDeletingListingId(null);
    }
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
          {visibleCategories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
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
        {isPendingVendor ? (
          <div className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-[12px] font-medium shrink-0"
               style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
            Your vendor account is pending admin approval.
          </div>
        ) : (
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
        )}
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
        className="rounded-xl overflow-visible"
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
                border: allCurrentPageSelected
                  ? "1.5px solid var(--accent-navy)"
                  : "1.5px solid var(--border-medium)",
                background: allCurrentPageSelected
                  ? "var(--accent-navy)"
                  : "transparent",
              }}
            >
              {allCurrentPageSelected && (
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
          ) : paginatedListings.map((listing, i) => {
            const catStyle = CATEGORY_COLORS[listing.category];
            const statStyle = STATUS_COLORS[listing.status];
            const isSelected = selected.has(listing.id);
            return (
              <div
                key={listing.id}
                className="grid items-center px-4 py-3 transition-all group cursor-pointer"
                style={{
                  gridTemplateColumns: "36px 2fr 1fr 1fr 80px 80px 100px 110px 80px",
                  borderBottom: i < paginatedListings.length - 1 ? "1px solid var(--border-light)" : "none",
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
                  <div
                    className="relative inline-flex items-center h-6 rounded-full"
                    style={{
                      background: statStyle.bg,
                      color: statStyle.text,
                      opacity: updatingStatusId === listing.id ? 0.65 : 1,
                    }}
                  >
                    <span
                      className="absolute left-2 w-1.5 h-1.5 rounded-full pointer-events-none"
                      style={{ background: statStyle.dot, boxShadow: `0 0 4px ${statStyle.dot}` }}
                    />
                    {isAdmin ? (
                      <>
                        <select
                          value={listing.status}
                          disabled={updatingStatusId === listing.id}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateListingStatus(listing, e.target.value as Status);
                          }}
                          className="h-6 w-[92px] rounded-full text-[11px] outline-none cursor-pointer"
                          style={{
                            appearance: "none",
                            WebkitAppearance: "none",
                            background: "transparent",
                            border: "none",
                            color: statStyle.text,
                            paddingLeft: 18,
                            paddingRight: 18,
                            fontWeight: 500,
                          }}
                          aria-label={`Change status for ${listing.title}`}
                        >
                          {STATUS_OPTIONS.map((statusOption) => (
                            <option key={statusOption} value={statusOption}>
                              {statusOption}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={10}
                          className="absolute right-2 pointer-events-none"
                          style={{ color: statStyle.text }}
                        />
                      </>
                    ) : (
                      <span className="text-[11px] font-medium px-5 whitespace-nowrap">
                        {listing.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Last Updated */}
                <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  {listing.lastUpdated}
                </div>

                {/* Actions */}
                <div className={`flex items-center gap-1 transition-opacity ${openActionId === listing.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
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
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/listings/${listing.id}/edit`);
                    }}
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
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenActionId((current) => (current === listing.id ? null : listing.id));
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        color: openActionId === listing.id ? "var(--text-primary)" : "var(--text-secondary)",
                        background: openActionId === listing.id ? "var(--hover-overlay)" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                        (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                      }}
                      onMouseLeave={(e) => {
                        if (openActionId !== listing.id) {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                        }
                      }}
                    >
                      <MoreHorizontal size={13} />
                    </button>
                    {openActionId === listing.id && (
                      <div
                        className="absolute right-0 top-8 z-30 w-32 rounded-lg p-1"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: "var(--bg-panel)",
                          border: "1px solid var(--border-light)",
                          boxShadow: "var(--shadow-md)",
                        }}
                      >
                        <button
                          type="button"
                          disabled={deletingListingId === listing.id}
                          onClick={() => deleteListing(listing)}
                          className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12px] transition-all disabled:opacity-50"
                          style={{ color: "#ef4444" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(239, 68, 68, 0.08)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                          }}
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    )}
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
            Showing{" "}
            <span style={{ color: "var(--text-secondary)" }}>
              {filtered.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filtered.length)}
            </span>{" "}
            of{" "}
            <span style={{ color: "var(--text-secondary)" }}>{listings.length}</span> listings
            {activeCategory !== "All" || search ? (
              <span> filtered to <span style={{ color: "var(--text-secondary)" }}>{filtered.length}</span></span>
            ) : null}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-7 px-2 rounded-lg flex items-center justify-center text-[12px] transition-all disabled:opacity-40"
              style={{ color: "var(--text-tertiary)" }}
            >
              Prev
            </button>
            {visiblePageNumbers.map((p, index) => (
              <div key={p} className="flex items-center gap-2">
                {index > 0 && p - visiblePageNumbers[index - 1] > 1 ? (
                  <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>...</span>
                ) : null}
              <button
                onClick={() => changePage(p)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] transition-all"
                style={
                  p === currentPage
                    ? { background: "var(--active-overlay)", color: "var(--accent-navy-light)", border: "1px solid var(--border-accent)" }
                    : { color: "var(--text-tertiary)" }
                }
              >
                {p}
              </button>
              </div>
            ))}
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-7 px-2 rounded-lg flex items-center justify-center text-[12px] transition-all disabled:opacity-40"
              style={{ color: "var(--text-tertiary)" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

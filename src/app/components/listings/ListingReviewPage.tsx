import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  CheckSquare,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Star,
  Image as ImageIcon,
  DollarSign,
  FileText,
  Building2,
  Compass,
  Globe,
  Anchor,
  Car,
  MapPin,
} from "lucide-react";
import { ListingReviewDrawer } from "./ListingReviewDrawer";
import { apiFetch } from "../api/apiClient";

type ListingStatus = "draft" | "submitted" | "pending_review" | "needs_changes" | "approved" | "rejected" | "archived";
type Category = "Stay" | "Tour" | "Safari" | "Experience" | "Transfer";

interface Listing {
  id: string;
  thumbnail: string;
  name: string;
  category: Category;
  vendor: string;
  destination: string;
  mediaCount: number;
  startingPrice: number;
  qualityScore: number;
  status: ListingStatus;
  submittedDate: string;
  description: string;
  variants: number;
  hasDescription: boolean;
  hasPricing: boolean;
  hasPolicies: boolean;
  hasLocation: boolean;
  categoryFieldsComplete: boolean;
  issues?: string[];
  categoryData?: {
    // Stay
    roomTypes?: string[];
    amenities?: string[];
    checkIn?: string;
    checkOut?: string;
    cancellationPolicy?: string;
    // Tour
    duration?: string;
    itinerary?: string[];
    inclusions?: string[];
    // Safari
    parkName?: string;
    vehicleType?: string;
    wildlife?: string[];
    // Experience
    activityType?: string;
    maxParticipants?: number;
    restrictions?: string[];
    // Transfer
    vehicleModel?: string;
    capacity?: number;
    route?: string;
  };
}

const STATUS_CONFIG: Record<ListingStatus, { bg: string; text: string; dot: string }> = {
  draft: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8", dot: "#64748b" },
  submitted: { bg: "rgba(59, 130, 246, 0.1)", text: "#60a5fa", dot: "#3b82f6" },
  pending_review: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", dot: "#f59e0b" },
  needs_changes: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444" },
  approved: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e" },
  rejected: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444" },
  archived: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8", dot: "#64748b" },
};

const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string; icon: any }> = {
  Stay: { bg: "rgba(37, 99, 235, 0.12)", text: "#60a5fa", border: "rgba(37,99,235,0.25)", icon: Building2 },
  Tour: { bg: "rgba(8, 145, 178, 0.12)", text: "#22d3ee", border: "rgba(8,145,178,0.25)", icon: Compass },
  Safari: { bg: "rgba(5, 150, 105, 0.12)", text: "#34d399", border: "rgba(5,150,105,0.25)", icon: Globe },
  Experience: { bg: "rgba(217, 119, 6, 0.12)", text: "#fbbf24", border: "rgba(217,119,6,0.25)", icon: Anchor },
  Transfer: { bg: "rgba(100, 116, 139, 0.12)", text: "#94a3b8", border: "rgba(100,116,139,0.25)", icon: Car },
};

// Sample listing data
export function ListingReviewPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const response: any = await apiFetch("/admin/snapshot");
        const rawListings = Object.values(response.listings || {}).flat() as any[];
        rawListings.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        const mappedListings: Listing[] = rawListings.map(l => ({
          id: l.id,
          thumbnail: l.coverImage?.url || l.cover_image?.url || l.gallery?.[0]?.url || "",
          name: l.title || "Untitled",
          category: (l.category.charAt(0).toUpperCase() + l.category.slice(1)) as Category,
          vendor: l.vendor_id ? `Vendor ${l.vendor_id.substring(0,6)}` : "Unknown",
          destination: l.destination?.name || "Unknown",
          mediaCount: l.gallery?.length || 0,
          startingPrice: l.fromPrice?.amount || 0,
          qualityScore: l.title && l.description ? 95 : 60,
          status: l.status === "published" ? "approved" : l.status === "draft" ? "draft" : l.status === "submitted" ? "pending_review" : "submitted",
          submittedDate: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "Just now",
          description: l.description || "",
          variants: l.variants?.length || 0,
          hasDescription: !!l.description,
          hasPricing: !!(l.fromPrice?.amount),
          hasPolicies: true,
          hasLocation: !!l.destination,
          categoryFieldsComplete: true,
          categoryData: l.hotelDetail || l.safariDetail || l.activityDetail || l.tourDetail || l.transferDetail
        }));
        setListings(mappedListings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const SAMPLE_LISTINGS = listings;

  const statusTabs = [
    { id: "all", label: "All", count: SAMPLE_LISTINGS.length },
    { id: "draft", label: "Draft", count: SAMPLE_LISTINGS.filter(l => l.status === "draft").length },
    { id: "submitted", label: "Submitted", count: SAMPLE_LISTINGS.filter(l => l.status === "submitted").length },
    { id: "pending_review", label: "Pending Review", count: SAMPLE_LISTINGS.filter(l => l.status === "pending_review").length },
    { id: "needs_changes", label: "Needs Changes", count: SAMPLE_LISTINGS.filter(l => l.status === "needs_changes").length },
    { id: "approved", label: "Approved", count: SAMPLE_LISTINGS.filter(l => l.status === "approved").length },
    { id: "rejected", label: "Rejected", count: SAMPLE_LISTINGS.filter(l => l.status === "rejected").length },
    { id: "archived", label: "Archived", count: SAMPLE_LISTINGS.filter(l => l.status === "archived").length },
  ];

  // Stats
  const stats = {
    pending: SAMPLE_LISTINGS.filter(l => l.status === "pending_review" || l.status === "submitted").length,
    needsChanges: SAMPLE_LISTINGS.filter(l => l.status === "needs_changes").length,
    approved: SAMPLE_LISTINGS.filter(l => l.status === "approved").length,
    avgQuality: Math.round(SAMPLE_LISTINGS.reduce((sum, l) => sum + l.qualityScore, 0) / SAMPLE_LISTINGS.length),
  };

  const filteredListings = SAMPLE_LISTINGS.filter((listing) => {
    const matchStatus = filterStatus === "all" || listing.status === filterStatus;
    const matchSearch = !search ||
      listing.name.toLowerCase().includes(search.toLowerCase()) ||
      listing.vendor.toLowerCase().includes(search.toLowerCase()) ||
      listing.destination.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const toggleSelect = (id: string) => {
    setSelectedListings(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedListings.size === filteredListings.length) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(filteredListings.map(l => l.id)));
    }
  };

  const handleViewListing = (listing: Listing) => {
    setSelectedListing(listing);
    setDrawerOpen(true);
  };

    const handleApproveListing = async (id: string) => {
    console.log("Approving listing:", id);
    try {
      const listing = listings.find(l => l.id === id);
      if (!listing) return;
      await apiFetch(`/admin/listings/${listing.category.toLowerCase()}/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'published' })
      });
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' } : l));
    } catch(err) {
      console.error('Failed to approve', err);
    }
  };

  

  const handleRejectListing = async (id: string, reason: string) => {
    console.log("Rejecting listing:", id, "Reason:", reason);
    try {
      const listing = listings.find(l => l.id === id);
      if (!listing) return;
      await apiFetch(`/admin/listings/${listing.category.toLowerCase()}/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected' })
      });
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected' } : l));
    } catch(err) {
      console.error('Failed to reject', err);
    }
  };

  const handleRequestChanges = (id: string, feedback: string[]) => {
    console.log("Requesting changes for listing:", id, "Feedback:", feedback);
    // In production: API call to send feedback to vendor
    // Update listing status to 'needs_changes'
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80", border: "rgba(34,197,94,0.3)" };
    if (score >= 75) return { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59,130,246,0.3)" };
    if (score >= 60) return { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245,158,11,0.3)" };
    return { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "rgba(239,68,68,0.3)" };
  };

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Listing Review & Approval
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Review and moderate marketplace listings for quality control
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
              style={{ background: "rgba(245,158,11,0.15)" }}
            >
              <Clock size={18} style={{ color: "#f59e0b" }} />
            </div>
          </div>
          <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.pending}
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Pending Review
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
              <AlertTriangle size={18} style={{ color: "#ef4444" }} />
            </div>
          </div>
          <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.needsChanges}
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Needs Changes
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
              <CheckCircle size={18} style={{ color: "#22c55e" }} />
            </div>
          </div>
          <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.approved}
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Approved Listings
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
              style={{ background: "rgba(59,130,246,0.15)" }}
            >
              <Star size={18} style={{ color: "#3b82f6" }} />
            </div>
          </div>
          <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.avgQuality}%
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Avg Quality Score
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
            placeholder="Search listings, vendors, destinations..."
            className="flex-1 bg-transparent outline-none text-[12px]"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* Filters */}
        <button
          className="flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] transition-all"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          <Filter size={13} />
          Category
          <ChevronDown size={12} />
        </button>

        <button
          className="flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] transition-all"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          <Filter size={13} />
          Vendor
          <ChevronDown size={12} />
        </button>

        <button
          className="flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] transition-all"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          <Star size={13} />
          Quality Score
          <ChevronDown size={12} />
        </button>

        <div className="flex-1" />

        {/* Bulk Actions */}
        {selectedListings.size > 0 && (
          <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            {selectedListings.size} selected
          </span>
        )}

        {/* Export */}
        <button
          className="flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] transition-all"
          style={{
            background: "var(--active-overlay)",
            color: "var(--accent-navy-light)",
            border: "1px solid var(--border-accent)",
          }}
        >
          <Download size={13} />
          Export
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {statusTabs.map((tab) => {
          const isActive = filterStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
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

      {/* Listings Table */}
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
            gridTemplateColumns: "36px 80px 240px 100px 140px 140px 80px 90px 100px 110px 110px 80px",
            borderBottom: "1px solid var(--border-light)",
            background: "var(--bg-elevated)",
          }}
        >
          <button onClick={toggleSelectAll} className="flex items-center justify-center">
            <div
              className="w-4 h-4 rounded flex items-center justify-center"
              style={{
                border: selectedListings.size === filteredListings.length && filteredListings.length > 0
                  ? "1.5px solid var(--accent-navy)"
                  : "1.5px solid var(--border-medium)",
                background: selectedListings.size === filteredListings.length && filteredListings.length > 0
                  ? "var(--accent-navy)"
                  : "transparent",
              }}
            >
              {selectedListings.size === filteredListings.length && filteredListings.length > 0 && (
                <CheckSquare size={10} className="text-white" />
              )}
            </div>
          </button>
          {["Thumbnail", "Listing Name", "Category", "Vendor", "Destination", "Media", "Price", "Quality", "Status", "Submitted", "Actions"].map((col) => (
            <div key={col} className="flex items-center gap-1">
              <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                {col}
              </span>
            </div>
          ))}
        </div>

        {/* Table Rows */}
        <div>
          {filteredListings.map((listing, i) => {
            const isSelected = selectedListings.has(listing.id);
            const statusConfig = STATUS_CONFIG[listing.status];
            const categoryConfig = CATEGORY_COLORS[listing.category];
            const qualityColor = getQualityColor(listing.qualityScore);
            const hasIssues = listing.issues && listing.issues.length > 0;

            return (
              <div
                key={listing.id}
                className="grid items-center px-4 py-3 transition-all group cursor-pointer"
                style={{
                  gridTemplateColumns: "36px 80px 240px 100px 140px 140px 80px 90px 100px 110px 110px 80px",
                  borderBottom: i < filteredListings.length - 1 ? "1px solid var(--border-light)" : "none",
                  background: isSelected ? "var(--active-overlay)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
                onClick={() => handleViewListing(listing)}
              >
                {/* Checkbox */}
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleSelect(listing.id)}
                    className="w-4 h-4 rounded flex items-center justify-center"
                    style={{
                      border: isSelected ? "1.5px solid var(--accent-navy)" : "1.5px solid var(--border-medium)",
                      background: isSelected ? "var(--accent-navy)" : "transparent",
                    }}
                  >
                    {isSelected && <CheckSquare size={10} className="text-white" />}
                  </button>
                </div>

                {/* Thumbnail */}
                <div
                  className="w-16 h-12 rounded-lg overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${categoryConfig.text}40, ${categoryConfig.text}20)`,
                    border: `1px solid ${categoryConfig.border}`,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={16} style={{ color: categoryConfig.text, opacity: 0.6 }} />
                  </div>
                </div>

                {/* Listing Name */}
                <div className="min-w-0">
                  <p className="text-[13px] truncate mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {listing.name}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    {listing.id}
                  </p>
                </div>

                {/* Category */}
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px]"
                    style={{
                      background: categoryConfig.bg,
                      color: categoryConfig.text,
                      border: `1px solid ${categoryConfig.border}`,
                    }}
                  >
                    <categoryConfig.icon size={11} />
                    {listing.category}
                  </span>
                </div>

                {/* Vendor */}
                <div className="min-w-0">
                  <p className="text-[11px] truncate" style={{ color: "var(--text-secondary)" }}>
                    {listing.vendor}
                  </p>
                </div>

                {/* Destination */}
                <div className="min-w-0">
                  <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                    {listing.destination}
                  </p>
                </div>

                {/* Media Count */}
                <div className="flex items-center gap-1.5">
                  <ImageIcon size={11} style={{ color: "var(--text-tertiary)" }} />
                  <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    {listing.mediaCount}
                  </span>
                </div>

                {/* Price */}
                <div>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    ${listing.startingPrice}
                  </p>
                </div>

                {/* Quality Score */}
                <div>
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                    style={{
                      background: qualityColor.bg,
                      border: `1px solid ${qualityColor.border}`,
                    }}
                  >
                    <Star size={11} style={{ color: qualityColor.text }} />
                    <span className="text-[12px]" style={{ color: qualityColor.text, fontWeight: 600 }}>
                      {listing.qualityScore}%
                    </span>
                  </div>
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
                    {listing.status.replace("_", " ")}
                  </span>
                  {hasIssues && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle size={10} style={{ color: "#ef4444" }} />
                      <span className="text-[9px]" style={{ color: "#ef4444" }}>
                        {listing.issues!.length} issue{listing.issues!.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submitted */}
                <div>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {listing.submittedDate}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleViewListing(listing)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <MoreHorizontal size={13} />
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
            Showing <span style={{ color: "var(--text-secondary)" }}>{filteredListings.length}</span> of{" "}
            <span style={{ color: "var(--text-secondary)" }}>{SAMPLE_LISTINGS.length}</span> listings
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

      {/* Listing Review Drawer */}
      {drawerOpen && selectedListing && (
        <ListingReviewDrawer
          listing={{
            ...selectedListing,
            price: selectedListing.startingPrice,
          }}
          onClose={() => setDrawerOpen(false)}
          onApprove={handleApproveListing}
          onReject={handleRejectListing}
          onRequestChanges={handleRequestChanges}
        />
      )}
    </div>
  );
}

import { useState } from "react";
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
}

const LISTINGS: Listing[] = [
  { id: "lst_001", title: "Jetwing Yala Resort", location: "Yala, Southern Province", category: "Stay", destination: "Yala, Sri Lanka", media: 24, variants: 8, status: "Approved", lastUpdated: "May 18, 2026", color: "#2563eb" },
  { id: "lst_002", title: "Cinnamon Wild Yala", location: "Yala, Southern Province", category: "Stay", destination: "Yala, Sri Lanka", media: 21, variants: 6, status: "Approved", lastUpdated: "May 17, 2026", color: "#2563eb" },
  { id: "lst_003", title: "Shangri-La Colombo", location: "Colombo, Western Province", category: "Stay", destination: "Colombo, Sri Lanka", media: 32, variants: 12, status: "Approved", lastUpdated: "May 16, 2026", color: "#2563eb" },
  { id: "lst_004", title: "Galle Fort Hotel", location: "Galle, Southern Province", category: "Stay", destination: "Galle, Sri Lanka", media: 16, variants: 5, status: "Pending Review", lastUpdated: "May 16, 2026", color: "#2563eb" },
  { id: "lst_005", title: "Amangalla Heritage Resort", location: "Galle, Southern Province", category: "Stay", destination: "Galle, Sri Lanka", media: 28, variants: 9, status: "Approved", lastUpdated: "May 15, 2026", color: "#2563eb" },
  { id: "lst_006", title: "Heritance Tea Factory", location: "Nuwara Eliya, Central Province", category: "Stay", destination: "Nuwara Eliya, Sri Lanka", media: 19, variants: 7, status: "Draft", lastUpdated: "May 14, 2026", color: "#2563eb" },
  { id: "lst_007", title: "Yala National Park Safari", location: "Yala, Southern Province", category: "Safari", destination: "Yala, Sri Lanka", media: 12, variants: 3, status: "Approved", lastUpdated: "May 15, 2026", color: "#059669" },
  { id: "lst_008", title: "Minneriya Wildlife Safari", location: "Minneriya, North Central", category: "Safari", destination: "Minneriya, Sri Lanka", media: 8, variants: 2, status: "Pending Review", lastUpdated: "May 14, 2026", color: "#059669" },
  { id: "lst_009", title: "Wasgamuwa Safari Experience", location: "Wasgamuwa, Central Province", category: "Safari", destination: "Wasgamuwa, Sri Lanka", media: 5, variants: 1, status: "Draft", lastUpdated: "May 10, 2026", color: "#059669" },
  { id: "lst_010", title: "Kaudulla National Park Safari", location: "Kaudulla, North Central", category: "Safari", destination: "Kaudulla, Sri Lanka", media: 9, variants: 2, status: "Approved", lastUpdated: "May 12, 2026", color: "#059669" },
  { id: "lst_011", title: "Lunugamvehera Wildlife Camp", location: "Lunugamvehera, Uva Province", category: "Safari", destination: "Lunugamvehera, Sri Lanka", media: 11, variants: 3, status: "Approved", lastUpdated: "May 8, 2026", color: "#059669" },
  { id: "lst_012", title: "Galle Fort Heritage Walking Tour", location: "Galle, Southern Province", category: "Tour", destination: "Galle, Sri Lanka", media: 7, variants: 2, status: "Approved", lastUpdated: "May 13, 2026", color: "#0891b2" },
  { id: "lst_013", title: "Colombo Sunset City Experience", location: "Colombo, Western Province", category: "Experience", destination: "Colombo, Sri Lanka", media: 4, variants: 1, status: "Pending Review", lastUpdated: "May 7, 2026", color: "#d97706" },
  { id: "lst_014", title: "CMB Airport Executive Transfer", location: "Katunayake, Western Province", category: "Transfer", destination: "Colombo, Sri Lanka", media: 3, variants: 4, status: "Approved", lastUpdated: "May 11, 2026", color: "#64748b" },
  { id: "lst_015", title: "Heritance Kandalama Retreat", location: "Dambulla, Central Province", category: "Stay", destination: "Dambulla, Sri Lanka", media: 18, variants: 5, status: "Approved", lastUpdated: "May 16, 2026", color: "#2563eb" },
  { id: "lst_016", title: "Ceylon Tea Factory Experience", location: "Nuwara Eliya, Central Province", category: "Tour", destination: "Nuwara Eliya, Sri Lanka", media: 6, variants: 1, status: "Rejected", lastUpdated: "Apr 20, 2026", color: "#0891b2" },
];

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

export function ListingsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = LISTINGS.filter((l) => {
    const matchCat = activeCategory === "All" || l.category === activeCategory;
    const matchSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.destination.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total: LISTINGS.length,
    approved: LISTINGS.filter((l) => l.status === "Approved").length,
    pending: LISTINGS.filter((l) => l.status === "Pending Review").length,
    draft: LISTINGS.filter((l) => l.status === "Draft").length,
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
          {filtered.map((listing, i) => {
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
                </div>

                {/* Last Updated */}
                <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  {listing.lastUpdated}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
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
                    onClick={() => navigate(`/listings/${listing.id}/edit`)}
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
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
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
            Showing <span style={{ color: "var(--text-secondary)" }}>{filtered.length}</span> of{" "}
            <span style={{ color: "var(--text-secondary)" }}>{LISTINGS.length}</span> listings
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
    </div>
  );
}

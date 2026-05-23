import { useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  Download,
  Search,
  Filter,
  Grid3x3,
  List,
  CheckSquare,
  Folder,
  Plus,
  X,
} from "lucide-react";

type MediaType = "all" | "images" | "videos" | "documents";
type ViewMode = "grid" | "list";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "document";
  size: string;
  uploadDate: string;
  usedIn: string[];
  url: string;
  featured: boolean;
}

const MEDIA_ITEMS: MediaItem[] = [
  {
    id: "media_001",
    name: "yala-leopard-sunset.jpg",
    type: "image",
    size: "2.4 MB",
    uploadDate: "May 15, 2026",
    usedIn: ["Yala National Park Safari"],
    url: "linear-gradient(135deg, #052e16, #065f46)",
    featured: true,
  },
  {
    id: "media_002",
    name: "minneriya-elephants.jpg",
    type: "image",
    size: "3.1 MB",
    uploadDate: "May 14, 2026",
    usedIn: ["Minneriya Wildlife Safari"],
    url: "linear-gradient(135deg, #1e3a5f, #0c4a6e)",
    featured: false,
  },
  {
    id: "media_003",
    name: "jeep-safari-trail.jpg",
    type: "image",
    size: "1.8 MB",
    uploadDate: "May 12, 2026",
    usedIn: ["Yala National Park Safari", "Kaudulla Safari"],
    url: "linear-gradient(135deg, #431407, #7c2d12)",
    featured: false,
  },
  {
    id: "media_004",
    name: "safari-route-map.pdf",
    type: "document",
    size: "456 KB",
    uploadDate: "May 10, 2026",
    usedIn: ["Yala National Park Safari"],
    url: "linear-gradient(135deg, #1c1917, #44403c)",
    featured: false,
  },
  {
    id: "media_005",
    name: "wildlife-highlights.jpg",
    type: "image",
    size: "2.9 MB",
    uploadDate: "May 08, 2026",
    usedIn: [],
    url: "linear-gradient(135deg, #0f172a, #1e293b)",
    featured: false,
  },
  {
    id: "media_006",
    name: "sunrise-safari-promo.mp4",
    type: "video",
    size: "15.2 MB",
    uploadDate: "May 05, 2026",
    usedIn: ["Yala National Park Safari"],
    url: "linear-gradient(135deg, #064e3b, #047857)",
    featured: false,
  },
];

export function MediaLibrary() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [typeFilter, setTypeFilter] = useState<MediaType>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filtered = MEDIA_ITEMS.filter((item) => {
    const matchType = typeFilter === "all" || item.type === typeFilter.replace("s", "");
    const matchSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.usedIn.some((listing) => listing.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  const stats = {
    total: MEDIA_ITEMS.length,
    images: MEDIA_ITEMS.filter((m) => m.type === "image").length,
    videos: MEDIA_ITEMS.filter((m) => m.type === "video").length,
    documents: MEDIA_ITEMS.filter((m) => m.type === "document").length,
    totalSize: "25.8 MB",
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((m) => m.id)));
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Media Library
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Manage and organize your media files for listings
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] transition-all"
          style={{
            background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
            color: "white",
            boxShadow: "0 0 16px var(--border-accent)",
            border: "1px solid var(--border-accent)",
            fontWeight: 500,
          }}
        >
          <Upload size={14} />
          Upload Media
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Total Files", value: stats.total, color: "#3b82f6" },
          { label: "Images", value: stats.images, color: "#22c55e" },
          { label: "Videos", value: stats.videos, color: "#f59e0b" },
          { label: "Documents", value: stats.documents, color: "#64748b" },
          { label: "Total Size", value: stats.totalSize, color: "#10b981" },
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
            <p className="text-[20px]" style={{ color, fontWeight: 700 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 h-9 rounded-lg w-64"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
            }}
          >
            <Search size={14} style={{ color: "var(--text-tertiary)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search media..."
              className="flex-1 bg-transparent outline-none text-[13px]"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-1.5">
            {(["all", "images", "videos", "documents"] as MediaType[]).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className="px-3 py-1.5 rounded-lg text-[12px] transition-all capitalize"
                style={
                  typeFilter === type
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
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Selection Actions */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2 mr-3">
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                {selected.size} selected
              </span>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          )}

          {/* View Toggle */}
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={
                viewMode === "grid"
                  ? {
                      background: "var(--active-overlay)",
                      color: "var(--accent-navy-light)",
                      border: "1px solid var(--border-accent)",
                    }
                  : {
                      color: "var(--text-tertiary)",
                      border: "1px solid var(--border-light)",
                    }
              }
            >
              <Grid3x3 size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={
                viewMode === "list"
                  ? {
                      background: "var(--active-overlay)",
                      color: "var(--accent-navy-light)",
                      border: "1px solid var(--border-accent)",
                    }
                  : {
                      color: "var(--text-tertiary)",
                      border: "1px solid var(--border-light)",
                    }
              }
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <div
                key={item.id}
                className="rounded-xl overflow-hidden group cursor-pointer transition-all relative"
                style={{
                  background: "var(--bg-panel)",
                  border: isSelected
                    ? "2px solid var(--border-accent)"
                    : "1px solid var(--border-light)",
                  boxShadow: isSelected ? "0 0 0 3px var(--accent-navy-subtle)" : "none",
                }}
                onClick={() => toggleSelect(item.id)}
              >
                {/* Thumbnail */}
                <div
                  className="aspect-square flex items-center justify-center relative"
                  style={{ background: item.url }}
                >
                  {item.type === "image" && <ImageIcon size={32} style={{ color: "rgba(255,255,255,0.3)" }} />}
                  {item.type === "video" && (
                    <div className="text-center">
                      <ImageIcon size={32} style={{ color: "rgba(255,255,255,0.3)" }} />
                      <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                        VIDEO
                      </p>
                    </div>
                  )}
                  {item.type === "document" && (
                    <div className="text-center">
                      <ImageIcon size={32} style={{ color: "rgba(255,255,255,0.3)" }} />
                      <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                        PDF
                      </p>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {item.featured && (
                    <div
                      className="absolute top-2 left-2 px-2 py-0.5 rounded flex items-center gap-1 text-[9px]"
                      style={{ background: "rgba(245,158,11,0.9)", color: "white" }}
                    >
                      <Star size={9} fill="currentColor" />
                      Featured
                    </div>
                  )}

                  {/* Selection Checkbox */}
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center transition-all"
                    style={{
                      background: isSelected ? "var(--accent-navy)" : "rgba(0,0,0,0.5)",
                      border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    {isSelected && <CheckSquare size={12} className="text-white" />}
                  </div>

                  {/* Hover Actions */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                  >
                    <button
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.2)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={14} className="text-white" />
                    </button>
                    <button
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(239,68,68,0.8)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-[12px] mb-1 truncate" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    <span>{item.size}</span>
                    <span>{item.uploadDate}</span>
                  </div>
                  {item.usedIn.length > 0 && (
                    <p className="text-[10px] mt-1 truncate" style={{ color: "var(--text-secondary)" }}>
                      Used in {item.usedIn.length} listing{item.usedIn.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* List Header */}
          <div
            className="grid items-center px-5 py-3"
            style={{
              gridTemplateColumns: "36px 2fr 1fr 100px 120px 1fr 80px",
              borderBottom: "1px solid var(--border-light)",
              background: "var(--bg-elevated)",
            }}
          >
            <button onClick={toggleSelectAll} className="flex items-center justify-center">
              <div
                className="w-4 h-4 rounded flex items-center justify-center"
                style={{
                  border:
                    selected.size === filtered.length && filtered.length > 0
                      ? "1.5px solid var(--accent-navy)"
                      : "1.5px solid var(--border-medium)",
                  background:
                    selected.size === filtered.length && filtered.length > 0
                      ? "var(--accent-navy)"
                      : "transparent",
                }}
              >
                {selected.size === filtered.length && filtered.length > 0 && (
                  <CheckSquare size={10} className="text-white" />
                )}
              </div>
            </button>
            {["Name", "Type", "Size", "Upload Date", "Used In", "Actions"].map((col) => (
              <div key={col}>
                <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                  {col}
                </span>
              </div>
            ))}
          </div>

          {/* List Rows */}
          <div>
            {filtered.map((item) => {
              const isSelected = selected.has(item.id);
              return (
                <div
                  key={item.id}
                  className="grid items-center px-5 py-3 transition-all group cursor-pointer"
                  style={{
                    gridTemplateColumns: "36px 2fr 1fr 100px 120px 1fr 80px",
                    borderBottom: "1px solid var(--border-light)",
                    background: isSelected ? "var(--active-overlay)" : "transparent",
                  }}
                  onClick={() => toggleSelect(item.id)}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {/* Checkbox */}
                  <div className="flex items-center justify-center">
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center"
                      style={{
                        border: isSelected
                          ? "1.5px solid var(--accent-navy)"
                          : "1.5px solid var(--border-medium)",
                        background: isSelected ? "var(--accent-navy)" : "transparent",
                      }}
                    >
                      {isSelected && <CheckSquare size={10} className="text-white" />}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex items-center gap-2">
                    {item.featured && <Star size={12} style={{ color: "#f59e0b" }} fill="#f59e0b" />}
                    <span className="text-[13px] truncate" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {item.name}
                    </span>
                  </div>

                  {/* Type */}
                  <span className="text-[12px] capitalize" style={{ color: "var(--text-secondary)" }}>
                    {item.type}
                  </span>

                  {/* Size */}
                  <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    {item.size}
                  </span>

                  {/* Upload Date */}
                  <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                    {item.uploadDate}
                  </span>

                  {/* Used In */}
                  <div className="truncate">
                    {item.usedIn.length > 0 ? (
                      <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                        {item.usedIn[0]}
                        {item.usedIn.length > 1 && ` +${item.usedIn.length - 1}`}
                      </span>
                    ) : (
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        Not used
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ color: "var(--text-secondary)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={13} />
                    </button>
                    <button
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ color: "var(--text-secondary)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6 z-50"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowUploadModal(false)}
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                Upload Media
              </h2>
              <button onClick={() => setShowUploadModal(false)}>
                <X size={20} style={{ color: "var(--text-tertiary)" }} />
              </button>
            </div>

            {/* Upload Area */}
            <div
              className="rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer transition-all p-12 mb-6"
              style={{
                border: "2px dashed var(--border-accent)",
                background: "var(--accent-navy-subtle)",
              }}
            >
              <Upload size={32} style={{ color: "var(--text-tertiary)" }} />
              <div className="text-center">
                <p className="text-[14px] mb-1" style={{ color: "var(--text-primary)" }}>
                  Drop files here or <span style={{ color: "var(--accent-navy)", fontWeight: 500 }}>click to upload</span>
                </p>
                <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  Supports: JPG, PNG, WEBP, MP4, PDF • Max 50MB per file
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 py-2.5 rounded-lg text-[13px] transition-all"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-light)",
                }}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 rounded-lg text-[13px] transition-all"
                style={{
                  background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                  color: "white",
                  boxShadow: "0 0 16px var(--border-accent)",
                  border: "1px solid var(--border-accent)",
                  fontWeight: 500,
                }}
              >
                Upload Files
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

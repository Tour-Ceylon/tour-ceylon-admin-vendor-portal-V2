import { useState } from "react";
import {
  Search,
  Filter,
  BedDouble,
  Wrench,
  Sparkles,
  Lock,
  CheckCircle,
  Users,
  Plus,
  ChevronDown,
  Edit3,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  X,
} from "lucide-react";

type UnitStatus = "available" | "occupied" | "maintenance" | "cleaning" | "blocked";

interface RoomUnit {
  id: string;
  unitId: string;
  roomType: string;
  typeColor: string;
  floor: number;
  status: UnitStatus;
  occupancy: string;
  cleaning: "clean" | "dirty" | "in-progress";
  maintenance: "ok" | "needed" | "in-progress";
  basePrice: number;
  lastUpdated: string;
  guest?: string;
  checkOut?: string;
}

const UNITS: RoomUnit[] = [
  { id: "1", unitId: "DLX-101", roomType: "Deluxe Room", typeColor: "#3b82f6", floor: 1, status: "occupied", occupancy: "2 adults", cleaning: "dirty", maintenance: "ok", basePrice: 120, lastUpdated: "10 min ago", guest: "Priya Sharma", checkOut: "Aug 21" },
  { id: "2", unitId: "DLX-102", roomType: "Deluxe Room", typeColor: "#3b82f6", floor: 1, status: "available", occupancy: "—", cleaning: "clean", maintenance: "ok", basePrice: 120, lastUpdated: "1 hr ago" },
  { id: "3", unitId: "DLX-103", roomType: "Deluxe Room", typeColor: "#3b82f6", floor: 1, status: "cleaning", occupancy: "—", cleaning: "in-progress", maintenance: "ok", basePrice: 120, lastUpdated: "35 min ago" },
  { id: "4", unitId: "DLX-104", roomType: "Deluxe Room", typeColor: "#3b82f6", floor: 1, status: "occupied", occupancy: "2 adults, 1 child", cleaning: "dirty", maintenance: "ok", basePrice: 120, lastUpdated: "2 hr ago", guest: "Tom Eriksson", checkOut: "Aug 22" },
  { id: "5", unitId: "DLX-105", roomType: "Deluxe Room", typeColor: "#3b82f6", floor: 1, status: "maintenance", occupancy: "—", cleaning: "clean", maintenance: "in-progress", basePrice: 120, lastUpdated: "3 hr ago" },
  { id: "6", unitId: "DLX-106", roomType: "Deluxe Room", typeColor: "#3b82f6", floor: 2, status: "available", occupancy: "—", cleaning: "clean", maintenance: "ok", basePrice: 125, lastUpdated: "1 hr ago" },
  { id: "7", unitId: "DLX-107", roomType: "Deluxe Room", typeColor: "#3b82f6", floor: 2, status: "available", occupancy: "—", cleaning: "clean", maintenance: "ok", basePrice: 125, lastUpdated: "1 hr ago" },
  { id: "8", unitId: "VILLA-01", roomType: "Ocean Villa", typeColor: "#10b981", floor: 0, status: "occupied", occupancy: "2 adults", cleaning: "dirty", maintenance: "ok", basePrice: 380, lastUpdated: "5 hr ago", guest: "Marcus Weber", checkOut: "Aug 25" },
  { id: "9", unitId: "VILLA-02", roomType: "Ocean Villa", typeColor: "#10b981", floor: 0, status: "available", occupancy: "—", cleaning: "clean", maintenance: "ok", basePrice: 380, lastUpdated: "2 hr ago" },
  { id: "10", unitId: "VILLA-03", roomType: "Ocean Villa", typeColor: "#10b981", floor: 0, status: "blocked", occupancy: "—", cleaning: "clean", maintenance: "needed", basePrice: 380, lastUpdated: "1 day ago" },
  { id: "11", unitId: "STE-201", roomType: "Suite", typeColor: "#8b5cf6", floor: 2, status: "occupied", occupancy: "2 adults", cleaning: "dirty", maintenance: "ok", basePrice: 280, lastUpdated: "4 hr ago", guest: "Yuki Tanaka", checkOut: "Aug 20" },
  { id: "12", unitId: "STE-202", roomType: "Suite", typeColor: "#8b5cf6", floor: 2, status: "available", occupancy: "—", cleaning: "clean", maintenance: "ok", basePrice: 280, lastUpdated: "2 hr ago" },
  { id: "13", unitId: "STE-203", roomType: "Suite", typeColor: "#8b5cf6", floor: 2, status: "cleaning", occupancy: "—", cleaning: "in-progress", maintenance: "ok", basePrice: 280, lastUpdated: "20 min ago" },
  { id: "14", unitId: "STD-001", roomType: "Standard Room", typeColor: "#f59e0b", floor: 1, status: "available", occupancy: "—", cleaning: "clean", maintenance: "ok", basePrice: 75, lastUpdated: "3 hr ago" },
  { id: "15", unitId: "STD-002", roomType: "Standard Room", typeColor: "#f59e0b", floor: 1, status: "occupied", occupancy: "1 adult", cleaning: "dirty", maintenance: "ok", basePrice: 75, lastUpdated: "1 hr ago", guest: "Anika Roth", checkOut: "Aug 23" },
  { id: "16", unitId: "STD-003", roomType: "Standard Room", typeColor: "#f59e0b", floor: 1, status: "available", occupancy: "—", cleaning: "clean", maintenance: "ok", basePrice: 75, lastUpdated: "2 hr ago" },
  { id: "17", unitId: "FAM-401", roomType: "Family Room", typeColor: "#ec4899", floor: 4, status: "occupied", occupancy: "2 adults, 2 children", cleaning: "dirty", maintenance: "ok", basePrice: 165, lastUpdated: "6 hr ago", guest: "James Okonkwo", checkOut: "Aug 24" },
  { id: "18", unitId: "FAM-402", roomType: "Family Room", typeColor: "#ec4899", floor: 4, status: "maintenance", occupancy: "—", cleaning: "clean", maintenance: "needed", basePrice: 165, lastUpdated: "1 day ago" },
];

const STATUS_CONFIG: Record<UnitStatus, { label: string; bg: string; text: string; icon: React.ComponentType<any> }> = {
  available:   { label: "Available",   bg: "rgba(34,197,94,0.12)",  text: "#4ade80",  icon: CheckCircle },
  occupied:    { label: "Occupied",    bg: "rgba(59,130,246,0.12)", text: "#60a5fa",  icon: Users },
  maintenance: { label: "Maintenance", bg: "rgba(251,191,36,0.12)", text: "#fbbf24",  icon: Wrench },
  cleaning:    { label: "Cleaning",    bg: "rgba(139,92,246,0.12)", text: "#a78bfa",  icon: Sparkles },
  blocked:     { label: "Blocked",     bg: "rgba(100,116,139,0.12)",text: "#94a3b8",  icon: Lock },
};

const CLEANING_CONFIG = {
  clean: { label: "Clean", color: "#4ade80" },
  dirty: { label: "Dirty", color: "#f87171" },
  "in-progress": { label: "Cleaning", color: "#a78bfa" },
};

const MAINTENANCE_CONFIG = {
  ok:          { label: "OK",       color: "#4ade80" },
  needed:      { label: "Needed",   color: "#f97316" },
  "in-progress":{ label: "Active",  color: "#fbbf24" },
};

// Add Room Type Modal
function AddRoomTypeModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("5");
  const [prefix, setPrefix] = useState("");
  const [price, setPrice] = useState("");
  const [preview, setPreview] = useState<string[]>([]);

  const generatePreview = () => {
    const q = parseInt(qty) || 0;
    const p = prefix.toUpperCase() || "RM";
    setPreview(Array.from({ length: Math.min(q, 6) }, (_, i) => `${p}-${String(i + 1).padStart(3, "0")}`));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div
        className="w-[440px] rounded-2xl p-6"
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>Add Room Type</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-card)", color: "var(--text-tertiary)" }}>
            <X size={14} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Room Type Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Deluxe Room"
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Unit Prefix</label>
              <input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g. DLX"
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Quantity</label>
              <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="5"
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
            </div>
          </div>
          <div>
            <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Base Price ($)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="120"
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
          </div>
          <button
            onClick={generatePreview}
            className="w-full py-2 rounded-lg text-[12px] flex items-center justify-center gap-1.5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            <RefreshCw size={12} />
            Preview Auto-Generated IDs
          </button>
          {preview.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {preview.map((id) => (
                <span key={id} className="text-[11px] px-2 py-0.5 rounded"
                  style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                  {id}
                </span>
              ))}
              {parseInt(qty) > 6 && (
                <span className="text-[11px] px-2 py-0.5 rounded" style={{ color: "var(--text-tertiary)" }}>
                  +{parseInt(qty) - 6} more
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-[13px]"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
            Cancel
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-[13px]"
            style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600, boxShadow: "0 0 12px var(--border-accent)" }}>
            Create {qty} Units
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoomInventory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UnitStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const roomTypes = Array.from(new Set(UNITS.map((u) => u.roomType)));

  const filtered = UNITS.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = u.unitId.toLowerCase().includes(q) || u.roomType.toLowerCase().includes(q) || (u.guest ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    const matchType = typeFilter === "all" || u.roomType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((u) => u.id));
  };

  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s] = UNITS.filter((u) => u.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-5 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BedDouble size={15} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>Room Inventory</span>
          </div>
          <h1 className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Jetwing Yala — {UNITS.length} Units
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px]"
          style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600, boxShadow: "0 0 12px var(--border-accent)" }}
        >
          <Plus size={14} />
          Add Room Type
        </button>
      </div>

      {/* Status summary chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className="px-3 py-1.5 rounded-lg text-[12px] transition-all"
          style={{
            background: statusFilter === "all" ? "var(--accent-navy)" : "var(--bg-card)",
            color: statusFilter === "all" ? "white" : "var(--text-secondary)",
            border: `1px solid ${statusFilter === "all" ? "transparent" : "var(--border-light)"}`,
            fontWeight: statusFilter === "all" ? 600 : 400,
          }}
        >
          All ({UNITS.length})
        </button>
        {(Object.entries(STATUS_CONFIG) as [UnitStatus, typeof STATUS_CONFIG[UnitStatus]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all"
            style={{
              background: statusFilter === key ? cfg.bg : "var(--bg-card)",
              color: statusFilter === key ? cfg.text : "var(--text-secondary)",
              border: `1px solid ${statusFilter === key ? cfg.text + "40" : "var(--border-light)"}`,
            }}
          >
            <cfg.icon size={11} />
            {cfg.label} ({statusCounts[key] ?? 0})
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1" style={{ minWidth: 220, maxWidth: 320 }}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by unit, type, guest…"
            className="w-full pl-8 pr-3 py-2 rounded-lg text-[13px] outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Type filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="appearance-none pl-3 pr-7 py-2 rounded-lg text-[13px] outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            <option value="all">All Types</option>
            {roomTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {selected.length} selected
            </span>
            {[
              { label: "Mark Available", color: "#4ade80" },
              { label: "Block", color: "#94a3b8" },
              { label: "Set Maintenance", color: "#fbbf24" },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => setSelected([])}
                className="px-3 py-1.5 rounded-lg text-[12px]"
                style={{ background: "var(--bg-card)", border: `1px solid ${a.color}30`, color: a.color }}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
      >
        {/* Table header */}
        <div
          className="grid text-[11px] uppercase tracking-wider px-5 py-3"
          style={{
            gridTemplateColumns: "32px 100px 1fr 120px 130px 110px 110px 80px 80px",
            borderBottom: "1px solid var(--border-light)",
            color: "var(--text-tertiary)",
            background: "var(--bg-panel)",
          }}
        >
          <div>
            <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
              onChange={toggleAll} className="w-3.5 h-3.5 rounded" />
          </div>
          <div>Unit ID</div>
          <div>Room Type</div>
          <div>Status</div>
          <div>Occupancy</div>
          <div>Cleaning</div>
          <div>Maintenance</div>
          <div>Rate</div>
          <div>Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
          {filtered.map((unit) => {
            const statusCfg = STATUS_CONFIG[unit.status];
            const cleaningCfg = CLEANING_CONFIG[unit.cleaning];
            const maintCfg = MAINTENANCE_CONFIG[unit.maintenance];
            const isSelected = selected.includes(unit.id);

            return (
              <div
                key={unit.id}
                className="grid items-center px-5 py-3 transition-all"
                style={{
                  gridTemplateColumns: "32px 100px 1fr 120px 130px 110px 110px 80px 80px",
                  background: isSelected ? "rgba(59,130,246,0.04)" : "transparent",
                }}
                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)"; }}
                onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <div>
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(unit.id)} className="w-3.5 h-3.5 rounded" />
                </div>

                {/* Unit ID */}
                <div>
                  <span
                    className="text-[12px] px-2 py-0.5 rounded font-mono"
                    style={{ background: `${unit.typeColor}15`, color: unit.typeColor, border: `1px solid ${unit.typeColor}25` }}
                  >
                    {unit.unitId}
                  </span>
                </div>

                {/* Room type + guest */}
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: unit.typeColor }} />
                    <span className="text-[13px]" style={{ color: "var(--text-primary)" }}>{unit.roomType}</span>
                  </div>
                  {unit.guest && (
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      {unit.guest} · out {unit.checkOut}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full"
                    style={{ background: statusCfg.bg, color: statusCfg.text }}
                  >
                    <statusCfg.icon size={10} />
                    {statusCfg.label}
                  </span>
                </div>

                {/* Occupancy */}
                <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  {unit.occupancy}
                </div>

                {/* Cleaning */}
                <div>
                  <span className="text-[11px]" style={{ color: cleaningCfg.color }}>
                    ● {cleaningCfg.label}
                  </span>
                </div>

                {/* Maintenance */}
                <div>
                  <span className="text-[11px]" style={{ color: maintCfg.color }}>
                    {unit.maintenance === "ok" ? "✓" : "⚠"} {maintCfg.label}
                  </span>
                </div>

                {/* Rate */}
                <div className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  ${unit.basePrice}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: "var(--bg-panel)", color: "var(--text-tertiary)" }}
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: "var(--bg-panel)", color: "var(--text-tertiary)" }}
                  >
                    <MoreHorizontal size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 flex flex-col items-center gap-2">
            <AlertCircle size={24} style={{ color: "var(--text-tertiary)" }} />
            <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>No units match your filters</p>
          </div>
        )}
      </div>

      {showAddModal && <AddRoomTypeModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

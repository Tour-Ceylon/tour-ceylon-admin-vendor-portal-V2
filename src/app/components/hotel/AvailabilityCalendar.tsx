import { useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  Unlock,
  DollarSign,
  BedDouble,
  Users,
  CalendarDays,
  AlertCircle,
  CheckCircle,
  Wrench,
  Edit3,
  Plus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CellStatus = "available" | "low" | "sold-out" | "blocked" | "maintenance";

interface DayCell {
  price: number;
  available: number;
  booked: number;
  blocked: boolean;
  maintenance: boolean;
  minStay?: number;
}

interface RoomType {
  id: string;
  name: string;
  total: number;
  color: string;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const ROOM_TYPES: RoomType[] = [
  { id: "deluxe", name: "Deluxe Room", total: 10, color: "#3b82f6" },
  { id: "villa", name: "Ocean Villa", total: 3, color: "#10b981" },
  { id: "suite", name: "Suite", total: 5, color: "#8b5cf6" },
  { id: "standard", name: "Standard Room", total: 15, color: "#f59e0b" },
  { id: "family", name: "Family Room", total: 6, color: "#ec4899" },
];

function generateMonthData(year: number, month: number): Record<string, Record<string, DayCell>> {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const data: Record<string, Record<string, DayCell>> = {};

  ROOM_TYPES.forEach((rt) => {
    data[rt.id] = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const rand = Math.random();
      const booked = Math.floor(Math.random() * (rt.total + 1));
      const blocked = rand > 0.92;
      const maintenance = rand > 0.96 && !blocked;
      const available = blocked || maintenance ? 0 : Math.max(0, rt.total - booked);
      const basePrices: Record<string, number> = {
        deluxe: 120,
        villa: 380,
        suite: 280,
        standard: 75,
        family: 165,
      };
      const weekend = new Date(year, month, d).getDay() % 6 === 0;
      data[rt.id][dateKey] = {
        price: Math.round(basePrices[rt.id] * (weekend ? 1.25 : 1) * (0.9 + Math.random() * 0.3)),
        available,
        booked: blocked || maintenance ? 0 : booked,
        blocked,
        maintenance,
        minStay: Math.random() > 0.8 ? 2 : 1,
      };
    }
  });

  return data;
}

// ─── Cell Component ───────────────────────────────────────────────────────────

function getCellStatus(cell: DayCell, total: number): CellStatus {
  if (cell.maintenance) return "maintenance";
  if (cell.blocked) return "blocked";
  if (cell.available === 0) return "sold-out";
  if (cell.available <= Math.ceil(total * 0.2)) return "low";
  return "available";
}

const STATUS_STYLES: Record<CellStatus, { bg: string; border: string; text: string; sub: string }> = {
  available:    { bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)",  text: "#93c5fd", sub: "#60a5fa" },
  low:          { bg: "rgba(249,115,22,0.1)",   border: "rgba(249,115,22,0.25)", text: "#fb923c", sub: "#f97316" },
  "sold-out":   { bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)",  text: "#f87171", sub: "#ef4444" },
  blocked:      { bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.15)",text: "#94a3b8", sub: "#64748b" },
  maintenance:  { bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)",  text: "#fbbf24", sub: "#f59e0b" },
};

// ─── Date Side Panel ──────────────────────────────────────────────────────────

interface DatePanelProps {
  date: string;
  roomType: RoomType;
  cell: DayCell;
  onClose: () => void;
  onUpdate: (date: string, rtId: string, updates: Partial<DayCell>) => void;
}

function DatePanel({ date, roomType, cell, onClose, onUpdate }: DatePanelProps) {
  const [price, setPrice] = useState(cell.price.toString());
  const [available, setAvailable] = useState(cell.available.toString());
  const [minStay, setMinStay] = useState((cell.minStay ?? 1).toString());
  const status = getCellStatus(cell, roomType.total);

  const d = new Date(date);
  const formatted = d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const occupancy = roomType.total > 0 ? Math.round((cell.booked / roomType.total) * 100) : 0;

  const handleSave = () => {
    onUpdate(date, roomType.id, {
      price: parseInt(price) || cell.price,
      available: parseInt(available) ?? cell.available,
      minStay: parseInt(minStay) || 1,
    });
    onClose();
  };

  return (
    <div
      className="fixed right-0 top-0 h-full w-[340px] flex flex-col z-50 shadow-2xl"
      style={{
        background: "var(--bg-panel)",
        borderLeft: "1px solid var(--border-light)",
        boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-start justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
        <div>
          <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: "var(--accent-navy)" }}>
            {roomType.name}
          </p>
          <p className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            {formatted}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{ background: "var(--bg-card)", color: "var(--text-tertiary)" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Status badge */}
      <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--border-light)" }}>
        <span
          className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full"
          style={{
            background: STATUS_STYLES[status].bg,
            border: `1px solid ${STATUS_STYLES[status].border}`,
            color: STATUS_STYLES[status].text,
          }}
        >
          {status === "available" && <CheckCircle size={11} />}
          {status === "low" && <AlertCircle size={11} />}
          {status === "sold-out" && <BedDouble size={11} />}
          {status === "blocked" && <Lock size={11} />}
          {status === "maintenance" && <Wrench size={11} />}
          {status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      </div>

      {/* Stats */}
      <div className="p-5 grid grid-cols-2 gap-3">
        {[
          { label: "Available", value: cell.available, icon: BedDouble, color: "#3b82f6" },
          { label: "Booked", value: cell.booked, icon: Users, color: "#10b981" },
          { label: "Occupancy", value: `${occupancy}%`, icon: CalendarDays, color: "#8b5cf6" },
          { label: "Nightly Rate", value: `$${cell.price}`, icon: DollarSign, color: "#f59e0b" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg p-3"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <s.icon size={12} style={{ color: s.color }} />
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{s.label}</span>
            </div>
            <p className="text-[18px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Edit fields */}
      <div className="px-5 space-y-3 flex-1">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
          Quick Update
        </p>

        {[
          { label: "Nightly Price ($)", value: price, set: setPrice, prefix: "$" },
          { label: "Available Rooms", value: available, set: setAvailable, prefix: "" },
          { label: "Min. Stay (nights)", value: minStay, set: setMinStay, prefix: "" },
        ].map((f) => (
          <div key={f.label}>
            <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>
              {f.label}
            </label>
            <input
              type="number"
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-all"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-navy)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-5 space-y-2" style={{ borderTop: "1px solid var(--border-light)" }}>
        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-lg text-[13px] transition-all"
          style={{
            background: "var(--accent-navy)",
            color: "white",
            fontWeight: 600,
            boxShadow: "0 0 12px var(--border-accent)",
          }}
        >
          Save Changes
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { onUpdate(date, roomType.id, { blocked: !cell.blocked }); onClose(); }}
            className="py-2 rounded-lg text-[12px] flex items-center justify-center gap-1.5 transition-all"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            {cell.blocked ? <Unlock size={12} /> : <Lock size={12} />}
            {cell.blocked ? "Unblock" : "Block"}
          </button>
          <button
            onClick={() => { onUpdate(date, roomType.id, { maintenance: !cell.maintenance }); onClose(); }}
            className="py-2 rounded-lg text-[12px] flex items-center justify-center gap-1.5 transition-all"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            <Wrench size={12} />
            {cell.maintenance ? "Clear Maint." : "Maintenance"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Bulk Update Modal ─────────────────────────────────────────────────────────

function BulkModal({ onClose, onApply }: { onClose: () => void; onApply: (data: any) => void }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [action, setAction] = useState<"price" | "block" | "open">("price");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div
        className="w-[400px] rounded-2xl p-6"
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>Bulk Update</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-card)", color: "var(--text-tertiary)" }}>
            <X size={14} />
          </button>
        </div>

        {/* Action selector */}
        <div className="flex gap-2 mb-5">
          {(["price", "block", "open"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAction(a)}
              className="flex-1 py-2 rounded-lg text-[12px] capitalize transition-all"
              style={{
                background: action === a ? "var(--accent-navy)" : "var(--bg-card)",
                color: action === a ? "white" : "var(--text-secondary)",
                border: `1px solid ${action === a ? "transparent" : "var(--border-light)"}`,
                fontWeight: action === a ? 600 : 400,
              }}
            >
              {a === "block" ? "Block Dates" : a === "open" ? "Open Dates" : "Set Price"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[12px] outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[12px] outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
            </div>
          </div>
          {action === "price" && (
            <>
              <div>
                <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Nightly Price ($)</label>
                <input type="number" placeholder="e.g. 180" value={price} onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-[12px] outline-none"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Available Rooms</label>
                <input type="number" placeholder="e.g. 3" value={rooms} onChange={(e) => setRooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-[12px] outline-none"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => { onApply({ startDate, endDate, price, rooms, action }); onClose(); }}
          className="w-full mt-5 py-2.5 rounded-lg text-[13px]"
          style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600, boxShadow: "0 0 12px var(--border-accent)" }}
        >
          Apply to All Room Types
        </button>
      </div>
    </div>
  );
}

// ─── Main Calendar ─────────────────────────────────────────────────────────────

export function AvailabilityCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [calData, setCalData] = useState(() => generateMonthData(year, month));
  const [selectedCell, setSelectedCell] = useState<{ date: string; rtId: string } | null>(null);
  const [showBulk, setShowBulk] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const DAYS = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const monthName = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const navigateMonth = (dir: -1 | 1) => {
    let m = month + dir;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
    setCalData(generateMonthData(y, m));
    setSelectedCell(null);
  };

  const handleCellClick = (date: string, rtId: string) => {
    if (selectedCell?.date === date && selectedCell?.rtId === rtId) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ date, rtId });
    }
  };

  const handleUpdate = (date: string, rtId: string, updates: Partial<DayCell>) => {
    setCalData((prev) => ({
      ...prev,
      [rtId]: {
        ...prev[rtId],
        [date]: { ...prev[rtId][date], ...updates },
      },
    }));
  };

  const selectedRoomType = selectedCell ? ROOM_TYPES.find((r) => r.id === selectedCell.rtId)! : null;
  const selectedCellData = selectedCell ? calData[selectedCell.rtId]?.[selectedCell.date] : null;

  const CELL_W = 72;
  const LABEL_W = 160;

  return (
    <div className="p-6 space-y-4 max-w-[1800px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={15} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>
              Availability Calendar
            </span>
          </div>
          <h1 className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Jetwing Yala — Inventory
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulk(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] transition-all"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            <Edit3 size={13} />
            Bulk Update
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px]"
            style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600, boxShadow: "0 0 10px var(--border-accent)" }}
          >
            <Plus size={13} />
            Add Room Type
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {([
          ["available", "Available", "#3b82f6"],
          ["low", "Low Inventory", "#f97316"],
          ["sold-out", "Sold Out", "#ef4444"],
          ["blocked", "Blocked", "#64748b"],
          ["maintenance", "Maintenance", "#f59e0b"],
        ] as const).map(([key, label, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: color, opacity: 0.7 }} />
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Calendar container */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
      >
        {/* Month navigation */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}
        >
          <button
            onClick={() => navigateMonth(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {monthName}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Scrollable grid */}
        <div className="overflow-x-auto" ref={scrollRef}>
          <div style={{ minWidth: `${LABEL_W + CELL_W * daysInMonth}px` }}>
            {/* Date header row */}
            <div
              className="flex"
              style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)", position: "sticky", top: 0, zIndex: 10 }}
            >
              {/* Room type label col */}
              <div
                className="shrink-0 flex items-center px-4"
                style={{ width: LABEL_W, background: "var(--bg-panel)", borderRight: "1px solid var(--border-light)", position: "sticky", left: 0, zIndex: 20 }}
              >
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
                  Room Type
                </span>
              </div>
              {DAYS.map((d) => {
                const dayOfWeek = new Date(year, month, d).getDay();
                const isToday =
                  d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                return (
                  <div
                    key={d}
                    className="shrink-0 flex flex-col items-center justify-center py-2"
                    style={{
                      width: CELL_W,
                      borderRight: "1px solid var(--border-light)",
                      background: isToday ? "rgba(59,130,246,0.1)" : isWeekend ? "rgba(255,255,255,0.02)" : "transparent",
                    }}
                  >
                    <span
                      className="text-[10px]"
                      style={{ color: isToday ? "#93c5fd" : isWeekend ? "#f59e0b" : "var(--text-tertiary)" }}
                    >
                      {DAY_NAMES[dayOfWeek]}
                    </span>
                    <span
                      className="text-[13px]"
                      style={{ color: isToday ? "#93c5fd" : "var(--text-secondary)", fontWeight: isToday ? 700 : 500 }}
                    >
                      {d}
                    </span>
                    {isToday && (
                      <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: "#3b82f6" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Room type rows */}
            {ROOM_TYPES.map((rt, rtIdx) => (
              <div
                key={rt.id}
                className="flex"
                style={{ borderBottom: rtIdx < ROOM_TYPES.length - 1 ? "1px solid var(--border-light)" : "none" }}
              >
                {/* Room label - sticky */}
                <div
                  className="shrink-0 flex items-center gap-2.5 px-4 py-3"
                  style={{
                    width: LABEL_W,
                    background: "var(--bg-card)",
                    borderRight: "1px solid var(--border-light)",
                    position: "sticky",
                    left: 0,
                    zIndex: 5,
                  }}
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: rt.color }} />
                  <div>
                    <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>{rt.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{rt.total} units</p>
                  </div>
                </div>

                {/* Day cells */}
                {DAYS.map((d) => {
                  const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const cell = calData[rt.id]?.[dateKey];
                  if (!cell) return <div key={d} style={{ width: CELL_W, borderRight: "1px solid var(--border-light)" }} />;

                  const status = getCellStatus(cell, rt.total);
                  const styles = STATUS_STYLES[status];
                  const isSelected = selectedCell?.date === dateKey && selectedCell?.rtId === rt.id;
                  const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                  return (
                    <button
                      key={d}
                      onClick={() => handleCellClick(dateKey, rt.id)}
                      className="shrink-0 p-1.5 transition-all text-left"
                      style={{
                        width: CELL_W,
                        borderRight: "1px solid var(--border-light)",
                        background: isSelected
                          ? `${rt.color}20`
                          : isToday
                          ? "rgba(59,130,246,0.05)"
                          : styles.bg,
                        border: isSelected ? `1px solid ${rt.color}60` : undefined,
                        outline: "none",
                      }}
                    >
                      {status === "blocked" ? (
                        <div className="flex flex-col items-center justify-center h-full py-1">
                          <Lock size={11} style={{ color: styles.text, opacity: 0.7 }} />
                          <span className="text-[9px] mt-0.5" style={{ color: styles.sub }}>Blocked</span>
                        </div>
                      ) : status === "maintenance" ? (
                        <div className="flex flex-col items-center justify-center h-full py-1">
                          <Wrench size={11} style={{ color: styles.text, opacity: 0.7 }} />
                          <span className="text-[9px] mt-0.5" style={{ color: styles.sub }}>Maint.</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-[11px]" style={{ color: styles.text, fontWeight: 600 }}>
                            ${cell.price}
                          </p>
                          <p className="text-[9px]" style={{ color: styles.sub }}>
                            {status === "sold-out" ? "Sold out" : `${cell.available} avail`}
                          </p>
                          {cell.booked > 0 && (
                            <p className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>
                              {cell.booked} booked
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Date side panel */}
      {selectedCell && selectedRoomType && selectedCellData && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setSelectedCell(null)}
            style={{ background: "rgba(0,0,0,0.3)" }}
          />
          <DatePanel
            date={selectedCell.date}
            roomType={selectedRoomType}
            cell={selectedCellData}
            onClose={() => setSelectedCell(null)}
            onUpdate={handleUpdate}
          />
        </>
      )}

      {/* Bulk modal */}
      {showBulk && (
        <BulkModal
          onClose={() => setShowBulk(false)}
          onApply={(data) => {
            // Apply bulk update to all room types for the date range
            console.log("Bulk update:", data);
          }}
        />
      )}
    </div>
  );
}

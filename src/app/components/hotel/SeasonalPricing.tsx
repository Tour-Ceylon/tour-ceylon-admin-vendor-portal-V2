import { useState } from "react";
import { DollarSign, Plus, Edit3, Trash2, X, Calendar } from "lucide-react";

interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: "peak" | "high" | "regular" | "low";
  multiplier: number;
  minStay: number;
  rooms: Record<string, number>;
}

const BASE_PRICES: Record<string, number> = {
  "Deluxe Room": 120,
  "Ocean Villa": 380,
  "Suite": 280,
  "Standard Room": 75,
  "Family Room": 165,
};

const ROOM_TYPES = Object.keys(BASE_PRICES);

const SEASONS: Season[] = [
  { id: "1", name: "Christmas & New Year", startDate: "2025-12-20", endDate: "2026-01-05", type: "peak", multiplier: 2.0, minStay: 5, rooms: { "Deluxe Room": 240, "Ocean Villa": 760, "Suite": 560, "Standard Room": 150, "Family Room": 330 } },
  { id: "2", name: "Easter Peak", startDate: "2026-04-02", endDate: "2026-04-14", type: "high", multiplier: 1.6, minStay: 3, rooms: { "Deluxe Room": 192, "Ocean Villa": 608, "Suite": 448, "Standard Room": 120, "Family Room": 264 } },
  { id: "3", name: "Summer High (EU)", startDate: "2025-07-01", endDate: "2025-09-30", type: "high", multiplier: 1.4, minStay: 2, rooms: { "Deluxe Room": 168, "Ocean Villa": 532, "Suite": 392, "Standard Room": 105, "Family Room": 231 } },
  { id: "4", name: "Monsoon Low", startDate: "2025-05-01", endDate: "2025-10-31", type: "low", multiplier: 0.75, minStay: 1, rooms: { "Deluxe Room": 90, "Ocean Villa": 285, "Suite": 210, "Standard Room": 56, "Family Room": 124 } },
  { id: "5", name: "Regular Season", startDate: "2025-10-01", endDate: "2025-11-30", type: "regular", multiplier: 1.0, minStay: 1, rooms: { "Deluxe Room": 120, "Ocean Villa": 380, "Suite": 280, "Standard Room": 75, "Family Room": 165 } },
];

const WEEKEND_RULES = [
  { day: "Friday", markup: 10 },
  { day: "Saturday", markup: 25 },
  { day: "Sunday", markup: 15 },
];

const TYPE_CONFIG = {
  peak:    { label: "Peak",    bg: "rgba(239,68,68,0.12)",  text: "#f87171",  border: "rgba(239,68,68,0.25)" },
  high:    { label: "High",    bg: "rgba(249,115,22,0.12)", text: "#fb923c",  border: "rgba(249,115,22,0.25)" },
  regular: { label: "Regular", bg: "rgba(59,130,246,0.12)", text: "#60a5fa",  border: "rgba(59,130,246,0.25)" },
  low:     { label: "Low",     bg: "rgba(34,197,94,0.12)",  text: "#4ade80",  border: "rgba(34,197,94,0.25)" },
};

function SeasonModal({ season, onClose }: { season?: Season; onClose: () => void }) {
  const [name, setName] = useState(season?.name ?? "");
  const [start, setStart] = useState(season?.startDate ?? "");
  const [end, setEnd] = useState(season?.endDate ?? "");
  const [type, setType] = useState<Season["type"]>(season?.type ?? "regular");
  const [multiplier, setMultiplier] = useState(season?.multiplier?.toString() ?? "1.0");
  const [minStay, setMinStay] = useState(season?.minStay?.toString() ?? "1");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div
        className="w-[480px] rounded-2xl p-6"
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {season ? "Edit Season" : "Add Season"}
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--bg-card)", color: "var(--text-tertiary)" }}>
            <X size={14} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Season Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Christmas Peak"
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Start Date</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>End Date</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
            </div>
          </div>

          {/* Type selector */}
          <div>
            <label className="text-[11px] block mb-1.5" style={{ color: "var(--text-secondary)" }}>Season Type</label>
            <div className="flex gap-2">
              {(["peak", "high", "regular", "low"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="flex-1 py-1.5 rounded-lg text-[12px] capitalize transition-all"
                  style={{
                    background: type === t ? TYPE_CONFIG[t].bg : "var(--bg-card)",
                    color: type === t ? TYPE_CONFIG[t].text : "var(--text-secondary)",
                    border: `1px solid ${type === t ? TYPE_CONFIG[t].border : "var(--border-light)"}`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Price Multiplier</label>
              <input type="number" step="0.1" value={multiplier} onChange={(e) => setMultiplier(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                Base × {multiplier} = ${Math.round(120 * parseFloat(multiplier || "1"))}/night (Deluxe ex.)
              </p>
            </div>
            <div>
              <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Min. Stay (nights)</label>
              <input type="number" value={minStay} onChange={(e) => setMinStay(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-[13px]"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
            Cancel
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-[13px]"
            style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600, boxShadow: "0 0 12px var(--border-accent)" }}>
            {season ? "Save Changes" : "Create Season"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SeasonalPricing() {
  const [seasons] = useState<Season[]>(SEASONS);
  const [showModal, setShowModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | undefined>();

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={15} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>Seasonal Pricing</span>
          </div>
          <h1 className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>Pricing Rules — Jetwing Yala</h1>
        </div>
        <button
          onClick={() => { setEditingSeason(undefined); setShowModal(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px]"
          style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600, boxShadow: "0 0 12px var(--border-accent)" }}
        >
          <Plus size={14} />
          Add Season
        </button>
      </div>

      {/* Price matrix */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
      >
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <Calendar size={14} style={{ color: "var(--accent-navy)" }} />
          <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Seasonal Price Matrix</span>
        </div>

        {/* Header */}
        <div
          className="grid text-[10px] uppercase tracking-wider px-5 py-3"
          style={{
            gridTemplateColumns: `200px 80px 80px repeat(${ROOM_TYPES.length}, 1fr) 60px`,
            borderBottom: "1px solid var(--border-light)",
            color: "var(--text-tertiary)",
            background: "var(--bg-panel)",
          }}
        >
          <div>Season</div>
          <div>Dates</div>
          <div>Min Stay</div>
          {ROOM_TYPES.map((rt) => (
            <div key={rt}>{rt.split(" ")[0]}</div>
          ))}
          <div></div>
        </div>

        {/* Season rows */}
        <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
          {seasons.map((s) => {
            const typeCfg = TYPE_CONFIG[s.type];
            return (
              <div
                key={s.id}
                className="grid items-center px-5 py-3 transition-all"
                style={{ gridTemplateColumns: `200px 80px 80px repeat(${ROOM_TYPES.length}, 1fr) 60px` }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: typeCfg.bg, color: typeCfg.text }}
                    >
                      {typeCfg.label}
                    </span>
                    <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>{s.name}</span>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    ×{s.multiplier} multiplier
                  </p>
                </div>
                <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  {new Date(s.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
                  {new Date(s.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  {s.minStay} {s.minStay > 1 ? "nights" : "night"}
                </div>
                {ROOM_TYPES.map((rt) => (
                  <div key={rt} className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    ${s.rooms[rt]}
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditingSeason(s); setShowModal(true); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: "var(--bg-panel)", color: "var(--text-tertiary)" }}
                  >
                    <Edit3 size={11} />
                  </button>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: "var(--bg-panel)", color: "var(--text-tertiary)" }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekend pricing rules */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Weekend Pricing Rules</span>
        </div>
        <div className="p-5 grid grid-cols-3 gap-4">
          {WEEKEND_RULES.map((rule) => (
            <div
              key={rule.day}
              className="rounded-xl p-4"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}
            >
              <p className="text-[12px] mb-2" style={{ color: "var(--text-secondary)" }}>{rule.day}</p>
              <div className="flex items-end gap-1">
                <span className="text-[28px]" style={{ color: "var(--text-primary)", fontWeight: 700, lineHeight: 1 }}>
                  +{rule.markup}
                </span>
                <span className="text-[14px] mb-0.5" style={{ color: "var(--text-secondary)" }}>%</span>
              </div>
              <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>over base price</p>
            </div>
          ))}
        </div>
      </div>

      {/* Base price reference */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Base Prices (Regular Season)</span>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-5 gap-3">
          {ROOM_TYPES.map((rt) => (
            <div
              key={rt}
              className="rounded-lg p-3 text-center"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}
            >
              <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>{rt}</p>
              <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                ${BASE_PRICES[rt]}
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>per night</p>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <SeasonModal
          season={editingSeason}
          onClose={() => { setShowModal(false); setEditingSeason(undefined); }}
        />
      )}
    </div>
  );
}

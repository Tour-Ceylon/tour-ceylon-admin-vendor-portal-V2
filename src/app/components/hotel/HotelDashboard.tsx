import { useState } from "react";
import {
  BedDouble,
  TrendingUp,
  Users,
  CalendarCheck,
  CalendarX,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  Building2,
  DollarSign,
  BarChart3,
  Star,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  delta?: string;
  deltaUp?: boolean;
  icon: React.ComponentType<any>;
  accent?: string;
  glow?: string;
}

function StatCard({ label, value, sub, delta, deltaUp, icon: Icon, accent = "var(--accent-navy)", glow = "var(--border-accent)" }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        boxShadow: `0 0 0 1px var(--border-light), 0 4px 16px rgba(0,0,0,0.15)`,
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          <Icon size={16} style={{ color: accent }} />
        </div>
        {delta && (
          <span
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
            style={{
              background: deltaUp ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              color: deltaUp ? "#4ade80" : "#f87171",
            }}
          >
            {deltaUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {delta}
          </span>
        )}
      </div>
      <div>
        <p className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700, lineHeight: 1 }}>
          {value}
        </p>
        {sub && (
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            {sub}
          </p>
        )}
        <p className="text-[12px] mt-1" style={{ color: "var(--text-secondary)" }}>
          {label}
        </p>
      </div>
    </div>
  );
}

const UPCOMING_CHECKINS = [
  { id: "R-1042", guest: "Priya Sharma", room: "DLX-103", type: "Deluxe Room", date: "Today, 14:00", nights: 3, status: "confirmed" },
  { id: "R-1043", guest: "Marcus Weber", room: "VILLA-02", type: "Ocean Villa", date: "Today, 15:30", nights: 7, status: "confirmed" },
  { id: "R-1044", guest: "Yuki Tanaka", room: "STE-201", type: "Suite", date: "Tomorrow, 12:00", nights: 2, status: "confirmed" },
  { id: "R-1045", guest: "Anika Roth", room: "DLX-107", type: "Deluxe Room", date: "Tomorrow, 13:00", nights: 4, status: "pending" },
  { id: "R-1046", guest: "James Okonkwo", room: "STD-005", type: "Standard Room", date: "20 Aug, 11:00", nights: 5, status: "confirmed" },
];

const UPCOMING_CHECKOUTS = [
  { id: "R-1031", guest: "Leila Nazari", room: "DLX-101", type: "Deluxe Room", date: "Today, 11:00" },
  { id: "R-1032", guest: "Tom Eriksson", room: "VILLA-01", type: "Ocean Villa", date: "Today, 10:30" },
  { id: "R-1033", guest: "Sanjay Patel", room: "STE-203", type: "Suite", date: "Tomorrow, 12:00" },
];

const LOW_INVENTORY_ALERTS = [
  { roomType: "Ocean Villa", available: 1, total: 3, date: "Aug 22–28" },
  { roomType: "Suite", available: 1, total: 5, date: "Aug 19–21" },
  { roomType: "Deluxe Room", available: 0, total: 10, date: "Aug 24–26" },
];

const REVENUE_BY_ROOM = [
  { type: "Deluxe Room", revenue: 42800, pct: 72 },
  { type: "Ocean Villa", revenue: 28500, pct: 90 },
  { type: "Suite", revenue: 19400, pct: 58 },
  { type: "Standard Room", revenue: 8200, pct: 38 },
];

export function HotelDashboard() {
  const [selectedMonth] = useState("August 2025");

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[12px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>
              Hotel Operations
            </span>
          </div>
          <h1 className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Jetwing Yala
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Yala National Park, Southern Province, Sri Lanka &nbsp;·&nbsp;
            <span style={{ color: "#fbbf24" }}>★ 4.9</span>
            <span style={{ color: "var(--text-tertiary)" }}> (312 reviews)</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1.5 rounded-lg text-[12px]"
            style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            {selectedMonth}
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Property Live
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <div className="col-span-2">
          <StatCard
            label="Overall Occupancy"
            value="73%"
            sub="38 of 52 rooms occupied"
            delta="4.2%"
            deltaUp={true}
            icon={BarChart3}
            accent="#3b82f6"
          />
        </div>
        <div className="col-span-2">
          <StatCard
            label="Monthly Revenue"
            value="$98,900"
            sub="LKR 29.7M estimated"
            delta="11.3%"
            deltaUp={true}
            icon={DollarSign}
            accent="#10b981"
          />
        </div>
        <div className="col-span-2">
          <StatCard
            label="Active Reservations"
            value="47"
            sub="12 arriving this week"
            delta="3"
            deltaUp={true}
            icon={CalendarCheck}
            accent="var(--accent-navy)"
          />
        </div>
        <div className="col-span-2">
          <StatCard
            label="Avg. Nightly Rate"
            value="$162"
            sub="vs $148 last month"
            delta="9.5%"
            deltaUp={true}
            icon={TrendingUp}
            accent="#8b5cf6"
          />
        </div>
        <div className="col-span-2">
          <StatCard
            label="Check-ins Today"
            value="5"
            sub="2 pending, 3 confirmed"
            icon={Users}
            accent="#f59e0b"
          />
        </div>
        <div className="col-span-2">
          <StatCard
            label="Check-outs Today"
            value="3"
            sub="All rooms to clean"
            icon={CalendarX}
            accent="#ef4444"
          />
        </div>
        <div className="col-span-2">
          <StatCard
            label="Sold-Out Dates"
            value="6"
            sub="In next 30 days"
            icon={BedDouble}
            accent="#f97316"
          />
        </div>
        <div className="col-span-2">
          <StatCard
            label="Most Booked"
            value="Deluxe"
            sub="Ocean Villa runner-up"
            icon={Star}
            accent="#fbbf24"
          />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Check-ins */}
        <div
          className="xl:col-span-2 rounded-xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="flex items-center gap-2">
              <CalendarCheck size={14} style={{ color: "var(--accent-navy)" }} />
              <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Upcoming Check-ins
              </span>
            </div>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: "var(--bg-panel)", color: "var(--text-tertiary)" }}
            >
              Next 7 days
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
            {UPCOMING_CHECKINS.map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px]"
                  style={{ background: "var(--bg-panel)", color: "var(--accent-navy-light)", fontWeight: 700 }}
                >
                  {r.guest.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] truncate" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {r.guest}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {r.type} · {r.room}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    {r.date}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {r.nights} nights
                  </p>
                </div>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    background: r.status === "confirmed" ? "rgba(34,197,94,0.12)" : "rgba(251,191,36,0.12)",
                    color: r.status === "confirmed" ? "#4ade80" : "#fbbf24",
                  }}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: checkouts + alerts */}
        <div className="flex flex-col gap-4">
          {/* Checkouts */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
          >
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
              <CalendarX size={14} style={{ color: "#ef4444" }} />
              <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Check-outs
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
              {UPCOMING_CHECKOUTS.map((r) => (
                <div key={r.id} className="px-5 py-3 flex items-center gap-3">
                  <CheckCircle size={14} style={{ color: "#4ade80", shrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] truncate" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {r.guest}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{r.room}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock size={11} style={{ color: "var(--text-tertiary)" }} />
                    <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{r.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low inventory alerts */}
          <div
            className="rounded-xl overflow-hidden flex-1"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
          >
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
              <AlertTriangle size={14} style={{ color: "#f97316" }} />
              <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Inventory Alerts
              </span>
            </div>
            <div className="p-3 space-y-2">
              {LOW_INVENTORY_ALERTS.map((a, i) => (
                <div
                  key={i}
                  className="rounded-lg p-3"
                  style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {a.roomType}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background: a.available === 0 ? "rgba(239,68,68,0.15)" : "rgba(249,115,22,0.15)",
                        color: a.available === 0 ? "#f87171" : "#fb923c",
                      }}
                    >
                      {a.available === 0 ? "Sold Out" : `${a.available} left`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-light)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${((a.total - a.available) / a.total) * 100}%`,
                          background: a.available === 0 ? "#ef4444" : "#f97316",
                        }}
                      />
                    </div>
                    <span className="text-[10px] shrink-0" style={{ color: "var(--text-tertiary)" }}>
                      {a.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by room type */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <div className="flex items-center gap-2">
            <DollarSign size={14} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Revenue by Room Type
            </span>
          </div>
          <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>August 2025</span>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {REVENUE_BY_ROOM.map((r) => (
            <div key={r.type} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{r.type}</span>
                <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{r.pct}% occ.</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border-light)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${r.pct}%`,
                    background: `linear-gradient(90deg, var(--accent-navy-dark), var(--accent-navy-light))`,
                  }}
                />
              </div>
              <p className="text-[15px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                ${r.revenue.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

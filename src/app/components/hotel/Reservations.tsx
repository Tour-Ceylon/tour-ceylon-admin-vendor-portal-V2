import { useState } from "react";
import {
  Search,
  CalendarDays,
  Users,
  ChevronDown,
  Eye,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BedDouble,
  DollarSign,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

type ReservationStatus = "confirmed" | "pending" | "checked-in" | "checked-out" | "cancelled";

interface Reservation {
  id: string;
  resId: string;
  guest: string;
  email: string;
  phone: string;
  country: string;
  unitId: string;
  roomType: string;
  typeColor: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  status: ReservationStatus;
  payment: "paid" | "partial" | "unpaid" | "refunded";
  total: number;
  bookedOn: string;
  source: string;
  notes?: string;
}

const RESERVATIONS: Reservation[] = [
  { id: "1", resId: "R-1042", guest: "Priya Sharma", email: "priya@example.com", phone: "+91 98765 43210", country: "India", unitId: "DLX-103", roomType: "Deluxe Room", typeColor: "#3b82f6", checkIn: "Aug 18, 2025", checkOut: "Aug 21, 2025", nights: 3, adults: 2, children: 0, status: "checked-in", payment: "paid", total: 360, bookedOn: "Aug 5, 2025", source: "Booking.com", notes: "Early check-in requested" },
  { id: "2", resId: "R-1043", guest: "Marcus Weber", email: "marcus@example.com", phone: "+49 151 234 5678", country: "Germany", unitId: "VILLA-02", roomType: "Ocean Villa", typeColor: "#10b981", checkIn: "Aug 18, 2025", checkOut: "Aug 25, 2025", nights: 7, adults: 2, children: 0, status: "confirmed", payment: "paid", total: 2660, bookedOn: "Jul 30, 2025", source: "Direct" },
  { id: "3", resId: "R-1044", guest: "Yuki Tanaka", email: "yuki@example.com", phone: "+81 80 1234 5678", country: "Japan", unitId: "STE-201", roomType: "Suite", typeColor: "#8b5cf6", checkIn: "Aug 19, 2025", checkOut: "Aug 21, 2025", nights: 2, adults: 2, children: 0, status: "confirmed", payment: "partial", total: 560, bookedOn: "Aug 10, 2025", source: "Agoda" },
  { id: "4", resId: "R-1045", guest: "Anika Roth", email: "anika@example.com", phone: "+49 176 987 6543", country: "Germany", unitId: "DLX-107", roomType: "Deluxe Room", typeColor: "#3b82f6", checkIn: "Aug 20, 2025", checkOut: "Aug 24, 2025", nights: 4, adults: 1, children: 0, status: "pending", payment: "unpaid", total: 480, bookedOn: "Aug 14, 2025", source: "Expedia" },
  { id: "5", resId: "R-1046", guest: "James Okonkwo", email: "james@example.com", phone: "+234 802 123 4567", country: "Nigeria", unitId: "FAM-401", roomType: "Family Room", typeColor: "#ec4899", checkIn: "Aug 20, 2025", checkOut: "Aug 25, 2025", nights: 5, adults: 2, children: 2, status: "confirmed", payment: "paid", total: 825, bookedOn: "Aug 8, 2025", source: "Direct" },
  { id: "6", resId: "R-1031", guest: "Leila Nazari", email: "leila@example.com", phone: "+98 912 345 6789", country: "Iran", unitId: "DLX-101", roomType: "Deluxe Room", typeColor: "#3b82f6", checkIn: "Aug 14, 2025", checkOut: "Aug 18, 2025", nights: 4, adults: 2, children: 1, status: "checked-out", payment: "paid", total: 480, bookedOn: "Jul 22, 2025", source: "Booking.com" },
  { id: "7", resId: "R-1032", guest: "Tom Eriksson", email: "tom@example.com", phone: "+46 70 234 5678", country: "Sweden", unitId: "VILLA-01", roomType: "Ocean Villa", typeColor: "#10b981", checkIn: "Aug 13, 2025", checkOut: "Aug 18, 2025", nights: 5, adults: 2, children: 0, status: "checked-out", payment: "paid", total: 1900, bookedOn: "Jul 20, 2025", source: "Direct" },
  { id: "8", resId: "R-1028", guest: "Sophie Chen", email: "sophie@example.com", phone: "+65 9123 4567", country: "Singapore", unitId: "STD-002", roomType: "Standard Room", typeColor: "#f59e0b", checkIn: "Aug 10, 2025", checkOut: "Aug 13, 2025", nights: 3, adults: 1, children: 0, status: "cancelled", payment: "refunded", total: 225, bookedOn: "Jul 18, 2025", source: "Agoda", notes: "Cancelled due to flight change" },
];

const STATUS_CONFIG: Record<ReservationStatus, { label: string; bg: string; text: string; icon: React.ComponentType<any> }> = {
  confirmed:    { label: "Confirmed",   bg: "rgba(59,130,246,0.12)", text: "#60a5fa", icon: CheckCircle },
  pending:      { label: "Pending",     bg: "rgba(251,191,36,0.12)", text: "#fbbf24", icon: Clock },
  "checked-in": { label: "Checked In",  bg: "rgba(34,197,94,0.12)",  text: "#4ade80", icon: CheckCircle },
  "checked-out":{ label: "Checked Out", bg: "rgba(100,116,139,0.12)",text: "#94a3b8", icon: CheckCircle },
  cancelled:    { label: "Cancelled",   bg: "rgba(239,68,68,0.12)",  text: "#f87171", icon: XCircle },
};

const PAYMENT_CONFIG = {
  paid:     { label: "Paid",     color: "#4ade80" },
  partial:  { label: "Partial",  color: "#fbbf24" },
  unpaid:   { label: "Unpaid",   color: "#f87171" },
  refunded: { label: "Refunded", color: "#94a3b8" },
};

function ReservationDrawer({ res, onClose }: { res: Reservation; onClose: () => void }) {
  const statusCfg = STATUS_CONFIG[res.status];
  const paymentCfg = PAYMENT_CONFIG[res.payment];

  return (
    <div
      className="fixed right-0 top-0 h-full w-[380px] flex flex-col z-50 overflow-y-auto"
      style={{
        background: "var(--bg-panel)",
        borderLeft: "1px solid var(--border-light)",
        boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
      }}
    >
      <div className="px-5 py-4 flex items-start justify-between sticky top-0 z-10" style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border-light)" }}>
        <div>
          <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>Reservation</p>
          <p className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>{res.resId}</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-card)", color: "var(--text-tertiary)" }}>
          <X size={14} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Status + payment */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full"
            style={{ background: statusCfg.bg, color: statusCfg.text }}>
            <statusCfg.icon size={10} />
            {statusCfg.label}
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-full"
            style={{ background: `${paymentCfg.color}15`, color: paymentCfg.color }}>
            {paymentCfg.label}
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{res.source}</span>
        </div>

        {/* Guest */}
        <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
          <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>Guest</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px]"
              style={{ background: "var(--bg-panel)", color: "var(--accent-navy-light)", fontWeight: 700 }}>
              {res.guest.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{res.guest}</p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                <MapPin size={10} className="inline mr-1" />{res.country}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Mail size={11} style={{ color: "var(--text-tertiary)" }} />
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{res.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={11} style={{ color: "var(--text-tertiary)" }} />
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{res.phone}</span>
            </div>
          </div>
        </div>

        {/* Stay details */}
        <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
          <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>Stay Details</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Check-in", value: res.checkIn, icon: CalendarDays },
              { label: "Check-out", value: res.checkOut, icon: CalendarDays },
              { label: "Nights", value: res.nights, icon: BedDouble },
              { label: "Guests", value: `${res.adults} adults${res.children > 0 ? `, ${res.children} children` : ""}`, icon: Users },
            ].map((d) => (
              <div key={d.label} className="rounded-lg p-2.5" style={{ background: "var(--bg-panel)" }}>
                <div className="flex items-center gap-1 mb-1">
                  <d.icon size={10} style={{ color: "var(--text-tertiary)" }} />
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{d.label}</span>
                </div>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>{d.value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: res.typeColor }} />
              <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{res.roomType}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded font-mono"
                style={{ background: `${res.typeColor}15`, color: res.typeColor }}>
                {res.unitId}
              </span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <DollarSign size={12} style={{ color: "var(--text-tertiary)" }} />
              <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>Total</span>
            </div>
            <span className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              ${res.total.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] mt-1 text-right" style={{ color: "var(--text-tertiary)" }}>
            Booked on {res.bookedOn} via {res.source}
          </p>
        </div>

        {res.notes && (
          <div className="rounded-xl p-4" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
            <p className="text-[11px]" style={{ color: "#fbbf24" }}>
              <AlertCircle size={11} className="inline mr-1" />
              {res.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        {res.status !== "cancelled" && res.status !== "checked-out" && (
          <div className="space-y-2">
            {res.status === "confirmed" && (
              <button className="w-full py-2.5 rounded-lg text-[13px]"
                style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)", fontWeight: 600 }}>
                ✓ Check In Guest
              </button>
            )}
            {res.status === "checked-in" && (
              <button className="w-full py-2.5 rounded-lg text-[13px]"
                style={{ background: "rgba(100,116,139,0.15)", color: "#94a3b8", border: "1px solid rgba(100,116,139,0.25)", fontWeight: 600 }}>
                Check Out Guest
              </button>
            )}
            {res.status === "pending" && (
              <button className="w-full py-2.5 rounded-lg text-[13px]"
                style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600, boxShadow: "0 0 12px var(--border-accent)" }}>
                Confirm Reservation
              </button>
            )}
            <button className="w-full py-2.5 rounded-lg text-[13px]"
              style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
              Cancel Reservation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Reservations() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all");
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  const filtered = RESERVATIONS.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      r.resId.toLowerCase().includes(q) ||
      r.guest.toLowerCase().includes(q) ||
      r.unitId.toLowerCase().includes(q) ||
      r.roomType.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s] = RESERVATIONS.filter((r) => r.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const totalRevenue = RESERVATIONS.filter((r) => r.status !== "cancelled").reduce((sum, r) => sum + r.total, 0);

  return (
    <div className="p-6 space-y-5 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={15} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>Reservations</span>
          </div>
          <h1 className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Jetwing Yala — {RESERVATIONS.length} Reservations
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Total Revenue</p>
          <p className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status tabs */}
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
          All ({RESERVATIONS.length})
        </button>
        {(Object.entries(STATUS_CONFIG) as [ReservationStatus, typeof STATUS_CONFIG[ReservationStatus]][]).map(([key, cfg]) => (
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

      {/* Search */}
      <div className="relative" style={{ maxWidth: 320 }}>
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guest, unit, ID…"
          className="w-full pl-8 pr-3 py-2 rounded-lg text-[13px] outline-none"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
        />
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
      >
        <div
          className="grid text-[11px] uppercase tracking-wider px-5 py-3"
          style={{
            gridTemplateColumns: "80px 1fr 100px 120px 80px 60px 100px 90px 50px",
            borderBottom: "1px solid var(--border-light)",
            color: "var(--text-tertiary)",
            background: "var(--bg-panel)",
          }}
        >
          <div>Res. ID</div>
          <div>Guest</div>
          <div>Room</div>
          <div>Check-in</div>
          <div>Nights</div>
          <div>Guests</div>
          <div>Status</div>
          <div>Total</div>
          <div></div>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
          {filtered.map((res) => {
            const statusCfg = STATUS_CONFIG[res.status];
            const paymentCfg = PAYMENT_CONFIG[res.payment];

            return (
              <div
                key={res.id}
                className="grid items-center px-5 py-3.5 cursor-pointer transition-all"
                style={{ gridTemplateColumns: "80px 1fr 100px 120px 80px 60px 100px 90px 50px" }}
                onClick={() => setSelectedRes(res)}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <div className="text-[12px] font-mono" style={{ color: "var(--accent-navy-light)" }}>{res.resId}</div>

                <div>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>{res.guest}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{res.country} · {res.source}</p>
                </div>

                <div>
                  <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{res.roomType.split(" ")[0]}</p>
                  <span className="text-[10px] px-1 py-0.5 rounded font-mono"
                    style={{ background: `${res.typeColor}15`, color: res.typeColor }}>
                    {res.unitId}
                  </span>
                </div>

                <div>
                  <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{res.checkIn}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>→ {res.checkOut}</p>
                </div>

                <div className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>{res.nights}</div>

                <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  {res.adults + res.children}
                </div>

                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: statusCfg.bg, color: statusCfg.text }}>
                    <statusCfg.icon size={9} />
                    {statusCfg.label}
                  </span>
                </div>

                <div>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    ${res.total.toLocaleString()}
                  </p>
                  <p className="text-[10px]" style={{ color: paymentCfg.color }}>{paymentCfg.label}</p>
                </div>

                <div>
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--bg-panel)", color: "var(--text-tertiary)" }}
                    onClick={(e) => { e.stopPropagation(); setSelectedRes(res); }}>
                    <Eye size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drawer */}
      {selectedRes && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSelectedRes(null)} style={{ background: "rgba(0,0,0,0.3)" }} />
          <ReservationDrawer res={selectedRes} onClose={() => setSelectedRes(null)} />
        </>
      )}
    </div>
  );
}

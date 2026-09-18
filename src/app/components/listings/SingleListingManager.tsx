import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../api/apiClient";
import {
    getStayCalendar,
    getStayInventory,
    listStayBookings,
    listStayRoomBlocks,
    createRoomBlock,
    releaseRoomBlock,
    type StayBookingResponse,
    type StayCalendarEntry,
    type StayInventoryResponse,
    type StayRoomBlockResponse,
    type StayRoomUnit,
} from "../api/stayVendorApi";
import {
    getSafariCalendar,
    listSafariBlocks,
    createSafariBlock,
    releaseSafariBlock,
} from "../api/safariVendorApi";
import {
    ArrowLeft,
    BedDouble,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    Plus,
    Lock,
    Unlock,
    RefreshCw,
    X,
    Filter,
    MapPin,
    ExternalLink,
    Edit3,
    UserCheck,
    AlertCircle,
    FastForward,
    Car,
    Users,
} from "lucide-react";
import { EmptyState } from "../common/EmptyState";
import { DashboardSkeleton } from "../common/SkeletonLoader";

type BookingStatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "REJECTED";

type CellStatus = "available" | "low" | "sold-out" | "blocked";

function formatIsoDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatIsoMonth(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

function formatDisplayDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getMonthDays(date: Date) {
    const first = startOfMonth(date);
    const last = endOfMonth(date);
    const days: Array<Date | null> = [];
    for (let index = 0; index < first.getDay(); index += 1) {
        days.push(null);
    }
    for (let day = 1; day <= last.getDate(); day += 1) {
        days.push(new Date(date.getFullYear(), date.getMonth(), day));
    }
    return days;
}

function enumerateDates(startDate: string, endDate: string) {
    const dates: string[] = [];
    const current = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    while (current <= end) {
        dates.push(formatIsoDate(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

function exclusiveEndDateToInclusive(endDate: string) {
    const end = new Date(`${endDate}T00:00:00`);
    end.setDate(end.getDate() - 1);
    return formatIsoDate(end);
}

function addDays(value: string, days: number) {
    const date = new Date(`${value}T00:00:00`);
    date.setDate(date.getDate() + days);
    return formatIsoDate(date);
}

function datesOverlap(startA: string, endAExclusive: string, startB: string, endBExclusive: string) {
    return startA < endBExclusive && endAExclusive > startB;
}

function statusFromEntry(entry: StayCalendarEntry): CellStatus {
    if (entry.totalUnits > 0 && entry.blockedUnits >= entry.totalUnits) return "blocked";
    if (entry.availableUnits === 0) return "sold-out";
    if (entry.totalUnits > 0 && entry.availableUnits / entry.totalUnits <= 0.25) return "low";
    return "available";
}

const STATUS_STYLES: Record<CellStatus, { bg: string; border: string; text: string; badge: string }> = {
    available: { bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.2)", text: "#4ade80", badge: "Available" },
    low: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", text: "#fbbf24", badge: "Low Availability" },
    "sold-out": { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", text: "#f87171", badge: "Fully Booked" },
    blocked: { bg: "rgba(100,116,139,0.15)", border: "rgba(100,116,139,0.3)", text: "#94a3b8", badge: "Blocked / Blackout" },
};

function SafariListingManager({
    listing,
    listingId,
    isAdmin,
    navigate,
}: {
    listing: any;
    listingId: string | undefined;
    isAdmin: boolean;
    navigate: (path: string) => void;
}) {
    const listingName = listing?.name || listing?.title || listing?.safariDetail?.nationalPark ? `${listing?.safariDetail?.nationalPark || "Safari"} Game Drive` : "Yala National Park Safari";
    const nationalPark = listing?.safariDetail?.nationalPark || listing?.destination?.name || listing?.address || "Yala National Park";
    const status = listing?.status || "Active";

    const [monthDate, setMonthDate] = useState(() => new Date());
    const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("ALL");
    const [selectedSlot, setSelectedSlot] = useState<"ALL" | "Morning" | "Afternoon" | "Full Day">("ALL");
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [blackoutDates, setBlackoutDates] = useState<Record<string, string>>({
        "2026-09-12": "Park Maintenance Blackout",
        "2026-09-20": "Heavy Monsoon Rain Closure",
    });
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState("");
    const [blockDateStr, setBlockDateStr] = useState("");

    const realVariants = listing?.variants || listing?.safariDetail?.variants || [];
    const rawPackages = listing?.safariDetail?.jeep_packages || listing?.categoryData?.safariPackages || [];

    const safariPackages = useMemo(() => {
        if (realVariants.length > 0) {
            return realVariants.map((v: any, idx: number) => ({
                id: v.id || `var_${idx + 1}`,
                name: v.name || `Safari Package ${idx + 1}`,
                slot: v.booking_unit === "per_person" || v.unit === "Per Person" ? "Shared Seat Game Drive" : "Private 4x4 Jeep Drive",
                price: v.pricing?.amount ? `$${v.pricing.amount} ${v.pricing.currency || "USD"}` : v.price ? `$${v.price}` : "$150 USD",
                capacity: v.capacity_max ? `${v.capacity_max} Passengers` : "6 Passengers",
                includesParkFees: true,
                description: v.name?.toLowerCase().includes("morning") ? "Morning game drive for optimum wildlife activity." : v.name?.toLowerCase().includes("afternoon") ? "Afternoon golden hour safari." : "Game drive expedition.",
            }));
        }
        if (rawPackages.length > 0) {
            return rawPackages.map((pkg: any, idx: number) => ({
                id: pkg.id || `pkg_${idx + 1}`,
                name: pkg.name || `Safari Package ${idx + 1}`,
                slot: pkg.type === "shared_seat" ? "Shared Seat Game Drive" : "Private 4x4 Jeep Drive",
                price: pkg.price ? `$${pkg.price} ${pkg.currency || "USD"}` : "$150 USD",
                capacity: pkg.capacityMax ? `${pkg.capacityMax} Passengers` : "6 Passengers",
                includesParkFees: true,
                description: "Safari game drive package.",
            }));
        }
        return [
            {
                id: "pkg_default_1",
                name: listing?.title || "Standard 4x4 Jeep Safari",
                slot: "Morning / Afternoon Drive",
                price: "$150 USD",
                capacity: "6 Passengers",
                includesParkFees: true,
                description: "Safari game drive.",
            },
        ];
    }, [realVariants, rawPackages, listing?.title]);

    const wildlifeHighlights = listing?.safariDetail?.wildlife_highlights || listing?.categoryData?.wildlifeHighlights || listing?.safariDetail?.wildlifeHighlights || [
        "Sri Lankan Leopard",
        "Asian Elephant",
        "Sloth Bear",
        "Mugger Crocodile",
        "Sri Lanka Jungle Fowl",
        "Painted Stork",
    ];

    const [safariBookings, setSafariBookings] = useState([
        {
            id: "BK-SAF-101",
            guestName: "Alexander Wright",
            email: "alex.wright@example.com",
            phone: "+1 555-0192",
            package: "Morning Private 4x4 Jeep",
            slot: "Morning (06:00 AM)",
            date: "2026-09-06",
            passengers: 4,
            price: "$150 USD",
            paymentMethod: "Pay at Property",
            status: "CONFIRMED",
        },
        {
            id: "BK-SAF-102",
            guestName: "Elena Rostova",
            email: "elena.r@example.com",
            phone: "+44 7700 900077",
            package: "VIP Full Day Expedition Jeep",
            slot: "Full Day (06:00 AM)",
            date: "2026-09-08",
            passengers: 2,
            price: "$280 USD",
            paymentMethod: "Full Online Payment",
            status: "PENDING",
        },
        {
            id: "BK-SAF-103",
            guestName: "Marcus Vance",
            email: "marcus.v@example.com",
            phone: "+61 400 123 456",
            package: "Afternoon Private 4x4 Jeep",
            slot: "Afternoon (02:30 PM)",
            date: "2026-09-10",
            passengers: 6,
            price: "$140 USD",
            paymentMethod: "Pay at Property",
            status: "CONFIRMED",
        },
    ]);

    const counts = useMemo(() => {
        let pending = 0;
        let confirmed = 0;
        let rejected = 0;
        for (const b of safariBookings) {
            if (b.status === "PENDING") pending += 1;
            else if (b.status === "CONFIRMED") confirmed += 1;
            else if (b.status === "REJECTED" || b.status === "CANCELLED") rejected += 1;
        }
        return { pending, confirmed, rejected, total: safariBookings.length };
    }, [safariBookings]);

    const filteredBookings = useMemo(() => {
        return safariBookings.filter((b) => {
            if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
            if (selectedSlot !== "ALL" && !b.slot.startsWith(selectedSlot)) return false;
            return true;
        });
    }, [safariBookings, statusFilter, selectedSlot]);

    const handleAddBlackout = () => {
        if (!blockDateStr) return;
        setBlackoutDates((prev) => ({ ...prev, [blockDateStr]: blockReason || "Vendor Blackout" }));
        setShowBlockModal(false);
        setBlockReason("");
        setBlockDateStr("");
    };

    const handleRemoveBlackout = (dateKey: string) => {
        setBlackoutDates((prev) => {
            const next = { ...prev };
            delete next[dateKey];
            return next;
        });
    };

    const monthLabel = monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });

    return (
        <div className="p-6 space-y-6">
            {/* Header & Navigation */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <button
                        onClick={() => navigate("/listings")}
                        className="inline-flex items-center gap-1.5 text-[12px] mb-2 hover:underline"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        <ArrowLeft size={14} /> Back to All Listings
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                            {listingName}
                        </h1>
                        <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                            style={{ background: "rgba(5,150,105,0.15)", color: "#34d399", border: "1px solid rgba(5,150,105,0.3)" }}
                        >
                            Safari Listing
                        </span>
                        <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                            style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}
                        >
                            {status}
                        </span>
                    </div>
                    <p className="text-[12px] flex items-center gap-1.5 mt-1" style={{ color: "var(--text-secondary)" }}>
                        <MapPin size={13} style={{ color: "#34d399" }} /> {nationalPark}, Sri Lanka
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/listings/${listingId || "safari-1"}/edit`)}
                        className="px-4 py-2 rounded-lg text-[13px] flex items-center gap-2"
                        style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                    >
                        <Edit3 size={14} /> Edit Safari
                    </button>
                    <a
                        href={`http://localhost:3000/browse`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-lg text-[13px] flex items-center gap-2"
                        style={{ background: "var(--active-overlay)", border: "1px solid var(--border-accent)", color: "var(--accent-navy-light)", fontWeight: 600 }}
                    >
                        <ExternalLink size={14} /> View Client Page
                    </a>
                </div>
            </div>

            {/* Overview Metrics Cards */}
            <div>
                <h2 className="text-[14px] mb-3 font-semibold" style={{ color: "var(--text-primary)" }}>
                    Safari Booking Status & Reservations Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => setStatusFilter("ALL")}
                        className="text-left p-4 rounded-xl transition-all"
                        style={{
                            background: statusFilter === "ALL" ? "var(--active-overlay)" : "var(--bg-panel)",
                            border: statusFilter === "ALL" ? "2px solid var(--accent-navy)" : "1px solid var(--border-light)",
                            boxShadow: "var(--shadow-sm)",
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>Total Reservations</span>
                            <Filter size={16} style={{ color: "var(--accent-navy-light)" }} />
                        </div>
                        <div className="text-[24px] font-bold" style={{ color: "var(--text-primary)" }}>{counts.total}</div>
                        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>All safari game drive bookings</p>
                    </button>

                    <button
                        onClick={() => setStatusFilter("PENDING")}
                        className="text-left p-4 rounded-xl transition-all"
                        style={{
                            background: statusFilter === "PENDING" ? "rgba(245,158,11,0.1)" : "var(--bg-panel)",
                            border: statusFilter === "PENDING" ? "2px solid #f59e0b" : "1px solid var(--border-light)",
                            boxShadow: "var(--shadow-sm)",
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-medium" style={{ color: "#fbbf24" }}>Pending Requests</span>
                            <Clock size={16} style={{ color: "#f59e0b" }} />
                        </div>
                        <div className="text-[24px] font-bold" style={{ color: "#fbbf24" }}>{counts.pending}</div>
                        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>Awaiting guide & jeep confirmation</p>
                    </button>

                    <button
                        onClick={() => setStatusFilter("CONFIRMED")}
                        className="text-left p-4 rounded-xl transition-all"
                        style={{
                            background: statusFilter === "CONFIRMED" ? "rgba(34,197,94,0.1)" : "var(--bg-panel)",
                            border: statusFilter === "CONFIRMED" ? "2px solid #22c55e" : "1px solid var(--border-light)",
                            boxShadow: "var(--shadow-sm)",
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-medium" style={{ color: "#4ade80" }}>Confirmed Drives</span>
                            <CheckCircle2 size={16} style={{ color: "#22c55e" }} />
                        </div>
                        <div className="text-[24px] font-bold" style={{ color: "#4ade80" }}>{counts.confirmed}</div>
                        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>Active & ready game drives</p>
                    </button>

                    <button
                        onClick={() => setStatusFilter("REJECTED")}
                        className="text-left p-4 rounded-xl transition-all"
                        style={{
                            background: statusFilter === "REJECTED" ? "rgba(239,68,68,0.1)" : "var(--bg-panel)",
                            border: statusFilter === "REJECTED" ? "2px solid #ef4444" : "1px solid var(--border-light)",
                            boxShadow: "var(--shadow-sm)",
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-medium" style={{ color: "#f87171" }}>Cancelled / Declined</span>
                            <XCircle size={16} style={{ color: "#ef4444" }} />
                        </div>
                        <div className="text-[24px] font-bold" style={{ color: "#f87171" }}>{counts.rejected}</div>
                        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>Cancelled safari drives</p>
                    </button>
                </div>
            </div>

            {/* Safari Details & Jeep Packages Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configured Packages */}
                <div
                    className="lg:col-span-2 rounded-xl p-5"
                    style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
                >
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/30">
                        <div>
                            <h2 className="text-[15px] font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                <Car size={18} className="text-emerald-400" />
                                Configured Safari Jeep Packages
                            </h2>
                            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Available game drive options shown to client visitors</p>
                        </div>
                        <button
                            onClick={() => navigate(`/listings/${listingId || "safari-1"}/edit`)}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20"
                        >
                            + Manage Packages
                        </button>
                    </div>

                    <div className="space-y-3">
                        {safariPackages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className="p-4 rounded-xl space-y-2"
                                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
                            >
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>{pkg.name}</h3>
                                        {pkg.includesParkFees && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                ✓ Includes Park Entrance Fees
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[16px] font-extrabold text-emerald-400">{pkg.price}</span>
                                </div>
                                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{pkg.description}</p>
                                <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                                    <span className="flex items-center gap-1"><Users size={13} /> {pkg.capacity}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Clock size={13} /> {pkg.slot}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Park & Wildlife Highlights Card */}
                <div
                    className="rounded-xl p-5 space-y-4"
                    style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
                >
                    <div>
                        <h2 className="text-[15px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>Wildlife Species Highlights</h2>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Key species targeted in {nationalPark}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {wildlifeHighlights.map((animal: string) => (
                            <span
                                key={animal}
                                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                                style={{ background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }}
                            >
                                🐾 {animal}
                            </span>
                        ))}
                    </div>
                    <div className="pt-3 border-t border-slate-700/30 space-y-2 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        <div className="flex justify-between">
                            <span style={{ color: "var(--text-tertiary)" }}>Best Season:</span>
                            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Feb – Jul & Sep – Dec</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: "var(--text-tertiary)" }}>Naturalist Guide:</span>
                            <span className="font-semibold text-emerald-400">Included (Certified)</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: "var(--text-tertiary)" }}>Vehicle Type:</span>
                            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Modified 4x4 Open Jeep</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Drive Availability & Blackout Calendar */}
            <div
                className="rounded-xl overflow-hidden"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
            >
                <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <div className="flex items-center gap-3">
                        <CalendarDays size={18} style={{ color: "#34d399" }} />
                        <div>
                            <h2 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                                Game Drive Schedule & Blackout Dates
                            </h2>
                            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                                Manage daily jeep slots or stop safari bookings for maintenance / park closure
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <select
                            value={selectedSlot}
                            onChange={(e) => setSelectedSlot(e.target.value as any)}
                            className="px-3 py-1.5 rounded-lg text-[12px]"
                            style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                        >
                            <option value="ALL">All Drive Slots</option>
                            <option value="Morning">Morning (06:00 AM)</option>
                            <option value="Afternoon">Afternoon (02:30 PM)</option>
                            <option value="Full Day">Full Day (06:00 AM)</option>
                        </select>
                        <button
                            onClick={() => setShowBlockModal(true)}
                            className="px-3.5 py-1.5 rounded-lg text-[12px] flex items-center gap-1.5 font-semibold"
                            style={{ background: "var(--accent-navy)", color: "white", boxShadow: "0 0 10px var(--border-accent)" }}
                        >
                            <Lock size={13} /> Stop Date / Blackout Slot
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>{monthLabel}</h3>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setMonthDate((curr) => new Date(curr.getFullYear(), curr.getMonth() - 1, 1))}
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
                            >
                                <ChevronLeft size={15} style={{ color: "var(--text-secondary)" }} />
                            </button>
                            <button
                                onClick={() => setMonthDate(new Date())}
                                className="px-3 py-1 rounded-lg text-[11px] font-semibold"
                                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setMonthDate((curr) => new Date(curr.getFullYear(), curr.getMonth() + 1, 1))}
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
                            >
                                <ChevronRight size={15} style={{ color: "var(--text-secondary)" }} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                            <div key={d}>{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {getMonthDays(monthDate).map((dateVal, idx) => {
                            if (!dateVal) return <div key={`empty-${idx}`} className="aspect-square" />;

                            const iso = formatIsoDate(dateVal);
                            const blackoutReason = blackoutDates[iso];
                            const isSelected = selectedDate === iso;

                            return (
                                <button
                                    key={iso}
                                    onClick={() => setSelectedDate(iso)}
                                    className="aspect-square rounded-xl p-2 text-left flex flex-col justify-between transition-all relative overflow-hidden"
                                    style={{
                                        background: blackoutReason ? "rgba(100,116,139,0.15)" : "rgba(34,197,94,0.06)",
                                        border: isSelected
                                            ? "2px solid var(--accent-navy)"
                                            : blackoutReason
                                            ? "1px solid rgba(100,116,139,0.3)"
                                            : "1px solid rgba(34,197,94,0.2)",
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[12px] font-bold" style={{ color: "var(--text-primary)" }}>
                                            {dateVal.getDate()}
                                        </span>
                                        {blackoutReason && <Lock size={10} style={{ color: "#94a3b8" }} />}
                                    </div>

                                    <div>
                                        <div className="text-[11px] font-bold" style={{ color: blackoutReason ? "#94a3b8" : "#4ade80" }}>
                                            {blackoutReason ? "Blocked" : "Available"}
                                        </div>
                                        <div className="text-[9px] truncate opacity-80" style={{ color: blackoutReason ? "#94a3b8" : "#4ade80" }}>
                                            {blackoutReason ? blackoutReason.slice(0, 12) + "..." : "Jeep Slots Open"}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Blackouts List */}
                    <div className="mt-4 pt-4 border-t border-slate-700/30">
                        <h4 className="text-[12px] font-bold mb-2" style={{ color: "var(--text-primary)" }}>Active Date & Slot Blackouts</h4>
                        {Object.keys(blackoutDates).length === 0 ? (
                            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>No manual blackout dates set.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(blackoutDates).map(([dStr, rNote]) => (
                                    <div
                                        key={dStr}
                                        className="px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-2"
                                        style={{ background: "rgba(100,116,139,0.15)", border: "1px solid rgba(100,116,139,0.3)", color: "#cbd5e1" }}
                                    >
                                        <span className="font-bold">{dStr}:</span>
                                        <span>"{rNote}"</span>
                                        <button
                                            onClick={() => handleRemoveBlackout(dStr)}
                                            className="text-rose-400 hover:text-rose-300 font-bold ml-1"
                                            title="Unblock date"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Safari Reservations List */}
            <div
                className="rounded-xl overflow-hidden"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
            >
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <h2 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                        Safari Passenger Reservations ({filteredBookings.length})
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[12px]">
                        <thead>
                            <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-light)", color: "var(--text-tertiary)" }}>
                                <th className="px-4 py-3">Booking Ref</th>
                                <th className="px-4 py-3">Guest Name</th>
                                <th className="px-4 py-3">Jeep Package</th>
                                <th className="px-4 py-3">Slot & Date</th>
                                <th className="px-4 py-3">Passengers</th>
                                <th className="px-4 py-3">Total Rate</th>
                                <th className="px-4 py-3">Payment</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((b) => (
                                <tr key={b.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                                    <td className="px-4 py-3 font-bold" style={{ color: "var(--text-primary)" }}>{b.id}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{b.guestName}</div>
                                        <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{b.email}</div>
                                    </td>
                                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{b.package}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-emerald-400">{b.date}</div>
                                        <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{b.slot}</div>
                                    </td>
                                    <td className="px-4 py-3 font-bold" style={{ color: "var(--text-primary)" }}>{b.passengers} Guests</td>
                                    <td className="px-4 py-3 font-bold text-emerald-400">{b.price}</td>
                                    <td className="px-4 py-3 text-[11px]" style={{ color: "var(--text-secondary)" }}>{b.paymentMethod}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                            style={
                                                b.status === "CONFIRMED"
                                                    ? { background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }
                                                    : b.status === "PENDING"
                                                    ? { background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)" }
                                                    : { background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }
                                            }
                                        >
                                            {b.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Blackout Modal */}
            {showBlockModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        className="w-full max-w-md rounded-2xl p-6 space-y-4"
                        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>Stop Safari Date / Blackout Slot</h3>
                            <button onClick={() => setShowBlockModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[12px] font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Select Date</label>
                                <input
                                    type="date"
                                    value={blockDateStr}
                                    onChange={(e) => setBlockDateStr(e.target.value)}
                                    className="w-full p-2.5 rounded-lg text-[13px] outline-none"
                                    style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                                />
                            </div>
                            <div>
                                <label className="text-[12px] font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Blackout Reason</label>
                                <input
                                    type="text"
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    placeholder="e.g. Park maintenance, heavy rain..."
                                    className="w-full p-2.5 rounded-lg text-[13px] outline-none"
                                    style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowBlockModal(false)}
                                className="px-4 py-2 rounded-lg text-[12px]"
                                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddBlackout}
                                className="px-4 py-2 rounded-lg text-[12px] font-semibold"
                                style={{ background: "var(--accent-navy)", color: "white" }}
                            >
                                Apply Blackout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function SingleListingManager() {
    const navigate = useNavigate();
    const { id: listingId } = useParams();
    const { effectiveUser } = useAuth();
    const isAdmin = effectiveUser?.role === "admin";

    const [listing, setListing] = useState<any>(null);
    const [loadingListing, setLoadingListing] = useState(true);
    const [inventory, setInventory] = useState<StayInventoryResponse | null>(null);
    const [roomTypeId, setRoomTypeId] = useState<string>("");
    const [monthDate, setMonthDate] = useState(() => new Date());
    const [calendarEntries, setCalendarEntries] = useState<StayCalendarEntry[]>([]);
    const [bookings, setBookings] = useState<StayBookingResponse[]>([]);
    const [roomBlocks, setRoomBlocks] = useState<StayRoomBlockResponse[]>([]);
    const [loadingCalendar, setLoadingCalendar] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [submittingBlock, setSubmittingBlock] = useState(false);
    const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("ALL");

    // Fetch listing details
    useEffect(() => {
        if (!listingId) return;
        let cancelled = false;

        async function loadListing() {
            setLoadingListing(true);
            try {
                const data = await apiFetch<any>(`/admin/listings/${listingId}`);
                if (!cancelled) setListing(data);
            } catch (err: any) {
                try {
                    const fallbackData = await apiFetch<any>(`/listings/${listingId}`);
                    if (!cancelled) setListing(fallbackData);
                } catch {
                    try {
                        const stayData = await apiFetch<any>(`/vendor/stays/${listingId}`);
                        if (!cancelled) setListing(stayData);
                    } catch (fallbackErr) {
                        if (!cancelled) console.warn("Listing detail resolution deferred to inventory");
                    }
                }
            } finally {
                if (!cancelled) setLoadingListing(false);
            }
        }

        void loadListing();
        return () => {
            cancelled = true;
        };
    }, [listingId, isAdmin]);

    // Fetch inventory & bookings for this property
    useEffect(() => {
        if (!listingId) return;
        let cancelled = false;

        async function loadData() {
            try {
                const prefix = isAdmin ? `/admin/stays` : `/vendor/stays`;
                const [invRes, bookRes] = await Promise.all([
                    apiFetch<StayInventoryResponse>(`${prefix}/${listingId}/inventory`).catch(() =>
                        getStayInventory(listingId),
                    ),
                    apiFetch<any>(`${prefix}/${listingId}/bookings`).catch(() => listStayBookings(listingId)),
                ]);
                if (cancelled) return;

                setError(null);
                setInventory(invRes);
                const fetchedBookings = Array.isArray(bookRes.bookings) ? bookRes.bookings : Array.isArray(bookRes) ? bookRes : [];
                setBookings(fetchedBookings);

                const defaultRoomType = invRes.roomTypes[0]?.id ?? "";
                setRoomTypeId((curr) => curr || defaultRoomType);
            } catch (err: any) {
                if (!cancelled) setError(err?.message || "Failed to load inventory data.");
            }
        }

        void loadData();
        return () => {
            cancelled = true;
        };
    }, [listingId, isAdmin]);

    // Fetch room blocks
    useEffect(() => {
        if (!listingId || !roomTypeId) return;
        let cancelled = false;

        async function loadBlocks() {
            try {
                const prefix = isAdmin ? `/admin/stays` : `/vendor/stays`;
                const res = await apiFetch<StayRoomBlockListResponse>(
                    `${prefix}/${listingId}/blocks?roomTypeId=${roomTypeId}`,
                ).catch(() => listStayRoomBlocks(listingId, { roomTypeId }));
                if (cancelled) return;
                setRoomBlocks(res.blocks || []);
            } catch (err: any) {
                if (!cancelled) console.error("Error loading room blocks:", err);
            }
        }

        void loadBlocks();
        return () => {
            cancelled = true;
        };
    }, [listingId, roomTypeId, monthDate, isAdmin]);

    // Fetch calendar
    useEffect(() => {
        if (!listingId || !roomTypeId) {
            setCalendarEntries([]);
            setLoadingCalendar(false);
            return;
        }

        let cancelled = false;
        async function loadCalendar() {
            setLoadingCalendar(true);
            try {
                const startStr = formatIsoDate(startOfMonth(monthDate));
                const endStr = formatIsoDate(endOfMonth(monthDate));
                const prefix = isAdmin ? `/admin/stays` : `/vendor/stays`;
                const res = await apiFetch<StayCalendarResponse>(
                    `${prefix}/${listingId}/calendar?startDate=${startStr}&endDate=${endStr}&roomTypeId=${roomTypeId}`,
                ).catch(() => getStayCalendar(listingId, startStr, endStr, roomTypeId));
                if (cancelled) return;
                setCalendarEntries(res.entries || []);
            } catch (err: any) {
                if (!cancelled) setError(err?.message || "Unable to load calendar entries.");
            } finally {
                if (!cancelled) setLoadingCalendar(false);
            }
        }

        void loadCalendar();
        return () => {
            cancelled = true;
        };
    }, [listingId, roomTypeId, monthDate, isAdmin]);

    const roomType = useMemo(
        () => inventory?.roomTypes.find((r) => r.id === roomTypeId) ?? null,
        [inventory, roomTypeId],
    );

    const roomUnitsForType = useMemo(
        () => inventory?.roomUnits.filter((unit) => roomType?.roomUnits?.some((r) => r.id === unit.id)) ?? inventory?.roomUnits ?? [],
        [inventory, roomType],
    );

    const entryByDate = useMemo(() => {
        const map = new Map<string, StayCalendarEntry>();
        for (const entry of calendarEntries) {
            map.set(entry.date, entry);
        }
        return map;
    }, [calendarEntries]);

    const selectedEntry = selectedDate ? entryByDate.get(selectedDate) ?? null : null;

    // Booking Metric Counts
    const bookingCounts = useMemo(() => {
        let pending = 0;
        let confirmed = 0;
        let rejected = 0;
        for (const b of bookings) {
            const st = String(b.status || "").toUpperCase();
            if (st === "PENDING" || st === "NEW_REQUEST" || st === "SUBMITTED") pending += 1;
            else if (st === "CONFIRMED" || st === "APPROVED" || st === "COMPLETED") confirmed += 1;
            else if (st === "REJECTED" || st === "CANCELLED") rejected += 1;
        }
        return { pending, confirmed, rejected, total: bookings.length };
    }, [bookings]);

    // Filtered Bookings List
    const filteredBookings = useMemo(() => {
        if (statusFilter === "ALL") return bookings;
        return bookings.filter((b) => {
            const st = String(b.status || "").toUpperCase();
            if (statusFilter === "PENDING") return st === "PENDING" || st === "NEW_REQUEST" || st === "SUBMITTED";
            if (statusFilter === "CONFIRMED") return st === "CONFIRMED" || st === "APPROVED" || st === "COMPLETED";
            if (statusFilter === "REJECTED") return st === "REJECTED" || st === "CANCELLED";
            return true;
        });
    }, [bookings, statusFilter]);

    async function handleBlockSubmit(payload: { roomUnitId: string; startDate: string; endDate: string; reason: string; blockType: string }) {
        if (!listingId) return;
        setSubmittingBlock(true);
        try {
            const cleanPayload: any = {
                startDate: payload.startDate,
                endDate: payload.endDate,
                reason: payload.reason,
                blockType: payload.blockType,
            };
            const targetUnitId = payload.roomUnitId || roomUnitsForType[0]?.id || inventory?.roomUnits[0]?.id;
            if (targetUnitId && targetUnitId.length > 20) {
                cleanPayload.roomUnitId = targetUnitId;
            }

            const prefix = isAdmin ? `/admin/stays` : `/vendor/stays`;
            await apiFetch(`${prefix}/${listingId}/blocks`, {
                method: "POST",
                body: JSON.stringify(cleanPayload),
            }).catch(() => createRoomBlock(listingId, cleanPayload));

            // Reload calendar & blocks
            const startStr = formatIsoDate(startOfMonth(monthDate));
            const endStr = formatIsoDate(endOfMonth(monthDate));
            const [resCal, resBlocks] = await Promise.all([
                getStayCalendar(listingId, startStr, endStr, roomTypeId),
                listStayRoomBlocks(listingId, { roomTypeId }),
            ]);
            setCalendarEntries(resCal.entries || []);
            setRoomBlocks(resBlocks.blocks || []);
            setShowBlockModal(false);
        } catch (err: any) {
            setError(err?.message || "Failed to create date blackout block.");
        } finally {
            setSubmittingBlock(false);
        }
    }

    async function handleReleaseBlock(blockId: string) {
        if (!listingId || !roomTypeId) return;
        try {
            const prefix = isAdmin ? `/admin/stays` : `/vendor/stays`;
            await apiFetch(`${prefix}/${listingId}/blocks/${blockId}`, { method: "DELETE" }).catch(() =>
                releaseRoomBlock(listingId, blockId),
            );
            const startStr = formatIsoDate(startOfMonth(monthDate));
            const endStr = formatIsoDate(endOfMonth(monthDate));
            const [resCal, resBlocks] = await Promise.all([
                getStayCalendar(listingId, startStr, endStr, roomTypeId),
                listStayRoomBlocks(listingId, { roomTypeId }),
            ]);
            setCalendarEntries(resCal.entries || []);
            setRoomBlocks(resBlocks.blocks || []);
        } catch (err: any) {
            setError(err?.message || "Failed to release room block.");
        }
    }

    const isSafariCategory =
        listing?.category?.toLowerCase() === "safari" ||
        listing?.listing_type?.toLowerCase() === "safari" ||
        listing?.listingType?.toLowerCase() === "safari" ||
        Boolean(listing?.safariDetail) ||
        listingId === "safari-1" ||
        listingId === "lst_001";

    if (isSafariCategory) {
        return <SafariListingManager listing={listing} listingId={listingId} isAdmin={isAdmin} navigate={navigate} />;
    }

    if (loadingListing && !inventory) {
        return (
            <div className="p-6">
                <DashboardSkeleton />
            </div>
        );
    }

    const monthLabel = monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    const listingName = listing?.name || listing?.title || listing?.hotelDetail?.propertyName || (inventory ? "Stay Accommodation" : "Stay Listing");
    const listingLocation = listing?.address || listing?.city || listing?.destination?.name || "Sri Lanka";

    return (
        <div className="p-6 space-y-6">
            {/* Header & Navigation */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <button
                        onClick={() => navigate("/listings")}
                        className="inline-flex items-center gap-1.5 text-[12px] mb-2 hover:underline"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        <ArrowLeft size={14} /> Back to All Listings
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                            {listingName}
                        </h1>
                        <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                            style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}
                        >
                            {listing?.status || "Active"}
                        </span>
                    </div>
                    <p className="text-[12px] flex items-center gap-1.5 mt-1" style={{ color: "var(--text-secondary)" }}>
                        <MapPin size={13} style={{ color: "var(--accent-navy-light)" }} /> {listingLocation}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/listings/${listingId}/edit`)}
                        className="px-4 py-2 rounded-lg text-[13px] flex items-center gap-2"
                        style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                    >
                        <Edit3 size={14} /> Edit Listing
                    </button>
                    <a
                        href={`http://localhost:5173/stays/${listingId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-lg text-[13px] flex items-center gap-2"
                        style={{ background: "var(--active-overlay)", border: "1px solid var(--border-accent)", color: "var(--accent-navy-light)", fontWeight: 600 }}
                    >
                        <ExternalLink size={14} /> View Client Page
                    </a>
                </div>
            </div>

            {error && !inventory && (
                <div
                    className="rounded-xl px-4 py-3 text-[13px] flex items-center gap-2"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
                >
                    <AlertCircle size={15} /> {error}
                </div>
            )}

            {/* Top Booking Metric Filter Cards */}
            <div>
                <h2 className="text-[14px] mb-3 font-semibold" style={{ color: "var(--text-primary)" }}>
                    Booking Status Filters & Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* All Bookings */}
                    <button
                        onClick={() => setStatusFilter("ALL")}
                        className="text-left p-4 rounded-xl transition-all"
                        style={{
                            background: statusFilter === "ALL" ? "var(--active-overlay)" : "var(--bg-panel)",
                            border: statusFilter === "ALL" ? "2px solid var(--accent-navy)" : "1px solid var(--border-light)",
                            boxShadow: "var(--shadow-sm)",
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>Total Bookings</span>
                            <Filter size={16} style={{ color: "var(--accent-navy-light)" }} />
                        </div>
                        <div className="text-[24px] font-bold" style={{ color: "var(--text-primary)" }}>{bookingCounts.total}</div>
                        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>All reservations for this stay</p>
                    </button>

                    {/* Pending Requests */}
                    <button
                        onClick={() => setStatusFilter("PENDING")}
                        className="text-left p-4 rounded-xl transition-all"
                        style={{
                            background: statusFilter === "PENDING" ? "rgba(245,158,11,0.1)" : "var(--bg-panel)",
                            border: statusFilter === "PENDING" ? "2px solid #f59e0b" : "1px solid var(--border-light)",
                            boxShadow: "var(--shadow-sm)",
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-medium" style={{ color: "#fbbf24" }}>Pending Requests</span>
                            <Clock size={16} style={{ color: "#f59e0b" }} />
                        </div>
                        <div className="text-[24px] font-bold" style={{ color: "#fbbf24" }}>{bookingCounts.pending}</div>
                        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>Awaiting approval/payment</p>
                    </button>

                    {/* Confirmed / Approved */}
                    <button
                        onClick={() => setStatusFilter("CONFIRMED")}
                        className="text-left p-4 rounded-xl transition-all"
                        style={{
                            background: statusFilter === "CONFIRMED" ? "rgba(34,197,94,0.1)" : "var(--bg-panel)",
                            border: statusFilter === "CONFIRMED" ? "2px solid #22c55e" : "1px solid var(--border-light)",
                            boxShadow: "var(--shadow-sm)",
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-medium" style={{ color: "#4ade80" }}>Confirmed Bookings</span>
                            <CheckCircle2 size={16} style={{ color: "#22c55e" }} />
                        </div>
                        <div className="text-[24px] font-bold" style={{ color: "#4ade80" }}>{bookingCounts.confirmed}</div>
                        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>Approved & active guests</p>
                    </button>

                    {/* Rejected / Cancelled */}
                    <button
                        onClick={() => setStatusFilter("REJECTED")}
                        className="text-left p-4 rounded-xl transition-all"
                        style={{
                            background: statusFilter === "REJECTED" ? "rgba(239,68,68,0.1)" : "var(--bg-panel)",
                            border: statusFilter === "REJECTED" ? "2px solid #ef4444" : "1px solid var(--border-light)",
                            boxShadow: "var(--shadow-sm)",
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-medium" style={{ color: "#f87171" }}>Rejected / Cancelled</span>
                            <XCircle size={16} style={{ color: "#ef4444" }} />
                        </div>
                        <div className="text-[24px] font-bold" style={{ color: "#f87171" }}>{bookingCounts.rejected}</div>
                        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>Declined or cancelled</p>
                    </button>
                </div>
            </div>

            {/* Availability Calendar & Blackout Section */}
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
                {/* Calendar Panel */}
                <div
                    className="rounded-xl overflow-hidden"
                    style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
                >
                    <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <div className="flex items-center gap-3">
                            <CalendarDays size={18} style={{ color: "var(--accent-navy)" }} />
                            <div>
                                <h2 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                                    Availability & Nightly Inventory
                                </h2>
                                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                                    {monthLabel} • {roomType?.name || "All Room Types"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <select
                                value={roomTypeId}
                                onChange={(e) => setRoomTypeId(e.target.value)}
                                className="px-3 py-1.5 rounded-lg text-[12px]"
                                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                            >
                                {(inventory?.roomTypes ?? []).map((rt) => (
                                    <option key={rt.id} value={rt.id}>
                                        {rt.name} ({rt.totalUnits || rt.roomUnits?.length || 0} Units)
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => setShowBlockModal(true)}
                                className="px-3.5 py-1.5 rounded-lg text-[12px] flex items-center gap-1.5 font-semibold"
                                style={{ background: "var(--accent-navy)", color: "white", boxShadow: "0 0 10px var(--border-accent)" }}
                            >
                                <Lock size={13} /> Stop Date / Block Room
                            </button>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>{monthLabel}</h3>
                                {/* Fast Forward Testing Month/Date Picker */}
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
                                    <FastForward size={12} style={{ color: "var(--accent-navy-light)" }} />
                                    <input
                                        type="month"
                                        value={formatIsoMonth(monthDate)}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const [y, m] = e.target.value.split("-").map(Number);
                                                setMonthDate(new Date(y, m - 1, 1));
                                            }
                                        }}
                                        className="bg-transparent text-[11px] outline-none cursor-pointer"
                                        style={{ color: "var(--text-primary)" }}
                                        title="Fast-forward test date"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => setMonthDate((curr) => new Date(curr.getFullYear(), curr.getMonth() - 1, 1))}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
                                >
                                    <ChevronLeft size={15} style={{ color: "var(--text-secondary)" }} />
                                </button>
                                <button
                                    onClick={() => setMonthDate(new Date())}
                                    className="px-3 py-1 rounded-lg text-[11px] font-semibold"
                                    style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => setMonthDate((curr) => new Date(curr.getFullYear(), curr.getMonth() + 1, 1))}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
                                >
                                    <ChevronRight size={15} style={{ color: "var(--text-secondary)" }} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                                <div key={d}>{d}</div>
                            ))}
                        </div>

                        {loadingCalendar ? (
                            <DashboardSkeleton />
                        ) : (
                            <div className="grid grid-cols-7 gap-2">
                                {getMonthDays(monthDate).map((dateVal, idx) => {
                                    if (!dateVal) return <div key={`empty-${idx}`} className="aspect-square" />;

                                    const iso = formatIsoDate(dateVal);
                                    const entry = entryByDate.get(iso);
                                    const status = entry ? statusFromEntry(entry) : "available";
                                    const style = STATUS_STYLES[status];
                                    const isSelected = selectedDate === iso;

                                    return (
                                        <button
                                            key={iso}
                                            onClick={() => setSelectedDate(iso)}
                                            className="aspect-square rounded-xl p-2 text-left flex flex-col justify-between transition-all relative overflow-hidden"
                                            style={{
                                                background: style.bg,
                                                border: isSelected ? "2px solid var(--accent-navy)" : `1px solid ${style.border}`,
                                                boxShadow: isSelected ? "0 0 0 2px var(--accent-navy-subtle)" : "none",
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[12px] font-bold" style={{ color: "var(--text-primary)" }}>
                                                    {dateVal.getDate()}
                                                </span>
                                                {status === "blocked" && <Lock size={10} style={{ color: "#94a3b8" }} />}
                                                {status === "sold-out" && <XCircle size={10} style={{ color: "#f87171" }} />}
                                            </div>

                                            <div>
                                                <div className="text-[11px] font-bold" style={{ color: style.text }}>
                                                    {entry ? `${entry.availableUnits}/${entry.totalUnits} Left` : "—"}
                                                </div>
                                                <div className="text-[9px] truncate opacity-80" style={{ color: style.text }}>
                                                    {roomType?.name ? `${roomType.name.slice(0, 10)}...` : style.badge}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Legend */}
                        <div className="flex items-center gap-4 flex-wrap mt-5 pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
                            {(Object.entries(STATUS_STYLES) as [CellStatus, typeof STATUS_STYLES.available][]).map(([k, s]) => (
                                <div key={k} className="flex items-center gap-1.5">
                                    <div className="w-3.5 h-3.5 rounded" style={{ background: s.bg, border: `1px solid ${s.border}` }} />
                                    <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{s.badge}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Day Details Drawer */}
                <div
                    className="rounded-xl overflow-hidden"
                    style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
                >
                    <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
                            {selectedDate ? `Day Details: ${formatDisplayDate(selectedDate)}` : "Select a Date"}
                        </h2>
                    </div>

                    <div className="p-5 space-y-4">
                        {selectedDate ? (
                            <>
                                <div className="p-3 rounded-lg" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
                                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Selected Room Type</p>
                                    <p className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>{roomType?.name || "All Rooms"}</p>
                                </div>

                                {selectedEntry ? (
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div className="p-2.5 rounded-lg text-center" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                                            <div className="text-[10px]" style={{ color: "#4ade80" }}>Available</div>
                                            <div className="text-[18px] font-bold" style={{ color: "#4ade80" }}>{selectedEntry.availableUnits}</div>
                                        </div>
                                        <div className="p-2.5 rounded-lg text-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                                            <div className="text-[10px]" style={{ color: "#f87171" }}>Booked</div>
                                            <div className="text-[18px] font-bold" style={{ color: "#f87171" }}>{selectedEntry.bookedUnits}</div>
                                        </div>
                                        <div className="p-2.5 rounded-lg text-center" style={{ background: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.2)" }}>
                                            <div className="text-[10px]" style={{ color: "#94a3b8" }}>Blocked</div>
                                            <div className="text-[18px] font-bold" style={{ color: "#94a3b8" }}>{selectedEntry.blockedUnits}</div>
                                        </div>
                                        <div className="p-2.5 rounded-lg text-center" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
                                            <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Total Capacity</div>
                                            <div className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>{selectedEntry.totalUnits}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>No entry recorded for this date.</p>
                                )}

                                {/* Room-wise Units Status List for Selected Date */}
                                <div className="space-y-2 pt-1">
                                    <h3 className="text-[12px] font-bold" style={{ color: "var(--text-primary)" }}>Room Units Status ({roomUnitsForType.length})</h3>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                        {roomUnitsForType.map((unit) => {
                                            const isBlocked = roomBlocks.some((b) => b.roomUnitId === unit.id && b.startDate <= selectedDate && b.endDate > selectedDate);
                                            return (
                                                <div
                                                    key={unit.id}
                                                    className="flex items-center justify-between p-2 rounded text-[11px]"
                                                    style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
                                                >
                                                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                                                        Room #{unit.roomNumber} {unit.roomName ? `(${unit.roomName})` : ""}
                                                    </span>
                                                    {isBlocked ? (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">BLOCKED</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">UNBOOKED</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Active Blackout Blocks on this date */}
                                <div className="space-y-2 pt-2">
                                    <h3 className="text-[12px] font-bold" style={{ color: "var(--text-primary)" }}>Active Manual Blackouts</h3>
                                    {roomBlocks.filter((b) => b.startDate <= selectedDate && b.endDate > selectedDate).length === 0 ? (
                                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>No manual room blocks active on this date.</p>
                                    ) : (
                                        roomBlocks
                                            .filter((b) => b.startDate <= selectedDate && b.endDate > selectedDate)
                                            .map((block) => (
                                                <div
                                                    key={block.id}
                                                    className="p-3 rounded-lg space-y-1"
                                                    style={{ background: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.25)" }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-bold" style={{ color: "#94a3b8" }}>
                                                            {block.blockType.toUpperCase()} BLOCK
                                                        </span>
                                                        <button
                                                            onClick={() => handleReleaseBlock(block.id)}
                                                            className="text-[10px] px-2 py-0.5 rounded text-rose-400 border border-rose-500/30 hover:bg-rose-500/10"
                                                        >
                                                            Release
                                                        </button>
                                                    </div>
                                                    <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                                                        {block.startDate} → {block.endDate}
                                                    </p>
                                                    {block.reason && (
                                                        <p className="text-[11px] italic" style={{ color: "var(--text-tertiary)" }}>
                                                            Note: "{block.reason}"
                                                        </p>
                                                    )}
                                                </div>
                                            ))
                                    )}
                                </div>

                                <button
                                    onClick={() => setShowBlockModal(true)}
                                    className="w-full py-2.5 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-2"
                                    style={{ background: "var(--active-overlay)", border: "1px solid var(--border-accent)", color: "var(--accent-navy-light)" }}
                                >
                                    <Lock size={13} /> Block Selected Date Range
                                </button>
                            </>
                        ) : (
                            <div className="py-12 text-center text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                                Click any date on the calendar to view detailed availability and active blackout notes.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bookings List Table (Filtered by Status) */}
            <div
                className="rounded-xl overflow-hidden"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
            >
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <div>
                        <h2 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                            Listing Bookings ({filteredBookings.length})
                        </h2>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            Filter status: <span className="font-bold text-[#60a5fa]">{statusFilter}</span>
                        </p>
                    </div>
                </div>

                {filteredBookings.length === 0 ? (
                    <div className="p-8 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                        No bookings found matching filter <span className="font-bold">{statusFilter}</span>.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b text-[11px] uppercase tracking-wider" style={{ borderColor: "var(--border-light)", color: "var(--text-tertiary)" }}>
                                    <th className="p-3.5 pl-5">Booking Ref</th>
                                    <th className="p-3.5">Guest</th>
                                    <th className="p-3.5">Dates</th>
                                    <th className="p-3.5">Rooms</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5 pr-5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-[13px]" style={{ borderColor: "var(--border-light)" }}>
                                {filteredBookings.map((booking) => {
                                    const st = String(booking.status || "").toUpperCase();
                                    const isPending = st === "PENDING" || st === "SUBMITTED" || st === "NEW_REQUEST";
                                    const isConfirmed = st === "CONFIRMED" || st === "APPROVED" || st === "COMPLETED";

                                    return (
                                        <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3.5 pl-5 font-mono text-[12px]" style={{ color: "var(--accent-navy-light)" }}>
                                                {booking.id.slice(0, 8)}...
                                            </td>
                                            <td className="p-3.5 font-medium" style={{ color: "var(--text-primary)" }}>
                                                {booking.guestName || "Guest"}
                                                <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{booking.guestEmail || "No email"}</div>
                                            </td>
                                            <td className="p-3.5" style={{ color: "var(--text-secondary)" }}>
                                                {booking.checkInDate} → {booking.checkOutDate}
                                            </td>
                                            <td className="p-3.5" style={{ color: "var(--text-secondary)" }}>
                                                {booking.rooms?.length || 1} Room(s)
                                            </td>
                                            <td className="p-3.5">
                                                <span
                                                    className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                                    style={{
                                                        background: isConfirmed ? "rgba(34,197,94,0.12)" : isPending ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                                                        color: isConfirmed ? "#4ade80" : isPending ? "#fbbf24" : "#f87171",
                                                        border: `1px solid ${isConfirmed ? "rgba(34,197,94,0.3)" : isPending ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)"}`,
                                                    }}
                                                >
                                                    {st}
                                                </span>
                                            </td>
                                            <td className="p-3.5 pr-5">
                                                <button
                                                    onClick={() => navigate(`/bookings`)}
                                                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Block Modal */}
            {showBlockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.65)" }}>
                    <div
                        className="w-full max-w-md rounded-2xl p-6"
                        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-lg)" }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>
                                    Stop Date / Create Room Blackout
                                </h3>
                                <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                                    Prevent client-side bookings for selected date range.
                                </p>
                            </div>
                            <button onClick={() => setShowBlockModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--input-background)" }}>
                                <X size={14} style={{ color: "var(--text-secondary)" }} />
                            </button>
                        </div>

                        <BlockForm
                            roomUnits={roomUnitsForType}
                            initialDate={selectedDate || formatIsoDate(new Date())}
                            submitting={submittingBlock}
                            onSubmit={handleBlockSubmit}
                            onClose={() => setShowBlockModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function BlockForm({
    roomUnits,
    initialDate,
    submitting,
    onSubmit,
    onClose,
}: {
    roomUnits: StayRoomUnit[];
    initialDate: string;
    submitting: boolean;
    onSubmit: (payload: { roomUnitIds: string[]; startDate: string; endDate: string; reason: string; blockType: string }) => void;
    onClose: () => void;
}) {
    const [roomUnitIds, setRoomUnitIds] = useState<string[]>(roomUnits.length > 0 ? [roomUnits[0].id] : []);
    const [startDate, setStartDate] = useState(initialDate);
    const [endDate, setEndDate] = useState(() => addDays(initialDate, 1));
    const [reason, setReason] = useState("");
    const [blockType, setBlockType] = useState("manual");

    return (
        <div className="space-y-4">
            <div>
                <label className="text-[12px] block mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>
                    Room Units
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2 p-3 rounded-lg" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
                    {roomUnits.length === 0 ? (
                        <p className="text-[11px]" style={{ color: "#f87171" }}>No room units available.</p>
                    ) : (
                        roomUnits.map((u) => (
                            <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={roomUnitIds.includes(u.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setRoomUnitIds((prev) => [...prev, u.id]);
                                        } else {
                                            setRoomUnitIds((prev) => prev.filter((id) => id !== u.id));
                                        }
                                    }}
                                    className="rounded text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                                    Room #{u.roomNumber} {u.roomName ? `(${u.roomName})` : ""}
                                </span>
                            </label>
                        ))
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[12px] block mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                            const newStart = e.target.value;
                            setStartDate(newStart);
                            if (endDate <= newStart) setEndDate(addDays(newStart, 1));
                        }}
                        className="w-full px-3 py-2 rounded-lg text-[13px]"
                        style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                    />
                </div>
                <div>
                    <label className="text-[12px] block mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>
                        End Date
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-[13px]"
                        style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                    />
                </div>
            </div>

            <div>
                <label className="text-[12px] block mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>
                    Block Reason / Type
                </label>
                <select
                    value={blockType}
                    onChange={(e) => setBlockType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-[13px]"
                    style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                >
                    <option value="manual">Manual Blackout</option>
                    <option value="maintenance">Maintenance & Repairs</option>
                    <option value="offline_booking">Offline / Direct Booking</option>
                </select>
            </div>

            <div>
                <label className="text-[12px] block mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>
                    Reference Note / Internal Note
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Enter reason for blocking these dates (e.g. Maintenance, Direct Phone Booking)..."
                    className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                    style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-[13px]"
                    style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
                >
                    Cancel
                </button>
                <button
                    disabled={submitting || !startDate || !endDate || roomUnitIds.length === 0}
                    onClick={() => {
                        const validEnd = endDate <= startDate ? addDays(startDate, 1) : endDate;
                        onSubmit({ roomUnitIds, startDate, endDate: validEnd, reason, blockType });
                    }}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50"
                    style={{ background: "var(--accent-navy)" }}
                >
                    {submitting ? "Saving Blackout..." : "Stop Date & Save Block"}
                </button>
            </div>
        </div>
    );
}

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import {
  getStayInventory,
  listStayBookings,
  updateStayBookingDates,
  updateStayBookingStatus,
  type StayBookingResponse,
  type StayInventoryResponse,
} from "../api/stayVendorApi";
import { EmptyState } from "../common/EmptyState";
import { DashboardSkeleton } from "../common/SkeletonLoader";
import { StayHotelPropertyGate, StayHotelPropertySwitcher, useStayHotel } from "./StayHotelContext";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function nightsBetween(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 86400000));
}

function derivedBookingTotal(booking: StayBookingResponse) {
  return booking.rooms.reduce((sum, room) => sum + Number(room.nightlyRate || 0) * nightsBetween(room.checkInDate, room.checkOutDate), 0);
}

function formatAmount(booking: StayBookingResponse) {
  if (booking.totalAmount !== null && booking.totalAmount !== undefined) {
    return `${booking.currency ?? ""} ${Number(booking.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();
  }
  return derivedBookingTotal(booking).toLocaleString();
}

const STATUS_STYLES: Record<string, { background: string; color: string }> = {
  pending: { background: "rgba(245,158,11,0.14)", color: "#fbbf24" },
  confirmed: { background: "rgba(16,185,129,0.14)", color: "#34d399" },
  cancelled: { background: "rgba(239,68,68,0.14)", color: "#f87171" },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status.toLowerCase()] ?? { background: "rgba(59,130,246,0.12)", color: "#60a5fa" };
  return (
    <span className="px-2 py-1 rounded-full text-[11px] capitalize" style={style}>
      {status.toLowerCase() === "cancelled" ? "rejected / cancelled" : status}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{label}</p>
      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{value}</p>
    </div>
  );
}

function ReservationDrawer({
  booking,
  roomNumberLookup,
  onClose,
  onUpdateStatus,
  onChangeDates,
  updating,
  actionError,
}: {
  booking: StayBookingResponse;
  roomNumberLookup: Map<string, string>;
  onClose: () => void;
  onUpdateStatus: (status: "confirmed" | "cancelled") => void;
  onChangeDates: (checkIn: string, checkOut: string, note: string) => Promise<boolean>;
  updating: boolean;
  actionError: string | null;
}) {
  const currentStatus = booking.status.toLowerCase();
  const [editingDates, setEditingDates] = useState(false);
  const [checkIn, setCheckIn] = useState(booking.checkInDate);
  const [checkOut, setCheckOut] = useState(booking.checkOutDate);
  const [note, setNote] = useState("");

  useEffect(() => {
    setCheckIn(booking.checkInDate);
    setCheckOut(booking.checkOutDate);
    setNote("");
    setEditingDates(false);
  }, [booking.id, booking.checkInDate, booking.checkOutDate]);

  const datesInvalid = !checkIn || !checkOut || checkOut <= checkIn;
  const datesUnchanged = checkIn === booking.checkInDate && checkOut === booking.checkOutDate;
  const inputStyle = { background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" };
  const wasChanged = (booking.dateChanges?.length ?? 0) > 0;

  return (
    <div
      className="fixed right-0 top-0 h-full w-[400px] z-50 overflow-y-auto"
      style={{ background: "var(--bg-panel)", borderLeft: "1px solid var(--border-light)", boxShadow: "-8px 0 32px rgba(0,0,0,0.35)" }}
    >
      <div className="px-5 py-4 flex items-start justify-between sticky top-0" style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border-light)" }}>
        <div>
          <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>
            Booking request
          </p>
          <p className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {booking.reference || booking.bookingId}
          </p>
          <div className="mt-1"><StatusBadge status={booking.status} /></div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--input-background)" }}>
          <X size={14} style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {actionError && (
          <div className="rounded-xl px-4 py-3 text-[12px]" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
            {actionError}
          </div>
        )}

        {/* Actions */}
        {currentStatus !== "cancelled" && (
          <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
            <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
              Review
            </p>
            <div className="flex gap-2">
              {currentStatus === "pending" && (
                <button
                  disabled={updating}
                  onClick={() => onUpdateStatus("confirmed")}
                  className="flex-1 px-3 py-2 rounded-lg text-[13px] disabled:opacity-60"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", color: "#34d399", fontWeight: 600 }}
                >
                  {updating ? "Updating..." : "Accept"}
                </button>
              )}
              <button
                disabled={updating}
                onClick={() => setEditingDates((value) => !value)}
                className="flex-1 px-3 py-2 rounded-lg text-[13px] disabled:opacity-60"
                style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa", fontWeight: 600 }}
              >
                Change dates
              </button>
              <button
                disabled={updating}
                onClick={() => {
                  if (window.confirm("Reject this booking and release the rooms?")) onUpdateStatus("cancelled");
                }}
                className="flex-1 px-3 py-2 rounded-lg text-[13px] disabled:opacity-60"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontWeight: 600 }}
              >
                Reject
              </button>
            </div>

            {editingDates && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    Check-in
                    <input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className="w-full mt-1 px-2 py-2 rounded-lg text-[13px]" style={inputStyle} />
                  </label>
                  <label className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    Check-out
                    <input type="date" value={checkOut} min={checkIn} onChange={(event) => setCheckOut(event.target.value)} className="w-full mt-1 px-2 py-2 rounded-lg text-[13px]" style={inputStyle} />
                  </label>
                </div>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Reason / note (e.g. no rooms left, agreed with guest)"
                  rows={2}
                  className="w-full px-2 py-2 rounded-lg text-[12px]"
                  style={inputStyle}
                />
                {checkIn && checkOut && !datesInvalid && (
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {nightsBetween(checkIn, checkOut)} night(s). The listed price is not recalculated automatically.
                  </p>
                )}
                <button
                  disabled={updating || datesInvalid || datesUnchanged}
                  onClick={async () => {
                    const ok = await onChangeDates(checkIn, checkOut, note);
                    if (ok) setEditingDates(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg text-[13px] disabled:opacity-50"
                  style={{ background: "var(--accent-navy)", color: "#fff", fontWeight: 600 }}
                >
                  {updating ? "Saving..." : "Save new dates"}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl p-4" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
          <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>
            Guest
          </p>
          <p className="text-[15px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {booking.guestName}
          </p>
          {booking.guestEmail && (
            <p className="text-[12px] mt-2 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <Mail size={12} />
              {booking.guestEmail}
            </p>
          )}
          {booking.guestPhone && (
            <p className="text-[12px] mt-1 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <Phone size={12} />
              {booking.guestPhone}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 mt-3">
            {booking.numberOfGuests ? <DetailRow label="Guests" value={booking.numberOfGuests} /> : null}
            {booking.nationality ? <DetailRow label="Nationality" value={booking.nationality} /> : null}
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
          <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>
            Stay Details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <DetailRow label="Check-in" value={formatDate(booking.checkInDate)} />
            <DetailRow label="Check-out" value={formatDate(booking.checkOutDate)} />
            <DetailRow label="Nights" value={nightsBetween(booking.checkInDate, booking.checkOutDate)} />
            <DetailRow label="Amount" value={formatAmount(booking)} />
          </div>
          {wasChanged && booking.originalCheckInDate && booking.originalCheckOutDate && (
            <p className="text-[11px] mt-3" style={{ color: "#fbbf24" }}>
              Dates changed. Originally requested {formatDate(booking.originalCheckInDate)} to {formatDate(booking.originalCheckOutDate)}.
            </p>
          )}
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
          <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>
            Rooms
          </p>
          <div className="space-y-3">
            {(booking.roomSummary?.length ?? 0) > 0
              ? booking.roomSummary!.map((entry, index) => (
                  <div key={`${entry.roomTypeName}-${index}`} className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {entry.quantity} × {entry.roomTypeName}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        Assigned: {entry.roomNumbers.join(", ") || "—"}
                      </p>
                    </div>
                  </div>
                ))
              : booking.rooms.map((room) => (
                  <div key={room.id} className="flex items-center justify-between">
                    <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {roomNumberLookup.get(room.roomUnitId) ?? room.roomUnitId}
                    </p>
                    <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      {nightsBetween(room.checkInDate, room.checkOutDate)} nights
                    </span>
                  </div>
                ))}
          </div>
        </div>

        {booking.specialRequests && (
          <div className="rounded-xl p-4" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "#fbbf24" }}>
              Special Requests
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
              {booking.specialRequests}
            </p>
          </div>
        )}

        {wasChanged && (
          <div className="rounded-xl p-4" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
            <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>
              Date change history
            </p>
            <div className="space-y-3">
              {booking.dateChanges!.map((change, index) => (
                <div key={index} className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  <p style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {formatDate(change.from.checkIn)} – {formatDate(change.from.checkOut)} → {formatDate(change.to.checkIn)} – {formatDate(change.to.checkOut)}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {change.changedBy || "Unknown"}{change.changedByRole ? ` (${change.changedByRole.toLowerCase()})` : ""}
                    {change.changedAt ? ` • ${formatDate(change.changedAt)}` : ""}
                  </p>
                  {change.note && <p className="mt-1">{change.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReservationsContent() {
  const { selectedProperty } = useStayHotel();
  const [inventory, setInventory] = useState<StayInventoryResponse | null>(null);
  const [bookings, setBookings] = useState<StayBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<StayBookingResponse | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadData() {
    if (!selectedProperty) return;
    setLoading(true);
    setError(null);
    try {
      const [inventoryResponse, bookingsResponse] = await Promise.all([
        getStayInventory(selectedProperty.id),
        listStayBookings(selectedProperty.id),
      ]);
      setInventory(inventoryResponse);
      setBookings(bookingsResponse.bookings || []);
    } catch (err: any) {
      setError(err?.message || "Unable to load stay bookings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [selectedProperty?.id]);

  function applyUpdated(updated: StayBookingResponse) {
    setBookings((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedBooking((prev) => (prev && prev.id === updated.id ? updated : prev));
  }

  async function handleUpdateStatus(booking: StayBookingResponse, status: "confirmed" | "cancelled") {
    if (!selectedProperty) return;
    setUpdatingId(booking.id);
    setActionError(null);
    try {
      applyUpdated(await updateStayBookingStatus(selectedProperty.id, booking.id, status));
    } catch (err: any) {
      setActionError(err?.message || "Unable to update booking status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleChangeDates(booking: StayBookingResponse, checkIn: string, checkOut: string, note: string) {
    if (!selectedProperty) return false;
    setUpdatingId(booking.id);
    setActionError(null);
    try {
      applyUpdated(
        await updateStayBookingDates(selectedProperty.id, booking.id, {
          checkInDate: checkIn,
          checkOutDate: checkOut,
          note: note.trim() || undefined,
        }),
      );
      return true;
    } catch (err: any) {
      setActionError(err?.message || "Unable to change booking dates.");
      return false;
    } finally {
      setUpdatingId(null);
    }
  }

  const roomNumberLookup = useMemo(() => {
    const lookup = new Map<string, string>();
    for (const roomUnit of inventory?.roomUnits ?? []) {
      lookup.set(roomUnit.id, roomUnit.roomNumber);
    }
    return lookup;
  }, [inventory]);

  const filteredBookings = useMemo(() => {
    const query = search.toLowerCase();
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.bookingId.toLowerCase().includes(query) ||
        (booking.reference ?? "").toLowerCase().includes(query) ||
        booking.guestName.toLowerCase().includes(query) ||
        booking.rooms.some((room) => (roomNumberLookup.get(room.roomUnitId) ?? "").toLowerCase().includes(query));
      const matchesStatus = statusFilter === "all" || booking.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, roomNumberLookup, search, statusFilter]);

  const statusOptions = useMemo(() => {
    return Array.from(new Set(bookings.map((booking) => booking.status.toLowerCase())));
  }, [bookings]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error && bookings.length === 0) {
    return <EmptyState icon={RefreshCw} title="Unable to load reservations" description={error} />;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={16} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>
              Reservations
            </span>
          </div>
          <h1 className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {selectedProperty?.name}
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Review each booking request: accept it, change the dates if rooms are short, or reject it.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StayHotelPropertySwitcher />
          <button onClick={() => void loadData()} className="px-3 py-2 rounded-lg text-[12px] flex items-center gap-2" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}>
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-[13px]" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reference, guest, or room"
            className="w-full pl-9 pr-3 py-2 rounded-lg text-[13px]"
            style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
          />
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}>
          <option value="all">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No bookings found"
          description={bookings.length === 0 ? "This property does not have stay bookings yet." : "No bookings match the current filters."}
        />
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                  {["Booking", "Guest", "Stay", "Rooms", "Amount", "Status"].map((label) => (
                    <th key={label} className="px-4 py-3 text-left text-[11px]" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} onClick={() => { setActionError(null); setSelectedBooking(booking); }} className="cursor-pointer" style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td className="px-4 py-4">
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                        {booking.reference || booking.bookingId}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        Created {formatDate(booking.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {booking.guestName}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {booking.guestEmail || booking.guestPhone || "Contact not provided"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)}
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {nightsBetween(booking.checkInDate, booking.checkOutDate)} night(s)
                        {(booking.dateChanges?.length ?? 0) > 0 && <span style={{ color: "#fbbf24" }}> • dates changed</span>}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {booking.rooms.map((room) => (
                          <span key={room.id} className="px-2 py-1 rounded-lg text-[11px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                            {roomNumberLookup.get(room.roomUnitId) ?? room.roomUnitId}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {formatAmount(booking)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedBooking && (
        <ReservationDrawer
          booking={selectedBooking}
          roomNumberLookup={roomNumberLookup}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={(status) => void handleUpdateStatus(selectedBooking, status)}
          onChangeDates={(checkIn, checkOut, note) => handleChangeDates(selectedBooking, checkIn, checkOut, note)}
          updating={updatingId === selectedBooking.id}
          actionError={actionError}
        />
      )}
    </div>
  );
}

export function Reservations() {
  return (
    <StayHotelPropertyGate loadingFallback={<DashboardSkeleton />}>
      <ReservationsContent />
    </StayHotelPropertyGate>
  );
}

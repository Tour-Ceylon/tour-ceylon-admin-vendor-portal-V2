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
import { getStayInventory, listStayBookings, type StayBookingResponse, type StayInventoryResponse } from "../api/stayVendorApi";
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

function ReservationDrawer({
  booking,
  roomNumberLookup,
  onClose,
}: {
  booking: StayBookingResponse;
  roomNumberLookup: Map<string, string>;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed right-0 top-0 h-full w-[380px] z-50 overflow-y-auto"
      style={{ background: "var(--bg-panel)", borderLeft: "1px solid var(--border-light)", boxShadow: "-8px 0 32px rgba(0,0,0,0.35)" }}
    >
      <div className="px-5 py-4 flex items-start justify-between sticky top-0" style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border-light)" }}>
        <div>
          <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>
            Stay Booking
          </p>
          <p className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {booking.bookingId}
          </p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--input-background)" }}>
          <X size={14} style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>

      <div className="p-5 space-y-4">
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
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
          <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>
            Stay Details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Check-in</p>
              <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formatDate(booking.checkInDate)}</p>
            </div>
            <div>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Check-out</p>
              <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formatDate(booking.checkOutDate)}</p>
            </div>
            <div>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Nights</p>
              <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{nightsBetween(booking.checkInDate, booking.checkOutDate)}</p>
            </div>
            <div>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Status</p>
              <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{booking.status}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
          <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>
            Assigned Rooms
          </p>
          <div className="space-y-3">
            {booking.rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between">
                <div>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {roomNumberLookup.get(room.roomUnitId) ?? room.roomUnitId}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {room.guests} guest{room.guests === 1 ? "" : "s"} • rate {Number(room.nightlyRate || 0).toLocaleString()}
                  </p>
                </div>
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

        <div className="rounded-xl p-4" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Derived booking total
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {derivedBookingTotal(booking).toLocaleString()}
          </p>
          <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
            Computed locally from nightly room rates because the vendor stay booking response does not return a total amount.
          </p>
        </div>
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<StayBookingResponse | null>(null);

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
            Read-only stay bookings with room assignments resolved from inventory.
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
            placeholder="Search booking ID, guest, or room"
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
            <table className="w-full min-w-[920px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                  {["Booking", "Guest", "Stay", "Rooms", "Status", "Derived Total"].map((label) => (
                    <th key={label} className="px-4 py-3 text-left text-[11px]" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} onClick={() => setSelectedBooking(booking)} className="cursor-pointer" style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td className="px-4 py-4">
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                        {booking.bookingId}
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
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 rounded-full text-[11px]" style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {derivedBookingTotal(booking).toLocaleString()}
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

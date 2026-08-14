import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  Building2,
  CalendarArrowDown,
  CalendarArrowUp,
  CalendarCheck,
  RefreshCw,
  Users,
} from "lucide-react";
import { getStayInventory, listStayBookings, type StayBookingResponse, type StayInventoryResponse } from "../api/stayVendorApi";
import { EmptyState } from "../common/EmptyState";
import { CardSkeleton, DashboardSkeleton } from "../common/SkeletonLoader";
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

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nightsBetween(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 86400000));
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Building2;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--bg-panel)",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--accent-navy-subtle)", border: "1px solid var(--border-accent)" }}
        >
          <Icon size={18} style={{ color: "var(--accent-navy-light)" }} />
        </div>
      </div>
      <p className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
        {value}
      </p>
      <p className="text-[12px] mb-1" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
        {label}
      </p>
      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
        {hint}
      </p>
    </div>
  );
}

function HotelDashboardContent() {
  const { selectedProperty, refreshProperties } = useStayHotel();
  const [inventory, setInventory] = useState<StayInventoryResponse | null>(null);
  const [bookings, setBookings] = useState<StayBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProperty) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [inventoryResponse, bookingsResponse] = await Promise.all([
          getStayInventory(selectedProperty.id),
          listStayBookings(selectedProperty.id),
        ]);
        if (cancelled) return;
        setInventory(inventoryResponse);
        setBookings(bookingsResponse.bookings || []);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Unable to load hotel dashboard data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedProperty?.id]);

  const stats = useMemo(() => {
    const today = todayIso();
    const totalUnits = inventory?.roomUnits.length ?? 0;
    const activeRoomAssignments = bookings.flatMap((booking) =>
      booking.rooms.filter((room) => room.checkInDate <= today && room.checkOutDate > today),
    );
    const occupiedUnits = activeRoomAssignments.length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const arrivingToday = bookings.filter((booking) => booking.checkInDate === today).length;
    const departingToday = bookings.filter((booking) => booking.checkOutDate === today).length;
    const derivedRevenue = bookings.reduce((sum, booking) => {
      return (
        sum +
        booking.rooms.reduce((roomSum, room) => {
          const rate = Number(room.nightlyRate || 0);
          return roomSum + rate * nightsBetween(room.checkInDate, room.checkOutDate);
        }, 0)
      );
    }, 0);

    const topRoomType = [...(inventory?.roomTypes ?? [])]
      .sort((left, right) => (right.totalUnits ?? 0) - (left.totalUnits ?? 0))[0];

    return {
      totalUnits,
      occupiedUnits,
      occupancyRate,
      arrivingToday,
      departingToday,
      derivedRevenue,
      totalBookings: bookings.length,
      topRoomType: topRoomType?.name ?? "No room types yet",
    };
  }, [inventory, bookings]);

  const inventoryByRoomType = useMemo(() => {
    const map = new Map<string, { name: string; totalUnits: number }>();
    for (const roomType of inventory?.roomTypes ?? []) {
      map.set(roomType.id, {
        name: roomType.name,
        totalUnits: roomType.totalUnits ?? roomType.roomUnits?.length ?? 0,
      });
    }
    return map;
  }, [inventory]);

  const upcomingCheckIns = useMemo(
    () =>
      [...bookings]
        .sort((left, right) => left.checkInDate.localeCompare(right.checkInDate))
        .slice(0, 5),
    [bookings],
  );

  const upcomingCheckOuts = useMemo(
    () =>
      [...bookings]
        .sort((left, right) => left.checkOutDate.localeCompare(right.checkOutDate))
        .slice(0, 5),
    [bookings],
  );

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        icon={RefreshCw}
        title="Unable to load hotel dashboard"
        description={error}
        action={{ label: "Retry", onClick: () => void refreshProperties() }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>
              Hotel Operations
            </span>
          </div>
          <h1 className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {selectedProperty?.name}
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
            {[selectedProperty?.city, selectedProperty?.district].filter(Boolean).join(", ") || selectedProperty?.address || "Location not set"}
          </p>
        </div>
        <StayHotelPropertySwitcher />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Occupancy Tonight" value={`${stats.occupancyRate}%`} hint={`${stats.occupiedUnits} of ${stats.totalUnits} units occupied`} icon={BedDouble} />
        <StatCard label="Active Reservations" value={String(stats.totalBookings)} hint={`${stats.arrivingToday} arriving today`} icon={CalendarCheck} />
        <StatCard label="Derived Revenue" value={formatMoney(stats.derivedRevenue)} hint="Computed from nightly room rates in stay bookings" icon={Users} />
        <StatCard label="Largest Room Type" value={stats.topRoomType} hint={`${inventory?.roomTypes.length ?? 0} room types configured`} icon={Building2} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div
          className="xl:col-span-2 rounded-xl overflow-hidden"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="flex items-center gap-2">
              <CalendarArrowUp size={15} style={{ color: "var(--accent-navy)" }} />
              <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Upcoming Check-ins
              </span>
            </div>
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Next reservations on file
            </span>
          </div>
          {upcomingCheckIns.length === 0 ? (
            <div className="p-6 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              No stay bookings available yet for this property.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
              {upcomingCheckIns.map((booking) => (
                <div key={booking.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {booking.guestName}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {booking.rooms.length} room{booking.rooms.length === 1 ? "" : "s"} • {booking.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {formatDate(booking.checkInDate)}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {nightsBetween(booking.checkInDate, booking.checkOutDate)} nights
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <CalendarArrowDown size={15} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Upcoming Check-outs
            </span>
          </div>
          {upcomingCheckOuts.length === 0 ? (
            <div className="p-6 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              No departures scheduled yet.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
              {upcomingCheckOuts.map((booking) => (
                <div key={booking.id} className="px-5 py-3">
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {booking.guestName}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {formatDate(booking.checkOutDate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Room Type Inventory
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {(inventory?.roomTypes ?? []).length === 0 ? (
              <div className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                No room types configured yet.
              </div>
            ) : (
              (inventory?.roomTypes ?? []).map((roomType) => (
                <div key={roomType.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {roomType.name}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {roomType.currency} {roomType.basePrice ?? "—"} base rate
                    </p>
                  </div>
                  <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    {roomType.totalUnits ?? roomType.roomUnits?.length ?? 0} units
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Current Occupancy Snapshot
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {bookings.filter((booking) => booking.rooms.some((room) => room.checkInDate <= todayIso() && room.checkOutDate > todayIso())).length === 0 ? (
              <div className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                No occupied rooms right now.
              </div>
            ) : (
              bookings
                .filter((booking) => booking.rooms.some((room) => room.checkInDate <= todayIso() && room.checkOutDate > todayIso()))
                .slice(0, 5)
                .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {booking.guestName}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {booking.rooms
                          .map((room) => inventoryByRoomType.get(room.roomTypeId)?.name ?? "Room")
                          .join(", ")}
                      </p>
                    </div>
                    <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      Until {formatDate(booking.checkOutDate)}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HotelDashboard() {
  return (
    <StayHotelPropertyGate loadingFallback={<div className="p-6"><CardSkeleton /></div>}>
      <HotelDashboardContent />
    </StayHotelPropertyGate>
  );
}

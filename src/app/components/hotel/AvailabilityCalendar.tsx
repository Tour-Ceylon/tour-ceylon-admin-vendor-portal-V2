import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BedDouble,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
  RefreshCw,
  Unlock,
  X,
} from "lucide-react";
import {
  createRoomBlock,
  getStayCalendar,
  getStayInventory,
  listStayBookings,
  listStayRoomBlocks,
  releaseRoomBlock,
  type StayBookingResponse,
  type StayCalendarEntry,
  type StayInventoryResponse,
  type StayRoomBlockResponse,
  type StayRoomUnit,
} from "../api/stayVendorApi";
import { EmptyState } from "../common/EmptyState";
import { DashboardSkeleton } from "../common/SkeletonLoader";
import { StayHotelPropertyGate, StayHotelPropertySwitcher, useStayHotel } from "./StayHotelContext";

type CellStatus = "available" | "low" | "sold-out" | "blocked";
type RoomUnitAvailabilityStatus = "available" | "blocked" | "booked";

interface RoomUnitStatusEntry {
  id: string;
  roomNumber: string;
  roomName?: string | null;
  status: RoomUnitAvailabilityStatus;
  detail: string;
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
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
  if (entry.totalUnits > 0 && entry.availableUnits / entry.totalUnits <= 0.2) return "low";
  return "available";
}

const STATUS_STYLES: Record<CellStatus, { bg: string; border: string; text: string }> = {
  available: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", text: "#4ade80" },
  low: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", text: "#fbbf24" },
  "sold-out": { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", text: "#f87171" },
  blocked: { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.25)", text: "#94a3b8" },
};

function BlockModal({
  roomUnits,
  getRoomUnitStatusForRange,
  initialDate,
  onClose,
  onSubmit,
  submitting,
}: {
  roomUnits: StayRoomUnit[];
  getRoomUnitStatusForRange: (roomUnit: StayRoomUnit, startDate: string, endDateInclusive: string) => RoomUnitStatusEntry;
  initialDate: string;
  onClose: () => void;
  onSubmit: (payload: { roomUnitId: string; startDate: string; endDate: string; reason: string; blockType: string }) => void;
  submitting: boolean;
}) {
  const [roomUnitId, setRoomUnitId] = useState("");
  const [startDate, setStartDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(initialDate);
  const [reason, setReason] = useState("");
  const [blockType, setBlockType] = useState("manual");

  const roomUnitOptions = useMemo(
    () =>
      roomUnits
        .map((roomUnit) => getRoomUnitStatusForRange(roomUnit, startDate, endDate))
        .filter((entry) => entry.status === "available"),
    [endDate, getRoomUnitStatusForRange, roomUnits, startDate],
  );

  useEffect(() => {
    if (roomUnitOptions.length === 0) {
      setRoomUnitId("");
      return;
    }
    if (!roomUnitOptions.some((entry) => entry.id === roomUnitId)) {
      setRoomUnitId(roomUnitOptions[0]?.id ?? "");
    }
  }, [roomUnitId, roomUnitOptions]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.65)" }}>
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-lg)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              Create Room Block
            </h3>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              Blocks apply to one room unit across a date range.
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--input-background)" }}>
            <X size={14} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
              Room unit
            </label>
            <select
              value={roomUnitId}
              onChange={(event) => setRoomUnitId(event.target.value)}
              className="w-full px-3 py-2 rounded-lg text-[13px]"
              style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              {roomUnitOptions.map((roomUnit) => (
                <option key={roomUnit.id} value={roomUnit.id}>
                  {roomUnit.roomNumber}
                  {roomUnit.roomName ? ` • ${roomUnit.roomName}` : ""}
                </option>
              ))}
            </select>
            {roomUnitOptions.length === 0 && (
              <p className="text-[11px] mt-2" style={{ color: "#f87171" }}>
                No room units are available for the selected date range.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  if (event.target.value > endDate) setEndDate(event.target.value);
                }}
                className="w-full px-3 py-2 rounded-lg text-[13px]"
                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                End date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[13px]"
                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
              Block type
            </label>
            <select
              value={blockType}
              onChange={(event) => setBlockType(event.target.value)}
              className="w-full px-3 py-2 rounded-lg text-[13px]"
              style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              <option value="manual">Manual</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-[13px]"
              style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              placeholder="Optional note for maintenance, owner hold, or manual closure"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px]"
            style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            disabled={submitting || !roomUnitId || !startDate || !endDate || roomUnitOptions.length === 0}
            onClick={() => onSubmit({ roomUnitId, startDate, endDate, reason, blockType })}
            className="px-4 py-2 rounded-lg text-[13px] disabled:opacity-50"
            style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600 }}
          >
            {submitting ? "Blocking..." : "Create Block"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AvailabilityCalendarContent() {
  const { selectedProperty } = useStayHotel();
  const [inventory, setInventory] = useState<StayInventoryResponse | null>(null);
  const [roomTypeId, setRoomTypeId] = useState<string>("");
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [calendarEntries, setCalendarEntries] = useState<StayCalendarEntry[]>([]);
  const [bookings, setBookings] = useState<StayBookingResponse[]>([]);
  const [roomBlocks, setRoomBlocks] = useState<StayRoomBlockResponse[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [submittingBlock, setSubmittingBlock] = useState(false);

  useEffect(() => {
    if (!selectedProperty) return;
    let cancelled = false;

    async function loadInventory() {
      setLoadingInventory(true);
      setError(null);
      try {
        const [response, bookingsResponse] = await Promise.all([
          getStayInventory(selectedProperty.id),
          listStayBookings(selectedProperty.id),
        ]);
        if (cancelled) return;
        setInventory(response);
        setBookings(bookingsResponse.bookings || []);
        const defaultRoomType = response.roomTypes[0]?.id ?? "";
        setRoomTypeId((current) => {
          if (current && response.roomTypes.some((roomType) => roomType.id === current)) return current;
          return defaultRoomType;
        });
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Unable to load stay inventory.");
      } finally {
        if (!cancelled) setLoadingInventory(false);
      }
    }

    void loadInventory();
    return () => {
      cancelled = true;
    };
  }, [selectedProperty?.id]);

  useEffect(() => {
    if (!selectedProperty || !roomTypeId) {
      setRoomBlocks([]);
      return;
    }

    let cancelled = false;
    async function loadRoomBlocks() {
      try {
        const response = await listStayRoomBlocks(selectedProperty.id, { roomTypeId });
        if (cancelled) return;
        setRoomBlocks(response.blocks || []);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Unable to load room blocks.");
      }
    }

    void loadRoomBlocks();
    return () => {
      cancelled = true;
    };
  }, [selectedProperty?.id, roomTypeId, monthDate]);

  useEffect(() => {
    if (!selectedProperty || !roomTypeId) {
      setCalendarEntries([]);
      setLoadingCalendar(false);
      return;
    }

    let cancelled = false;
    async function loadCalendar() {
      setLoadingCalendar(true);
      setError(null);
      try {
        const response = await getStayCalendar(
          selectedProperty.id,
          formatIsoDate(startOfMonth(monthDate)),
          formatIsoDate(endOfMonth(monthDate)),
          roomTypeId,
        );
        if (cancelled) return;
        setCalendarEntries(response.entries || []);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Unable to load room-type availability.");
      } finally {
        if (!cancelled) setLoadingCalendar(false);
      }
    }

    void loadCalendar();
    return () => {
      cancelled = true;
    };
  }, [selectedProperty?.id, roomTypeId, monthDate]);

  const roomType = useMemo(
    () => inventory?.roomTypes.find((entry) => entry.id === roomTypeId) ?? null,
    [inventory, roomTypeId],
  );

  const roomUnitsForType = useMemo(
    () => inventory?.roomUnits.filter((roomUnit) => roomType?.roomUnits?.some((entry) => entry.id === roomUnit.id)) ?? [],
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

  const activeRoomBlocks = useMemo(
    () => roomBlocks.filter((block) => block.status.toLowerCase() === "active"),
    [roomBlocks],
  );

  const overlappingSelectedBlocks = useMemo(() => {
    if (!selectedDate) return [];
    return activeRoomBlocks.filter((block) => block.startDate <= selectedDate && block.endDate > selectedDate);
  }, [activeRoomBlocks, selectedDate]);

  const bookingRoomOverlaps = useMemo(() => {
    const overlaps = new Map<string, StayBookingResponse["rooms"][number]>();
    if (!selectedDate) return overlaps;
    const selectedDateExclusive = addDays(selectedDate, 1);
    for (const booking of bookings) {
      for (const room of booking.rooms) {
        if (room.roomTypeId !== roomTypeId) continue;
        if (datesOverlap(room.checkInDate, room.checkOutDate, selectedDate, selectedDateExclusive)) {
          overlaps.set(room.roomUnitId, room);
        }
      }
    }
    return overlaps;
  }, [bookings, roomTypeId, selectedDate]);

  const getRoomUnitStatusForRange = useMemo(
    () => (roomUnit: StayRoomUnit, startDate: string, endDateInclusive: string): RoomUnitStatusEntry => {
      const requestedEndExclusive = addDays(endDateInclusive, 1);
      const normalizedStatus = String(roomUnit.status || "").toLowerCase();
      const blockedByBaseStatus = normalizedStatus === "blocked" || normalizedStatus === "maintenance" || normalizedStatus === "inactive";
      const matchingBlock = activeRoomBlocks.find((block) =>
        block.roomUnitId === roomUnit.id &&
        datesOverlap(block.startDate, block.endDate, startDate, requestedEndExclusive),
      );
      if (blockedByBaseStatus || matchingBlock) {
        return {
          id: roomUnit.id,
          roomNumber: roomUnit.roomNumber,
          roomName: roomUnit.roomName,
          status: "blocked",
          detail: matchingBlock ? "Blocked in selected range" : "Room unit marked blocked",
        };
      }

      const matchingBooking = bookings.find((booking) =>
        booking.rooms.some((room) =>
          room.roomUnitId === roomUnit.id &&
          room.roomTypeId === roomTypeId &&
          datesOverlap(room.checkInDate, room.checkOutDate, startDate, requestedEndExclusive),
        ),
      );
      if (matchingBooking) {
        return {
          id: roomUnit.id,
          roomNumber: roomUnit.roomNumber,
          roomName: roomUnit.roomName,
          status: "booked",
          detail: "Booked in selected range",
        };
      }

      return {
        id: roomUnit.id,
        roomNumber: roomUnit.roomNumber,
        roomName: roomUnit.roomName,
        status: "available",
        detail: "Available for selected range",
      };
    },
    [activeRoomBlocks, bookings, roomTypeId],
  );

  const selectedDayRoomUnitStatuses = useMemo(() => {
    if (!selectedDate) return [];
    return roomUnitsForType
      .map((roomUnit) => getRoomUnitStatusForRange(roomUnit, selectedDate, selectedDate))
      .sort((left, right) => left.roomNumber.localeCompare(right.roomNumber));
  }, [getRoomUnitStatusForRange, roomUnitsForType, selectedDate]);

  const ROOM_STATUS_STYLES: Record<RoomUnitAvailabilityStatus, { bg: string; border: string; text: string }> = {
    available: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", text: "#4ade80" },
    blocked: { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.25)", text: "#94a3b8" },
    booked: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", text: "#f87171" },
  };

  function applyBlockDelta(
    entries: StayCalendarEntry[],
    startDate: string,
    endDate: string,
    blockedUnitDelta: number,
  ) {
    const affectedDates = new Set(enumerateDates(startDate, endDate));
    return entries.map((entry) => {
      if (!affectedDates.has(entry.date)) return entry;
      const nextBlockedUnits = Math.max(0, entry.blockedUnits + blockedUnitDelta);
      return {
        ...entry,
        blockedUnits: nextBlockedUnits,
        availableUnits: Math.max(0, entry.totalUnits - entry.bookedUnits - nextBlockedUnits),
      };
    });
  }

  async function reloadCurrentCalendar() {
    if (!selectedProperty || !roomTypeId) return;
    setLoadingCalendar(true);
    try {
      const refreshed = await getStayCalendar(
        selectedProperty.id,
        formatIsoDate(startOfMonth(monthDate)),
        formatIsoDate(endOfMonth(monthDate)),
        roomTypeId,
      );
      setCalendarEntries(refreshed.entries || []);
    } catch (err: any) {
      setError(err?.message || "Unable to reload room-type availability.");
    } finally {
      setLoadingCalendar(false);
    }
  }

  async function reloadRoomBlocks() {
    if (!selectedProperty || !roomTypeId) return;
    try {
      const refreshed = await listStayRoomBlocks(selectedProperty.id, { roomTypeId });
      setRoomBlocks(refreshed.blocks || []);
    } catch (err: any) {
      setError(err?.message || "Unable to reload room blocks.");
    }
  }

  async function handleBlockSubmit(payload: { roomUnitId: string; startDate: string; endDate: string; reason: string; blockType: string }) {
    if (!selectedProperty || !roomTypeId) return;
    setSubmittingBlock(true);
    try {
      await createRoomBlock(selectedProperty.id, payload);
      setCalendarEntries((current) =>
        applyBlockDelta(current, payload.startDate, exclusiveEndDateToInclusive(payload.endDate), 1),
      );
      await reloadRoomBlocks();
      setShowBlockModal(false);
    } catch (err: any) {
      setError(err?.message || "Unable to create room block.");
      await reloadCurrentCalendar();
    } finally {
      setSubmittingBlock(false);
    }
  }

  async function handleReleaseBlock(blockId: string) {
    if (!selectedProperty || !roomTypeId) return;
    const existingBlock = roomBlocks.find((block) => block.id === blockId);
    try {
      await releaseRoomBlock(selectedProperty.id, blockId);
      if (existingBlock) {
        const inclusiveEndDate = exclusiveEndDateToInclusive(existingBlock.endDate);
        setCalendarEntries((current) => applyBlockDelta(current, existingBlock.startDate, inclusiveEndDate, -1));
      }
      await reloadRoomBlocks();
    } catch (err: any) {
      setError(err?.message || "Unable to release this room block.");
      await reloadCurrentCalendar();
    }
  }

  if (loadingInventory) {
    return <DashboardSkeleton />;
  }

  if (error && !inventory) {
    return (
      <EmptyState
        icon={RefreshCw}
        title="Unable to load availability"
        description={error}
      />
    );
  }

  if ((inventory?.roomTypes.length ?? 0) === 0) {
    return (
      <EmptyState
        icon={BedDouble}
        title="No room types configured"
        description="Add room types and room units first. The stay calendar needs a room-type inventory before it can display nightly availability."
      />
    );
  }

  const monthLabel = monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={16} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>
              Availability Calendar
            </span>
          </div>
          <h1 className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {selectedProperty?.name}
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Room-type availability is loaded from the new stay inventory service.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <StayHotelPropertySwitcher />
          <select
            value={roomTypeId}
            onChange={(event) => setRoomTypeId(event.target.value)}
            className="px-3 py-2 rounded-lg text-[12px]"
            style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
          >
            {(inventory?.roomTypes ?? []).map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowBlockModal(true)}
            className="px-4 py-2 rounded-lg text-[12px] flex items-center gap-2"
            style={{ background: "var(--active-overlay)", border: "1px solid var(--border-accent)", color: "var(--accent-navy-light)", fontWeight: 600 }}
          >
            <Plus size={13} />
            Block Room
          </button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-[13px]"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div>
              <h2 className="text-[15px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {roomType?.name}
              </h2>
              <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                {monthLabel}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
              >
                <ChevronLeft size={14} style={{ color: "var(--text-secondary)" }} />
              </button>
              <button
                onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
              >
                <ChevronRight size={14} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-7 gap-2 mb-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-[11px]" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                  {day}
                </div>
              ))}
            </div>

            {loadingCalendar ? (
              <DashboardSkeleton />
            ) : calendarEntries.length === 0 ? (
              <div className="py-12 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                No availability data returned for this month.
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {getMonthDays(monthDate).map((dateValue, index) => {
                  if (!dateValue) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const iso = formatIsoDate(dateValue);
                  const entry = entryByDate.get(iso);
                  const status = entry ? statusFromEntry(entry) : "available";
                  const statusStyle = STATUS_STYLES[status];
                  const isSelected = selectedDate === iso;

                  return (
                    <button
                      key={iso}
                      onClick={() => setSelectedDate(iso)}
                      className="aspect-square rounded-xl p-2 text-left flex flex-col justify-between"
                      style={{
                        background: statusStyle.bg,
                        border: `1px solid ${isSelected ? "var(--accent-navy-light)" : statusStyle.border}`,
                        color: statusStyle.text,
                      }}
                    >
                      <span className="text-[12px]" style={{ fontWeight: 700 }}>
                        {dateValue.getDate()}
                      </span>
                      <div>
                        <div className="text-[11px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                          {entry ? `${entry.availableUnits}/${entry.totalUnits}` : "—"}
                        </div>
                        <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          {status.replace("-", " ")}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-4 flex-wrap mt-5 pt-5" style={{ borderTop: "1px solid var(--border-light)" }}>
              {(Object.entries(STATUS_STYLES) as [CellStatus, { bg: string; border: string; text: string }][]).map(([status, style]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: style.bg, border: `1px solid ${style.border}` }} />
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {status.replace("-", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {selectedEntry ? "Selected Day" : "Calendar Notes"}
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {selectedEntry ? (
              <>
                <div>
                  <p className="text-[12px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    {formatDisplayDate(selectedEntry.date)}
                  </p>
                  <p className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                    {roomType?.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Available", value: selectedEntry.availableUnits },
                    { label: "Booked", value: selectedEntry.bookedUnits },
                    { label: "Blocked", value: selectedEntry.blockedUnits },
                    { label: "Total", value: selectedEntry.totalUnits },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg p-3" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {item.label}
                      </p>
                      <p className="text-[18px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg p-3" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)" }}>
                  <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    Unsupported quick edits like nightly price, min-stay, and day-level maintenance have been intentionally removed because the phase-3 stay vendor API does not expose those controls yet.
                  </p>
                </div>

                <button
                  onClick={() => setShowBlockModal(true)}
                  className="w-full px-4 py-2 rounded-lg text-[12px] flex items-center justify-center gap-2"
                  style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600 }}
                >
                  <Lock size={13} />
                  Block A Room For This Date
                </button>

                {overlappingSelectedBlocks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[12px]" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                      Local active blocks on this date
                    </p>
                    {overlappingSelectedBlocks.map((block) => (
                      <div key={block.id} className="rounded-lg p-3" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                              {roomUnitsForType.find((roomUnit) => roomUnit.id === block.roomUnitId)?.roomNumber ?? block.roomUnitId}
                            </p>
                            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                              {block.blockType} • {formatDisplayDate(block.startDate)} to {formatDisplayDate(block.endDate)}
                            </p>
                          </div>
                          <button
                            onClick={() => void handleReleaseBlock(block.id)}
                            className="px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1"
                            style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}
                          >
                            <Unlock size={11} />
                            Release
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[12px]" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                    Room unit status
                  </p>
                  {selectedDayRoomUnitStatuses.length === 0 ? (
                    <div className="rounded-lg p-3 text-[12px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-tertiary)" }}>
                      No room units found for this room type.
                    </div>
                  ) : (
                    selectedDayRoomUnitStatuses.map((roomUnit) => {
                      const style = ROOM_STATUS_STYLES[roomUnit.status];
                      const bookedRoom = bookingRoomOverlaps.get(roomUnit.id);
                      return (
                        <div key={roomUnit.id} className="rounded-lg p-3" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                                {roomUnit.roomNumber}
                                {roomUnit.roomName ? ` • ${roomUnit.roomName}` : ""}
                              </p>
                              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                                {roomUnit.detail}
                                {roomUnit.status === "booked" && bookedRoom ? ` • ${bookedRoom.guests} guest${bookedRoom.guests === 1 ? "" : "s"}` : ""}
                              </p>
                            </div>
                            <span
                              className="px-2 py-1 rounded-full text-[10px]"
                              style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text, fontWeight: 700 }}
                            >
                              {roomUnit.status === "booked" ? "Booked" : roomUnit.status === "blocked" ? "Blocked" : "Available"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  Select a day to inspect nightly totals from the backend calendar cache.
                </p>
                <div className="rounded-lg p-3" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
                  <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    This calendar is scoped to one room type at a time.
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                    The backend calendar response does not return `roomTypeId` per entry, so aggregated multi-room-type editing is intentionally out of scope for this pass.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Local Active Blocks
          </h2>
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Active blocks from the backend
          </span>
        </div>
        <div className="p-5">
          {activeRoomBlocks.length === 0 ? (
            <div className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              No active blocks found for {roomType?.name}.
            </div>
          ) : (
            <div className="space-y-3">
              {activeRoomBlocks.map((block) => (
                <div key={block.id} className="rounded-lg p-4 flex items-center justify-between gap-3" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
                  <div>
                    <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {roomUnitsForType.find((roomUnit) => roomUnit.id === block.roomUnitId)?.roomNumber ?? block.roomUnitId}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {formatDisplayDate(block.startDate)} to {formatDisplayDate(block.endDate)} • {block.blockType}
                      {block.reason ? ` • ${block.reason}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => void handleReleaseBlock(block.id)}
                    className="px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1"
                    style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}
                  >
                    <Unlock size={11} />
                    Release
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showBlockModal && roomUnitsForType.length > 0 && (
        <BlockModal
          roomUnits={roomUnitsForType}
          getRoomUnitStatusForRange={getRoomUnitStatusForRange}
          initialDate={selectedDate ?? formatIsoDate(startOfMonth(monthDate))}
          onClose={() => setShowBlockModal(false)}
          onSubmit={(payload) => void handleBlockSubmit(payload)}
          submitting={submittingBlock}
        />
      )}
    </div>
  );
}

export function AvailabilityCalendar() {
  return (
    <StayHotelPropertyGate loadingFallback={<DashboardSkeleton />}>
      <AvailabilityCalendarContent />
    </StayHotelPropertyGate>
  );
}

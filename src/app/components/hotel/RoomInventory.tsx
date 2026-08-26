import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BedDouble,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  createStayRoomType,
  createStayRoomUnit,
  deleteStayRoomType,
  deleteStayRoomUnit,
  getStayInventory,
  listStayBookings,
  updateStayRoomType,
  updateStayRoomUnit,
  type StayBookingResponse,
  type StayInventoryResponse,
  type StayRoomType,
  type StayRoomUnit,
} from "../api/stayVendorApi";
import { EmptyState } from "../common/EmptyState";
import { DashboardSkeleton } from "../common/SkeletonLoader";
import { StayHotelPropertyGate, StayHotelPropertySwitcher, useStayHotel } from "./StayHotelContext";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
    >
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
        <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function RoomTypeModal({
  roomType,
  existingRoomTypes = [],
  onClose,
  onSubmit,
  submitting,
}: {
  roomType?: StayRoomType | null;
  existingRoomTypes?: StayRoomType[];
  onClose: () => void;
  onSubmit: (payload: { name: string; description: string; size: string; sizeUnit: string; maxGuests?: number; basePrice?: number; currency: string }) => void;
  submitting: boolean;
}) {
  const [name, setName] = useState(roomType?.name ?? "");
  const [description, setDescription] = useState(roomType?.description ?? "");
  const [size, setSize] = useState(roomType?.size ?? "");
  const [sizeUnit, setSizeUnit] = useState(roomType?.sizeUnit ?? "sqm");
  const [maxGuests, setMaxGuests] = useState(roomType?.maxGuests ?? "");
  const [basePrice, setBasePrice] = useState(String(roomType?.basePrice ?? ""));
  const [currency, setCurrency] = useState(roomType?.currency ?? "LKR");

  const isDuplicate = existingRoomTypes.some(
    (rt) => rt.id !== roomType?.id && rt.name.trim().toLowerCase() === name.trim().toLowerCase() && name.trim().length > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.65)" }}>
      <div className="w-full max-w-xl rounded-2xl p-6" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {roomType ? "Edit Room Type" : "Add Room Type"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--input-background)" }}>
            <X size={14} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>Name</label>
            <input value={name} onChange={(event) => setName(event.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
            {isDuplicate && (
              <div className="p-2.5 rounded-lg text-[12px] font-semibold mt-2 flex items-start gap-1.5" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
                <span className="text-xs shrink-0">⚠️</span>
                <span>
                  <strong>Room type already exists!</strong> If you are adding more rooms of this type, increase room count in inventory. If creating a sub-variant, use a unique name (e.g., <em>{name} - Type 2</em>).
                </span>
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>Description</label>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>Size</label>
            <input value={size} onChange={(event) => setSize(event.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>Size unit</label>
            <input value={sizeUnit} onChange={(event) => setSizeUnit(event.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>Max guests</label>
            <input value={maxGuests} onChange={(event) => setMaxGuests(event.target.value)} type="number" min="1" className="w-full px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>Base price</label>
            <input value={basePrice} onChange={(event) => setBasePrice(event.target.value)} type="number" min="0" className="w-full px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>Currency</label>
            <input value={currency} onChange={(event) => setCurrency(event.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
            Cancel
          </button>
          <button
            disabled={submitting || !name.trim()}
            onClick={() =>
              onSubmit({
                name: name.trim(),
                description: description.trim(),
                size: size.trim(),
                sizeUnit: sizeUnit.trim(),
                maxGuests: maxGuests ? Number(maxGuests) : undefined,
                basePrice: basePrice ? Number(basePrice) : undefined,
                currency: currency.trim() || "LKR",
              })
            }
            className="px-4 py-2 rounded-lg text-[13px] disabled:opacity-50"
            style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600 }}
          >
            {submitting ? "Saving..." : roomType ? "Save Changes" : "Create Room Type"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RoomUnitModal({
  roomTypes,
  roomUnit,
  onClose,
  onSubmit,
  submitting,
}: {
  roomTypes: StayRoomType[];
  roomUnit?: StayRoomUnit | null;
  onClose: () => void;
  onSubmit: (payload: { roomTypeId: string; roomNumber: string; floor: string; roomName: string; status: string }) => void;
  submitting: boolean;
}) {
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id ?? "");
  const [roomNumber, setRoomNumber] = useState(roomUnit?.roomNumber ?? "");
  const [floor, setFloor] = useState(roomUnit?.floor ?? "");
  const [roomName, setRoomName] = useState(roomUnit?.roomName ?? "");
  const [status, setStatus] = useState(roomUnit?.status ?? "available");

  useEffect(() => {
    if (roomUnit) {
      const matchedRoomType = roomTypes.find((entry) => entry.roomUnits?.some((item) => item.id === roomUnit.id));
      setRoomTypeId(matchedRoomType?.id ?? roomTypes[0]?.id ?? "");
    }
  }, [roomUnit, roomTypes]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.65)" }}>
      <div className="w-full max-w-lg rounded-2xl p-6" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {roomUnit ? "Edit Room Unit" : "Add Room Unit"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--input-background)" }}>
            <X size={14} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>Room type</label>
            <select value={roomTypeId} onChange={(event) => setRoomTypeId(event.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}>
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>Room number</label>
              <input value={roomNumber} onChange={(event) => setRoomNumber(event.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>Floor</label>
              <input value={floor} onChange={(event) => setFloor(event.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
            </div>
          </div>
          <div>
            <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>Room name</label>
            <input value={roomName} onChange={(event) => setRoomName(event.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}>
              <option value="available">available</option>
              <option value="maintenance">maintenance</option>
              <option value="blocked">blocked</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
            Cancel
          </button>
          <button
            disabled={submitting || !roomTypeId || !roomNumber.trim()}
            onClick={() => onSubmit({ roomTypeId, roomNumber: roomNumber.trim(), floor: floor.trim(), roomName: roomName.trim(), status })}
            className="px-4 py-2 rounded-lg text-[13px] disabled:opacity-50"
            style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600 }}
          >
            {submitting ? "Saving..." : roomUnit ? "Save Changes" : "Create Room Unit"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RoomInventoryContent() {
  const { selectedProperty } = useStayHotel();
  const [inventory, setInventory] = useState<StayInventoryResponse | null>(null);
  const [bookings, setBookings] = useState<StayBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<StayRoomType | null>(null);
  const [showRoomUnitModal, setShowRoomUnitModal] = useState(false);
  const [editingRoomUnit, setEditingRoomUnit] = useState<StayRoomUnit | null>(null);
  const [saving, setSaving] = useState(false);

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
      setError(err?.message || "Unable to load room inventory.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [selectedProperty?.id]);

  const occupiedUnitIds = useMemo(() => {
    const today = todayIso();
    const ids = new Set<string>();
    for (const booking of bookings) {
      for (const room of booking.rooms) {
        if (room.checkInDate <= today && room.checkOutDate > today) {
          ids.add(room.roomUnitId);
        }
      }
    }
    return ids;
  }, [bookings]);

  const roomTypeByUnitId = useMemo(() => {
    const map = new Map<string, StayRoomType>();
    for (const roomType of inventory?.roomTypes ?? []) {
      for (const roomUnit of roomType.roomUnits ?? []) {
        map.set(roomUnit.id, roomType);
      }
    }
    return map;
  }, [inventory]);

  const filteredUnits = useMemo(() => {
    const query = search.toLowerCase();
    return (inventory?.roomUnits ?? []).filter((roomUnit) => {
      const roomType = roomTypeByUnitId.get(roomUnit.id);
      const matchesSearch =
        roomUnit.roomNumber.toLowerCase().includes(query) ||
        String(roomUnit.roomName ?? "").toLowerCase().includes(query) ||
        String(roomType?.name ?? "").toLowerCase().includes(query);
      const matchesType = roomTypeFilter === "all" || roomType?.id === roomTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [inventory, roomTypeByUnitId, roomTypeFilter, search]);

  async function handleRoomTypeSubmit(payload: { name: string; description: string; size: string; sizeUnit: string; maxGuests?: number; basePrice?: number; currency: string }) {
    if (!selectedProperty) return;
    setSaving(true);
    try {
      if (editingRoomType) {
        await updateStayRoomType(selectedProperty.id, editingRoomType.id, payload);
      } else {
        await createStayRoomType(selectedProperty.id, payload);
      }
      setShowRoomTypeModal(false);
      setEditingRoomType(null);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Unable to save the room type.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRoomUnitSubmit(payload: { roomTypeId: string; roomNumber: string; floor: string; roomName: string; status: string }) {
    if (!selectedProperty) return;
    setSaving(true);
    try {
      if (editingRoomUnit) {
        await updateStayRoomUnit(selectedProperty.id, editingRoomUnit.id, payload);
      } else {
        await createStayRoomUnit(selectedProperty.id, payload);
      }
      setShowRoomUnitModal(false);
      setEditingRoomUnit(null);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Unable to save the room unit.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRoomType(roomType: StayRoomType) {
    if (!selectedProperty) return;
    if (!window.confirm(`Delete room type "${roomType.name}"?`)) return;
    try {
      await deleteStayRoomType(selectedProperty.id, roomType.id);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Unable to delete this room type.");
    }
  }

  async function handleDeleteRoomUnit(roomUnit: StayRoomUnit) {
    if (!selectedProperty) return;
    if (!window.confirm(`Delete room unit "${roomUnit.roomNumber}"?`)) return;
    try {
      await deleteStayRoomUnit(selectedProperty.id, roomUnit.id);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Unable to delete this room unit.");
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error && !inventory) {
    return <EmptyState icon={RefreshCw} title="Unable to load room inventory" description={error} />;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BedDouble size={16} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>
              Room Inventory
            </span>
          </div>
          <h1 className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {selectedProperty?.name}
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Room types and physical room units are loaded from the stay inventory backend.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StayHotelPropertySwitcher />
          <button onClick={() => void loadData()} className="px-3 py-2 rounded-lg text-[12px] flex items-center gap-2" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}>
            <RefreshCw size={13} />
            Refresh
          </button>
          <button onClick={() => { setEditingRoomType(null); setShowRoomTypeModal(true); }} className="px-3 py-2 rounded-lg text-[12px] flex items-center gap-2" style={{ background: "var(--active-overlay)", border: "1px solid var(--border-accent)", color: "var(--accent-navy-light)", fontWeight: 600 }}>
            <Plus size={13} />
            Add Room Type
          </button>
          <button onClick={() => { setEditingRoomUnit(null); setShowRoomUnitModal(true); }} className="px-3 py-2 rounded-lg text-[12px] flex items-center gap-2" style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600 }}>
            <Plus size={13} />
            Add Room Unit
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-[13px]" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard title="Room Types">
          <p className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {inventory?.roomTypes.length ?? 0}
          </p>
        </SectionCard>
        <SectionCard title="Physical Units">
          <p className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {inventory?.roomUnits.length ?? 0}
          </p>
        </SectionCard>
        <SectionCard title="Occupied Tonight">
          <p className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {occupiedUnitIds.size}
          </p>
        </SectionCard>
      </div>

      <SectionCard title="Room Type Catalog">
        {(inventory?.roomTypes.length ?? 0) === 0 ? (
          <div className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            No room types configured yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(inventory?.roomTypes ?? []).map((roomType) => (
              <div key={roomType.id} className="rounded-xl p-4" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                      {roomType.name}
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {roomType.currency} {roomType.basePrice ?? "—"} • {roomType.maxGuests ?? "—"} max guests
                    </p>
                    {roomType.description && (
                      <p className="text-[11px] mt-2" style={{ color: "var(--text-tertiary)" }}>
                        {roomType.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingRoomType(roomType); setShowRoomTypeModal(true); }} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
                      <Edit3 size={13} style={{ color: "var(--text-secondary)" }} />
                    </button>
                    <button onClick={() => void handleDeleteRoomType(roomType)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <Trash2 size={13} style={{ color: "#f87171" }} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {roomType.totalUnits ?? roomType.roomUnits?.length ?? 0} units
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {roomType.size ? `${roomType.size} ${roomType.sizeUnit ?? ""}`.trim() : "Size not set"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Room Units">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search room number, name, or room type"
              className="w-full pl-9 pr-3 py-2 rounded-lg text-[13px]"
              style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
          <select value={roomTypeFilter} onChange={(event) => setRoomTypeFilter(event.target.value)} className="px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}>
            <option value="all">All room types</option>
            {(inventory?.roomTypes ?? []).map((roomType) => (
              <option key={roomType.id} value={roomType.id}>
                {roomType.name}
              </option>
            ))}
          </select>
        </div>

        {filteredUnits.length === 0 ? (
          <div className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            No room units match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                  {["Room", "Type", "Floor", "Status", "Guests", "Actions"].map((label) => (
                    <th key={label} className="px-3 py-3 text-left text-[11px]" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((roomUnit) => {
                  const roomType = roomTypeByUnitId.get(roomUnit.id);
                  const derivedStatus = occupiedUnitIds.has(roomUnit.id) ? "occupied" : roomUnit.status;
                  return (
                    <tr key={roomUnit.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td className="px-3 py-3">
                        <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                          {roomUnit.roomNumber}
                        </p>
                        {roomUnit.roomName && (
                          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            {roomUnit.roomName}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {roomType?.name ?? "Unknown"}
                      </td>
                      <td className="px-3 py-3 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {roomUnit.floor || "—"}
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-1 rounded-full text-[11px]" style={{ background: derivedStatus === "occupied" ? "rgba(59,130,246,0.12)" : "var(--input-background)", color: derivedStatus === "occupied" ? "#60a5fa" : "var(--text-secondary)", border: "1px solid var(--border-light)" }}>
                          {derivedStatus}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {occupiedUnitIds.has(roomUnit.id) ? "Occupied tonight" : "Available for assignment"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditingRoomUnit(roomUnit); setShowRoomUnitModal(true); }} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
                            <Edit3 size={13} style={{ color: "var(--text-secondary)" }} />
                          </button>
                          <button onClick={() => void handleDeleteRoomUnit(roomUnit)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                            <Trash2 size={13} style={{ color: "#f87171" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {showRoomTypeModal && (
        <RoomTypeModal
          roomType={editingRoomType}
          existingRoomTypes={inventory?.roomTypes ?? []}
          onClose={() => { setShowRoomTypeModal(false); setEditingRoomType(null); }}
          onSubmit={(payload) => void handleRoomTypeSubmit(payload)}
          submitting={saving}
        />
      )}

      {showRoomUnitModal && (
        <RoomUnitModal
          roomTypes={inventory?.roomTypes ?? []}
          roomUnit={editingRoomUnit}
          onClose={() => { setShowRoomUnitModal(false); setEditingRoomUnit(null); }}
          onSubmit={(payload) => void handleRoomUnitSubmit(payload)}
          submitting={saving}
        />
      )}
    </div>
  );
}

export function RoomInventory() {
  return (
    <StayHotelPropertyGate loadingFallback={<DashboardSkeleton />}>
      <RoomInventoryContent />
    </StayHotelPropertyGate>
  );
}

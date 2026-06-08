import { useState, useEffect } from "react";
import { Calendar, Plus, Edit, Trash2, Check, X, Loader, AlertCircle } from "lucide-react";
import { apiFetch } from "../api/apiClient";
import {
  listAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  AvailabilityRecord,
} from "../api/availabilityService";

interface Stay {
  id: string;
  name: string;
  status: string;
  listing_id: string;
}

interface Variant {
  id: string;
  name: string;
}

export function VendorAvailabilityPage() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 4, 19));
  const [stays, setStays] = useState<Stay[]>([]);
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [availability, setAvailability] = useState<AvailabilityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStartDate, setBulkStartDate] = useState("");
  const [bulkEndDate, setBulkEndDate] = useState("");
  const [bulkCapacity, setBulkCapacity] = useState("10");
  const [bulkStatus, setBulkStatus] = useState("open");

  // Load vendor's stays
  useEffect(() => {
    const loadStays = async () => {
      try {
        setLoading(true);
        const response = await apiFetch<{ properties: Stay[] }>("/vendor/stays");
        const approvedStays = response.properties.filter((s: Stay) => s.status === "APPROVED");
        setStays(approvedStays);
        if (approvedStays.length > 0) {
          setSelectedStay(approvedStays[0]);
        }
      } catch (err) {
        setError("Failed to load your stay properties");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStays();
  }, []);

  // Load variants when stay changes
  useEffect(() => {
    if (!selectedStay?.listing_id) return;

    const loadVariants = async () => {
      try {
        setLoading(true);
        const response = await apiFetch<{ variants: Variant[] }>(`/listings/${selectedStay.listing_id}/variants`);
        setVariants(response.variants || []);
        if (response.variants?.length > 0) {
          setSelectedVariant(response.variants[0]);
        }
      } catch (err) {
        console.warn("Could not load variants:", err);
        setVariants([]);
      } finally {
        setLoading(false);
      }
    };
    loadVariants();
  }, [selectedStay?.listing_id]);

  // Load availability when stay or variant changes
  useEffect(() => {
    if (!selectedStay || !selectedVariant) return;

    const loadAvailability = async () => {
      try {
        setLoading(true);
        const response = await listAvailability(selectedStay.id, selectedVariant.id);
        setAvailability(response.availability || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load availability:", err);
        setAvailability([]);
      } finally {
        setLoading(false);
      }
    };
    loadAvailability();
  }, [selectedStay?.id, selectedVariant?.id]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  // Helper to get availability status for a day
  const getAvailabilityForDay = (day: number) => {
    if (!day) return null;
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return availability.find((a) => a.serviceDate.includes(dateStr));
  };

  // Get status color for day
  const getStatusColor = (avail: AvailabilityRecord | undefined) => {
    if (!avail) return null;
    if (avail.availableStatus === "blocked")
      return { bg: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" };
    if (avail.availableStatus === "limited")
      return { bg: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" };
    if (avail.availableStatus === "sold_out")
      return { bg: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" };
    return { bg: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" };
  };

  // Handle bulk availability creation
  const handleBulkCreate = async () => {
    if (!selectedStay || !selectedVariant || !bulkStartDate || !bulkEndDate) return;

    try {
      setLoading(true);
      await createAvailability(selectedStay.id, {
        variantId: selectedVariant.id,
        startDate: bulkStartDate,
        endDate: bulkEndDate,
        totalCapacity: parseInt(bulkCapacity) || 10,
        availableStatus: (bulkStatus as any) || "open",
      });
      
      // Reload availability
      const response = await listAvailability(selectedStay.id, selectedVariant.id);
      setAvailability(response.availability || []);
      setShowBulkModal(false);
      setBulkStartDate("");
      setBulkEndDate("");
      setBulkCapacity("10");
    } catch (err) {
      console.error("Failed to create availability:", err);
      setError("Failed to create availability");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete availability
  const handleDeleteAvailability = async (availId: string) => {
    if (!selectedStay) return;
    try {
      setLoading(true);
      await deleteAvailability(selectedStay.id, availId);
      setAvailability(availability.filter((a) => a.id !== availId));
    } catch (err) {
      console.error("Failed to delete availability:", err);
      setError("Failed to delete availability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Availability & Calendar
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Manage your stay property availability and booking calendar
          </p>
        </div>
        <button
          onClick={() => setShowBulkModal(true)}
          disabled={!selectedStay || loading}
          className="px-4 py-2 rounded-lg text-[12px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "var(--active-overlay)",
            color: "var(--accent-navy-light)",
            border: "1px solid var(--border-accent)",
            fontWeight: 500,
          }}
        >
          <Plus size={14} />
          {loading ? "Loading..." : "Add Availability"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="px-4 py-3 rounded-lg flex items-center gap-3"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          <AlertCircle size={16} style={{ color: "#f87171" }} />
          <span style={{ color: "#f87171", fontSize: "13px" }}>{error}</span>
        </div>
      )}

      {/* Stay selection */}
      {stays.length === 0 ? (
        <div
          className="px-6 py-8 rounded-xl text-center"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}
        >
          <AlertCircle size={32} style={{ color: "var(--text-tertiary)", margin: "0 auto 12px" }} />
          <h3 style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "4px" }}>No APPROVED Stays</h3>
          <p style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>
            You don't have any approved stay properties yet. Please create and get a stay approved first.
          </p>
        </div>
      ) : (
        <>
          {/* Stay and Variant selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Select Stay Property
              </label>
              <select
                value={selectedStay?.id || ""}
                onChange={(e) => {
                  const stay = stays.find((s) => s.id === e.target.value);
                  setSelectedStay(stay || null);
                  setVariants([]);
                  setSelectedVariant(null);
                  setAvailability([]);
                }}
                className="w-full px-3 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                {stays.map((stay) => (
                  <option key={stay.id} value={stay.id}>
                    {stay.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Select Variant
              </label>
              <select
                value={selectedVariant?.id || ""}
                onChange={(e) => {
                  const variant = variants.find((v) => v.id === e.target.value);
                  setSelectedVariant(variant || null);
                }}
                className="w-full px-3 py-2 rounded-lg text-[13px]"
                disabled={variants.length === 0}
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                  opacity: variants.length === 0 ? 0.6 : 1,
                }}
              >
                <option value="">
                  {variants.length === 0 ? "No variants available" : "Select variant..."}
                </option>
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Calendar */}
          <div className="grid grid-cols-3 gap-6">
            {/* Calendar View */}
            <div
              className="col-span-2 rounded-xl overflow-hidden"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--border-light)" }}
              >
                <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center">
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                        {day}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {getDaysInMonth(selectedDate).map((day, i) => {
                    if (!day) {
                      return <div key={`empty-${i}`} />;
                    }
                    const avail = getAvailabilityForDay(day);
                    const colors = getStatusColor(avail) || {
                      bg: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    };
                    return (
                      <button
                        key={day}
                        disabled={!selectedVariant || loading}
                        className="aspect-square rounded-lg flex flex-col items-center justify-center text-[13px] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
                        style={{
                          background: colors.bg,
                          border: colors.border,
                          color: colors.color,
                        }}
                        title={
                          avail
                            ? `${avail.availableCapacity}/${avail.totalCapacity} available (${avail.availableStatus})`
                            : "No data"
                        }
                      >
                        <span style={{ fontSize: "12px", fontWeight: 600 }}>{day}</span>
                        {avail && (
                          <span style={{ fontSize: "10px", opacity: 0.7 }}>
                            {avail.availableCapacity}/{avail.totalCapacity}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-6 mt-5 pt-5" style={{ borderTop: "1px solid var(--border-light)" }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}
                    />
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      Open
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}
                    />
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      Limited
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
                    />
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      Sold Out / Blocked
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Availability List */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
                <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  Recent Availability
                </h2>
              </div>
              <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
                {loading && <p style={{ color: "var(--text-tertiary)" }}>Loading...</p>}
                {!loading && availability.length === 0 && (
                  <p style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>
                    No availability set. Use "Add Availability" to create entries.
                  </p>
                )}
                {availability.slice(0, 10).map((avail) => (
                  <div
                    key={avail.id}
                    className="p-3 rounded-lg"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                          {new Date(avail.serviceDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          {avail.availableCapacity}/{avail.totalCapacity} available
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteAvailability(avail.id)}
                        disabled={loading}
                        className="p-1 rounded transition-all disabled:opacity-50"
                        style={{ color: "#f87171", background: "rgba(239,68,68,0.1)" }}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <span
                      className="inline-text text-[10px] px-2 py-0.5 rounded"
                      style={{
                        background:
                          avail.availableStatus === "open"
                            ? "rgba(34,197,94,0.1)"
                            : avail.availableStatus === "limited"
                              ? "rgba(245,158,11,0.1)"
                              : "rgba(239,68,68,0.1)",
                        color:
                          avail.availableStatus === "open"
                            ? "#22c55e"
                            : avail.availableStatus === "limited"
                              ? "#fbbf24"
                              : "#ef4444",
                        textTransform: "capitalize",
                      }}
                    >
                      {avail.availableStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bulk Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div
            className="w-[400px] rounded-2xl p-6"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                Add Availability
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                disabled={loading}
                className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-50"
                style={{ background: "var(--bg-card)", color: "var(--text-tertiary)" }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={bulkEndDate}
                  onChange={(e) => setBulkEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Total Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={bulkCapacity}
                  onChange={(e) => setBulkCapacity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Availability Status
                </label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                  disabled={loading}
                >
                  <option value="open">Open</option>
                  <option value="limited">Limited</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowBulkModal(false)}
                disabled={loading}
                className="flex-1 py-2 rounded-lg text-[13px] disabled:opacity-50"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkCreate}
                disabled={loading || !bulkStartDate || !bulkEndDate}
                className="flex-1 py-2 rounded-lg text-[13px] disabled:opacity-50"
                style={{
                  background: "var(--accent-navy)",
                  color: "white",
                  fontWeight: 600,
                  boxShadow: "0 0 12px var(--border-accent)",
                }}
              >
                {loading ? "Creating..." : "Create Availability"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

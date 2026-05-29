import { useState, useMemo } from "react";
import { Calendar, Plus, Edit, Trash2, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { vendorMockData } from "../../services/vendorMockData";

interface AvailabilityStatus {
  date: string;
  status: "available" | "limited" | "blocked";
  capacity?: number;
  reason?: string;
  priceOverride?: number;
  listingId?: string;
}

interface BlockedPeriod {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: "full_block" | "capacity_limit";
  listingId: string;
  capacityLimit?: number;
}

interface AvailabilityRules {
  defaultCapacity: number;
  minimumNotice: string;
  maximumAdvance: string;
  bookingCutoffTime?: string;
}

export function VendorAvailabilityPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026
  const [selectedListing, setSelectedListing] = useState<string>("all");
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showBlockDatesModal, setShowBlockDatesModal] = useState(false);
  const [showEditBlockModal, setShowEditBlockModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);
  const [editingBlock, setEditingBlock] = useState<BlockedPeriod | null>(null);
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Get vendor listings
  const listings = vendorMockData.getVendorListings();

  // Mock availability data
  const [availabilityData, setAvailabilityData] = useState<AvailabilityStatus[]>([
    { date: "2026-05-21", status: "blocked", reason: "Equipment Maintenance" },
    { date: "2026-05-22", status: "blocked", reason: "Equipment Maintenance" },
    { date: "2026-05-24", status: "limited", capacity: 10, reason: "High Demand Period" },
    { date: "2026-05-25", status: "limited", capacity: 10, reason: "High Demand Period" },
    { date: "2026-05-26", status: "limited", capacity: 10, reason: "High Demand Period" },
    { date: "2026-05-27", status: "blocked", reason: "National Holiday" },
    { date: "2026-05-28", status: "blocked", reason: "National Holiday" },
    { date: "2026-05-29", status: "blocked", reason: "National Holiday" },
  ]);

  // Mock blocked periods
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([
    {
      id: "bp1",
      startDate: "2026-05-21",
      endDate: "2026-05-22",
      reason: "Equipment Maintenance",
      type: "full_block",
      listingId: "all"
    },
    {
      id: "bp2",
      startDate: "2026-05-27",
      endDate: "2026-05-29",
      reason: "National Holiday",
      type: "full_block",
      listingId: "all"
    },
    {
      id: "bp3",
      startDate: "2026-05-24",
      endDate: "2026-05-26",
      reason: "High Demand Period",
      type: "capacity_limit",
      listingId: "all",
      capacityLimit: 10
    }
  ]);

  // Availability rules
  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRules>({
    defaultCapacity: 20,
    minimumNotice: "1 day",
    maximumAdvance: "3 months",
    bookingCutoffTime: "18:00"
  });

  // Form states
  const [availabilityForm, setAvailabilityForm] = useState({
    status: "available" as "available" | "limited" | "blocked",
    capacity: 20,
    reason: "",
    priceOverride: "",
    listingId: "all"
  });

  const [blockDatesForm, setBlockDatesForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    type: "full_block" as "full_block" | "capacity_limit",
    listingId: "all",
    capacityLimit: 10
  });

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

  const getDateStatus = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const availability = availabilityData.find(a => a.date === dateStr);
    return availability?.status || "available";
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDateForModal(clickedDate);
    
    // Pre-fill form with existing data if available
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const existing = availabilityData.find(a => a.date === dateStr);
    
    if (existing) {
      setAvailabilityForm({
        status: existing.status,
        capacity: existing.capacity || 20,
        reason: existing.reason || "",
        priceOverride: existing.priceOverride?.toString() || "",
        listingId: existing.listingId || "all"
      });
    } else {
      setAvailabilityForm({
        status: "available",
        capacity: 20,
        reason: "",
        priceOverride: "",
        listingId: "all"
      });
    }
    
    setShowAvailabilityModal(true);
  };

  const handleSaveAvailability = () => {
    if (!selectedDateForModal) return;

    const dateStr = `${selectedDateForModal.getFullYear()}-${String(selectedDateForModal.getMonth() + 1).padStart(2, '0')}-${String(selectedDateForModal.getDate()).padStart(2, '0')}`;
    
    const newAvailability: AvailabilityStatus = {
      date: dateStr,
      status: availabilityForm.status,
      capacity: availabilityForm.status === "limited" ? availabilityForm.capacity : undefined,
      reason: availabilityForm.reason || undefined,
      priceOverride: availabilityForm.priceOverride ? parseFloat(availabilityForm.priceOverride) : undefined,
      listingId: availabilityForm.listingId
    };

    setAvailabilityData(prev => {
      const filtered = prev.filter(a => a.date !== dateStr);
      if (availabilityForm.status !== "available" || availabilityForm.reason || availabilityForm.priceOverride) {
        return [...filtered, newAvailability];
      }
      return filtered;
    });

    setShowAvailabilityModal(false);
    showToast("Availability updated successfully", "success");
  };

  const handleBlockDates = () => {
    if (!blockDatesForm.startDate || !blockDatesForm.endDate || !blockDatesForm.reason) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    const newBlock: BlockedPeriod = {
      id: `bp${Date.now()}`,
      startDate: blockDatesForm.startDate,
      endDate: blockDatesForm.endDate,
      reason: blockDatesForm.reason,
      type: blockDatesForm.type,
      listingId: blockDatesForm.listingId,
      capacityLimit: blockDatesForm.type === "capacity_limit" ? blockDatesForm.capacityLimit : undefined
    };

    setBlockedPeriods(prev => [...prev, newBlock]);

    // Update availability data for the date range
    const start = new Date(blockDatesForm.startDate);
    const end = new Date(blockDatesForm.endDate);
    const newAvailabilityEntries: AvailabilityStatus[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      newAvailabilityEntries.push({
        date: dateStr,
        status: blockDatesForm.type === "full_block" ? "blocked" : "limited",
        capacity: blockDatesForm.type === "capacity_limit" ? blockDatesForm.capacityLimit : undefined,
        reason: blockDatesForm.reason,
        listingId: blockDatesForm.listingId
      });
    }

    setAvailabilityData(prev => {
      const filtered = prev.filter(a => {
        const aDate = new Date(a.date);
        return !(aDate >= start && aDate <= end);
      });
      return [...filtered, ...newAvailabilityEntries];
    });

    setBlockDatesForm({
      startDate: "",
      endDate: "",
      reason: "",
      type: "full_block",
      listingId: "all",
      capacityLimit: 10
    });
    setShowBlockDatesModal(false);
    showToast("Date range blocked successfully", "success");
  };

  const handleEditBlock = (block: BlockedPeriod) => {
    setEditingBlock(block);
    setBlockDatesForm({
      startDate: block.startDate,
      endDate: block.endDate,
      reason: block.reason,
      type: block.type,
      listingId: block.listingId,
      capacityLimit: block.capacityLimit || 10
    });
    setShowEditBlockModal(true);
  };

  const handleUpdateBlock = () => {
    if (!editingBlock) return;

    const updatedBlock: BlockedPeriod = {
      ...editingBlock,
      startDate: blockDatesForm.startDate,
      endDate: blockDatesForm.endDate,
      reason: blockDatesForm.reason,
      type: blockDatesForm.type,
      listingId: blockDatesForm.listingId,
      capacityLimit: blockDatesForm.type === "capacity_limit" ? blockDatesForm.capacityLimit : undefined
    };

    setBlockedPeriods(prev => prev.map(b => b.id === editingBlock.id ? updatedBlock : b));
    setShowEditBlockModal(false);
    setEditingBlock(null);
    showToast("Blocked period updated successfully", "success");
  };

  const handleDeleteBlock = (blockId: string) => {
    setDeletingBlockId(blockId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBlock = () => {
    if (!deletingBlockId) return;

    const blockToDelete = blockedPeriods.find(b => b.id === deletingBlockId);
    if (blockToDelete) {
      // Remove from blocked periods
      setBlockedPeriods(prev => prev.filter(b => b.id !== deletingBlockId));

      // Remove from availability data
      const start = new Date(blockToDelete.startDate);
      const end = new Date(blockToDelete.endDate);
      setAvailabilityData(prev => prev.filter(a => {
        const aDate = new Date(a.date);
        return !(aDate >= start && aDate <= end);
      }));

      showToast("Blocked period deleted successfully", "success");
    }

    setShowDeleteConfirm(false);
    setDeletingBlockId(null);
  };

  const handleSaveRules = () => {
    // In a real app, this would save to backend
    showToast("Availability rules saved successfully", "success");
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startMonth = monthNames[start.getMonth()].slice(0, 3);
    const endMonth = monthNames[end.getMonth()].slice(0, 3);
    
    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
  };

  // Filter blocked periods by selected listing
  const filteredBlockedPeriods = useMemo(() => {
    if (selectedListing === "all") return blockedPeriods;
    return blockedPeriods.filter(bp => bp.listingId === selectedListing || bp.listingId === "all");
  }, [blockedPeriods, selectedListing]);

  return (
    <div className="p-6 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed top-4 right-4 px-4 py-3 rounded-lg text-[13px] z-50 flex items-center gap-2"
          style={{
            background: toast.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: toast.type === "success" ? "#22c55e" : "#ef4444",
          }}
        >
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Availability & Calendar
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Manage your listing availability and booking calendar
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Listing Selector */}
          <select
            value={selectedListing}
            onChange={(e) => setSelectedListing(e.target.value)}
            className="px-3 py-2 rounded-lg text-[12px]"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
          >
            <option value="all">All Listings</option>
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.title}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowBlockDatesModal(true)}
            className="px-4 py-2 rounded-lg text-[12px] flex items-center gap-2"
            style={{
              background: "var(--active-overlay)",
              color: "var(--accent-navy-light)",
              border: "1px solid var(--border-accent)",
              fontWeight: 500,
            }}
          >
            <Plus size={14} />
            Block Dates
          </button>
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
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigateMonth("prev")}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-opacity-80 transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => navigateMonth("next")}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-opacity-80 transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                <ChevronRight size={16} />
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
              {getDaysInMonth(currentDate).map((day, i) => {
                if (!day) {
                  return <div key={`empty-${i}`} />;
                }
                const status = getDateStatus(day);
                const isToday = day === new Date().getDate() && 
                  currentDate.getMonth() === new Date().getMonth() && 
                  currentDate.getFullYear() === new Date().getFullYear();
                
                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className="aspect-square rounded-lg flex items-center justify-center text-[13px] transition-all hover:scale-105 cursor-pointer"
                    style={
                      status === "blocked"
                        ? {
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "#f87171",
                          }
                        : status === "limited"
                          ? {
                              background: "rgba(245,158,11,0.1)",
                              border: "1px solid rgba(245,158,11,0.3)",
                              color: "#fbbf24",
                            }
                          : isToday
                            ? {
                                background: "var(--active-overlay)",
                                border: "1px solid var(--border-accent)",
                                color: "var(--accent-navy-light)",
                                fontWeight: 600,
                              }
                            : {
                                background: "rgba(34,197,94,0.1)",
                                border: "1px solid rgba(34,197,94,0.3)",
                                color: "#22c55e",
                              }
                    }
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-6 mt-5 pt-5" style={{ borderTop: "1px solid var(--border-light)" }}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }} />
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }} />
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Limited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }} />
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Blocked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Rules */}
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
              Availability Rules
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                Default Capacity
              </label>
              <input
                type="number"
                value={availabilityRules.defaultCapacity}
                onChange={(e) => setAvailabilityRules(prev => ({ ...prev, defaultCapacity: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                Minimum Notice
              </label>
              <select
                value={availabilityRules.minimumNotice}
                onChange={(e) => setAvailabilityRules(prev => ({ ...prev, minimumNotice: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="same_day">Same day</option>
                <option value="1 day">1 day</option>
                <option value="2 days">2 days</option>
                <option value="3 days">3 days</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                Maximum Advance
              </label>
              <select
                value={availabilityRules.maximumAdvance}
                onChange={(e) => setAvailabilityRules(prev => ({ ...prev, maximumAdvance: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
                <option value="1 year">1 year</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                Booking Cutoff Time
              </label>
              <input
                type="time"
                value={availabilityRules.bookingCutoffTime || "18:00"}
                onChange={(e) => setAvailabilityRules(prev => ({ ...prev, bookingCutoffTime: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <button
              onClick={handleSaveRules}
              className="w-full px-4 py-2 rounded-lg text-[12px] hover:bg-opacity-80 transition-all"
              style={{
                background: "var(--active-overlay)",
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
                fontWeight: 500,
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Blocked Periods */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Blocked Periods
          </h2>
          <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            {filteredBlockedPeriods.length} periods
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--input-background)" }}>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Date Range
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Reason
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Type
                  </span>
                </th>
                <th className="px-5 py-3 text-right" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBlockedPeriods.map((block, i) => (
                <tr
                  key={block.id}
                  style={{ borderBottom: i < filteredBlockedPeriods.length - 1 ? "1px solid var(--border-light)" : "none" }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} style={{ color: "var(--text-tertiary)" }} />
                      <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {formatDateRange(block.startDate, block.endDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {block.reason}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div
                      className="inline-block px-2.5 py-1 rounded-lg text-[11px]"
                      style={{
                        background: block.type === "full_block" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                        color: block.type === "full_block" ? "#f87171" : "#fbbf24",
                        fontWeight: 600,
                      }}
                    >
                      {block.type === "full_block" ? "Full Block" : "Capacity Limit"}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditBlock(block)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-opacity-80 transition-all"
                        style={{
                          background: "var(--input-background)",
                          border: "1px solid var(--border-light)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-opacity-80 transition-all"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          color: "#f87171",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBlockedPeriods.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center">
                    <span className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                      No blocked periods found
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="rounded-xl p-6 w-full max-w-md mx-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Set Availability
              </h3>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Date
                </label>
                <input
                  type="text"
                  value={selectedDateForModal?.toLocaleDateString() || ""}
                  disabled
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-tertiary)",
                  }}
                />
              </div>

              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Availability Status
                </label>
                <select
                  value={availabilityForm.status}
                  onChange={(e) => setAvailabilityForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {availabilityForm.status === "limited" && (
                <div>
                  <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={availabilityForm.capacity}
                    onChange={(e) => setAvailabilityForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg text-[13px]"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              )}

              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Reason/Note (Optional)
                </label>
                <input
                  type="text"
                  value={availabilityForm.reason}
                  onChange={(e) => setAvailabilityForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Equipment maintenance, High demand"
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Price Override (Optional)
                </label>
                <input
                  type="number"
                  value={availabilityForm.priceOverride}
                  onChange={(e) => setAvailabilityForm(prev => ({ ...prev, priceOverride: e.target.value }))}
                  placeholder="Enter custom price"
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Apply To
                </label>
                <select
                  value={availabilityForm.listingId}
                  onChange={(e) => setAvailabilityForm(prev => ({ ...prev, listingId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="all">All Listings</option>
                  {listings.map((listing) => (
                    <option key={listing.id} value={listing.id}>
                      {listing.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="flex-1 px-4 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAvailability}
                className="flex-1 px-4 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--active-overlay)",
                  color: "var(--accent-navy-light)",
                  border: "1px solid var(--border-accent)",
                  fontWeight: 500,
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Dates Modal */}
      {showBlockDatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="rounded-xl p-6 w-full max-w-md mx-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Block Date Range
              </h3>
              <button
                onClick={() => setShowBlockDatesModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  value={blockDatesForm.startDate}
                  onChange={(e) => setBlockDatesForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  End Date *
                </label>
                <input
                  type="date"
                  value={blockDatesForm.endDate}
                  onChange={(e) => setBlockDatesForm(prev => ({ ...prev, endDate: e.target.value }))}
                  min={blockDatesForm.startDate}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Block Type
                </label>
                <select
                  value={blockDatesForm.type}
                  onChange={(e) => setBlockDatesForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="full_block">Full Block</option>
                  <option value="capacity_limit">Capacity Limit</option>
                </select>
              </div>

              {blockDatesForm.type === "capacity_limit" && (
                <div>
                  <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                    Capacity Limit
                  </label>
                  <input
                    type="number"
                    value={blockDatesForm.capacityLimit}
                    onChange={(e) => setBlockDatesForm(prev => ({ ...prev, capacityLimit: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg text-[13px]"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              )}

              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Reason *
                </label>
                <input
                  type="text"
                  value={blockDatesForm.reason}
                  onChange={(e) => setBlockDatesForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Equipment maintenance, National holiday"
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Apply To
                </label>
                <select
                  value={blockDatesForm.listingId}
                  onChange={(e) => setBlockDatesForm(prev => ({ ...prev, listingId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="all">All Listings</option>
                  {listings.map((listing) => (
                    <option key={listing.id} value={listing.id}>
                      {listing.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBlockDatesModal(false)}
                className="flex-1 px-4 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBlockDates}
                className="flex-1 px-4 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--active-overlay)",
                  color: "var(--accent-navy-light)",
                  border: "1px solid var(--border-accent)",
                  fontWeight: 500,
                }}
              >
                Block Dates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Block Modal */}
      {showEditBlockModal && editingBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="rounded-xl p-6 w-full max-w-md mx-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Edit Blocked Period
              </h3>
              <button
                onClick={() => setShowEditBlockModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  value={blockDatesForm.startDate}
                  onChange={(e) => setBlockDatesForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  End Date *
                </label>
                <input
                  type="date"
                  value={blockDatesForm.endDate}
                  onChange={(e) => setBlockDatesForm(prev => ({ ...prev, endDate: e.target.value }))}
                  min={blockDatesForm.startDate}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Block Type
                </label>
                <select
                  value={blockDatesForm.type}
                  onChange={(e) => setBlockDatesForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="full_block">Full Block</option>
                  <option value="capacity_limit">Capacity Limit</option>
                </select>
              </div>

              {blockDatesForm.type === "capacity_limit" && (
                <div>
                  <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                    Capacity Limit
                  </label>
                  <input
                    type="number"
                    value={blockDatesForm.capacityLimit}
                    onChange={(e) => setBlockDatesForm(prev => ({ ...prev, capacityLimit: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg text-[13px]"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              )}

              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Reason *
                </label>
                <input
                  type="text"
                  value={blockDatesForm.reason}
                  onChange={(e) => setBlockDatesForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Equipment maintenance, National holiday"
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Apply To
                </label>
                <select
                  value={blockDatesForm.listingId}
                  onChange={(e) => setBlockDatesForm(prev => ({ ...prev, listingId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="all">All Listings</option>
                  {listings.map((listing) => (
                    <option key={listing.id} value={listing.id}>
                      {listing.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditBlockModal(false)}
                className="flex-1 px-4 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBlock}
                className="flex-1 px-4 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--active-overlay)",
                  color: "var(--accent-navy-light)",
                  border: "1px solid var(--border-accent)",
                  fontWeight: 500,
                }}
              >
                Update Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="rounded-xl p-6 w-full max-w-sm mx-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                }}
              >
                <Trash2 size={20} />
              </div>
              <h3 className="text-[16px] mb-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Delete Blocked Period
              </h3>
              <p className="text-[13px] mb-6" style={{ color: "var(--text-secondary)" }}>
                Are you sure you want to delete this blocked period? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteBlock}
                  className="flex-1 px-4 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#ef4444",
                    fontWeight: 500,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

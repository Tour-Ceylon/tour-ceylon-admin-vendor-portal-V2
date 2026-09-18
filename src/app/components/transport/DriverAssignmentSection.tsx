import { useState, useEffect } from "react";
import {
  Car,
  User,
  Phone,
  CheckCircle,
  Clock,
  Navigation,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Wifi,
  WifiOff,
  UserCheck,
} from "lucide-react";
import {
  AdminAssignedDriverInfo,
  AdminTransportBooking,
  DriverPoolItem,
  assignDriverToBooking,
  fetchApprovedDrivers,
} from "../api/adminTransportApi";

interface DriverAssignmentSectionProps {
  bookingId: string;
  currentDriver?: AdminAssignedDriverInfo | null;
  assignmentStatus: string;
  assignedAt?: string;
  onDriverAssigned?: (updated: AdminTransportBooking) => void;
}

const ASSIGNMENT_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  unassigned: {
    label: "Unassigned",
    bg: "rgba(245, 158, 11, 0.12)",
    text: "#fbbf24",
    dot: "#f59e0b",
  },
  assigned: {
    label: "Assigned (Awaiting Response)",
    bg: "rgba(59, 130, 246, 0.12)",
    text: "#60a5fa",
    dot: "#3b82f6",
  },
  acknowledged: {
    label: "Accepted by Driver",
    bg: "rgba(168, 85, 247, 0.12)",
    text: "#c084fc",
    dot: "#a855f7",
  },
  en_route: {
    label: "Driver En Route",
    bg: "rgba(14, 165, 233, 0.12)",
    text: "#38bdf8",
    dot: "#0ea5e9",
  },
  arrived: {
    label: "Driver Arrived",
    bg: "rgba(20, 184, 166, 0.12)",
    text: "#2dd4bf",
    dot: "#14b8a6",
  },
  in_progress: {
    label: "Trip in Progress",
    bg: "rgba(99, 102, 241, 0.12)",
    text: "#818cf8",
    dot: "#6366f1",
  },
  completed: {
    label: "Completed",
    bg: "rgba(34, 197, 94, 0.12)",
    text: "#4ade80",
    dot: "#22c55e",
  },
  declined: {
    label: "Declined by Driver",
    bg: "rgba(239, 68, 68, 0.12)",
    text: "#f87171",
    dot: "#ef4444",
  },
};

export function DriverAssignmentSection({
  bookingId,
  currentDriver,
  assignmentStatus,
  assignedAt,
  onDriverAssigned,
}: DriverAssignmentSectionProps) {
  const [isChanging, setIsChanging] = useState(!currentDriver || assignmentStatus === "unassigned");
  const [drivers, setDrivers] = useState<DriverPoolItem[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const statusConfig =
    ASSIGNMENT_STATUS_CONFIG[assignmentStatus] || ASSIGNMENT_STATUS_CONFIG.unassigned;

  const loadDrivers = async () => {
    setLoadingDrivers(true);
    setErrorMsg(null);
    try {
      const list = await fetchApprovedDrivers(onlineOnly);
      setDrivers(list);
      if (list.length > 0 && !selectedDriverId) {
        // Default to first online driver if available, else first driver
        const onlineOne = list.find((d) => d.is_online);
        setSelectedDriverId(onlineOne ? onlineOne.id : list[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load approved drivers");
    } finally {
      setLoadingDrivers(false);
    }
  };

  useEffect(() => {
    if (isChanging) {
      loadDrivers();
    }
  }, [isChanging, onlineOnly]);

  const handleAssign = async () => {
    if (!selectedDriverId) return;
    setIsAssigning(true);
    setErrorMsg(null);
    try {
      const updated = await assignDriverToBooking(bookingId, selectedDriverId);
      setIsChanging(false);
      onDriverAssigned?.(updated);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to assign driver. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (d.full_name && d.full_name.toLowerCase().includes(q)) ||
      d.vehicle_plate_number.toLowerCase().includes(q) ||
      d.vehicle_make.toLowerCase().includes(q) ||
      d.vehicle_model.toLowerCase().includes(q) ||
      (d.phone && d.phone.includes(q))
    );
  });

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "var(--bg-panel)",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[14px] flex items-center gap-2"
          style={{ color: "var(--text-primary)", fontWeight: 600 }}
        >
          <Car size={16} style={{ color: "var(--accent-navy-light)" }} />
          Driver Dispatch & Assignment
        </h3>

        {/* Live Status Badge */}
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ background: statusConfig.bg, color: statusConfig.text }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: statusConfig.dot }}
          />
          {statusConfig.label}
        </span>
      </div>

      {/* Currently Assigned Driver View */}
      {currentDriver && !isChanging ? (
        <div
          className="rounded-lg p-4"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                {currentDriver.full_name ? currentDriver.full_name.substring(0, 2).toUpperCase() : "DR"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p
                    className="text-[14px]"
                    style={{ color: "var(--text-primary)", fontWeight: 600 }}
                  >
                    {currentDriver.full_name || "Assigned Driver"}
                  </p>
                  {currentDriver.is_online ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Wifi size={10} /> Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-500/10 text-slate-400 border border-slate-500/20">
                      <WifiOff size={10} /> Offline
                    </span>
                  )}
                </div>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {currentDriver.vehicle_make} {currentDriver.vehicle_model} •{" "}
                  <span className="font-mono text-[11px]">{currentDriver.vehicle_plate_number}</span> •{" "}
                  {currentDriver.seats} Seats
                </p>
                {currentDriver.phone && (
                  <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "var(--text-tertiary)" }}>
                    <Phone size={11} /> {currentDriver.phone}
                  </p>
                )}
              </div>
            </div>

            {currentDriver.rating && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                <span className="text-[12px] font-semibold text-amber-400">
                  {currentDriver.rating.toFixed(1)}
                </span>
                <span className="text-[14px] text-amber-400">★</span>
              </div>
            )}
          </div>

          {assignedAt && (
            <p className="text-[11px] mt-3 pt-3 flex items-center gap-1.5" style={{ borderTop: "1px solid var(--border-light)", color: "var(--text-tertiary)" }}>
              <Clock size={12} /> Assigned: {new Date(assignedAt).toLocaleString()}
            </p>
          )}

          {assignmentStatus !== "completed" && (
            <button
              onClick={() => setIsChanging(true)}
              className="w-full mt-3 py-2 px-3 text-[12px] rounded-lg transition-all flex items-center justify-center gap-1.5"
              style={{
                background: "var(--hover-overlay)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              <RefreshCw size={13} /> Reassign / Change Driver
            </button>
          )}
        </div>
      ) : (
        /* Driver Picker Form */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
              Select an approved driver to assign:
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer" style={{ color: "var(--text-tertiary)" }}>
                <input
                  type="checkbox"
                  checked={onlineOnly}
                  onChange={(e) => setOnlineOnly(e.target.checked)}
                  className="rounded"
                />
                Online drivers only
              </label>
              <button
                onClick={loadDrivers}
                disabled={loadingDrivers}
                className="p-1.5 rounded hover:bg-white/5 transition-all text-xs"
                style={{ color: "var(--text-tertiary)" }}
                title="Refresh drivers"
              >
                <RefreshCw size={12} className={loadingDrivers ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Search Driver */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
            }}
          >
            <Search size={13} style={{ color: "var(--text-tertiary)" }} />
            <input
              type="text"
              placeholder="Search by name, plate number, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-[12px] outline-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          {/* Driver List Options */}
          {loadingDrivers ? (
            <div className="py-6 flex items-center justify-center gap-2" style={{ color: "var(--text-tertiary)" }}>
              <Loader2 size={16} className="animate-spin" />
              <span className="text-[12px]">Loading available drivers...</span>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="py-5 text-center rounded-lg" style={{ background: "var(--input-background)", border: "1px dashed var(--border-light)" }}>
              <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                No {onlineOnly ? "online " : ""}approved drivers found matching your search.
              </p>
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {filteredDrivers.map((driver) => {
                const isSelected = selectedDriverId === driver.id;
                return (
                  <div
                    key={driver.id}
                    onClick={() => setSelectedDriverId(driver.id)}
                    className="p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between"
                    style={{
                      background: isSelected ? "var(--active-overlay)" : "var(--input-background)",
                      border: isSelected ? "1px solid var(--border-accent)" : "1px solid var(--border-light)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          background: driver.is_online ? "#22c55e" : "#64748b",
                          boxShadow: driver.is_online ? "0 0 6px #22c55e" : "none",
                        }}
                      />
                      <div>
                        <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                          {driver.full_name || "Driver"}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          {driver.vehicle_make} {driver.vehicle_model} •{" "}
                          <span className="font-mono text-[10px]">{driver.vehicle_plate_number}</span> •{" "}
                          {driver.seats} seats
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {driver.is_online ? (
                        <span className="text-[10px] text-emerald-400 font-medium">Online</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Offline</span>
                      )}
                      {driver.rating && (
                        <p className="text-[11px] text-amber-400">★ {driver.rating.toFixed(1)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleAssign}
              disabled={isAssigning || !selectedDriverId}
              className="flex-1 py-2.5 px-4 rounded-lg text-[12px] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                color: "white",
                border: "1px solid var(--border-accent)",
                fontWeight: 600,
              }}
            >
              {isAssigning ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
              {currentDriver ? "Confirm Driver Reassignment" : "Assign Driver to Trip"}
            </button>
            {currentDriver && (
              <button
                onClick={() => setIsChanging(false)}
                className="py-2.5 px-3 rounded-lg text-[12px] transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-tertiary)",
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

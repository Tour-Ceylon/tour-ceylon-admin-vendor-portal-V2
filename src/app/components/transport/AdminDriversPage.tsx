import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Car,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Star,
  Luggage,
  ShieldCheck,
  Building2,
  TrendingUp,
  Loader2,
  ChevronRight,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  AdminDriverItem,
  fetchAdminDrivers,
  updateAdminDriverStatus,
} from "../api/adminDriverApi";
import { AdminDriverDetailDrawer } from "./AdminDriverDetailDrawer";

export function AdminDriversPage() {
  const [drivers, setDrivers] = useState<AdminDriverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "approved" | "pending_review" | "online" | "suspended_rejected"
  >("all");
  const [selectedDriver, setSelectedDriver] = useState<AdminDriverItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updatingDriverId, setUpdatingDriverId] = useState<string | null>(null);

  const loadDrivers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchAdminDrivers({ per_page: 100 });
      setDrivers(res.drivers);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  // Quick action from table
  const handleQuickApprove = async (e: React.MouseEvent, driverId: string) => {
    e.stopPropagation();
    setUpdatingDriverId(driverId);
    try {
      const updated = await updateAdminDriverStatus(driverId, "approved");
      setDrivers((prev) => prev.map((d) => (d.id === driverId ? updated : d)));
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to approve driver");
    } finally {
      setUpdatingDriverId(null);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = drivers.length;
    const approved = drivers.filter((d) => d.status === "approved").length;
    const pending = drivers.filter((d) => d.status === "pending_review").length;
    const online = drivers.filter((d) => d.is_online).length;
    const totalRevenue = drivers.reduce((sum, d) => sum + (Number(d.total_earnings) || 0), 0);
    const totalCompletedTrips = drivers.reduce((sum, d) => sum + (d.completed_trips_count || 0), 0);

    return { total, approved, pending, online, totalRevenue, totalCompletedTrips };
  }, [drivers]);

  // Tab Filtering
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      // Tab filter
      if (activeTab === "approved" && d.status !== "approved") return false;
      if (activeTab === "pending_review" && d.status !== "pending_review") return false;
      if (activeTab === "online" && !d.is_online) return false;
      if (activeTab === "suspended_rejected" && !["suspended", "rejected"].includes(d.status))
        return false;

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = (d.full_name || "").toLowerCase().includes(query);
        const matchesEmail = (d.email || "").toLowerCase().includes(query);
        const matchesPhone = (d.phone || "").toLowerCase().includes(query);
        const matchesPlate = (d.vehicle_plate_number || "").toLowerCase().includes(query);
        const matchesMake = (d.vehicle_make || "").toLowerCase().includes(query);
        const matchesModel = (d.vehicle_model || "").toLowerCase().includes(query);
        const matchesNic = (d.nic_number || "").toLowerCase().includes(query);

        return (
          matchesName ||
          matchesEmail ||
          matchesPhone ||
          matchesPlate ||
          matchesMake ||
          matchesModel ||
          matchesNic
        );
      }

      return true;
    });
  }, [drivers, activeTab, searchTerm]);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Driver Fleet Management
            </h1>
            <span
              className="px-2.5 py-0.5 rounded-full text-[12px] font-bold"
              style={{
                background: "var(--active-overlay)",
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
              }}
            >
              {drivers.length} Drivers
            </span>
          </div>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Review driver profiles, vehicle specifications, real-time availability, and individual driver earnings
          </p>
        </div>

        <button
          onClick={loadDrivers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all self-start sm:self-auto"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-[13px] flex items-center gap-2">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Top KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Driver Revenue */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden space-y-2"
          style={{
            background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
            border: "1px solid var(--border-accent)",
            boxShadow: "0 0 20px var(--border-accent)",
          }}
        >
          <div className="flex items-center justify-between text-white/75 text-[11px] uppercase font-bold tracking-wider">
            <span>Fleet Revenue</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <p className="text-[26px] font-extrabold text-white">
            ${stats.totalRevenue.toFixed(2)}
          </p>
          <p className="text-[11px] text-white/70">{stats.totalCompletedTrips} rides fulfilled</p>
        </div>

        {/* Online Now */}
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            boxShadow: "0 0 16px rgba(34, 197, 94, 0.1)",
          }}
        >
          <div className="flex items-center justify-between text-[11px] uppercase font-bold text-emerald-400 tracking-wider">
            <span>Online Now</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
          <p className="text-[26px] font-extrabold text-emerald-400">
            {stats.online}
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Ready for dispatch</p>
        </div>

        {/* Approved Active Drivers */}
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between text-[11px] uppercase font-bold tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            <span>Approved Drivers</span>
            <CheckCircle size={16} className="text-sky-400" />
          </div>
          <p className="text-[26px] font-extrabold" style={{ color: "var(--text-primary)" }}>
            {stats.approved}
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Verified partner fleet</p>
        </div>

        {/* Pending Review */}
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{
            background: "var(--bg-panel)",
            border: stats.pending > 0 ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid var(--border-light)",
            boxShadow: stats.pending > 0 ? "0 0 16px rgba(245, 158, 11, 0.15)" : "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between text-[11px] uppercase font-bold tracking-wider" style={{ color: stats.pending > 0 ? "#fbbf24" : "var(--text-tertiary)" }}>
            <span>Pending Review</span>
            <Clock size={16} className={stats.pending > 0 ? "text-amber-400" : "text-slate-400"} />
          </div>
          <p className="text-[26px] font-extrabold" style={{ color: stats.pending > 0 ? "#fbbf24" : "var(--text-primary)" }}>
            {stats.pending}
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Applications awaiting review</p>
        </div>

        {/* Total Registered */}
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between text-[11px] uppercase font-bold tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            <span>Total Registered</span>
            <Users size={16} className="text-purple-400" />
          </div>
          <p className="text-[26px] font-extrabold" style={{ color: "var(--text-primary)" }}>
            {stats.total}
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>All registered drivers</p>
        </div>
      </div>

      {/* ── Search & Filter Tabs ── */}
      <div
        className="rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
        }}
      >
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Drivers", count: stats.total },
            { id: "approved", label: "Approved", count: stats.approved },
            { id: "pending_review", label: "Pending Review", count: stats.pending },
            { id: "online", label: "Online Now", count: stats.online },
            {
              id: "suspended_rejected",
              label: "Suspended / Rejected",
              count: stats.total - stats.approved - stats.pending,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-3.5 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5"
              style={{
                background: activeTab === tab.id ? "var(--active-overlay)" : "transparent",
                border: activeTab === tab.id ? "1px solid var(--border-accent)" : "1px solid transparent",
                color: activeTab === tab.id ? "var(--accent-navy-light)" : "var(--text-secondary)",
              }}
            >
              <span>{tab.label}</span>
              <span
                className="px-1.5 py-0.2 rounded-full text-[10px]"
                style={{
                  background: activeTab === tab.id ? "var(--border-accent)" : "var(--input-background)",
                  color: activeTab === tab.id ? "white" : "var(--text-tertiary)",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-tertiary)" }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, plate, email, NIC..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-[12px] outline-none transition-all"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      {/* ── Main Drivers Table ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {loading ? (
          <div className="py-24 flex items-center justify-center gap-3" style={{ color: "var(--text-tertiary)" }}>
            <Loader2 size={24} className="animate-spin text-sky-400" />
            <span className="text-[13px]">Loading driver fleet records...</span>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Users size={36} className="text-slate-500 mx-auto" />
            <p className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
              No drivers match this criteria
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              Try adjusting your search keyword or selected status tab.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr
                  className="text-[11px] uppercase font-bold tracking-wider"
                  style={{
                    background: "var(--input-background)",
                    borderBottom: "1px solid var(--border-light)",
                    color: "var(--text-tertiary)",
                  }}
                >
                  <th className="px-6 py-4">Driver Profile</th>
                  <th className="px-4 py-4">Vehicle & Capacity</th>
                  <th className="px-4 py-4">Status & Availability</th>
                  <th className="px-4 py-4">Earnings & Trips</th>
                  <th className="px-4 py-4">Bank / Payout</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filteredDrivers.map((driver) => {
                  const isApproved = driver.status === "approved";
                  const isPending = driver.status === "pending_review";
                  const isSuspended = driver.status === "suspended";

                  return (
                    <tr
                      key={driver.id}
                      onClick={() => setSelectedDriver(driver)}
                      className="cursor-pointer hover:bg-white/5 transition-all group"
                    >
                      {/* Driver Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                            style={{
                              background: isApproved
                                ? "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))"
                                : "linear-gradient(135deg, #475569, #334155)",
                              boxShadow: isApproved ? "0 0 10px var(--border-accent)" : "none",
                            }}
                          >
                            {driver.full_name ? driver.full_name.substring(0, 2).toUpperCase() : "DR"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[14px]" style={{ color: "var(--text-primary)" }}>
                                {driver.full_name || "Unnamed Driver"}
                              </span>
                              {isApproved && <ShieldCheck size={14} className="text-emerald-400" />}
                            </div>
                            <p className="text-[11px] truncate" style={{ color: "var(--text-secondary)" }}>
                              {driver.email || driver.phone || "No contact info"}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                              NIC: {driver.nic_number}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle & Capacity */}
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            {driver.vehicle_make} {driver.vehicle_model}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                              {driver.vehicle_plate_number}
                            </span>
                            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                              {driver.seats} seats
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status & Availability */}
                      <td className="px-4 py-4">
                        <div className="space-y-1.5">
                          {/* Online indicator */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                driver.is_online ? "bg-emerald-400 animate-ping" : "bg-slate-500"
                              }`}
                            />
                            <span
                              className="text-[11px] font-semibold"
                              style={{ color: driver.is_online ? "#4ade80" : "var(--text-tertiary)" }}
                            >
                              {driver.is_online ? "Online Now" : "Offline"}
                            </span>
                          </div>

                          {/* Status Pill */}
                          <span
                            className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{
                              background: isApproved
                                ? "rgba(34, 197, 94, 0.12)"
                                : isPending
                                ? "rgba(245, 158, 11, 0.12)"
                                : "rgba(239, 68, 68, 0.12)",
                              color: isApproved ? "#4ade80" : isPending ? "#fbbf24" : "#f87171",
                            }}
                          >
                            {driver.status.replace("_", " ")}
                          </span>
                        </div>
                      </td>

                      {/* Earnings & Trips */}
                      <td className="px-4 py-4">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-[16px] font-extrabold text-emerald-400">
                              ${Number(driver.total_earnings || 0).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            {driver.completed_trips_count || 0} completed • {driver.active_trips_count || 0} active
                          </p>
                          {driver.rating && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-0.5">
                              <Star size={11} fill="currentColor" />
                              <span>{driver.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Bank / Payout */}
                      <td className="px-4 py-4">
                        <div className="text-[12px]">
                          <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                            {driver.bank_name || "Bank of Ceylon"}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">
                            {driver.bank_account_number || "•••• 4821"}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {isPending && (
                            <button
                              onClick={(e) => handleQuickApprove(e, driver.id)}
                              disabled={updatingDriverId === driver.id}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 shadow-md"
                              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                              title="Approve Driver"
                            >
                              {updatingDriverId === driver.id ? (
                                <Loader2 size={11} className="animate-spin" />
                              ) : (
                                <CheckCircle size={11} />
                              )}
                              Approve
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedDriver(driver)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all"
                            style={{
                              background: "var(--input-background)",
                              border: "1px solid var(--border-light)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            <Eye size={12} /> Dossier
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
      </div>

      {/* ── Slide-Over Driver Dossier Drawer ── */}
      {selectedDriver && (
        <AdminDriverDetailDrawer
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onRefresh={loadDrivers}
        />
      )}
    </div>
  );
}

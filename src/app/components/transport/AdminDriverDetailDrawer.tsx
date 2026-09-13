import { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Car,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  MapPin,
  Globe,
  Briefcase,
  Building2,
  ExternalLink,
  Wifi,
  WifiOff,
  Loader2,
  Star,
  Luggage,
  Clock,
  Lock,
  Unlock,
} from "lucide-react";
import {
  AdminDriverItem,
  updateAdminDriverStatus,
} from "../api/adminDriverApi";

interface AdminDriverDetailDrawerProps {
  driver: AdminDriverItem;
  onClose: () => void;
  onRefresh?: () => void;
}

const STATUS_BADGE_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  approved: { label: "Approved Partner", bg: "rgba(34, 197, 94, 0.12)", text: "#4ade80", dot: "#22c55e" },
  pending_review: { label: "Pending Review", bg: "rgba(245, 158, 11, 0.12)", text: "#fbbf24", dot: "#f59e0b" },
  rejected: { label: "Rejected", bg: "rgba(239, 68, 68, 0.12)", text: "#f87171", dot: "#ef4444" },
  suspended: { label: "Suspended", bg: "rgba(239, 68, 68, 0.12)", text: "#f87171", dot: "#ef4444" },
};

export function AdminDriverDetailDrawer({
  driver,
  onClose,
  onRefresh,
}: AdminDriverDetailDrawerProps) {
  const [currentDriver, setCurrentDriver] = useState<AdminDriverItem>(driver);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  const statusConfig =
    STATUS_BADGE_CONFIG[currentDriver.status] || STATUS_BADGE_CONFIG.pending_review;

  const handleStatusChange = async (
    targetStatus: "approved" | "rejected" | "suspended" | "pending_review",
    reason?: string
  ) => {
    setIsUpdating(true);
    setErrorMsg(null);
    try {
      const updated = await updateAdminDriverStatus(currentDriver.id, targetStatus, reason);
      setCurrentDriver(updated);
      setRejectModalOpen(false);
      setRejectReason("");
      onRefresh?.();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update driver status");
    } finally {
      setIsUpdating(false);
    }
  };

  const documents = [
    { label: "Driver's License", url: currentDriver.license_photo_url, idNum: currentDriver.license_number },
    { label: "National Identity Card (NIC)", url: currentDriver.nic_photo_url, idNum: currentDriver.nic_number },
    { label: "Vehicle Registration (CR)", url: currentDriver.vehicle_registration_doc_url },
    { label: "Vehicle Insurance Certificate", url: currentDriver.insurance_doc_url },
    { label: "Police Clearance Certificate", url: currentDriver.police_clearance_doc_url },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease-out" }}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-[800px] z-50 overflow-y-auto"
        style={{
          background: "var(--bg-main)",
          borderLeft: "1px solid var(--border-light)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
          animation: "slideInRight 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{
            background: "var(--bg-panel)",
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-[14px] font-bold text-white shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                boxShadow: "0 0 16px var(--border-accent)",
              }}
            >
              {currentDriver.full_name ? currentDriver.full_name.substring(0, 2).toUpperCase() : "DR"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-bold" style={{ color: "var(--text-primary)" }}>
                  {currentDriver.full_name || "Driver Dossier"}
                </h2>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ background: statusConfig.bg, color: statusConfig.text }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusConfig.dot }} />
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                ID: <span className="font-mono">{currentDriver.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-tertiary)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[13px] flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── Driver Revenue & Performance KPI Cards ── */}
          <div className="grid grid-cols-4 gap-3">
            <div
              className="rounded-2xl p-4 space-y-1"
              style={{
                background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                border: "1px solid var(--border-accent)",
                boxShadow: "0 0 16px var(--border-accent)",
              }}
            >
              <div className="flex items-center justify-between text-white/70 text-[11px] uppercase font-semibold">
                <span>Total Earnings</span>
                <DollarSign size={14} className="text-emerald-400" />
              </div>
              <p className="text-[22px] font-extrabold text-white">
                ${Number(currentDriver.total_earnings || 0).toFixed(2)}
              </p>
              <p className="text-[10px] text-white/60">Lifetime driver revenue</p>
            </div>

            <div
              className="rounded-2xl p-4 space-y-1"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
              }}
            >
              <div className="flex items-center justify-between text-[11px] uppercase font-semibold" style={{ color: "var(--text-tertiary)" }}>
                <span>Completed Trips</span>
                <CheckCircle size={14} className="text-sky-400" />
              </div>
              <p className="text-[22px] font-extrabold" style={{ color: "var(--text-primary)" }}>
                {currentDriver.completed_trips_count || 0}
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Fulfilled transfers</p>
            </div>

            <div
              className="rounded-2xl p-4 space-y-1"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
              }}
            >
              <div className="flex items-center justify-between text-[11px] uppercase font-semibold" style={{ color: "var(--text-tertiary)" }}>
                <span>Active Trips</span>
                <Car size={14} className="text-purple-400" />
              </div>
              <p className="text-[22px] font-extrabold" style={{ color: "var(--text-primary)" }}>
                {currentDriver.active_trips_count || 0}
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>In progress / assigned</p>
            </div>

            <div
              className="rounded-2xl p-4 space-y-1"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
              }}
            >
              <div className="flex items-center justify-between text-[11px] uppercase font-semibold" style={{ color: "var(--text-tertiary)" }}>
                <span>Driver Rating</span>
                <Star size={14} className="text-amber-400" />
              </div>
              <p className="text-[22px] font-extrabold text-amber-400">
                {currentDriver.rating ? currentDriver.rating.toFixed(1) : "5.0"}★
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Customer rating</p>
            </div>
          </div>

          {/* ── Status Management Actions ── */}
          <div
            className="rounded-2xl p-5 flex items-center justify-between"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${currentDriver.is_online ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
                <span className="text-[13px] font-bold" style={{ color: currentDriver.is_online ? "#4ade80" : "var(--text-secondary)" }}>
                  {currentDriver.is_online ? "Currently Online & Dispatch Ready" : "Currently Offline"}
                </span>
              </div>
              {currentDriver.last_online_at && (
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  (Last active: {new Date(currentDriver.last_online_at).toLocaleString()})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentDriver.status === "pending_review" && (
                <>
                  <button
                    onClick={() => handleStatusChange("approved")}
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-xl text-[12px] font-bold text-white flex items-center gap-1.5 transition-all shadow-md"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                  >
                    {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                    Approve Driver
                  </button>
                  <button
                    onClick={() => setRejectModalOpen(true)}
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-xl text-[12px] font-semibold flex items-center gap-1.5 transition-all"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </>
              )}

              {currentDriver.status === "approved" && (
                <button
                  onClick={() => handleStatusChange("suspended")}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold flex items-center gap-1.5 transition-all"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
                >
                  <Lock size={13} /> Suspend Driver
                </button>
              )}

              {currentDriver.status === "suspended" && (
                <button
                  onClick={() => handleStatusChange("approved")}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl text-[12px] font-bold text-white flex items-center gap-1.5 transition-all"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  <Unlock size={13} /> Reinstate Driver
                </button>
              )}
            </div>
          </div>

          {/* ── Vehicle Specifications & Capacity ── */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
            }}
          >
            <h3 className="text-[14px] font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Car size={16} className="text-sky-400" />
              Vehicle Specifications & Capacity
            </h3>

            <div className="grid grid-cols-3 gap-3 text-[13px]">
              <div className="p-3.5 rounded-xl" style={{ background: "var(--input-background)" }}>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Make & Model</span>
                <span className="font-bold text-[14px]" style={{ color: "var(--text-primary)" }}>
                  {currentDriver.vehicle_make} {currentDriver.vehicle_model}
                </span>
              </div>
              <div className="p-3.5 rounded-xl" style={{ background: "var(--input-background)" }}>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Plate Number</span>
                <span className="font-mono font-bold text-[14px] text-sky-400">
                  {currentDriver.vehicle_plate_number}
                </span>
              </div>
              <div className="p-3.5 rounded-xl" style={{ background: "var(--input-background)" }}>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Passenger Seats</span>
                <span className="font-bold text-[14px]" style={{ color: "var(--text-primary)" }}>
                  {currentDriver.seats} Seats
                </span>
              </div>
            </div>

            {/* Luggage Capacities */}
            {currentDriver.luggage_capacities && currentDriver.luggage_capacities.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] uppercase font-bold text-slate-400 mb-2">Luggage Capacity Breakdown:</p>
                <div className="flex flex-wrap gap-2">
                  {currentDriver.luggage_capacities.map((cap, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px]"
                      style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
                    >
                      <Luggage size={13} className="text-purple-400" />
                      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {cap.name || "Luggage"}: <strong>{cap.quantity}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Driver Personal Profile ── */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
            }}
          >
            <h3 className="text-[14px] font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <User size={16} className="text-emerald-400" />
              Driver Profile & Contact
            </h3>

            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <span className="text-[11px] text-slate-400 block">Email Address:</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {currentDriver.email || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Phone Number:</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {currentDriver.phone || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">National Identity Card (NIC):</span>
                <span className="font-mono font-medium" style={{ color: "var(--text-primary)" }}>
                  {currentDriver.nic_number}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Base Location:</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {currentDriver.base_location || "Western Province, Sri Lanka"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Languages Spoken:</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {currentDriver.languages_spoken && currentDriver.languages_spoken.length > 0
                    ? currentDriver.languages_spoken.join(", ")
                    : "English, Sinhala"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Driving Experience:</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {currentDriver.years_experience ? `${currentDriver.years_experience} Years` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Payout & Bank Details ── */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
            }}
          >
            <h3 className="text-[14px] font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Building2 size={16} className="text-purple-400" />
              Payout & Direct Bank Transfer Information
            </h3>

            <div
              className="rounded-xl p-4 grid grid-cols-3 gap-3 text-[13px]"
              style={{ background: "var(--input-background)" }}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Name</span>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                  {currentDriver.bank_name || "Commercial Bank of Ceylon"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Number</span>
                <span className="font-mono font-bold text-sky-400">
                  {currentDriver.bank_account_number || "•••••••• 4821"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Holder</span>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                  {currentDriver.bank_account_holder || currentDriver.full_name || "Driver"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Verification Documents ── */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
            }}
          >
            <h3 className="text-[14px] font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <FileText size={16} className="text-amber-400" />
              Uploaded Registration Documents
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {documents.map((doc, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl flex items-center justify-between"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {doc.label}
                    </p>
                    {doc.idNum && (
                      <p className="text-[11px] font-mono text-slate-400">ID: {doc.idNum}</p>
                    )}
                  </div>

                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 flex items-center gap-1 shrink-0"
                    >
                      <span>View</span>
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span className="text-[11px] italic text-slate-500 shrink-0">Not Provided</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setRejectModalOpen(false)}
          />
          <div
            className="fixed inset-0 m-auto max-w-md h-fit z-50 rounded-3xl p-6 space-y-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>
                Reject Driver Application
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--input-background)", color: "var(--text-tertiary)" }}
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="text-[12px] font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>
                Reason for Rejection:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Specify reason (e.g. Expired license, Invalid insurance document)..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-[12px] outline-none resize-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleStatusChange("rejected", rejectReason)}
                disabled={isUpdating}
                className="flex-1 py-2.5 rounded-xl text-[12px] font-bold text-white flex items-center justify-center gap-1.5"
                style={{ background: "var(--error)" }}
              >
                {isUpdating ? <Loader2 size={13} className="animate-spin" /> : null}
                Confirm Rejection
              </button>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-[12px]"
                style={{ background: "var(--input-background)", color: "var(--text-tertiary)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
}

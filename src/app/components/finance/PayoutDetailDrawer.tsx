import {
  X,
  Building2,
  Wallet,
  Calendar,
  DollarSign,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  PauseCircle,
  Send,
  Ban,
} from "lucide-react";

interface PayoutData {
  id: string;
  payoutId: string;
  vendor: string;
  vendorEmail: string;
  availableBalance: number;
  payoutAmount: number;
  pendingBalance: number;
  payoutMethod: string;
  status: string;
  nextPayoutDate: string;
  requestDate: string;
  processedDate?: string;
  bankAccount: string;
}

interface PayoutDetailDrawerProps {
  payout: PayoutData;
  onClose: () => void;
}

export function PayoutDetailDrawer({ payout, onClose }: PayoutDetailDrawerProps) {
  const StatusIcon = payout.status === "paid" ? CheckCircle : payout.status === "failed" ? XCircle : payout.status === "on_hold" ? PauseCircle : Clock;
  const statusColor = payout.status === "paid" ? "var(--success)" : payout.status === "failed" ? "var(--error)" : payout.status === "on_hold" ? "#64748b" : "var(--warning)";

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
        className="fixed right-0 top-0 h-full w-[600px] z-50 overflow-y-auto"
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
          <div>
            <h2 className="text-[18px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              Payout Details
            </h2>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {payout.payoutId}
            </p>
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
        <div className="p-6 space-y-5">
          {/* Status Card */}
          <div
            className="rounded-xl p-5"
            style={{
              background: payout.status === "paid" ? "rgba(34, 197, 94, 0.08)" : payout.status === "failed" ? "rgba(239, 68, 68, 0.08)" : payout.status === "on_hold" ? "rgba(100, 116, 139, 0.08)" : "rgba(245, 158, 11, 0.08)",
              border: `1px solid ${payout.status === "paid" ? "rgba(34, 197, 94, 0.2)" : payout.status === "failed" ? "rgba(239, 68, 68, 0.2)" : payout.status === "on_hold" ? "rgba(100, 116, 139, 0.2)" : "rgba(245, 158, 11, 0.2)"}`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <StatusIcon size={20} style={{ color: statusColor }} />
              <h3 className="text-[14px] capitalize" style={{ color: statusColor, fontWeight: 600 }}>
                Payout {payout.status.replace("_", " ")}
              </h3>
            </div>
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              {payout.status === "paid" && `Payout successfully processed on ${payout.processedDate}`}
              {payout.status === "pending" && "Payout is awaiting approval and will be processed on next payout cycle"}
              {payout.status === "processing" && "Payout is currently being processed and will be completed shortly"}
              {payout.status === "failed" && "Payout failed due to bank account verification issues"}
              {payout.status === "on_hold" && "Payout is on hold pending additional verification"}
            </p>
          </div>

          {/* Vendor Info */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Vendor Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Vendor Name
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {payout.vendor}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wallet size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Payout Method
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {payout.payoutMethod}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    Account: {payout.bankAccount}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Next Payout Date
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {payout.nextPayoutDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Financial Summary
            </h3>
            <div className="space-y-4">
              <div
                className="rounded-lg p-4"
                style={{
                  background: "rgba(34, 197, 94, 0.08)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                }}
              >
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Available Balance
                </p>
                <p className="text-[24px]" style={{ color: "var(--success)", fontWeight: 700 }}>
                  ${payout.availableBalance.toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Payout Amount
                  </p>
                  <p className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                    ${payout.payoutAmount.toLocaleString()}
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Pending Balance
                  </p>
                  <p className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                    ${payout.pendingBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Admin Actions
            </h3>
            <div className="space-y-2">
              {payout.status === "pending" && (
                <>
                  <button
                    className="w-full px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: "var(--success)",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle size={14} />
                    Approve Payout
                  </button>
                  <button
                    className="w-full px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <PauseCircle size={14} />
                    Hold Payout
                  </button>
                  <button
                    className="w-full px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: "var(--error)",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    <XCircle size={14} />
                    Reject Payout
                  </button>
                </>
              )}
              {payout.status === "processing" && (
                <button
                  className="w-full px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "var(--success)",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  <Send size={14} />
                  Complete Payout
                </button>
              )}
              {payout.status === "on_hold" && (
                <>
                  <button
                    className="w-full px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: "var(--success)",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle size={14} />
                    Release & Approve
                  </button>
                  <button
                    className="w-full px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: "var(--error)",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    <Ban size={14} />
                    Reject Payout
                  </button>
                </>
              )}
              {payout.status === "failed" && (
                <button
                  className="w-full px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "var(--warning)",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  <Send size={14} />
                  Retry Payout
                </button>
              )}
              <button
                className="w-full px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <Download size={14} />
                Download Payout Report
              </button>
            </div>
          </div>

          {/* Payout History */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Payout Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: "var(--success)",
                      boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    <CheckCircle size={12} className="text-white" />
                  </div>
                  {!payout.processedDate && (
                    <div className="w-0.5 h-8 mt-1" style={{ background: "var(--border-light)" }} />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-[13px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    Payout Requested
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {payout.requestDate}
                  </p>
                </div>
              </div>
              {payout.processedDate && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: "var(--success)",
                        boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.2)",
                      }}
                    >
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-[13px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      Payout Processed
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {payout.processedDate}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

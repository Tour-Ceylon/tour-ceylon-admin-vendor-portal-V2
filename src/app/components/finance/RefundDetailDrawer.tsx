import {
  X,
  FileText,
  User,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";

interface RefundData {
  id: string;
  refundId: string;
  bookingId: string;
  customer: string;
  vendor: string;
  bookingType: string;
  originalAmount: number;
  refundAmount: number;
  refundType: "full" | "partial";
  reason: string;
  status: string;
  requestDate: string;
  processedDate?: string;
}

interface RefundDetailDrawerProps {
  refund: RefundData;
  onClose: () => void;
}

export function RefundDetailDrawer({ refund, onClose }: RefundDetailDrawerProps) {
  const [customAmount, setCustomAmount] = useState(refund.refundAmount);
  const [notes, setNotes] = useState("");

  const handleApprove = () => {
    console.log("Approving refund:", refund.refundId, "Amount:", customAmount);
    onClose();
  };

  const handleReject = () => {
    console.log("Rejecting refund:", refund.refundId);
    onClose();
  };

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
              Refund Request
            </h2>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {refund.refundId}
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
          {/* Refund Details */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Refund Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FileText size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Booking ID
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {refund.bookingId}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Customer
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {refund.customer}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Vendor
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {refund.vendor}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Request Date
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {refund.requestDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} style={{ color: "var(--warning)" }} className="shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[14px] mb-2" style={{ color: "var(--warning)", fontWeight: 600 }}>
                  Refund Reason
                </h3>
                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  {refund.reason}
                </p>
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
              Financial Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  Original Amount
                </p>
                <p className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  ${refund.originalAmount.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  Refund Type
                </p>
                <span
                  className="text-[12px] px-2.5 py-1 rounded capitalize"
                  style={{
                    background: refund.refundType === "full" ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
                    color: refund.refundType === "full" ? "var(--error)" : "var(--warning)",
                    fontWeight: 600,
                  }}
                >
                  {refund.refundType}
                </span>
              </div>
              <div
                className="pt-3"
                style={{ borderTop: "1px solid var(--border-light)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                    Refund Amount
                  </p>
                  <p className="text-[18px]" style={{ color: "var(--error)", fontWeight: 700 }}>
                    ${refund.refundAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Partial Refund Control */}
          {refund.status === "requested" || refund.status === "under_review" ? (
            <div
              className="rounded-xl p-5"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Adjust Refund Amount
              </h3>
              <div>
                <label className="text-[11px] mb-2 block" style={{ color: "var(--text-tertiary)" }}>
                  Custom Refund Amount
                </label>
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <DollarSign size={14} style={{ color: "var(--text-tertiary)" }} />
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="flex-1 bg-transparent text-[13px] outline-none"
                    style={{ color: "var(--text-primary)" }}
                    min="0"
                    max={refund.originalAmount}
                    step="0.01"
                  />
                </div>
                <p className="text-[11px] mt-2" style={{ color: "var(--text-tertiary)" }}>
                  Maximum: ${refund.originalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          ) : null}

          {/* Admin Notes */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Admin Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this refund..."
              rows={4}
              className="w-full px-3 py-2 text-[13px] rounded-lg resize-none"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Actions */}
          {(refund.status === "requested" || refund.status === "under_review") && (
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "var(--success)",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                <CheckCircle size={14} />
                {customAmount === refund.originalAmount ? "Approve Full Refund" : "Approve Partial Refund"}
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "var(--error)",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                <XCircle size={14} />
                Reject Refund
              </button>
            </div>
          )}
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

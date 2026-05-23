import {
  X,
  CreditCard,
  User,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  RefreshCw,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface PaymentData {
  id: string;
  transactionId: string;
  bookingId: string;
  customer: string;
  vendor: string;
  bookingType: string;
  amount: number;
  platformCommission: number;
  vendorEarnings: number;
  paymentMethod: string;
  status: string;
  createdDate: string;
  paidDate?: string;
}

interface PaymentDetailDrawerProps {
  payment: PaymentData;
  onClose: () => void;
}

export function PaymentDetailDrawer({ payment, onClose }: PaymentDetailDrawerProps) {
  const StatusIcon = payment.status === "paid" ? CheckCircle : payment.status === "failed" ? XCircle : Clock;
  const statusColor = payment.status === "paid" ? "var(--success)" : payment.status === "failed" ? "var(--error)" : "var(--warning)";

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
              Payment Details
            </h2>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {payment.transactionId}
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
              background: payment.status === "paid" ? "rgba(34, 197, 94, 0.08)" : payment.status === "failed" ? "rgba(239, 68, 68, 0.08)" : "rgba(245, 158, 11, 0.08)",
              border: `1px solid ${payment.status === "paid" ? "rgba(34, 197, 94, 0.2)" : payment.status === "failed" ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)"}`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <StatusIcon size={20} style={{ color: statusColor }} />
              <h3 className="text-[14px] capitalize" style={{ color: statusColor, fontWeight: 600 }}>
                Payment {payment.status.replace("_", " ")}
              </h3>
            </div>
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              {payment.status === "paid" && `Payment successfully processed on ${payment.paidDate}`}
              {payment.status === "pending" && "Payment is being processed and will be confirmed shortly"}
              {payment.status === "failed" && "Payment failed. Customer may need to retry with different method"}
              {payment.status === "refunded" && "Payment has been fully refunded to customer"}
              {payment.status === "pay_later" && "Customer selected pay later option. Payment is pending"}
            </p>
          </div>

          {/* Transaction Info */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Transaction Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FileText size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Booking ID
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {payment.bookingId}
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
                    {payment.customer}
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
                    {payment.vendor}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Payment Method
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {payment.paymentMethod}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Created Date
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {payment.createdDate}
                  </p>
                </div>
              </div>
              {payment.paidDate && (
                <div className="flex items-start gap-3">
                  <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                  <div className="flex-1">
                    <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                      Paid Date
                    </p>
                    <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {payment.paidDate}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Financial Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  Total Amount
                </p>
                <p className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  ${payment.amount.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  Platform Commission ({((payment.platformCommission / payment.amount) * 100).toFixed(1)}%)
                </p>
                <p className="text-[14px]" style={{ color: "var(--warning)", fontWeight: 600 }}>
                  ${payment.platformCommission.toFixed(2)}
                </p>
              </div>
              <div
                className="pt-3"
                style={{ borderTop: "1px solid var(--border-light)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                    Vendor Earnings
                  </p>
                  <p className="text-[16px]" style={{ color: "var(--success)", fontWeight: 700 }}>
                    ${payment.vendorEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Actions
            </h3>
            <div className="space-y-2">
              <button
                className="w-full px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <Download size={14} />
                Download Invoice
              </button>
              {payment.status === "failed" && (
                <button
                  className="w-full px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "var(--warning)",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  <RefreshCw size={14} />
                  Retry Payment
                </button>
              )}
              {payment.status === "paid" && (
                <button
                  className="w-full px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "var(--error)",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  <RefreshCw size={14} />
                  Refund Payment
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
                <Mail size={14} />
                Contact Customer
              </button>
              <button
                className="w-full px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <MessageSquare size={14} />
                Add Internal Note
              </button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Payment Timeline
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
                  <div className="w-0.5 h-8 mt-1" style={{ background: "var(--border-light)" }} />
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-[13px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    Payment Created
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {payment.createdDate}
                  </p>
                </div>
              </div>
              {payment.paidDate && (
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
                      Payment Confirmed
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {payment.paidDate}
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

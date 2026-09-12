import { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  CreditCard,
  Building2,
  Car,
  CheckCircle,
  XCircle,
  RefreshCw,
  MessageSquare,
  FileText,
  AlertTriangle,
  Send,
  Edit2,
  Wallet,
  Navigation,
  Luggage,
  Loader2,
  Globe,
  Check,
} from "lucide-react";

interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface CartItem {
  listingId?: string;
  title: string;
  travelDate?: string;
  travelCount?: number;
  price: number;
  baseCurrency?: string;
}

interface Booking {
  id: string;
  _inquiryId?: string;
  _inquiryStatus?: string;
  customer: Customer;
  type: string;
  listing: string;
  vendor: string;
  travelDate: string;
  checkIn?: string;
  checkOut?: string;
  amount: number;
  bookingStatus: string;
  paymentStatus: string;
  createdAt: string;
  rawCreatedAt?: string;
  passengers?: number;
  duration?: string;
  specialRequests?: string;
  riskFlags?: string[];
  nationality?: string;
  cartItems?: CartItem[];
}

interface BookingDetailDrawerProps {
  booking: Booking;
  onClose: () => void;
  /** Called when admin selects a new inquiry status */
  onStatusUpdate?: (status: string) => void;
  /** True while a status update API call is in flight */
  isUpdating?: boolean;
}

export function BookingDetailDrawer({ booking, onClose, onStatusUpdate, isUpdating }: BookingDetailDrawerProps) {
  const isTransport = booking.type === "Transfer";

  // Internal Notes State & LocalStorage Persistence
  const storageKey = `booking_note_${booking.id}`;
  const [noteText, setNoteText] = useState<string>("");
  const [noteSavedMessage, setNoteSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setNoteText(saved);
    } else {
      setNoteText("");
    }
    setNoteSavedMessage(null);
  }, [booking.id, storageKey]);

  const handleSaveNote = () => {
    localStorage.setItem(storageKey, noteText);
    setNoteSavedMessage("✓ Internal note saved successfully!");
    setTimeout(() => {
      setNoteSavedMessage(null);
    }, 3000);
  };

  // Payment Preference Extraction
  const reqLower = (booking.specialRequests || "").toLowerCase();
  const isCardPayment = reqLower.includes("card") || reqLower.includes("online") || reqLower.includes("pay_now") || reqLower.includes("pay now");
  const isPayAtProperty = reqLower.includes("pay at property") || (!isCardPayment && booking.paymentStatus === "pay_at_property");
  
  // Refund Action State
  const [refundMessage, setRefundMessage] = useState<string | null>(null);

  const handleProcessRefund = () => {
    if (isPayAtProperty) {
      setRefundMessage("No refund applicable for 'Pay at Property' (Unpaid) bookings.");
    } else {
      setRefundMessage("Refund request submitted to payment gateway.");
    }
    setTimeout(() => setRefundMessage(null), 4000);
  };

  // Dynamic Timeline Generation based on actual creation date & inquiry status
  const getDynamicTimeline = () => {
    const events: Array<{ action: string; user?: string; timestamp: string; status: "completed" | "pending" | "cancelled" }> = [];
    
    // Parse creation timestamp
    let createdDt = new Date();
    if (booking.rawCreatedAt) {
      createdDt = new Date(booking.rawCreatedAt);
    } else if (booking.createdAt && !isNaN(Date.parse(booking.createdAt))) {
      createdDt = new Date(booking.createdAt);
    }

    const createdFormatted = createdDt.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const notifDt = new Date(createdDt.getTime() + 60000);
    const notifFormatted = notifDt.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // 1. Inquiry Created
    events.push({
      action: "Booking Inquiry Created",
      user: booking.customer.name || "Customer",
      timestamp: createdFormatted,
      status: "completed",
    });

    // 2. Vendor Notified
    events.push({
      action: "Vendor Notified of New Inquiry",
      user: "System",
      timestamp: notifFormatted,
      status: "completed",
    });

    // 3. Vendor Decision / Confirmation
    if (booking.bookingStatus === "confirmed" || booking.bookingStatus === "completed") {
      events.push({
        action: "Vendor Confirmed & Room Unit Allocated",
        user: booking.vendor !== "—" ? booking.vendor : "Property Vendor",
        timestamp: notifFormatted,
        status: "completed",
      });
      events.push({
        action: "Confirmation Email Sent to Customer",
        user: "System Email Provider",
        timestamp: notifFormatted,
        status: "completed",
      });
    } else if (booking.bookingStatus === "cancelled" || booking.bookingStatus === "rejected") {
      events.push({
        action: "Inquiry Cancelled / Declined",
        user: booking.vendor !== "—" ? booking.vendor : "Vendor",
        timestamp: notifFormatted,
        status: "cancelled",
      });
    } else {
      events.push({
        action: "Awaiting Vendor Acceptance & Confirmation",
        user: booking.vendor !== "—" ? booking.vendor : "Property Vendor",
        timestamp: "Pending Action",
        status: "pending",
      });
    }

    // 4. Upcoming Travel Date
    events.push({
      action: `Travel Check-In (${booking.travelDate || "Scheduled Date"})`,
      user: "Guest & Property Host",
      timestamp: booking.travelDate || "Upcoming",
      status: booking.bookingStatus === "completed" ? "completed" : "pending",
    });

    return events;
  };

  const dynamicTimeline = getDynamicTimeline();

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
        className="fixed right-0 top-0 h-full w-[680px] z-50 overflow-y-auto"
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
              Booking Details
            </h2>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {booking.id} • {booking.type}
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
          {/* Action Header for Status Update */}
          {onStatusUpdate && (
            <div
              className="rounded-xl p-4 flex items-center justify-between"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div>
                <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                  Manage Status
                </p>
                <span className="text-[13px] font-semibold text-slate-700 capitalize">
                  Current: {booking.bookingStatus}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={isUpdating}
                  onClick={() => onStatusUpdate("quoted")}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  Accept & Confirm
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => onStatusUpdate("cancelled")}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 disabled:opacity-50 transition"
                >
                  Decline / Cancel
                </button>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              <User size={16} style={{ color: "var(--accent-navy-light)" }} />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Name
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {booking.customer.name}
                </p>
              </div>
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Email
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {booking.customer.email}
                </p>
              </div>
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Phone
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {booking.customer.phone}
                </p>
              </div>
              {booking.nationality && (
                <div>
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Nationality
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {booking.nationality}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Information */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              <FileText size={16} style={{ color: "var(--accent-navy-light)" }} />
              Booking Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Listing / Property
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {booking.listing}
                </p>
              </div>
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Vendor / Operator
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {booking.vendor}
                </p>
              </div>
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Travel Date
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {booking.travelDate}
                </p>
              </div>
              {booking.passengers && (
                <div>
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Guests / Travelers
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {booking.passengers} person{booking.passengers > 1 ? "s" : ""}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Booking Status
                </p>
                <span
                  className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold capitalize"
                  style={{
                    background: booking.bookingStatus === "confirmed" || booking.bookingStatus === "completed"
                      ? "rgba(34, 197, 94, 0.1)"
                      : booking.bookingStatus === "cancelled"
                      ? "rgba(239, 68, 68, 0.1)"
                      : "rgba(245, 158, 11, 0.1)",
                    color: booking.bookingStatus === "confirmed" || booking.bookingStatus === "completed"
                      ? "#22c55e"
                      : booking.bookingStatus === "cancelled"
                      ? "#ef4444"
                      : "#f59e0b",
                  }}
                >
                  {booking.bookingStatus}
                </span>
              </div>
            </div>

            {/* Reserved Rooms Breakdown Card */}
            {booking.cartItems && booking.cartItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] uppercase font-bold text-slate-600 tracking-wider">
                    {booking.type === "Safari" ? "Reserved Safari Packages & Jeeps" : "Reserved Rooms & Unit Breakdown"}
                  </p>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#051f36] text-white">
                    {booking.type === "Safari"
                      ? `${booking.cartItems.reduce((sum, item) => sum + (item.travelCount || 1), 0)} Safari Jeep(s)`
                      : `${booking.cartItems.reduce((sum, item) => sum + (item.travelCount || 1), 0)} Room(s) Reserved`}
                  </span>
                </div>
                <div className="space-y-2">
                  {booking.cartItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                            {item.travelCount || 1}x Unit{(item.travelCount || 1) !== 1 ? "s" : ""}
                          </span>
                          {item.title}
                        </div>
                        <p className="text-slate-500 text-[11px] mt-1">
                          Travel Date: {item.travelDate || booking.travelDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 text-sm">${item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {booking.specialRequests && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Special Requests / Payment Preference
                </p>
                <p className="text-[12px] font-medium text-slate-700">
                  {booking.specialRequests}
                </p>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              <Wallet size={16} style={{ color: "#10b981" }} />
              Payment Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  Booking Total Amount
                </span>
                <span className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                  ${booking.amount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  Payment Method
                </span>
                <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded border ${
                  isCardPayment
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {isCardPayment ? "💳 Credit / Debit Card (Online Payment)" : "🏨 Pay at Property (Check-in)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  Payment Status
                </span>
                <span
                  className="text-[11px] px-2.5 py-1 rounded font-semibold capitalize"
                  style={
                    !isPayAtProperty && booking.paymentStatus === "paid"
                      ? { background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }
                      : { background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }
                  }
                >
                  {isPayAtProperty ? "Unpaid (Pay upon arrival)" : booking.paymentStatus.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
                <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  Platform Fee (15%)
                </span>
                <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  ${(booking.amount * 0.15).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  Vendor Payout
                </span>
                <span className="text-[13px]" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                  ${(booking.amount * 0.85).toFixed(2)}
                </span>
              </div>
            </div>

            {refundMessage && (
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                {refundMessage}
              </p>
            )}

            <button
              onClick={handleProcessRefund}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[12px] transition-all hover:bg-slate-100 active:scale-[0.99]"
              style={{
                background: "var(--input-background)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-light)",
                fontWeight: 500,
              }}
            >
              <RefreshCw size={14} />
              Process Refund
            </button>
          </div>

          {/* Live Activity Timeline */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              <Clock size={16} style={{ color: "var(--accent-navy-light)" }} />
              Activity Timeline
            </h3>
            <div className="space-y-4">
              {dynamicTimeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${event.status === "completed" ? "" : "animate-pulse"}`}
                      style={{
                        background: event.status === "completed" ? "#22c55e" : event.status === "cancelled" ? "#ef4444" : "#f59e0b",
                        boxShadow: event.status === "completed" ? "0 0 6px #22c55e" : "0 0 6px #f59e0b",
                      }}
                    />
                    {i < dynamicTimeline.length - 1 && (
                      <div
                        className="w-0.5 h-8 mt-1"
                        style={{ background: event.status === "completed" ? "#22c55e40" : "var(--border-light)" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-[12px] mb-0.5 font-bold" style={{ color: "var(--text-primary)" }}>
                      {event.action}
                    </p>
                    {event.user && (
                      <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                        by {event.user}
                      </p>
                    )}
                    <p className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                      {event.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Internal Notes */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              <MessageSquare size={16} style={{ color: "var(--accent-navy-light)" }} />
              Internal Notes
            </h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add internal notes about this booking..."
              className="w-full px-3 py-2.5 rounded-lg text-[12px] resize-none outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
                minHeight: "90px",
              }}
            />
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={handleSaveNote}
                className="text-[11px] px-4 py-2 rounded-lg transition-all font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 flex items-center gap-1.5"
              >
                <Check size={13} /> Save Note
              </button>
              {noteSavedMessage && (
                <span className="text-xs font-semibold text-emerald-600">
                  {noteSavedMessage}
                </span>
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

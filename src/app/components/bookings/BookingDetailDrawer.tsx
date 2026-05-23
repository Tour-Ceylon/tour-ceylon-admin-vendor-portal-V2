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
} from "lucide-react";

interface Customer {
  name: string;
  email: string;
  phone: string;
}

interface Booking {
  id: string;
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
  passengers?: number;
  duration?: string;
  specialRequests?: string;
  riskFlags?: string[];
}

interface BookingDetailDrawerProps {
  booking: Booking;
  onClose: () => void;
}

// Timeline data
const SAMPLE_TIMELINE = [
  {
    action: "Booking created",
    user: "Customer",
    timestamp: "May 19, 2026 10:30 AM",
    status: "completed",
  },
  {
    action: "Payment received",
    user: "System",
    timestamp: "May 19, 2026 10:32 AM",
    status: "completed",
  },
  {
    action: "Vendor notified",
    user: "System",
    timestamp: "May 19, 2026 10:33 AM",
    status: "completed",
  },
  {
    action: "Vendor confirmed",
    user: "Jetwing Hotels",
    timestamp: "May 19, 2026 11:15 AM",
    status: "completed",
  },
  {
    action: "Confirmation sent to customer",
    user: "System",
    timestamp: "May 19, 2026 11:16 AM",
    status: "completed",
  },
  {
    action: "Awaiting travel date",
    user: "",
    timestamp: "Jun 15, 2026",
    status: "pending",
  },
];

// Transport-specific sample data
const TRANSPORT_DETAILS = {
  pickup: "Bandaranaike International Airport (CMB)",
  pickupTime: "2:30 PM",
  destination: "Galle Fort Hotel, Galle",
  distance: "128 km",
  duration: "2.5 hours",
  vehicle: "Toyota Hiace - White",
  driver: {
    name: "Rohan Silva",
    phone: "+94 77 123 4567",
    rating: 4.8,
  },
  passengers: 2,
  luggage: "2 large bags",
  route: "Southern Expressway (E01)",
};

export function BookingDetailDrawer({ booking, onClose }: BookingDetailDrawerProps) {
  const isTransport = booking.type === "Transfer";

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
          {/* Risk Alerts */}
          {booking.riskFlags && booking.riskFlags.length > 0 && (
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} style={{ color: "#ef4444" }} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] mb-1" style={{ color: "#f87171", fontWeight: 600 }}>
                    Risk Alerts
                  </p>
                  <ul className="space-y-1">
                    {booking.riskFlags.map((flag, i) => (
                      <li key={i} className="text-[12px]" style={{ color: "#f87171" }}>
                        • {flag.replace(/_/g, " ")}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[12px] transition-all"
              style={{
                background: "rgba(34, 197, 94, 0.1)",
                color: "#4ade80",
                border: "1px solid rgba(34,197,94,0.3)",
                fontWeight: 500,
              }}
            >
              <CheckCircle size={14} />
              Confirm Booking
            </button>
            <button
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[12px] transition-all"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#f87171",
                border: "1px solid rgba(239,68,68,0.3)",
                fontWeight: 500,
              }}
            >
              <XCircle size={14} />
              Cancel Booking
            </button>
            <button
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[12px] transition-all"
              style={{
                background: "var(--active-overlay)",
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
                fontWeight: 500,
              }}
            >
              <Send size={14} />
              Contact Customer
            </button>
            <button
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[12px] transition-all"
              style={{
                background: "var(--input-background)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-light)",
                fontWeight: 500,
              }}
            >
              <MessageSquare size={14} />
              Contact Vendor
            </button>
          </div>

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
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Name
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {booking.customer.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Email
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {booking.customer.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Phone
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {booking.customer.phone}
                  </p>
                </div>
              </div>
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
                  Listing / Package
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {booking.listing}
                </p>
              </div>
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Vendor
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
              {booking.duration && (
                <div>
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Duration
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {booking.duration}
                  </p>
                </div>
              )}
              {booking.passengers && (
                <div>
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Passengers
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
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {booking.bookingStatus}
                </p>
              </div>
            </div>
            {booking.specialRequests && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Special Requests
                </p>
                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  {booking.specialRequests}
                </p>
              </div>
            )}
          </div>

          {/* Transport-Specific Details */}
          {isTransport && (
            <div
              className="rounded-xl p-5"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <h3 className="text-[14px] mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                <Car size={16} style={{ color: "#8b5cf6" }} />
                Transport Details
              </h3>
              <div className="space-y-4">
                {/* Route */}
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: "#22c55e", boxShadow: "0 0 8px #22c55e" }}
                      />
                      <div className="w-0.5 h-8" style={{ background: "var(--border-medium)" }} />
                      <MapPin size={12} style={{ color: "#ef4444" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                        Pickup
                      </p>
                      <p className="text-[13px] mb-3" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {TRANSPORT_DETAILS.pickup}
                      </p>
                      <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                        Destination
                      </p>
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {TRANSPORT_DETAILS.destination}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
                    <div>
                      <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                        Distance
                      </p>
                      <p className="text-[12px]" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                        {TRANSPORT_DETAILS.distance}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                        Duration
                      </p>
                      <p className="text-[12px]" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                        {TRANSPORT_DETAILS.duration}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                        Pickup Time
                      </p>
                      <p className="text-[12px]" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                        {TRANSPORT_DETAILS.pickupTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Driver Assignment */}
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: "rgba(139, 92, 246, 0.08)",
                    border: "1px solid rgba(139,92,246,0.25)",
                  }}
                >
                  <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>
                    Assigned Driver
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {TRANSPORT_DETAILS.driver.name}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                        {TRANSPORT_DETAILS.driver.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[12px]" style={{ color: "#fbbf24", fontWeight: 600 }}>
                        {TRANSPORT_DETAILS.driver.rating}
                      </span>
                      <span className="text-[16px]" style={{ color: "#fbbf24" }}>★</span>
                    </div>
                  </div>
                  <button
                    className="w-full mt-3 text-[11px] px-3 py-2 rounded-lg transition-all"
                    style={{
                      background: "rgba(139, 92, 246, 0.1)",
                      color: "#a78bfa",
                      border: "1px solid rgba(139,92,246,0.3)",
                      fontWeight: 500,
                    }}
                  >
                    Change Driver
                  </button>
                </div>

                {/* Vehicle & Passengers */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                      Vehicle
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {TRANSPORT_DETAILS.vehicle}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                      Luggage
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {TRANSPORT_DETAILS.luggage}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  Booking Amount
                </span>
                <span className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                  ${booking.amount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  Payment Status
                </span>
                <span
                  className="text-[11px] px-2.5 py-1 rounded"
                  style={
                    booking.paymentStatus === "paid"
                      ? { background: "rgba(34, 197, 94, 0.1)", color: "#4ade80" }
                      : { background: "rgba(245, 158, 11, 0.1)", color: "#fbbf24" }
                  }
                >
                  {booking.paymentStatus.replace("_", " ")}
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
            <button
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[12px] transition-all"
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

          {/* Booking Timeline */}
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
              {SAMPLE_TIMELINE.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-2 h-2 rounded-full ${event.status === "completed" ? "" : "animate-pulse"}`}
                      style={{
                        background: event.status === "completed" ? "#22c55e" : "#f59e0b",
                        boxShadow: event.status === "completed" ? "0 0 6px #22c55e" : "0 0 6px #f59e0b",
                      }}
                    />
                    {i < SAMPLE_TIMELINE.length - 1 && (
                      <div
                        className="w-0.5 h-8 mt-1"
                        style={{ background: event.status === "completed" ? "#22c55e40" : "var(--border-light)" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-[12px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {event.action}
                    </p>
                    {event.user && (
                      <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                        by {event.user}
                      </p>
                    )}
                    <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                      {event.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Notes */}
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
              placeholder="Add internal notes about this booking..."
              className="w-full px-3 py-2.5 rounded-lg text-[12px] resize-none outline-none"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
                minHeight: "80px",
              }}
            />
            <button
              className="mt-3 text-[11px] px-4 py-2 rounded-lg transition-all"
              style={{
                background: "var(--active-overlay)",
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
                fontWeight: 500,
              }}
            >
              Save Note
            </button>
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

import {
  X,
  User,
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  Car,
  DollarSign,
  CheckCircle,
  XCircle,
  Mail,
  MessageSquare,
  Navigation,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

interface TransferRequestData {
  id: string;
  bookingId: string;
  customer: string;
  customerEmail: string;
  pickup: string;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  luggage: number;
  vehicleCategory: string;
  estimatedFare: number;
  distance: number;
  duration: string;
  bookingStatus: string;
  paymentStatus: string;
  createdDate: string;
  notes?: string;
}

interface TransferRequestDrawerProps {
  request: TransferRequestData;
  onClose: () => void;
}

export function TransferRequestDrawer({ request, onClose }: TransferRequestDrawerProps) {
  const [customFare, setCustomFare] = useState(request.estimatedFare);
  const [internalNotes, setInternalNotes] = useState(request.notes || "");

  const handleConfirm = () => {
    console.log("Confirming request:", request.bookingId);
    onClose();
  };

  const handleReject = () => {
    console.log("Rejecting request:", request.bookingId);
    onClose();
  };

  // Calculate pricing breakdown
  const baseFare = Math.round(customFare * 0.4);
  const distanceFare = Math.round(customFare * 0.5);
  const surcharges = customFare - baseFare - distanceFare;

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
        className="fixed right-0 top-0 h-full w-[750px] z-50 overflow-y-auto"
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
              Transfer Request Details
            </h2>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {request.bookingId}
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
          {/* Customer Details */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Customer Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Customer Name
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {request.customer}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Email Address
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {request.customerEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Route Details
            </h3>
            <div className="space-y-4">
              {/* Pickup */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: "var(--success)", boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.2)" }}
                  />
                  <div className="w-0.5 h-12 mt-1" style={{ background: "var(--border-light)" }} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Pickup Location
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {request.pickup}
                  </p>
                </div>
              </div>

              {/* Destination */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: "var(--error)", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Destination
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {request.destination}
                  </p>
                </div>
              </div>

              {/* Distance & Duration */}
              <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation size={12} style={{ color: "var(--text-tertiary)" }} />
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      Distance
                    </p>
                  </div>
                  <p className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {request.distance} km
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={12} style={{ color: "var(--text-tertiary)" }} />
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      Duration
                    </p>
                  </div>
                  <p className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {request.duration}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Details */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Travel Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Pickup Date
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {request.pickupDate}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Pickup Time
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {request.pickupTime}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Passengers
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {request.passengers} persons
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                <div className="flex-1">
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Luggage
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {request.luggage} pieces
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Category */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <div className="flex items-center gap-3">
              <Car size={18} style={{ color: "#3b82f6" }} />
              <div>
                <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                  Selected Vehicle Category
                </p>
                <p className="text-[14px]" style={{ color: "#3b82f6", fontWeight: 600 }}>
                  {request.vehicleCategory}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Pricing Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  Base Fare
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                  LKR {baseFare.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  Distance Fare ({request.distance} km)
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                  LKR {distanceFare.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  Surcharges
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                  LKR {surcharges.toLocaleString()}
                </p>
              </div>
              <div
                className="pt-3"
                style={{ borderTop: "1px solid var(--border-light)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                    Estimated Total Fare
                  </p>
                  <p className="text-[18px]" style={{ color: "var(--success)", fontWeight: 700 }}>
                    LKR {customFare.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Fare Input */}
            <div className="mt-4">
              <label className="text-[11px] mb-2 block" style={{ color: "var(--text-tertiary)" }}>
                Modify Fare (if needed)
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
                  value={customFare}
                  onChange={(e) => setCustomFare(Number(e.target.value))}
                  className="flex-1 bg-transparent text-[13px] outline-none"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
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
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Internal Notes
            </h3>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add operational notes for this transfer..."
              rows={4}
              className="w-full px-3 py-2 text-[13px] rounded-lg resize-none"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Admin Actions */}
          {request.bookingStatus === "pending" && (
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "var(--success)",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                <CheckCircle size={14} />
                Confirm Transfer
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
                Reject Request
              </button>
            </div>
          )}

          {/* Additional Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              className="px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
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
              className="px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            >
              <MessageSquare size={14} />
              Add Note
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

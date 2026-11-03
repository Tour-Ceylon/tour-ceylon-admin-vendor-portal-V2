import { useState, useEffect, useMemo } from "react";
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
import { DriverAssignmentSection } from "../transport/DriverAssignmentSection";
import { formatMoney } from "../../lib/money";
import type { BookingRow } from "../../types/booking";
import { AssignmentSection } from "./AssignmentSection";
import { getInternalNotes, getPlatformFeePercent, saveInternalNotes } from "../api/adminOpsApi";
import { useToast } from "../shared/Toast";

interface Customer {
  name: string;
  email: string;
  phone: string;
}



type Booking = BookingRow;

interface BookingDetailDrawerProps {
  booking: Booking;
  onClose: () => void;
  /** Called when admin selects a new inquiry status */
  onStatusUpdate?: (status: string) => void;
  /** True while a status update API call is in flight */
  isUpdating?: boolean;
  /** Email the guest a secure pay link (approved, unpaid stays only) */
  onSendPaymentLink?: () => void;
}


type InquiryActionTone = "primary" | "neutral" | "danger";

interface InquiryAction {
  status: string;
  label: string;
  tone: InquiryActionTone;
  hint: string;
  confirm?: string;
}

const ACTION_STYLES: Record<InquiryActionTone, string> = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700",
  neutral: "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200",
  danger: "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold",
};

const INQUIRY_STATUS_LABELS: Record<string, string> = {
  pending_contact: "Pending contact",
  contacted: "Contacted",
  quoted: "Quoted / Accepted",
  converted_to_booking: "Converted to booking",
  cancelled: "Cancelled",
};

/**
 * The moves an inquiry can make from each status. Mirrors ALLOWED_INQUIRY_TRANSITIONS on the
 * server, which is the real gatekeeper; this only decides which buttons to show.
 */
function getInquiryActions(rawStatus: string | undefined, isStay: boolean): InquiryAction[] {
  const contacted: InquiryAction = {
    status: "contacted", label: "Mark contacted", tone: "neutral",
    hint: "You have been in touch with the guest",
  };
  const quoted: InquiryAction = {
    status: "quoted", tone: "primary",
    label: isStay ? "Accept & send payment link" : "Accept & Confirm",
    hint: "Approve the request and notify the guest",
  };
  const converted: InquiryAction = {
    status: "converted_to_booking", label: "Convert to booking", tone: "primary",
    hint: "Creates the booking and reserves availability",
    confirm: "Convert this request into a confirmed booking? This reserves availability.",
  };
  const cancel = (label: string): InquiryAction => ({
    status: "cancelled", label, tone: "danger",
    hint: "Releases any held rooms or capacity and notifies the guest",
    confirm: "Cancel this request? Held rooms or capacity are released and the guest is notified. This cannot be undone.",
  });

  switch (rawStatus) {
    case "pending_contact": return [contacted, quoted, converted, cancel("Decline / Cancel")];
    case "contacted": return [quoted, converted, cancel("Decline / Cancel")];
    case "quoted": return [converted, cancel("Decline / Cancel")];
    case "converted_to_booking": return [cancel("Cancel booking")];
    default: return [];
  }
}

export function BookingDetailDrawer({ booking, onClose, onStatusUpdate, isUpdating, onSendPaymentLink }: BookingDetailDrawerProps) {
  const isTransport = booking.type === "Transfer";
  const isStay = booking.type === "Stay";
  const isPaidOnline = booking.paymentStatus === "paid";
  // Approved stays that are not paid yet can be sent (or re-sent) a payment link
  const canSendPaymentLink =
    isStay &&
    !isPaidOnline &&
    (booking._inquiryStatus === "quoted" || booking._inquiryStatus === "converted_to_booking");

  const statusActions = getInquiryActions(booking._inquiryStatus, isStay);
  const inquiryStatusLabel = INQUIRY_STATUS_LABELS[booking._inquiryStatus ?? ""] ?? booking.bookingStatus;

  const transportDetails = useMemo(() => {
    const raw = booking as any;
    const listingParts = (booking.listing || "").includes(" to ")
      ? booking.listing.split(" to ")
      : (booking.listing || "").includes(" - ")
        ? booking.listing.split(" - ")
        : [raw.pickupLocation || raw.pickup || "Airport / Hub", raw.dropoffLocation || raw.destination || "Destination"];

    return {
      pickup: raw.pickupLocation || raw.pickup || listingParts[0]?.trim() || "Colombo International Airport (CMB)",
      destination: raw.dropoffLocation || raw.destination || listingParts[1]?.trim() || booking.listing || "Hotel / Resort",
      distance: raw.distance ? `${raw.distance} km` : "Standard Route",
      duration: booking.duration || raw.duration || "Approx. 2-3 hrs",
      pickupTime: raw.pickupTime || raw.travelDate || booking.travelDate || "As scheduled",
      vehicle: raw.vehicleName || raw.vehicleCategory || raw.vehicle || "Sedan / Van",
      luggage: raw.luggage || (booking.passengers ? `${booking.passengers} standard bags` : "2 Bags"),
    };
  }, [booking]);

  // UI-11: internal notes are stored on the server, so every staff member sees the same note.
  const toast = useToast();
  const inquiryId = booking._inquiryId;
  const legacyKey = `booking_note_${booking.id}`;
  const [noteText, setNoteText] = useState<string>("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSavedMessage, setNoteSavedMessage] = useState<string | null>(null);
  const [legacyNote, setLegacyNote] = useState(false);

  useEffect(() => {
    setNoteSavedMessage(null);
    setLegacyNote(false);
    if (!inquiryId) {
      setNoteText("");
      return;
    }
    let cancelled = false;
    setNotesLoading(true);
    getInternalNotes(inquiryId)
      .then((result) => {
        if (cancelled) return;
        // Notes used to live in this browser only. If the server has none, offer the old one for saving.
        const old = localStorage.getItem(legacyKey);
        if (!result.notes && old) {
          setNoteText(old);
          setLegacyNote(true);
        } else {
          setNoteText(result.notes);
        }
      })
      .catch((err) => {
        if (!cancelled) toast.error("Could not load the internal note", err instanceof Error ? err.message : "Please try again.");
      })
      .finally(() => {
        if (!cancelled) setNotesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [inquiryId, legacyKey]);

  const handleSaveNote = async () => {
    if (!inquiryId) return;
    setNoteSaving(true);
    try {
      const saved = await saveInternalNotes(inquiryId, noteText);
      setNoteText(saved.notes);
      localStorage.removeItem(legacyKey);
      setLegacyNote(false);
      setNoteSavedMessage("✓ Note saved");
      setTimeout(() => setNoteSavedMessage(null), 3000);
    } catch (err) {
      toast.error("The note was not saved", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setNoteSaving(false);
    }
  };

  // UI-11: the platform fee comes from admin settings. It used to be a hardcoded 15%.
  const [feePercent, setFeePercent] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    getPlatformFeePercent()
      .then((value) => {
        if (!cancelled && Number.isFinite(value)) setFeePercent(value);
      })
      .catch(() => {
        /* only admins can read settings; for anyone else the fee row says "not available" */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Payment preference: the paymentMethod field; older inquiries only have it as text in specialRequests.
  const reqLower = (booking.specialRequests || "").toLowerCase();
  const method =
    booking.paymentMethod ??
    (reqLower.includes("bank transfer") ? "bank_transfer"
      : reqLower.includes("pay at property") ? "pay_at_property"
      : reqLower.includes("card") || reqLower.includes("online") || reqLower.includes("pay now") ? "online"
      : null);
  const isBankTransfer = !isPaidOnline && method === "bank_transfer";
  const isCardPayment = isPaidOnline || method === "online";
  const isPayAtProperty = !isPaidOnline && method === "pay_at_property";

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
        user: booking.vendor !== "—" ? `${booking.vendor}${booking.vendorEmail ? ` (${booking.vendorEmail})` : ''}` : "Property Vendor",
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
        user: booking.vendor !== "—" ? `${booking.vendor}${booking.vendorEmail ? ` (${booking.vendorEmail})` : ''}` : "Vendor",
        timestamp: notifFormatted,
        status: "cancelled",
      });
    } else {
      events.push({
        action: "Awaiting Vendor Acceptance & Confirmation",
        user: booking.vendor !== "—" ? `${booking.vendor}${booking.vendorEmail ? ` (${booking.vendorEmail})` : ''}` : "Property Vendor",
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
        className="fixed right-0 top-0 h-full w-full max-w-[680px] z-50 overflow-y-auto"
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
          {/* Action Header for Status Update (FEAT-1: full inquiry lifecycle, same rules as the server) */}
          {onStatusUpdate && (
            <div
              className="rounded-xl p-4"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Manage Status
                  </p>
                  <span className="text-[13px] font-semibold text-slate-700 capitalize">
                    Current: {inquiryStatusLabel}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {statusActions.map((action) => (
                    <button
                      key={action.status}
                      disabled={isUpdating}
                      onClick={() => {
                        if (action.confirm && !window.confirm(action.confirm)) return;
                        onStatusUpdate(action.status);
                      }}
                      title={action.hint}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 transition ${ACTION_STYLES[action.tone]}`}
                    >
                      {action.label}
                    </button>
                  ))}
                  {canSendPaymentLink && onSendPaymentLink && (
                    <button
                      disabled={isUpdating}
                      onClick={onSendPaymentLink}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 disabled:opacity-50 transition"
                      title="Email the guest a new secure link to pay for this stay"
                    >
                      Send payment link
                    </button>
                  )}
                  {statusActions.length === 0 && (
                    <span className="text-xs text-slate-500">This request is closed. No further changes are possible.</span>
                  )}
                </div>
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
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {booking.vendor}
                </p>
                {booking.vendorEmail && (
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-blue-600 font-medium">
                      {booking.vendorEmail}
                    </span>
                    {booking.vendorRole && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-slate-100 text-slate-700 border border-slate-300">
                        {booking.vendorRole}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  {booking.type === "Stay" ? "Check-In / Out Dates" : "Travel Date"}
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {booking.travelDate}
                </p>
                {booking.checkIn && booking.checkOut && (
                  <p className="text-[11px] mt-0.5 text-emerald-600 font-semibold">
                    In: {booking.checkIn.includes("T") ? booking.checkIn.split("T")[0] : booking.checkIn} | Out: {booking.checkOut.includes("T") ? booking.checkOut.split("T")[0] : booking.checkOut}
                  </p>
                )}
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
                <div className="space-y-3">
                  {booking.cartItems.map((item, idx) => {
                    const cleanDate = (item.travelDate || booking.travelDate || "").replace(/T00:00:00/g, "").replace(/T09:00:00/g, "");
                    const hasRooms = item.selectedRooms && item.selectedRooms.length > 0;
                    return (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                              {item.travelCount || 1}x {booking.type === "Stay" ? "Room Unit" : "Unit"}{(item.travelCount || 1) !== 1 ? "s" : ""}
                            </span>
                            {item.title}
                          </div>
                          <span className="font-extrabold text-slate-900 text-sm">{formatMoney(item.price, item.baseCurrency || booking.currency)}</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          Travel Date: {cleanDate}
                        </p>
                        {hasRooms && (
                          <div className="space-y-1.5 mt-2.5 pt-2 border-t border-slate-200/80">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Allocated Room Breakdown</p>
                            {item.selectedRooms!.map((sr, sIdx) => (
                              <div key={sIdx} className="flex items-center justify-between pl-2.5 border-l-2 border-emerald-500 py-1 text-xs bg-white rounded-r-lg px-2 shadow-xs">
                                <div className="flex items-center gap-2">
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">{sr.qty}x</span>
                                  <span className="font-bold text-slate-800">{sr.roomName || "Room"}</span>
                                </div>
                                {sr.price !== undefined && sr.price > 0 && (
                                  <span className="text-slate-600 font-semibold text-[11px]">{formatMoney(sr.price, item.baseCurrency || booking.currency)}/night</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(booking.cartItems || []).filter((item) => item.dateChange).map((item, index) => {
              const change = item.dateChange!;
              const fmt = (value?: string) => {
                if (!value) return "—";
                const parsed = new Date(value);
                return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
              };
              return (
                <div
                  key={`date-change-${index}`}
                  className="mt-4 rounded-lg p-3"
                  style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
                >
                  <p className="text-[11px] mb-1" style={{ color: "#b45309", fontWeight: 600 }}>
                    Dates changed by {change.changed_by_role?.toLowerCase() === "admin" ? "admin" : "vendor"}
                    {change.changed_by ? ` (${change.changed_by})` : ""}
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--text-primary)" }}>
                    Originally requested: {fmt(change.original_check_in)} to {fmt(change.original_check_out)}
                  </p>
                  {change.note && (
                    <p className="text-[12px] mt-1" style={{ color: "var(--text-secondary)" }}>
                      Note: {change.note}
                    </p>
                  )}
                </div>
              );
            })}

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
                        {transportDetails.pickup}
                      </p>
                      <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                        Destination
                      </p>
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {transportDetails.destination}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
                    <div>
                      <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                        Distance
                      </p>
                      <p className="text-[12px]" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                        {transportDetails.distance}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                        Duration
                      </p>
                      <p className="text-[12px]" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                        {transportDetails.duration}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                        Pickup Time
                      </p>
                      <p className="text-[12px]" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                        {transportDetails.pickupTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Driver Assignment Section */}
                <DriverAssignmentSection
                  bookingId={booking._inquiryId || booking.id}
                  assignmentStatus="unassigned"
                />

                {/* Vehicle & Passengers */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                      Vehicle
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {transportDetails.vehicle}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                      Luggage
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {transportDetails.luggage}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FEAT-2: guide / driver for tours, safaris and experiences (transfers have their own dispatch) */}
          {booking._inquiryId && ["Tour", "Safari", "Experience"].includes(booking.type) && (
            <AssignmentSection inquiryId={booking._inquiryId} inquiryStatus={booking._inquiryStatus} />
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
                  Booking Total Amount
                </span>
                <span className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                  {formatMoney(booking.amount, booking.currency)}
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
                  {isPaidOnline ? "💳 Paid online (PayHere)" : isCardPayment ? "💳 Credit / Debit Card (Online Payment)" : isBankTransfer ? "🏦 Bank transfer" : isPayAtProperty ? "🏨 Pay at Property (Check-in)" : "Not specified"}
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
                  {isPayAtProperty ? "Unpaid (Pay upon arrival)" : isBankTransfer && booking.paymentStatus !== "paid" ? "Awaiting bank transfer" : booking.paymentStatus.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
                <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  {feePercent === null ? "Platform Fee" : `Platform Fee (${feePercent}%)`}
                </span>
                <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  {feePercent === null ? "Not available" : formatMoney((booking.amount * feePercent) / 100, booking.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  Vendor Payout
                </span>
                <span className="text-[13px]" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                  {feePercent === null ? "Not available" : formatMoney(booking.amount - (booking.amount * feePercent) / 100, booking.currency)}
                </span>
              </div>
            </div>

            {/* Refund button removed (UI-7): no refund endpoint exists yet, so it only faked success. */}
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
              disabled={!inquiryId || notesLoading}
              placeholder={inquiryId ? "Add internal notes about this booking..." : "Notes are not available for this record"}
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
                disabled={!inquiryId || noteSaving || notesLoading}
                className="text-[11px] px-4 py-2 rounded-lg transition-all font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check size={13} /> {noteSaving ? "Saving…" : "Save Note"}
              </button>
              {legacyNote && (
                <span className="text-xs font-semibold text-amber-600">
                  A note saved only in this browser was found. Press Save to keep it on the server.
                </span>
              )}
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

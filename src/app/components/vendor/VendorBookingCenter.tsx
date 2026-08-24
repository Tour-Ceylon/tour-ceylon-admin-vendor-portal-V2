import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  User,
  MapPin,
  MessageSquare,
  FileText,
  Eye,
  Filter,
  Search,
  Download,
  ArrowUpDown,
  RefreshCw,
  Mail,
  Loader2,
} from "lucide-react";
import { ContextualActions } from "../common/QuickActions";
import { useToast } from "../common/ToastNotification";
import {
  vendorListBookingInquiries,
  vendorUpdateInquiryStatus,
  inferBookingType,
  type AdminBookingInquiryItem,
  type InquiryStatus,
} from "../api/bookingInquiriesApi";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
type PaymentStatus = "pending" | "paid" | "refunded";

interface Booking {
  id: string;
  bookingRef: string;
  customer: string;
  customerEmail: string;
  listing: string;
  listingType: string;
  travelDate: string;
  checkIn?: string;
  checkOut?: string;
  guests: number;
  amount: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  createdAt: string;
  notes?: string;
}

// Map an inquiry to the local Booking shape used by this vendor UI
function inquiryToVendorBooking(inq: AdminBookingInquiryItem): Booking {
  const firstItem = inq.cartItems?.[0];
  const travelDate = firstItem?.travelDate
    ? new Date(firstItem.travelDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "TBD";
  const status: BookingStatus =
    inq.status === "new" || inq.status === "contacted"
      ? "pending"
      : inq.status === "quoted"
      ? "confirmed"
      : inq.status === "converted_to_booking"
      ? "completed"
      : "cancelled";

  return {
    id: inq.id,
    bookingRef: inq.reference || inq.id,
    customer: `${inq.firstName} ${inq.lastName}`,
    customerEmail: inq.email,
    listing: firstItem?.title || "—",
    listingType: inferBookingType(inq.cartItems),
    travelDate,
    guests: inq.numberOfTravelers,
    amount: inq.total ? `$${inq.total.toFixed(0)}` : "TBD",
    paymentStatus: "pending" as PaymentStatus,
    bookingStatus: status,
    createdAt: new Date(inq.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    notes: inq.specialRequests,
  };
}

export function VendorBookingCenter() {
  const { addToast } = useToast();
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Live data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await vendorListBookingInquiries({ perPage: 100 });
      setBookings(response.items.map(inquiryToVendorBooking));
    } catch (err: any) {
      console.error("Failed to load vendor booking inquiries:", err);
      setFetchError(err?.message || "Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const handleVendorStatusUpdate = async (bookingId: string, newStatus: InquiryStatus) => {
    setUpdatingId(bookingId);
    try {
      await vendorUpdateInquiryStatus(bookingId, newStatus);
      await fetchInquiries();
      addToast({
        type: "success",
        title: "Status updated",
        message: `Inquiry marked as ${newStatus.replace(/_/g, " ")}`,
        duration: 3000,
      });
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Update failed",
        message: err?.message || "Could not update status",
        duration: 4000,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = [
    { label: "Pending Requests", value: String(bookings.filter(b => b.bookingStatus === "pending").length), color: "#f59e0b", icon: Clock },
    { label: "Confirmed",        value: String(bookings.filter(b => b.bookingStatus === "confirmed").length), color: "#3b82f6", icon: CheckCircle },
    { label: "Completed",        value: String(bookings.filter(b => b.bookingStatus === "completed").length), color: "#22c55e", icon: CheckCircle },
    { label: "Total Inquiries",  value: String(bookings.length),                                              color: "#10b981", icon: DollarSign },
  ];


  const getBookingStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return { bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" };
      case "confirmed":
        return { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" };
      case "completed":
        return { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.3)" };
      case "cancelled":
        return { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.3)" };
    }
  };

  const getPaymentStatusStyle = (status: PaymentStatus) => {
    switch (status) {
      case "pending":
        return { bg: "rgba(245,158,11,0.1)", color: "#fbbf24" };
      case "paid":
        return { bg: "rgba(34,197,94,0.1)", color: "#4ade80" };
      case "refunded":
        return { bg: "rgba(239,68,68,0.1)", color: "#f87171" };
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter !== "all" && booking.bookingStatus !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.bookingRef.toLowerCase().includes(query) ||
        booking.customer.toLowerCase().includes(query) ||
        booking.listing.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Booking Center
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Manage your bookings, requests, and customer interactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-[22px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {stat.value}
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <input
              type="text"
              placeholder="Search by booking ID, customer, or listing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-[13px]"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as BookingStatus | "all")}
                className="px-4 py-2 rounded-lg text-[12px] capitalize transition-all"
                style={
                  filter === status
                    ? {
                        background: "var(--active-overlay)",
                        color: "var(--accent-navy-light)",
                        border: "1px solid var(--border-accent)",
                        fontWeight: 500,
                      }
                    : {
                        background: "var(--input-background)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-light)",
                      }
                }
              >
                {status}
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            className="px-4 py-2 rounded-lg text-[12px] flex items-center gap-2"
            style={{
              background: "var(--input-background)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
              fontWeight: 500,
            }}
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 1000 }}>
            <thead>
              <tr style={{ background: "var(--input-background)" }}>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                      Booking ID
                    </span>
                    <ArrowUpDown size={12} style={{ color: "var(--text-tertiary)" }} />
                  </div>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Customer
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Listing
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Travel Date
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Amount
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Payment
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Status
                  </span>
                </th>
                <th className="px-5 py-3 text-right" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking, index) => (
                <tr
                  key={booking.id}
                  className="group cursor-pointer transition-all"
                  style={{ borderBottom: index < filteredBookings.length - 1 ? "1px solid var(--border-light)" : "none" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <td className="px-5 py-4">
                    <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {booking.bookingRef}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {booking.createdAt}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] shrink-0"
                        style={{
                          background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                          color: "white",
                          fontWeight: 600,
                        }}
                      >
                        {booking.customer.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                          {booking.customer}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          {booking.customerEmail}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {booking.listing}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {booking.listingType} • {booking.guests} guests
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} style={{ color: "var(--text-tertiary)" }} />
                      <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {booking.travelDate}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[14px]" style={{ color: "var(--success)", fontWeight: 600 }}>
                      {booking.amount}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] capitalize"
                      style={{
                        background: getPaymentStatusStyle(booking.paymentStatus).bg,
                        color: getPaymentStatusStyle(booking.paymentStatus).color,
                        fontWeight: 600,
                      }}
                    >
                      {booking.paymentStatus}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] capitalize"
                      style={{
                        background: getBookingStatusStyle(booking.bookingStatus).bg,
                        color: getBookingStatusStyle(booking.bookingStatus).color,
                        border: `1px solid ${getBookingStatusStyle(booking.bookingStatus).border}`,
                        fontWeight: 600,
                      }}
                    >
                      {booking.bookingStatus}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {booking.bookingStatus === "pending" && (
                        <>
                          <button
                            onClick={async () => {
                              setUpdatingId(booking.id);
                              try {
                                const response = await fetch(`http://localhost:8000/api/v1/bookings/${booking.id}/mark-paid`, {
                                  method: "PATCH",
                                });
                                if (response.ok) {
                                  addToast({ type: "success", title: "Marked as Paid", message: "Booking payment confirmed." });
                                  fetchInquiries();
                                }
                              } catch (e) {
                                addToast({ type: "error", title: "Error", message: "Failed to mark as paid." });
                              } finally {
                                setUpdatingId(null);
                              }
                            }}
                            disabled={updatingId === booking.id}
                            className="px-3 py-1.5 rounded-lg text-[11px] transition-all disabled:opacity-60 font-semibold"
                            style={{
                              background: "rgba(34,197,94,0.15)",
                              color: "#22c55e",
                              border: "1px solid rgba(34,197,94,0.3)",
                            }}
                          >
                            {updatingId === booking.id ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null}
                            Mark as Paid
                          </button>
                          <button
                            onClick={() => handleVendorStatusUpdate(booking.id, "contacted")}
                            disabled={updatingId === booking.id}
                            className="px-3 py-1.5 rounded-lg text-[11px] transition-all disabled:opacity-60"
                            style={{
                              background: "var(--active-overlay)",
                              color: "var(--accent-navy-light)",
                              border: "1px solid var(--border-accent)",
                              fontWeight: 500,
                            }}
                          >
                            Contacted Customer
                          </button>
                        </>
                      )}
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: "var(--input-background)",
                          border: "1px solid var(--border-light)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: "var(--input-background)",
                          border: "1px solid var(--border-light)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Operations Panel */}
      <ContextualActions
        position="bottom"
        sticky={true}
        actions={[
          {
            label: "Refresh Data",
            icon: RefreshCw,
            variant: "secondary",
            onClick: () => {
              fetchInquiries();
              addToast({
                type: "info",
                title: "Refreshing bookings",
                message: "Loading latest booking data...",
                duration: 2000,
              });
            },
          },
          {
            label: "Send Reminders",
            icon: Mail,
            variant: "secondary",
            onClick: () => {
              addToast({
                type: "success",
                title: "Reminders sent",
                message: "Email reminders sent to all pending bookings",
                duration: 4000,
              });
            },
          },
          {
            label: "Export CSV",
            icon: Download,
            variant: "primary",
            onClick: () => {
              addToast({
                type: "success",
                title: "Export started",
                message: "Your booking data is being exported",
                action: {
                  label: "View Downloads",
                  onClick: () => console.log("View downloads"),
                },
              });
            },
          },
        ]}
      />
    </div>
  );
}

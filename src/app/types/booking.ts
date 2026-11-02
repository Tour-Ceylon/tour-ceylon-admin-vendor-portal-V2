/**
 * DATA-4: the one definition of a booking row and its cart lines for the portal.
 *
 * The bookings list and the booking drawer each used to declare their own `Booking`,
 * `SelectedRoomItem` and cart-item types, and the API module a third. They are defined here once.
 */
import type { InquiryStatus } from "../components/api/bookingInquiriesApi";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "rejected" | "refunded";
export type PaymentStatus = "unpaid" | "paid" | "partially_paid" | "refunded" | "failed" | "pay_later";
export type BookingType = "Stay" | "Tour" | "Safari" | "Experience" | "Transfer";
export type PaymentMethodValue = "pay_at_property" | "bank_transfer" | "online";

export interface SelectedRoomItem {
  roomId?: string;
  roomName?: string;
  qty?: number;
  price?: number;
}

export interface BookingCartItem {
  listingId?: string;
  title: string;
  variantName?: string;
  travelDate?: string;
  travelDateEnd?: string;
  travelDateRaw?: string;
  travelCount?: number;
  price: number;
  baseCurrency?: string;
  selectedRooms?: SelectedRoomItem[];
  /** Set when the stay vendor (or an admin) moved the check-in / check-out dates */
  dateChange?: {
    original_check_in?: string;
    original_check_out?: string;
    changed_by?: string;
    changed_by_role?: string;
    changed_at?: string;
    note?: string | null;
  };
}

/** One row of the bookings list, and what the detail drawer shows. */
export interface BookingRow {
  id: string;
  /** Raw UUID, used for API status updates. */
  _inquiryId?: string;
  /** Raw backend status. */
  _inquiryStatus?: InquiryStatus;
  customer: { name: string; email: string; phone: string };
  type: BookingType;
  listing: string;
  vendor: string;
  vendorEmail?: string;
  vendorRole?: string;
  travelDate: string;
  checkIn?: string;
  checkOut?: string;
  amount: number;
  /** ISO currency code of `amount` and the cart prices; each inquiry is priced in its own currency (DATA-2). */
  currency?: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  rawCreatedAt?: string;
  passengers?: number;
  duration?: string;
  specialRequests?: string;
  /** Payment choice as a real field (FLOW-1); older inquiries fall back to the text in specialRequests. */
  paymentMethod?: PaymentMethodValue | null;
  riskFlags?: string[];
  nationality?: string;
  cartItems?: BookingCartItem[];
}

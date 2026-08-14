/**
 * Booking Inquiries API service
 * Provides typed wrappers around the admin and vendor booking inquiry endpoints.
 *
 * Admin routes:  GET/PATCH /api/v1/admin/booking-inquiries/...
 * Vendor routes: GET/PATCH /api/v1/vendor/booking-inquiries/...
 */

import { apiFetch } from "./apiClient";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type InquiryStatus =
  | "pending_contact"
  | "contacted"
  | "quoted"
  | "converted_to_booking"
  | "cancelled";

export interface CartItemSummary {
  listingId: string;
  title: string;
  travelDate?: string;
  travelCount: number;
  price: number;
  baseCurrency: string;
}

export interface AdminBookingInquiryItem {
  id: string;
  reference: string;
  status: InquiryStatus;

  // Customer
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  emergencyContact?: string;

  // Trip
  numberOfTravelers: number;
  specialRequests?: string;
  cartItems: CartItemSummary[];

  // Financials
  subtotal?: number;
  total?: number;
  currency?: string;

  // Meta
  createdAt: string;
  updatedAt: string;
}

export interface AdminBookingInquiryMetrics {
  totalValue: number;
  pendingValue: number;
  confirmedOrConvertedCount: number;
  cancelledCount: number;
}

export interface AdminBookingInquiryPaginatedResponse {
  items: AdminBookingInquiryItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  statusCounts: Record<string, number>;
  metrics: AdminBookingInquiryMetrics;
}

export interface VendorBookingInquiryPaginatedResponse {
  items: AdminBookingInquiryItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  statusCounts: Record<InquiryStatus, number>;
}

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------

export interface AdminListParams {
  status?: InquiryStatus | "all";
  search?: string;
  page?: number;
  perPage?: number;
  createdFrom?: string;
  createdTo?: string;
}

/**
 * Fetch paginated booking inquiries for the admin panel.
 */
export async function adminListBookingInquiries(
  params: AdminListParams = {}
): Promise<AdminBookingInquiryPaginatedResponse> {
  const qs = new URLSearchParams();
  if (params.status && params.status !== "all")
    qs.set("status_filter", params.status);
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.perPage) qs.set("per_page", String(params.perPage));
  if (params.createdFrom) qs.set("created_from", params.createdFrom);
  if (params.createdTo) qs.set("created_to", params.createdTo);

  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch(`/booking-inquiries/${query}`);
}

/**
 * Update a booking inquiry status as admin.
 * Allowed: contacted | quoted | converted_to_booking | cancelled
 */
export async function adminUpdateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus
): Promise<AdminBookingInquiryItem> {
  return apiFetch(`/admin/booking-inquiries/${inquiryId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ---------------------------------------------------------------------------
// Vendor API
// ---------------------------------------------------------------------------

export interface VendorListParams {
  status?: InquiryStatus | "all";
  search?: string;
  page?: number;
  perPage?: number;
}

/**
 * Fetch paginated booking inquiries for the currently logged-in vendor.
 */
export async function vendorListBookingInquiries(
  params: VendorListParams = {}
): Promise<VendorBookingInquiryPaginatedResponse> {
  const qs = new URLSearchParams();
  if (params.status && params.status !== "all")
    qs.set("status_filter", params.status);
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.perPage) qs.set("per_page", String(params.perPage));

  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch(`/vendor/booking-inquiries/${query}`);
}

/**
 * Update a booking inquiry status as vendor.
 * Only: contacted | quoted
 */
export async function vendorUpdateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus
): Promise<AdminBookingInquiryItem> {
  return apiFetch(`/vendor/booking-inquiries/${inquiryId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive a display-friendly booking type from the first cart item's title.
 * Falls back to "Inquiry" if no title is available.
 */
export function inferBookingType(items: CartItemSummary[]): string {
  if (!items || items.length === 0) return "Inquiry";
  const title = (items[0].title || "").toLowerCase();
  if (title.includes("transfer") || title.includes("transport")) return "Transfer";
  if (title.includes("safari")) return "Safari";
  if (title.includes("stay") || title.includes("hotel") || title.includes("villa"))
    return "Stay";
  if (title.includes("tour") || title.includes("heritage") || title.includes("walk"))
    return "Tour";
  if (
    title.includes("experience") ||
    title.includes("food") ||
    title.includes("cooking")
  )
    return "Experience";
  return "Tour";
}

/**
 * Map backend InquiryStatus to the admin UI BookingStatus equivalent.
 */
export function mapInquiryStatusToUI(
  status: InquiryStatus | string
): "pending" | "confirmed" | "completed" | "cancelled" | "rejected" | "refunded" {
  switch (status) {
    case "pending_contact":
      return "pending";
    case "contacted":
      return "pending";
    case "quoted":
      return "confirmed";
    case "converted_to_booking":
      return "completed";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}

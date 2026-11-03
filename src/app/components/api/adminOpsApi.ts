import { apiFetch } from "./apiClient";

// ---------- Add-ons (FEAT-3) ----------

export interface AddOn {
  id: string;
  listing_id: string;
  room_id?: string | null;
  name: string;
  description?: string | null;
  price: number;
  base_currency: string;
  is_active: boolean;
}

export interface AddOnInput {
  listing_id: string;
  name: string;
  description?: string;
  price: number;
  base_currency: string;
  is_active?: boolean;
}

export const listAddOns = (listingId: string) => apiFetch<AddOn[]>(`/admin/addons?listing_id=${encodeURIComponent(listingId)}`);
export const createAddOn = (input: AddOnInput) => apiFetch<AddOn>("/admin/addons", { method: "POST", body: JSON.stringify(input) });
export const updateAddOn = (id: string, changes: Partial<Omit<AddOnInput, "listing_id">>) =>
  apiFetch<AddOn>(`/admin/addons/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
export const deleteAddOn = (id: string) => apiFetch<void>(`/admin/addons/${id}`, { method: "DELETE" });

// ---------- Review moderation (FEAT-3) ----------

export type ReviewStatus = "pending" | "published" | "hidden";

export interface ModeratedReview {
  id: string;
  listing_id: string;
  listing_title: string | null;
  user_email: string | null;
  rating: number;
  title: string | null;
  status: ReviewStatus;
  created_at: string | null;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export const listReviews = (status: ReviewStatus | "all", page = 1) =>
  apiFetch<Paged<ModeratedReview>>(`/admin/reviews?page=${page}${status === "all" ? "" : `&status=${status}`}`);
export const setReviewStatus = (id: string, status: ReviewStatus) =>
  apiFetch<ModeratedReview>(`/admin/reviews/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });

// ---------- Customer notifications (FEAT-3) ----------

export interface CustomerNotification {
  id: string;
  type: "booking_confirmed" | "booking_cancelled" | "booking_quoted";
  title: string;
  message: string;
  reference: string | null;
  recipient_email: string;
  is_read: boolean;
  created_at: string | null;
}

export const listCustomerNotifications = (type: CustomerNotification["type"] | "all", page = 1) =>
  apiFetch<Paged<CustomerNotification>>(`/admin/notifications?page=${page}${type === "all" ? "" : `&type=${type}`}`);

// ---------- Guide / driver assignment (FEAT-2) ----------

export interface InquiryAssignment {
  id: string;
  inquiry_id: string;
  assignee_type: "guide" | "driver";
  driver: { id: string; full_name: string | null; phone: string | null; vehicle: string; plate: string } | null;
  guide_name: string | null;
  guide_phone: string | null;
  notes: string | null;
  status: "assigned" | "cancelled";
  created_at: string | null;
}

export interface AssignmentInput {
  assignee_type: "guide" | "driver";
  driver_id?: string;
  guide_name?: string;
  guide_phone?: string;
  notes?: string;
}

export const listAssignments = (inquiryId: string) => apiFetch<InquiryAssignment[]>(`/admin/inquiries/${inquiryId}/assignments`);
export const createAssignment = (inquiryId: string, input: AssignmentInput) =>
  apiFetch<InquiryAssignment>(`/admin/inquiries/${inquiryId}/assignments`, { method: "POST", body: JSON.stringify(input) });
export const removeAssignment = (inquiryId: string, assignmentId: string) =>
  apiFetch<void>(`/admin/inquiries/${inquiryId}/assignments/${assignmentId}`, { method: "DELETE" });


// ---------- Internal notes and platform fee (UI-11) ----------

export interface InternalNotes {
  id: string;
  notes: string;
  updatedAt: string;
}

/** Staff-only notes on a request. The vendor route also accepts admins. */
export const getInternalNotes = (inquiryId: string) =>
  apiFetch<InternalNotes>(`/vendor/booking-inquiries/${inquiryId}/internal-notes`);
export const saveInternalNotes = (inquiryId: string, notes: string) =>
  apiFetch<InternalNotes>(`/vendor/booking-inquiries/${inquiryId}/internal-notes`, {
    method: "PUT",
    body: JSON.stringify({ notes }),
  });

let platformFeeCache: Promise<number> | null = null;

/** The platform fee percentage from admin settings (admin only). Cached for the session. */
export function getPlatformFeePercent(): Promise<number> {
  if (!platformFeeCache) {
    platformFeeCache = apiFetch<{ platformFeePercent: number }>("/admin/settings")
      .then((settings) => Number(settings.platformFeePercent))
      .catch((err) => {
        platformFeeCache = null; // try again next time
        throw err;
      });
  }
  return platformFeeCache;
}


// ---------- Payments (FEAT-4) ----------

export interface AdminPayment {
  id: string;
  target_type: string;
  target_id: string;
  provider: string;
  order_id: string;
  amount: string | number;
  currency: string;
  status: "initiated" | "pending" | "succeeded" | "failed" | "cancelled" | "chargedback" | string;
  provider_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminPaymentList {
  items: AdminPayment[];
  total: number;
  page: number;
  page_size: number;
}

export interface PaymentsSummary {
  received: Array<{ currency: string; total: string | number; count: number }>;
}

export const listPayments = (status: string, page = 1, pageSize = 20) =>
  apiFetch<AdminPaymentList>(`/admin/payments?page=${page}&page_size=${pageSize}${status === "all" ? "" : `&status=${status}`}`);
export const getPaymentsSummary = () => apiFetch<PaymentsSummary>("/admin/payments/summary");

import { apiFetch } from "./apiClient";

export interface AdminAssignedDriverInfo {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  nic_number: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_plate_number: string;
  seats: number;
  status: string;
  is_online: boolean;
  rating?: number;
}

export interface AdminVehicleCategoryInfo {
  id: string;
  name: string;
  slug: string;
  passenger_capacity: number;
  luggage_capacity: number;
}

export interface AdminDeclineRecord {
  id: string;
  driver_id: string;
  driver_name?: string;
  reason: string;
  note?: string;
  created_at?: string;
}

export type TransportBookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface AdminTransportBooking {
  id: string;
  booking_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_country?: string;
  pickup_location: string;
  pickup_lat?: number;
  pickup_lng?: number;
  destination_location: string;
  destination_lat?: number;
  destination_lng?: number;
  distance_km?: number;
  estimated_duration_minutes?: number;
  travel_date: string;
  pickup_time: string;
  passengers_count: number;
  luggage_count: number;
  special_requests?: string;
  base_fare: number;
  price_per_km: number;
  route_price: number;
  extra_charges: number;
  total_price: number;
  currency: string;
  booking_status: string;
  payment_status: string;
  assignment_status: "unassigned" | "assigned" | "acknowledged" | "en_route" | "arrived" | "in_progress" | "completed" | "declined" | string;
  assigned_at?: string;
  driver_responded_at?: string;
  created_at?: string;
  internal_notes?: string;
  vehicle_category?: AdminVehicleCategoryInfo;
  driver?: AdminAssignedDriverInfo;
  /** Drivers who declined this booking before it was reassigned. */
  decline_history?: AdminDeclineRecord[];
  /** A note the admin team wrote for the assigned driver. */
  driver_note?: string | null;
  driver_note_updated_at?: string | null;
}

export interface AdminTransportBookingListResponse {
  bookings: AdminTransportBooking[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  unassigned_count: number;
  assigned_count: number;
  in_progress_count: number;
  completed_count: number;
  pending_count: number;
  cancelled_count: number;
  paid_revenue_usd: number | string;
  average_fare_usd: number | string;
}

export interface FetchAdminTransportBookingsParams {
  assignment_status?: string;
  booking_status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export async function fetchAdminTransportBookings(
  params: FetchAdminTransportBookingsParams = {}
): Promise<AdminTransportBookingListResponse> {
  const query = new URLSearchParams();
  if (params.assignment_status && params.assignment_status !== "all") {
    query.set("assignment_status", params.assignment_status);
  }
  if (params.booking_status && params.booking_status !== "all") {
    query.set("booking_status", params.booking_status);
  }
  if (params.search) {
    query.set("search", params.search);
  }
  if (params.page) {
    query.set("page", String(params.page));
  }
  if (params.per_page) {
    query.set("per_page", String(params.per_page));
  }

  const qs = query.toString();
  return apiFetch(`/admin/transport-bookings${qs ? `?${qs}` : ""}`);
}

export async function fetchAdminTransportBookingDetail(bookingId: string): Promise<AdminTransportBooking> {
  return apiFetch(`/admin/transport-bookings/${bookingId}`);
}

/**
 * Confirm, complete or cancel a booking. The status endpoint returns the customer-level view, so the
 * full dispatch view (driver, decline history) is fetched again for the caller.
 */
export async function updateTransportBookingStatus(
  bookingId: string,
  status: TransportBookingStatus
): Promise<AdminTransportBooking> {
  await apiFetch(`/admin/transport/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ booking_status: status }),
  });
  return fetchAdminTransportBookingDetail(bookingId);
}

export async function updateTransportBookingNotes(
  bookingId: string,
  internalNotes: string
): Promise<AdminTransportBooking> {
  await apiFetch(`/admin/transport/bookings/${bookingId}/notes`, {
    method: "PATCH",
    body: JSON.stringify({ internal_notes: internalNotes }),
  });
  return fetchAdminTransportBookingDetail(bookingId);
}

export async function assignDriverToBooking(
  bookingId: string,
  driverId: string
): Promise<AdminTransportBooking> {
  return apiFetch(`/admin/transport-bookings/${bookingId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ driver_id: driverId }),
  });
}

export interface DriverPoolItem {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  nic_number: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_plate_number: string;
  seats: number;
  status: string;
  is_online: boolean;
  rating?: number;
}

export async function fetchApprovedDrivers(isOnlineOnly = false): Promise<DriverPoolItem[]> {
  const query = new URLSearchParams();
  query.set("status", "approved");
  query.set("per_page", "100");
  if (isOnlineOnly) {
    query.set("is_online", "true");
  }
  const res = await apiFetch(`/admin/drivers?${query.toString()}`);
  return res.drivers || [];
}

/** Write (or, with an empty note, remove) the note passed to the driver assigned to this booking. */
export async function setDriverNote(bookingId: string, note: string): Promise<AdminTransportBooking> {
  return apiFetch(`/admin/transport-bookings/${bookingId}/driver-note`, {
    method: "PUT",
    body: JSON.stringify({ note }),
  });
}

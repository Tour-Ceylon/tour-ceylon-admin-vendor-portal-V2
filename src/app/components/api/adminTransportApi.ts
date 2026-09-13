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

import { apiFetch } from "./apiClient";

export interface DriverAvailability {
  is_online: boolean;
  last_online_at?: string;
}

export interface DriverTripSummary {
  id: string;
  booking_reference: string;
  travel_date: string;
  pickup_time: string;
  pickup_location: string;
  destination_location: string;
  distance_km?: number;
  estimated_duration_minutes?: number;
  passengers_count: number;
  luggage_count: number;
  special_requests?: string;
  total_price: number;
  currency: string;
  booking_status: string;
  payment_status: string;
  assignment_status: "assigned" | "acknowledged" | "en_route" | "arrived" | "in_progress" | "completed" | "declined" | string;
  assigned_at?: string;
  driver_responded_at?: string;
  created_at?: string;
  customer_name: string;
  customer_phone: string;
}

export interface DriverTripCustomer {
  name: string;
  phone: string;
  email?: string;
  country?: string;
}

export interface DriverTripDetail {
  id: string;
  booking_reference: string;
  travel_date: string;
  pickup_time: string;
  pickup_location: string;
  pickup_lat?: number;
  pickup_lng?: number;
  destination_location: string;
  destination_lat?: number;
  destination_lng?: number;
  distance_km?: number;
  estimated_duration_minutes?: number;
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
  assignment_status: string;
  assigned_at?: string;
  driver_responded_at?: string;
  created_at?: string;
  customer: DriverTripCustomer;
  vehicle_category_name?: string;
}

export interface DriverTripDeclineRecord {
  id: string;
  transport_booking_id: string;
  booking_reference?: string;
  pickup_location?: string;
  destination_location?: string;
  travel_date?: string;
  total_price?: number;
  currency?: string;
  reason: string;
  note?: string;
  created_at?: string;
}

export interface DriverDailyEarningItem {
  date: string;
  day_name: string;
  earnings: number;
  trip_count: number;
}

export interface DriverEarningsData {
  period: "today" | "week" | "month" | string;
  total_earnings: number;
  trip_count: number;
  currency: string;
  daily_breakdown: DriverDailyEarningItem[];
  start_date: string;
  end_date: string;
}

export async function fetchMyAvailability(): Promise<DriverAvailability> {
  return apiFetch("/drivers/me/availability");
}

export async function updateMyAvailability(isOnline: boolean): Promise<DriverAvailability> {
  return apiFetch("/drivers/me/availability", {
    method: "PATCH",
    body: JSON.stringify({ is_online: isOnline }),
  });
}

export async function fetchMyTrips(
  status: "assigned" | "upcoming" | "history" = "assigned"
): Promise<DriverTripSummary[]> {
  return apiFetch(`/drivers/me/trips?status=${status}`);
}

export async function fetchMyTripDetail(bookingId: string): Promise<DriverTripDetail> {
  return apiFetch(`/drivers/me/trips/${bookingId}`);
}

export async function acknowledgeTrip(bookingId: string): Promise<DriverTripDetail> {
  return apiFetch(`/drivers/me/trips/${bookingId}/acknowledge`, {
    method: "POST",
  });
}

export async function declineTrip(
  bookingId: string,
  reason: string,
  note?: string
): Promise<DriverTripDeclineRecord> {
  return apiFetch(`/drivers/me/trips/${bookingId}/decline`, {
    method: "POST",
    body: JSON.stringify({ reason, note }),
  });
}

export async function updateTripProgressStatus(
  bookingId: string,
  status: "en_route" | "arrived" | "in_progress" | "completed"
): Promise<DriverTripDetail> {
  return apiFetch(`/drivers/me/trips/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function fetchMyEarnings(
  period: "today" | "week" | "month" = "today"
): Promise<DriverEarningsData> {
  return apiFetch(`/drivers/me/earnings?period=${period}`);
}

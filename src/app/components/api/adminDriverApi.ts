import { apiFetch } from "./apiClient";

export interface LuggageCapacityItem {
  luggage_size_type_id: string;
  name?: string;
  quantity: number;
}

export interface DriverProfileChange {
  id: string;
  driver_id: string;
  /** pending | approved | rejected | withdrawn */
  status: string;
  /** Only the fields the driver changed. */
  proposed: Record<string, any>;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DriverAvatarSubmission {
  id: string;
  driver_id: string;
  image_url: string;
  /** pending | approved | rejected | withdrawn */
  status: string;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at?: string | null;
}

export interface AdminDriverItem {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  nic_number: string;
  license_number?: string;
  license_photo_url?: string;
  nic_photo_url?: string;
  vehicle_registration_doc_url?: string;
  insurance_doc_url?: string;
  police_clearance_doc_url?: string;
  vehicle_model_preset_id?: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_plate_number: string;
  seats: number;
  status: "pending_review" | "approved" | "rejected" | "suspended" | string;
  is_online: boolean;
  last_online_at?: string;
  base_location?: string;
  languages_spoken: string[];
  years_experience?: number;
  bank_account_holder?: string;
  bank_name?: string;
  bank_account_number?: string;
  rating?: number;
  is_active: boolean;
  total_earnings: number;
  completed_trips_count: number;
  active_trips_count: number;
  created_at?: string;
  updated_at?: string;
  luggage_capacities: LuggageCapacityItem[];
  /** The newest profile update the driver sent for review (any status), or null. */
  latest_profile_change?: DriverProfileChange | null;
  /** The approved photo shown for this driver, if any. */
  avatar_url?: string | null;
  /** The newest photo the driver sent (any status). Only approved photos are ever displayed. */
  latest_avatar_submission?: DriverAvatarSubmission | null;
}

export interface AdminDriverListResponse {
  drivers: AdminDriverItem[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface FetchAdminDriversParams {
  status?: string;
  search?: string;
  is_online?: boolean;
  page?: number;
  per_page?: number;
}

export async function fetchAdminDrivers(
  params: FetchAdminDriversParams = {}
): Promise<AdminDriverListResponse> {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params.search) {
    query.set("search", params.search);
  }
  if (params.is_online !== undefined) {
    query.set("is_online", String(params.is_online));
  }
  if (params.page) {
    query.set("page", String(params.page));
  }
  if (params.per_page) {
    query.set("per_page", String(params.per_page));
  }

  const qs = query.toString();
  return apiFetch(`/admin/drivers${qs ? `?${qs}` : ""}`);
}

export async function fetchAdminDriverDetail(driverId: string): Promise<AdminDriverItem> {
  return apiFetch(`/admin/drivers/${driverId}`);
}

export async function updateAdminDriverStatus(
  driverId: string,
  status: "approved" | "rejected" | "suspended" | "pending_review",
  rejectionReason?: string
): Promise<AdminDriverItem> {
  return apiFetch(`/admin/drivers/${driverId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, rejection_reason: rejectionReason }),
  });
}

/** Approve the driver's pending profile update: its values are saved to the driver's record. */
export async function approveDriverProfileChange(driverId: string): Promise<AdminDriverItem> {
  await apiFetch(`/admin/drivers/${driverId}/profile-change/approve`, { method: "POST" });
  return fetchAdminDriverDetail(driverId);
}

/** Reject it with a reason the driver will see. */
export async function rejectDriverProfileChange(driverId: string, reason: string): Promise<AdminDriverItem> {
  await apiFetch(`/admin/drivers/${driverId}/profile-change/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return fetchAdminDriverDetail(driverId);
}

/** Approve the driver's pending profile photo; it then shows across the portals. */
export async function approveDriverAvatar(driverId: string): Promise<AdminDriverItem> {
  await apiFetch(`/admin/drivers/${driverId}/avatar/approve`, { method: "POST" });
  return fetchAdminDriverDetail(driverId);
}

/** Reject it with a reason the driver will see. */
export async function rejectDriverAvatar(driverId: string, reason: string): Promise<AdminDriverItem> {
  await apiFetch(`/admin/drivers/${driverId}/avatar/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return fetchAdminDriverDetail(driverId);
}

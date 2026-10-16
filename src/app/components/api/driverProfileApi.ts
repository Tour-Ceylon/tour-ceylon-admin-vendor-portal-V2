import { apiFetch } from "./apiClient";

/** The fields a driver may propose. Everything else on the profile is fixed or set by the admin team. */
export interface DriverProfileChangePayload {
  base_location?: string;
  languages_spoken?: string[];
  years_experience?: number;
  bank_account_holder?: string;
  bank_name?: string;
  bank_account_number?: string;
}

export interface MyProfileChange {
  id: string;
  driver_id: string;
  /** pending | approved | rejected | withdrawn */
  status: string;
  proposed: DriverProfileChangePayload;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MyAvatarSubmission {
  id: string;
  driver_id: string;
  image_url: string;
  /** pending | approved | rejected | withdrawn */
  status: string;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at?: string | null;
}

export interface MyDriverProfile {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  nic_number: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_plate_number: string;
  seats: number;
  status: string;
  base_location?: string | null;
  languages_spoken?: string[] | null;
  years_experience?: number | null;
  bank_account_holder?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  latest_profile_change?: MyProfileChange | null;
  /** The approved photo to display, if any. */
  avatar_url?: string | null;
  latest_avatar_submission?: MyAvatarSubmission | null;
}

export async function fetchMyDriverProfile(): Promise<MyDriverProfile> {
  return apiFetch("/drivers/me");
}

/** Sends details for admin review. Nothing is saved to the profile until an admin approves it. */
export async function submitMyProfileChange(payload: DriverProfileChangePayload): Promise<MyProfileChange> {
  return apiFetch("/drivers/me/profile-change", { method: "POST", body: JSON.stringify(payload) });
}

export async function withdrawMyProfileChange(): Promise<MyProfileChange> {
  return apiFetch("/drivers/me/profile-change", { method: "DELETE" });
}

/** Uploads a profile photo. It is shown only after an admin approves it. */
export async function uploadMyAvatar(photo: Blob): Promise<MyAvatarSubmission> {
  const form = new FormData();
  form.append("photo", photo, "avatar.jpg");
  return apiFetch("/drivers/me/avatar", { method: "POST", body: form });
}

export async function withdrawMyAvatar(): Promise<MyAvatarSubmission> {
  return apiFetch("/drivers/me/avatar", { method: "DELETE" });
}

/** Tell the rest of the driver portal (for example the header avatar) to reload the profile. */
export function announceDriverProfileUpdated() {
  window.dispatchEvent(new Event("driver-profile-updated"));
}

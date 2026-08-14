import { apiFetch } from "./apiClient";

export interface StayPropertySummary {
  id: string;
  vendorId?: string;
  listingId?: string | null;
  name: string;
  propertyType: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  status: string;
  contact?: Record<string, unknown>;
  policies?: Record<string, unknown>;
  media?: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface StayPropertyListResponse {
  properties: StayPropertySummary[];
  total: number;
}

export interface StayRoomUnit {
  id: string;
  roomNumber: string;
  floor?: string | null;
  roomName?: string | null;
  status: string;
}

export interface StayRoomType {
  id: string;
  name: string;
  description?: string | null;
  size?: string | null;
  sizeUnit?: string | null;
  maxGuests?: string | null;
  basePrice?: number | string | null;
  currency: string;
  bedConfiguration: Record<string, unknown>;
  bathroom: Record<string, unknown>;
  discounts: Array<Record<string, unknown>>;
  roomUnits?: StayRoomUnit[];
  totalUnits?: number;
}

export interface StayInventoryResponse {
  propertyId: string;
  roomTypes: StayRoomType[];
  roomUnits: StayRoomUnit[];
}

export interface StayCalendarEntry {
  date: string;
  totalUnits: number;
  bookedUnits: number;
  blockedUnits: number;
  availableUnits: number;
  nightlyPrice?: number | string | null;
}

export interface StayCalendarResponse {
  propertyId: string;
  entries: StayCalendarEntry[];
}

export interface StayRoomBlockResponse {
  id: string;
  propertyId: string;
  roomUnitId: string;
  startDate: string;
  endDate: string;
  blockType: string;
  status: string;
  reason?: string | null;
  blockedByUserId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface StayRoomBlockListResponse {
  blocks: StayRoomBlockResponse[];
  total: number;
}

export interface StayCreateRoomBlockPayload {
  roomUnitId: string;
  startDate: string;
  endDate: string;
  blockType: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface StayRoomTypePayload {
  name: string;
  description?: string;
  size?: string;
  sizeUnit?: string;
  maxGuests?: number;
  basePrice?: number;
  currency?: string;
  bedConfiguration?: Record<string, unknown>;
  bathroom?: Record<string, unknown>;
  discounts?: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
}

export interface StayRoomUnitPayload {
  roomTypeId: string;
  roomNumber: string;
  floor?: string;
  roomName?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface StayBookingRoom {
  id: string;
  roomUnitId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  nightlyRate: number | string;
  guests: number;
  metadata?: Record<string, unknown>;
}

export interface StayBookingResponse {
  id: string;
  bookingId: string;
  propertyId: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  specialRequests?: string | null;
  metadata?: Record<string, unknown>;
  rooms: StayBookingRoom[];
  createdAt: string;
  updatedAt: string;
}

export interface StayBookingListResponse {
  bookings: StayBookingResponse[];
  total: number;
}

export async function listStayProperties() {
  return apiFetch<StayPropertyListResponse>("/vendor/stays/");
}

export async function getStayInventory(propertyId: string) {
  return apiFetch<StayInventoryResponse>(`/vendor/stays/${propertyId}/inventory`);
}

export async function getStayCalendar(propertyId: string, startDate: string, endDate: string, roomTypeId: string) {
  const params = new URLSearchParams({
    startDate,
    endDate,
    roomTypeId,
  });
  return apiFetch<StayCalendarResponse>(`/vendor/stays/${propertyId}/calendar?${params.toString()}`);
}

export async function createRoomBlock(propertyId: string, payload: StayCreateRoomBlockPayload) {
  return apiFetch<StayRoomBlockResponse>(`/vendor/stays/${propertyId}/blocks`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listStayRoomBlocks(
  propertyId: string,
  filters: { roomTypeId?: string; startDate?: string; endDate?: string } = {},
) {
  const params = new URLSearchParams();
  if (filters.roomTypeId) params.set("roomTypeId", filters.roomTypeId);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  const query = params.toString();
  return apiFetch<StayRoomBlockListResponse>(
    `/vendor/stays/${propertyId}/blocks${query ? `?${query}` : ""}`,
  );
}

export async function releaseRoomBlock(propertyId: string, blockId: string) {
  return apiFetch<StayRoomBlockResponse>(`/vendor/stays/${propertyId}/blocks/${blockId}`, {
    method: "DELETE",
  });
}

export async function listStayBookings(propertyId: string) {
  return apiFetch<StayBookingListResponse>(`/vendor/stays/${propertyId}/bookings`);
}

export async function createStayRoomType(propertyId: string, payload: StayRoomTypePayload) {
  return apiFetch<StayRoomType>(`/vendor/stays/${propertyId}/room-types`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateStayRoomType(propertyId: string, roomTypeId: string, payload: Partial<StayRoomTypePayload>) {
  return apiFetch<StayRoomType>(`/vendor/stays/${propertyId}/room-types/${roomTypeId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteStayRoomType(propertyId: string, roomTypeId: string) {
  return apiFetch(`/vendor/stays/${propertyId}/room-types/${roomTypeId}`, {
    method: "DELETE",
  });
}

export async function createStayRoomUnit(propertyId: string, payload: StayRoomUnitPayload) {
  return apiFetch<StayRoomUnit>(`/vendor/stays/${propertyId}/room-units`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateStayRoomUnit(propertyId: string, roomUnitId: string, payload: Partial<StayRoomUnitPayload>) {
  return apiFetch<StayRoomUnit>(`/vendor/stays/${propertyId}/room-units/${roomUnitId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteStayRoomUnit(propertyId: string, roomUnitId: string) {
  return apiFetch(`/vendor/stays/${propertyId}/room-units/${roomUnitId}`, {
    method: "DELETE",
  });
}

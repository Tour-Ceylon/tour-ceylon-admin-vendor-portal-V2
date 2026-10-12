import { apiFetch } from "./apiClient";

export interface StayPropertyAmenity {
  id?: string;
  name: string;
  value?: unknown;
  category?: string | null;
  valueType?: string;
}

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
  applicationNote?: string | null;
  contact?: Record<string, unknown>;
  policies?: Record<string, unknown>;
  paymentPolicy?: string;
  media?: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
  amenities?: StayPropertyAmenity[];
  roomTypes?: StayRoomType[];
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

export async function getStayProperty(propertyId: string) {
  return apiFetch<StayPropertySummary>(`/vendor/stays/${propertyId}`);
}

export async function updateStayProperty(
  propertyId: string,
  payload: Partial<StayPropertySummary> | Record<string, unknown>,
  options?: {
    existingProperty?: StayPropertySummary | null;
    method?: "PATCH" | "PUT";
  },
) {
  const preferredMethod = options?.method || "PATCH";

  const buildPutPayload = () => {
    const existing = options?.existingProperty;
    const baseRoomTypes =
      (payload as any).roomTypes ||
      existing?.roomTypes?.map((rt) => ({
        id: rt.id,
        name: rt.name,
        description: rt.description || "",
        count: rt.roomUnits?.length || rt.totalUnits || 1,
        size: rt.size || undefined,
        sizeUnit: rt.sizeUnit || undefined,
        maxGuests: rt.maxGuests ? Number(rt.maxGuests) : undefined,
        basePrice: rt.basePrice ? Number(rt.basePrice) : undefined,
        currency: rt.currency || "LKR",
        bedConfiguration: rt.bedConfiguration || {},
        bathroom: rt.bathroom || {},
        discounts: rt.discounts || [],
      })) ||
      [];

    return {
      name: payload.name ?? existing?.name ?? "Property",
      propertyType: payload.propertyType ?? existing?.propertyType ?? "Hotel",
      description: payload.description ?? existing?.description ?? "",
      address: payload.address ?? existing?.address ?? "",
      city: payload.city ?? existing?.city ?? "",
      district: payload.district ?? existing?.district ?? "",
      latitude: payload.latitude ?? existing?.latitude ?? null,
      longitude: payload.longitude ?? existing?.longitude ?? null,
      status: payload.status ?? existing?.status ?? "submitted",
      applicationNote: payload.applicationNote ?? existing?.applicationNote ?? null,
      contact: {
        ...(existing?.contact || {}),
        ...((payload.contact as Record<string, unknown>) || {}),
      },
      policies: {
        ...(existing?.policies || {}),
        ...((payload.policies as Record<string, unknown>) || {}),
      },
      paymentPolicy: (payload as any).paymentPolicy ?? existing?.paymentPolicy ?? "pay_at_property",
      media: payload.media ?? existing?.media ?? [],
      amenities: (payload as any).amenities ?? existing?.amenities ?? [],
      roomTypes: baseRoomTypes,
      metadata: {
        ...(existing?.metadata || {}),
        ...((payload.metadata as Record<string, unknown>) || {}),
      },
    };
  };

  if (preferredMethod === "PUT") {
    const putPayload = options?.existingProperty ? buildPutPayload() : payload;
    return apiFetch<StayPropertySummary>(`/vendor/stays/${propertyId}`, {
      method: "PUT",
      body: JSON.stringify(putPayload),
    });
  }

  try {
    return await apiFetch<StayPropertySummary>(`/vendor/stays/${propertyId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    if (err?.status === 405 || String(err?.message || "").includes("405")) {
      console.warn("PATCH returned 405 Method Not Allowed; falling back to PUT with full projection for stay", propertyId);
      const putPayload = options?.existingProperty ? buildPutPayload() : payload;
      return apiFetch<StayPropertySummary>(`/vendor/stays/${propertyId}`, {
        method: "PUT",
        body: JSON.stringify(putPayload),
      });
    }
    throw err;
  }
}




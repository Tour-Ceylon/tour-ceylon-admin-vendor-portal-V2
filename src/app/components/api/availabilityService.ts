import { apiFetch } from "./apiClient";
import { UUID } from "crypto";

/**
 * Availability Calendar API Integration
 * Handles all vendor availability management endpoints
 */

export interface AvailabilityRecord {
  id: string;
  variantId: string;
  serviceDate: string;
  totalCapacity: number;
  reservedCapacity: number;
  availableCapacity: number;
  availableStatus: "open" | "limited" | "sold_out" | "blocked";
}

export interface AvailabilityListResponse {
  availability: AvailabilityRecord[];
  total: number;
}

export interface CreateAvailabilityPayload {
  variantId: string;
  startDate: string; // ISO date format
  endDate: string; // ISO date format
  totalCapacity: number;
  availableStatus?: "open" | "limited" | "sold_out" | "blocked";
}

export interface UpdateAvailabilityPayload {
  totalCapacity: number;
  availableStatus: "open" | "limited" | "sold_out" | "blocked";
}

/**
 * Get all availability records for a stay property
 * Optionally filter by variant_id
 */
export async function listAvailability(
  stayPropertyId: string,
  variantId?: string
): Promise<AvailabilityListResponse> {
  const path = `/vendor/stays/${stayPropertyId}/availability${
    variantId ? `?variant_id=${variantId}` : ""
  }`;
  return apiFetch<AvailabilityListResponse>(path);
}

/**
 * Create availability for a date range
 * Generates records for each day in the range
 */
export async function createAvailability(
  stayPropertyId: string,
  payload: CreateAvailabilityPayload
): Promise<AvailabilityRecord[]> {
  const path = `/vendor/stays/${stayPropertyId}/availability`;
  return apiFetch<AvailabilityRecord[]>(path, {
    method: "POST",
    body: JSON.stringify({
      variantId: payload.variantId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      totalCapacity: payload.totalCapacity,
      availableStatus: payload.availableStatus || "open",
    }),
  });
}

/**
 * Update availability for a single date
 */
export async function updateAvailability(
  stayPropertyId: string,
  availabilityId: string,
  payload: UpdateAvailabilityPayload
): Promise<AvailabilityRecord> {
  const path = `/vendor/stays/${stayPropertyId}/availability/${availabilityId}`;
  return apiFetch<AvailabilityRecord>(path, {
    method: "PUT",
    body: JSON.stringify({
      totalCapacity: payload.totalCapacity,
      availableStatus: payload.availableStatus,
    }),
  });
}

/**
 * Delete availability record
 * Only allowed if reservedCapacity is 0
 */
export async function deleteAvailability(
  stayPropertyId: string,
  availabilityId: string
): Promise<{ message: string; availability_id: string }> {
  const path = `/vendor/stays/${stayPropertyId}/availability/${availabilityId}`;
  return apiFetch<{ message: string; availability_id: string }>(path, {
    method: "DELETE",
  });
}

/**
 * Batch create availability for multiple variants
 * Convenience function for creating availability across all variants
 */
export async function createAvailabilityBatch(
  stayPropertyId: string,
  variantIds: string[],
  startDate: string,
  endDate: string,
  totalCapacity: number
): Promise<Map<string, AvailabilityRecord[]>> {
  const results = new Map<string, AvailabilityRecord[]>();

  for (const variantId of variantIds) {
    try {
      const records = await createAvailability(stayPropertyId, {
        variantId,
        startDate,
        endDate,
        totalCapacity,
      });
      results.set(variantId, records);
    } catch (error) {
      console.error(
        `Failed to create availability for variant ${variantId}:`,
        error
      );
    }
  }

  return results;
}

/**
 * Format availability data for calendar display
 */
export function formatAvailabilityForCalendar(
  records: AvailabilityRecord[]
): Map<string, AvailabilityRecord> {
  const map = new Map<string, AvailabilityRecord>();
  for (const record of records) {
    const date = new Date(record.serviceDate).toISOString().split("T")[0];
    map.set(date, record);
  }
  return map;
}

/**
 * Get availability status color for UI display
 */
export function getAvailabilityStatusColor(
  status: string
): {
  bg: string;
  text: string;
  badge: string;
} {
  switch (status.toLowerCase()) {
    case "open":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        badge: "bg-green-100",
      };
    case "limited":
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        badge: "bg-yellow-100",
      };
    case "sold_out":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        badge: "bg-red-100",
      };
    case "blocked":
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        badge: "bg-gray-100",
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        badge: "bg-gray-100",
      };
  }
}

/**
 * Calculate occupancy percentage
 */
export function calculateOccupancy(
  record: AvailabilityRecord
): number {
  if (record.totalCapacity === 0) return 100;
  return Math.round(
    ((record.reservedCapacity / record.totalCapacity) * 100)
  );
}

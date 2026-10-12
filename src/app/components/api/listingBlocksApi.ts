import { apiFetch } from "./apiClient";

/**
 * Generic listing blocks API — works for tour, experience, transfer, safari, etc.
 * Uses /admin/listings/{listing_id}/blocks endpoints.
 */

export interface ListingBlockResponse {
    id: string;
    listing_id: string;
    variant_id?: string | null;
    start_date: string;
    end_date: string;
    reason?: string | null;
    block_type?: string | null;
}

export interface ListingBlockListResponse {
    blocks: ListingBlockResponse[];
}

export async function listListingBlocks(
    listingId: string,
    startDate?: string,
    endDate?: string,
) {
    let url = `/admin/listings/${listingId}/blocks?t=${Date.now()}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return apiFetch<ListingBlockListResponse>(url);
}

export async function createListingBlock(
    listingId: string,
    payload: { variantIds: string[]; startDate: string; endDate: string; reason: string; blockType: string },
) {
    return apiFetch(`/admin/listings/${listingId}/blocks`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function releaseListingBlock(listingId: string, blockId: string) {
    return apiFetch(`/admin/listings/${listingId}/blocks/${blockId}`, {
        method: "DELETE",
    });
}

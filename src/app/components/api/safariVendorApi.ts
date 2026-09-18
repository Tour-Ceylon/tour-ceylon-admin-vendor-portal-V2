import { apiFetch } from "./apiClient";

export async function getSafariCalendar(
    listingId: string,
    startDate: string,
    endDate: string,
) {
    return apiFetch(`/vendor/safaris/${listingId}/calendar?startDate=${startDate}&endDate=${endDate}`);
}

export async function listSafariBlocks(
    listingId: string,
    startDate?: string,
    endDate?: string,
) {
    let url = `/vendor/safaris/${listingId}/blocks?t=${Date.now()}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return apiFetch(url);
}

export async function createSafariBlock(
    listingId: string,
    payload: { variantIds: string[]; startDate: string; endDate: string; reason: string; blockType: string }
) {
    return apiFetch(`/vendor/safaris/${listingId}/blocks`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function releaseSafariBlock(listingId: string, blockId: string) {
    return apiFetch(`/vendor/safaris/${listingId}/blocks/${blockId}`, {
        method: "DELETE",
    });
}

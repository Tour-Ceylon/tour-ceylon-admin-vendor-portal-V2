export const CUSTOMER_SITE_URL =
  import.meta.env.VITE_CUSTOMER_SITE_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://tour-ceylon-client.vercel.app");

export function customerListingUrl(listingId: string): string {
  return `${CUSTOMER_SITE_URL}/detail/${listingId}`;
}

export function customerBrowseUrl(tab?: string): string {
  return tab ? `${CUSTOMER_SITE_URL}/browse?tab=${encodeURIComponent(tab)}` : `${CUSTOMER_SITE_URL}/browse`;
}


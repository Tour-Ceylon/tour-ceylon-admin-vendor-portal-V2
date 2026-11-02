/**
 * MOCK-1: portal pages that are not connected to live data yet.
 *
 * They render hard-coded sample data, so they are labelled "Preview" in the sidebar and show
 * a banner, instead of passing as production screens. When a page is wired to the server,
 * delete its entry here and the badge and banner disappear.
 */
const PREVIEW_EXACT = [
  "/dashboard",
  "/admins",
  "/media",
  "/pricing",
  "/finance",
  "/payments",
  "/payouts",
  "/refunds",
  "/revenue",
  "/commission",
  "/activity",
  "/audit-logs",
  "/analytics",
  "/vendor/performance",
  "/vendor/revenue",
  "/vendor/reviews",
  "/vendor/availability",
  "/vendor/insights",
  "/vendor/team",
  "/vendor/notifications",
  "/vendor/support",
];

const PREVIEW_PREFIXES = ["/settings/", "/support"];

export function isPreviewPath(pathname: string): boolean {
  const path = (pathname.split("?")[0] || "/").replace(/\/+$/, "") || "/";
  return PREVIEW_EXACT.includes(path) || PREVIEW_PREFIXES.some((prefix) => path === prefix.replace(/\/$/, "") || path.startsWith(prefix));
}

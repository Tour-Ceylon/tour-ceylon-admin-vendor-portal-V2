/**
 * DATA-1: ONE role vocabulary.
 *
 * The server's `UserRole` enum (tour-ceylon-server/app/models/enum.py) is the source of
 * truth: ADMIN, VENDOR, DRIVER, TOURIST. The portal's UI works with lowercase names, and
 * its customers are called "customer". This file is the only place the two are mapped, so
 * `Record<ServerRole, ...>` fails to compile if the server ever gains a role.
 */
export const SERVER_ROLES = ["ADMIN", "VENDOR", "DRIVER", "TOURIST"] as const;
export type ServerRole = (typeof SERVER_ROLES)[number];

export type PortalRole = "admin" | "vendor" | "driver" | "customer";

export const SERVER_TO_PORTAL_ROLE: Record<ServerRole, PortalRole> = {
  ADMIN: "admin",
  VENDOR: "vendor",
  DRIVER: "driver",
  TOURIST: "customer",
};

/** Roles that may use the management portal. Customers may not. */
export const PORTAL_STAFF_ROLES: ReadonlyArray<PortalRole> = ["admin", "vendor", "driver"];

/** Normalise whatever the API sent ("vendor", "VENDOR", " Vendor "); anything unknown is a customer (least privilege). */
export function normalizeServerRole(value: unknown): ServerRole {
  const upper = String(value ?? "").trim().toUpperCase();
  return (SERVER_ROLES as readonly string[]).includes(upper) ? (upper as ServerRole) : "TOURIST";
}

export function toPortalRole(value: unknown): PortalRole {
  return SERVER_TO_PORTAL_ROLE[normalizeServerRole(value)];
}

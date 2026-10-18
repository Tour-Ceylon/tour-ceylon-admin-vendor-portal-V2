import { useEffect, useState, type ReactNode } from "react";
import { CalendarDays, Edit2, Loader2, X } from "lucide-react";
import { apiFetch } from "../api/apiClient";
import { DetailCard } from "../transport/shared/BookingDetailCards";

export interface ListingViewSummary {
  id: string;
  title: string;
  location: string;
  category: string;
  destination: string;
  status: string;
  lastUpdated: string;
  coverUrl?: string;
}

interface ListingViewDrawerProps {
  listing: ListingViewSummary;
  onClose: () => void;
  onEdit: () => void;
  onManage: () => void;
}

type Kind = "text" | "bool" | "list" | "long" | "minutes" | "time" | "enum" | "link" | "number";
type FieldDef = readonly [key: string, label: string, kind?: Kind];
interface SectionDef {
  title: string;
  fields: FieldDef[];
}

// Everything the server stores for each category (see AdminHotelDetail / AdminTourDetail / ... in the API schemas).
const SECTIONS: Record<string, { detailKey: string; sections: SectionDef[] }> = {
  Stay: {
    detailKey: "hotelDetail",
    sections: [
      {
        title: "Property",
        fields: [
          ["propertyName", "Property name"],
          ["propertyType", "Property type", "enum"],
          ["starRating", "Star rating", "number"],
          ["roomCount", "Rooms", "number"],
          ["maxGuestCapacity", "Max guests", "number"],
          ["mealPlans", "Meal plans", "list"],
          ["amenities", "Amenities", "list"],
          ["languagesSpoken", "Languages spoken", "list"],
          ["parkingAvailable", "Parking", "bool"],
          ["wifiAvailable", "Wi-Fi", "bool"],
          ["petsAllowed", "Pets allowed", "bool"],
        ],
      },
      {
        title: "Address & contact",
        fields: [
          ["shortLocation", "Short location"],
          ["addressLine1", "Address line 1"],
          ["addressLine2", "Address line 2"],
          ["city", "City"],
          ["district", "District"],
          ["postalCode", "Postal code"],
          ["contactPhone", "Phone"],
          ["contactEmail", "Email"],
          ["website", "Website", "link"],
          ["googleMapUrl", "Google Maps", "link"],
        ],
      },
      {
        title: "Check-in & policies",
        fields: [
          ["checkInTime", "Check-in time", "time"],
          ["checkOutTime", "Check-out time", "time"],
          ["checkInNotes", "Check-in notes", "long"],
          ["checkOutNotes", "Check-out notes", "long"],
          ["childPolicy", "Child policy", "long"],
          ["smokingPolicy", "Smoking policy", "long"],
          ["extraBedPolicy", "Extra bed policy", "long"],
          ["cancellationPolicy", "Cancellation policy", "long"],
        ],
      },
    ],
  },
  Tour: {
    detailKey: "tourDetail",
    sections: [
      {
        title: "Tour overview",
        fields: [
          ["durationDays", "Duration (days)", "number"],
          ["routeSummary", "Route summary", "long"],
          ["meetingPoint", "Meeting point"],
          ["startTime", "Start time", "time"],
          ["endTime", "End time", "time"],
          ["difficultyLevel", "Difficulty", "enum"],
          ["groupSizeMin", "Min group size", "number"],
          ["groupSizeMax", "Max group size", "number"],
          ["privateAvailable", "Private tour available", "bool"],
          ["languages", "Languages", "list"],
          ["additionalCategories", "Additional categories", "list"],
          ["itineraryHighlights", "Itinerary highlights", "list"],
        ],
      },
      {
        title: "Inclusions",
        fields: [
          ["includedItems", "Included", "list"],
          ["excludedItems", "Excluded", "list"],
          ["whatToBring", "What to bring", "list"],
        ],
      },
      {
        title: "Pickup & drop-off",
        fields: [
          ["pickupAvailable", "Pickup available", "bool"],
          ["pickupNotes", "Pickup notes", "long"],
          ["dropoffAvailable", "Drop-off available", "bool"],
          ["dropoffNotes", "Drop-off notes", "long"],
        ],
      },
      {
        title: "Policies",
        fields: [
          ["cancellationPolicy", "Cancellation policy", "long"],
          ["childPolicy", "Child policy", "long"],
          ["accessibilityInfo", "Accessibility", "long"],
        ],
      },
    ],
  },
  Safari: {
    detailKey: "safariDetail",
    sections: [
      {
        title: "Safari overview",
        fields: [
          ["nationalPark", "National park"],
          ["safariType", "Safari type", "enum"],
          ["durationMinutes", "Duration", "minutes"],
          ["startTime", "Start time", "time"],
          ["endTime", "End time", "time"],
          ["bestSeason", "Best season"],
          ["guideIncluded", "Guide included", "bool"],
          ["privateAvailable", "Private available", "bool"],
          ["difficultyLevel", "Difficulty", "enum"],
          ["ageRestriction", "Age restriction"],
          ["groupSizeMin", "Min group size", "number"],
          ["groupSizeMax", "Max group size", "number"],
          ["languages", "Languages", "list"],
          ["wildlifeHighlights", "Wildlife highlights", "list"],
        ],
      },
      {
        title: "Inclusions",
        fields: [
          ["includedItems", "Included", "list"],
          ["excludedItems", "Excluded", "list"],
          ["whatToBring", "What to bring", "list"],
        ],
      },
      {
        title: "Pickup & policies",
        fields: [
          ["pickupSupported", "Pickup supported", "bool"],
          ["pickupNotes", "Pickup notes", "long"],
          ["cancellationPolicy", "Cancellation policy", "long"],
          ["accessibilityInfo", "Accessibility", "long"],
        ],
      },
    ],
  },
  Experience: {
    detailKey: "activityDetail",
    sections: [
      {
        title: "Experience overview",
        fields: [
          ["activityType", "Activity type", "enum"],
          ["meetingPoint", "Meeting point"],
          ["durationMinutes", "Duration", "minutes"],
          ["startTime", "Start time", "time"],
          ["endTime", "End time", "time"],
          ["difficultyLevel", "Difficulty", "enum"],
          ["ageRestriction", "Age restriction"],
          ["groupSizeMin", "Min group size", "number"],
          ["groupSizeMax", "Max group size", "number"],
          ["privateAvailable", "Private available", "bool"],
          ["languages", "Languages", "list"],
          ["highlights", "Highlights", "list"],
          ["availabilityNotes", "Availability notes", "long"],
        ],
      },
      {
        title: "Inclusions",
        fields: [
          ["includedItems", "Included", "list"],
          ["excludedItems", "Excluded", "list"],
          ["whatToBring", "What to bring", "list"],
        ],
      },
      {
        title: "Pickup & policies",
        fields: [
          ["pickupSupported", "Pickup supported", "bool"],
          ["pickupNotes", "Pickup notes", "long"],
          ["cancellationPolicy", "Cancellation policy", "long"],
          ["accessibilityInfo", "Accessibility", "long"],
        ],
      },
    ],
  },
  Transfer: {
    detailKey: "transferDetail",
    sections: [
      {
        title: "Transfer route",
        fields: [
          ["originType", "Origin type", "enum"],
          ["destinationType", "Destination type", "enum"],
          ["estimatedDurationMinutes", "Estimated duration", "minutes"],
          ["operatingStartTime", "Operating from", "time"],
          ["operatingEndTime", "Operating until", "time"],
          ["routeNotes", "Route notes", "long"],
        ],
      },
      {
        title: "Vehicle",
        fields: [
          ["vehiclePolicy", "Vehicle policy", "enum"],
          ["vehicleTypes", "Vehicle types", "list"],
          ["maxPassengers", "Max passengers", "number"],
          ["maxLuggage", "Max luggage", "number"],
          ["airConditioned", "Air-conditioned", "bool"],
          ["childSeatsAvailable", "Child seats", "bool"],
          ["meetAndGreetIncluded", "Meet & greet", "bool"],
        ],
      },
      {
        title: "Instructions & policies",
        fields: [
          ["pickupInstructions", "Pickup instructions", "long"],
          ["dropoffInstructions", "Drop-off instructions", "long"],
          ["includedItems", "Included", "list"],
          ["excludedItems", "Excluded", "list"],
          ["waitingTimePolicy", "Waiting time policy", "long"],
          ["cancellationPolicy", "Cancellation policy", "long"],
        ],
      },
    ],
  },
};

const snake = (key: string) => key.replace(/([A-Z])/g, "_$1").toLowerCase();
const humanize = (key: string) =>
  String(key)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());

// The admin API answers in snake_case or camelCase depending on the endpoint; accept both.
const pick = (obj: any, key: string) => {
  if (!obj || typeof obj !== "object") return undefined;
  return obj[key] ?? obj[snake(key)];
};

const isEmpty = (value: unknown) =>
  value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);

function formatMinutes(value: unknown) {
  const total = Number(value);
  if (!Number.isFinite(total)) return String(value);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

function formatTime(value: unknown) {
  const text = String(value);
  const match = text.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return text;
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${((hours + 11) % 12) + 1}:${match[2]} ${suffix}`;
}

function formatDateTime(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatMoney(amount: unknown, currency?: unknown) {
  const number = Number(amount);
  if (!Number.isFinite(number)) return null;
  return `${currency ? `${currency} ` : ""}${number.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const NOT_SET = (
  <span style={{ color: "var(--text-tertiary)" }}>Not set</span>
);

function renderValue(value: unknown, kind: Kind = "text"): ReactNode {
  if (isEmpty(value)) return NOT_SET;
  switch (kind) {
    case "bool":
      return value ? "Yes" : "No";
    case "minutes":
      return formatMinutes(value);
    case "time":
      return formatTime(value);
    case "enum":
      return humanize(String(value));
    case "number":
      return String(value);
    case "link":
      return (
        <a href={String(value)} target="_blank" rel="noreferrer noopener" className="underline break-all" style={{ color: "var(--accent-navy-light)" }}>
          {String(value)}
        </a>
      );
    case "list": {
      const items = (Array.isArray(value) ? value : [value]).map((item) => (typeof item === "object" ? JSON.stringify(item) : String(item)));
      return (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="px-2 py-0.5 rounded-md text-[12px]"
              style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              {item}
            </span>
          ))}
        </div>
      );
    }
    case "long":
      return <span className="whitespace-pre-line">{String(value)}</span>;
    default:
      return String(value);
  }
}

function Fact({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`min-w-0 ${wide ? "sm:col-span-2" : ""}`}>
      <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
      <div className="text-[13px] break-words" style={{ color: "var(--text-primary)" }}>
        {children}
      </div>
    </div>
  );
}

function FactGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{children}</div>;
}

function Chip({ children, tone }: { children: ReactNode; tone?: "good" | "muted" | "info" }) {
  const palette =
    tone === "good"
      ? { bg: "rgba(34,197,94,0.1)", fg: "#4ade80", bd: "rgba(34,197,94,0.25)" }
      : tone === "info"
        ? { bg: "rgba(59,130,246,0.12)", fg: "#60a5fa", bd: "rgba(59,130,246,0.25)" }
        : { bg: "rgba(100,116,139,0.12)", fg: "#94a3b8", bd: "rgba(100,116,139,0.25)" };
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ background: palette.bg, color: palette.fg, border: `1px solid ${palette.bd}` }}>
      {children}
    </span>
  );
}

export function ListingViewDrawer({ listing, onClose, onEdit, onManage }: ListingViewDrawerProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    (async () => {
      try {
        let result: any = null;
        try {
          result = await apiFetch<any>(`/admin/listings/${listing.id}`);
        } catch {
          result = await apiFetch<any>(`/listings/${listing.id}`);
        }
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listing.id]);

  const config = SECTIONS[listing.category];
  const detail = data ? pick(data, config?.detailKey ?? "") : null;
  const variants: any[] = Array.isArray(data?.variants) ? data.variants : [];
  const gallery: any[] = Array.isArray(data?.gallery) ? data.gallery.filter((item: any) => item?.url) : [];
  const itinerary: any[] = Array.isArray(pick(detail, "itinerary")) ? pick(detail, "itinerary") : [];
  const isActive = pick(data, "isActive");
  const fromPrice = pick(data, "fromPrice");
  const latitude = pick(data, "latitude");
  const longitude = pick(data, "longitude");
  const destination = data?.destination;
  const coverUrl = pick(data, "coverImage")?.url || listing.coverUrl;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} style={{ animation: "fadeIn 0.2s ease-out" }} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Listing ${listing.title}`}
        className="fixed right-0 top-0 h-full w-full max-w-[800px] z-50 overflow-y-auto"
        style={{
          background: "var(--bg-main)",
          borderLeft: "1px solid var(--border-light)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
          animation: "slideInRight 0.3s ease-out",
        }}
      >
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-start justify-between gap-4"
          style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border-light)" }}
        >
          <div className="min-w-0">
            <h2 className="text-[18px] mb-1 break-words" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {listing.title}
            </h2>
            <p className="text-[12px] font-mono mb-2 break-all" style={{ color: "var(--text-tertiary)" }}>
              {listing.id}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="info">{listing.category}</Chip>
              <Chip tone={listing.status === "Approved" || listing.status === "Active" ? "good" : "muted"}>{listing.status}</Chip>
              {isActive !== undefined && <Chip tone={isActive ? "good" : "muted"}>{isActive ? "Active" : "Inactive"}</Chip>}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0"
            style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-tertiary)" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loading && (
            <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              <Loader2 size={14} className="animate-spin" /> Loading full details…
            </div>
          )}
          {failed && (
            <p role="alert" className="text-[12px]" style={{ color: "var(--error)" }}>
              The full details could not be loaded, so only the summary is shown. Close and reopen to try again.
            </p>
          )}

          {coverUrl && (
            <img src={coverUrl} alt="" className="w-full h-52 object-cover rounded-xl" style={{ border: "1px solid var(--border-light)" }} />
          )}

          <DetailCard title="Overview">
            <FactGrid>
              <Fact label="Destination">{renderValue(destination?.name || listing.destination)}</Fact>
              <Fact label="Destination type">{renderValue(pick(destination, "destinationType"), "enum")}</Fact>
              <Fact label="Location">{renderValue(listing.location)}</Fact>
              <Fact label="Coordinates">
                {latitude != null && longitude != null ? `${latitude}, ${longitude}` : NOT_SET}
              </Fact>
              <Fact label="Starting price">
                {fromPrice?.amount != null ? (
                  <>
                    {formatMoney(fromPrice.amount, fromPrice.currency)}
                    {pick(fromPrice, "bookingUnit") ? ` · ${humanize(String(pick(fromPrice, "bookingUnit")))}` : ""}
                    {pick(fromPrice, "variantName") ? ` (${pick(fromPrice, "variantName")})` : ""}
                  </>
                ) : (
                  NOT_SET
                )}
              </Fact>
              <Fact label="Variants">{variants.length}</Fact>
              <Fact label="Created">{formatDateTime(pick(data, "createdAt")) || NOT_SET}</Fact>
              <Fact label="Last updated">{formatDateTime(pick(data, "updatedAt")) || listing.lastUpdated}</Fact>
            </FactGrid>
          </DetailCard>

          <DetailCard title="Description">
            {data?.description ? (
              <p className="text-[13px] whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                {data.description}
              </p>
            ) : (
              NOT_SET
            )}
          </DetailCard>

          <DetailCard title={`Pricing & variants (${variants.length})`}>
            {variants.length === 0 ? (
              NOT_SET
            ) : (
              <div className="space-y-3">
                {variants.map((variant, index) => {
                  const pricing = variant?.pricing;
                  const capacityMin = pick(variant, "capacityMin");
                  const capacityMax = pick(variant, "capacityMax");
                  return (
                    <div
                      key={variant?.id || index}
                      className="rounded-lg p-4"
                      style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 flex items-center gap-2 flex-wrap">
                          <span className="text-[14px] break-words" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                            {variant?.name || `Variant ${index + 1}`}
                          </span>
                          {pick(variant, "isDefault") && <Chip tone="info">Default</Chip>}
                        </div>
                        <span className="text-[15px] shrink-0" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                          {pricing?.amount != null ? formatMoney(pricing.amount, pricing.currency) : NOT_SET}
                        </span>
                      </div>
                      <FactGrid>
                        <Fact label="Booking unit">{renderValue(pick(variant, "bookingUnit"), "enum")}</Fact>
                        <Fact label="Capacity">
                          {capacityMin == null && capacityMax == null
                            ? NOT_SET
                            : `${capacityMin ?? "—"} – ${capacityMax ?? "—"}`}
                        </Fact>
                        <Fact label="Currency">{renderValue(pricing?.currency)}</Fact>
                        <Fact label="Price priority">{renderValue(pricing?.priority, "number")}</Fact>
                      </FactGrid>
                    </div>
                  );
                })}
              </div>
            )}
          </DetailCard>

          {config?.sections.map((section) => (
            <DetailCard key={section.title} title={section.title}>
              <FactGrid>
                {section.fields.map(([key, label, kind]) => (
                  <Fact key={key} label={label} wide={kind === "long" || kind === "list"}>
                    {detail ? renderValue(pick(detail, key), kind) : NOT_SET}
                  </Fact>
                ))}
              </FactGrid>
            </DetailCard>
          ))}

          {itinerary.length > 0 && (
            <DetailCard title={`Itinerary (${itinerary.length})`}>
              <ol className="space-y-3">
                {itinerary.map((step, index) => {
                  const entries = Object.entries(step || {}).filter(([, value]) => !isEmpty(value));
                  return (
                    <li
                      key={index}
                      className="rounded-lg p-3"
                      style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
                    >
                      <FactGrid>
                        {entries.map(([key, value]) => (
                          <Fact key={key} label={humanize(key)} wide={typeof value === "string" && value.length > 40}>
                            {renderValue(value, Array.isArray(value) ? "list" : typeof value === "string" && value.length > 40 ? "long" : "text")}
                          </Fact>
                        ))}
                      </FactGrid>
                    </li>
                  );
                })}
              </ol>
            </DetailCard>
          )}

          <DetailCard title={`Photos & media (${gallery.length})`}>
            {gallery.length === 0 ? (
              NOT_SET
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gallery.map((item, index) => (
                  <figure key={item.id || item.url || index} className="min-w-0">
                    <img
                      src={item.url}
                      alt={pick(item, "altText") || ""}
                      className="w-full h-28 object-cover rounded-lg"
                      style={{ border: "1px solid var(--border-light)" }}
                    />
                    <figcaption className="mt-1 text-[11px] break-words" style={{ color: "var(--text-tertiary)" }}>
                      {pick(item, "isCover") ? "Cover · " : ""}
                      {pick(item, "altText") || "No alt text"}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </DetailCard>
        </div>

        <div
          className="sticky bottom-0 px-6 py-4 flex items-center gap-3"
          style={{ background: "var(--bg-panel)", borderTop: "1px solid var(--border-light)" }}
        >
          <button
            onClick={onManage}
            className="flex-1 px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
            style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
          >
            <CalendarDays size={14} /> Calendar & bookings
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
            style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600 }}
          >
            <Edit2 size={14} /> Edit listing
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @media (prefers-reduced-motion: reduce) {
          [role="dialog"], .fixed.inset-0 { animation: none !important; }
        }
      `}</style>
    </>
  );
}

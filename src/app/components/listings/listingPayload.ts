import { normalizeStayRoomType, type PricingVariant, type RoomType } from "./listingEditorSections";

export type ListingFormCategory = "Stay" | "Tour" | "Safari" | "Experience";

/** What the listing form currently holds. */
export interface ListingDraftSnapshot {
  category: ListingFormCategory;
  title: string;
  active: boolean;
  description: string;
  destinationId: string;
  lat: string;
  lng: string;
  variants: PricingVariant[];
  subcategory: string | null;
  categoryData: Record<string, any>;
}

/** One thing that must be fixed before the listing can be saved, and the form section it belongs to. */
export interface ListingIssue {
  section: string;
  message: string;
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const list = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean) : [];
const num = (value: unknown): number | undefined => {
  if (value === null || value === undefined || String(value).trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const whole = (value: unknown): number | undefined => {
  const parsed = num(value);
  return parsed !== undefined ? Math.round(parsed) : undefined;
};
const positive = (value: unknown) => {
  const parsed = num(value);
  return parsed !== undefined && parsed > 0;
};

export function unitToBookingUnit(unit: string) {
  switch (unit) {
    case "Per Group":
      return "per_group";
    case "Per Vehicle":
      return "per_vehicle";
    case "Per Day":
      return "per_day";
    default:
      return "per_person";
  }
}

export function safariTypeToEnum(value?: string): "morning" | "evening" | "full_day" | "private" | "shared" {
  const lower = (value || "").trim().toLowerCase().replace(/[\s-]/g, "_");
  if (lower === "morning" || lower === "evening" || lower === "full_day" || lower === "private" || lower === "shared") return lower;
  if (lower.includes("full")) return "full_day";
  if (lower.includes("morning") || lower.includes("early")) return "morning";
  if (lower.includes("afternoon") || lower.includes("evening") || lower.includes("night")) return "evening";
  if (lower.includes("shared") || lower.includes("seat")) return "shared";
  return "private";
}

/** Safari prices live in jeep packages (only for the time slots that are switched on); the others use pricing variants. */
function activePackages(data: Record<string, any>) {
  const packages = Array.isArray(data.safariPackages) ? data.safariPackages : [];
  const slots: Record<string, boolean> = data.enabledSlots ?? {};
  return packages.filter((pkg: any) => {
    const slot = String(pkg.timeSlot || "").split(" ")[0];
    return slots[slot === "Full" ? "Full Day" : slot] !== false;
  });
}

// ── validation ────────────────────────────────────────────────────────────────

/**
 * Everything that must be right before saving. A draft only needs a title (and a destination for tours, safaris and
 * experiences); a listing that guests can see needs the full set.
 */
export function validateListing(snapshot: ListingDraftSnapshot, options: { asDraft: boolean }): ListingIssue[] {
  const issues: ListingIssue[] = [];
  const { category, categoryData: data } = snapshot;
  const add = (section: string, message: string) => issues.push({ section, message });
  const summarySection = category === "Stay" ? "summary" : "basic";

  if (!snapshot.title.trim()) add(summarySection, "Give the listing a title.");

  if (category !== "Stay") {
    if (!snapshot.destinationId) add("basic", "Choose the destination this listing belongs to.");
    const hasLat = snapshot.lat.trim() !== "";
    const hasLng = snapshot.lng.trim() !== "";
    if (hasLat !== hasLng) add("basic", "Enter both latitude and longitude, or leave both empty.");
    if (hasLat && hasLng) {
      const lat = num(snapshot.lat);
      const lng = num(snapshot.lng);
      if (lat === undefined || lat < -90 || lat > 90) add("basic", "Latitude must be a number between -90 and 90.");
      if (lng === undefined || lng < -180 || lng > 180) add("basic", "Longitude must be a number between -180 and 180.");
    }
  }

  if (options.asDraft) return issues;

  if (!snapshot.description.trim()) add(summarySection, "Add a short description so guests know what to expect.");

  if (category === "Safari") {
    if (!text(data.nationalPark)) add("details", "Choose the national park.");
    if (!positive(data.durationMinutes)) add("details", "Enter how long the safari lasts, in minutes.");
    const packages = activePackages(data);
    if (!packages.length) add("details", "Add at least one jeep package for an enabled time slot.");
    else if (packages.some((pkg: any) => !positive(pkg.price))) add("details", "Every jeep package needs a price above 0.");
    const min = num(data.minGroupSize);
    const max = num(data.maxGroupSize);
    if (min !== undefined && max !== undefined && min > max) add("details", "Minimum group size cannot be larger than the maximum.");
  }

  if (category === "Tour") {
    if (!positive(data.durationDays)) add("details", "Enter how many days the tour lasts.");
    if (!text(data.routeSummary)) add("details", "Summarise the route guests will travel.");
    if (!text(data.meetingPoint)) add("details", "Say where guests meet the tour.");
    const min = num(data.minGroupSize);
    const max = num(data.maxGroupSize);
    if (min !== undefined && max !== undefined && min > max) add("details", "Minimum group size cannot be larger than the maximum.");
  }

  if (category === "Experience") {
    if (!text(data.activityType)) add("details", "Choose the type of activity.");
    if (!text(data.meetingPoint)) add("details", "Say where guests meet.");
    if (!positive(data.durationMinutes)) add("details", "Enter how long the experience lasts, in minutes.");
    const min = num(data.minGroupSize);
    const max = num(data.maxGroupSize);
    if (min !== undefined && max !== undefined && min > max) add("details", "Minimum group size cannot be larger than the maximum.");
  }

  if (category === "Tour" || category === "Experience") {
    if (!snapshot.variants.length) add("pricing", "Add at least one price option.");
    else {
      if (snapshot.variants.some((variant) => !variant.name.trim())) add("pricing", "Name every price option.");
      if (snapshot.variants.some((variant) => !positive(variant.price))) add("pricing", "Every price option needs a price above 0.");
      const min = (variant: PricingVariant) => num(variant.minCapacity);
      const max = (variant: PricingVariant) => num(variant.maxCapacity);
      if (snapshot.variants.some((variant) => min(variant) !== undefined && max(variant) !== undefined && (min(variant) as number) > (max(variant) as number))) {
        add("pricing", "A price option's minimum guests cannot be larger than its maximum.");
      }
    }
  }

  if (category === "Stay") {
    const profile = (data.stayProfile ?? {}) as Record<string, any>;
    const details = (data.propertyDetails ?? {}) as Record<string, any>;
    if (!text(profile.propertyType)) add("property", "Choose the property type.");
    if (!text(profile.city)) add("property", "Enter the city the property is in.");
    if (!text(details.checkInTime) || !text(details.checkOutTime)) add("stay-details", "Set the check-in and check-out times.");

    const rooms = (data.roomTypes ?? []) as RoomType[];
    if (!rooms.length) add("rooms", "Add at least one room type.");
    rooms.forEach((room, index) => {
      const label = normalizeStayRoomType(room.type) || `Room ${index + 1}`;
      if (!normalizeStayRoomType(room.type).trim()) add("rooms", `Name room ${index + 1}.`);
      if (!positive(room.count)) add("rooms", `${label}: enter how many rooms of this type there are.`);
      if (!positive(room.maxGuests)) add("rooms", `${label}: enter the maximum number of guests.`);
      if (!positive(room.pricePerNight)) add("rooms", `${label}: enter a price per night above 0.`);
      let remaining = Number(room.pricePerNight) || 0;
      for (const discount of room.discounts ?? []) {
        const value = Number(discount.value);
        if (!discount.label.trim() || !Number.isFinite(value) || value <= 0) {
          add("rooms", `${label}: every discount needs a name and a value above 0.`);
          break;
        }
        if (discount.type === "percentage") {
          if (value > 100) {
            add("rooms", `${label}: a percentage discount cannot be more than 100.`);
            break;
          }
          remaining -= (remaining * value) / 100;
        } else {
          if (value > remaining) {
            add("rooms", `${label}: discounts add up to more than the room price.`);
            break;
          }
          remaining -= value;
        }
      }
    });
  }

  // Guests see photos, so a listing that is going live needs at least a cover image.
  const images = (data.images ?? {}) as { cover?: string; gallery?: string[] };
  if (!images.cover && !(images.gallery && images.gallery.length)) {
    add(category === "Stay" ? "images" : "media", "Add at least one photo; guests choose listings by their pictures.");
  }

  return issues;
}

// ── payload (Safari, Tour, Experience) ────────────────────────────────────────

function variantsPayload(snapshot: ListingDraftSnapshot) {
  const data = snapshot.categoryData;
  let variants: any[];
  if (snapshot.category === "Safari") {
    variants = activePackages(data).map((pkg: any, index: number) => {
      const slot = String(pkg.timeSlot || "").split(" ")[0] || "Morning";
      const name = String(pkg.name || "").toLowerCase().includes(slot.toLowerCase()) ? pkg.name : `${slot} Drive — ${pkg.name}`;
      return {
        name,
        bookingUnit: pkg.type === "shared_seat" ? "per_person" : "per_vehicle",
        capacityMin: 1,
        capacityMax: whole(pkg.capacityMax ?? pkg.maxPassengers),
        isDefault: index === 0,
        pricing: { amount: Number(pkg.price), currency: pkg.currency || "USD", priority: index },
      };
    });
  } else {
    variants = snapshot.variants.map((variant, index) => ({
      name: variant.name.trim(),
      bookingUnit: unitToBookingUnit(variant.unit),
      capacityMin: whole(variant.minCapacity),
      capacityMax: whole(variant.maxCapacity),
      isDefault: Boolean(variant.isDefault),
      pricing: { amount: Number(variant.price), currency: variant.currency || "USD", priority: index },
    }));
  }
  // The server wants exactly one default option.
  if (variants.length) {
    const first = variants.findIndex((variant) => variant.isDefault);
    variants.forEach((variant, index) => (variant.isDefault = index === (first === -1 ? 0 : first)));
  }
  return variants;
}

function detailPayload(snapshot: ListingDraftSnapshot) {
  const data = snapshot.categoryData;
  const optional = (entries: Record<string, unknown>) => {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(entries)) if (value !== undefined) out[key] = value;
    return out;
  };

  if (snapshot.category === "Safari") {
    return {
      safariDetail: {
        nationalPark: text(data.nationalPark),
        safariType: safariTypeToEnum(data.safariType || snapshot.subcategory || undefined),
        durationMinutes: whole(data.durationMinutes),
        guideIncluded: Boolean(data.guideIncluded),
        pickupSupported: Boolean(data.pickupSupported),
        privateAvailable: Boolean(data.privateAvailable),
        includedItems: list(data.includedItems),
        excludedItems: list(data.excludedItems),
        languages: list(data.languages),
        whatToBring: list(data.whatToBring),
        wildlifeHighlights: list(data.wildlifeHighlights),
        pickupNotes: text(data.pickupNotes),
        cancellationPolicy: text(data.cancellationPolicy),
        accessibilityInfo: text(data.accessibilityInfo),
        bestSeason: text(data.bestSeason),
        ageRestriction: text(data.ageRestriction),
        ...optional({
          difficultyLevel: text(data.difficultyLevel) || undefined,
          groupSizeMin: whole(data.minGroupSize),
          groupSizeMax: whole(data.maxGroupSize),
          startTime: text(data.startTime) || undefined,
          endTime: text(data.endTime) || undefined,
        }),
      },
    };
  }

  if (snapshot.category === "Tour") {
    const itinerary = Array.isArray(data.itinerary) ? data.itinerary : [];
    return {
      tourDetail: {
        durationDays: whole(data.durationDays) ?? (itinerary.length || 1),
        routeSummary: text(data.routeSummary),
        meetingPoint: text(data.meetingPoint),
        itinerary,
        itineraryHighlights: list(data.itineraryHighlights),
        additionalCategories: list(data.additionalCategories),
        includedItems: list(data.includedItems),
        excludedItems: list(data.excludedItems),
        languages: list(data.languages),
        whatToBring: list(data.whatToBring),
        privateAvailable: Boolean(data.privateAvailable),
        pickupAvailable: Boolean(data.pickupAvailable),
        dropoffAvailable: Boolean(data.dropoffAvailable),
        childPolicy: text(data.childPolicy),
        pickupNotes: text(data.pickupNotes),
        dropoffNotes: text(data.dropoffNotes),
        cancellationPolicy: text(data.cancellationPolicy),
        accessibilityInfo: text(data.accessibilityInfo),
        ...optional({
          categoryId: text(data.categoryId) || undefined,
          difficultyLevel: text(data.difficultyLevel) || undefined,
          groupSizeMin: whole(data.minGroupSize),
          groupSizeMax: whole(data.maxGroupSize),
          startTime: text(data.startTime) || undefined,
          endTime: text(data.endTime) || undefined,
        }),
      },
    };
  }

  return {
    activityDetail: {
      activityType: text(data.activityType),
      durationMinutes: whole(data.durationMinutes),
      meetingPoint: text(data.meetingPoint),
      includedItems: list(data.includedItems),
      excludedItems: list(data.excludedItems),
      languages: list(data.languages),
      whatToBring: list(data.whatToBring),
      highlights: list(data.highlights),
      ageRestriction: text(data.ageRestriction),
      pickupNotes: text(data.pickupNotes),
      availabilityNotes: text(data.availabilityNotes),
      cancellationPolicy: text(data.cancellationPolicy),
      accessibilityInfo: text(data.accessibilityInfo),
      ...optional({
        difficultyLevel: text(data.difficultyLevel) || undefined,
        groupSizeMin: whole(data.minGroupSize),
        groupSizeMax: whole(data.maxGroupSize),
        startTime: text(data.startTime) || undefined,
        endTime: text(data.endTime) || undefined,
        privateAvailable: typeof data.privateAvailable === "boolean" ? data.privateAvailable : undefined,
        pickupSupported: typeof data.pickupSupported === "boolean" ? data.pickupSupported : undefined,
      }),
    },
  };
}

/**
 * The body sent to `/admin/listings/<category>` (create) or `/admin/listings/<category>/<id>` (update).
 * Nothing is invented: what is empty stays empty, and validateListing() has already stopped anything required.
 */
export function buildListingPayload(
  snapshot: ListingDraftSnapshot,
  options: { mode: "create"; status: "draft" | "published" } | { mode: "edit" },
) {
  const lat = num(snapshot.lat);
  const lng = num(snapshot.lng);
  const payload: Record<string, any> = {
    title: snapshot.title.trim(),
    description: snapshot.description.trim(),
    ...(snapshot.destinationId ? { destinationId: snapshot.destinationId } : {}),
    ...(lat !== undefined && lng !== undefined ? { latitude: lat, longitude: lng } : {}),
    ...detailPayload(snapshot),
  };
  const variants = variantsPayload(snapshot);
  if (variants.length) payload.variants = variants;

  if (options.mode === "create") {
    payload.status = options.status;
    payload.isActive = options.status === "published";
  } else {
    payload.isActive = snapshot.active;
  }
  return payload;
}

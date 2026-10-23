import React, { useState, useEffect, useRef } from "react";
import { useListingDraftStore } from "../stores/listingDraftStore";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import type { Category } from "../stores/listingDraftStore";
import { apiFetch } from "./api/apiClient";
import {
  CATEGORY_ORDER,
  LISTING_FLOW_SCHEMA,
  type CategoryIconKey,
  type FlowTreeBranch,
} from "./listings/listingFlowSchema";
import {
  Info,
  MapPin,
  Navigation,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Shield,
  Plus,
  Trash2,
  Globe,
  Clock,
  Users,
  Star,
  Check,
  AlertTriangle,
  Upload,
  GripVertical,
  Building2,
  Layers,
  Compass,
  Anchor,
  Car,
  PencilLine,
} from "lucide-react";
import {
  CreateWizardMultiSelectStep,
  CreateWizardTreeSelectionStep,
  CreateWizardTypeStep,
  FieldLabel,
  FormInput,
  FormTextarea,
  SelectField,
  SectionCard,
  TagInput,
  Toggle,
} from "./listings/listingEditorShared";
import { ListingEditDrawer } from "./listings/ListingEditDrawer";
import {
  CategoryDetailsTab,
  BasicInfoTab,
  DestinationTab,
  MediaTab,
  PoliciesTab,
  RoomsSection,
  ImagesSection,
  PricingTab,
  normalizeStayRoomType,
  type PricingVariant,
  type RoomType,
  type DestinationOption,
} from "./listings/listingEditorSections";
import {
  buildListingPayload,
  validateListing,
  type ListingDraftSnapshot,
  type ListingFormCategory,
  type ListingIssue,
} from "./listings/listingPayload";
import { useToast } from "./shared/Toast";

type ListingMode = "create" | "edit";
type TabId = "basic" | "destination" | "media" | "pricing" | "category" | "policies";
type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;
type StayEditTabId = "property" | "rooms" | "rates" | "images" | "summary";

interface ListingEditorProps {
  mode: ListingMode;
  /** Edit this listing instead of the one in the URL (used when the editor is opened in a drawer). */
  listingId?: string | null;
  /** "drawer" shows the Stay / Tour / Safari / Experience form in a panel that slides in from the right. */
  presentation?: "page" | "drawer";
  onClose?: () => void;
  /** Called after the listing was saved, so the list behind the drawer can refresh. */
  onSaved?: () => void;
  /** The drawer only edits Safari, Tour, Experience and Stay listings; anything else should open the full editor. */
  onUnsupportedCategory?: () => void;
  /** Create mode: open with this kind of listing already chosen. */
  initialCategory?: Category | null;
}

interface StayPropertyResponse {
  id: string;
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
  paymentPolicy?: string | null;
  contact?: Record<string, any>;
  policies?: Record<string, any>;
  media?: Array<Record<string, any>>;
  amenities?: Array<{ name: string }>;
  roomTypes?: Array<{
    id: string;
    name: string;
    description?: string | null;
    size?: string | null;
    maxGuests?: string | null;
    basePrice?: number | string | null;
    currency: string;
    bedConfiguration?: Record<string, any>;
    bathroom?: Record<string, any>;
    discounts?: any[];
    images?: Array<{ url: string }>;
    roomUnits?: unknown[];
  }>;
  metadata?: Record<string, any>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TABS: { id: TabId; label: string; icon: React.ComponentType<any> }[] = [
  { id: "basic", label: "Basic Info", icon: Info },
  { id: "destination", label: "Destination", icon: MapPin },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "pricing", label: "Pricing Variants", icon: DollarSign },
  { id: "category", label: "Category Details", icon: Tag },
  { id: "policies", label: "Policies", icon: Shield },
];

const STAY_EDIT_TABS: { id: TabId; label: string; icon: React.ComponentType<any> }[] = [
  { id: "basic", label: "Basic Info", icon: Info },
  { id: "destination", label: "Location", icon: MapPin },
  { id: "media", label: "Property Details", icon: Building2 },
  { id: "category", label: "Rooms", icon: Layers },
  { id: "pricing", label: "Rate Plans", icon: DollarSign },
  { id: "policies", label: "Images", icon: ImageIcon },
];

const STAY_EDIT_SECTIONS: { id: StayEditTabId; label: string; icon: React.ComponentType<any> }[] = [
  { id: "property", label: "Property Details", icon: Building2 },
  { id: "rooms", label: "Rooms", icon: Layers },
  { id: "rates", label: "Rate Plans", icon: DollarSign },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "summary", label: "Listing Summary", icon: Info },
];

function getEditorTabs(category: Category | null) {
  return category === "Stay" ? STAY_EDIT_TABS : TABS;
}

const ICON_BY_KEY: Record<CategoryIconKey, React.ComponentType<any>> = {
  stay: Building2,
  tour: Compass,
  safari: Globe,
  experience: Anchor,
  transfer: Car,
};

const CATEGORIES = CATEGORY_ORDER.map((id) => {
  const definition = LISTING_FLOW_SCHEMA[id];
  return {
    ...definition,
    icon: ICON_BY_KEY[definition.iconKey],
  };
});

const IMPLEMENTED_STAY_SUBTYPES = new Set(["hotel", "bed-breakfast"]);

function getFlow(category: Category) {
  return LISTING_FLOW_SCHEMA[category];
}

function getTreeOptionLabel(category: Category | null, optionId?: string | null) {
  if (!category || !optionId) return null;
  const branches = getFlow(category).treeSelection?.branches ?? [];
  for (const branch of branches) {
    const option = branch.options.find((item) => item.id === optionId);
    if (option) return option.label;
  }
  return null;
}

const CREATE_STEPS: { id: WizardStep; label: string; description: string }[] = [
  { id: 1, label: "Choose type", description: "Pick the listing flow" },
  { id: 2, label: "Core details", description: "Name, destination, basics" },
  { id: 3, label: "Media & pricing", description: "Images and rate cards" },
  { id: 4, label: "Details & policy", description: "Category fields and rules" },
  { id: 5, label: "Rate plans", description: "Review pricing and finish setup" },
  { id: 6, label: "Images", description: "Property cover and gallery" },
];

const SAFARI_CREATE_STEPS: { id: WizardStep; label: string; description: string }[] = [
  { id: 1, label: "Choose type", description: "Pick the listing flow" },
  { id: 2, label: "Core details", description: "Name, destination, coordinates" },
  { id: 3, label: "Safari & Packages", description: "Park, jeep packages & wildlife" },
  { id: 4, label: "Media & Photos", description: "Cover & gallery images" },
  { id: 5, label: "Policies & Finish", description: "Rules & submit listing" },
];

function getCreateSteps(category: Category | null) {
  if (category === "Safari") {
    return SAFARI_CREATE_STEPS;
  }
  const flow = category ? getFlow(category) : null;
  const isTreeSelectionStep = flow?.step2Layout === "tree-selector";
  const hasStep3MultiSelect = !!flow?.step3MultiSelect;

  return CREATE_STEPS.map((step) => {
    if (step.id === 2 && isTreeSelectionStep) {
      return {
        ...step,
        label: "Type selection",
        description: "Choose branch and listing subtype",
      };
    }

    if (step.id === 3 && hasStep3MultiSelect) {
      return {
        ...step,
        label: "Property features",
        description: "Choose property features (amenities)",
      };
    }

    return step;
  });
}

type RatePlanSectionId = "standard" | "group" | "family" | "nonRefundable";

type RatePlanGroupRow = {
  groups: string;
  guestsPerGroup: string;
  amount: string;
  currency: string;
};

type RatePlanDraft = {
  standardCancellationPolicy: string;
  standardNotes: string[];
  groupRates: RatePlanGroupRow[];
  childPolicy: string;
  childAgeGroup: string;
  childNotes: string[];
  nonRefundablePolicy: string;
  nonRefundableNotes: string[];
};

const DEFAULT_RATE_PLAN_DRAFT: RatePlanDraft = {
  standardCancellationPolicy:
    "Free cancellation up to 7 days before arrival. Cancellations made 3 to 7 days before arrival are charged 50%. No refund inside 72 hours or for no-shows.",
  standardNotes: [
    "Guests can cancel for free up to 1 day before their arrival",
    "Guests who cancel within 24 hours will have their cancellation fee waived",
  ],
  groupRates: [
    { groups: "1", guestsPerGroup: "2", amount: "14.00", currency: "USD" },
    { groups: "2", guestsPerGroup: "2", amount: "14.00", currency: "USD" },
  ],
  childPolicy: "Children stay free when sharing the existing bedding with an adult.",
  childAgeGroup: "0 - 5 years",
  childNotes: ["Add a family badge so the rate plan is easier to spot during review"],
  nonRefundablePolicy:
    "Guests pay 10% less than the standard rate and the booking cannot be refunded after confirmation.",
  nonRefundableNotes: ["Guests can't cancel their booking for free at any time"],
};

// Pre-filled data
const DEFAULT_DATA = {
  title: "Yala National Park Safari",
  active: true,
  description:
    "Experience the wild heart of Sri Lanka at Yala National Park — home to the world's highest density of leopards. This half-day jeep safari takes you through the park's diverse ecosystems: arid scrubland, coastal lagoons, and ancient temples. Expert naturalist guides ensure you spot the elusive leopard, herds of elephants, sloth bears, water buffalo, and hundreds of bird species.",
  destination: "Yala National Park, Hambantota",
  lat: "6.3728",
  lng: "81.5156",
};

const RATE_PLAN_CURRENCIES = ["LKR", "USD", "EUR", "GBP", "AUD", "SGD"];

function normalizeGroupRateRow(row: any, index: number): RatePlanGroupRow {
  if (row?.groups !== undefined || row?.guestsPerGroup !== undefined || row?.amount !== undefined) {
    return {
      groups: String(row.groups ?? "1"),
      guestsPerGroup: String(row.guestsPerGroup ?? "2"),
      amount: String(row.amount ?? ""),
      currency: String(row.currency ?? "USD"),
    };
  }

  const [groupsPart, perGroupPart] = String(row?.occupancy ?? `${index + 1} x 2`)
    .split("x")
    .map((part) => part.trim());
  const payMatch = String(row?.guestsPay ?? "USD 0.00").match(/^([A-Z]{3})\s+(.+)$/);

  return {
    groups: groupsPart || String(index + 1),
    guestsPerGroup: perGroupPart || "2",
    currency: payMatch?.[1] ?? "USD",
    amount: payMatch?.[2] ?? "",
  };
}

function isImplementedStaySubtype(category: Category | null, optionId?: string | null) {
  return category !== "Stay" || (!!optionId && IMPLEMENTED_STAY_SUBTYPES.has(optionId));
}

function normalizeRatePlanDraft(value?: RatePlanDraft): RatePlanDraft {
  const source = value ?? DEFAULT_RATE_PLAN_DRAFT;
  return {
    ...DEFAULT_RATE_PLAN_DRAFT,
    ...source,
    groupRates: (source.groupRates?.length ? source.groupRates : DEFAULT_RATE_PLAN_DRAFT.groupRates).map(normalizeGroupRateRow),
  };
}

function formatGroupRate(row: RatePlanGroupRow) {
  const amount = Number(row.amount);
  const displayAmount = Number.isFinite(amount) ? amount.toFixed(2) : row.amount || "0.00";
  return `${row.currency} ${displayAmount}`;
}

function isUuid(value: string | null) {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function stayPropertyToRoomType(roomType: NonNullable<StayPropertyResponse["roomTypes"]>[number]): RoomType {
  const bedConfiguration = roomType.bedConfiguration ?? {};
  const bathroom = roomType.bathroom ?? {};
  return {
    id: roomType.id,
    type: roomType.name,
    description: roomType.description ?? "",
    count: String(roomType.totalUnits ?? roomType.roomUnits?.length ?? 1),
    beds: String(bedConfiguration.beds ?? 0),
    hasBeds: Boolean(bedConfiguration.hasBeds),
    cribs: String(bedConfiguration.cribs ?? 0),
    maxGuests: String(roomType.maxGuests ?? ""),
    size: String(roomType.size ?? ""),
    smoking: false,
    bathroomType: String(bathroom.type ?? "Private"),
    bathroomItems: Array.isArray(bathroom.items) ? bathroom.items : [],
    guestAccess: false,
    pricePerNight: String(roomType.basePrice ?? ""),
    currency: roomType.currency || "LKR",
    discounts: Array.isArray(roomType.discounts) ? roomType.discounts : [],
    bedBreakdown: bedConfiguration.breakdown ?? {},
    gallery: (roomType.images ?? []).map((image) => image.url).filter(Boolean),
  };
}

function hydrateStayDraft(property: StayPropertyResponse) {
  const cover = property.media?.find((item) => item.role === "cover" && item.url)?.url ?? "";
  const gallery = property.media?.filter((item) => item.role !== "cover" && item.url).map((item) => item.url as string) ?? [];
  const policies = property.policies ?? {};
  return {
    category: "Stay" as Category,
    subcategory: property.propertyType,
    title: property.name,
    active: ["approved", "published", "submitted"].includes(String(property.status || "").toLowerCase()),
    description: property.description ?? "",
    destination: property.city || property.address || "",
    lat: property.latitude != null ? String(property.latitude) : "",
    lng: property.longitude != null ? String(property.longitude) : "",
    categoryData: {
      paymentPolicy: property.paymentPolicy || (property as any).payment_policy || (policies as any).paymentPolicy || "pay_at_property",
      // What the database already holds that the editor must write back unchanged (the update replaces whole columns).
      stayProfile: {
        propertyType: property.propertyType ?? "",
        address: property.address ?? "",
        city: property.city ?? "",
        district: property.district ?? "",
        phone: property.contact?.phone ?? "",
        email: property.contact?.email ?? "",
        website: property.contact?.website ?? "",
        applicationNote: property.applicationNote ?? "",
      },
      stayOriginal: {
        status: String(property.status || "").toLowerCase(),
        activeAtLoad: ["approved", "published", "submitted"].includes(String(property.status || "").toLowerCase()),
        contact: property.contact ?? {},
        policies: property.policies ?? {},
        metadata: property.metadata ?? {},
      },
      propertyDetails: {
        propertyName: property.name,
        propertyLocation: property.address || property.city || "",
        breakfastIncluded: Boolean(policies.breakfastIncluded),
        parking: Boolean(policies.parking),
        languages: property.contact?.languages ?? [],
        houseRules: policies.houseRules ?? {},
        checkInTime: policies.checkInTime ?? "",
        checkOutTime: policies.checkOutTime ?? "",
      },
      amenities: property.amenities?.map((amenity) => amenity.name) ?? [],
      roomTypes: property.roomTypes?.map(stayPropertyToRoomType) ?? [],
      ratePlans: normalizeRatePlanDraft(policies.ratePlans as RatePlanDraft | undefined),
      images: { cover, gallery },
      hostProfile: property.metadata?.hostProfile ?? {},
    },
  };
}

function hydrateGeneralListingDraft(listingData: any) {
  const categoryMap: Record<string, Category> = {
    hotel: "Stay",
    stay: "Stay",
    safari: "Safari",
    tour: "Tour",
    transfer: "Transport",
    transport: "Transport",
    experience: "Experience",
  };

  const rawType = String(listingData.category || listingData.listing_type || listingData.listingType || "hotel").toLowerCase();
  const category: Category = categoryMap[rawType] || "Stay";

  const cover = listingData.cover_image?.url || listingData.coverMedia?.secure_url || "";
  const galleryItems: any[] = (listingData.gallery || []).filter((img: any) => img?.url || img?.secure_url);
  const gallery = galleryItems.map((img: any) => img.url || img.secure_url);
  // The ids of the photos already stored, so that removing one in the form can delete it on save.
  const imageIds: Record<string, string> = {};
  for (const img of [listingData.cover_image, ...galleryItems]) {
    const url = img?.url || img?.secure_url;
    if (url && img?.id) imageIds[url] = img.id;
  }

  const unitFromApi = (unit: string | undefined) =>
    unit === "per_vehicle" ? "Per Vehicle" : unit === "per_group" ? "Per Group" : unit === "per_day" ? "Per Day" : "Per Person";
  const variants: PricingVariant[] = (listingData.variants || []).map((v: any, index: number) => ({
    id: v.id || `var_${index + 1}`,
    name: v.name || `Option ${index + 1}`,
    unit: unitFromApi(v.booking_unit ?? v.bookingUnit),
    minCapacity: (v.capacity_min ?? v.capacityMin) != null ? String(v.capacity_min ?? v.capacityMin) : "",
    maxCapacity: (v.capacity_max ?? v.capacityMax) != null ? String(v.capacity_max ?? v.capacityMax) : "",
    price: v.pricing?.amount != null ? String(v.pricing.amount) : "",
    currency: v.pricing?.currency || listingData.base_currency || "USD",
    priority: index + 1,
    isDefault: (v.is_default ?? v.isDefault) ?? (index === 0),
  }));

  const safariDet = listingData.safari_detail || listingData.safariDetail || {};
  const tourDet = listingData.tour_detail || listingData.tourDetail || {};
  const actDet = listingData.activity_detail || listingData.activityDetail || {};
  const transDet = listingData.transfer_detail || listingData.transferDetail || {};
  const hotelDet = listingData.hotel_detail || listingData.hotelDetail || {};

  // Read a saved value under either spelling; anything missing stays empty instead of being filled with a sample value.
  const pick = (detail: any, ...keys: string[]) => {
    for (const key of keys) if (detail?.[key] !== undefined && detail?.[key] !== null) return detail[key];
    return undefined;
  };
  const str = (value: unknown) => (value === undefined || value === null ? "" : String(value));
  const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item) => typeof item === "string") : []);

  const safariPackages = (safariDet.jeep_packages && safariDet.jeep_packages.length > 0)
    ? safariDet.jeep_packages
    : variants.map((v, idx) => {
      const nameLower = (v.name || "").toLowerCase();
      let timeSlot = "Morning (06:00 AM – 10:00 AM)";
      if (nameLower.includes("afternoon") || nameLower.includes("evening") || nameLower.includes("02:30")) {
        timeSlot = "Afternoon (02:30 PM – 06:30 PM)";
      } else if (nameLower.includes("full day") || nameLower.includes("fullday") || nameLower.includes("12 hr")) {
        timeSlot = "Full Day (06:00 AM – 06:00 PM)";
      }
      return {
        id: v.id || `pkg_${idx + 1}`,
        name: v.name || `Safari Package ${idx + 1}`,
        type: v.unit === "Per Person" ? "shared_seat" : timeSlot.startsWith("Full") ? "full_day" : "private_jeep",
        capacityMax: Number(v.maxCapacity) || 6,
        price: Number(v.price) || 0,
        currency: v.currency || "USD",
        timeSlot,
        durationLabel: timeSlot.includes("Full Day") ? "12 Hours (06:00 AM – 06:00 PM)" : "4 Hours",
        description: "",
        includesParkFees: true,
      };
    });

  const shared = category === "Safari" ? safariDet : category === "Tour" ? tourDet : {};

  return {
    category,
    subcategory: hotelDet.property_type || safariDet.safari_type || actDet.activity_type || null,
    title: listingData.title || "",
    active: listingData.is_active ?? (listingData.status === "PUBLISHED"),
    description: listingData.description || "",
    destination: listingData.destination?.name || "",
    destinationId: listingData.destination?.id || listingData.destination_id || listingData.destinationId || "",
    lat: listingData.latitude != null ? String(listingData.latitude) : "",
    lng: listingData.longitude != null ? String(listingData.longitude) : "",
    variants,
    categoryData: {
      propertyDetails: hotelDet.property_name ? {
        propertyName: hotelDet.property_name || listingData.title,
        propertyLocation: hotelDet.short_location || hotelDet.city || "",
        checkInTime: hotelDet.check_in_time || "14:00",
        checkOutTime: hotelDet.check_out_time || "11:00",
        breakfastIncluded: hotelDet.meal_plans?.includes("breakfast"),
        parking: hotelDet.parking_available,
        languages: hotelDet.languages_spoken || [],
      } : {},
      amenities: hotelDet.amenities || [],
      roomTypes: hotelDet.room_types || [],
      images: { cover, gallery },
      imageIds,
      // Fields shared by Safari and Tour
      difficultyLevel: str(pick(shared, "difficulty_level", "difficultyLevel")),
      minGroupSize: str(pick(shared, "group_size_min", "groupSizeMin")),
      maxGroupSize: str(pick(shared, "group_size_max", "groupSizeMax")),
      startTime: str(pick(shared, "start_time", "startTime")),
      endTime: str(pick(shared, "end_time", "endTime")),
      privateAvailable: Boolean(pick(shared, "private_available", "privateAvailable")),
      includedItems: strings(pick(shared, "included_items", "includedItems")),
      excludedItems: strings(pick(shared, "excluded_items", "excludedItems")),
      languages: strings(pick(shared, "languages")),
      whatToBring: strings(pick(shared, "what_to_bring", "whatToBring")),
      pickupNotes: str(pick(shared, "pickup_notes", "pickupNotes")),
      cancellationPolicy: str(pick(shared, "cancellation_policy", "cancellationPolicy")),
      accessibilityInfo: str(pick(shared, "accessibility_info", "accessibilityInfo")),
      // Safari
      nationalPark: str(pick(safariDet, "national_park", "nationalPark")),
      safariType: str(pick(safariDet, "safari_type", "safariType")),
      durationMinutes: str(pick(safariDet, "duration_minutes", "durationMinutes")),
      ageRestriction: str(pick(safariDet, "age_restriction", "ageRestriction")),
      bestSeason: str(pick(safariDet, "best_season", "bestSeason")),
      guideIncluded: Boolean(pick(safariDet, "guide_included", "guideIncluded") ?? true),
      pickupSupported: Boolean(pick(safariDet, "pickup_supported", "pickupSupported") ?? true),
      wildlifeHighlights: strings(pick(safariDet, "wildlife_highlights", "wildlifeHighlights")),
      safariPackages,
      // Tour
      durationDays: str(pick(tourDet, "duration_days", "durationDays")),
      routeSummary: str(pick(tourDet, "route_summary", "routeSummary")),
      meetingPoint: str(pick(tourDet, "meeting_point", "meetingPoint")),
      categoryId: str(pick(tourDet, "category_id", "categoryId")),
      additionalCategories: strings(pick(tourDet, "additional_categories", "additionalCategories")),
      itinerary: Array.isArray(tourDet.itinerary) ? tourDet.itinerary : [],
      itineraryHighlights: strings(pick(tourDet, "itinerary_highlights", "itineraryHighlights")),
      signatureDestinations: (tourDet.signature_destinations && tourDet.signature_destinations.length > 0)
        ? tourDet.signature_destinations
        : (tourDet.signatureDestinations && tourDet.signatureDestinations.length > 0)
          ? tourDet.signatureDestinations
          : (tourDet.route_summary || tourDet.routeSummary || "")
            ? (tourDet.route_summary || tourDet.routeSummary)
                .split(/\s*[\u2022•\uFFFD\->|]\s*/)
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [],
      pickupAvailable: Boolean(pick(tourDet, "pickup_available", "pickupAvailable")),
      dropoffAvailable: Boolean(pick(tourDet, "dropoff_available", "dropoffAvailable")),
      childPolicy: str(pick(tourDet, "child_policy", "childPolicy")),
      dropoffNotes: str(pick(tourDet, "dropoff_notes", "dropoffNotes")),
      // Activity details hydration
      activityType: actDet.activity_type || "",
      // Transfer details hydration
      originType: transDet.origin_type || "airport",
      destinationType: transDet.destination_type || "city",
      vehiclePolicy: transDet.vehicle_policy || "",
      vehicleTypes: transDet.vehicle_types || [],
      maxPassengers: transDet.max_passengers != null ? String(transDet.max_passengers) : "4",
      maxLuggage: transDet.max_luggage != null ? String(transDet.max_luggage) : "4",
      airConditioned: transDet.air_conditioned ?? true,
      // Experience (activity) fields come from the saved activity detail
      ...(category === "Experience" ? hydrateExperienceCategoryData(actDet) : {}),
    },
  };
}

function normalizeSafariTypeEnum(val?: string): "morning" | "evening" | "full_day" | "private" | "shared" {
  if (!val) return "private";
  const lower = val.trim().toLowerCase().replace(/[\s-]/g, "_");
  if (lower === "morning" || lower === "evening" || lower === "full_day" || lower === "private" || lower === "shared") {
    return lower;
  }
  if (lower.includes("full")) return "full_day";
  if (lower.includes("morning") || lower.includes("early")) return "morning";
  if (lower.includes("afternoon") || lower.includes("evening") || lower.includes("night")) return "evening";
  if (lower.includes("shared") || lower.includes("seat")) return "shared";
  return "private";
}

/** The activity (Experience) fields from the saved listing, in the shape the edit form uses. */
function hydrateExperienceCategoryData(act: any): Record<string, any> {
  const text = (value: unknown) => (value == null ? undefined : String(value));
  const time = (value: unknown) => (typeof value === "string" && value ? value.slice(0, 5) : "");
  const list = (value: unknown) => (Array.isArray(value) ? value : []);
  return {
    activityType: act.activity_type || undefined,
    meetingPoint: act.meeting_point ?? "",
    durationMinutes: text(act.duration_minutes) ?? "180",
    difficultyLevel: act.difficulty_level ?? "Easy",
    ageRestriction: act.age_restriction ?? "",
    minGroupSize: text(act.group_size_min) ?? "1",
    maxGroupSize: text(act.group_size_max) ?? "10",
    startTime: time(act.start_time),
    endTime: time(act.end_time),
    privateAvailable: act.private_available ?? undefined,
    pickupSupported: act.pickup_supported ?? undefined,
    highlights: list(act.highlights),
    includedItems: list(act.included_items),
    excludedItems: list(act.excluded_items),
    languages: list(act.languages),
    whatToBring: list(act.what_to_bring),
    pickupNotes: act.pickup_notes ?? "",
    availabilityNotes: act.availability_notes ?? "",
    cancellationPolicy: act.cancellation_policy ?? "",
    accessibilityInfo: act.accessibility_info ?? "",
  };
}

/** Builds the activityDetail the server receives from what is in the Experience form (not fixed placeholder values). */
function buildActivityDetailPayload(data: Record<string, any>, subcategory: string | null | undefined, destination: string) {
  const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);
  const freeText = (value: unknown) => (typeof value === "string" ? value.trim() : undefined);
  const list = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()) : [];
  const whole = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
  };
  const languages = list(data.languages);

  const detail: Record<string, any> = {
    activityType: text(data.activityType) || subcategory || "Sightseeing",
    durationMinutes: whole(data.durationMinutes) ?? 180,
    meetingPoint: text(data.meetingPoint) || destination || "City Center",
    includedItems: list(data.includedItems),
    excludedItems: list(data.excludedItems),
    languages: languages.length > 0 ? languages : ["English"],
    whatToBring: list(data.whatToBring),
    highlights: list(data.highlights),
  };

  const optional: Record<string, unknown> = {
    startTime: text(data.startTime),
    endTime: text(data.endTime),
    difficultyLevel: text(data.difficultyLevel),
    ageRestriction: freeText(data.ageRestriction),
    groupSizeMin: whole(data.minGroupSize),
    groupSizeMax: whole(data.maxGroupSize),
    privateAvailable: typeof data.privateAvailable === "boolean" ? data.privateAvailable : undefined,
    pickupSupported: typeof data.pickupSupported === "boolean" ? data.pickupSupported : undefined,
    pickupNotes: freeText(data.pickupNotes),
    availabilityNotes: freeText(data.availabilityNotes),
    cancellationPolicy: freeText(data.cancellationPolicy),
    accessibilityInfo: freeText(data.accessibilityInfo),
  };
  for (const [key, value] of Object.entries(optional)) {
    if (value !== undefined) detail[key] = value;
  }
  return detail;
}

function toOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  const str = String(value).trim();
  if (!str) return undefined;
  const parsed = Number(str);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function buildStayApplicationPayload({
  active,
  title,
  description,
  destination,
  lat,
  lng,
  subcategory,
  categoryData,
  isAdmin,
}: {
  active?: boolean;
  title: string;
  description: string;
  destination: string;
  lat: string;
  lng: string;
  subcategory: string | null;
  categoryData: Record<string, any>;
  isAdmin?: boolean;
}) {
  const propertyDetails = categoryData.propertyDetails ?? {};
  const images = categoryData.images ?? {};
  const rooms = ((categoryData.roomTypes ?? []) as RoomType[]).map((room) => {
    const roomType = normalizeStayRoomType(room.type);
    return {
      id: room.id && isUuid(room.id) ? room.id : undefined,
      name: roomType,
      description: room.description ?? "",
      count: Number(room.count) || 1,
      unitPrefix: roomType
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 4)
        .toUpperCase() || "RM",
      size: room.size || undefined,
      sizeUnit: room.size ? "sqm" : undefined,
      maxGuests: Number(room.maxGuests) || undefined,
      basePrice: Number(room.pricePerNight) || undefined,
      currency: room.currency || "LKR",
      smoking: toBoolean(room.smoking),
      guestAccess: toBoolean(room.guestAccess),
      bedConfiguration: {
        hasBeds: room.hasBeds ?? false,
        beds: Number(room.beds) || 0,
        cribs: Number(room.cribs) || 0,
        breakdown: room.bedBreakdown ?? {},
      },
      bathroom: {
        type: room.bathroomType,
        items: room.bathroomItems ?? [],
      },
      discounts: room.discounts ?? [],
      images: (room.gallery ?? []).map((url, index) => ({ url, sortOrder: index, isPrimary: index === 0 })),
      metadata: {
        localDraftId: room.id,
      },
    };
  });

  const profile = (categoryData.stayProfile ?? {}) as Record<string, any>;
  const original = (categoryData.stayOriginal ?? {}) as Record<string, any>;
  // The drawer edits the title as the property name and address / city / district as separate fields.
  const drawerFields = profile.titleIsName === true;
  const orNull = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null);

  const propertyName = drawerFields
    ? title || propertyDetails.propertyName || "Untitled stay"
    : propertyDetails.propertyName || title || getTreeOptionLabel("Stay", subcategory) || "Untitled stay";
  const propertyLocation = propertyDetails.propertyLocation || destination;

  const contact: Record<string, any> = { ...(original.contact ?? {}), languages: propertyDetails.languages ?? [] };
  if (profile.phone !== undefined) contact.phone = orNull(profile.phone);
  if (profile.email !== undefined) contact.email = orNull(profile.email);
  if (profile.website !== undefined) contact.website = orNull(profile.website);

  return {
    name: propertyName,
    propertyType: profile.propertyType || subcategory || "hotel",
    description,
    address: drawerFields ? orNull(profile.address) : propertyLocation,
    city: drawerFields ? orNull(profile.city) : propertyLocation,
    district: drawerFields ? orNull(profile.district) : (profile.district ? orNull(profile.district) : undefined),
    applicationNote: orNull(profile.applicationNote) ?? undefined,
    latitude: toOptionalNumber(lat),
    longitude: toOptionalNumber(lng),
    status: active ? (isAdmin ? "approved" : "submitted") : "draft",
    paymentPolicy: categoryData.paymentPolicy || "pay_at_property",
    contact,
    policies: {
      ...(original.policies ?? {}),
      checkInTime: propertyDetails.checkInTime || null,
      checkOutTime: propertyDetails.checkOutTime || null,
      houseRules: propertyDetails.houseRules ?? {},
      ratePlans: categoryData.ratePlans ?? {},
      breakfastIncluded: propertyDetails.breakfastIncluded ?? false,
      parking: propertyDetails.parking ?? false,
      paymentPolicy: categoryData.paymentPolicy || "pay_at_property",
    },
    media: [
      ...(images.cover ? [{ url: images.cover, role: "cover" }] : []),
      ...((images.gallery ?? []) as string[]).map((url, index) => ({ url, role: "gallery", sortOrder: index + 1 })),
    ],
    amenities: ((categoryData.amenities ?? []) as string[]).map((name) => ({
      name,
      value: true,
      category: "property",
      valueType: "boolean",
    })),
    roomTypes: rooms,
    metadata: {
      source: "vendor_portal_v2",
      ...(original.metadata ?? {}),
      hostProfile: categoryData.hostProfile ?? {},
      selectedSubtype: subcategory,
    },
  };
}

function RatePlansStep() {
  const draftCategoryData = useListingDraftStore((state) => state.categoryData ?? {});
  const setDraft = useListingDraftStore((state) => state.setDraft);
  const [editingSection, setEditingSection] = useState<RatePlanSectionId | null>(null);
  const [ratePlans, setRatePlans] = useState<RatePlanDraft>(
    () => normalizeRatePlanDraft(draftCategoryData.ratePlans as RatePlanDraft | undefined),
  );

  useEffect(() => {
    setDraft({
      categoryData: {
        ...(useListingDraftStore.getState().categoryData || {}),
        ratePlans,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratePlans]);

  const updateRatePlans = (updates: Partial<RatePlanDraft>) => {
    setRatePlans((current) => ({ ...current, ...updates }));
  };

  const updateGroupRate = (index: number, updates: Partial<RatePlanGroupRow>) => {
    setRatePlans((current) => ({
      ...current,
      groupRates: current.groupRates.map((row, rowIndex) => (rowIndex === index ? { ...row, ...updates } : row)),
    }));
  };

  const addGroupRate = () => {
    setRatePlans((current) => ({
      ...current,
      groupRates: [
        ...current.groupRates,
        { groups: String(current.groupRates.length + 1), guestsPerGroup: "2", amount: "", currency: current.groupRates[0]?.currency ?? "USD" },
      ],
    }));
  };

  const removeGroupRate = (index: number) => {
    setRatePlans((current) => ({
      ...current,
      groupRates: current.groupRates.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const toggleNote = (section: "standardNotes" | "childNotes" | "nonRefundableNotes", note: string) => {
    setRatePlans((current) => {
      const items = current[section];
      return {
        ...current,
        [section]: items.includes(note) ? items.filter((item) => item !== note) : [...items, note],
      };
    });
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Rate plans">
        <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Finish pricing setup</p>
              <p className="text-[12px] mt-1" style={{ color: "var(--text-secondary)" }}>
                Use these plans as the final pricing layer before you publish. You can keep the defaults, or refine each card to match the property.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg text-[11px]" style={{ color: "var(--accent-navy-light)", background: "var(--active-overlay)", border: "1px solid var(--border-accent)" }}>
              Final step
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl p-4" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Standard rate plan</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>Set the default cancellation policy for the listing.</p>
                </div>
                <button
                  onClick={() => setEditingSection(editingSection === "standard" ? null : "standard")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all"
                  style={{ color: "var(--accent-navy-light)", background: "var(--active-overlay)", border: "1px solid var(--border-accent)" }}
                >
                  <PencilLine size={12} />
                  {editingSection === "standard" ? "Done" : "Edit"}
                </button>
              </div>

              {editingSection === "standard" ? (
                <div className="space-y-3">
                  <div>
                    <FieldLabel>Cancellation policy</FieldLabel>
                    <FormTextarea
                      value={ratePlans.standardCancellationPolicy}
                      onChange={(value) => updateRatePlans({ standardCancellationPolicy: value })}
                      rows={4}
                      placeholder="Describe the standard cancellation policy"
                    />
                  </div>
                  <div className="space-y-2">
                    {[
                      "Guests can cancel for free up to 1 day before their arrival",
                      "Guests who cancel within 24 hours will have their cancellation fee waived",
                    ].map((note) => {
                      const isSelected = ratePlans.standardNotes.includes(note);
                      return (
                        <button
                          key={note}
                          onClick={() => toggleNote("standardNotes", note)}
                          className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-all"
                          style={{
                            background: isSelected ? "var(--active-overlay)" : "transparent",
                            border: "1px solid var(--border-light)",
                            color: isSelected ? "var(--accent-navy-light)" : "var(--text-secondary)",
                          }}
                        >
                          <Check size={12} style={{ color: isSelected ? "var(--accent-navy-light)" : "var(--text-tertiary)" }} />
                          <span className="text-[12px]">{note}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[12px] leading-5" style={{ color: "var(--text-secondary)" }}>{ratePlans.standardCancellationPolicy}</p>
                  {ratePlans.standardNotes.map((note) => (
                    <div key={note} className="flex items-start gap-2 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      <Check size={12} className="mt-0.5" style={{ color: "var(--success)" }} />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Price per group size</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>Set lower prices for smaller groups to improve conversion.</p>
                </div>
                <button
                  onClick={() => setEditingSection(editingSection === "group" ? null : "group")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all"
                  style={{ color: "var(--accent-navy-light)", background: "var(--active-overlay)", border: "1px solid var(--border-accent)" }}
                >
                  <PencilLine size={12} />
                  {editingSection === "group" ? "Done" : "Edit"}
                </button>
              </div>

              <div className="space-y-3">
                {editingSection === "group" ? (
                  <>
                    {ratePlans.groupRates.map((row, index) => (
                      <div key={`group-rate-${index}`} className="grid grid-cols-[80px_120px_100px_1fr_auto] gap-3 items-end">
                        <div>
                          <FieldLabel>Groups</FieldLabel>
                          <FormInput
                            value={row.groups}
                            onChange={(value) => updateGroupRate(index, { groups: value })}
                            placeholder="#"
                            type="number"
                          />
                        </div>
                        <div>
                          <FieldLabel>Guests per group</FieldLabel>
                          <FormInput
                            value={row.guestsPerGroup}
                            onChange={(value) => updateGroupRate(index, { guestsPerGroup: value })}
                            placeholder="#"
                            type="number"
                          />
                        </div>
                        <div>
                          <FieldLabel>Currency</FieldLabel>
                          <SelectField
                            value={row.currency}
                            onChange={(value) => updateGroupRate(index, { currency: value })}
                            options={RATE_PLAN_CURRENCIES}
                          />
                        </div>
                        <div>
                          <FieldLabel>Amount</FieldLabel>
                          <FormInput
                            value={row.amount}
                            onChange={(value) => updateGroupRate(index, { amount: value })}
                            placeholder="0.00"
                            type="number"
                          />
                        </div>
                        <button
                          onClick={() => removeGroupRate(index)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                          style={{ color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addGroupRate}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all"
                      style={{ background: "var(--active-overlay)", color: "var(--accent-navy-light)", border: "1px solid var(--border-accent)" }}
                    >
                      <Plus size={12} />
                      Add row
                    </button>
                  </>
                ) : (
                  <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-light)" }}>
                    <div className="grid grid-cols-2 gap-0 px-3 py-2 text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", background: "var(--bg-panel)" }}>
                      <span>Occupancy</span>
                      <span>Guests pay</span>
                    </div>
                    {ratePlans.groupRates.map((row, index) => (
                      <div key={`group-rate-summary-${index}`} className="grid grid-cols-2 px-3 py-2 text-[12px]" style={{ borderTop: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                        <span>{row.groups} x {row.guestsPerGroup}</span>
                        <span className="text-right">{formatGroupRate(row)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Child prices for families</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>Keep the family offer visible and easy to understand.</p>
                </div>
                <button
                  onClick={() => setEditingSection(editingSection === "family" ? null : "family")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all"
                  style={{ color: "var(--accent-navy-light)", background: "var(--active-overlay)", border: "1px solid var(--border-accent)" }}
                >
                  <PencilLine size={12} />
                  {editingSection === "family" ? "Done" : "Edit"}
                </button>
              </div>

              {editingSection === "family" ? (
                <div className="space-y-3">
                  <div>
                    <FieldLabel>Age group</FieldLabel>
                    <FormInput value={ratePlans.childAgeGroup} onChange={(value) => updateRatePlans({ childAgeGroup: value })} placeholder="e.g. 0 - 5 years" />
                  </div>
                  <div>
                    <FieldLabel>Price and age rule</FieldLabel>
                    <FormTextarea value={ratePlans.childPolicy} onChange={(value) => updateRatePlans({ childPolicy: value })} rows={3} />
                  </div>
                  <div className="space-y-2">
                    {[
                      "Add a family badge so the rate plan is easier to spot during review",
                      "Children stay free when sharing the existing bedding with an adult",
                    ].map((note) => {
                      const isSelected = ratePlans.childNotes.includes(note);
                      return (
                        <button
                          key={note}
                          onClick={() => toggleNote("childNotes", note)}
                          className="w-full flex items-start gap-2 rounded-lg px-3 py-2 text-left transition-all"
                          style={{
                            background: isSelected ? "var(--active-overlay)" : "transparent",
                            border: "1px solid var(--border-light)",
                            color: isSelected ? "var(--accent-navy-light)" : "var(--text-secondary)",
                          }}
                        >
                          <Check size={12} className="mt-0.5" style={{ color: isSelected ? "var(--accent-navy-light)" : "var(--text-tertiary)" }} />
                          <span className="text-[12px]">{note}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span style={{ color: "var(--text-secondary)" }}>Age group</span>
                    <span className="px-2 py-0.5 rounded" style={{ color: "var(--accent-navy-light)", background: "var(--active-overlay)" }}>{ratePlans.childAgeGroup}</span>
                  </div>
                  <p className="text-[12px] leading-5" style={{ color: "var(--text-secondary)" }}>{ratePlans.childPolicy}</p>
                  {ratePlans.childNotes.map((note) => (
                    <div key={note} className="flex items-start gap-2 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      <Check size={12} className="mt-0.5" style={{ color: "var(--success)" }} />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Non-refundable rate plan</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>Use this card for discount-led offers and stricter policies.</p>
                </div>
                <button
                  onClick={() => setEditingSection(editingSection === "nonRefundable" ? null : "nonRefundable")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all"
                  style={{ color: "var(--accent-navy-light)", background: "var(--active-overlay)", border: "1px solid var(--border-accent)" }}
                >
                  <PencilLine size={12} />
                  {editingSection === "nonRefundable" ? "Done" : "Edit"}
                </button>
              </div>

              {editingSection === "nonRefundable" ? (
                <div className="space-y-3">
                  <div>
                    <FieldLabel>Price note</FieldLabel>
                    <FormTextarea value={ratePlans.nonRefundablePolicy} onChange={(value) => updateRatePlans({ nonRefundablePolicy: value })} rows={3} />
                  </div>
                  <div className="space-y-2">
                    {[
                      "Guests pay 10% less than the standard rate",
                      "Guests can't cancel their booking for free at any time",
                    ].map((note) => {
                      const isSelected = ratePlans.nonRefundableNotes.includes(note);
                      return (
                        <button
                          key={note}
                          onClick={() => toggleNote("nonRefundableNotes", note)}
                          className="w-full flex items-start gap-2 rounded-lg px-3 py-2 text-left transition-all"
                          style={{
                            background: isSelected ? "var(--active-overlay)" : "transparent",
                            border: "1px solid var(--border-light)",
                            color: isSelected ? "var(--accent-navy-light)" : "var(--text-secondary)",
                          }}
                        >
                          <Check size={12} className="mt-0.5" style={{ color: isSelected ? "var(--accent-navy-light)" : "var(--text-tertiary)" }} />
                          <span className="text-[12px]">{note}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[12px] leading-5" style={{ color: "var(--text-secondary)" }}>{ratePlans.nonRefundablePolicy}</p>
                  {ratePlans.nonRefundableNotes.map((note) => (
                    <div key={note} className="flex items-start gap-2 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      <AlertTriangle size={12} className="mt-0.5" style={{ color: "var(--warning)" }} />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Status Panel ─────────────────────────────────────────────────────────────

function StatusPanel({
  mode,
  active,
  category,
}: {
  mode: ListingMode;
  active: boolean;
  category: Category;
}) {
  const CATEGORY_COLORS_PANEL: Record<Category, { text: string; bg: string }> = {
    Safari: { text: "var(--success)", bg: "var(--active-overlay)" },
    Stay: { text: "var(--accent-navy-light)", bg: "var(--active-overlay)" },
    Tour: { text: "var(--info)", bg: "var(--active-overlay)" },
    Experience: { text: "var(--warning)", bg: "var(--active-overlay)" },
    Transfer: { text: "var(--text-secondary)", bg: "var(--active-overlay)" },
  };

  const catStyle = CATEGORY_COLORS_PANEL[category];

  return (
    <div className="space-y-4">
      {/* Status */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-accent)",
        }}
      >
        <p className="text-[11px] uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
          Listing Status
        </p>
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: active ? "var(--success)" : "var(--warning)",
              boxShadow: active ? "0 0 6px var(--success)" : "0 0 6px var(--warning)",
            }}
          />
          <span className="text-[13px]" style={{ color: active ? "var(--success)" : "var(--warning)", fontWeight: 500 }}>
            {active ? "Active" : "Draft"}
          </span>
        </div>
        <div className="space-y-2">
          {[
            { label: "Category", value: category, color: catStyle.text, bg: catStyle.bg },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                {label}
              </span>
              <span
                className="text-[11px] px-2 py-0.5 rounded"
                style={{ color, background: bg }}
              >
                {value}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Mode</span>
            <span className="text-[11px] capitalize" style={{ color: "var(--text-secondary)" }}>{mode}</span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-accent)",
        }}
      >
        <p className="text-[11px] uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
          Quick Stats
        </p>
        <div className="space-y-3">
          {[
            { label: "Bookings (30d)", value: "48" },
            { label: "Views (30d)", value: "1,204" },
            { label: "Avg Rating", value: "4.8 / 5.0" },
            { label: "Conversion", value: "3.99%" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                {label}
              </span>
              <span className="text-[12px]" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Completeness */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-accent)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
            Profile Completeness
          </p>
          <span className="text-[12px]" style={{ color: "var(--accent-navy-light)", fontWeight: 600 }}>
            87%
          </span>
        </div>
        <div className="h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: "var(--border-medium)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: "87%",
              background: "linear-gradient(90deg, var(--accent-navy-dark), var(--accent-navy))",
              boxShadow: "0 0 8px var(--border-accent)",
            }}
          />
        </div>
        <div className="space-y-1.5">
          {[
            { label: "Basic Info", done: true },
            { label: "Media (min 5)", done: true },
            { label: "Pricing Variants", done: true },
            { label: "Category Details", done: true },
            { label: "Policies", done: false },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-2">
              {done ? (
                <Check size={11} style={{ color: "var(--success)" }} />
              ) : (
                <AlertTriangle size={11} style={{ color: "var(--warning)" }} />
              )}
              <span className="text-[11px]" style={{ color: done ? "var(--text-secondary)" : "#d97706" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Timestamps */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--input-background)",
          border: "1px solid var(--border-light)",
        }}
      >
        <div className="space-y-2">
          {[
            { label: "Created", value: "May 10, 2026" },
            { label: "Last Updated", value: "May 15, 2026" },
            { label: "ID", value: "lst_001" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                {label}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Editor ──────────────────────────────────────────────────────────────

function StayEditPanel({
  title,
  setTitle,
  active,
  setActive,
  description,
  setDescription,
}: {
  title: string;
  setTitle: (value: string) => void;
  active: boolean;
  setActive: (value: boolean) => void;
  description: string;
  setDescription: (value: string) => void;
}) {
  const [activeSection, setActiveSection] = useState<StayEditTabId>("property");

  const renderSection = () => {
    if (activeSection === "property") return <MediaTab />;
    if (activeSection === "rooms") return <RoomsSection />;
    if (activeSection === "rates") return <RatePlansStep />;
    if (activeSection === "images") return <ImagesSection />;
    return (
      <BasicInfoTab
        title={title}
        setTitle={setTitle}
        active={active}
        setActive={setActive}
        description={description}
        setDescription={setDescription}
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-1 px-6 pt-3 pb-0 shrink-0"
        style={{ borderBottom: "1px solid var(--border-light)" }}
      >
        {STAY_EDIT_SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className="flex items-center gap-2 px-4 py-2.5 text-[12px] rounded-t-lg transition-all"
              style={
                isActive
                  ? {
                    color: "var(--accent-navy-light)",
                    background: "var(--active-overlay)",
                    borderBottom: "2px solid var(--accent-navy)",
                  }
                  : { color: "var(--text-tertiary)" }
              }
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {renderSection()}
      </div>
    </div>
  );
}

export function ListingEditor({ mode, listingId: listingIdProp, presentation = "page", onClose, onSaved, onUnsupportedCategory, initialCategory }: ListingEditorProps) {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const { effectiveUser } = useAuth();
  const isAdmin = effectiveUser?.role === "admin";
  const listingId = listingIdProp ?? params.id ?? null;
  const [category, setCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [title, setTitle] = useState("");
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState("");
  const [destination, setDestination] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [variants, setVariants] = useState<PricingVariant[]>(() => (
    mode === "create"
      ? [
        {
          id: "var_1",
          name: "Default Package",
          unit: "Per Person",
          minCapacity: "1",
          maxCapacity: "6",
          price: "",
          currency: "USD",
          priority: 1,
          isDefault: true,
        },
      ]
      : []
  ));

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editLoading, setEditLoading] = useState(mode === "edit");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  // Tours, safaris and experiences are chosen from the destinations the platform already has.
  const [destinationId, setDestinationId] = useState("");
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  // What still needs fixing, shown at the top of the drawer and under each section.
  const [issues, setIssues] = useState<ListingIssue[]>([]);
  // Bumped after photos are saved so the photo section starts again from what is now stored.
  const [photosKey, setPhotosKey] = useState(0);
  const stayOriginalStatus = useListingDraftStore((state) => (state.categoryData?.stayOriginal as { status?: string } | undefined)?.status);
  const availableCategories: ListingFormCategory[] = isAdmin ? ["Stay", "Tour", "Safari", "Experience"] : ["Stay"];

  // Unsaved-changes tracking for the drawer. Every edit writes to the draft store, so listening to the store catches
  // all of them; it is only armed once the listing has finished loading so loading itself does not count.
  const [dirty, setDirty] = useState(false);
  const armedRef = useRef(false);
  useEffect(() => {
    const unsubscribe = useListingDraftStore.subscribe(() => {
      if (armedRef.current) setDirty(true);
    });
    return unsubscribe;
  }, []);

  // A drawer never leaves its draft behind for the next listing that is opened.
  useEffect(() => {
    return () => {
      if (presentation === "drawer") useListingDraftStore.getState().clearDraft();
    };
  }, [presentation]);

  // The drawer is for Safari, Tour, Experience and Stay listings.
  useEffect(() => {
    if (presentation !== "drawer" || mode !== "edit" || editLoading || loadError || !category) return;
    if (category !== "Safari" && category !== "Experience" && category !== "Stay" && category !== "Tour") onUnsupportedCategory?.();
  }, [presentation, mode, editLoading, loadError, category, onUnsupportedCategory]);

  useEffect(() => {
    if (presentation !== "drawer") return;
    let cancelled = false;
    setDestinationsLoading(true);
    apiFetch<any[]>("/admin/destinations")
      .then((list) => {
        if (!cancelled) {
          setDestinations(
            (Array.isArray(list) ? list : []).map((item) => ({
              id: item.id,
              name: item.name,
              latitude: item.latitude ?? null,
              longitude: item.longitude ?? null,
            })),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setDestinations([]);
      })
      .finally(() => {
        if (!cancelled) setDestinationsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [presentation]);

  // Create mode: pick a kind of listing and start from an empty form for it.
  const createArmTimer = useRef<number | undefined>(undefined);
  const startCreate = (chosen: ListingFormCategory) => {
    const store = useListingDraftStore.getState();
    store.clearDraft();
    const starting: Record<string, any> =
      chosen === "Tour"
        ? { durationDays: "1", difficultyLevel: "Easy", minGroupSize: "1", maxGroupSize: "15" }
        : chosen === "Experience"
          ? { activityType: "City Walk", difficultyLevel: "Easy", minGroupSize: "1", maxGroupSize: "10" }
          : {};
    store.setDraft({ category: chosen, subcategory: chosen === "Stay" ? "hotel" : null, categoryData: starting });
    setCategory(chosen);
    setTitle("");
    setActive(true);
    setDescription("");
    setDestination("");
    setDestinationId("");
    setLat("");
    setLng("");
    setVariants(
      chosen === "Tour" || chosen === "Experience"
        ? [{ id: "var_1", name: "Standard", unit: "Per Person", minCapacity: "1", maxCapacity: "", price: "", currency: "USD", priority: 1, isDefault: true }]
        : [],
    );
    setIssues([]);
    setEditError(null);
    // Count edits only after the sections have written their own starting values.
    armedRef.current = false;
    setDirty(false);
    if (createArmTimer.current !== undefined) window.clearTimeout(createArmTimer.current);
    createArmTimer.current = window.setTimeout(() => {
      armedRef.current = true;
    }, 600);
  };

  useEffect(() => {
    if (mode !== "create") return;

    useListingDraftStore.getState().clearDraft();
    setCategory(null);
    setActiveTab("basic");
    setTitle("");
    setActive(true);
    setDescription("");
    setDestination("");
    setLat("");
    setLng("");
    setVariants([
      {
        id: "var_1",
        name: "Default Package",
        unit: "Per Person",
        minCapacity: "1",
        maxCapacity: "6",
        price: "",
        currency: "USD",
        priority: 1,
        isDefault: true,
      },
    ]);
    if (presentation === "drawer") {
      setDestinationId("");
      setIssues([]);
      const wanted = initialCategory as ListingFormCategory | null | undefined;
      if (wanted && availableCategories.includes(wanted)) startCreate(wanted);
      else if (availableCategories.length === 1) startCreate(availableCategories[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (mode !== "edit" || !listingId) return;

    let cancelled = false;

    async function loadListing() {
      if (!isUuid(listingId)) {
        setCategory("Safari");
        setTitle(DEFAULT_DATA.title);
        setActive(DEFAULT_DATA.active);
        setDescription(DEFAULT_DATA.description);
        setDestination(DEFAULT_DATA.destination);
        setLat(DEFAULT_DATA.lat);
        setLng(DEFAULT_DATA.lng);
        setVariants([
          { id: "var_1", name: "Standard Safari", unit: "Per Person", minCapacity: "2", maxCapacity: "6", price: "85", currency: "USD", priority: 1, isDefault: true },
          { id: "var_2", name: "Private Safari", unit: "Per Group", minCapacity: "1", maxCapacity: "6", price: "380", currency: "USD", priority: 2, isDefault: false },
          { id: "var_3", name: "Premium Sunrise", unit: "Per Person", minCapacity: "2", maxCapacity: "4", price: "120", currency: "USD", priority: 3, isDefault: false },
        ]);
        setEditLoading(false);
        return;
      }

      setEditLoading(true);
      setLoadError(null);
      try {
        let hydrated: any = null;

        // 1. Fetch generic/admin listing data to determine category accurately without spurious stay 404s
        let listingData: any = null;
        try {
          listingData = await apiFetch<any>(`/admin/listings/${listingId}`);
        } catch {
          try {
            listingData = await apiFetch<any>(`/listings/${listingId}`);
          } catch {
            // will check stay endpoint below
          }
        }

        const rawType = String(
          listingData?.category ||
          listingData?.listing_type ||
          listingData?.listingType ||
          ""
        ).toLowerCase();

        const isStay = !listingData || rawType === "hotel" || rawType === "stay";

        // 2. Only if it is a stay (or if unknown), attempt StayProperty fetch for room structures
        if (isStay) {
          try {
            const property = await apiFetch<StayPropertyResponse>(`/vendor/stays/${listingId}`);
            if (property) {
              hydrated = hydrateStayDraft(property);
            }
          } catch {
            // Ignore (might not be a stay property or not found)
          }
        }

        // 3. If not hydrated by stay property, hydrate from general listing data
        if (!hydrated && listingData) {
          hydrated = hydrateGeneralListingDraft(listingData);
        }

        // 4. Fallback to public endpoint if not already tried
        if (!hydrated) {
          try {
            const generalData = await apiFetch<any>(`/listings/${listingId}`);
            if (generalData) {
              hydrated = hydrateGeneralListingDraft(generalData);
            }
          } catch {
            // Ignore 404
          }
        }

        if (!hydrated) {
          throw new Error("Unable to load listing details.");
        }

        if (cancelled) return;
        setCategory(hydrated.category);
        setTitle(hydrated.title);
        setActive(hydrated.active);
        setDescription(hydrated.description);
        setDestination(hydrated.destination);
        setDestinationId(hydrated.destinationId || "");
        setLat(hydrated.lat);
        setLng(hydrated.lng);
        setVariants(hydrated.variants || []);
        useListingDraftStore.getState().setDraft(hydrated);
      } catch (error: any) {
        if (cancelled) return;
        setLoadError(error?.message || "Unable to load this listing.");
      } finally {
        if (!cancelled) {
          setEditLoading(false);
          // Start counting edits a moment after the listing has been put into the form.
          armedRef.current = false;
          setDirty(false);
          armTimer = window.setTimeout(() => {
            armedRef.current = true;
          }, 400);
        }
      }
    }

    let armTimer: number | undefined;
    loadListing();
    return () => {
      cancelled = true;
      armedRef.current = false;
      if (armTimer !== undefined) window.clearTimeout(armTimer);
    };
  }, [listingId, mode]);

  // Persisting wrappers
  const setCategoryPersist = (v: Category | null) => {
    setCategory(v);
    const requiresTreeSelection = v ? getFlow(v).step2Layout === "tree-selector" : false;
    useListingDraftStore.getState().setDraft({
      category: v,
      subcategory: requiresTreeSelection ? useListingDraftStore.getState().subcategory : null,
    });
  };
  const setTitlePersist = (v: string) => {
    setTitle(v);
    useListingDraftStore.getState().setDraft({ title: v });
  };
  const setActivePersist = (v: boolean) => {
    setActive(v);
    useListingDraftStore.getState().setDraft({ active: v });
  };
  const setDescriptionPersist = (v: string) => {
    setDescription(v);
    useListingDraftStore.getState().setDraft({ description: v });
  };
  const setDestinationPersist = (v: string) => {
    setDestination(v);
    useListingDraftStore.getState().setDraft({ destination: v });
  };
  const setLatPersist = (v: string) => {
    setLat(v);
    useListingDraftStore.getState().setDraft({ lat: v });
  };
  const setLngPersist = (v: string) => {
    setLng(v);
    useListingDraftStore.getState().setDraft({ lng: v });
  };

  const buildSnapshot = (chosen: ListingFormCategory): ListingDraftSnapshot => {
    const store = useListingDraftStore.getState();
    return {
      category: chosen,
      title,
      active,
      description,
      destinationId,
      lat,
      lng,
      variants,
      subcategory: store.subcategory ?? null,
      categoryData: (store.categoryData ?? {}) as Record<string, any>,
    };
  };

  /** Uploads photos that were added in the form and deletes the ones that were removed (Safari, Tour, Experience). */
  const syncListingImages = async (endpoint: string, id: string, data: Record<string, any>) => {
    const images = (data.images ?? {}) as { cover?: string; gallery?: string[] };
    const storedIds = (data.imageIds ?? {}) as Record<string, string>;
    const isNew = (url?: string) => !!url && url.startsWith("data:");
    const keep = new Set([images.cover, ...(images.gallery ?? [])].filter((url): url is string => !!url && !isNew(url)));

    for (const [url, mediaId] of Object.entries(storedIds)) {
      if (!keep.has(url)) {
        await apiFetch(`/admin/listings/${endpoint}/${id}/media/${mediaId}`, { method: "DELETE" });
      }
    }

    const upload = async (dataUrls: string[], primary: boolean) => {
      const form = new FormData();
      for (let index = 0; index < dataUrls.length; index += 1) {
        const blob = await (await fetch(dataUrls[index])).blob();
        const extension = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
        form.append("files", new File([blob], `photo-${Date.now()}-${index}.${extension}`, { type: blob.type || "image/jpeg" }));
        form.append("alt_texts", title.trim() || "Listing photo");
      }
      form.append("is_primary", primary ? "true" : "false");
      await apiFetch(`/admin/listings/${endpoint}/${id}/media`, { method: "POST", body: form });
    };

    const hasStoredCover = !!images.cover && !isNew(images.cover);
    if (isNew(images.cover)) await upload([images.cover as string], true);
    const newGallery = (images.gallery ?? []).filter(isNew);
    if (newGallery.length) await upload(newGallery, !images.cover && !hasStoredCover);
  };

  /** After photos change, read them back so the form holds what is stored (and a second save does not upload them again). */
  const reloadPhotos = async (endpoint: string, id: string) => {
    try {
      const fresh = await apiFetch<any>(`/admin/listings/${endpoint}/${id}`);
      const items: any[] = (fresh?.gallery || []).filter((img: any) => img?.url);
      const coverUrl = fresh?.cover_image?.url || fresh?.coverImage?.url || "";
      const ids: Record<string, string> = {};
      for (const img of [fresh?.cover_image || fresh?.coverImage, ...items]) {
        if (img?.url && img?.id) ids[img.url] = img.id;
      }
      const store = useListingDraftStore.getState();
      store.setDraft({
        categoryData: {
          ...(store.categoryData || {}),
          images: { cover: coverUrl, gallery: items.map((img) => img.url).filter((url: string) => url !== coverUrl) },
          imageIds: ids,
        },
      });
      setPhotosKey((value) => value + 1);
    } catch {
      // The save itself worked; the photos simply keep what the form shows.
    }
  };

  /** Create mode: validate, then post a Stay (vendor API) or a Safari / Tour / Experience (admin API). */
  const submitNew = async (asDraft: boolean) => {
    if (!category || (category !== "Stay" && category !== "Tour" && category !== "Safari" && category !== "Experience")) return;
    const chosen: ListingFormCategory = category;
    const snapshot = buildSnapshot(chosen);
    const found = validateListing(snapshot, { asDraft });
    if (found.length) {
      setIssues(found);
      setEditError(null);
      return;
    }
    setIssues([]);
    setSaving(true);
    setEditError(null);
    try {
      let photoProblem: string | null = null;
      if (chosen === "Stay") {
        await apiFetch("/vendor/stays/", {
          method: "POST",
          body: JSON.stringify(
            buildStayApplicationPayload({
              title,
              active: asDraft ? false : active,
              description,
              destination,
              lat,
              lng,
              subcategory: snapshot.subcategory,
              categoryData: snapshot.categoryData,
              isAdmin,
            }),
          ),
        });
      } else {
        const endpoint = chosen.toLowerCase();
        const status = asDraft || !active ? "draft" : "published";
        const created = await apiFetch<any>(`/admin/listings/${endpoint}`, {
          method: "POST",
          body: JSON.stringify(buildListingPayload(snapshot, { mode: "create", status })),
        });
        try {
          await syncListingImages(endpoint, created.id, snapshot.categoryData);
        } catch (photoError: any) {
          photoProblem = photoError?.message || "the photos could not be uploaded";
        }
      }
      useListingDraftStore.getState().clearDraft();
      if (photoProblem) toast.warning("Listing created without photos", `Open it from the list to add them: ${photoProblem}`);
      else toast.success(asDraft ? "Draft saved" : "Listing created", title.trim());
      window.dispatchEvent(new Event("stay-properties-changed"));
      onSaved?.();
      onClose?.();
    } catch (error: any) {
      setEditError(error?.message || "Unable to create this listing. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveStayListing = async () => {
    if (!listingId) return;

    setSaving(true);
    setEditError(null);
    setSaveSuccess(false);
    try {
      const currentCategory = category || useListingDraftStore.getState().category || "Safari";
      const catLower = currentCategory.toLowerCase();

      if (currentCategory === "Safari" || currentCategory === "Tour" || currentCategory === "Experience") {
        // An existing listing only has to be sensible (title, destination, coordinates); completeness is checked on create.
        const snapshot = buildSnapshot(currentCategory);
        const found = validateListing(snapshot, { asDraft: true });
        if (found.length) {
          setIssues(found);
          setEditError("Some details need fixing before this can be saved. They are marked below.");
          return;
        }
        setIssues([]);
        try {
          await apiFetch(`/admin/listings/${catLower}/${listingId}`, {
            method: "PATCH",
            body: JSON.stringify(buildListingPayload(snapshot, { mode: "edit" })),
          });
          await syncListingImages(catLower, listingId, snapshot.categoryData);
          // Reading the photos back rewrites the draft; that is not an edit by the person, so do not count it.
          armedRef.current = false;
          await reloadPhotos(catLower, listingId);
        } finally {
          window.setTimeout(() => {
            armedRef.current = true;
          }, 600);
        }
        setSaveSuccess(true);
        setDirty(false);
        onSaved?.();
        setTimeout(() => setSaveSuccess(false), 5000);
        return;
      }

      let destinationId: string | undefined = undefined;
      try {
        const dests = await apiFetch<any[]>("/admin/destinations");
        if (dests && dests.length > 0) {
          const matched = dests.find((d) =>
            d.name?.toLowerCase().includes((destination || "").toLowerCase()) ||
            (destination || "").toLowerCase().includes(d.name?.toLowerCase())
          );
          destinationId = matched ? matched.id : dests[0].id;
        }
      } catch (e) {
        console.warn("Destination lookup deferred", e);
      }

      if (currentCategory === "Stay") {
        const store = useListingDraftStore.getState();
        const stayPayload: Record<string, any> = buildStayApplicationPayload({
          active,
          title,
          description,
          destination,
          lat,
          lng,
          subcategory: store.subcategory ?? null,
          categoryData: store.categoryData ?? {},
          isAdmin,
        });
        const original = ((store.categoryData ?? {}).stayOriginal ?? {}) as Record<string, any>;
        // Saving other changes must not move a draft, a pending or a live property to another status, so an
        // untouched Active toggle sends the status the property already has.
        if (original.status && active === original.activeAtLoad) stayPayload.status = original.status;
        // (The server's PATCH for stays cannot update amenities and rooms together, so the full update is used.)
        await apiFetch(`/vendor/stays/${listingId}`, { method: "PUT", body: JSON.stringify(stayPayload) });
        store.setDraft({
          categoryData: {
            ...(store.categoryData ?? {}),
            stayOriginal: { ...original, status: stayPayload.status ?? original.status, activeAtLoad: active },
          },
        });
      } else {
        const draftCatData = useListingDraftStore.getState().categoryData ?? {};
        const catEndpointName = catLower === "transport" ? "transfer" : catLower;

        let payload: any = {
          destinationId,
          title: title || `${currentCategory} Listing`,
          description: description || "",
          isActive: active,
          latitude: toOptionalNumber(lat),
          longitude: toOptionalNumber(lng),
        };

        if (catLower === "safari") {
          const safariPackages = draftCatData.safariPackages ?? [];
          payload.safariDetail = {
            nationalPark: draftCatData.nationalPark || destination || title || "Yala National Park",
            safariType: normalizeSafariTypeEnum(draftCatData.safariType || useListingDraftStore.getState().subcategory),
            durationMinutes: Number(draftCatData.durationMinutes) || 360,
            difficultyLevel: draftCatData.difficultyLevel || "Moderate",
            ageRestriction: draftCatData.ageRestriction || "5+",
            groupSizeMin: Number(draftCatData.minGroupSize) || 1,
            groupSizeMax: Number(draftCatData.maxGroupSize) || 6,
            startTime: draftCatData.startTime || "06:00",
            endTime: draftCatData.endTime || "12:00",
            bestSeason: draftCatData.bestSeason || "February–July, September–December",
            guideIncluded: Boolean(draftCatData.guideIncluded ?? true),
            pickupSupported: Boolean(draftCatData.pickupSupported ?? true),
            privateAvailable: Boolean(draftCatData.privateAvailable ?? true),
            wildlifeHighlights: Array.isArray(draftCatData.wildlifeHighlights) ? draftCatData.wildlifeHighlights : ["Sri Lankan Leopard", "Asian Elephant", "Sloth Bear"],
            includedItems: Array.isArray(draftCatData.includedItems) ? draftCatData.includedItems : [],
            excludedItems: Array.isArray(draftCatData.excludedItems) ? draftCatData.excludedItems : [],
            languages: Array.isArray(draftCatData.languages) ? draftCatData.languages : ["English", "Sinhala"],
            whatToBring: Array.isArray(draftCatData.whatToBring) ? draftCatData.whatToBring : [],
            pickupNotes: draftCatData.pickupNotes ?? "",
            cancellationPolicy: draftCatData.cancellationPolicy ?? "",
            accessibilityInfo: draftCatData.accessibilityInfo ?? "",
          };

          let rawVariants = safariPackages.length > 0
            ? safariPackages.map((pkg: any, idx: number) => {
              const slotPrefix = pkg.timeSlot ? pkg.timeSlot.split(" ")[0] : "Morning";
              const formattedName = (pkg.name || "").toLowerCase().includes(slotPrefix.toLowerCase())
                ? pkg.name
                : `${slotPrefix} Drive — ${pkg.name}`;

              return {
                name: formattedName,
                bookingUnit: pkg.type === "shared_seat" ? "per_person" : "per_vehicle",
                capacityMin: 1,
                capacityMax: Number(pkg.capacityMax || pkg.maxPassengers) || 6,
                isDefault: idx === 0,
                pricing: {
                  amount: Number(pkg.price) || 95,
                  currency: pkg.currency || "USD",
                  priority: idx,
                },
              };
            })
            : (variants || []).map((v, i) => ({
              name: v.name || `Option ${i + 1}`,
              bookingUnit: v.unit === "Per Group" ? "per_group" : v.unit === "Per Vehicle" ? "per_vehicle" : "per_person",
              capacityMin: Number(v.minCapacity) || 1,
              capacityMax: Number(v.maxCapacity) || 6,
              isDefault: v.isDefault ?? (i === 0),
              pricing: {
                amount: Number(v.price) || 100,
                currency: v.currency || "USD",
                priority: i,
              },
            }));

          if (rawVariants.length > 0) {
            let foundDefault = false;
            payload.variants = rawVariants.map((v: any, i: number) => {
              const isDefault = Boolean(v.isDefault) && !foundDefault;
              if (isDefault) foundDefault = true;
              return { ...v, isDefault };
            });
            if (!foundDefault && payload.variants.length > 0) {
              payload.variants[0].isDefault = true;
            }
          }
        } else if (catLower === "tour") {
          const tourItinerary = Array.isArray(draftCatData.itinerary) ? draftCatData.itinerary : [];
          const computedDuration = Number(draftCatData.durationDays) || (tourItinerary.length > 0 ? tourItinerary.length : 1);

          payload.tourDetail = {
            durationDays: computedDuration,
            routeSummary: draftCatData.routeSummary || destination || "Scenic Tour Route",
            meetingPoint: draftCatData.meetingPoint || destination || "Bandaranaike International Airport (CMB)",
            categoryId: draftCatData.categoryId || "honeymoon",
            additionalCategories: Array.isArray(draftCatData.additionalCategories) ? draftCatData.additionalCategories : [],
            itinerary: tourItinerary,
            itineraryHighlights: Array.isArray(draftCatData.itineraryHighlights) ? draftCatData.itineraryHighlights : [],
            includedItems: Array.isArray(draftCatData.includedItems) ? draftCatData.includedItems : [],
            excludedItems: Array.isArray(draftCatData.excludedItems) ? draftCatData.excludedItems : [],
            languages: Array.isArray(draftCatData.languages) && draftCatData.languages.length > 0 ? draftCatData.languages : ["English"],
            difficultyLevel: draftCatData.difficultyLevel || "Couple Friendly",
            groupSizeMin: Number(draftCatData.minGroupSize) || 1,
            groupSizeMax: Number(draftCatData.maxGroupSize) || 15,
            startTime: draftCatData.startTime || "09:00",
            endTime: draftCatData.endTime || "13:00",
            privateAvailable: Boolean(draftCatData.privateAvailable),
            pickupAvailable: Boolean(draftCatData.pickupAvailable),
            dropoffAvailable: Boolean(draftCatData.dropoffAvailable),
            pickupNotes: draftCatData.pickupNotes || "",
            dropoffNotes: draftCatData.dropoffNotes || "",
            childPolicy: draftCatData.childPolicy || "",
            whatToBring: Array.isArray(draftCatData.whatToBring) ? draftCatData.whatToBring : [],
            cancellationPolicy: draftCatData.cancellationPolicy || "",
            accessibilityInfo: draftCatData.accessibilityInfo || "",
          };
          if (variants && variants.length > 0) {
            let foundDefault = false;
            payload.variants = variants.map((v, i) => {
              const isDefault = (v.isDefault ?? (i === 0)) && !foundDefault;
              if (isDefault) foundDefault = true;
              return {
                name: v.name || `Option ${i + 1}`,
                bookingUnit: v.unit === "Per Group" ? "per_group" : "per_person",
                capacityMin: Number(v.minCapacity) || 1,
                capacityMax: Number(v.maxCapacity) || 6,
                isDefault,
                pricing: {
                  amount: Number(v.price) || 100,
                  currency: v.currency || "USD",
                  priority: i,
                },
              };
            });
            if (!foundDefault && payload.variants.length > 0) {
              payload.variants[0].isDefault = true;
            }
          }
        } else if (catLower === "experience") {
          payload.activityDetail = buildActivityDetailPayload(
            draftCatData,
            useListingDraftStore.getState().subcategory,
            destination,
          );
          if (variants && variants.length > 0) {
            let foundDefault = false;
            payload.variants = variants.map((v, i) => {
              const isDefault = (v.isDefault ?? (i === 0)) && !foundDefault;
              if (isDefault) foundDefault = true;
              return {
                name: v.name || `Option ${i + 1}`,
                bookingUnit: v.unit === "Per Group" ? "per_group" : "per_person",
                capacityMin: Number(v.minCapacity) || 1,
                capacityMax: Number(v.maxCapacity) || 6,
                isDefault,
                pricing: {
                  amount: Number(v.price) || 100,
                  currency: v.currency || "USD",
                  priority: i,
                },
              };
            });
            if (!foundDefault && payload.variants.length > 0) {
              payload.variants[0].isDefault = true;
            }
          }
        } else if (catLower === "transport" || catLower === "transfer") {
          payload.transferDetail = {
            originType: "airport",
            destinationType: "city",
            vehiclePolicy: "Standard Sedan Transfer",
            vehicleTypes: ["Sedan", "Van"],
            maxPassengers: 4,
            maxLuggage: 4,
            airConditioned: true,
          };
          if (variants && variants.length > 0) {
            let foundDefault = false;
            payload.variants = variants.map((v, i) => {
              const isDefault = (v.isDefault ?? (i === 0)) && !foundDefault;
              if (isDefault) foundDefault = true;
              return {
                name: v.name || `Option ${i + 1}`,
                bookingUnit: "per_vehicle",
                capacityMin: Number(v.minCapacity) || 1,
                capacityMax: Number(v.maxCapacity) || 6,
                isDefault,
                pricing: {
                  amount: Number(v.price) || 100,
                  currency: v.currency || "USD",
                  priority: i,
                },
              };
            });
            if (!foundDefault && payload.variants.length > 0) {
              payload.variants[0].isDefault = true;
            }
          }
        }

        await apiFetch(`/admin/listings/${catEndpointName}/${listingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }

      setSaveSuccess(true);
      setDirty(false);
      onSaved?.();
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (error: any) {
      setEditError(error?.message || `Unable to save this listing.`);
    } finally {
      setSaving(false);
    }
  };
  const setVariantsPersist = (v: PricingVariant[]) => {
    setVariants(v);
    useListingDraftStore.getState().setDraft({ variants: v });
  };

  // Safari, Tour, Experience and Stay are created and edited in a drawer that slides in from the right.
  if ((mode === "edit" || mode === "create") && presentation === "drawer") {
    const stayForVendor = mode === "create" && !isAdmin;
    return (
      <ListingEditDrawer
        mode={mode}
        category={category}
        availableCategories={availableCategories}
        onChooseCategory={startCreate}
        destinations={destinations}
        destinationsLoading={destinationsLoading}
        destinationId={destinationId}
        setDestinationId={(value) => {
          setDestinationId(value);
          useListingDraftStore.getState().setDraft({});
        }}
        issues={issues}
        photosKey={photosKey}
        primaryLabel={
          mode === "create"
            ? (stayForVendor ? "Submit for review" : active ? "Create & publish" : "Create listing")
            : category === "Stay" && isAdmin && stayOriginalStatus === "submitted" && active
              ? "Save & approve"
              : undefined
        }
        onSaveDraft={mode === "create" ? () => void submitNew(true) : undefined}
        listingId={listingId}
        loading={editLoading}
        loadError={loadError}
        title={title}
        setTitle={setTitlePersist}
        active={active}
        setActive={setActivePersist}
        description={description}
        setDescription={setDescriptionPersist}
        destination={destination}
        setDestination={setDestinationPersist}
        lat={lat}
        setLat={setLatPersist}
        lng={lng}
        setLng={setLngPersist}
        variants={variants}
        setVariants={setVariantsPersist}
        saving={saving}
        saveSuccess={saveSuccess}
        saveError={editError}
        dirty={dirty}
        onSave={mode === "create" ? () => void submitNew(false) : saveStayListing}
        ratePlansSection={<RatePlansStep />}
        onClose={() => onClose?.()}
        onDismissMessages={() => {
          setSaveSuccess(false);
          setEditError(null);
        }}
      />
    );
  }

  // Creating always happens in the drawer on the listings page; an old link to the page form lands there.
  if (mode === "create") {
    return <Navigate to={location.pathname.startsWith("/hotel") ? "/hotel/listings?create=stay" : "/listings?create=new"} replace />;
  }

  const resolvedCategory = category ?? "Safari";
  const editorTabs = getEditorTabs(resolvedCategory);

  if (mode === "edit" && editLoading) {
    return (
      <div className="h-full flex items-center justify-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
        Loading listing...
      </div>
    );
  }

  if (mode === "edit" && loadError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="rounded-xl px-4 py-3 text-[13px]" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
          {loadError}
        </div>
      </div>
    );
  }

  const SAFARI_EDIT_SECTIONS = [
    { id: "details", label: "Safari Details & Jeep Packages", icon: Compass },
    { id: "basic", label: "Basic Info & Location", icon: Info },
    { id: "media", label: "Photos & Media", icon: ImageIcon },
    { id: "policies", label: "Policies & Pickup", icon: Shield },
  ];

  const TOUR_EDIT_SECTIONS = [
    { id: "details", label: "Tour Details & Highlights", icon: Compass },
    { id: "basic", label: "Basic Info & Location", icon: Info },
    { id: "pricing", label: "Pricing & Variants", icon: DollarSign },
    { id: "media", label: "Photos & Media", icon: ImageIcon },
    { id: "policies", label: "Policies & Pickup", icon: Shield },
  ];

  const EXPERIENCE_EDIT_SECTIONS = [
    { id: "details", label: "Activity Details & Highlights", icon: Anchor },
    { id: "basic", label: "Basic Info & Location", icon: Info },
    { id: "pricing", label: "Pricing & Variants", icon: DollarSign },
    { id: "media", label: "Photos & Media", icon: ImageIcon },
    { id: "policies", label: "Policies", icon: Shield },
  ];

  const TRANSFER_EDIT_SECTIONS = [
    { id: "details", label: "Transfer Details & Policy", icon: Car },
    { id: "basic", label: "Basic Info & Location", icon: Info },
    { id: "pricing", label: "Vehicle Variants & Pricing", icon: DollarSign },
    { id: "media", label: "Photos & Media", icon: ImageIcon },
    { id: "policies", label: "Policies & Instructions", icon: Shield },
  ];

  const FULL_STAY_EDIT_SECTIONS = [
    { id: "basic", label: "Basic Info & Location", icon: Info },
    { id: "details", label: "Property Details", icon: Building2 },
    { id: "rooms", label: "Rooms & Units", icon: Layers },
    { id: "rates", label: "Rate Plans", icon: DollarSign },
    { id: "media", label: "Photos & Media", icon: ImageIcon },
  ];

  function CategoryEditPanel({
    category,
    title,
    setTitle,
    active,
    setActive,
    description,
    setDescription,
    destination,
    setDestination,
    lat,
    setLat,
    lng,
    setLng,
    variants,
    setVariants,
  }: {
    category: Category;
    title: string;
    setTitle: (value: string) => void;
    active: boolean;
    setActive: (value: boolean) => void;
    description: string;
    setDescription: (value: string) => void;
    destination: string;
    setDestination: (value: string) => void;
    lat: string;
    setLat: (value: string) => void;
    lng: string;
    setLng: (value: string) => void;
    variants: PricingVariant[];
    setVariants: (value: PricingVariant[]) => void;
  }) {
    const sections = category === "Safari"
      ? SAFARI_EDIT_SECTIONS
      : category === "Tour"
        ? TOUR_EDIT_SECTIONS
        : category === "Experience"
          ? EXPERIENCE_EDIT_SECTIONS
          : category === "Transport"
            ? TRANSFER_EDIT_SECTIONS
            : FULL_STAY_EDIT_SECTIONS;

    const [activeSection, setActiveSection] = useState(sections[0].id);

    const renderSection = () => {
      switch (activeSection) {
        case "details":
          return <CategoryDetailsTab category={category} />;
        case "basic":
          return (
            <div className="space-y-5">
              <BasicInfoTab
                title={title}
                setTitle={setTitle}
                active={active}
                setActive={setActive}
                description={description}
                setDescription={setDescription}
              />
              <DestinationTab
                destination={destination}
                setDestination={setDestination}
                lat={lat}
                setLat={setLat}
                lng={lng}
                setLng={setLng}
              />
            </div>
          );
        case "pricing":
          return <PricingTab variants={variants} setVariants={setVariants} />;
        case "rooms":
          return <RoomsSection />;
        case "rates":
          return <RatePlansStep />;
        case "media":
          return (
            <div className="space-y-5">
              <MediaTab />
              <ImagesSection />
            </div>
          );
        case "policies":
          return <PoliciesTab category={category} />;
        default:
          return <CategoryDetailsTab category={category} />;
      }
    };

    return (
      <div className="flex flex-col h-full">
        {/* Category Header */}
        <div
          className="px-6 py-3 shrink-0 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-header)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider"
              style={{
                background: "var(--active-overlay)",
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
              }}
            >
              Editing {category} Listing
            </span>
            <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
              {title || "Untitled Listing"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex items-center gap-1 px-6 pt-2 pb-0 shrink-0"
          style={{ borderBottom: "1px solid var(--border-light)" }}
        >
          {sections.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className="flex items-center gap-2 px-4 py-2.5 text-[12px] rounded-t-lg transition-all"
                style={
                  isActive
                    ? {
                      color: "var(--accent-navy-light)",
                      background: "var(--active-overlay)",
                      borderBottom: "2px solid var(--accent-navy)",
                      fontWeight: 600,
                    }
                    : { color: "var(--text-tertiary)" }
                }
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {renderSection()}
        </div>
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <div className="flex flex-col h-full">
        <CategoryEditPanel
          category={resolvedCategory}
          title={title}
          setTitle={setTitlePersist}
          active={active}
          setActive={setActivePersist}
          description={description}
          setDescription={setDescriptionPersist}
          destination={destination}
          setDestination={setDestinationPersist}
          lat={lat}
          setLat={setLatPersist}
          lng={lng}
          setLng={setLngPersist}
          variants={variants}
          setVariants={setVariantsPersist}
        />

        {saveSuccess && (
          <div className="px-6 py-2 bg-emerald-500/10 border-t border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between">
            <span>✓ All changes saved successfully!</span>
            <button onClick={() => setSaveSuccess(false)} className="text-emerald-400 hover:underline">Dismiss</button>
          </div>
        )}
        {editError && (
          <div className="px-6 py-2 bg-rose-500/10 border-t border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center justify-between">
            <span>⚠️ {editError}</span>
            <button onClick={() => setEditError(null)} className="text-rose-400 hover:underline">Dismiss</button>
          </div>
        )}

        <div
          className="flex items-center justify-between px-6 py-3 shrink-0"
          style={{
            background: "var(--bg-header)",
            borderTop: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {resolvedCategory} listing editor
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/listings")}
              className="px-4 py-1.5 rounded-lg text-[12px] transition-all"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}
            >
              Back to Listings
            </button>
            <button
              onClick={saveStayListing}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-[12px] transition-all"
              style={{
                background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                color: "white",
                opacity: saving ? 0.65 : 1,
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 0 16px var(--border-accent)",
                border: "1px solid var(--border-accent)",
                fontWeight: 500,
              }}
            >
              <Check size={12} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

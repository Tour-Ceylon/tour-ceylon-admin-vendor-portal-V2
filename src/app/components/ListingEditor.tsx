import React, { useState, useEffect } from "react";
import { useListingDraftStore } from "../stores/listingDraftStore";
import { useParams, useNavigate } from "react-router";
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
} from "./listings/listingEditorSections";

type ListingMode = "create" | "edit";
type TabId = "basic" | "destination" | "media" | "pricing" | "category" | "policies";
type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;
type StayEditTabId = "property" | "rooms" | "rates" | "images" | "summary";

interface ListingEditorProps {
  mode: ListingMode;
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

function getCreateSteps(category: Category | null) {
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
    count: String(roomType.roomUnits?.length || 1),
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
    active: property.status === "approved" || property.status === "published",
    description: property.description ?? "",
    destination: property.city || property.address || "",
    lat: property.latitude != null ? String(property.latitude) : "",
    lng: property.longitude != null ? String(property.longitude) : "",
    categoryData: {
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

function toOptionalNumber(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
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
}: {
  active?: boolean;
  title: string;
  description: string;
  destination: string;
  lat: string;
  lng: string;
  subcategory: string | null;
  categoryData: Record<string, any>;
}) {
  const propertyDetails = categoryData.propertyDetails ?? {};
  const images = categoryData.images ?? {};
  const rooms = ((categoryData.roomTypes ?? []) as RoomType[]).map((room) => {
    const roomType = normalizeStayRoomType(room.type);
    return {
    name: roomType,
    description: "",
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
    metadata: {
      localDraftId: room.id,
    },
  };
  });

  const propertyName = propertyDetails.propertyName || title || getTreeOptionLabel("Stay", subcategory) || "Untitled stay";
  const propertyLocation = propertyDetails.propertyLocation || destination;

  return {
    name: propertyName,
    propertyType: subcategory || "hotel",
    description,
    address: propertyLocation,
    city: propertyLocation,
    latitude: toOptionalNumber(lat),
    longitude: toOptionalNumber(lng),
    status: active === false ? "draft" : "approved",
    contact: {
      languages: propertyDetails.languages ?? [],
    },
    policies: {
      checkInTime: propertyDetails.checkInTime || null,
      checkOutTime: propertyDetails.checkOutTime || null,
      houseRules: propertyDetails.houseRules ?? {},
      ratePlans: categoryData.ratePlans ?? {},
      breakfastIncluded: propertyDetails.breakfastIncluded ?? false,
      parking: propertyDetails.parking ?? false,
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
      hostProfile: categoryData.hostProfile ?? {},
      selectedSubtype: subcategory,
    },
  };
}

function CreateListingWizard({
  category,
  setCategory,
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
  category: Category | null;
  setCategory: (value: Category) => void;
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
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const flow = category ? getFlow(category) : null;
  const steps = getCreateSteps(category);
  const subcategory = useListingDraftStore((state) => state.subcategory ?? null);
  const setDraft = useListingDraftStore((state) => state.setDraft);
  const draftCategoryData = useListingDraftStore((state) => state.categoryData ?? {});

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(() => (draftCategoryData.amenities ?? []));

  const isPositiveNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0;
  };

  const validateStep = (currentStep: WizardStep): string[] => {
    const errors: string[] = [];

    if (currentStep === 1) {
      if (!category) {
        errors.push("Select a listing type before continuing.");
      }
      return errors;
    }

    if (currentStep === 2) {
      if (flow?.step2Layout === "tree-selector") {
        if (!subcategory) {
          errors.push("Select a subtype before continuing.");
        } else if (!isImplementedStaySubtype(category, subcategory)) {
          errors.push("This stay subtype is not available yet. Please choose Hotel or Bed and Breakfast.");
        }
      } else {
        if (!title.trim()) errors.push("Title is required.");
        if (!destination.trim()) errors.push("Destination is required.");
      }
      return errors;
    }

    if (currentStep === 3) {
      if (flow?.step3MultiSelect) {
        if (category === "Stay") {
          const propertyDetails = draftCategoryData.propertyDetails ?? {};
          if (!String(propertyDetails.propertyName ?? "").trim()) {
            errors.push("Property name is required.");
          }
          if (!String(propertyDetails.propertyLocation ?? "").trim()) {
            errors.push("Property location is required.");
          }
          if (!String(propertyDetails.checkInTime ?? "").trim()) {
            errors.push("Check-in time is required.");
          }
          if (!String(propertyDetails.checkOutTime ?? "").trim()) {
            errors.push("Check-out time is required.");
          }
        }
        return errors;
      }

      if (!variants.length) {
        errors.push("Add at least one pricing variant.");
      }
      if (variants.some((variant) => !variant.price.trim() || !isPositiveNumber(variant.price))) {
        errors.push("Enter a valid price greater than 0 for each pricing variant.");
      }
      return errors;
    }

    if (currentStep === 4 && category === "Stay") {
      const rooms = ((draftCategoryData.roomTypes ?? []) as RoomType[]);

      if (!rooms.length) {
        errors.push("Add at least one room before continuing.");
      }

      if (
        rooms.some((room) => {
          const roomType = normalizeStayRoomType(room.type);
          if (!roomType.trim()) return true;
          if (!room.count.trim() || Number(room.count) <= 0) return true;
          if (!room.maxGuests.trim() || Number(room.maxGuests) <= 0) return true;
          if (!room.pricePerNight.trim() || !isPositiveNumber(room.pricePerNight)) return true;

          let remainingPrice = Number(room.pricePerNight);

          return (room.discounts ?? []).some((discount) => {
            const value = Number(discount.value);
            if (!discount.label.trim() || !discount.value.trim() || !Number.isFinite(value) || value <= 0) {
              return true;
            }

            if (discount.type === "percentage") {
              if (value > 100) return true;
              remainingPrice -= (remainingPrice * value) / 100;
              return false;
            }

            if (value > remainingPrice) return true;
            remainingPrice -= value;
            return false;
          });
        })
      ) {
        errors.push("Each room must have type, count, max guests, a valid price per night greater than 0, and valid discount values.");
      }
    }

    return errors;
  };

  const goToStep = (targetStep: WizardStep) => {
    if (targetStep <= step) {
      setStep(targetStep);
      setStepErrors([]);
      return;
    }

    const errors = validateStep(step);
    if (errors.length) {
      setStepErrors(errors);
      return;
    }

    setStepErrors([]);
    setStep(targetStep);
  };

  const handleNext = () => {
    const errors = validateStep(step);
    if (errors.length) {
      setStepErrors(errors);
      return;
    }

    setStepErrors([]);
    setStep((current) => (current < 6 ? ((current + 1) as WizardStep) : current));
  };

  const handleFinish = async () => {
    const errors = ([1, 2, 3, 4, 5, 6] as WizardStep[]).flatMap((item) => validateStep(item));
    if (errors.length) {
      setStepErrors(Array.from(new Set(errors)));
      return;
    }

    if (category !== "Stay") {
      useListingDraftStore.getState().clearDraft();
      navigate("/listings");
      return;
    }

    setIsSubmitting(true);
    setStepErrors([]);
    try {
      await apiFetch("/vendor/stays/", {
        method: "POST",
        body: JSON.stringify(
          buildStayApplicationPayload({
            title,
            active,
            description,
            destination,
            lat,
            lng,
            subcategory,
            categoryData: useListingDraftStore.getState().categoryData ?? {},
          }),
        ),
      });
      useListingDraftStore.getState().clearDraft();
      navigate("/hotel/dashboard");
    } catch (error: any) {
      setStepErrors([error?.message || "Unable to submit the stay application. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNextDisabled =
    isSubmitting ||
    (step === 2 && category === "Stay" && !isImplementedStaySubtype(category, subcategory));

  const renderStep = () => {
    if (step === 1) {
      return <CreateWizardTypeStep category={category} setCategory={setCategory} categories={CATEGORIES} />;
    }

    if (step === 2) {
      if (flow?.step2Layout === "tree-selector" && flow.treeSelection) {
        return (
          <div className="space-y-3">
            <CreateWizardTreeSelectionStep
              title={flow.treeSelection.title}
              helperText={flow.treeSelection.helperText}
              branches={flow.treeSelection.branches}
              selectedId={subcategory}
              onSelect={(value) => setDraft({ subcategory: value })}
            />
            {category === "Stay" && subcategory && !isImplementedStaySubtype(category, subcategory) && (
              <div
                className="rounded-lg px-3 py-2 text-[12px]"
                style={{ background: "var(--active-overlay)", border: "1px solid var(--border-accent)", color: "var(--warning)" }}
              >
                This Stay subtype is not available yet. For now, continue with Hotel or Bed and Breakfast.
              </div>
            )}
          </div>
        );
      }

      return (
        <SectionCard title="Core details">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Title</FieldLabel>
              <FormInput value={title} onChange={setTitle} placeholder="Listing title" />
            </div>
            <div>
              <FieldLabel required>Destination</FieldLabel>
              <FormInput value={destination} onChange={setDestination} placeholder="Destination" />
            </div>
            <div>
              <FieldLabel>Latitude</FieldLabel>
              <FormInput value={lat} onChange={setLat} placeholder="Latitude" />
            </div>
            <div>
              <FieldLabel>Longitude</FieldLabel>
              <FormInput value={lng} onChange={setLng} placeholder="Longitude" />
            </div>
            <div className="col-span-2">
              <FieldLabel>Description</FieldLabel>
              <FormTextarea value={description} onChange={setDescription} rows={4} placeholder="Describe the listing" />
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
              <div>
                <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Active listing</p>
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Enable this listing once it is ready to publish.</p>
              </div>
              <Toggle value={active} onChange={setActive} />
            </div>
          </div>
        </SectionCard>
      );
    }

    if (step === 3) {
      if (flow?.step3MultiSelect) {
        return (
          <div className="space-y-4">
            <CreateWizardMultiSelectStep
              title={flow.step3MultiSelect.title}
              helperText={flow.step3MultiSelect.helperText}
              options={flow.step3MultiSelect.options}
              selectedValues={selectedFeatures}
              onChange={(values) => {
                setSelectedFeatures(values);
                setDraft({ categoryData: { ...(draftCategoryData || {}), amenities: values } });
              }}
            />
            <MediaTab />
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <MediaTab />
          <PricingTab variants={variants} setVariants={setVariants} />
        </div>
      );
    }

    if (step === 4) {
      if (category === "Stay") {
        return (
          <div className="space-y-4">
            <RoomsSection />
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {category && <CategoryDetailsTab category={category} />}
          {category && <PoliciesTab category={category} />}
        </div>
      );
    }

    if (step === 5) {
      return <RatePlansStep />;
    }

    if (step === 6) {
      return <ImagesSection />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-header)" }}>
        <div className="flex items-center gap-2 flex-wrap">
          {steps.map((item) => {
            const activeStep = step === item.id;
            return (
              <button
                key={item.id}
                onClick={() => goToStep(item.id)}
                className="px-3 py-2 rounded-lg text-left transition-all"
                style={{
                  background: activeStep ? "var(--active-overlay)" : "var(--input-background)",
                  border: activeStep ? "1px solid var(--border-accent)" : "1px solid var(--border-light)",
                  color: activeStep ? "var(--accent-navy-light)" : "var(--text-secondary)",
                }}
              >
                <div className="text-[11px] font-semibold">Step {item.id}</div>
                <div className="text-[12px]">{item.label}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {renderStep()}
        {stepErrors.length > 0 && (
          <div
            className="mt-4 rounded-lg px-3 py-2 text-[12px]"
            style={{ background: "var(--active-overlay)", border: "1px solid var(--border-accent)", color: "var(--error)" }}
          >
            {stepErrors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
      </div>
      <div className="px-6 py-4 shrink-0 flex items-center justify-between" style={{ borderTop: "1px solid var(--border-light)", background: "var(--bg-header)" }}>
        <button
          onClick={() => {
            setStepErrors([]);
            setStep((current) => (current > 1 ? ((current - 1) as WizardStep) : current));
          }}
          disabled={step === 1}
          className="px-4 py-2 rounded-lg text-[12px] transition-all"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
            color: step === 1 ? "var(--text-tertiary)" : "var(--text-secondary)",
          }}
        >
          Back
        </button>
        <button
          onClick={step === 6 ? handleFinish : handleNext}
          disabled={isNextDisabled}
          className="px-4 py-2 rounded-lg text-[12px] transition-all"
          style={{
            background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
            color: "white",
            opacity: isNextDisabled ? 0.55 : 1,
            cursor: isNextDisabled ? "not-allowed" : "pointer",
          }}
        >
          {step === 6 ? (isSubmitting ? "Submitting..." : "Submit Stay") : "Next"}
        </button>
      </div>
    </div>
  );
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
        ...(draftCategoryData || {}),
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

export function ListingEditor({ mode }: ListingEditorProps) {
  const navigate = useNavigate();
  const params = useParams();
  const listingId = params.id || null;
  const [category, setCategory] = useState<Category | null>(() => (mode === "create" ? null : "Stay"));
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
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
      setEditError(null);
      try {
        const property = await apiFetch<StayPropertyResponse>(`/vendor/stays/${listingId}`);
        if (cancelled) return;
        const hydrated = hydrateStayDraft(property);
        setCategory(hydrated.category);
        setTitle(hydrated.title);
        setActive(hydrated.active);
        setDescription(hydrated.description);
        setDestination(hydrated.destination);
        setLat(hydrated.lat);
        setLng(hydrated.lng);
        setVariants([]);
        useListingDraftStore.getState().setDraft(hydrated);
      } catch (error: any) {
        if (cancelled) return;
        setEditError(error?.message || "Unable to load this listing.");
      } finally {
        if (!cancelled) setEditLoading(false);
      }
    }

    loadListing();
    return () => {
      cancelled = true;
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

  const saveStayListing = async () => {
    if (!listingId || category !== "Stay") {
      navigate("/listings");
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      await apiFetch(`/vendor/stays/${listingId}`, {
        method: "PUT",
        body: JSON.stringify(
          buildStayApplicationPayload({
            active,
            title,
            description,
            destination,
            lat,
            lng,
            subcategory: useListingDraftStore.getState().subcategory ?? null,
            categoryData: useListingDraftStore.getState().categoryData ?? {},
          }),
        ),
      });
      navigate("/listings");
    } catch (error: any) {
      setEditError(error?.message || "Unable to save this stay listing.");
    } finally {
      setSaving(false);
    }
  };
  const setVariantsPersist = (v: PricingVariant[]) => {
    setVariants(v);
    useListingDraftStore.getState().setDraft({ variants: v });
  };

  if (mode === "create") {
    return (
      <CreateListingWizard
        category={category}
        setCategory={(value) => setCategoryPersist(value)}
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
    );
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

  if (mode === "edit" && editError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="rounded-xl px-4 py-3 text-[13px]" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
          {editError}
        </div>
      </div>
    );
  }

  if (mode === "edit" && resolvedCategory === "Stay") {
    return (
      <div className="flex flex-col h-full">
        <StayEditPanel
          title={title}
          setTitle={setTitlePersist}
          active={active}
          setActive={setActivePersist}
          description={description}
          setDescription={setDescriptionPersist}
        />

        <div
          className="flex items-center justify-between px-6 py-3 shrink-0"
          style={{
            background: "var(--bg-header)",
            borderTop: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Stay listing edit
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
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Category Selector */}
      <div
        className="px-6 pt-4 pb-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-header)" }}
      >
        <p className="text-[11px] uppercase tracking-wider mb-2.5" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
          Select Category
        </p>
        <div className="flex items-center gap-2">
          {CATEGORIES.map(({ id, label, icon: Icon }) => {
            const isActive = category === id;
            return (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] transition-all"
                style={
                  isActive
                    ? {
                      color: "var(--accent-navy-light)",
                      background: "var(--active-overlay)",
                      border: "1px solid var(--border-accent)",
                      boxShadow: "0 0 8px var(--border-accent)",
                    }
                    : {
                      color: "var(--text-secondary)",
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                    }
                }
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 px-6 pt-3 pb-0 shrink-0"
        style={{ borderBottom: "1px solid var(--border-light)" }}
      >
        {editorTabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-4 py-2.5 text-[12px] rounded-t-lg transition-all relative"
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
              {id === "pricing" && (
                <span
                  className="px-1.5 py-0 rounded text-[10px]"
                  style={{ background: "var(--active-overlay)", color: "var(--accent-navy-light)" }}
                >
                  {variants.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <div className="flex-1 flex gap-5 px-6 py-5 overflow-hidden min-h-0">
        {/* Main form */}
        <div className="flex-1 overflow-y-auto pr-1" style={{ minWidth: 0 }}>
          {activeTab === "basic" && (
            <BasicInfoTab
              title={title}
              setTitle={setTitle}
              active={active}
              setActive={setActive}
              description={description}
              setDescription={setDescription}
            />
          )}
          {activeTab === "destination" && (
            <DestinationTab
              destination={destination}
              setDestination={setDestination}
              lat={lat}
              setLat={setLat}
              lng={lng}
              setLng={setLng}
            />
          )}
          {activeTab === "media" && <MediaTab />}
          {activeTab === "pricing" && (
            resolvedCategory === "Stay" ? <RatePlansStep /> : <PricingTab variants={variants} setVariants={setVariants} />
          )}
          {activeTab === "category" && (resolvedCategory === "Stay" ? <RoomsSection /> : <CategoryDetailsTab category={resolvedCategory} />)}
          {activeTab === "policies" && (resolvedCategory === "Stay" ? <ImagesSection /> : <PoliciesTab category={resolvedCategory} />)}
        </div>

        {/* Right panel */}
        <div
          className="w-64 shrink-0 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <StatusPanel mode={mode} active={active} category={resolvedCategory} />
        </div>
      </div>

      {/* Sticky bottom save bar */}
      <div
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{
          background: "var(--bg-header)",
          borderTop: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="flex items-center gap-3">
          {mode === "edit" && (
            <>
              {deleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-[12px]" style={{ color: "#f87171" }}>
                    Are you sure?
                  </span>
                  <button
                    className="px-3 py-1.5 rounded-lg text-[12px] transition-all"
                    style={{ background: "var(--active-overlay)", color: "var(--error)", border: "1px solid var(--border-accent)" }}
                    onClick={() => { setDeleteConfirm(false); navigate("/listings"); }}
                  >
                    Yes, Delete
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg text-[12px]"
                    style={{ color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}
                    onClick={() => setDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all"
                  style={{ color: "var(--error)", border: "1px solid rgba(239,68,68,0.2)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <Trash2 size={12} />
                  Delete Listing
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-3">
            <Check size={12} style={{ color: "var(--success)" }} />
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Auto-saved
            </span>
          </div>
          <button
            onClick={() => navigate("/listings")}
            className="px-4 py-1.5 rounded-lg text-[12px] transition-all"
            style={{ color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => navigate("/listings")}
            className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-[12px] transition-all"
            style={{
              background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
              color: "white",
              boxShadow: "0 0 16px var(--border-accent)",
              border: "1px solid var(--border-accent)",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px var(--border-accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px var(--border-accent)";
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

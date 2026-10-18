import React, { useState, useEffect, useCallback } from "react";
import {
    Check,
    GripVertical,
    Plus,
    Trash2,
    Upload,
    Minus,
    Sparkles,
    MapPin,
    RotateCcw,
    Compass,
    Calendar,
    BedDouble,
    Navigation,
    Clock,
    Users,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import type { Category } from "../../stores/listingDraftStore";
import { useListingDraftStore } from "../../stores/listingDraftStore";
import {
    FieldLabel,
    FormInput,
    FormTextarea,
    SectionCard,
    SelectField,
    CreatableSelect,
    TagInput,
    Toggle,
    ItineraryBuilder,
} from "./listingEditorShared";

// Helper: read a File to a data URL (module scope)
function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const CURRENCIES = ["USD", "EUR", "GBP", "LKR", "AUD", "SGD"];
const BOOKING_UNITS = ["Per Person", "Per Group", "Per Vehicle", "Per Day"];
const ROOM_TYPE_OPTIONS = [
    "Deluxe Room",
    "Standard Room",
    "Superior Room",
    "Master Bedroom",
    "Executive Suite",
    "Junior Suite",
    "Family Suite",
    "Presidential Suite",
    "King Room",
    "Queen Room",
    "Twin Room",
    "Single Room",
    "Studio Apartment",
    "Private Villa",
    "Luxury Bungalow",
    "Ocean View Room",
    "Garden View Room",
    "Dormitory / Bunk Room",
    "Living Room",
    "Other Room",
];

export function normalizeStayRoomType(value?: string | null) {
    const normalized = String(value ?? "").trim();
    if (!normalized || normalized === "BedRoom" || normalized === "Bedroom") return "Standard Room";
    return normalized;
}
const DEFAULT_HOUSE_RULES = {
    Smoking: false,
    Children: false,
    "Parties / events": false,
    Pets: false,
};

type DiscountType = "percentage" | "flat";

export interface RoomDiscount {
    id: string;
    label: string;
    type: DiscountType;
    value: string;
}

function parseMoneyValue(value: string): number | null {
    const cleaned = value.trim().replace(/[$,]/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
}

function normalizeRoomDiscounts(discounts: unknown): RoomDiscount[] {
    if (!Array.isArray(discounts)) return [];

    return discounts
        .map((discount, index) => {
            if (typeof discount === "string") {
                const percentMatch = discount.trim().match(/^([0-9]+(?:\.[0-9]+)?)%$/);
                const flatMatch = discount.trim().match(/^[₹$]?\s*([0-9]+(?:\.[0-9]+)?)$/);

                return {
                    id: `legacy_discount_${index}`,
                    label: `Discount ${index + 1}`,
                    type: percentMatch ? "percentage" : "flat",
                    value: percentMatch?.[1] ?? flatMatch?.[1] ?? discount.trim(),
                } satisfies RoomDiscount;
            }

            if (discount && typeof discount === "object") {
                const item = discount as Partial<RoomDiscount>;
                return {
                    id: item.id ?? `discount_${index}`,
                    label: item.label ?? `Discount ${index + 1}`,
                    type: item.type === "percentage" ? "percentage" : "flat",
                    value: item.value ?? "",
                } satisfies RoomDiscount;
            }

            return null;
        })
        .filter((discount): discount is RoomDiscount => discount !== null);
}

function calculateDiscountedPrice(basePrice: string, discounts: RoomDiscount[]) {
    const startingPrice = parseMoneyValue(basePrice);
    if (startingPrice === null) {
        return { basePrice: null, discountTotal: null, finalPrice: null, hasInvalidDiscount: false };
    }

    let currentPrice = startingPrice;
    let totalDiscount = 0;
    let hasInvalidDiscount = false;

    discounts.forEach((discount) => {
        const amount = parseMoneyValue(discount.value);
        if (amount === null || amount <= 0) {
            hasInvalidDiscount = true;
            return;
        }

        if (discount.type === "percentage") {
            if (amount > 100) {
                hasInvalidDiscount = true;
                return;
            }

            const applied = (currentPrice * amount) / 100;
            totalDiscount += applied;
            currentPrice = Math.max(0, currentPrice - applied);
            return;
        }

        if (amount > currentPrice) {
            hasInvalidDiscount = true;
            return;
        }

        totalDiscount += amount;
        currentPrice = Math.max(0, currentPrice - amount);
    });

    return {
        basePrice: startingPrice,
        discountTotal: hasInvalidDiscount ? null : totalDiscount,
        finalPrice: hasInvalidDiscount ? null : currentPrice,
        hasInvalidDiscount,
    };
}

async function filesToDataUrls(files: File[]) {
    return Promise.all(files.map((file) => readFileAsDataUrl(file)));
}

export interface PricingVariant {
    id: string;
    name: string;
    unit: string;
    minCapacity: string;
    maxCapacity: string;
    price: string;
    currency: string;
    priority: number;
    isDefault: boolean;
}

export interface RoomType {
    id: string;
    type: string;
    count: string;
    beds: string;
    hasBeds?: boolean;
    cribs: string;
    maxGuests: string;
    size: string;
    smoking: boolean;
    bathroomType: string;
    bathroomItems: string[];
    guestAccess: boolean;
    pricePerNight: string;
    currency: string;
    discounts: RoomDiscount[];
    /** Shown to guests on the room card; kept as stored so saving the form never blanks it. */
    description?: string;
    bedBreakdown?: Record<string, number>;
    coverImage?: string;
    gallery?: string[];
}

export function BasicInfoTab({
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
    return (
        <SectionCard title="Basic Information">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <FieldLabel required>Title</FieldLabel>
                    <FormInput value={title} onChange={setTitle} placeholder="Listing title" />
                </div>
                <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
                    <div>
                        <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Active listing</p>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Set whether the listing is visible to users.</p>
                    </div>
                    <Toggle value={active} onChange={setActive} />
                </div>
                <div className="col-span-2">
                    <FieldLabel>Description</FieldLabel>
                    <FormTextarea value={description} onChange={setDescription} rows={5} placeholder="Write a short description" />
                </div>
            </div>
        </SectionCard>
    );
}

export interface DestinationOption {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
}

/**
 * Where a Safari, Tour or Experience takes place. The destination is picked from the destinations the platform
 * already has, so a listing can never be saved against a destination that was only typed in.
 */
export function LocationSection({
    destinations,
    destinationsLoading,
    destinationId,
    setDestinationId,
    setDestination,
    lat,
    setLat,
    lng,
    setLng,
}: {
    destinations: DestinationOption[];
    destinationsLoading: boolean;
    destinationId: string;
    setDestinationId: (id: string) => void;
    setDestination: (name: string) => void;
    lat: string;
    setLat: (value: string) => void;
    lng: string;
    setLng: (value: string) => void;
}) {
    const labelFor = (option: DestinationOption) =>
        destinations.filter((other) => other.name === option.name).length > 1 ? `${option.name} (${option.id.slice(0, 4)})` : option.name;
    const selected = destinations.find((option) => option.id === destinationId);

    const choose = (label: string) => {
        const option = destinations.find((candidate) => labelFor(candidate) === label);
        if (!option) return;
        setDestinationId(option.id);
        setDestination(option.name);
        // Start the map position from the destination, but never overwrite coordinates that were already entered.
        if (!lat.trim() && !lng.trim() && option.latitude != null && option.longitude != null) {
            setLat(String(option.latitude));
            setLng(String(option.longitude));
        }
    };

    return (
        <SectionCard title="Location">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <FieldLabel required>Destination</FieldLabel>
                    {destinationsLoading ? (
                        <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Loading destinations…</p>
                    ) : destinations.length === 0 ? (
                        <p className="text-[12px]" style={{ color: "var(--error)" }}>No destinations are available, so a listing cannot be placed yet.</p>
                    ) : (
                        <SelectField
                            value={selected ? labelFor(selected) : ""}
                            onChange={choose}
                            options={destinations.map(labelFor)}
                            placeholder="Choose a destination"
                        />
                    )}
                    <p className="text-[11px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>
                        Guests find this listing under the destination you choose.
                    </p>
                </div>
                <div>
                    <FieldLabel>Latitude</FieldLabel>
                    <FormInput value={lat} onChange={setLat} placeholder="e.g. 6.3728" />
                </div>
                <div>
                    <FieldLabel>Longitude</FieldLabel>
                    <FormInput value={lng} onChange={setLng} placeholder="e.g. 81.5156" />
                </div>
                <p className="col-span-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    Map position is optional, but enter both numbers or leave both empty.
                </p>
            </div>
        </SectionCard>
    );
}

export function DestinationTab({
    destination,
    setDestination,
    lat,
    setLat,
    lng,
    setLng,
}: {
    destination: string;
    setDestination: (value: string) => void;
    lat: string;
    setLat: (value: string) => void;
    lng: string;
    setLng: (value: string) => void;
}) {
    return (
        <SectionCard title="Destination">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
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
            </div>
        </SectionCard>
    );
}

/** `profileMode` hides the name and location inputs, which the Stay drawer edits in its own "Property & contact" section. */
export function MediaTab({ profileMode = false }: { profileMode?: boolean } = {}) {
    const setDraft = useListingDraftStore((s) => s.setDraft);
    const draftCategoryData = useListingDraftStore((s) => s.categoryData ?? {});
    const draftPropertyDetails = draftCategoryData.propertyDetails ?? {};
    const [breakfastIncluded, setBreakfastIncluded] = useState(Boolean(draftPropertyDetails.breakfastIncluded ?? false));
    const [propertyLocation, setPropertyLocation] = useState(String(draftPropertyDetails.propertyLocation ?? ""));
    const [propertyName, setPropertyName] = useState(String(draftPropertyDetails.propertyName ?? ""));
    const [parking, setParking] = useState(Boolean(draftPropertyDetails.parking ?? true));
    const [langs, setLangs] = useState<string[]>(() => draftPropertyDetails.languages ?? []);
    const [houseRules, setHouseRules] = useState<Record<string, boolean>>(() => {
        const savedRules = draftPropertyDetails.houseRules ?? {};
        return Object.fromEntries(
            Object.keys(DEFAULT_HOUSE_RULES).map((key) => [key, Boolean(savedRules[key] ?? DEFAULT_HOUSE_RULES[key as keyof typeof DEFAULT_HOUSE_RULES])]),
        );
    });
    const [checkInTime, setCheckInTime] = useState(String(draftPropertyDetails.checkInTime ?? (profileMode ? "14:00" : "")));
    const [checkOutTime, setCheckOutTime] = useState(String(draftPropertyDetails.checkOutTime ?? (profileMode ? "11:00" : "")));

    const [hpProperty, setHpProperty] = useState<boolean>(draftCategoryData.hostProfile?.property ?? false);
    const [hpHost, setHpHost] = useState<boolean>(draftCategoryData.hostProfile?.host ?? false);
    const [hpNeighborhood, setHpNeighborhood] = useState<boolean>(draftCategoryData.hostProfile?.neighborhood ?? false);
    const [hpAbout, setHpAbout] = useState<string>(draftCategoryData.hostProfile?.aboutNeighborhood ?? "");
    const [hpNone, setHpNone] = useState<boolean>(draftCategoryData.hostProfile?.none ?? false);

    useEffect(() => {
        setDraft({
            categoryData: {
                ...(useListingDraftStore.getState().categoryData || {}),
                propertyDetails: {
                    propertyLocation,
                    propertyName,
                    breakfastIncluded,
                    parking,
                    languages: langs,
                    houseRules,
                    checkInTime,
                    checkOutTime,
                },
                hostProfile: { property: hpProperty, host: hpHost, neighborhood: hpNeighborhood, aboutNeighborhood: hpAbout, none: hpNone },
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyLocation, propertyName, breakfastIncluded, parking, langs, houseRules, checkInTime, checkOutTime, hpProperty, hpHost, hpNeighborhood, hpAbout, hpNone]);

    return (
        <div>
            <SectionCard title="Property Details">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {!profileMode && (
                        <div>
                            <FieldLabel required>Where is the property</FieldLabel>
                            <FormInput value={propertyLocation} onChange={setPropertyLocation} placeholder="City, area" />
                        </div>
                    )}
                    <div>
                        <FieldLabel>Breakfast included</FieldLabel>
                        <div className="flex items-center gap-3 h-9">
                            <Toggle value={breakfastIncluded} onChange={setBreakfastIncluded} />
                        </div>
                    </div>
                    {!profileMode && (
                        <div>
                            <FieldLabel required>Property Name</FieldLabel>
                            <FormInput value={propertyName} onChange={setPropertyName} placeholder="Name" />
                        </div>
                    )}
                    <div>
                        <FieldLabel>Parking?</FieldLabel>
                        <div className="flex items-center gap-3 h-9">
                            <Toggle value={parking} onChange={setParking} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <FieldLabel>Languages</FieldLabel>
                        <TagInput tags={langs} onChange={setLangs} placeholder="Add language..." />
                    </div>
                    <div>
                        <FieldLabel>House Rules</FieldLabel>
                        <div className="grid grid-cols-1 gap-2">
                            {Object.keys(houseRules).map((key) => (
                                <label key={key} className="flex items-center gap-2 text-[13px]">
                                    <input
                                        type="checkbox"
                                        checked={houseRules[key]}
                                        onChange={(e) => setHouseRules({ ...houseRules, [key]: e.target.checked })}
                                    />
                                    <span style={{ color: "var(--text-secondary)" }}>{key}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FieldLabel required>Check-in Time</FieldLabel>
                        <FormInput value={checkInTime} onChange={setCheckInTime} type="time" />
                    </div>
                    <div>
                        <FieldLabel required>Check-out Time</FieldLabel>
                        <FormInput value={checkOutTime} onChange={setCheckOutTime} type="time" />
                    </div>
                </div>
            </SectionCard>

            {/* Rooms section moved to StayDetails to avoid duplicate handlers */}

            <SectionCard title="Host profile">
                <div style={{ color: "var(--text-secondary)" }} className="mb-3">
                    <p className="text-[12px] mb-2">Help your listing stand out by telling potential guests a little more about yourself, your property, and your neighborhood. This info will appear on your property page.</p>
                </div>

                <div className="space-y-3 mb-3">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={hpProperty} onChange={(e) => setHpProperty(e.target.checked)} />
                        <p className="text-[12px] mb-2">The property</p>
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={hpHost} onChange={(e) => setHpHost(e.target.checked)} />
                        <p className="text-[12px] mb-2">The host</p>
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={hpNeighborhood} onChange={(e) => setHpNeighborhood(e.target.checked)} />
                        <p className="text-[12px] mb-2">The neighborhood</p>
                    </label>
                </div>

                <div className="mb-3">
                    <div className="flex items-center justify-between">
                        <FieldLabel>About the neighborhood</FieldLabel>
                        <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{Math.min(hpAbout.length, 1200)} / 1200</div>
                    </div>
                    <FormTextarea value={hpAbout} onChange={setHpAbout} rows={4} placeholder="Tell guests about the neighborhood" />
                </div>

                <div>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={hpNone} onChange={(e) => setHpNone(e.target.checked)} />
                        <span className="text-[12px] mb-2">None of the above / I'll add these later</span>
                    </label>
                </div>
            </SectionCard>
        </div>
    );
}

export function PricingTab({
    variants,
    setVariants,
}: {
    variants: PricingVariant[];
    setVariants: (v: PricingVariant[]) => void;
}) {
    const addVariant = () => {
        const isFirst = variants.length === 0;
        setVariants([
            ...variants,
            {
                id: `var_${Date.now()}`,
                name: `Option ${variants.length + 1}`,
                unit: "Per Person",
                minCapacity: "1",
                maxCapacity: "6",
                price: "100",
                currency: "USD",
                priority: variants.length + 1,
                isDefault: isFirst,
            },
        ]);
    };

    const removeVariant = (id: string) => {
        const next = variants.filter((v) => v.id !== id);
        if (next.length > 0 && !next.some((v) => v.isDefault)) {
            next[0] = { ...next[0], isDefault: true };
        }
        setVariants(next);
    };
    const updateVariant = (id: string, updates: Partial<PricingVariant>) =>
        setVariants(variants.map((v) => (v.id === id ? { ...v, ...updates } : v)));

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={addVariant}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all"
                    style={{
                        background: "var(--active-overlay)",
                        color: "var(--accent-navy-light)",
                        border: "1px solid var(--border-accent)",
                    }}
                >
                    <Plus size={12} />
                    Add price option
                </button>
            </div>

            <div className="space-y-3">
                {variants.map((variant) => (
                    <div
                        key={variant.id}
                        className="rounded-xl p-4"
                        style={{
                            background: "var(--input-background)",
                            border: "1px solid var(--border-light)",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <GripVertical size={14} style={{ color: "var(--text-tertiary)" }} className="cursor-grab" />
                            <input
                                value={variant.name}
                                onChange={(e) => updateVariant(variant.id, { name: e.target.value })}
                                aria-label="Price option name"
                                placeholder="Name this option, e.g. Standard or Private"
                                className="flex-1 bg-transparent outline-none text-[14px]"
                                style={{ color: "var(--text-primary)", fontWeight: 500 }}
                            />
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() =>
                                        setVariants(
                                            variants.map((v) => ({ ...v, isDefault: v.id === variant.id }))
                                        )
                                    }
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-all"
                                    style={
                                        variant.isDefault
                                            ? { background: "var(--active-overlay)", color: "var(--accent-navy-light)", border: "1px solid var(--border-accent)" }
                                            : { color: "var(--text-tertiary)", border: "1px solid var(--border-light)" }
                                    }
                                >
                                    {variant.isDefault ? <Check size={10} /> : null}
                                    {variant.isDefault ? "Default" : "Set Default"}
                                </button>
                                {!variant.isDefault && (
                                    <button
                                        type="button"
                                        aria-label={`Remove ${variant.name || "price option"}`}
                                        onClick={() => removeVariant(variant.id)}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                                        style={{ color: "var(--text-secondary)" }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                                            (e.currentTarget as HTMLElement).style.color = "var(--error)";
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLElement).style.background = "transparent";
                                            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                                        }}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <FieldLabel>Booking Unit</FieldLabel>
                                <SelectField
                                    value={variant.unit}
                                    onChange={(v) => updateVariant(variant.id, { unit: v })}
                                    options={BOOKING_UNITS}
                                />
                            </div>
                            <div>
                                <FieldLabel>Min Capacity</FieldLabel>
                                <FormInput
                                    value={variant.minCapacity}
                                    onChange={(v) => updateVariant(variant.id, { minCapacity: v })}
                                    type="number"
                                    placeholder="1"
                                />
                            </div>
                            <div>
                                <FieldLabel>Max Capacity</FieldLabel>
                                <FormInput
                                    value={variant.maxCapacity}
                                    onChange={(v) => updateVariant(variant.id, { maxCapacity: v })}
                                    type="number"
                                    placeholder="6"
                                />
                            </div>
                            <div>
                                <FieldLabel>Price</FieldLabel>
                                <FormInput
                                    value={variant.price}
                                    onChange={(v) => updateVariant(variant.id, { price: v })}
                                    type="number"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <FieldLabel>Currency</FieldLabel>
                                <SelectField
                                    value={variant.currency}
                                    onChange={(v) => updateVariant(variant.id, { currency: v })}
                                    options={CURRENCIES}
                                />
                            </div>
                            <div>
                                <FieldLabel>Priority</FieldLabel>
                                <FormInput
                                    value={String(variant.priority)}
                                    onChange={(v) => updateVariant(variant.id, { priority: Number(v) })}
                                    type="number"
                                    placeholder="1"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export interface SafariPackageOptionItem {
  id: string;
  name: string;
  type: "private_jeep" | "shared_seat" | "full_day";
  price: number;
  currency: string;
  capacityMax: number;
  timeSlot: string; // "Morning (06:00 AM – 10:00 AM)", "Afternoon (02:30 PM – 06:30 PM)", "Full Day (06:00 AM – 06:00 PM)"
  durationLabel: string;
  description: string;
  includesParkFees: boolean;
}

const SESSION_SLOTS = [
  {
    key: "Morning",
    label: "Morning Drive Session",
    time: "06:00 AM – 10:00 AM",
    defaultDuration: "4 Hours (06:00 AM – 10:00 AM)",
    defaultSlot: "Morning (06:00 AM – 10:00 AM)",
  },
  {
    key: "Afternoon",
    label: "Afternoon Drive Session",
    time: "02:30 PM – 06:30 PM",
    defaultDuration: "4 Hours (02:30 PM – 06:30 PM)",
    defaultSlot: "Afternoon (02:30 PM – 06:30 PM)",
  },
  {
    key: "Full Day",
    label: "Full Day Safari Session",
    time: "06:00 AM – 06:00 PM",
    defaultDuration: "12 Hours (06:00 AM – 06:00 PM)",
    defaultSlot: "Full Day (06:00 AM – 06:00 PM)",
  },
];

const JEEP_PRESET_NAMES = [
  "4x4 Open Safari Jeep (Standard 6-Seater)",
  "Luxury Modified 4x4 Safari Jeep (Up to 6 Guests)",
  "VIP Full Day Expedition Jeep (Private 4x4)",
  "Shared Seat Safari Jeep (Per Person)",
];

function SafariPackagesSection() {
    const draftCategoryData = useListingDraftStore((s) => s.categoryData ?? {});
    const setDraft = useListingDraftStore((s) => s.setDraft);

    // Active session slots selection state
    const [enabledSlots, setEnabledSlots] = useState<Record<string, boolean>>(() => {
        if (draftCategoryData.enabledSlots) {
            return draftCategoryData.enabledSlots;
        }
        return { Morning: true, Afternoon: true, "Full Day": true };
    });

    const [packages, setPackages] = useState<SafariPackageOptionItem[]>(() => {
        if (Array.isArray(draftCategoryData.safariPackages) && draftCategoryData.safariPackages.length > 0) {
            return draftCategoryData.safariPackages;
        }
        return [
            {
                id: "safari_opt_morning_private",
                name: "4x4 Open Safari Jeep (Standard 6-Seater)",
                type: "private_jeep",
                price: 150,
                currency: "USD",
                capacityMax: 6,
                timeSlot: "Morning (06:00 AM – 10:00 AM)",
                durationLabel: "4 Hours (06:00 AM – 10:00 AM)",
                description: "Best for leopard spotting and bird watching during cool morning hours. Dedicated naturalist guide & open-roof 4WD.",
                includesParkFees: true,
            },
            {
                id: "safari_opt_afternoon_private",
                name: "4x4 Open Safari Jeep (Standard 6-Seater)",
                type: "private_jeep",
                price: 140,
                currency: "USD",
                capacityMax: 6,
                timeSlot: "Afternoon (02:30 PM – 06:30 PM)",
                durationLabel: "4 Hours (02:30 PM – 06:30 PM)",
                description: "Golden hour safari. High probability of elephant herds gathering near lakes & waterholes before sunset.",
                includesParkFees: true,
            },
            {
                id: "safari_opt_fullday_private",
                name: "VIP Full Day Expedition Jeep (Private 4x4)",
                type: "full_day",
                price: 280,
                currency: "USD",
                capacityMax: 6,
                timeSlot: "Full Day (06:00 AM – 06:00 PM)",
                durationLabel: "12 Hours (06:00 AM – 06:00 PM)",
                description: "Complete deep-park exploration including remote Block 2 zones, picnic lunch by riverbank, and full-day ranger.",
                includesParkFees: true,
            },
        ];
    });

    useEffect(() => {
        setDraft({
            categoryData: {
                ...(useListingDraftStore.getState().categoryData || {}),
                enabledSlots,
                safariPackages: packages,
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabledSlots, packages]);

    const toggleSlot = (key: string) => {
        setEnabledSlots((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAddPackageForSlot = (slotObj: typeof SESSION_SLOTS[number]) => {
        const newPkg: SafariPackageOptionItem = {
            id: `pkg_${Date.now()}`,
            name: "4x4 Open Safari Jeep (Standard 6-Seater)",
            type: slotObj.key === "Full Day" ? "full_day" : "private_jeep",
            price: slotObj.key === "Full Day" ? 280 : 150,
            currency: "USD",
            capacityMax: 6,
            timeSlot: slotObj.defaultSlot,
            durationLabel: slotObj.defaultDuration,
            description: "Dedicated naturalist guide, open-roof 4WD jeep, and park entry included.",
            includesParkFees: true,
        };
        setPackages((prev) => [...prev, newPkg]);
    };

    const handleRemovePackage = (id: string) => {
        setPackages((prev) => prev.filter((p) => p.id !== id));
    };

    const handleUpdatePackage = (id: string, field: keyof SafariPackageOptionItem, value: any) => {
        setPackages((prev) =>
            prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
        );
    };

    return (
        <div className="space-y-6">
            {/* Step 1: Game Drive Time Slots */}
            <SectionCard title="1. Game Drive Time Slots Availability">
                <p className="text-xs text-[var(--text-secondary)] mb-4">
                    Enable the standard Sri Lankan national park safari session time slots offered for this listing:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {SESSION_SLOTS.map((slot) => {
                        const isEnabled = enabledSlots[slot.key] !== false;
                        return (
                            <div
                                key={slot.key}
                                onClick={() => toggleSlot(slot.key)}
                                className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                                    isEnabled
                                        ? "border-[var(--accent-navy-light)] bg-[var(--active-overlay)] shadow-sm"
                                        : "border-[var(--border-light)] bg-[var(--input-background)] opacity-60"
                                }`}
                            >
                                <div>
                                    <h4 className="font-bold text-[var(--text-primary)] text-sm">{slot.label}</h4>
                                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{slot.time}</p>
                                </div>
                                <Toggle value={isEnabled} onChange={() => toggleSlot(slot.key)} />
                            </div>
                        );
                    })}
                </div>
            </SectionCard>

            {/* Step 2: Vehicle Packages & Pricing Grouped by Time Slot */}
            <SectionCard title="2. Safari Jeep Vehicle Packages & Pricing by Time Slot">
                <p className="text-xs text-[var(--text-secondary)] mb-4">
                    Configure the available Jeep vehicle types, max passenger capacities, and rates under each active time slot.
                </p>

                <div className="space-y-6">
                    {SESSION_SLOTS.filter((s) => enabledSlots[s.key] !== false).map((slotObj) => {
                        const slotPackages = packages.filter((p) => p.timeSlot.includes(slotObj.key));

                        return (
                            <div key={slotObj.key} className="p-4 rounded-2xl border border-[var(--border-light)] bg-[var(--input-background)] space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]">
                                    <div>
                                        <h3 className="font-extrabold text-[var(--text-primary)] text-sm flex items-center gap-2">
                                            <span>📅</span> {slotObj.label} ({slotObj.time})
                                        </h3>
                                        <span className="text-xs text-[var(--text-secondary)] font-medium">
                                            {slotPackages.length} vehicle package{slotPackages.length === 1 ? "" : "s"} configured
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleAddPackageForSlot(slotObj)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--accent-navy)] text-white hover:opacity-90 transition"
                                    >
                                        + Add Vehicle Package for {slotObj.key}
                                    </button>
                                </div>

                                {slotPackages.length === 0 ? (
                                    <div className="p-4 rounded-xl border border-dashed border-[var(--border-light)] text-center bg-[var(--bg-panel)] text-xs text-[var(--text-secondary)]">
                                        No vehicle packages added for {slotObj.label} yet. Click "+ Add Vehicle Package" to add one.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {slotPackages.map((pkg, idx) => (
                                            <div key={pkg.id} className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-panel)] space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black uppercase text-[var(--text-primary)]">
                                                        Vehicle Option #{idx + 1} — {slotObj.key} Session
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemovePackage(pkg.id)}
                                                        className="text-xs font-bold text-rose-500 hover:text-rose-400"
                                                    >
                                                        Remove Vehicle Option
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div className="col-span-2">
                                                        <FieldLabel required>Vehicle / Package Preset Name</FieldLabel>
                                                        <SelectField
                                                            value={pkg.name}
                                                            onChange={(val) => handleUpdatePackage(pkg.id, "name", val)}
                                                            options={JEEP_PRESET_NAMES}
                                                        />
                                                    </div>

                                                    <div>
                                                        <FieldLabel required>Pricing Unit</FieldLabel>
                                                        <SelectField
                                                            value={pkg.type === "shared_seat" ? "Per Person (Shared)" : "Per Vehicle (Private)"}
                                                            onChange={(val) => {
                                                                const isShared = val.includes("Per Person");
                                                                handleUpdatePackage(pkg.id, "type", isShared ? "shared_seat" : (slotObj.key === "Full Day" ? "full_day" : "private_jeep"));
                                                            }}
                                                            options={["Per Vehicle (Private)", "Per Person (Shared)"]}
                                                        />
                                                    </div>

                                                    <div>
                                                        <FieldLabel required>Package Price ({pkg.currency})</FieldLabel>
                                                        <FormInput
                                                            type="number"
                                                            value={pkg.price.toString()}
                                                            onChange={(val) => handleUpdatePackage(pkg.id, "price", parseFloat(val) || 0)}
                                                        />
                                                    </div>

                                                    <div>
                                                        <FieldLabel>Max Passengers / Jeep</FieldLabel>
                                                        <FormInput
                                                            type="number"
                                                            value={pkg.capacityMax.toString()}
                                                            onChange={(val) => handleUpdatePackage(pkg.id, "capacityMax", parseInt(val, 10) || 6)}
                                                        />
                                                    </div>

                                                    <div>
                                                        <FieldLabel>Session Duration Display</FieldLabel>
                                                        <FormInput
                                                            value={pkg.durationLabel}
                                                            onChange={(val) => handleUpdatePackage(pkg.id, "durationLabel", val)}
                                                            placeholder={slotObj.defaultDuration}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <FieldLabel>Description & Vehicle Features</FieldLabel>
                                                    <FormTextarea
                                                        value={pkg.description}
                                                        onChange={(val) => handleUpdatePackage(pkg.id, "description", val)}
                                                        rows={2}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-light)]">
                                                    <span className="text-xs font-semibold text-[var(--text-primary)]">Includes National Park Entrance Fees</span>
                                                    <Toggle
                                                        value={pkg.includesParkFees}
                                                        onChange={(v) => handleUpdatePackage(pkg.id, "includesParkFees", v)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </SectionCard>
        </div>
    );
}

function SafariDetails() {
    const draftCategoryData = useListingDraftStore((s) => s.categoryData ?? {});
    const setDraft = useListingDraftStore((s) => s.setDraft);

    const normalizeSafariDisplayType = (val?: string) => {
        if (!val) return "Private Safari";
        const v = val.toLowerCase();
        if (v.includes("morning")) return "Morning Safari";
        if (v.includes("evening") || v.includes("afternoon")) return "Evening Safari";
        if (v.includes("full")) return "Full Day Safari";
        if (v.includes("shared")) return "Shared Safari";
        return "Private Safari";
    };

    const [nationalPark, setNationalPark] = useState(draftCategoryData.nationalPark ?? "");
    const [safariType, setSafariType] = useState(() => normalizeSafariDisplayType(draftCategoryData.safariType));
    const [durationMinutes, setDurationMinutes] = useState(draftCategoryData.durationMinutes ?? "");
    const [difficultyLevel, setDifficultyLevel] = useState(draftCategoryData.difficultyLevel || "Moderate");
    const [ageRestriction, setAgeRestriction] = useState(draftCategoryData.ageRestriction ?? "");
    const [minGroupSize, setMinGroupSize] = useState(draftCategoryData.minGroupSize ?? "1");
    const [maxGroupSize, setMaxGroupSize] = useState(draftCategoryData.maxGroupSize || "6");
    const [startTime, setStartTime] = useState(draftCategoryData.startTime || "06:00");
    const [endTime, setEndTime] = useState(draftCategoryData.endTime || "12:00");
    const [bestSeason, setBestSeason] = useState(draftCategoryData.bestSeason ?? "");

    const [guideIncluded, setGuideIncluded] = useState(draftCategoryData.guideIncluded ?? true);
    const [pickupSupported, setPickupSupported] = useState(draftCategoryData.pickupSupported ?? true);
    const [privateAvailable, setPrivateAvailable] = useState(draftCategoryData.privateAvailable ?? true);

    const parkOptions = Array.from(new Set([
        nationalPark,
        "Yala National Park", "Minneriya National Park", "Wasgamuwa National Park", 
        "Kaudulla National Park", "Lunugamvehera National Park", "Udawalawe National Park", "Wilpattu National Park"
    ])).filter(Boolean);

    const [wildlife, setWildlife] = useState<string[]>(
        draftCategoryData.wildlifeHighlights ?? []
    );
    const [included, setIncluded] = useState<string[]>(
        draftCategoryData.includedItems ?? []
    );
    const [excluded, setExcluded] = useState<string[]>(
        draftCategoryData.excludedItems ?? []
    );
    const [languages, setLanguages] = useState<string[]>(
        draftCategoryData.languages ?? ["English"]
    );
    const [toBring, setToBring] = useState<string[]>(
        draftCategoryData.whatToBring ?? []
    );

    const [pickupNotes, setPickupNotes] = useState(
        draftCategoryData.pickupNotes ?? ""
    );
    const [cancellationPolicy, setCancellationPolicy] = useState(
        draftCategoryData.cancellationPolicy ?? ""
    );
    const [accessibilityInfo, setAccessibilityInfo] = useState(
        draftCategoryData.accessibilityInfo ?? ""
    );

    // Sync to global draft store
    useEffect(() => {
        setDraft({
            categoryData: {
                ...(useListingDraftStore.getState().categoryData || {}),
                nationalPark,
                safariType,
                durationMinutes,
                difficultyLevel,
                ageRestriction,
                minGroupSize,
                maxGroupSize,
                startTime,
                endTime,
                bestSeason,
                guideIncluded,
                pickupSupported,
                privateAvailable,
                wildlifeHighlights: wildlife,
                includedItems: included,
                excludedItems: excluded,
                languages,
                whatToBring: toBring,
                pickupNotes,
                cancellationPolicy,
                accessibilityInfo,
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        nationalPark, safariType, durationMinutes, difficultyLevel, ageRestriction,
        minGroupSize, maxGroupSize, startTime, endTime, bestSeason, guideIncluded,
        pickupSupported, privateAvailable, wildlife, included, excluded, languages,
        toBring, pickupNotes, cancellationPolicy, accessibilityInfo,
    ]);

    return (
        <div className="space-y-4">
            <SectionCard title="Safari Overview">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <FieldLabel required>National Park</FieldLabel>
                        <SelectField
                            value={nationalPark}
                            onChange={(val) => setNationalPark(val)}
                            options={parkOptions}
                            placeholder="Select a national park"
                        />
                    </div>
                    <div>
                        <FieldLabel required>Safari Type</FieldLabel>
                        <SelectField
                            value={safariType}
                            onChange={(val) => setSafariType(val)}
                            options={["Private Safari", "Morning Safari", "Evening Safari", "Full Day Safari", "Shared Safari"]}
                        />
                    </div>
                    <div>
                        <FieldLabel>Duration (minutes)</FieldLabel>
                        <FormInput value={durationMinutes} onChange={(val) => setDurationMinutes(val)} placeholder="e.g. 360" type="number" />
                    </div>
                    <div>
                        <FieldLabel>Difficulty Level</FieldLabel>
                        <SelectField value={difficultyLevel} onChange={(val) => setDifficultyLevel(val)} options={["Easy", "Moderate", "Challenging"]} />
                    </div>
                    <div>
                        <FieldLabel>Age Restriction</FieldLabel>
                        <FormInput value={ageRestriction} onChange={(val) => setAgeRestriction(val)} placeholder="e.g. 5+" />
                    </div>
                    <div>
                        <FieldLabel>Min Group Size</FieldLabel>
                        <FormInput value={minGroupSize} onChange={(val) => setMinGroupSize(val)} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Max Group Size</FieldLabel>
                        <FormInput value={maxGroupSize} onChange={(val) => setMaxGroupSize(val)} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Start Time</FieldLabel>
                        <FormInput value={startTime} onChange={(val) => setStartTime(val)} type="time" />
                    </div>
                    <div>
                        <FieldLabel>End Time</FieldLabel>
                        <FormInput value={endTime} onChange={(val) => setEndTime(val)} type="time" />
                    </div>
                    <div className="col-span-3">
                        <FieldLabel>Best Season</FieldLabel>
                        <FormInput value={bestSeason} onChange={(val) => setBestSeason(val)} placeholder="e.g. Feb–Jul" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {[
                        { label: "Guide Included", value: guideIncluded, setter: setGuideIncluded },
                        { label: "Pickup Supported", value: pickupSupported, setter: setPickupSupported },
                        { label: "Private Available", value: privateAvailable, setter: setPrivateAvailable },
                    ].map(({ label, value, setter }) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
                            <Toggle value={value} onChange={(v) => setter(v)} />
                        </div>
                    ))}
                </div>
            </SectionCard>

            <SafariPackagesSection />

            <SectionCard title="Wildlife Highlights">
                <TagInput tags={wildlife} onChange={setWildlife} placeholder="Add wildlife species..." />
            </SectionCard>

            <SectionCard title="What's Included / Excluded">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>Included Items</FieldLabel>
                        <TagInput tags={included} onChange={setIncluded} placeholder="Add included item..." />
                    </div>
                    <div>
                        <FieldLabel>Excluded Items</FieldLabel>
                        <TagInput tags={excluded} onChange={setExcluded} placeholder="Add excluded item..." />
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Languages & What to Bring">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>Languages</FieldLabel>
                        <TagInput tags={languages} onChange={setLanguages} placeholder="Add language..." />
                    </div>
                    <div>
                        <FieldLabel>What to Bring</FieldLabel>
                        <TagInput tags={toBring} onChange={setToBring} placeholder="Add item..." />
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Additional Information">
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Pickup Notes</FieldLabel>
                        <FormTextarea value={pickupNotes} onChange={(val) => setPickupNotes(val)} rows={3} placeholder="Where and when guests are picked up, and from which areas" />
                    </div>
                    <div>
                        <FieldLabel>Cancellation Policy</FieldLabel>
                        <FormTextarea value={cancellationPolicy} onChange={(val) => setCancellationPolicy(val)} rows={3} placeholder="Refund rules, e.g. free cancellation up to 48 hours before" />
                    </div>
                    <div>
                        <FieldLabel>Accessibility Info</FieldLabel>
                        <FormTextarea value={accessibilityInfo} onChange={(val) => setAccessibilityInfo(val)} rows={2} placeholder="Mobility and age requirements" />
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}

function StayDetails() {
    const [amenities, setAmenities] = useState(["Pool", "Spa", "Free WiFi", "Restaurant", "Bar", "Gym", "Parking"]);
    const [languages, setLanguages] = useState(["English", "Sinhala", "Tamil"]);
    const [meals, setMeals] = useState(["Breakfast", "Half Board", "Full Board"]);
    const draftCategoryData = useListingDraftStore((s) => s.categoryData ?? {});
    const setDraft = useListingDraftStore((s) => s.setDraft);

    const [rooms, setRooms] = useState<RoomType[]>(() => (draftCategoryData.roomTypes ?? []) as RoomType[]);
    const [paymentPolicy, setPaymentPolicy] = useState<"pay_at_property" | "full_online_payment">(
        draftCategoryData.paymentPolicy ?? "pay_at_property"
    );

    useEffect(() => {
        setDraft({ categoryData: { ...(useListingDraftStore.getState().categoryData || {}), roomTypes: rooms, paymentPolicy } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rooms, paymentPolicy]);

    const addRoom = () => {
        const newRoom: RoomType = {
            id: `room_${Date.now()}`,
            type: "Standard",
            count: "1",
            beds: "1",
            hasBeds: false,
            cribs: "0",
            maxGuests: "2",
            size: "",
            smoking: false,
            bathroomType: "Private",
            bathroomItems: [],
            guestAccess: false,
            pricePerNight: "",
            currency: "USD",
            discounts: [],
            bedBreakdown: {},
            coverImage: "",
            gallery: [],
        };
        setRooms((r) => [...r, newRoom]);
    };

    const removeRoom = (id: string) => setRooms((r) => r.filter((x) => x.id !== id));

    const updateRoom = (id: string, updates: Partial<RoomType>) =>
        setRooms((r) => r.map((room) => (room.id === id ? { ...room, ...updates } : room)));

    return (
        <div className="space-y-4">
            <SectionCard title="Property Details">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <FieldLabel required>Property Type</FieldLabel>
                        <SelectField value="Boutique Hotel" onChange={() => { }} options={["Hotel", "Boutique Hotel", "Villa", "Resort", "Guesthouse", "Bungalow", "Eco Lodge", "Apartment"]} />
                    </div>
                    <div>
                        <FieldLabel required>Property Name</FieldLabel>
                        <FormInput value="Heritance Kandalama" onChange={() => { }} />
                    </div>
                    <div>
                        <FieldLabel>Short Location</FieldLabel>
                        <FormInput value="Dambulla, Central Province" onChange={() => { }} />
                    </div>
                    <div>
                        <FieldLabel>Star Rating</FieldLabel>
                        <SelectField value="5" onChange={() => { }} options={["1", "2", "3", "4", "5"]} />
                    </div>
                    <div>
                        <FieldLabel>Room Count</FieldLabel>
                        <FormInput value="152" onChange={() => { }} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Max Guest Capacity</FieldLabel>
                        <FormInput value="304" onChange={() => { }} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Check-in Time</FieldLabel>
                        <FormInput value="14:00" onChange={() => { }} type="time" />
                    </div>
                    <div>
                        <FieldLabel>Check-out Time</FieldLabel>
                        <FormInput value="11:00" onChange={() => { }} type="time" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6 mb-4">
                    {["Parking Available", "Wi-Fi Available", "Pets Allowed"].map((label) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
                            <Toggle value={label !== "Pets Allowed"} onChange={() => { }} />
                        </div>
                    ))}
                </div>
            </SectionCard>

            <SectionCard title="Address & Contact">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>Address Line 1</FieldLabel>
                        <FormInput value="Heritance Kandalama Road" onChange={() => { }} />
                    </div>
                    <div>
                        <FieldLabel>Address Line 2</FieldLabel>
                        <FormInput value="" onChange={() => { }} placeholder="Optional" />
                    </div>
                    <div>
                        <FieldLabel>City</FieldLabel>
                        <FormInput value="Dambulla" onChange={() => { }} />
                    </div>
                    <div>
                        <FieldLabel>District</FieldLabel>
                        <FormInput value="Matale" onChange={() => { }} />
                    </div>
                    <div>
                        <FieldLabel>Postal Code</FieldLabel>
                        <FormInput value="21100" onChange={() => { }} />
                    </div>
                    <div>
                        <FieldLabel>Contact Phone</FieldLabel>
                        <FormInput value="+94 66 555 5000" onChange={() => { }} type="tel" />
                    </div>
                    <div>
                        <FieldLabel>Contact Email</FieldLabel>
                        <FormInput value="reservations@heritance.com" onChange={() => { }} type="email" />
                    </div>
                    <div>
                        <FieldLabel>Website</FieldLabel>
                        <FormInput value="https://www.heritancehotels.com/kandalama" onChange={() => { }} type="url" />
                    </div>
                    <div className="col-span-2">
                        <FieldLabel>Google Map URL</FieldLabel>
                        <FormInput value="https://maps.google.com/?q=7.8731,80.6611" onChange={() => { }} type="url" />
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Amenities, Languages & Meal Plans">
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Amenities</FieldLabel>
                        <TagInput tags={amenities} onChange={setAmenities} placeholder="Add amenity..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Languages Spoken</FieldLabel>
                            <TagInput tags={languages} onChange={setLanguages} placeholder="Add language..." />
                        </div>
                        <div>
                            <FieldLabel>Meal Plans</FieldLabel>
                            <TagInput tags={meals} onChange={setMeals} placeholder="Add meal plan..." />
                        </div>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Policies">
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Child Policy</FieldLabel>
                        <FormTextarea value="Children of all ages are welcome. Children under 6 stay free. Extra beds available for older children." onChange={() => { }} rows={2} />
                    </div>
                    <div>
                        <FieldLabel>Smoking Policy</FieldLabel>
                        <FormTextarea value="Non-smoking property. Designated smoking areas available outdoors." onChange={() => { }} rows={2} />
                    </div>
                    <div>
                        <FieldLabel>Cancellation Policy</FieldLabel>
                        <FormTextarea value="Free cancellation up to 7 days before check-in. 50% charge for 3-7 days. Full charge within 3 days or no-show." onChange={() => { }} rows={2} />
                    </div>
                    <div>
                        <FieldLabel>Extra Bed Policy</FieldLabel>
                        <FormTextarea value="Extra beds available on request at $35 per night. Subject to availability and room capacity." onChange={() => { }} rows={2} />
                    </div>
                    <div>
                        <FieldLabel>Check-in Notes</FieldLabel>
                        <FormTextarea value="Early check-in subject to availability. Valid photo ID and credit card required at check-in." onChange={() => { }} rows={2} />
                    </div>
                    <div>
                        <FieldLabel>Check-out Notes</FieldLabel>
                        <FormTextarea value="Late check-out available until 15:00 for an additional charge, subject to availability." onChange={() => { }} rows={2} />
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Payment & Booking Policy">
                <div className="space-y-4">
                    <div>
                        <FieldLabel required>Payment Method Selection</FieldLabel>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <div
                                onClick={() => setPaymentPolicy("pay_at_property")}
                                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                                    paymentPolicy === "pay_at_property"
                                        ? "border-emerald-500 bg-emerald-500/10"
                                        : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"
                                }`}
                            >
                                <div className="mt-0.5">
                                    <input
                                        type="radio"
                                        name="payment_policy"
                                        checked={paymentPolicy === "pay_at_property"}
                                        onChange={() => setPaymentPolicy("pay_at_property")}
                                        className="accent-emerald-500"
                                    />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-emerald-400">Pay at Property (On-Spot)</p>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Guests pay directly in cash or card upon check-in. Confirmation email will specify check-in payment details.
                                    </p>
                                </div>
                            </div>

                            <div
                                onClick={() => setPaymentPolicy("full_online_payment")}
                                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                                    paymentPolicy === "full_online_payment"
                                        ? "border-blue-500 bg-blue-500/10"
                                        : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"
                                }`}
                            >
                                <div className="mt-0.5">
                                    <input
                                        type="radio"
                                        name="payment_policy"
                                        checked={paymentPolicy === "full_online_payment"}
                                        onChange={() => setPaymentPolicy("full_online_payment")}
                                        className="accent-blue-500"
                                    />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-blue-400">Full Online Payment (Automated)</p>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Platform collects full payment online upfront, deducts commission, and automatically processes payout to your account.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}

const CANONICAL_TOUR_CATEGORIES = [
    { id: "honeymoon", label: "Honeymoon & Romantic", icon: "💍", desc: "Secluded boutique stays, candlelight & romance" },
    { id: "wildlife", label: "Wildlife & Safari", icon: "🐘", desc: "Yala leopards, Minneriya elephants & marine life" },
    { id: "family", label: "Family & Leisure", icon: "👨‍👩‍👧‍👦", desc: "Relaxed pace, kid-friendly activities & coastal bliss" },
    { id: "cultural", label: "Cultural & Heritage", icon: "🏛️", desc: "Ancient kingdoms, Sigiriya rock & sacred temples" },
    { id: "wellness", label: "Wellness & Ayurveda", icon: "🌿", desc: "Yoga retreats, authentic Ayurveda & rejuvenation" },
    { id: "adventure", label: "Adventure & Trekking", icon: "🧗", desc: "Knuckles mountains, whitewater rafting & hikes" },
    { id: "beach", label: "Beach & Coastal", icon: "🏖️", desc: "Golden south coast, surfing & tropical relaxation" },
    { id: "hill-country", label: "Hill Country & Scenic", icon: "⛰️", desc: "Ella trains, misty tea valleys & waterfalls" },
];

const POPULAR_TOUR_DESTINATIONS = [
    "Negombo", "Sigiriya", "Dambulla", "Anuradhapura", "Polonnaruwa",
    "Kandy", "Nuwara Eliya", "Ella", "Yala", "Mirissa",
    "Galle Fort", "Bentota", "Tangalle", "Trincomalee", "Knuckles", "Colombo",
];

const COMMON_TOUR_INCLUSIONS = [
    "Private AC Luxury Vehicle",
    "English-speaking Chauffeur Guide",
    "Daily Breakfast",
    "Handpicked Boutique Accommodation",
    "Airport Meet & Greet & Transfers",
    "Sigiriya Lion Rock Entrance",
    "Yala National Park Jeep Safari & Fees",
    "Scenic Ella Train Reserved Tickets",
    "Bottled Mineral Water During Travel",
    "All Government Taxes & Highway Tolls",
    "24/7 Dedicated Ground Support",
];

const COMMON_TOUR_EXCLUSIONS = [
    "International Flights",
    "Sri Lanka Entry Tourist Visa (ETA)",
    "Travel & Medical Insurance",
    "Lunches & Dinners (unless specified)",
    "Tips & Chauffeur Guide Gratuities",
    "Personal Expenses & Souvenirs",
    "Camera & Drone Filming Permits",
    "Early Check-in / Late Check-out Fees",
];

const COMMON_WHAT_TO_BRING = [
    "Comfortable Walking / Hiking Shoes",
    "Sun Protection & Sunglasses",
    "Modest Attire for Temples (covers knees/shoulders)",
    "Lightweight Breathable Cotton Clothing",
    "Warm Light Jacket for Hill Country / Ella",
    "Camera with Extra Memory & Batteries",
    "Insect / Mosquito Repellent",
    "Valid Passport & Visa Documentation",
];

const COMMON_TOUR_HIGHLIGHTS = [
    "Kalpitiya Lagoon & Dolphin Watching",
    "Pidurangala Sunset Vista",
    "Sigiriya Lion Rock Fortress",
    "Knuckles Mountain Cloud Forest Trek",
    "Kandy Sacred Temple of the Tooth",
    "World-famous Scenic Train to Ella",
    "Ella's Quiet Corners & Nine Arch Bridge",
    "Yala National Park Leopard Safari",
    "Tangalle's Secluded Beaches",
    "Galle Fort Dutch Ramparts & Sunset",
];

const COMMON_MEETING_POINTS = [
    "Bandaranaike International Airport (CMB) — Arrival Hall",
    "Colombo City Hotels (Complimentary Pickup)",
    "Negombo Coastal Hotels",
    "Kandy Railway Station",
    "Galle Fort Main Gate",
];

function TourDetails() {
    const draftCategoryData = useListingDraftStore((s) => s.categoryData ?? {});
    const setDraft = useListingDraftStore((s) => s.setDraft);

    const updateDraft = (key: string, value: any) => {
        setDraft({ categoryData: { ...(useListingDraftStore.getState().categoryData || {}), [key]: value } });
    };

    const highlights = Array.isArray(draftCategoryData.itineraryHighlights) ? draftCategoryData.itineraryHighlights : [];
    const included = Array.isArray(draftCategoryData.includedItems) ? draftCategoryData.includedItems : [];
    const excluded = Array.isArray(draftCategoryData.excludedItems) ? draftCategoryData.excludedItems : [];
    const languages = Array.isArray(draftCategoryData.languages) && draftCategoryData.languages.length > 0 ? draftCategoryData.languages : ["English"];
    const toBring = Array.isArray(draftCategoryData.whatToBring) ? draftCategoryData.whatToBring : [];
    const itineraryList = Array.isArray(draftCategoryData.itinerary) ? draftCategoryData.itinerary : [];

    // Derive route destination stops dynamically from store (reactive to API load)
    const routeStops: string[] = (
        Array.isArray(draftCategoryData.signatureDestinations) && draftCategoryData.signatureDestinations.length > 0
            ? draftCategoryData.signatureDestinations
            : (draftCategoryData.routeSummary || "")
                ? draftCategoryData.routeSummary.split(/\s*[\u2022•\uFFFD\->|]\s*/).map((s: string) => s.trim()).filter(Boolean)
                : []
    );

    const [customStopInput, setCustomStopInput] = useState("");

    const updateRouteStops = (newStops: string[]) => {
        setDraft({
            categoryData: {
                ...draftCategoryData,
                signatureDestinations: newStops,
                routeSummary: newStops.join(" • "),
            },
        });
    };

    const addRouteStop = (stop: string) => {
        const trimmed = stop.trim();
        if (!trimmed) return;
        if (!routeStops.includes(trimmed)) {
            const next = [...routeStops, trimmed];
            updateRouteStops(next);
        }
    };

    const handleAddCustomStop = () => {
        if (!customStopInput.trim()) return;
        addRouteStop(customStopInput.trim());
        setCustomStopInput("");
    };

    const removeRouteStop = (index: number) => {
        const next = routeStops.filter((_, i) => i !== index);
        updateRouteStops(next);
    };

    const generateRouteSummary = () => {
        if (routeStops.length > 0) {
            updateDraft("routeSummary", routeStops.join(" • "));
        }
    };

    const handleItineraryChange = (updatedItinerary: any[]) => {
        const updates: Record<string, any> = { itinerary: updatedItinerary };
        if (
            !draftCategoryData.durationDays ||
            draftCategoryData.durationDays === "1" ||
            Number(draftCategoryData.durationDays) === itineraryList.length
        ) {
            updates.durationDays = String(Math.max(1, updatedItinerary.length));
        }
        setDraft({ categoryData: { ...(useListingDraftStore.getState().categoryData || {}), ...updates } });
    };

    const durationDaysNum = Number(draftCategoryData.durationDays) || Math.max(1, itineraryList.length);
    const durationNightsNum = Math.max(0, durationDaysNum - 1);

    const addQuickItem = (key: string, currentItems: string[], item: string) => {
        if (!currentItems.includes(item)) {
            updateDraft(key, [...currentItems, item]);
        }
    };

    return (
        <div className="space-y-5">
            {/* 1. TOUR OVERVIEW & DURATION (Multi-Day based, NO daily time) */}
            <SectionCard title="Tour Overview & Duration">
                {/* Duration & Nights Banner */}
                <div className="flex items-center justify-between p-3.5 mb-4 rounded-xl border border-[var(--border-light)]" style={{ background: "var(--bg-elevated)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <div className="text-[14px] font-bold text-[var(--text-primary)]">
                                {durationDaysNum} Days / {durationNightsNum} Nights Tour Package
                            </div>
                            <div className="text-[12px] text-[var(--text-secondary)]">
                                {itineraryList.length} itinerary {itineraryList.length === 1 ? "day" : "days"} currently planned
                            </div>
                        </div>
                    </div>
                    {itineraryList.length > 0 && Number(draftCategoryData.durationDays) !== itineraryList.length && (
                        <button
                            type="button"
                            onClick={() => updateDraft("durationDays", String(itineraryList.length))}
                            className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all"
                        >
                            <RotateCcw size={12} /> Sync Duration ({itineraryList.length} Days)
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <FieldLabel required>Duration Days</FieldLabel>
                        <FormInput
                            value={draftCategoryData.durationDays ?? "1"}
                            onChange={(v) => updateDraft("durationDays", v)}
                            type="number"
                        />
                    </div>
                    <div>
                        <FieldLabel>Difficulty / Travel Style</FieldLabel>
                        <SelectField
                            value={draftCategoryData.difficultyLevel ?? "Couple Friendly"}
                            onChange={(v) => updateDraft("difficultyLevel", v)}
                            options={[
                                "Couple Friendly",
                                "Easy",
                                "Moderate",
                                "Challenging",
                                "Active Adventure",
                                "Relaxed & Leisurely",
                            ]}
                        />
                    </div>
                    <div>
                        <FieldLabel>Minimum Group Size</FieldLabel>
                        <FormInput
                            value={draftCategoryData.minGroupSize ?? "1"}
                            onChange={(v) => updateDraft("minGroupSize", v)}
                            type="number"
                        />
                    </div>
                    <div>
                        <FieldLabel>Maximum Group Size</FieldLabel>
                        <FormInput
                            value={draftCategoryData.maxGroupSize ?? "15"}
                            onChange={(v) => updateDraft("maxGroupSize", v)}
                            type="number"
                        />
                    </div>
                </div>

                {/* Meeting Point with Suggestions */}
                <div className="mb-4">
                    <FieldLabel>Primary Tour Meeting Point / Pickup Hub</FieldLabel>
                    <FormInput
                        value={draftCategoryData.meetingPoint ?? ""}
                        onChange={(v) => updateDraft("meetingPoint", v)}
                        placeholder="e.g. Bandaranaike Int'l Airport (CMB) or Colombo City Hotel"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        <span className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                            <MapPin size={11} className="text-emerald-400" /> Quick select:
                        </span>
                        {COMMON_MEETING_POINTS.map((mp) => (
                            <button
                                key={mp}
                                type="button"
                                onClick={() => updateDraft("meetingPoint", mp)}
                                className="text-[11px] px-2.5 py-0.5 rounded-full border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-400/40 transition-all"
                            >
                                {mp}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Logistics Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 border-t border-[var(--border-light)]">
                    {[
                        { label: "Private Tour Available", key: "privateAvailable" },
                        { label: "Hotel / Airport Pickup Included", key: "pickupAvailable" },
                        { label: "Airport / City Drop-off Included", key: "dropoffAvailable" },
                    ].map(({ label, key }) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
                            <Toggle value={Boolean(draftCategoryData[key])} onChange={(v) => updateDraft(key, v)} />
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* 2. CANONICAL TOUR CATEGORY SELECTOR */}
            <SectionCard title="Tour Package Category & Theme">
                <p className="text-[12px] text-[var(--text-secondary)] mb-3">
                    Select the primary tour category to place this package in the right client showcase tab:
                </p>

                {/* 8 Canonical Category Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                    {CANONICAL_TOUR_CATEGORIES.map((cat) => {
                        const isSelected = (draftCategoryData.categoryId || "").toLowerCase() === cat.id.toLowerCase();
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => updateDraft("categoryId", cat.id)}
                                className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
                                    isSelected
                                        ? "border-amber-500 bg-amber-500/10 shadow-sm"
                                        : "border-[var(--border-light)] bg-[var(--bg-elevated)] hover:border-[var(--border-accent)]"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xl">{cat.icon}</span>
                                    {isSelected && (
                                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                                    )}
                                </div>
                                <div className={`text-[12px] font-bold mb-0.5 ${isSelected ? "text-amber-300" : "text-[var(--text-primary)]"}`}>
                                    {cat.label}
                                </div>
                                <div className="text-[10px] text-[var(--text-tertiary)] line-clamp-1">
                                    {cat.desc}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>Custom / Direct Category Slug</FieldLabel>
                        <CreatableSelect
                            value={draftCategoryData.categoryId ?? ""}
                            onChange={(v) => updateDraft("categoryId", v)}
                            options={CANONICAL_TOUR_CATEGORIES.map((c) => c.id)}
                        />
                    </div>
                    <div>
                        <FieldLabel>Additional Cross-Listing Categories</FieldLabel>
                        <TagInput
                            tags={draftCategoryData.additionalCategories || []}
                            onChange={(v) => updateDraft("additionalCategories", v)}
                            placeholder="Add tag (e.g. scenic-train, luxury, photography)..."
                        />
                    </div>
                </div>
            </SectionCard>

            {/* 3. ROUTE & DESTINATION STOPS BUILDER */}
            <SectionCard title="Route & Signature Destinations">
                <p className="text-[12px] text-[var(--text-secondary)] mb-3">
                    Build the sequence of destination stops. You can type any custom stop below or pick popular stops. These stops are automatically used as 1-click overnight suggestions in your day-by-day itinerary:
                </p>

                {/* Add Custom Stop Input */}
                <div className="mb-3">
                    <FieldLabel>Add Any New Destination / Stop</FieldLabel>
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <FormInput
                                value={customStopInput}
                                onChange={setCustomStopInput}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddCustomStop();
                                    }
                                }}
                                placeholder="Type custom destination or stop (e.g. Hiriketiya, Wilpattu, Knuckles) and press Enter..."
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddCustomStop}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all shrink-0"
                            style={{
                                background: "var(--accent-navy)",
                                color: "#ffffff",
                            }}
                        >
                            <Plus size={14} /> Add Stop
                        </button>
                    </div>
                </div>

                {/* Popular Destinations Quick Add Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mb-4 p-3 rounded-xl border border-[var(--border-light)]" style={{ background: "var(--bg-elevated)" }}>
                    <span className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1 mr-1">
                        <MapPin size={12} className="text-emerald-400" /> Quick Add Popular:
                    </span>
                    {POPULAR_TOUR_DESTINATIONS.map((dest) => (
                        <button
                            key={dest}
                            type="button"
                            onClick={() => addRouteStop(dest)}
                            className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                                routeStops.includes(dest)
                                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                    : "bg-[var(--input-background)] text-[var(--text-secondary)] border-[var(--border-light)] hover:text-[var(--text-primary)] hover:border-emerald-400/40"
                            }`}
                        >
                            + {dest}
                        </button>
                    ))}
                </div>

                {/* Active Destination Sequence View */}
                {routeStops.length > 0 && (
                    <div className="mb-4 p-3.5 rounded-xl border border-[var(--border-accent)] bg-emerald-500/5">
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-[12px] font-bold text-emerald-400 flex items-center gap-1.5">
                                <Sparkles size={13} /> Configured Route Sequence ({routeStops.length} Stops):
                            </span>
                            <button
                                type="button"
                                onClick={generateRouteSummary}
                                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                            >
                                <Sparkles size={11} /> Format into Route Summary
                            </button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {routeStops.map((stop, i) => (
                                <React.Fragment key={stop + i}>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-semibold bg-[var(--input-background)] border border-[var(--border-light)] text-[var(--text-primary)] shadow-sm">
                                        <span className="text-[11px] text-[var(--text-tertiary)]">{i + 1}.</span>
                                        {stop}
                                        <button
                                            type="button"
                                            onClick={() => removeRouteStop(i)}
                                            className="text-[var(--text-tertiary)] hover:text-red-400 ml-1 text-sm leading-none"
                                            title="Remove stop"
                                        >
                                            ×
                                        </button>
                                    </span>
                                    {i < routeStops.length - 1 && (
                                        <span className="text-[var(--text-tertiary)] font-bold text-[12px]">→</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <FieldLabel required>Route Summary String (Displayed to Travelers)</FieldLabel>
                        <span className="text-[11px] text-[var(--text-tertiary)]">e.g. Negombo • Sigiriya • Kandy • Ella • Yala • Galle Fort</span>
                    </div>
                    <FormInput
                        value={draftCategoryData.routeSummary ?? ""}
                        onChange={(v) => updateDraft("routeSummary", v)}
                        placeholder="Negombo • Sigiriya • Kandy • Ella • Yala • Galle Fort"
                    />
                </div>
            </SectionCard>

            {/* 4. PACKAGE HIGHLIGHTS */}
            <SectionCard title="Package Highlights">
                <div className="space-y-3">
                    <FieldLabel>Key Tour Highlights (Bullet Points)</FieldLabel>
                    <TagInput
                        tags={highlights}
                        onChange={(v) => updateDraft("itineraryHighlights", v)}
                        placeholder="Add highlight (e.g. Pidurangala Sunset, Yala Safari)..."
                    />

                    {/* Quick Highlight Suggestions */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                            <Sparkles size={11} className="text-amber-400" /> Suggested Highlights:
                        </span>
                        {COMMON_TOUR_HIGHLIGHTS.map((hl) => (
                            <button
                                key={hl}
                                type="button"
                                onClick={() => addQuickItem("itineraryHighlights", highlights, hl)}
                                className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                                    highlights.includes(hl)
                                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                        : "bg-[var(--input-background)] text-[var(--text-secondary)] border-[var(--border-light)] hover:text-[var(--text-primary)] hover:border-amber-400/40"
                                }`}
                            >
                                + {hl}
                            </button>
                        ))}
                    </div>
                </div>
            </SectionCard>

            {/* 5. FULL ITINERARY BUILDER WITH OVERNIGHT STAYS */}
            <SectionCard title="Day-by-Day Itinerary Builder">
                <p className="text-[12px] text-[var(--text-secondary)] mb-4">
                    Configure every single day of the tour with detailed explanations, overnight stays, activities, and meals.
                </p>
                <ItineraryBuilder
                    itinerary={itineraryList}
                    onChange={handleItineraryChange}
                    routeStops={routeStops}
                />
            </SectionCard>

            {/* 6. INCLUSIONS & EXCLUSIONS */}
            <SectionCard title="Package Inclusions & Exclusions">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Inclusions */}
                    <div className="space-y-3">
                        <FieldLabel>What's Included</FieldLabel>
                        <TagInput
                            tags={included}
                            onChange={(v) => updateDraft("includedItems", v)}
                            placeholder="Add included item..."
                        />
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[11px] text-emerald-400 font-semibold block w-full">Quick Add Inclusions:</span>
                            {COMMON_TOUR_INCLUSIONS.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => addQuickItem("includedItems", included, item)}
                                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                                        included.includes(item)
                                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-semibold"
                                            : "bg-[var(--input-background)] text-[var(--text-secondary)] border-[var(--border-light)] hover:text-[var(--text-primary)] hover:border-emerald-400/40"
                                    }`}
                                >
                                    + {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Exclusions */}
                    <div className="space-y-3">
                        <FieldLabel>What's Excluded</FieldLabel>
                        <TagInput
                            tags={excluded}
                            onChange={(v) => updateDraft("excludedItems", v)}
                            placeholder="Add excluded item..."
                        />
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[11px] text-red-400 font-semibold block w-full">Quick Add Exclusions:</span>
                            {COMMON_TOUR_EXCLUSIONS.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => addQuickItem("excludedItems", excluded, item)}
                                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                                        excluded.includes(item)
                                            ? "bg-red-500/15 text-red-300 border-red-500/30 font-semibold"
                                            : "bg-[var(--input-background)] text-[var(--text-secondary)] border-[var(--border-light)] hover:text-[var(--text-primary)] hover:border-red-400/40"
                                    }`}
                                >
                                    + {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </SectionCard>

            {/* 7. LANGUAGES & WHAT TO BRING */}
            <SectionCard title="Languages & Packing Advice">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <FieldLabel>Guiding Languages Available</FieldLabel>
                        <TagInput
                            tags={languages}
                            onChange={(v) => updateDraft("languages", v)}
                            placeholder="Add language..."
                        />
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {["English", "French", "German", "Russian", "Spanish", "Italian", "Sinhala"].map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => addQuickItem("languages", languages, lang)}
                                    className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                                        languages.includes(lang)
                                            ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                                            : "bg-[var(--input-background)] text-[var(--text-secondary)] border-[var(--border-light)] hover:text-[var(--text-primary)]"
                                    }`}
                                >
                                    + {lang}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <FieldLabel>What Travelers Should Bring</FieldLabel>
                        <TagInput
                            tags={toBring}
                            onChange={(v) => updateDraft("whatToBring", v)}
                            placeholder="Add item..."
                        />
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {COMMON_WHAT_TO_BRING.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => addQuickItem("whatToBring", toBring, item)}
                                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                                        toBring.includes(item)
                                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                            : "bg-[var(--input-background)] text-[var(--text-secondary)] border-[var(--border-light)] hover:text-[var(--text-primary)]"
                                    }`}
                                >
                                    + {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </SectionCard>

            {/* 8. POLICIES & LOGISTICS */}
            <SectionCard title="Policies & Logistics">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Child & Family Policy</FieldLabel>
                            <FormTextarea
                                value={draftCategoryData.childPolicy ?? ""}
                                onChange={(v) => updateDraft("childPolicy", v)}
                                placeholder="e.g. Children below 5 travel free. Child discount available for ages 5-11..."
                                rows={2}
                            />
                        </div>
                        <div>
                            <FieldLabel>Cancellation Policy</FieldLabel>
                            <FormTextarea
                                value={draftCategoryData.cancellationPolicy ?? ""}
                                onChange={(v) => updateDraft("cancellationPolicy", v)}
                                placeholder="e.g. Free cancellation up to 14 days before arrival. 50% refund within 7-13 days..."
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Pickup Instructions & Meeting Notes</FieldLabel>
                            <FormTextarea
                                value={draftCategoryData.pickupNotes ?? ""}
                                onChange={(v) => updateDraft("pickupNotes", v)}
                                placeholder="e.g. Your chauffeur guide will hold a sign with your name outside the airport arrival terminal..."
                                rows={2}
                            />
                        </div>
                        <div>
                            <FieldLabel>Drop-off Instructions</FieldLabel>
                            <FormTextarea
                                value={draftCategoryData.dropoffNotes ?? ""}
                                onChange={(v) => updateDraft("dropoffNotes", v)}
                                placeholder="e.g. Complimentary transfer back to Colombo Airport or south coast beach resort..."
                                rows={2}
                            />
                        </div>
                    </div>

                    <div>
                        <FieldLabel>Accessibility & Fitness Information</FieldLabel>
                        <FormTextarea
                            value={draftCategoryData.accessibilityInfo ?? ""}
                            onChange={(v) => updateDraft("accessibilityInfo", v)}
                            placeholder="e.g. Sigiriya Rock Fortress involves climbing 1,200 steps. Moderate fitness recommended..."
                            rows={2}
                        />
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}

function ExperienceDetails() {
    const draftCategoryData = useListingDraftStore((s) => s.categoryData ?? {});
    const setDraft = useListingDraftStore((s) => s.setDraft);

    const updateDraft = (key: string, value: any) => {
        setDraft({ categoryData: { ...(useListingDraftStore.getState().categoryData || {}), [key]: value } });
    };

    const highlights = draftCategoryData.highlights ?? [];
    const included = draftCategoryData.includedItems ?? [];
    const excluded = draftCategoryData.excludedItems ?? [];
    const languages = draftCategoryData.languages ?? [];
    const toBring = draftCategoryData.whatToBring ?? [];

    return (
        <div className="space-y-4">
            <SectionCard title="Experience Overview">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <FieldLabel>Activity Type</FieldLabel>
                        <SelectField value={draftCategoryData.activityType ?? "City Walk"} onChange={(v) => updateDraft("activityType", v)} options={["City Walk", "Food Tour", "Cultural", "Adventure", "Wellness", "Workshop", "Photography", "Water Sports", "Hiking"]} />
                    </div>
                    <div>
                        <FieldLabel>Meeting Point</FieldLabel>
                        <FormInput value={draftCategoryData.meetingPoint ?? ""} onChange={(v) => updateDraft("meetingPoint", v)} placeholder="e.g. Galle Face Green" />
                    </div>
                    <div>
                        <FieldLabel>Duration (minutes)</FieldLabel>
                        <FormInput value={draftCategoryData.durationMinutes ?? ""} onChange={(v) => updateDraft("durationMinutes", v)} type="number" placeholder="180" />
                    </div>
                    <div>
                        <FieldLabel>Difficulty Level</FieldLabel>
                        <SelectField value={draftCategoryData.difficultyLevel ?? "Easy"} onChange={(v) => updateDraft("difficultyLevel", v)} options={["Easy", "Moderate", "Challenging"]} />
                    </div>
                    <div>
                        <FieldLabel>Age Restriction</FieldLabel>
                        <FormInput value={draftCategoryData.ageRestriction ?? ""} onChange={(v) => updateDraft("ageRestriction", v)} placeholder="e.g. 12+" />
                    </div>
                    <div>
                        <FieldLabel>Minimum Group Size</FieldLabel>
                        <FormInput value={draftCategoryData.minGroupSize ?? "1"} onChange={(v) => updateDraft("minGroupSize", v)} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Maximum Group Size</FieldLabel>
                        <FormInput value={draftCategoryData.maxGroupSize ?? "10"} onChange={(v) => updateDraft("maxGroupSize", v)} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Start Time</FieldLabel>
                        <FormInput value={draftCategoryData.startTime ?? ""} onChange={(v) => updateDraft("startTime", v)} type="time" />
                    </div>
                    <div>
                        <FieldLabel>End Time</FieldLabel>
                        <FormInput value={draftCategoryData.endTime ?? ""} onChange={(v) => updateDraft("endTime", v)} type="time" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    {[
                        { label: "Pickup Supported", key: "pickupSupported" },
                        { label: "Private Available", key: "privateAvailable" },
                    ].map(({ label, key }) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
                            <Toggle value={draftCategoryData[key] ?? true} onChange={(v) => updateDraft(key, v)} />
                        </div>
                    ))}
                </div>
            </SectionCard>

            <SectionCard title="Experience Details">
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Highlights</FieldLabel>
                        <TagInput tags={highlights} onChange={(v) => updateDraft("highlights", v)} placeholder="Add highlight..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Included Items</FieldLabel>
                            <TagInput tags={included} onChange={(v) => updateDraft("includedItems", v)} placeholder="Add included..." />
                        </div>
                        <div>
                            <FieldLabel>Excluded Items</FieldLabel>
                            <TagInput tags={excluded} onChange={(v) => updateDraft("excludedItems", v)} placeholder="Add excluded..." />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Languages</FieldLabel>
                            <TagInput tags={languages} onChange={(v) => updateDraft("languages", v)} placeholder="Add language..." />
                        </div>
                        <div>
                            <FieldLabel>What to Bring</FieldLabel>
                            <TagInput tags={toBring} onChange={(v) => updateDraft("whatToBring", v)} placeholder="Add item..." />
                        </div>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Additional Information">
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Pickup Notes</FieldLabel>
                        <FormTextarea value={draftCategoryData.pickupNotes ?? ""} onChange={(v) => updateDraft("pickupNotes", v)} rows={2} placeholder="Where should guests wait?" />
                    </div>
                    <div>
                        <FieldLabel>Availability Notes</FieldLabel>
                        <FormTextarea value={draftCategoryData.availabilityNotes ?? ""} onChange={(v) => updateDraft("availabilityNotes", v)} rows={2} placeholder="When is this available?" />
                    </div>
                    <div>
                        <FieldLabel>Cancellation Policy</FieldLabel>
                        <FormTextarea value={draftCategoryData.cancellationPolicy ?? ""} onChange={(v) => updateDraft("cancellationPolicy", v)} rows={2} placeholder="Refund policies" />
                    </div>
                    <div>
                        <FieldLabel>Accessibility Info</FieldLabel>
                        <FormTextarea value={draftCategoryData.accessibilityInfo ?? ""} onChange={(v) => updateDraft("accessibilityInfo", v)} rows={2} placeholder="Wheelchair access, stairs, etc." />
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}

function TransferDetails() {
    const [vehicleTypes, setVehicleTypes] = useState(["Luxury Sedan", "SUV", "Van"]);
    const [included, setIncluded] = useState(["Meet & Greet service", "Flight tracking", "1 hour complimentary wait", "All tolls & parking"]);
    const [excluded, setExcluded] = useState(["Extra waiting charges", "Tips & gratuities"]);

    return (
        <div className="space-y-4">
            <SectionCard title="Transfer Details">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <FieldLabel>Origin Type</FieldLabel>
                        <SelectField value="Airport" onChange={() => { }} options={["Airport", "Hotel", "Port", "Train Station", "Custom Location"]} />
                    </div>
                    <div>
                        <FieldLabel>Destination Type</FieldLabel>
                        <SelectField value="Hotel" onChange={() => { }} options={["Airport", "Hotel", "Port", "Train Station", "Custom Location"]} />
                    </div>
                    <div>
                        <FieldLabel>Estimated Duration (minutes)</FieldLabel>
                        <FormInput value="45" onChange={() => { }} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Max Passengers</FieldLabel>
                        <FormInput value="4" onChange={() => { }} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Max Luggage</FieldLabel>
                        <FormInput value="4 standard bags" onChange={() => { }} />
                    </div>
                    <div>
                        <FieldLabel>Operating Start Time</FieldLabel>
                        <FormInput value="00:00" onChange={() => { }} type="time" />
                    </div>
                    <div>
                        <FieldLabel>Operating End Time</FieldLabel>
                        <FormInput value="23:59" onChange={() => { }} type="time" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {[
                        { label: "Air Conditioned", v: true },
                        { label: "Meet and Greet Included", v: true },
                        { label: "Child Seats Available", v: true },
                    ].map(({ label, v }) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
                            <Toggle value={v} onChange={() => { }} />
                        </div>
                    ))}
                </div>
            </SectionCard>

            <SectionCard title="Vehicle Types & Services">
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Vehicle Types</FieldLabel>
                        <TagInput tags={vehicleTypes} onChange={setVehicleTypes} placeholder="Add vehicle type..." />
                    </div>
                    <div>
                        <FieldLabel>Vehicle Policy</FieldLabel>
                        <FormTextarea value="All vehicles are less than 3 years old, fully licensed, and maintained to high standards. Professional chauffeurs with extensive airport experience." onChange={() => { }} rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Included Services</FieldLabel>
                            <TagInput tags={included} onChange={setIncluded} placeholder="Add included..." />
                        </div>
                        <div>
                            <FieldLabel>Excluded Services</FieldLabel>
                            <TagInput tags={excluded} onChange={setExcluded} placeholder="Add excluded..." />
                        </div>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Instructions & Policies">
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Pickup Instructions</FieldLabel>
                        <FormTextarea value="Driver will meet you at Arrivals Hall with a name sign. Please share your flight details at booking for accurate tracking." onChange={() => { }} rows={3} />
                    </div>
                    <div>
                        <FieldLabel>Drop-off Instructions</FieldLabel>
                        <FormTextarea value="Driver will assist with luggage and drop you at your hotel main entrance or specified terminal for airport transfers." onChange={() => { }} rows={2} />
                    </div>
                    <div>
                        <FieldLabel>Route Notes</FieldLabel>
                        <FormTextarea value="Standard route via E01 Expressway (45 mins). Scenic coastal route available on request (1 hour 15 mins, additional charge may apply)." onChange={() => { }} rows={2} />
                    </div>
                    <div>
                        <FieldLabel>Waiting Time Policy</FieldLabel>
                        <FormTextarea value="1 hour complimentary waiting time for international flights, 30 minutes for domestic flights from scheduled landing time. Additional waiting charged at $20/hour." onChange={() => { }} rows={3} />
                    </div>
                    <div>
                        <FieldLabel>Cancellation Policy</FieldLabel>
                        <FormTextarea value="Free cancellation up to 24 hours before pickup. 50% charge for cancellations within 24 hours. No refund for no-shows or cancellations within 2 hours of scheduled pickup." onChange={() => { }} rows={3} />
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}

export function CategoryDetailsTab({ category }: { category: Category }) {
    const componentsByKey: Record<"stay" | "tour" | "safari" | "experience" | "transfer", React.FC> = {
        stay: StayDetails,
        tour: TourDetails,
        safari: SafariDetails,
        experience: ExperienceDetails,
        transfer: TransferDetails,
    };
    const flow = category === "Stay" ? "stay" : category === "Tour" ? "tour" : category === "Safari" ? "safari" : category === "Experience" ? "experience" : "transfer";
    const Component = componentsByKey[flow];
    return <Component />;
}

// The property types the server understands (anything else is stored but shows up as a plain hotel in guest search).
const STAY_PROPERTY_TYPES = [
    "hotel",
    "boutique-hotel",
    "resort",
    "villa",
    "apartment",
    "guesthouse",
    "bed-breakfast",
    "homestay",
    "hostel",
];

const stayTypeLabel = (value: string) => value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * The stay fields the database keeps that the other Stay sections do not edit: type, address, city, district,
 * coordinates, contact details, amenities and the admin note. Values live in the draft store as
 * `categoryData.stayProfile` and `categoryData.amenities`; ListingEditor turns them into the save payload.
 */
export function StayProfileSection({
    lat,
    setLat,
    lng,
    setLng,
}: {
    lat: string;
    setLat: (value: string) => void;
    lng: string;
    setLng: (value: string) => void;
}) {
    const stored = useListingDraftStore((s) => s.categoryData ?? {});
    const initial = (stored.stayProfile ?? {}) as Record<string, string>;
    const subcategory = useListingDraftStore((s) => s.subcategory);

    const [propertyType, setPropertyType] = useState(String(initial.propertyType || subcategory || "hotel"));
    const [address, setAddress] = useState(String(initial.address ?? ""));
    const [city, setCity] = useState(String(initial.city ?? ""));
    const [district, setDistrict] = useState(String(initial.district ?? ""));
    const [phone, setPhone] = useState(String(initial.phone ?? ""));
    const [email, setEmail] = useState(String(initial.email ?? ""));
    const [website, setWebsite] = useState(String(initial.website ?? ""));
    const [applicationNote, setApplicationNote] = useState(String(initial.applicationNote ?? ""));
    const [amenities, setAmenities] = useState<string[]>(() => (Array.isArray(stored.amenities) ? (stored.amenities as string[]) : []));

    useEffect(() => {
        const current = useListingDraftStore.getState();
        current.setDraft({
            categoryData: {
                ...(current.categoryData || {}),
                // titleIsName: in the drawer the listing title is the property name.
                stayProfile: { propertyType, address, city, district, phone, email, website, applicationNote, titleIsName: true },
                amenities,
            },
        });
    }, [propertyType, address, city, district, phone, email, website, applicationNote, amenities]);

    const typeOptions = STAY_PROPERTY_TYPES.includes(propertyType) ? STAY_PROPERTY_TYPES : [propertyType, ...STAY_PROPERTY_TYPES];

    return (
        <div className="space-y-4">
            <SectionCard title="Property type & location">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FieldLabel required>Property type</FieldLabel>
                        <SelectField value={stayTypeLabel(propertyType)} onChange={(label) => setPropertyType(typeOptions.find((option) => stayTypeLabel(option) === label) ?? propertyType)} options={typeOptions.map(stayTypeLabel)} />
                    </div>
                    <div>
                        <FieldLabel>City</FieldLabel>
                        <FormInput value={city} onChange={setCity} placeholder="e.g. Galle" />
                    </div>
                    <div className="col-span-2">
                        <FieldLabel>Address</FieldLabel>
                        <FormInput value={address} onChange={setAddress} placeholder="Street address" />
                    </div>
                    <div>
                        <FieldLabel>District</FieldLabel>
                        <FormInput value={district} onChange={setDistrict} placeholder="e.g. Galle District" />
                    </div>
                    <div />
                    <div>
                        <FieldLabel>Latitude</FieldLabel>
                        <FormInput value={lat} onChange={setLat} placeholder="e.g. 6.0329" />
                    </div>
                    <div>
                        <FieldLabel>Longitude</FieldLabel>
                        <FormInput value={lng} onChange={setLng} placeholder="e.g. 80.2168" />
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Contact details">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>Phone</FieldLabel>
                        <FormInput value={phone} onChange={setPhone} type="tel" placeholder="+94 ..." />
                    </div>
                    <div>
                        <FieldLabel>Email</FieldLabel>
                        <FormInput value={email} onChange={setEmail} type="email" placeholder="reservations@example.com" />
                    </div>
                    <div className="col-span-2">
                        <FieldLabel>Website</FieldLabel>
                        <FormInput value={website} onChange={setWebsite} type="url" placeholder="https://" />
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Amenities">
                <FieldLabel>Property amenities</FieldLabel>
                <TagInput tags={amenities} onChange={setAmenities} placeholder="Add amenity (e.g. Pool, Free WiFi)..." />
            </SectionCard>

            <SectionCard title="Application note">
                <FieldLabel>Note kept with this property's application</FieldLabel>
                <FormTextarea value={applicationNote} onChange={setApplicationNote} rows={3} placeholder="e.g. why a change was requested or approved" />
            </SectionCard>
        </div>
    );
}

export function RoomsSection() {
    const draftCategoryData = useListingDraftStore((s) => s.categoryData ?? {});
    const setDraft = useListingDraftStore((s) => s.setDraft);

    const [rooms, setRooms] = useState<RoomType[]>(() =>
        ((draftCategoryData.roomTypes ?? []) as RoomType[]).map((room) => ({
            ...room,
            type: normalizeStayRoomType(room.type),
            smoking: typeof room.smoking === "boolean" ? room.smoking : false,
            guestAccess: typeof room.guestAccess === "boolean" ? room.guestAccess : false,
            hasBeds: typeof room.hasBeds === "boolean" ? room.hasBeds : false,
            discounts: normalizeRoomDiscounts(room.discounts),
        })),
    );

    const [paymentPolicy, setPaymentPolicy] = useState<"pay_at_property" | "full_online_payment">(
        draftCategoryData.paymentPolicy ?? "pay_at_property"
    );

    useEffect(() => {
        setDraft({ categoryData: { ...(useListingDraftStore.getState().categoryData || {}), roomTypes: rooms, paymentPolicy } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rooms, paymentPolicy]);

    const addRoom = () => {
        const usedTypes = new Set(rooms.map((r) => r.type));
        const availableType = ROOM_TYPE_OPTIONS.find((t) => !usedTypes.has(t)) || "Custom Room";

        const newRoom: RoomType = {
            id: `room_${Date.now()}`,
            type: availableType,
            count: "1",
            beds: "0",
            hasBeds: false,
            cribs: "0",
            maxGuests: "",
            size: "",
            smoking: false,
            bathroomType: "",
            bathroomItems: [],
            guestAccess: false,
            pricePerNight: "",
            currency: "LKR",
            discounts: [],
        };
        setRooms((r) => [...r, newRoom]);
    };

    const removeRoom = (id: string) => setRooms((r) => r.filter((x) => x.id !== id));

    const updateRoom = (id: string, updates: Partial<RoomType>) =>
        setRooms((r) => r.map((room) => (room.id === id ? { ...room, ...updates } : room)));

    const addDiscount = (roomId: string) => {
        const currentRoom = rooms.find((room) => room.id === roomId);
        if (!currentRoom) return;

        updateRoom(roomId, {
            discounts: [
                ...currentRoom.discounts,
                {
                    id: `discount_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    label: "New discount",
                    type: "percentage",
                    value: "10",
                },
            ],
        });
    };

    const updateDiscount = (roomId: string, discountId: string, updates: Partial<RoomDiscount>) => {
        const currentRoom = rooms.find((room) => room.id === roomId);
        if (!currentRoom) return;

        updateRoom(roomId, {
            discounts: currentRoom.discounts.map((discount) => (discount.id === discountId ? { ...discount, ...updates } : discount)),
        });
    };

    const removeDiscount = (roomId: string, discountId: string) => {
        const currentRoom = rooms.find((room) => room.id === roomId);
        if (!currentRoom) return;

        updateRoom(roomId, {
            discounts: currentRoom.discounts.filter((discount) => discount.id !== discountId),
        });
    };

    return (
        <div className="space-y-4">
            <SectionCard title="Rooms">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>Manage room types for this property. Add one entry per room type.</p>
                    <button onClick={addRoom} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px]" style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600, boxShadow: "0 0 12px var(--border-accent)" }}>
                        <Plus size={14} />
                        Add Room
                    </button>
                </div>

                <div className="space-y-3">
                    {rooms.length === 0 ? (
                        <div style={{ color: "var(--text-secondary)" }}>No rooms added yet.</div>
                    ) : (
                        rooms.map((room) => {
                            const hasBedOptions = room.hasBeds ?? (Object.values(room.bedBreakdown ?? {}).some((count) => count > 0) || (room.beds !== "" && room.beds !== "0"));
                            const discountSummary = calculateDiscountedPrice(room.pricePerNight, room.discounts);

                            return (
                                <div key={room.id} className="p-3 rounded-lg" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <div>
                                            <FieldLabel required>Room Type / Name</FieldLabel>
                                            <div className="space-y-1.5">
                                                <SelectField
                                                    value={ROOM_TYPE_OPTIONS.includes(room.type) ? room.type : "Custom"}
                                                    onChange={(v) => {
                                                        if (v === "Custom") {
                                                            updateRoom(room.id, { type: "Custom Room" });
                                                        } else {
                                                            updateRoom(room.id, { type: v });
                                                        }
                                                    }}
                                                    options={[...ROOM_TYPE_OPTIONS, "Custom"]}
                                                />
                                                {(!ROOM_TYPE_OPTIONS.includes(room.type) || room.type === "Custom Room") && (
                                                    <FormInput
                                                        value={room.type === "Custom Room" ? "" : room.type}
                                                        onChange={(v) => updateRoom(room.id, { type: v || "Custom Room" })}
                                                        placeholder="Type custom room name (e.g. Royal Water Villa)..."
                                                    />
                                                )}
                                                {rooms.some((r) => r.id !== room.id && r.type.trim().toLowerCase() === room.type.trim().toLowerCase() && room.type.trim().length > 0 && room.type !== "Custom Room" && room.type !== "Custom") && (
                                                    <div className="p-2 rounded-lg text-[11px] font-semibold mt-1.5 flex items-start gap-1.5" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
                                                        <span className="text-xs shrink-0">⚠️</span>
                                                        <span>
                                                            <strong>Room type already exists!</strong> Please use a unique name or increase the <strong>Count</strong> field instead.
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <FieldLabel required>Count</FieldLabel>
                                            <FormInput value={room.count} onChange={(v) => updateRoom(room.id, { count: v })} type="number" />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                                            <div>
                                                <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Beds</p>
                                                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Enable this if the room has beds to configure.</p>
                                            </div>
                                            <Toggle
                                                value={hasBedOptions}
                                                onChange={(enabled) => updateRoom(room.id, { hasBeds: enabled, beds: enabled ? (room.beds || "1") : "0", bedBreakdown: enabled ? (room.bedBreakdown ?? {}) : {} })}
                                            />
                                        </div>
                                    </div>

                                    {hasBedOptions ? (
                                        <div className="mb-3">
                                            <FieldLabel>Beds</FieldLabel>
                                            <div className="space-y-2">
                                                {[
                                                    { key: "Twin", label: "Twin bed(s)", desc: "35–51 inches wide" },
                                                    { key: "Full", label: "Full bed(s)", desc: "52–59 inches wide" },
                                                    { key: "Queen", label: "Queen bed(s)", desc: "60–70 inches wide" },
                                                    { key: "King", label: "King bed(s)", desc: "71–81 inches wide" },
                                                    { key: "Bunk", label: "Bunk bed", desc: "Varying sizes" },
                                                    { key: "Sofa", label: "Sofa bed", desc: "Varying sizes" },
                                                    { key: "Futon", label: "Futon bed(s)", desc: "Varying sizes" },
                                                ].map(({ key, label, desc }) => {
                                                    const count = room.bedBreakdown?.[key] ?? 0;
                                                    return (
                                                        <div key={key} className="flex items-center justify-between">
                                                            <div>
                                                                <div style={{ fontWeight: 600 }}>{label}</div>
                                                                <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{desc}</div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => updateRoom(room.id, { bedBreakdown: { ...(room.bedBreakdown || {}), [key]: Math.max(0, count - 1) } })} className="px-2 py-1 rounded-lg" style={{ border: "1px solid var(--border-light)", background: "var(--bg-card)" }}>
                                                                    <Minus size={14} />
                                                                </button>
                                                                <div style={{ minWidth: 28, textAlign: "center" }}>{count}</div>
                                                                <button onClick={() => updateRoom(room.id, { bedBreakdown: { ...(room.bedBreakdown || {}), [key]: count + 1 } })} className="px-2 py-1 rounded-lg" style={{ border: "1px solid var(--border-light)", background: "var(--bg-card)" }}>
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="mb-2">
                                        <FieldLabel>Room description</FieldLabel>
                                        <FormTextarea
                                            value={room.description ?? ""}
                                            onChange={(v) => updateRoom(room.id, { description: v })}
                                            rows={2}
                                            placeholder="What guests should know about this room"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mb-2">
                                        <div>
                                            <FieldLabel required>Max Guests</FieldLabel>
                                            <FormInput value={room.maxGuests} onChange={(v) => updateRoom(room.id, { maxGuests: v })} type="number" />
                                        </div>
                                        <div>
                                            <FieldLabel>Size (sqm)</FieldLabel>
                                            <FormInput value={room.size} onChange={(v) => updateRoom(room.id, { size: v })} />
                                        </div>
                                        <div>
                                            <FieldLabel>Smoking allowed</FieldLabel>
                                            <Toggle value={room.smoking} onChange={(v) => updateRoom(room.id, { smoking: v })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <div>
                                            <FieldLabel>Bathroom Type</FieldLabel>
                                            <SelectField value={room.bathroomType} onChange={(v) => updateRoom(room.id, { bathroomType: v })} options={["Private", "Shared", "Ensuite"]} />
                                        </div>
                                        <div>
                                            <FieldLabel>Bathroom Items</FieldLabel>
                                            <TagInput tags={room.bathroomItems} onChange={(tags) => updateRoom(room.id, { bathroomItems: tags })} placeholder="Type and press Enter..." />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                                        <div>
                                            <FieldLabel>Guest Access</FieldLabel>
                                            <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                                                <div>
                                                    <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Guest access</p>
                                                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Turn this on if guests can access this room.</p>
                                                </div>
                                                <Toggle value={room.guestAccess} onChange={(v) => updateRoom(room.id, { guestAccess: v })} />
                                            </div>
                                        </div>
                                        <div>
                                            <FieldLabel required>Price per night</FieldLabel>
                                            <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2">
                                                <input
                                                    value={room.pricePerNight}
                                                    onChange={(e) => updateRoom(room.id, { pricePerNight: e.target.value })}
                                                    type="number"
                                                    min={1}
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-all"
                                                    style={{
                                                        background: "var(--input-background)",
                                                        border: "1px solid var(--border-light)",
                                                        color: "var(--text-primary)",
                                                    }}
                                                />
                                                <SelectField value={room.currency} onChange={(v) => updateRoom(room.id, { currency: v })} options={CURRENCIES} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <FieldLabel>Discounts</FieldLabel>
                                            <button
                                                onClick={() => addDiscount(room.id)}
                                                className="px-3 py-1.5 rounded-lg text-[12px] transition-all"
                                                style={{ background: "var(--active-overlay)", color: "var(--accent-navy-light)", border: "1px solid var(--border-accent)" }}
                                            >
                                                Add Discount
                                            </button>
                                        </div>
                                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                                            Percentage discounts must be between 0 and 100. Flat discounts cannot exceed the remaining room price.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        {room.discounts.length === 0 ? (
                                            <div className="rounded-lg px-3 py-2 text-[12px]" style={{ background: "var(--bg-card)", border: "1px dashed var(--border-light)", color: "var(--text-tertiary)" }}>
                                                No discounts added yet.
                                            </div>
                                        ) : (
                                            room.discounts.map((discount) => (
                                                <div key={discount.id} className="grid grid-cols-[1.3fr_140px_110px_auto] gap-2 items-end rounded-lg p-2" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                                                    <div>
                                                        <FieldLabel>Discount name</FieldLabel>
                                                        <FormInput
                                                            value={discount.label}
                                                            onChange={(v) => updateDiscount(room.id, discount.id, { label: v })}
                                                            placeholder="e.g. Weekly stay"
                                                        />
                                                    </div>
                                                    <div>
                                                        <FieldLabel>Type</FieldLabel>
                                                        <SelectField
                                                            value={discount.type}
                                                            onChange={(v) => updateDiscount(room.id, discount.id, { type: v as DiscountType })}
                                                            options={["percentage", "flat"]}
                                                        />
                                                    </div>
                                                    <div>
                                                        <FieldLabel>Value</FieldLabel>
                                                        <FormInput
                                                            value={discount.value}
                                                            onChange={(v) => updateDiscount(room.id, discount.id, { value: v })}
                                                            type="number"
                                                            placeholder={discount.type === "percentage" ? "10" : "25"}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeDiscount(room.id, discount.id)}
                                                        className="h-9 px-3 rounded-lg text-[12px] transition-all"
                                                        style={{ color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div
                                        className="mt-3 rounded-lg px-3 py-2"
                                        style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                                                    Discounted price preview
                                                </p>
                                                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                                                    Base {room.currency} {discountSummary.basePrice !== null ? discountSummary.basePrice.toFixed(2) : "0.00"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                                                    Estimated final rate
                                                </p>
                                                <p className="text-[16px]" style={{ color: "var(--accent-navy-light)", fontWeight: 700 }}>
                                                    {discountSummary.finalPrice !== null ? `${room.currency} ${discountSummary.finalPrice.toFixed(2)}` : "--"}
                                                </p>
                                            </div>
                                        </div>
                                        {discountSummary.basePrice !== null ? (
                                            <div className="mt-2 flex items-center justify-between text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                                                <span>Discount total: {discountSummary.discountTotal !== null ? `${room.currency} ${discountSummary.discountTotal.toFixed(2)}` : "--"}</span>
                                                <span>Before discount: {room.currency} {discountSummary.basePrice.toFixed(2)}</span>
                                            </div>
                                        ) : null}
                                        {discountSummary.hasInvalidDiscount ? (
                                            <p className="mt-1 text-[11px]" style={{ color: "#d97706" }}>
                                                One or more discount values are invalid.
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="flex justify-end mt-3">
                                        <button onClick={() => removeRoom(room.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px]" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                                            <Trash2 size={14} />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </SectionCard>

            <SectionCard title="Payment & Booking Policy">
                <div className="space-y-4">
                    <div>
                        <FieldLabel required>Payment Method Selection</FieldLabel>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <div
                                onClick={() => setPaymentPolicy("pay_at_property")}
                                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                                    paymentPolicy === "pay_at_property"
                                        ? "border-emerald-500 bg-emerald-500/10"
                                        : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"
                                }`}
                            >
                                <div className="mt-0.5">
                                    <input
                                        type="radio"
                                        name="payment_policy_rooms"
                                        checked={paymentPolicy === "pay_at_property"}
                                        onChange={() => setPaymentPolicy("pay_at_property")}
                                        className="accent-emerald-500"
                                    />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-emerald-400">Pay at Property (On-Spot)</p>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Guests pay directly in cash or card upon check-in. Confirmation email will specify check-in payment details.
                                    </p>
                                </div>
                            </div>

                            <div
                                onClick={() => setPaymentPolicy("full_online_payment")}
                                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                                    paymentPolicy === "full_online_payment"
                                        ? "border-blue-500 bg-blue-500/10"
                                        : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"
                                }`}
                            >
                                <div className="mt-0.5">
                                    <input
                                        type="radio"
                                        name="payment_policy_rooms"
                                        checked={paymentPolicy === "full_online_payment"}
                                        onChange={() => setPaymentPolicy("full_online_payment")}
                                        className="accent-blue-500"
                                    />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-blue-400">Full Online Payment (Automated)</p>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Platform collects full payment online upfront, deducts commission, and automatically processes payout to your account.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}

export function ImagesSection({ title = "Property Images", noun = "property" }: { title?: string; noun?: string } = {}) {
    const draftCategoryData = useListingDraftStore((s) => s.categoryData ?? {});
    const setDraft = useListingDraftStore((s) => s.setDraft);

    const [cover, setCover] = useState<string>(() => draftCategoryData.images?.cover ?? "");
    const [gallery, setGallery] = useState<string[]>(() => draftCategoryData.images?.gallery ?? []);

    const handleCoverDrop = useCallback(async (acceptedFiles: File[]) => {
        const [file] = acceptedFiles;
        if (!file) return;

        const dataUrl = await readFileAsDataUrl(file);
        setCover(dataUrl);
    }, []);

    const handleGalleryDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!acceptedFiles.length) return;

        const dataUrls = await filesToDataUrls(acceptedFiles);
        setGallery((currentGallery) => [...currentGallery, ...dataUrls]);
    }, []);

    const coverDropzone = useDropzone({
        onDrop: handleCoverDrop,
        accept: { "image/*": [] },
        multiple: false,
        noClick: true,
        noKeyboard: true,
    });

    const galleryDropzone = useDropzone({
        onDrop: handleGalleryDrop,
        accept: { "image/*": [] },
        multiple: true,
        noClick: true,
        noKeyboard: true,
    });

    useEffect(() => {
        setDraft({ categoryData: { ...(useListingDraftStore.getState().categoryData || {}), images: { cover, gallery } } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cover, gallery]);

    return (
        <div className="space-y-4">
            <SectionCard title={title}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <FieldLabel>Cover Image</FieldLabel>
                        <div className="space-y-3">
                            <div
                                {...coverDropzone.getRootProps()}
                                className="rounded-xl p-4 transition-all"
                                style={{
                                    background: coverDropzone.isDragActive ? "var(--active-overlay)" : "var(--bg-card)",
                                    border: `1px dashed ${coverDropzone.isDragActive ? "var(--border-accent)" : "var(--border-light)"}`,
                                }}
                            >
                                <input {...coverDropzone.getInputProps()} />
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-panel)", color: "var(--accent-navy-light)" }}>
                                            <Upload size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                                                {coverDropzone.isDragActive ? "Drop cover image here" : "Drag & drop a cover image"}
                                            </p>
                                            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                                                PNG, JPG, or WEBP. Recommended for the listing hero image.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={coverDropzone.open}
                                        className="px-3 py-2 rounded-lg text-[12px] transition-all"
                                        style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
                                    >
                                        Browse files
                                    </button>
                                </div>
                            </div>
                            {cover ? (
                                <div className="relative inline-block">
                                    <img src={cover} alt="cover" style={{ width: 220, height: 132, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border-light)" }} />
                                    <button type="button" aria-label="Remove cover image" onClick={() => setCover("")} className="absolute top-2 right-2 p-1" style={{ background: "rgba(0,0,0,0.5)", borderRadius: 6 }}>
                                        <Trash2 size={14} color="white" />
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div>
                        <FieldLabel>Gallery Images</FieldLabel>
                        <div>
                            <div
                                {...galleryDropzone.getRootProps()}
                                className="rounded-xl p-4 transition-all"
                                style={{
                                    background: galleryDropzone.isDragActive ? "var(--active-overlay)" : "var(--bg-card)",
                                    border: `1px dashed ${galleryDropzone.isDragActive ? "var(--border-accent)" : "var(--border-light)"}`,
                                }}
                            >
                                <input {...galleryDropzone.getInputProps()} />
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-panel)", color: "var(--accent-navy-light)" }}>
                                            <Upload size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                                                {galleryDropzone.isDragActive ? "Drop gallery images here" : "Drag & drop gallery images"}
                                            </p>
                                            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                                                Add several images to show the {noun} from different angles.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={galleryDropzone.open}
                                        className="px-3 py-2 rounded-lg text-[12px] transition-all"
                                        style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
                                    >
                                        Add photos
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap mt-3">
                                {gallery.map((src, i) => (
                                    <div key={`${src.slice(0, 24)}_${i}`} className="relative" style={{ width: 112, height: 80 }}>
                                        <img src={src} alt={`gallery-${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: "1px solid var(--border-light)" }} />
                                        <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => setGallery((g) => g.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1" style={{ background: "rgba(0,0,0,0.5)", borderRadius: 6 }}>
                                            <Trash2 size={12} color="white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ color: "var(--text-secondary)" }} className="text-[12px]">Add a high-resolution cover and several gallery images for the {noun} page.</div>
            </SectionCard>
        </div>
    );
}

export function PoliciesTab({ category }: { category: Category }) {
    const isTransfer = category === "Transfer";
    const isSafariOrTour = category === "Safari" || category === "Tour" || category === "Experience";

    return (
        <div className="space-y-4">
            <SectionCard title="Cancellation Policy">
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Cancellation Policy</FieldLabel>
                        <FormTextarea
                            value={
                                isTransfer
                                    ? "Free cancellation up to 24 hours before departure. 50% charge for cancellations within 24 hours. No refund for no-shows."
                                    : "Free cancellation up to 48 hours before the activity. 50% refund for cancellations 24–48 hours before. No refund within 24 hours."
                            }
                            onChange={() => { }}
                            rows={4}
                        />
                    </div>
                    {isTransfer && (
                        <div>
                            <FieldLabel>Waiting Time Policy</FieldLabel>
                            <FormTextarea
                                value="1 hour complimentary waiting time for airport pickups from the scheduled landing time. Additional waiting time charged at $20/hour."
                                onChange={() => { }}
                                rows={3}
                            />
                        </div>
                    )}
                    {isSafariOrTour && (
                        <div>
                            <FieldLabel>Weather / Force Majeure Policy</FieldLabel>
                            <FormTextarea
                                value="In case of extreme weather or park closure, a full refund or reschedule will be offered at no charge."
                                onChange={() => { }}
                                rows={3}
                            />
                        </div>
                    )}
                    {category === "Stay" && (
                        <>
                            <div>
                                <FieldLabel>Check-in Policy</FieldLabel>
                                <FormTextarea
                                    value="Early check-in available on request (subject to availability). Late check-out available until 15:00 with prior arrangement."
                                    onChange={() => { }}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <FieldLabel>No-show Policy</FieldLabel>
                                <FormTextarea
                                    value="No-shows will be charged the full booking amount. Please contact us in advance if your arrival is delayed."
                                    onChange={() => { }}
                                    rows={3}
                                />
                            </div>
                        </>
                    )}
                </div>
            </SectionCard>

            <SectionCard title="Terms & Conditions">
                <div>
                    <FieldLabel>General Terms</FieldLabel>
                    <FormTextarea
                        value="By booking this listing, guests agree to comply with all park/property rules and regulations. The operator reserves the right to modify itineraries for safety reasons."
                        onChange={() => { }}
                        rows={4}
                    />
                </div>
            </SectionCard>
        </div>
    );
}

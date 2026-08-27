import React, { useState, useEffect, useCallback } from "react";
import { Check, GripVertical, Plus, Trash2, Upload, Minus } from "lucide-react";
import { useDropzone } from "react-dropzone";
import type { Category } from "../../stores/listingDraftStore";
import { useListingDraftStore } from "../../stores/listingDraftStore";
import {
    FieldLabel,
    FormInput,
    FormTextarea,
    SectionCard,
    SelectField,
    TagInput,
    Toggle,
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
const BOOKING_UNITS = ["Per Person", "Per Group", "Per Vehicle", "Per Night"];
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

export function MediaTab() {
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
    const [checkInTime, setCheckInTime] = useState(String(draftPropertyDetails.checkInTime ?? ""));
    const [checkOutTime, setCheckOutTime] = useState(String(draftPropertyDetails.checkOutTime ?? ""));

    const [hpProperty, setHpProperty] = useState<boolean>(draftCategoryData.hostProfile?.property ?? false);
    const [hpHost, setHpHost] = useState<boolean>(draftCategoryData.hostProfile?.host ?? false);
    const [hpNeighborhood, setHpNeighborhood] = useState<boolean>(draftCategoryData.hostProfile?.neighborhood ?? false);
    const [hpAbout, setHpAbout] = useState<string>(draftCategoryData.hostProfile?.aboutNeighborhood ?? "");
    const [hpNone, setHpNone] = useState<boolean>(draftCategoryData.hostProfile?.none ?? false);

    useEffect(() => {
        setDraft({
            categoryData: {
                ...(draftCategoryData || {}),
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
                    <div>
                        <FieldLabel required>Where is the property</FieldLabel>
                        <FormInput value={propertyLocation} onChange={setPropertyLocation} placeholder="City, area" />
                    </div>
                    <div>
                        <FieldLabel>Breakfast included</FieldLabel>
                        <div className="flex items-center gap-3 h-9">
                            <Toggle value={breakfastIncluded} onChange={setBreakfastIncluded} />
                        </div>
                    </div>
                    <div>
                        <FieldLabel required>Property Name</FieldLabel>
                        <FormInput value={propertyName} onChange={setPropertyName} placeholder="Name" />
                    </div>
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
        setVariants([
            ...variants,
            {
                id: `var_${Date.now()}`,
                name: "New Variant",
                unit: "Per Person",
                minCapacity: "1",
                maxCapacity: "6",
                price: "",
                currency: "USD",
                priority: variants.length + 1,
                isDefault: false,
            },
        ]);
    };



    const removeVariant = (id: string) => setVariants(variants.filter((v) => v.id !== id));
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
                    Add Variant
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

function SafariDetails() {
    const [wildlife, setWildlife] = useState([
        "Sri Lankan Leopard", "Asian Elephant", "Sloth Bear", "Mugger Crocodile", "Sri Lanka Jungle Fowl",
    ]);
    const [included, setIncluded] = useState([
        "Experienced naturalist guide", "4WD jeep with open roof", "Park entrance fees", "Water & snacks",
    ]);
    const [excluded, setExcluded] = useState(["Hotel transfers", "Tips & gratuities", "Travel insurance"]);
    const [languages, setLanguages] = useState(["English", "Sinhala"]);
    const [toBring, setToBring] = useState(["Binoculars", "Sunscreen", "Hat", "Camera"]);

    return (
        <div className="space-y-4">
            <SectionCard title="Safari Overview">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <FieldLabel required>National Park</FieldLabel>
                        <SelectField
                            value="Yala National Park"
                            onChange={() => { }}
                            options={["Yala National Park", "Minneriya National Park", "Wasgamuwa National Park", "Kaudulla National Park", "Lunugamvehera National Park", "Udawalawe National Park", "Wilpattu National Park"]}
                        />
                    </div>
                    <div>
                        <FieldLabel required>Safari Type</FieldLabel>
                        <SelectField
                            value="Jeep Safari"
                            onChange={() => { }}
                            options={["Jeep Safari", "Walking Safari", "Boat Safari", "Night Safari", "Private Safari"]}
                        />
                    </div>
                    <div>
                        <FieldLabel>Duration (minutes)</FieldLabel>
                        <FormInput value="360" onChange={() => { }} placeholder="e.g. 360" type="number" />
                    </div>
                    <div>
                        <FieldLabel>Difficulty Level</FieldLabel>
                        <SelectField value="Moderate" onChange={() => { }} options={["Easy", "Moderate", "Challenging"]} />
                    </div>
                    <div>
                        <FieldLabel>Age Restriction</FieldLabel>
                        <FormInput value="5+" onChange={() => { }} placeholder="e.g. 5+" />
                    </div>
                    <div>
                        <FieldLabel>Min Group Size</FieldLabel>
                        <FormInput value="2" onChange={() => { }} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Max Group Size</FieldLabel>
                        <FormInput value="6" onChange={() => { }} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Start Time</FieldLabel>
                        <FormInput value="06:00" onChange={() => { }} type="time" />
                    </div>
                    <div>
                        <FieldLabel>End Time</FieldLabel>
                        <FormInput value="12:00" onChange={() => { }} type="time" />
                    </div>
                    <div className="col-span-3">
                        <FieldLabel>Best Season</FieldLabel>
                        <FormInput value="February–July, September–December" onChange={() => { }} placeholder="e.g. Feb–Jul" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {[
                        { label: "Guide Included", value: true },
                        { label: "Pickup Supported", value: true },
                        { label: "Private Available", value: true },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
                            <Toggle value={value} onChange={() => { }} />
                        </div>
                    ))}
                </div>
            </SectionCard>

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
                        <FormTextarea value="Hotel pickup available from Tissamaharama, Kataragama, and Hambantota areas. Please provide hotel details at booking." onChange={() => { }} rows={3} />
                    </div>
                    <div>
                        <FieldLabel>Cancellation Policy</FieldLabel>
                        <FormTextarea value="Free cancellation up to 48 hours before. 50% refund 24-48 hours before. No refund within 24 hours or for no-shows." onChange={() => { }} rows={3} />
                    </div>
                    <div>
                        <FieldLabel>Accessibility Info</FieldLabel>
                        <FormTextarea value="Safari jeeps are not wheelchair accessible. Participants must be able to climb in and out of the vehicle." onChange={() => { }} rows={2} />
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
        setDraft({ categoryData: { ...(draftCategoryData || {}), roomTypes: rooms, paymentPolicy } });
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

function TourDetails() {
    const [highlights, setHighlights] = useState(["Galle Fort ramparts", "Dutch Reformed Church", "Lighthouse", "Local gem shops"]);
    const [included, setIncluded] = useState(["Professional guide", "Water", "Entrance fees"]);
    const [excluded, setExcluded] = useState(["Hotel transfers", "Lunch", "Tips"]);
    const [languages, setLanguages] = useState(["English", "German"]);
    const [toBring, setToBring] = useState(["Comfortable shoes", "Hat", "Camera", "Water bottle"]);

    return (
        <div className="space-y-4">
            <SectionCard title="Tour Overview">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <FieldLabel>Duration Days</FieldLabel>
                        <FormInput value="1" onChange={() => { }} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Meeting Point</FieldLabel>
                        <FormInput value="Galle Fort Main Gate" onChange={() => { }} />
                    </div>
                    <div>
                        <FieldLabel>Difficulty Level</FieldLabel>
                        <SelectField value="Easy" onChange={() => { }} options={["Easy", "Moderate", "Challenging"]} />
                    </div>
                    <div>
                        <FieldLabel>Minimum Group Size</FieldLabel>
                        <FormInput value="2" onChange={() => { }} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Maximum Group Size</FieldLabel>
                        <FormInput value="15" onChange={() => { }} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Start Time</FieldLabel>
                        <FormInput value="09:00" onChange={() => { }} type="time" />
                    </div>
                    <div>
                        <FieldLabel>End Time</FieldLabel>
                        <FormInput value="13:00" onChange={() => { }} type="time" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {[
                        { label: "Private Available", v: true },
                        { label: "Pickup Available", v: true },
                        { label: "Drop-off Available", v: false },
                    ].map(({ label, v }) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
                            <Toggle value={v} onChange={() => { }} />
                        </div>
                    ))}
                </div>
            </SectionCard>

            <SectionCard title="Tour Content">
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Route Summary</FieldLabel>
                        <FormTextarea value="Start at Main Gate → Ramparts walk → Dutch Church → Clock Tower → National Maritime Museum → Lighthouse → Gem Museum → Return to gate" onChange={() => { }} rows={3} />
                    </div>
                    <div>
                        <FieldLabel>Itinerary Highlights</FieldLabel>
                        <TagInput tags={highlights} onChange={setHighlights} placeholder="Add highlight..." />
                    </div>
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
                </div>
            </SectionCard>

            <SectionCard title="Additional Information">
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Child Policy</FieldLabel>
                        <FormTextarea value="Children of all ages welcome. Children under 12 receive 50% discount when accompanied by adults." onChange={() => { }} rows={2} />
                    </div>
                    <div>
                        <FieldLabel>Pickup Notes</FieldLabel>
                        <FormTextarea value="Hotel pickup available from Galle, Unawatuna, and Hikkaduwa areas. Please provide hotel details at booking." onChange={() => { }} rows={2} />
                    </div>
                    <div>
                        <FieldLabel>Drop-off Notes</FieldLabel>
                        <FormTextarea value="Drop-off at original pickup location or at Galle Fort as requested." onChange={() => { }} rows={2} />
                    </div>
                    <div>
                        <FieldLabel>Cancellation Policy</FieldLabel>
                        <FormTextarea value="Free cancellation up to 24 hours before tour. No refund for cancellations within 24 hours or no-shows." onChange={() => { }} rows={2} />
                    </div>
                    <div>
                        <FieldLabel>Accessibility Info</FieldLabel>
                        <FormTextarea value="Tour involves walking on uneven surfaces and stairs. Not suitable for wheelchairs. Moderate fitness level required." onChange={() => { }} rows={2} />
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}

function ExperienceDetails() {
    const [highlights, setHighlights] = useState(["Sunset views from Galle Face", "Local street food tasting", "Street art discovery", "Beach promenade walk"]);
    const [included, setIncluded] = useState(["Local guide", "Food samples", "Water"]);
    const [excluded, setExcluded] = useState(["Hotel pickup", "Additional meals", "Gratuities"]);
    const [languages, setLanguages] = useState(["English", "Sinhala"]);
    const [toBring, setToBring] = useState(["Camera", "Light jacket", "Comfortable shoes"]);

    return (
        <div className="space-y-4">
            <SectionCard title="Experience Overview">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <FieldLabel>Activity Type</FieldLabel>
                        <SelectField value="City Walk" onChange={() => { }} options={["City Walk", "Food Tour", "Cultural", "Adventure", "Wellness", "Workshop", "Photography"]} />
                    </div>
                    <div>
                        <FieldLabel>Meeting Point</FieldLabel>
                        <FormInput value="Galle Face Green Main Entrance" onChange={() => { }} />
                    </div>
                    <div>
                        <FieldLabel>Duration (minutes)</FieldLabel>
                        <FormInput value="180" onChange={() => { }} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Difficulty Level</FieldLabel>
                        <SelectField value="Easy" onChange={() => { }} options={["Easy", "Moderate", "Challenging"]} />
                    </div>
                    <div>
                        <FieldLabel>Age Restriction</FieldLabel>
                        <FormInput value="12+" onChange={() => { }} />
                    </div>
                    <div>
                        <FieldLabel>Minimum Group Size</FieldLabel>
                        <FormInput value="1" onChange={() => { }} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Maximum Group Size</FieldLabel>
                        <FormInput value="10" onChange={() => { }} type="number" />
                    </div>
                    <div>
                        <FieldLabel>Start Time</FieldLabel>
                        <FormInput value="16:00" onChange={() => { }} type="time" />
                    </div>
                    <div>
                        <FieldLabel>End Time</FieldLabel>
                        <FormInput value="19:00" onChange={() => { }} type="time" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    {[
                        { label: "Pickup Supported", v: true },
                        { label: "Private Available", v: true },
                    ].map(({ label, v }) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
                            <Toggle value={v} onChange={() => { }} />
                        </div>
                    ))}
                </div>
            </SectionCard>

            <SectionCard title="Experience Details">
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Highlights</FieldLabel>
                        <TagInput tags={highlights} onChange={setHighlights} placeholder="Add highlight..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Included Items</FieldLabel>
                            <TagInput tags={included} onChange={setIncluded} placeholder="Add included..." />
                        </div>
                        <div>
                            <FieldLabel>Excluded Items</FieldLabel>
                            <TagInput tags={excluded} onChange={setExcluded} placeholder="Add excluded..." />
                        </div>
                    </div>
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
                </div>
            </SectionCard>

            <SectionCard title="Additional Information">
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Pickup Notes</FieldLabel>
                        <FormTextarea value="Hotel pickup available from Colombo city center hotels. Please specify your location at booking." onChange={() => { }} rows={2} />
                    </div>
                    <div>
                        <FieldLabel>Availability Notes</FieldLabel>
                        <FormTextarea value="Available daily. Best enjoyed during weekday evenings for fewer crowds. May be affected by weather conditions." onChange={() => { }} rows={2} />
                    </div>
                    <div>
                        <FieldLabel>Cancellation Policy</FieldLabel>
                        <FormTextarea value="Free cancellation up to 24 hours before experience. No refund for cancellations within 24 hours or no-shows." onChange={() => { }} rows={2} />
                    </div>
                    <div>
                        <FieldLabel>Accessibility Info</FieldLabel>
                        <FormTextarea value="Experience involves moderate walking. Wheelchair accessible with assistance. Please notify in advance for special requirements." onChange={() => { }} rows={2} />
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
        setDraft({ categoryData: { ...(draftCategoryData || {}), roomTypes: rooms, paymentPolicy } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rooms, paymentPolicy]);

    const addRoom = () => {
        const newRoom: RoomType = {
            id: `room_${Date.now()}`,
            type: "Deluxe Room",
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
                                                            <strong>Room type already exists!</strong> If you are adding more rooms of this type, please increase the <strong>Count</strong> field. If creating a sub-variant, use a unique name (e.g., <em>{room.type} - Type 2</em>).
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
                                    <div className="grid grid-cols-2 gap-4 mb-2">
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
                                            <div className="grid grid-cols-[1fr_110px] gap-2">
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

export function ImagesSection() {
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
        setDraft({ categoryData: { ...(draftCategoryData || {}), images: { cover, gallery } } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cover, gallery]);

    return (
        <div className="space-y-4">
            <SectionCard title="Property Images">
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
                                    <button onClick={() => setCover("")} className="absolute top-2 right-2 p-1" style={{ background: "rgba(0,0,0,0.5)", borderRadius: 6 }}>
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
                                                Add multiple images to showcase the property from different angles.
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
                                        <button onClick={() => setGallery((g) => g.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1" style={{ background: "rgba(0,0,0,0.5)", borderRadius: 6 }}>
                                            <Trash2 size={12} color="white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ color: "var(--text-secondary)" }} className="text-[12px]">Add a high-resolution cover and multiple gallery images for the property page.</div>
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

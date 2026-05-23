import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Info,
  MapPin,
  Navigation,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Shield,
  ChevronDown,
  Plus,
  Trash2,
  X,
  Globe,
  Clock,
  Users,
  Star,
  Check,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Upload,
  GripVertical,
  Building2,
  Compass,
  Anchor,
  Car,
} from "lucide-react";

type ListingMode = "create" | "edit";
type Category = "Stay" | "Tour" | "Safari" | "Experience" | "Transfer";
type TabId = "basic" | "destination" | "media" | "pricing" | "category" | "policies";

interface ListingEditorProps {
  mode: ListingMode;
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

const CATEGORIES: { id: Category; label: string; icon: React.ComponentType<any> }[] = [
  { id: "Stay", label: "Stay", icon: Building2 },
  { id: "Tour", label: "Tour", icon: Compass },
  { id: "Safari", label: "Safari", icon: Globe },
  { id: "Experience", label: "Experience", icon: Anchor },
  { id: "Transfer", label: "Transfer", icon: Car },
];

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

const CURRENCIES = ["USD", "EUR", "GBP", "LKR", "AUD", "SGD"];
const BOOKING_UNITS = ["Per Person", "Per Group", "Per Vehicle", "Per Night"];

interface PricingVariant {
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

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label
      className="block text-[12px] mb-1.5"
      style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: "12px" }}
    >
      {children}
      {required && <span style={{ color: "var(--error)" }}> *</span>}
    </label>
  );
}

function FormInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-all"
      style={{
        background: "var(--input-background)",
        border: "1px solid var(--border-light)",
        color: "var(--text-primary)",
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.border = "1px solid var(--border-accent)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-navy-subtle)";
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.border = "1px solid var(--border-light)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    />
  );
}

function FormTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-all resize-none"
      style={{
        background: "var(--input-background)",
        border: "1px solid var(--border-light)",
        color: "var(--text-primary)",
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.border = "1px solid var(--border-accent)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-navy-subtle)";
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.border = "1px solid var(--border-light)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    />
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-[13px] outline-none appearance-none transition-all pr-8"
        style={{
          background: "var(--input-background)",
          border: "1px solid var(--border-light)",
          color: "var(--text-primary)",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o} style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--text-secondary)" }}
      />
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center gap-1.5 transition-all"
    >
      {value ? (
        <ToggleRight size={22} style={{ color: "var(--accent-navy)" }} />
      ) : (
        <ToggleLeft size={22} style={{ color: "var(--text-tertiary)" }} />
      )}
      <span className="text-[12px]" style={{ color: value ? "var(--accent-navy-light)" : "var(--text-secondary)" }}>
        {value ? "Yes" : "No"}
      </span>
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5 mb-4"
      style={{
        background: "var(--input-background)",
        border: "1px solid var(--border-light)",
      }}
    >
      <h3 className="text-[13px] mb-4" style={{ color: "var(--accent-navy-light)", fontWeight: 600, fontSize: "13px" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      onChange([...tags, input.trim()]);
      setInput("");
    }
  };

  return (
    <div
      className="flex flex-wrap gap-1.5 min-h-[42px] px-3 py-2 rounded-lg"
      style={{
        background: "var(--input-background)",
        border: "1px solid var(--border-light)",
      }}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px]"
          style={{ background: "var(--active-overlay)", color: "var(--accent-navy-light)", border: "1px solid var(--border-accent)" }}
        >
          {tag}
          <button onClick={() => onChange(tags.filter((t) => t !== tag))}>
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        placeholder={tags.length === 0 ? placeholder : "Add more..."}
        className="flex-1 bg-transparent outline-none text-[12px] min-w-[80px]"
        style={{ color: "var(--text-secondary)" }}
      />
    </div>
  );
}

// ── Tab Content Components ────────────────────────────────────────────────────

function BasicInfoTab({
  title, setTitle, active, setActive, description, setDescription,
}: {
  title: string; setTitle: (v: string) => void;
  active: boolean; setActive: (v: boolean) => void;
  description: string; setDescription: (v: string) => void;
}) {
  return (
    <div>
      <SectionCard title="General Information">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2">
            <FieldLabel required>Listing Title</FieldLabel>
            <FormInput value={title} onChange={setTitle} placeholder="e.g. Yala National Park Safari" />
          </div>
          <div>
            <FieldLabel>Active Status</FieldLabel>
            <div className="flex items-center gap-3 h-9">
              <Toggle value={active} onChange={setActive} />
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                Listing is {active ? "visible to customers" : "hidden from customers"}
              </span>
            </div>
          </div>
        </div>
        <div>
          <FieldLabel required>Description</FieldLabel>
          <FormTextarea
            value={description}
            onChange={setDescription}
            placeholder="Write a detailed description of this listing..."
            rows={6}
          />
          <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
            {description.length} / 2000 characters
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

function DestinationTab({
  destination, setDestination, lat, setLat, lng, setLng,
}: {
  destination: string; setDestination: (v: string) => void;
  lat: string; setLat: (v: string) => void;
  lng: string; setLng: (v: string) => void;
}) {
  return (
    <div>
      <SectionCard title="Destination">
        <div className="space-y-4">
          <div>
            <FieldLabel required>Destination</FieldLabel>
            <FormInput value={destination} onChange={setDestination} placeholder="e.g. Yala, Sri Lanka" />
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Coordinates">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <FieldLabel>Latitude</FieldLabel>
            <FormInput value={lat} onChange={setLat} placeholder="6.3728" type="number" />
          </div>
          <div>
            <FieldLabel>Longitude</FieldLabel>
            <FormInput value={lng} onChange={setLng} placeholder="81.5156" type="number" />
          </div>
        </div>
        <div
          className="rounded-xl flex items-center justify-center"
          style={{
            height: 180,
            background: "var(--bg-panel)",
            border: "1px solid var(--border-accent)",
          }}
        >
          <div className="text-center">
            <Navigation size={28} style={{ color: "var(--text-tertiary)", margin: "0 auto 8px" }} />
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              Map preview — {lat && lng ? `${lat}, ${lng}` : "Enter coordinates"}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function MediaTab() {
  const placeholders = [
    { label: "Main image", gradient: "linear-gradient(135deg, #052e16, #065f46)" },
    { label: "Gallery photo", gradient: "linear-gradient(135deg, #1e3a5f, #0c4a6e)" },
    { label: "Feature shot", gradient: "linear-gradient(135deg, #431407, #7c2d12)" },
    { label: "Detail view", gradient: "linear-gradient(135deg, #1c1917, #44403c)" },
  ];

  return (
    <div>
      <SectionCard title="Media Gallery">
        <div
          className="rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer mb-5 transition-all"
          style={{
            height: 130,
            border: "2px dashed var(--border-accent)",
            background: "var(--accent-navy-subtle)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-navy)";
            (e.currentTarget as HTMLElement).style.background = "var(--active-overlay)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
            (e.currentTarget as HTMLElement).style.background = "var(--accent-navy-subtle)";
          }}
        >
          <Upload size={22} style={{ color: "var(--text-tertiary)" }} />
          <div className="text-center">
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              Drop files here or <span style={{ color: "var(--accent-navy)" }}>click to upload</span>
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              PNG, JPG, WEBP up to 10MB each · Max 30 images
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {placeholders.map((p, i) => (
            <div
              key={i}
              className="rounded-xl aspect-square relative overflow-hidden group cursor-pointer"
              style={{ background: p.gradient, border: "1px solid var(--border-light)" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ImageIcon size={20} style={{ color: "rgba(255,255,255,0.2)" }} />
                <p className="text-[10px] mt-1.5 text-center px-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {p.label}
                </p>
              </div>
              {i === 0 && (
                <div
                  className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px]"
                  style={{ background: "var(--accent-navy)", color: "white" }}
                >
                  Cover
                </div>
              )}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                <button
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <Star size={12} className="text-white" />
                </button>
                <button
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(239,68,68,0.3)" }}
                >
                  <Trash2 size={12} style={{ color: "#f87171" }} />
                </button>
              </div>
            </div>
          ))}
          <div
            className="rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-all"
            style={{
              border: "2px dashed var(--border-medium)",
              background: "var(--hover-overlay)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-medium)";
            }}
          >
            <Plus size={18} style={{ color: "var(--text-tertiary)" }} />
            <p className="text-[10px] mt-1" style={{ color: "var(--text-tertiary)" }}>
              Add more
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function PricingTab({
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
        <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
          Configure pricing tiers and booking units for this listing.
        </p>
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
              background: variant.isDefault ? "var(--active-overlay)" : "var(--input-background)",
              border: variant.isDefault
                ? "1px solid var(--border-accent)"
                : "1px solid var(--border-light)",
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
                      (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
                      (e.currentTarget as HTMLElement).style.color = "#f87171";
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

// ── Category-specific forms ──────────────────────────────────────────────────

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
              onChange={() => {}}
              options={["Yala National Park", "Minneriya National Park", "Wasgamuwa National Park", "Kaudulla National Park", "Lunugamvehera National Park", "Udawalawe National Park", "Wilpattu National Park"]}
            />
          </div>
          <div>
            <FieldLabel required>Safari Type</FieldLabel>
            <SelectField
              value="Jeep Safari"
              onChange={() => {}}
              options={["Jeep Safari", "Walking Safari", "Boat Safari", "Night Safari", "Private Safari"]}
            />
          </div>
          <div>
            <FieldLabel>Duration (minutes)</FieldLabel>
            <FormInput value="360" onChange={() => {}} placeholder="e.g. 360" type="number" />
          </div>
          <div>
            <FieldLabel>Difficulty Level</FieldLabel>
            <SelectField value="Moderate" onChange={() => {}} options={["Easy", "Moderate", "Challenging"]} />
          </div>
          <div>
            <FieldLabel>Age Restriction</FieldLabel>
            <FormInput value="5+" onChange={() => {}} placeholder="e.g. 5+" />
          </div>
          <div>
            <FieldLabel>Min Group Size</FieldLabel>
            <FormInput value="2" onChange={() => {}} type="number" />
          </div>
          <div>
            <FieldLabel>Max Group Size</FieldLabel>
            <FormInput value="6" onChange={() => {}} type="number" />
          </div>
          <div>
            <FieldLabel>Start Time</FieldLabel>
            <FormInput value="06:00" onChange={() => {}} type="time" />
          </div>
          <div>
            <FieldLabel>End Time</FieldLabel>
            <FormInput value="12:00" onChange={() => {}} type="time" />
          </div>
          <div className="col-span-3">
            <FieldLabel>Best Season</FieldLabel>
            <FormInput value="February–July, September–December" onChange={() => {}} placeholder="e.g. Feb–Jul" />
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
              <Toggle value={value} onChange={() => {}} />
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
            <FormTextarea value="Hotel pickup available from Tissamaharama, Kataragama, and Hambantota areas. Please provide hotel details at booking." onChange={() => {}} rows={3} />
          </div>
          <div>
            <FieldLabel>Cancellation Policy</FieldLabel>
            <FormTextarea value="Free cancellation up to 48 hours before. 50% refund 24-48 hours before. No refund within 24 hours or for no-shows." onChange={() => {}} rows={3} />
          </div>
          <div>
            <FieldLabel>Accessibility Info</FieldLabel>
            <FormTextarea value="Safari jeeps are not wheelchair accessible. Participants must be able to climb in and out of the vehicle." onChange={() => {}} rows={2} />
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

  return (
    <div className="space-y-4">
      <SectionCard title="Property Details">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <FieldLabel required>Property Type</FieldLabel>
            <SelectField value="Boutique Hotel" onChange={() => {}} options={["Hotel", "Boutique Hotel", "Villa", "Resort", "Guesthouse", "Bungalow", "Eco Lodge", "Apartment"]} />
          </div>
          <div>
            <FieldLabel required>Property Name</FieldLabel>
            <FormInput value="Heritance Kandalama" onChange={() => {}} />
          </div>
          <div>
            <FieldLabel>Short Location</FieldLabel>
            <FormInput value="Dambulla, Central Province" onChange={() => {}} />
          </div>
          <div>
            <FieldLabel>Star Rating</FieldLabel>
            <SelectField value="5" onChange={() => {}} options={["1", "2", "3", "4", "5"]} />
          </div>
          <div>
            <FieldLabel>Room Count</FieldLabel>
            <FormInput value="152" onChange={() => {}} type="number" />
          </div>
          <div>
            <FieldLabel>Max Guest Capacity</FieldLabel>
            <FormInput value="304" onChange={() => {}} type="number" />
          </div>
          <div>
            <FieldLabel>Check-in Time</FieldLabel>
            <FormInput value="14:00" onChange={() => {}} type="time" />
          </div>
          <div>
            <FieldLabel>Check-out Time</FieldLabel>
            <FormInput value="11:00" onChange={() => {}} type="time" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-4">
          {["Parking Available", "Wi-Fi Available", "Pets Allowed"].map((label) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
              <Toggle value={label !== "Pets Allowed"} onChange={() => {}} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Address & Contact">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Address Line 1</FieldLabel>
            <FormInput value="Heritance Kandalama Road" onChange={() => {}} />
          </div>
          <div>
            <FieldLabel>Address Line 2</FieldLabel>
            <FormInput value="" onChange={() => {}} placeholder="Optional" />
          </div>
          <div>
            <FieldLabel>City</FieldLabel>
            <FormInput value="Dambulla" onChange={() => {}} />
          </div>
          <div>
            <FieldLabel>District</FieldLabel>
            <FormInput value="Matale" onChange={() => {}} />
          </div>
          <div>
            <FieldLabel>Postal Code</FieldLabel>
            <FormInput value="21100" onChange={() => {}} />
          </div>
          <div>
            <FieldLabel>Contact Phone</FieldLabel>
            <FormInput value="+94 66 555 5000" onChange={() => {}} type="tel" />
          </div>
          <div>
            <FieldLabel>Contact Email</FieldLabel>
            <FormInput value="reservations@heritance.com" onChange={() => {}} type="email" />
          </div>
          <div>
            <FieldLabel>Website</FieldLabel>
            <FormInput value="https://www.heritancehotels.com/kandalama" onChange={() => {}} type="url" />
          </div>
          <div className="col-span-2">
            <FieldLabel>Google Map URL</FieldLabel>
            <FormInput value="https://maps.google.com/?q=7.8731,80.6611" onChange={() => {}} type="url" />
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
            <FormTextarea value="Children of all ages are welcome. Children under 6 stay free. Extra beds available for older children." onChange={() => {}} rows={2} />
          </div>
          <div>
            <FieldLabel>Smoking Policy</FieldLabel>
            <FormTextarea value="Non-smoking property. Designated smoking areas available outdoors." onChange={() => {}} rows={2} />
          </div>
          <div>
            <FieldLabel>Cancellation Policy</FieldLabel>
            <FormTextarea value="Free cancellation up to 7 days before check-in. 50% charge for 3-7 days. Full charge within 3 days or no-show." onChange={() => {}} rows={2} />
          </div>
          <div>
            <FieldLabel>Extra Bed Policy</FieldLabel>
            <FormTextarea value="Extra beds available on request at $35 per night. Subject to availability and room capacity." onChange={() => {}} rows={2} />
          </div>
          <div>
            <FieldLabel>Check-in Notes</FieldLabel>
            <FormTextarea value="Early check-in subject to availability. Valid photo ID and credit card required at check-in." onChange={() => {}} rows={2} />
          </div>
          <div>
            <FieldLabel>Check-out Notes</FieldLabel>
            <FormTextarea value="Late check-out available until 15:00 for an additional charge, subject to availability." onChange={() => {}} rows={2} />
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
            <FormInput value="1" onChange={() => {}} type="number" />
          </div>
          <div>
            <FieldLabel>Meeting Point</FieldLabel>
            <FormInput value="Galle Fort Main Gate" onChange={() => {}} />
          </div>
          <div>
            <FieldLabel>Difficulty Level</FieldLabel>
            <SelectField value="Easy" onChange={() => {}} options={["Easy", "Moderate", "Challenging"]} />
          </div>
          <div>
            <FieldLabel>Minimum Group Size</FieldLabel>
            <FormInput value="2" onChange={() => {}} type="number" />
          </div>
          <div>
            <FieldLabel>Maximum Group Size</FieldLabel>
            <FormInput value="15" onChange={() => {}} type="number" />
          </div>
          <div>
            <FieldLabel>Start Time</FieldLabel>
            <FormInput value="09:00" onChange={() => {}} type="time" />
          </div>
          <div>
            <FieldLabel>End Time</FieldLabel>
            <FormInput value="13:00" onChange={() => {}} type="time" />
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
              <Toggle value={v} onChange={() => {}} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Tour Content">
        <div className="space-y-4">
          <div>
            <FieldLabel>Route Summary</FieldLabel>
            <FormTextarea value="Start at Main Gate → Ramparts walk → Dutch Church → Clock Tower → National Maritime Museum → Lighthouse → Gem Museum → Return to gate" onChange={() => {}} rows={3} />
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
            <FormTextarea value="Children of all ages welcome. Children under 12 receive 50% discount when accompanied by adults." onChange={() => {}} rows={2} />
          </div>
          <div>
            <FieldLabel>Pickup Notes</FieldLabel>
            <FormTextarea value="Hotel pickup available from Galle, Unawatuna, and Hikkaduwa areas. Please provide hotel details at booking." onChange={() => {}} rows={2} />
          </div>
          <div>
            <FieldLabel>Drop-off Notes</FieldLabel>
            <FormTextarea value="Drop-off at original pickup location or at Galle Fort as requested." onChange={() => {}} rows={2} />
          </div>
          <div>
            <FieldLabel>Cancellation Policy</FieldLabel>
            <FormTextarea value="Free cancellation up to 24 hours before tour. No refund for cancellations within 24 hours or no-shows." onChange={() => {}} rows={2} />
          </div>
          <div>
            <FieldLabel>Accessibility Info</FieldLabel>
            <FormTextarea value="Tour involves walking on uneven surfaces and stairs. Not suitable for wheelchairs. Moderate fitness level required." onChange={() => {}} rows={2} />
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
            <SelectField value="City Walk" onChange={() => {}} options={["City Walk", "Food Tour", "Cultural", "Adventure", "Wellness", "Workshop", "Photography"]} />
          </div>
          <div>
            <FieldLabel>Meeting Point</FieldLabel>
            <FormInput value="Galle Face Green Main Entrance" onChange={() => {}} />
          </div>
          <div>
            <FieldLabel>Duration (minutes)</FieldLabel>
            <FormInput value="180" onChange={() => {}} type="number" />
          </div>
          <div>
            <FieldLabel>Difficulty Level</FieldLabel>
            <SelectField value="Easy" onChange={() => {}} options={["Easy", "Moderate", "Challenging"]} />
          </div>
          <div>
            <FieldLabel>Age Restriction</FieldLabel>
            <FormInput value="12+" onChange={() => {}} />
          </div>
          <div>
            <FieldLabel>Minimum Group Size</FieldLabel>
            <FormInput value="1" onChange={() => {}} type="number" />
          </div>
          <div>
            <FieldLabel>Maximum Group Size</FieldLabel>
            <FormInput value="10" onChange={() => {}} type="number" />
          </div>
          <div>
            <FieldLabel>Start Time</FieldLabel>
            <FormInput value="16:00" onChange={() => {}} type="time" />
          </div>
          <div>
            <FieldLabel>End Time</FieldLabel>
            <FormInput value="19:00" onChange={() => {}} type="time" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {["Pickup Supported", "Private Available"].map((label) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
              <Toggle value={true} onChange={() => {}} />
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
            <FormTextarea value="Hotel pickup available from Colombo city center hotels. Please specify your location at booking." onChange={() => {}} rows={2} />
          </div>
          <div>
            <FieldLabel>Availability Notes</FieldLabel>
            <FormTextarea value="Available daily. Best enjoyed during weekday evenings for fewer crowds. May be affected by weather conditions." onChange={() => {}} rows={2} />
          </div>
          <div>
            <FieldLabel>Cancellation Policy</FieldLabel>
            <FormTextarea value="Free cancellation up to 24 hours before experience. No refund for cancellations within 24 hours or no-shows." onChange={() => {}} rows={2} />
          </div>
          <div>
            <FieldLabel>Accessibility Info</FieldLabel>
            <FormTextarea value="Experience involves moderate walking. Wheelchair accessible with assistance. Please notify in advance for special requirements." onChange={() => {}} rows={2} />
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
            <SelectField value="Airport" onChange={() => {}} options={["Airport", "Hotel", "Port", "Train Station", "Custom Location"]} />
          </div>
          <div>
            <FieldLabel>Destination Type</FieldLabel>
            <SelectField value="Hotel" onChange={() => {}} options={["Airport", "Hotel", "Port", "Train Station", "Custom Location"]} />
          </div>
          <div>
            <FieldLabel>Estimated Duration (minutes)</FieldLabel>
            <FormInput value="45" onChange={() => {}} type="number" />
          </div>
          <div>
            <FieldLabel>Max Passengers</FieldLabel>
            <FormInput value="4" onChange={() => {}} type="number" />
          </div>
          <div>
            <FieldLabel>Max Luggage</FieldLabel>
            <FormInput value="4 standard bags" onChange={() => {}} />
          </div>
          <div>
            <FieldLabel>Operating Start Time</FieldLabel>
            <FormInput value="00:00" onChange={() => {}} type="time" />
          </div>
          <div>
            <FieldLabel>Operating End Time</FieldLabel>
            <FormInput value="23:59" onChange={() => {}} type="time" />
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
              <Toggle value={v} onChange={() => {}} />
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
            <FormTextarea value="All vehicles are less than 3 years old, fully licensed, and maintained to high standards. Professional chauffeurs with extensive airport experience." onChange={() => {}} rows={2} />
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
            <FormTextarea value="Driver will meet you at Arrivals Hall with a name sign. Please share your flight details at booking for accurate tracking." onChange={() => {}} rows={3} />
          </div>
          <div>
            <FieldLabel>Drop-off Instructions</FieldLabel>
            <FormTextarea value="Driver will assist with luggage and drop you at your hotel main entrance or specified terminal for airport transfers." onChange={() => {}} rows={2} />
          </div>
          <div>
            <FieldLabel>Route Notes</FieldLabel>
            <FormTextarea value="Standard route via E01 Expressway (45 mins). Scenic coastal route available on request (1 hour 15 mins, additional charge may apply)." onChange={() => {}} rows={2} />
          </div>
          <div>
            <FieldLabel>Waiting Time Policy</FieldLabel>
            <FormTextarea value="1 hour complimentary waiting time for international flights, 30 minutes for domestic flights from scheduled landing time. Additional waiting charged at $20/hour." onChange={() => {}} rows={3} />
          </div>
          <div>
            <FieldLabel>Cancellation Policy</FieldLabel>
            <FormTextarea value="Free cancellation up to 24 hours before pickup. 50% charge for cancellations within 24 hours. No refund for no-shows or cancellations within 2 hours of scheduled pickup." onChange={() => {}} rows={3} />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function CategoryDetailsTab({ category }: { category: Category }) {
  const components: Record<Category, React.FC> = {
    Safari: SafariDetails,
    Stay: StayDetails,
    Tour: TourDetails,
    Experience: ExperienceDetails,
    Transfer: TransferDetails,
  };
  const Component = components[category];
  return <Component />;
}

function PoliciesTab({ category }: { category: Category }) {
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
              onChange={() => {}}
              rows={4}
            />
          </div>
          {isTransfer && (
            <div>
              <FieldLabel>Waiting Time Policy</FieldLabel>
              <FormTextarea
                value="1 hour complimentary waiting time for airport pickups from the scheduled landing time. Additional waiting time charged at $20/hour."
                onChange={() => {}}
                rows={3}
              />
            </div>
          )}
          {isSafariOrTour && (
            <div>
              <FieldLabel>Weather / Force Majeure Policy</FieldLabel>
              <FormTextarea
                value="In case of extreme weather or park closure, a full refund or reschedule will be offered at no charge."
                onChange={() => {}}
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
                  onChange={() => {}}
                  rows={3}
                />
              </div>
              <div>
                <FieldLabel>No-show Policy</FieldLabel>
                <FormTextarea
                  value="No-shows will be charged the full booking amount. Please contact us in advance if your arrival is delayed."
                  onChange={() => {}}
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
            onChange={() => {}}
            rows={4}
          />
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
    Safari: { text: "#34d399", bg: "rgba(5,150,105,0.12)" },
    Stay: { text: "#60a5fa", bg: "rgba(37,99,235,0.12)" },
    Tour: { text: "#22d3ee", bg: "rgba(8,145,178,0.12)" },
    Experience: { text: "#fbbf24", bg: "rgba(217,119,6,0.12)" },
    Transfer: { text: "#94a3b8", bg: "rgba(100,116,139,0.12)" },
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
          <span className="text-[13px]" style={{ color: active ? "#4ade80" : "#fbbf24", fontWeight: 500 }}>
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

export function ListingEditor({ mode }: ListingEditorProps) {
  const navigate = useNavigate();
  const params = useParams();
  const listingId = params.id || null;
  const [category, setCategory] = useState<Category>("Safari");
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [title, setTitle] = useState(DEFAULT_DATA.title);
  const [active, setActive] = useState(DEFAULT_DATA.active);
  const [description, setDescription] = useState(DEFAULT_DATA.description);
  const [destination, setDestination] = useState(DEFAULT_DATA.destination);
  const [lat, setLat] = useState(DEFAULT_DATA.lat);
  const [lng, setLng] = useState(DEFAULT_DATA.lng);
  const [variants, setVariants] = useState<PricingVariant[]>([
    { id: "var_1", name: "Standard Safari", unit: "Per Person", minCapacity: "2", maxCapacity: "6", price: "85", currency: "USD", priority: 1, isDefault: true },
    { id: "var_2", name: "Private Safari", unit: "Per Group", minCapacity: "1", maxCapacity: "6", price: "380", currency: "USD", priority: 2, isDefault: false },
    { id: "var_3", name: "Premium Sunrise", unit: "Per Person", minCapacity: "2", maxCapacity: "4", price: "120", currency: "USD", priority: 3, isDefault: false },
  ]);

  const [deleteConfirm, setDeleteConfirm] = useState(false);

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
        {TABS.map(({ id, label, icon: Icon }) => {
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
            <PricingTab variants={variants} setVariants={setVariants} />
          )}
          {activeTab === "category" && <CategoryDetailsTab category={category} />}
          {activeTab === "policies" && <PoliciesTab category={category} />}
        </div>

        {/* Right panel */}
        <div
          className="w-64 shrink-0 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <StatusPanel mode={mode} active={active} category={category} />
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
                    style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
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
                    (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
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
            {mode === "create" ? (
              <>
                <Plus size={12} />
                Create Listing
              </>
            ) : (
              <>
                <Check size={12} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

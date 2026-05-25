import React, { useState, useEffect } from "react";
import { useListingDraftStore } from "../stores/listingDraftStore";
import { useParams, useNavigate } from "react-router";
import type { Category } from "../stores/listingDraftStore";
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
  Compass,
  Anchor,
  Car,
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
  type PricingVariant,
} from "./listings/listingEditorSections";

type ListingMode = "create" | "edit";
type TabId = "basic" | "destination" | "media" | "pricing" | "category" | "policies";
type WizardStep = 1 | 2 | 3 | 4 | 5;

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
  { id: 5, label: "Images", description: "Property cover and gallery" },
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
  const [step, setStep] = useState<WizardStep>(1);
  const flow = category ? getFlow(category) : null;
  const steps = getCreateSteps(category);
  const subcategory = useListingDraftStore((state) => state.subcategory ?? null);
  const setDraft = useListingDraftStore((state) => state.setDraft);
  const draftCategoryData = useListingDraftStore((state) => state.categoryData ?? {});

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(() => (draftCategoryData.amenities ?? []));

  const renderStep = () => {
    if (step === 1) {
      return <CreateWizardTypeStep category={category} setCategory={setCategory} categories={CATEGORIES} />;
    }

    if (step === 2) {
      if (flow?.step2Layout === "tree-selector" && flow.treeSelection) {
        return (
          <CreateWizardTreeSelectionStep
            title={flow.treeSelection.title}
            helperText={flow.treeSelection.helperText}
            branches={flow.treeSelection.branches}
            selectedId={subcategory}
            onSelect={(value) => setDraft({ subcategory: value })}
          />
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
                onClick={() => setStep(item.id)}
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
      </div>
      <div className="px-6 py-4 shrink-0 flex items-center justify-between" style={{ borderTop: "1px solid var(--border-light)", background: "var(--bg-header)" }}>
        <button
          onClick={() => setStep((current) => (current > 1 ? ((current - 1) as WizardStep) : current))}
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
          onClick={() => setStep((current) => (current < 5 ? ((current + 1) as WizardStep) : current))}
          className="px-4 py-2 rounded-lg text-[12px] transition-all"
          style={{
            background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
            color: "white",
          }}
        >
          {step === 5 ? "Finish" : "Next"}
        </button>
      </div>
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
  const [category, setCategory] = useState<Category | null>(() => (mode === "create" ? null : "Safari"));
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [title, setTitle] = useState(() => (mode === "create" ? "" : DEFAULT_DATA.title));
  const [active, setActive] = useState(() => (mode === "create" ? true : DEFAULT_DATA.active));
  const [description, setDescription] = useState(() => (mode === "create" ? "" : DEFAULT_DATA.description));
  const [destination, setDestination] = useState(() => (mode === "create" ? "" : DEFAULT_DATA.destination));
  const [lat, setLat] = useState(() => (mode === "create" ? "" : DEFAULT_DATA.lat));
  const [lng, setLng] = useState(() => (mode === "create" ? "" : DEFAULT_DATA.lng));
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
      : [
        { id: "var_1", name: "Standard Safari", unit: "Per Person", minCapacity: "2", maxCapacity: "6", price: "85", currency: "USD", priority: 1, isDefault: true },
        { id: "var_2", name: "Private Safari", unit: "Per Group", minCapacity: "1", maxCapacity: "6", price: "380", currency: "USD", priority: 2, isDefault: false },
        { id: "var_3", name: "Premium Sunrise", unit: "Per Person", minCapacity: "2", maxCapacity: "4", price: "120", currency: "USD", priority: 3, isDefault: false },
      ]
  ));

  const [deleteConfirm, setDeleteConfirm] = useState(false);

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
          {activeTab === "category" && <CategoryDetailsTab category={resolvedCategory} />}
          {activeTab === "policies" && <PoliciesTab category={resolvedCategory} />}
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
            <Check size={12} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

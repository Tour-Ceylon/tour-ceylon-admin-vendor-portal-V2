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
  type PricingVariant,
  type RoomType,
} from "./listings/listingEditorSections";

type ListingMode = "create" | "edit";
type TabId = "basic" | "destination" | "media" | "pricing" | "category" | "policies";
type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

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
  occupancy: string;
  guestsPay: string;
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
    { occupancy: "1 x 2", guestsPay: "USD 14.00" },
    { occupancy: "2 x 2", guestsPay: "USD 14.00" },
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
        }
      } else {
        if (!title.trim()) errors.push("Title is required.");
        if (!destination.trim()) errors.push("Destination is required.");
      }
      return errors;
    }

    if (currentStep === 3) {
      if (flow?.step3MultiSelect) {
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
          if (!room.type.trim()) return true;
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

  const handleFinish = () => {
    const errors = validateStep(step);
    if (errors.length) {
      setStepErrors(errors);
      return;
    }

    useListingDraftStore.getState().clearDraft();
    navigate("/listings");
  };

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
            style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#ef4444" }}
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
          className="px-4 py-2 rounded-lg text-[12px] transition-all"
          style={{
            background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
            color: "white",
          }}
        >
          {step === 6 ? "Finish" : "Next"}
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
    () => (draftCategoryData.ratePlans as RatePlanDraft | undefined) ?? DEFAULT_RATE_PLAN_DRAFT,
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
      groupRates: [...current.groupRates, { occupancy: "3 x 2", guestsPay: "USD 12.00" }],
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
                    {ratePlans.groupRates.map((row, index) => {
                      // parse occupancy like "1 x 2" into parts
                      const [groupsPart, perPart] = (row.occupancy || "").split("x").map((s) => s.trim());
                      const groupsInit = groupsPart || "1";
                      const perInit = perPart || "2";

                      return (
                        <div key={`${row.occupancy}-${index}`} className="grid grid-cols-[80px,1fr,auto] gap-3 items-end">
                          <div>
                            <FieldLabel>Groups</FieldLabel>
                            <FormInput
                              value={groupsInit}
                              onChange={(value) => updateGroupRate(index, { occupancy: `${value} x ${perInit}` })}
                              placeholder="#"
                              type="number"
                            />
                          </div>
                          <div>
                            <FieldLabel>Guests per group</FieldLabel>
                            <FormInput
                              value={perInit}
                              onChange={(value) => updateGroupRate(index, { occupancy: `${groupsInit} x ${value}` })}
                              placeholder="#"
                              type="number"
                            />
                          </div>
                          <div>
                            <FieldLabel>Guests pay</FieldLabel>
                            <FormInput value={row.guestsPay} onChange={(value) => updateGroupRate(index, { guestsPay: value })} />
                          </div>
                          <button
                            onClick={() => removeGroupRate(index)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                            style={{ color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}
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
                    {ratePlans.groupRates.map((row) => (
                      <div key={row.occupancy} className="grid grid-cols-2 px-3 py-2 text-[12px]" style={{ borderTop: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                        <span>{row.occupancy}</span>
                        <span className="text-right">{row.guestsPay}</span>
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

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Anchor,
  Building2,
  Check,
  ChevronRight,
  Compass,
  DollarSign,
  Globe,
  Image as ImageIcon,
  Info,
  Layers,
  Loader2,
  Shield,
  X,
} from "lucide-react";
import type { Category } from "../../stores/listingDraftStore";
import { SectionCardVariantContext } from "./listingEditorShared";
import {
  BasicInfoTab,
  CategoryDetailsTab,
  ImagesSection,
  LocationSection,
  MediaTab,
  PoliciesTab,
  PricingTab,
  RoomsSection,
  StayProfileSection,
  type DestinationOption,
  type PricingVariant,
} from "./listingEditorSections";
import type { ListingFormCategory, ListingIssue } from "./listingPayload";

type DrawerCategory = ListingFormCategory;

interface DrawerSection {
  id: string;
  label: string;
  icon: typeof Info;
}

const SECTIONS: Record<DrawerCategory, DrawerSection[]> = {
  Safari: [
    { id: "basic", label: "Basics & location", icon: Info },
    { id: "details", label: "Safari details & jeep packages", icon: Compass },
    { id: "media", label: "Photos", icon: ImageIcon },
    { id: "policies", label: "Policies & pickup", icon: Shield },
  ],
  Experience: [
    { id: "basic", label: "Basics & location", icon: Info },
    { id: "details", label: "Activity details & highlights", icon: Anchor },
    { id: "pricing", label: "Pricing & options", icon: DollarSign },
    { id: "media", label: "Photos", icon: ImageIcon },
    { id: "policies", label: "Policies", icon: Shield },
  ],
  Tour: [
    { id: "basic", label: "Basics & location", icon: Info },
    { id: "details", label: "Tour details & itinerary", icon: Compass },
    { id: "pricing", label: "Pricing & options", icon: DollarSign },
    { id: "media", label: "Photos", icon: ImageIcon },
    { id: "policies", label: "Policies & pickup", icon: Shield },
  ],
  Stay: [
    { id: "summary", label: "Listing summary", icon: Info },
    { id: "property", label: "Property & contact", icon: Building2 },
    { id: "stay-details", label: "Property details & rules", icon: Shield },
    { id: "rooms", label: "Rooms & payment", icon: Layers },
    { id: "rates", label: "Rate plans & policies", icon: DollarSign },
    { id: "images", label: "Photos", icon: ImageIcon },
  ],
};

const CATEGORY_CHOICES: Record<DrawerCategory, { icon: typeof Info; blurb: string }> = {
  Stay: { icon: Building2, blurb: "Hotels, villas and guesthouses, with rooms, rates and house rules." },
  Tour: { icon: Compass, blurb: "Multi-day journeys with an itinerary, pickup and a price per guest or group." },
  Safari: { icon: Globe, blurb: "Jeep safaris in a national park, with time slots and jeep packages." },
  Experience: { icon: Anchor, blurb: "Activities, food walks and workshops that last a few hours." },
};

export interface ListingEditDrawerProps {
  /** "edit" changes a saved listing; "create" starts a new one. */
  mode?: "edit" | "create";
  category: Category | null;
  /** Create mode: the categories the person may create (a vendor only gets Stay). */
  availableCategories?: ListingFormCategory[];
  onChooseCategory?: (category: ListingFormCategory) => void;
  listingId?: string | null;
  loading: boolean;
  loadError: string | null;
  title: string;
  setTitle: (value: string) => void;
  active: boolean;
  setActive: (value: boolean) => void;
  description: string;
  setDescription: (value: string) => void;
  destination?: string;
  setDestination: (value: string) => void;
  destinations?: DestinationOption[];
  destinationsLoading?: boolean;
  destinationId?: string;
  setDestinationId?: (id: string) => void;
  lat: string;
  setLat: (value: string) => void;
  lng: string;
  setLng: (value: string) => void;
  variants: PricingVariant[];
  setVariants: (value: PricingVariant[]) => void;
  saving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
  /** What still has to be fixed, shown at the top and under each section. */
  issues?: ListingIssue[];
  dirty: boolean;
  /** Edit: Save changes. Create: the main button. */
  onSave: () => void;
  primaryLabel?: string;
  /** Create only: keep the listing as a draft that guests cannot see. */
  onSaveDraft?: () => void;
  /** Changes when saved photos are read back, so the photo section restarts from what is stored. */
  photosKey?: number;
  /** The Stay rate-plan editor, passed in because it lives in ListingEditor. */
  ratePlansSection?: ReactNode;
  onClose: () => void;
  onDismissMessages: () => void;
}

/**
 * Creates or edits a Stay, Tour, Safari or Experience listing in a panel that slides in from the right, laid out
 * like the Transfer Request drawer: a sticky header, the form as stacked cards, and a sticky action bar.
 * All loading and saving is done by ListingEditor; this component only presents it.
 */
export function ListingEditDrawer(props: ListingEditDrawerProps) {
  const {
    mode = "edit", category, loading, loadError, title, active, saving, saveSuccess, saveError, dirty, onSave, onClose, onDismissMessages,
    issues = [],
  } = props;
  const creating = mode === "create";

  const panelRef = useRef<HTMLDivElement>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const drawerCategory: DrawerCategory | null =
    category === "Experience" || category === "Stay" || category === "Safari" || category === "Tour" ? category : creating ? null : "Safari";
  const sections = drawerCategory ? SECTIONS[drawerCategory] : [];
  const noun = drawerCategory ? drawerCategory.toLowerCase() : "listing";
  const choosing = creating && !drawerCategory;

  const requestClose = () => {
    if (dirty && !saving) setConfirmDiscard(true);
    else onClose();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, saving]);

  const jumpTo = (id: string) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panelRef.current?.querySelector(`#listing-section-${id}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const issuesFor = (id: string) => issues.filter((issue) => issue.section === id);

  const renderSection = (id: string) => {
    switch (id) {
      case "details":
        return drawerCategory ? <CategoryDetailsTab category={drawerCategory} /> : null;
      case "basic":
        return (
          <>
            <BasicInfoTab
              title={props.title}
              setTitle={props.setTitle}
              active={props.active}
              setActive={props.setActive}
              description={props.description}
              setDescription={props.setDescription}
            />
            <LocationSection
              destinations={props.destinations ?? []}
              destinationsLoading={Boolean(props.destinationsLoading)}
              destinationId={props.destinationId ?? ""}
              setDestinationId={(value) => props.setDestinationId?.(value)}
              setDestination={props.setDestination}
              lat={props.lat}
              setLat={props.setLat}
              lng={props.lng}
              setLng={props.setLng}
            />
          </>
        );
      case "summary":
        return (
          <BasicInfoTab
            title={props.title}
            setTitle={props.setTitle}
            active={props.active}
            setActive={props.setActive}
            description={props.description}
            setDescription={props.setDescription}
          />
        );
      case "property":
        return <StayProfileSection lat={props.lat} setLat={props.setLat} lng={props.lng} setLng={props.setLng} />;
      case "stay-details":
        return <MediaTab profileMode />;
      case "rooms":
        return <RoomsSection />;
      case "rates":
        return props.ratePlansSection ?? null;
      case "images":
        return <ImagesSection key={props.photosKey ?? 0} title="Photos" noun="property" />;
      case "pricing":
        return <PricingTab variants={props.variants} setVariants={props.setVariants} />;
      case "media":
        return <ImagesSection key={props.photosKey ?? 0} title="Photos" noun="listing" />;
      case "policies":
        return drawerCategory ? <PoliciesTab category={drawerCategory} /> : null;
      default:
        return null;
    }
  };

  const heading = creating ? (drawerCategory ? `New ${noun} listing` : "Create a listing") : `Edit ${noun} listing`;
  const primaryLabel = props.primaryLabel ?? (creating ? "Create listing" : "Save changes");
  const savingLabel = creating ? "Creating…" : "Saving…";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={requestClose} style={{ animation: "fadeIn 0.2s ease-out" }} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        className="fixed right-0 top-0 h-full w-full max-w-[800px] z-50 flex flex-col"
        style={{
          background: "var(--bg-main)",
          borderLeft: "1px solid var(--border-light)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
          animation: "slideInRight 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="shrink-0 px-6 py-4 flex items-start justify-between gap-4"
          style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border-light)" }}
        >
          <div className="min-w-0">
            <h2 className="text-[18px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {heading}
            </h2>
            <p className="text-[12px] mb-2 truncate" style={{ color: "var(--text-tertiary)" }}>
              {choosing
                ? "Pick the kind of listing first. You can fill in the rest on the next screen."
                : loading
                  ? "Loading…"
                  : title || (creating ? "Untitled — give it a title below" : "Untitled listing")}
            </p>
            {!loading && !loadError && drawerCategory && (
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: active ? "rgba(34, 197, 94, 0.12)" : "rgba(100, 116, 139, 0.15)", color: active ? "#4ade80" : "#94a3b8" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "#22c55e" : "#64748b" }} aria-hidden />
                  {active ? "Active" : "Inactive"}
                </span>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "var(--active-overlay)", color: "var(--accent-navy-light)" }}
                >
                  {drawerCategory}
                </span>
                {dirty && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#fbbf24" }}>
                    {creating ? "Not created yet" : "Unsaved changes"}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={requestClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0"
            style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-tertiary)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Jump links between the stacked sections */}
        {!loading && !loadError && drawerCategory && (
          <nav
            aria-label="Sections"
            className="shrink-0 px-6 py-2.5 flex items-center gap-2 overflow-x-auto"
            style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border-light)" }}
          >
            {sections.map(({ id, label, icon: Icon }) => {
              const count = issuesFor(id).length;
              return (
                <button
                  key={id}
                  onClick={() => jumpTo(id)}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-[12px] transition-all"
                  style={{
                    background: "var(--input-background)",
                    border: `1px solid ${count ? "rgba(239,68,68,0.5)" : "var(--border-light)"}`,
                    color: count ? "#f87171" : "var(--text-secondary)",
                  }}
                >
                  <Icon size={12} aria-hidden />
                  {label}
                  {count > 0 && (
                    <span className="ml-0.5 px-1.5 rounded-full text-[10px]" style={{ background: "rgba(239,68,68,0.18)", fontWeight: 700 }} aria-label={`${count} to fix`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="h-full flex items-center justify-center gap-2 text-[13px]" style={{ color: "var(--text-tertiary)" }} role="status">
              <Loader2 size={16} className="animate-spin" aria-hidden /> Loading listing…
            </div>
          )}

          {!loading && loadError && (
            <div
              role="alert"
              className="rounded-xl px-4 py-3 text-[13px] flex items-start gap-2"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
            >
              <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden />
              {loadError}
            </div>
          )}

          {/* Create: what kind of listing? */}
          {!loading && !loadError && choosing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Listing type">
              {(props.availableCategories ?? []).map((choice) => {
                const { icon: Icon, blurb } = CATEGORY_CHOICES[choice];
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => props.onChooseCategory?.(choice)}
                    className="text-left rounded-xl p-5 transition-all flex flex-col gap-3"
                    style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)")}
                  >
                    <span className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--active-overlay)", color: "var(--accent-navy-light)" }}>
                      <Icon size={18} aria-hidden />
                    </span>
                    <span>
                      <span className="flex items-center justify-between text-[15px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {choice}
                        <ChevronRight size={16} style={{ color: "var(--text-tertiary)" }} aria-hidden />
                      </span>
                      <span className="block text-[12px] mt-1" style={{ color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                        {blurb}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && !loadError && drawerCategory && (
            <SectionCardVariantContext.Provider value="panel">
              {issues.length > 0 && (
                <div
                  role="alert"
                  className="rounded-xl px-4 py-3 mb-6"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}
                >
                  <p className="flex items-center gap-2 text-[13px] mb-2" style={{ color: "#f87171", fontWeight: 600 }}>
                    <AlertTriangle size={15} aria-hidden />
                    {issues.length === 1 ? "One thing needs fixing before this can be saved" : `${issues.length} things need fixing before this can be saved`}
                  </p>
                  <ul className="space-y-1">
                    {issues.map((issue, index) => (
                      <li key={`${issue.section}-${index}`}>
                        <button type="button" onClick={() => jumpTo(issue.section)} className="text-left text-[12px] underline-offset-2 hover:underline" style={{ color: "#fca5a5" }}>
                          {issue.message}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-8">
                {sections.map(({ id, label, icon: Icon }) => {
                  const sectionIssues = issuesFor(id);
                  return (
                    <section key={id} id={`listing-section-${id}`} aria-labelledby={`listing-section-title-${id}`} className="scroll-mt-4">
                      <h3
                        id={`listing-section-title-${id}`}
                        className="flex items-center gap-2 text-[12px] uppercase tracking-wider mb-3"
                        style={{ color: sectionIssues.length ? "#f87171" : "var(--text-tertiary)", fontWeight: 700 }}
                      >
                        <Icon size={13} aria-hidden />
                        {label}
                      </h3>
                      {sectionIssues.length > 0 && (
                        <ul className="mb-3 space-y-0.5 text-[12px]" style={{ color: "#f87171" }}>
                          {sectionIssues.map((issue, index) => (
                            <li key={index}>• {issue.message}</li>
                          ))}
                        </ul>
                      )}
                      {renderSection(id)}
                    </section>
                  );
                })}
              </div>
            </SectionCardVariantContext.Provider>
          )}
        </div>

        {/* Messages and the action bar */}
        {saveSuccess && (
          <div role="status" className="shrink-0 px-6 py-2 bg-emerald-500/10 border-t border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between">
            <span>{creating ? "Listing created." : "All changes saved."}</span>
            <button onClick={onDismissMessages} className="underline">Dismiss</button>
          </div>
        )}
        {saveError && (
          <div role="alert" className="shrink-0 px-6 py-2 bg-rose-500/10 border-t border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center justify-between gap-3">
            <span>{saveError}</span>
            <button onClick={onDismissMessages} className="underline shrink-0">Dismiss</button>
          </div>
        )}
        {confirmDiscard && (
          <div role="alertdialog" aria-label="Discard unsaved changes" className="shrink-0 px-6 py-3 flex items-center justify-between gap-3" style={{ background: "rgba(245, 158, 11, 0.1)", borderTop: "1px solid rgba(245, 158, 11, 0.3)" }}>
            <span className="text-[12px]" style={{ color: "#fbbf24" }}>
              {creating ? "This listing has not been created yet. Close without saving?" : "You have unsaved changes. Close without saving?"}
            </span>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setConfirmDiscard(false)} className="px-3 py-1.5 rounded-lg text-[12px]" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}>
                Keep editing
              </button>
              <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-[12px] text-white" style={{ background: "var(--error)", fontWeight: 600 }}>
                Discard changes
              </button>
            </div>
          </div>
        )}

        <div
          className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-6 py-3"
          style={{ background: "var(--bg-panel)", borderTop: "1px solid var(--border-light)", boxShadow: "var(--shadow-lg)" }}
        >
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {creating ? (drawerCategory ? "Guests only see this once it is created as active" : "") : dirty ? "Changes are not saved yet" : "No unsaved changes"}
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={requestClose}
              className="px-4 py-2 rounded-lg text-[12px] transition-all"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}
            >
              Close
            </button>
            {creating && drawerCategory && props.onSaveDraft && (
              <button
                onClick={props.onSaveDraft}
                disabled={saving || loading || !!loadError}
                className="px-4 py-2 rounded-lg text-[12px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              >
                Save as draft
              </button>
            )}
            {!choosing && (
              <button
                onClick={onSave}
                disabled={saving || loading || !!loadError || (!creating && !dirty)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                  color: "white",
                  border: "1px solid var(--border-accent)",
                  fontWeight: 600,
                }}
              >
                {saving ? <Loader2 size={12} className="animate-spin" aria-hidden /> : <Check size={12} aria-hidden />}
                {saving ? savingLabel : primaryLabel}
              </button>
            )}
          </div>
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

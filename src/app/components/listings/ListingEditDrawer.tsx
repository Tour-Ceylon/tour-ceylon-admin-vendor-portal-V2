import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Anchor,
  Building2,
  Check,
  Compass,
  DollarSign,
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
  DestinationTab,
  ImagesSection,
  MediaTab,
  PoliciesTab,
  PricingTab,
  RoomsSection,
  StayProfileSection,
  type PricingVariant,
} from "./listingEditorSections";

type DrawerCategory = "Safari" | "Experience" | "Stay";

interface DrawerSection {
  id: string;
  label: string;
  icon: typeof Info;
}

const SECTIONS: Record<DrawerCategory, DrawerSection[]> = {
  Safari: [
    { id: "details", label: "Safari details & jeep packages", icon: Compass },
    { id: "basic", label: "Basic info & location", icon: Info },
    { id: "media", label: "Photos & media", icon: ImageIcon },
    { id: "policies", label: "Policies & pickup", icon: Shield },
  ],
  Experience: [
    { id: "details", label: "Activity details & highlights", icon: Anchor },
    { id: "basic", label: "Basic info & location", icon: Info },
    { id: "pricing", label: "Pricing & variants", icon: DollarSign },
    { id: "media", label: "Photos & media", icon: ImageIcon },
    { id: "policies", label: "Policies", icon: Shield },
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

export interface ListingEditDrawerProps {
  category: Category | null;
  listingId: string | null;
  loading: boolean;
  loadError: string | null;
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
  saving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
  dirty: boolean;
  onSave: () => void;
  /** The Stay rate-plan editor, passed in because it lives in ListingEditor. */
  ratePlansSection?: ReactNode;
  onClose: () => void;
  onDismissMessages: () => void;
}

/**
 * Edits an existing Safari or Experience listing in a panel that slides in from the right, laid out like the
 * Transfer Request drawer: a sticky header, the form sections as stacked cards, and a sticky save bar.
 * All loading and saving is done by ListingEditor; this component only presents it.
 */
export function ListingEditDrawer(props: ListingEditDrawerProps) {
  const {
    category, loading, loadError, title, active, saving, saveSuccess, saveError, dirty, onSave, onClose, onDismissMessages,
  } = props;

  const panelRef = useRef<HTMLDivElement>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const drawerCategory: DrawerCategory = category === "Experience" ? "Experience" : category === "Stay" ? "Stay" : "Safari";
  const sections = SECTIONS[drawerCategory];
  const noun = drawerCategory.toLowerCase();

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

  const renderSection = (id: string) => {
    switch (id) {
      case "details":
        return <CategoryDetailsTab category={drawerCategory} />;
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
            <DestinationTab
              destination={props.destination}
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
        return <ImagesSection />;
      case "pricing":
        return <PricingTab variants={props.variants} setVariants={props.setVariants} />;
      case "media":
        return (
          <>
            <MediaTab />
            <ImagesSection />
          </>
        );
      case "policies":
        return <PoliciesTab category={drawerCategory} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={requestClose} style={{ animation: "fadeIn 0.2s ease-out" }} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${noun} listing`}
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
              Edit {noun} listing
            </h2>
            <p className="text-[12px] mb-2 truncate" style={{ color: "var(--text-tertiary)" }}>
              {loading ? "Loading…" : title || "Untitled listing"}
            </p>
            {!loading && !loadError && (
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
                    Unsaved changes
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
        {!loading && !loadError && (
          <nav
            aria-label="Sections"
            className="shrink-0 px-6 py-2.5 flex items-center gap-2 overflow-x-auto"
            style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border-light)" }}
          >
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => jumpTo(id)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-[12px] transition-all"
                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
              >
                <Icon size={12} aria-hidden />
                {label}
              </button>
            ))}
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

          {!loading && !loadError && (
            <SectionCardVariantContext.Provider value="panel">
              <div className="space-y-8">
                {sections.map(({ id, label, icon: Icon }) => (
                  <section key={id} id={`listing-section-${id}`} aria-labelledby={`listing-section-title-${id}`} className="scroll-mt-4">
                    <h3
                      id={`listing-section-title-${id}`}
                      className="flex items-center gap-2 text-[12px] uppercase tracking-wider mb-3"
                      style={{ color: "var(--text-tertiary)", fontWeight: 700 }}
                    >
                      <Icon size={13} aria-hidden />
                      {label}
                    </h3>
                    {renderSection(id)}
                  </section>
                ))}
              </div>
            </SectionCardVariantContext.Provider>
          )}
        </div>

        {/* Messages and the save bar */}
        {saveSuccess && (
          <div role="status" className="shrink-0 px-6 py-2 bg-emerald-500/10 border-t border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between">
            <span>All changes saved.</span>
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
            <span className="text-[12px]" style={{ color: "#fbbf24" }}>You have unsaved changes. Close without saving?</span>
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
          className="shrink-0 flex items-center justify-between gap-3 px-6 py-3"
          style={{ background: "var(--bg-panel)", borderTop: "1px solid var(--border-light)", boxShadow: "var(--shadow-lg)" }}
        >
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {dirty ? "Changes are not saved yet" : "No unsaved changes"}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={requestClose}
              className="px-4 py-2 rounded-lg text-[12px] transition-all"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}
            >
              Close
            </button>
            <button
              onClick={onSave}
              disabled={saving || loading || !!loadError || !dirty}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                color: "white",
                border: "1px solid var(--border-accent)",
                fontWeight: 600,
              }}
            >
              {saving ? <Loader2 size={12} className="animate-spin" aria-hidden /> : <Check size={12} aria-hidden />}
              {saving ? "Saving…" : "Save changes"}
            </button>
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

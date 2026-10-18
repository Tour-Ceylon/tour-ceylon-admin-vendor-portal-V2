import React, { createContext, useContext, useState } from "react";
import {
    Check,
    ChevronDown,
    ChevronUp,
    Plus,
    ToggleLeft,
    ToggleRight,
    Trash2,
    X,
    Copy,
    ArrowUp,
    ArrowDown,
    MapPin,
    Moon,
    Sparkles,
    Calendar,
    Utensils,
} from "lucide-react";
import type { Category } from "../../stores/listingDraftStore";
import type { FlowTreeBranch } from "./listingFlowSchema";

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
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

export function FormInput({
    value,
    onChange,
    placeholder,
    type = "text",
    onKeyDown,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
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

export function FormTextarea({
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

export function SelectField({
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

export function CreatableSelect({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (v: string) => void;
    options: string[];
}) {
    // Generate a unique ID using Math.random once on mount (or just hardcode if options don't collide)
    // We'll use a deterministic ID based on a few options to avoid SSR issues
    const listId = `datalist-${options.length}`;
    
    return (
        <div className="relative">
            <input
                list={listId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Select or type to create new..."
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-all pr-8"
                style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                }}
            />
            <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-secondary)" }}
            />
            <datalist id={listId}>
                {options.map((o) => (
                    <option key={o} value={o} />
                ))}
            </datalist>
        </div>
    );
}

export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
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

/** "panel" gives section cards the look of the cards in the Transfer Request drawer. */
export const SectionCardVariantContext = createContext<"default" | "panel">("default");

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    const variant = useContext(SectionCardVariantContext);
    if (variant === "panel") {
        return (
            <section
                className="rounded-xl p-5 mb-4"
                style={{
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border-light)",
                    boxShadow: "var(--shadow-md)",
                }}
            >
                <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {title}
                </h3>
                {children}
            </section>
        );
    }
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

export function TagInput({
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

export function CreateWizardTypeStep({
    category,
    setCategory,
    categories,
}: {
    category: Category | null;
    setCategory: (value: Category) => void;
    categories: Array<{ id: Category; label: string; icon: React.ComponentType<any>; summary: string; details: string; flow: string }>;
}) {
    return (
        <div>
            <SectionCard title="Choose the listing type">
                <p className="text-[12px] mb-4" style={{ color: "var(--text-secondary)" }}>
                    Start by picking the kind of listing you want to create. The rest of the form will adapt to that choice.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map(({ id, label, icon: Icon, summary, details, flow }) => {
                        const isActive = category === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setCategory(id)}
                                className="text-left rounded-2xl p-4 transition-all"
                                style={{
                                    background: isActive ? "var(--active-overlay)" : "var(--input-background)",
                                    border: isActive ? "1px solid var(--border-accent)" : "1px solid var(--border-light)",
                                    boxShadow: isActive ? "0 0 0 1px var(--border-accent), var(--shadow-lg)" : "none",
                                }}
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                                            style={{
                                                background: isActive ? "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))" : "var(--bg-panel)",
                                                color: isActive ? "white" : "var(--accent-navy-light)",
                                                border: "1px solid var(--border-light)",
                                            }}
                                        >
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                                                {label}
                                            </p>
                                            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                                                {flow}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                        style={{
                                            border: "1px solid var(--border-light)",
                                            background: isActive ? "var(--accent-navy)" : "transparent",
                                        }}
                                    >
                                        {isActive && <Check size={11} style={{ color: "white" }} />}
                                    </div>
                                </div>
                                <p className="text-[12px] leading-5 mb-3" style={{ color: "var(--text-secondary)" }}>
                                    {summary}
                                </p>
                                <p className="text-[11px] leading-5" style={{ color: "var(--text-tertiary)" }}>
                                    {details}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </SectionCard>
        </div>
    );
}

export function CreateWizardTreeSelectionStep({
    title,
    helperText,
    branches,
    selectedId,
    onSelect,
}: {
    title: string;
    helperText: string;
    branches: FlowTreeBranch[];
    selectedId?: string | null;
    onSelect: (value: string) => void;
}) {
    return (
        <div>
            <SectionCard title={title}>
                <p className="text-[12px] mb-4" style={{ color: "var(--text-secondary)" }}>
                    {helperText}
                </p>
                <div className="space-y-4">
                    {branches.map((branch) => (
                        <div
                            key={branch.id}
                            className="rounded-xl p-4"
                            style={{
                                border: "1px solid var(--border-light)",
                                background: "var(--bg-panel)",
                            }}
                        >
                            <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                                {branch.label}
                            </p>
                            <p className="text-[11px] mt-1 mb-3" style={{ color: "var(--text-tertiary)" }}>
                                {branch.summary}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {branch.options.map((option) => {
                                    const isActive = selectedId === option.id;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => onSelect(option.id)}
                                            className="text-left rounded-xl p-3 transition-all"
                                            style={{
                                                background: isActive ? "var(--active-overlay)" : "var(--input-background)",
                                                border: isActive ? "1px solid var(--border-accent)" : "1px solid var(--border-light)",
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                                                        {option.label}
                                                    </p>
                                                    <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                                                        {option.summary}
                                                    </p>
                                                </div>
                                                <div
                                                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                                    style={{
                                                        border: "1px solid var(--border-light)",
                                                        background: isActive ? "var(--accent-navy)" : "transparent",
                                                    }}
                                                >
                                                    {isActive && <Check size={11} style={{ color: "white" }} />}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
}

export function CreateWizardMultiSelectStep({
    title,
    helperText,
    options,
    selectedValues,
    onChange,
}: {
    title: string;
    helperText: string;
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
}) {
    const toggleValue = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter((item) => item !== value));
            return;
        }
        onChange([...selectedValues, value]);
    };

    return (
        <div>
            <SectionCard title={title}>
                <p className="text-[12px] mb-4" style={{ color: "var(--text-secondary)" }}>
                    {helperText}
                </p>
                <div className="flex flex-wrap gap-2.5">
                    {options.map((option) => {
                        const isActive = selectedValues.includes(option);
                        return (
                            <button
                                key={option}
                                onClick={() => toggleValue(option)}
                                className="px-3 py-1.5 rounded-lg text-[12px] transition-all"
                                style={{
                                    background: isActive ? "var(--active-overlay)" : "var(--input-background)",
                                    color: isActive ? "var(--accent-navy-light)" : "var(--text-secondary)",
                                    border: isActive ? "1px solid var(--border-accent)" : "1px solid var(--border-light)",
                                }}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </SectionCard>
        </div>
    );
}

function DayTitleField({
    value,
    onChange,
    dayNumber,
    isFirstDay,
    isLastDay,
    prevOvernight,
    currentOvernight,
    routeStops = [],
}: {
    value: string;
    onChange: (v: string) => void;
    dayNumber: number;
    isFirstDay: boolean;
    isLastDay: boolean;
    prevOvernight?: string;
    currentOvernight?: string;
    routeStops?: string[];
}) {
    // helper to normalize and clean title
    const cleanAndFormat = (raw: string) => {
        if (!raw) return "";
        let val = raw.trim();
        // Remove accidental "Day 1:", "Day 01 —", "Day 1 -", etc.
        val = val.replace(/^day\s*\d+\s*[-—:|\s]*/i, "");
        // Convert arrows, dashes, commas, " to " into " | "
        val = val.replace(/\s*(?:->|–|—|\bto\b)\s*/gi, " | ");
        val = val.replace(/,\s*/g, " | ");
        // Normalize multiple pipes or spaces
        val = val.replace(/\s*\|\s*/g, " | ");
        // Remove trailing/leading pipes
        val = val.replace(/^\|\s*|\s*\|$/g, "");
        return val.trim();
    };

    const handleBlur = () => {
        const formatted = cleanAndFormat(value);
        if (formatted !== value) {
            onChange(formatted);
        }
    };

    const handleInsertPipe = () => {
        const trimmed = (value || "").trim().replace(/\s*\|$/, "");
        if (!trimmed) {
            onChange("");
            return;
        }
        onChange(`${trimmed} | `);
    };

    const handleAppendStop = (stop: string) => {
        const trimmed = (value || "").trim();
        if (!trimmed) {
            onChange(stop);
        } else if (trimmed.endsWith("|")) {
            onChange(`${trimmed} ${stop}`);
        } else {
            onChange(`${trimmed} | ${stop}`);
        }
    };

    const dayNumStr = String(dayNumber).padStart(2, "0");
    const displayPreview = value ? `Day ${dayNumStr} — ${cleanAndFormat(value)}` : `Day ${dayNumStr} — (Enter Title)`;

    // Candidate suggestions
    const presets: string[] = [];
    if (isFirstDay) {
        presets.push(currentOvernight ? `Arrival | ${currentOvernight}` : "Arrival | Negombo");
        presets.push("Arrival");
    } else if (isLastDay) {
        presets.push("Departure");
        if (prevOvernight) presets.push(`${prevOvernight} | Departure`);
        presets.push("Departure | Colombo Airport");
    } else {
        if (prevOvernight && currentOvernight && prevOvernight.toLowerCase() !== currentOvernight.toLowerCase()) {
            presets.push(`${prevOvernight} | ${currentOvernight}`);
        } else if (currentOvernight) {
            presets.push(currentOvernight);
        }
        presets.push("At Leisure");
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <FieldLabel required>
                    <span className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-emerald-400" />
                        Day Title & Route Stops <span className="text-[11px] font-normal text-[var(--text-tertiary)]">(Standard: Stop 1 | Stop 2)</span>
                    </span>
                </FieldLabel>
                <div className="flex items-center gap-1.5">
                    {value && (
                        <button
                            type="button"
                            onClick={() => onChange(cleanAndFormat(value))}
                            className="text-[11px] px-2 py-0.5 rounded font-medium border transition-all text-[var(--text-secondary)] hover:text-emerald-400 hover:border-emerald-500/40"
                            style={{ background: "var(--input-background)", borderColor: "var(--border-light)" }}
                            title="Clean & auto-format title into standard Stop | Stop syntax"
                        >
                            Auto-Format ( | )
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleInsertPipe}
                        className="text-[11px] px-2.5 py-0.5 rounded font-bold flex items-center gap-1 border transition-all"
                        style={{
                            background: "var(--accent-navy)",
                            borderColor: "var(--border-accent)",
                            color: "#ffffff",
                        }}
                        title="Insert route pipe separator"
                    >
                        + Add Pipe ( | )
                    </button>
                </div>
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => {
                        let text = e.target.value;
                        // If admin types comma, arrow, or " to ", immediately convert to " | "
                        if (text.includes(",") || text.includes("->") || text.includes(" – ") || text.includes(" - ")) {
                            text = text.replace(/,|\s*(?:->|–|—)\s*/g, " | ").replace(/\s*\|\s*/g, " | ");
                        }
                        onChange(text);
                    }}
                    onBlur={handleBlur}
                    placeholder={
                        isFirstDay
                            ? "e.g. Arrival | Negombo"
                            : isLastDay
                            ? "e.g. Departure or Hiriketiya | Departure"
                            : "e.g. Negombo | Kitulgala | Ambewela"
                    }
                    className="w-full text-[13px] px-3 py-2 rounded-lg border focus:outline-none transition-colors"
                    style={{
                        background: "var(--input-background)",
                        borderColor: "var(--border-light)",
                        color: "var(--text-primary)",
                    }}
                />
            </div>

            {/* Quick Presets & Route Stop Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">
                    Quick Presets:
                </span>
                {presets.map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChange(p)}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                            value === p
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold"
                                : "bg-[var(--input-background)] text-[var(--text-secondary)] border-[var(--border-light)] hover:border-emerald-400/40 hover:text-[var(--text-primary)]"
                        }`}
                    >
                        {p}
                    </button>
                ))}

                {routeStops.length > 0 && (
                    <>
                        <span className="text-[var(--text-tertiary)] text-[11px] mx-1">•</span>
                        <span className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">
                            + Append Stop:
                        </span>
                        {routeStops.slice(0, 6).map((stop) => (
                            <button
                                key={stop}
                                type="button"
                                onClick={() => handleAppendStop(stop)}
                                className="text-[11px] px-2 py-0.5 rounded-md border border-[var(--border-light)] bg-[var(--input-background)] text-[var(--text-secondary)] hover:border-sky-400/40 hover:text-sky-300 transition-all"
                            >
                                + {stop}
                            </button>
                        ))}
                    </>
                )}
            </div>

            {/* Live Client Preview Banner */}
            <div
                className="flex items-center justify-between px-3 py-1.5 rounded-lg border text-[11px]"
                style={{
                    background: "rgba(0,0,0,0.25)",
                    borderColor: "var(--border-light)",
                }}
            >
                <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)]">
                        Client Preview:
                    </span>
                    <span className="font-bold text-emerald-400 truncate">
                        {displayPreview}
                    </span>
                </div>
                {value && !value.includes("|") && !isLastDay && value.toLowerCase() !== "arrival" && value.toLowerCase() !== "departure" && (
                    <span className="text-[10px] text-amber-400 shrink-0 font-medium ml-2 flex items-center gap-1">
                        <Sparkles size={10} /> Tip: Use " | " between multiple stops (e.g. {value} | [Next Stop])
                    </span>
                )}
            </div>
        </div>
    );
}

export function ItineraryBuilder({
    itinerary,
    onChange,
    routeStops = [],
}: {
    itinerary: any[];
    onChange: (val: any[]) => void;
    routeStops?: string[];
}) {
    const currentList = Array.isArray(itinerary) ? itinerary : [];

    // Track expanded state for each day (default: first day open, or all open if <= 2 days)
    const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>(() => {
        const initial: Record<number, boolean> = {};
        for (let i = 0; i < currentList.length; i++) {
            initial[i] = currentList.length <= 2 || i === 0;
        }
        return initial;
    });

    const toggleDay = (index: number) => {
        setExpandedDays((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const expandAll = () => {
        const next: Record<number, boolean> = {};
        currentList.forEach((_, i) => {
            next[i] = true;
        });
        setExpandedDays(next);
    };

    const collapseAll = () => {
        setExpandedDays({});
    };

    const handleAdd = () => {
        const nextDayNum = currentList.length + 1;
        // Smart overnight suggestion from route stops if available
        const defaultOvernight = routeStops[Math.min(nextDayNum - 1, Math.max(0, routeStops.length - 1))] || "";
        const prevDayOvernight = currentList[currentList.length - 1]?.overnight || "";

        let initialTitle = "";
        if (nextDayNum === 1) {
            initialTitle = defaultOvernight ? `Arrival | ${defaultOvernight}` : "Arrival | Negombo";
        } else if (prevDayOvernight && defaultOvernight && prevDayOvernight !== defaultOvernight) {
            initialTitle = `${prevDayOvernight} | ${defaultOvernight}`;
        } else if (defaultOvernight) {
            initialTitle = defaultOvernight;
        }

        const newDay = {
            day: nextDayNum,
            title: initialTitle,
            description: "",
            overnight: defaultOvernight,
            destination: defaultOvernight,
            activities: [],
            meals: ["Breakfast"],
        };
        onChange([...currentList, newDay]);
        setExpandedDays((prev) => ({ ...prev, [currentList.length]: true }));
    };

    const updateDay = (index: number, key: string, value: any) => {
        const updated = [...currentList];
        updated[index] = { ...updated[index], [key]: value };
        onChange(updated);
    };

    const handleDuplicate = (index: number) => {
        const source = currentList[index];
        const duplicated = {
            ...source,
            title: source.title ? `${source.title} (Copy)` : "",
        };
        const nextList = [
            ...currentList.slice(0, index + 1),
            duplicated,
            ...currentList.slice(index + 1),
        ].map((item, i) => ({ ...item, day: i + 1 }));
        onChange(nextList);
        setExpandedDays((prev) => ({ ...prev, [index + 1]: true }));
    };

    const handleMove = (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= currentList.length) return;
        const nextList = [...currentList];
        const temp = nextList[index];
        nextList[index] = nextList[targetIndex];
        nextList[targetIndex] = temp;
        onChange(nextList.map((item, i) => ({ ...item, day: i + 1 })));
        setExpandedDays((prev) => ({
            ...prev,
            [index]: prev[targetIndex] ?? false,
            [targetIndex]: prev[index] ?? false,
        }));
    };

    const handleRemove = (index: number) => {
        const nextList = currentList.filter((_, i) => i !== index).map((item, i) => ({ ...item, day: i + 1 }));
        onChange(nextList);
    };

    // Derived unique overnight suggestions from route stops + popular Sri Lanka hubs
    const suggestionStops = Array.from(
        new Set([
            ...routeStops.map((s) => s.trim()).filter(Boolean),
            "Negombo",
            "Sigiriya",
            "Kandy",
            "Nuwara Eliya",
            "Ella",
            "Yala",
            "Mirissa",
            "Galle",
            "Bentota",
            "Colombo",
        ])
    ).slice(0, 10);

    const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner"];

    return (
        <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-1 border-b border-[var(--border-light)]">
                <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-[var(--text-primary)]">
                        Configured Itinerary
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {currentList.length} {currentList.length === 1 ? "Day" : "Days"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {currentList.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={expandAll}
                                className="text-[11px] px-2.5 py-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-overlay)] transition-colors"
                            >
                                Expand All
                            </button>
                            <span className="text-[var(--text-tertiary)]">•</span>
                            <button
                                type="button"
                                onClick={collapseAll}
                                className="text-[11px] px-2.5 py-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-overlay)] transition-colors"
                            >
                                Collapse All
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all ml-2"
                        style={{
                            background: "var(--accent-navy)",
                            color: "#ffffff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        }}
                    >
                        <Plus size={14} /> Add Day
                    </button>
                </div>
            </div>

            {/* Days List */}
            {currentList.length === 0 ? (
                <div
                    className="p-8 text-center rounded-xl border border-dashed border-[var(--border-light)] text-[var(--text-secondary)]"
                    style={{ background: "var(--bg-elevated)" }}
                >
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-[var(--text-tertiary)]" />
                    <p className="text-[13px] font-medium mb-1">No itinerary days added yet</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mb-4">
                        Build your tour day by day with titles, overnight stays, and rich descriptions.
                    </p>
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-2 rounded-lg"
                        style={{ background: "var(--accent-navy)", color: "#ffffff" }}
                    >
                        <Plus size={14} /> Add Day 1
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {currentList.map((day, index) => {
                        const isExpanded = Boolean(expandedDays[index]);
                        const dayNumStr = String(day.day || index + 1).padStart(2, "0");

                        return (
                            <div
                                key={index}
                                className="rounded-xl border transition-all overflow-hidden"
                                style={{
                                    borderColor: isExpanded ? "var(--border-accent)" : "var(--border-light)",
                                    background: "var(--bg-elevated)",
                                }}
                            >
                                {/* Accordion Header Bar */}
                                <div
                                    className="flex items-center justify-between p-3.5 cursor-pointer select-none hover:bg-[var(--hover-overlay)] transition-colors"
                                    onClick={() => toggleDay(index)}
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] shrink-0"
                                            style={{
                                                background: isExpanded ? "var(--accent-navy)" : "var(--active-overlay)",
                                                color: isExpanded ? "#ffffff" : "var(--accent-navy-light)",
                                                border: "1px solid var(--border-accent)",
                                            }}
                                        >
                                            {dayNumStr}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span
                                                    className="font-semibold text-[13px] truncate"
                                                    style={{ color: "var(--text-primary)" }}
                                                >
                                                    {day.title ? `Day ${dayNumStr} — ${day.title}` : `Day ${dayNumStr} (Click to edit)`}
                                                </span>
                                                {day.overnight && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                        <Moon size={10} /> {day.overnight}
                                                    </span>
                                                )}
                                            </div>
                                            {!isExpanded && day.description && (
                                                <p className="text-[11px] text-[var(--text-tertiary)] truncate mt-0.5 max-w-xl">
                                                    {day.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div
                                        className="flex items-center gap-1 shrink-0 ml-3"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Move Up */}
                                        <button
                                            type="button"
                                            disabled={index === 0}
                                            onClick={() => handleMove(index, "up")}
                                            title="Move Day Up"
                                            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-overlay)] disabled:opacity-20 disabled:pointer-events-none transition-colors"
                                        >
                                            <ArrowUp size={14} />
                                        </button>
                                        {/* Move Down */}
                                        <button
                                            type="button"
                                            disabled={index === currentList.length - 1}
                                            onClick={() => handleMove(index, "down")}
                                            title="Move Day Down"
                                            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-overlay)] disabled:opacity-20 disabled:pointer-events-none transition-colors"
                                        >
                                            <ArrowDown size={14} />
                                        </button>
                                        {/* Duplicate */}
                                        <button
                                            type="button"
                                            onClick={() => handleDuplicate(index)}
                                            title="Duplicate Day"
                                            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-overlay)] transition-colors"
                                        >
                                            <Copy size={14} />
                                        </button>
                                        {/* Delete */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(index)}
                                            title="Delete Day"
                                            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        {/* Expand/Collapse Chevron */}
                                        <button
                                            type="button"
                                            onClick={() => toggleDay(index)}
                                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-1"
                                        >
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Accordion Body */}
                                {isExpanded && (
                                    <div
                                        className="p-4 border-t space-y-4"
                                        style={{
                                            borderColor: "var(--border-light)",
                                            background: "rgba(0,0,0,0.12)",
                                        }}
                                    >
                                        {/* Row 1: Day Title Field with standard route formatting & client preview */}
                                        <DayTitleField
                                            value={day.title || ""}
                                            onChange={(v) => updateDay(index, "title", v)}
                                            dayNumber={index + 1}
                                            isFirstDay={index === 0}
                                            isLastDay={index === currentList.length - 1 && currentList.length > 1}
                                            prevOvernight={index > 0 ? (currentList[index - 1]?.overnight || currentList[index - 1]?.destination) : ""}
                                            currentOvernight={day.overnight || day.destination}
                                            routeStops={routeStops}
                                        />

                                        {/* Row 2: Destination & Overnight Stay with 1-click Quick Chips */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                            <div>
                                                <FieldLabel>Main Destination / City</FieldLabel>
                                                <FormInput
                                                    value={day.destination || ""}
                                                    onChange={(v) => updateDay(index, "destination", v)}
                                                    placeholder="e.g. Negombo, Sigiriya, Kandy..."
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <FieldLabel>
                                                        <span className="flex items-center gap-1.5">
                                                            <Moon size={12} className="text-indigo-400" />
                                                            Overnight Stay Place / City
                                                        </span>
                                                    </FieldLabel>
                                                    {day.overnight && (
                                                        <span className="text-[11px] text-[var(--text-tertiary)]">
                                                            Currently: <strong className="text-[var(--text-primary)]">{day.overnight}</strong>
                                                        </span>
                                                    )}
                                                </div>
                                                <FormInput
                                                    value={day.overnight || ""}
                                                    onChange={(v) => {
                                                        updateDay(index, "overnight", v);
                                                        // If Day 1 and title is empty or "Arrival", prefill "Arrival | [City]"
                                                        if (index === 0 && (!day.title || day.title === "Arrival") && v) {
                                                            updateDay(index, "title", `Arrival | ${v}`);
                                                        }
                                                    }}
                                                    placeholder="e.g. Negombo, Sigiriya, Kandy, Ella, Yala..."
                                                />
                                            </div>
                                        </div>

                                        {/* Quick suggestion chips for Overnight */}
                                        {suggestionStops.length > 0 && (
                                            <div className="flex items-center gap-1.5 flex-wrap -mt-2">
                                                <span className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                                                    <Sparkles size={11} className="text-amber-400" /> Quick Overnight Select:
                                                </span>
                                                {suggestionStops.map((stop) => (
                                                    <button
                                                        key={stop}
                                                        type="button"
                                                        onClick={() => {
                                                            updateDay(index, "overnight", stop);
                                                            if (index === 0 && (!day.title || day.title === "Arrival")) {
                                                                updateDay(index, "title", `Arrival | ${stop}`);
                                                            }
                                                        }}
                                                        className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                                                            (day.overnight || "").toLowerCase() === stop.toLowerCase()
                                                                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold"
                                                                : "bg-[var(--input-background)] text-[var(--text-secondary)] border-[var(--border-light)] hover:border-indigo-400/40 hover:text-[var(--text-primary)]"
                                                        }`}
                                                    >
                                                        {stop}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Row 3: Day Explanation / Description */}
                                        <div>
                                            <FieldLabel required>Day Itinerary Explanation</FieldLabel>
                                            <FormTextarea
                                                value={day.description || ""}
                                                onChange={(v) => updateDay(index, "description", v)}
                                                placeholder="Describe the journey, stops, cultural experiences, transport details, and highlights for this day in full detail..."
                                                rows={4}
                                            />
                                            <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                                                This rich description is rendered directly in the traveler's day accordion on the client packages portal.
                                            </p>
                                        </div>

                                        {/* Row 4: Key Activities & Meals */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                            <div>
                                                <FieldLabel>Key Activities / Stops on this Day</FieldLabel>
                                                <TagInput
                                                    tags={Array.isArray(day.activities) ? day.activities : []}
                                                    onChange={(tags) => updateDay(index, "activities", tags)}
                                                    placeholder="Add activity (e.g. Sigiriya Rock Fortress)..."
                                                />
                                            </div>
                                            <div>
                                                <FieldLabel>Meals Included</FieldLabel>
                                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                                    {MEAL_OPTIONS.map((meal) => {
                                                        const currentMeals = Array.isArray(day.meals) ? day.meals : [];
                                                        const isSelected = currentMeals.includes(meal);
                                                        return (
                                                            <button
                                                                key={meal}
                                                                type="button"
                                                                onClick={() => {
                                                                    const nextMeals = isSelected
                                                                        ? currentMeals.filter((m: string) => m !== meal)
                                                                        : [...currentMeals, meal];
                                                                    updateDay(index, "meals", nextMeals);
                                                                }}
                                                                className={`text-[11px] px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                                                                    isSelected
                                                                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                                                        : "bg-[var(--input-background)] text-[var(--text-secondary)] border-[var(--border-light)] hover:text-[var(--text-primary)]"
                                                                }`}
                                                            >
                                                                <Utensils size={11} /> {meal}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Bottom Add Day Button */}
            {currentList.length > 0 && (
                <button
                    type="button"
                    onClick={handleAdd}
                    className="w-full flex items-center justify-center gap-2 text-[13px] font-semibold transition-all rounded-xl py-2.5 border border-dashed hover:border-solid"
                    style={{
                        color: "var(--accent-navy-light)",
                        background: "var(--active-overlay)",
                        borderColor: "var(--border-accent)",
                    }}
                >
                    <Plus size={16} /> Add Day {currentList.length + 1}
                </button>
            )}
        </div>
    );
}

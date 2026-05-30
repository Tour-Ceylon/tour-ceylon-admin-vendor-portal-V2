import React, { useState } from "react";
import {
    Check,
    ChevronDown,
    ToggleLeft,
    ToggleRight,
    X,
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

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
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
                                    boxShadow: isActive ? "0 0 0 1px var(--border-accent), 0 10px 24px rgba(0,0,0,0.12)" : "none",
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

import { useState } from "react";
import { Modal } from "./Modal";
import { Filter, X } from "lucide-react";

export interface FilterOption {
  id: string;
  label: string;
  type: "select" | "date" | "text" | "number" | "checkbox";
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: any;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, any>) => void;
  filters: FilterOption[];
  title?: string;
}

export function FilterModal({
  isOpen,
  onClose,
  onApply,
  filters,
  title = "Advanced Filters",
}: FilterModalProps) {
  const [filterValues, setFilterValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    filters.forEach((filter) => {
      initial[filter.id] = filter.defaultValue || "";
    });
    return initial;
  });

  const handleApply = () => {
    onApply(filterValues);
    onClose();
  };

  const handleReset = () => {
    const resetValues: Record<string, any> = {};
    filters.forEach((filter) => {
      resetValues[filter.id] = filter.defaultValue || "";
    });
    setFilterValues(resetValues);
  };

  const handleChange = (id: string, value: any) => {
    setFilterValues((prev) => ({ ...prev, [id]: value }));
  };

  const activeFiltersCount = Object.values(filterValues).filter(
    (val) => val !== "" && val !== undefined && val !== null
  ).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={`${activeFiltersCount} filter${activeFiltersCount !== 1 ? "s" : ""} active`}
      size="md"
      icon={Filter}
      iconColor="#3b82f6"
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{
              background: "transparent",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-light)",
              fontWeight: 500,
            }}
          >
            <X size={14} className="inline mr-1" />
            Reset All
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] transition-all"
              style={{
                background: "var(--input-background)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-light)",
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-lg text-[13px] transition-all"
              style={{
                background: "var(--accent-navy-light)",
                color: "white",
                border: "1px solid var(--border-accent)",
                fontWeight: 500,
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        {filters.map((filter) => (
          <div key={filter.id} className="space-y-2">
            <label className="text-[12px] block" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
              {filter.label}
            </label>

            {filter.type === "select" && (
              <select
                value={filterValues[filter.id] || ""}
                onChange={(e) => handleChange(filter.id, e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none appearance-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">{filter.placeholder || `Select ${filter.label}`}</option>
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {filter.type === "text" && (
              <input
                type="text"
                value={filterValues[filter.id] || ""}
                onChange={(e) => handleChange(filter.id, e.target.value)}
                placeholder={filter.placeholder}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
            )}

            {filter.type === "number" && (
              <input
                type="number"
                value={filterValues[filter.id] || ""}
                onChange={(e) => handleChange(filter.id, e.target.value)}
                placeholder={filter.placeholder}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
            )}

            {filter.type === "date" && (
              <input
                type="date"
                value={filterValues[filter.id] || ""}
                onChange={(e) => handleChange(filter.id, e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
            )}

            {filter.type === "checkbox" && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterValues[filter.id] || false}
                  onChange={(e) => handleChange(filter.id, e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{
                    accentColor: "var(--accent-navy)",
                  }}
                />
                <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  {filter.placeholder || "Enable"}
                </span>
              </label>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}

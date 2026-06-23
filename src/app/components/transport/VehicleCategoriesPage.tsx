import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Car,
  CheckCircle,
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  Save,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { apiFetch } from "../api/apiClient";

interface VehicleCategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  passenger_capacity: number;
  luggage_capacity: number;
  base_fare: number;
  price_per_km: number;
  minimum_fare: number;
  airport_surcharge: number;
  night_surcharge: number;
  currency: string;
  image_url: string | null;
  features: string[] | null;
  is_active: boolean;
  sort_order: number | null;
}

interface VehicleFormState {
  id?: string;
  name: string;
  slug: string;
  description: string;
  passenger_capacity: string;
  luggage_capacity: string;
  base_fare: string;
  price_per_km: string;
  minimum_fare: string;
  airport_surcharge: string;
  night_surcharge: string;
  currency: string;
  image_url: string;
  features: string;
  is_active: boolean;
  sort_order: string;
}

const emptyForm: VehicleFormState = {
  name: "",
  slug: "",
  description: "",
  passenger_capacity: "4",
  luggage_capacity: "3",
  base_fare: "0",
  price_per_km: "0",
  minimum_fare: "0",
  airport_surcharge: "0",
  night_surcharge: "0",
  currency: "USD",
  image_url: "",
  features: "",
  is_active: true,
  sort_order: "0",
};

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number, currency: string) {
  return `${currency} ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formFromCategory(category: VehicleCategoryResponse): VehicleFormState {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    passenger_capacity: String(category.passenger_capacity),
    luggage_capacity: String(category.luggage_capacity),
    base_fare: String(category.base_fare),
    price_per_km: String(category.price_per_km),
    minimum_fare: String(category.minimum_fare),
    airport_surcharge: String(category.airport_surcharge),
    night_surcharge: String(category.night_surcharge),
    currency: category.currency || "USD",
    image_url: category.image_url || "",
    features: (category.features || []).join("\n"),
    is_active: category.is_active,
    sort_order: String(category.sort_order ?? 0),
  };
}

function payloadFromForm(form: VehicleFormState) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    description: form.description.trim() || null,
    passenger_capacity: Math.max(1, Math.round(toNumber(form.passenger_capacity))),
    luggage_capacity: Math.max(0, Math.round(toNumber(form.luggage_capacity))),
    base_fare: toNumber(form.base_fare),
    price_per_km: toNumber(form.price_per_km),
    minimum_fare: toNumber(form.minimum_fare),
    airport_surcharge: toNumber(form.airport_surcharge),
    night_surcharge: toNumber(form.night_surcharge),
    currency: form.currency.trim() || "USD",
    image_url: form.image_url.trim() || null,
    features: form.features
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean),
    is_active: form.is_active,
    sort_order: Math.round(toNumber(form.sort_order)),
  };
}

export function VehicleCategoriesPage() {
  const [categories, setCategories] = useState<VehicleCategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleFormState | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<VehicleCategoryResponse[]>("/admin/transport/categories");
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load vehicle categories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const stats = useMemo(() => {
    const active = categories.filter((category) => category.is_active);
    const averageRate =
      active.length > 0
        ? active.reduce((sum, category) => sum + Number(category.price_per_km), 0) / active.length
        : 0;

    return {
      totalCategories: categories.length,
      activeCategories: active.length,
      averageRate,
      surchargeRules: categories.filter(
        (category) => Number(category.airport_surcharge) > 0 || Number(category.night_surcharge) > 0
      ).length,
      currency: active[0]?.currency || categories[0]?.currency || "USD",
    };
  }, [categories]);

  const updateForm = (key: keyof VehicleFormState, value: string | boolean) => {
    setForm((current) => {
      if (!current) return current;
      const next = { ...current, [key]: value };
      if (key === "name" && !current.id) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  };

  const saveCategory = async () => {
    if (!form) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload = payloadFromForm(form);
      if (form.id) {
        await apiFetch<VehicleCategoryResponse>(`/admin/transport/categories/${form.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch<VehicleCategoryResponse>("/admin/transport/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setForm(null);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save vehicle category.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (category: VehicleCategoryResponse) => {
    setError(null);
    try {
      await apiFetch<VehicleCategoryResponse>(`/admin/transport/categories/${category.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !category.is_active }),
      });
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update vehicle status.");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Vehicle Categories
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Manage the real vehicle types, capacity, pricing, and surcharges used by transport quotes
          </p>
        </div>
        <button
          onClick={() => setForm(emptyForm)}
          className="px-4 py-2 rounded-lg flex items-center gap-2 text-[13px] transition-all"
          style={{
            background: "var(--accent-blue)",
            color: "white",
            fontWeight: 700,
          }}
        >
          <Plus size={15} />
          Add Vehicle
        </button>
      </div>

      {error && (
        <div
          className="mb-4 rounded-xl p-4 flex items-start gap-3"
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "var(--error)",
          }}
        >
          <AlertCircle size={18} />
          <span className="text-[13px]" style={{ fontWeight: 600 }}>
            {error}
          </span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Car size={18} style={{ color: "#3b82f6" }} />} label="Total Categories" value={stats.totalCategories} tone="blue" />
        <StatCard icon={<CheckCircle size={18} style={{ color: "var(--success)" }} />} label="Active Categories" value={stats.activeCategories} tone="green" />
        <StatCard
          icon={<Car size={18} style={{ color: "#0891b2" }} />}
          label="Avg Price per km"
          value={formatMoney(stats.averageRate, stats.currency)}
          tone="cyan"
        />
        <StatCard
          icon={<Briefcase size={18} style={{ color: "var(--success)" }} />}
          label="Surcharge Rules"
          value={stats.surchargeRules}
          tone="green"
        />
      </div>

      {isLoading ? (
        <div className="rounded-xl p-10 flex items-center justify-center gap-3" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
          <Loader2 size={18} className="animate-spin" />
          <span className="text-[13px]" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
            Loading real vehicle categories...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {categories.map((category) => (
            <VehicleCard
              key={category.id}
              category={category}
              onEdit={() => setForm(formFromCategory(category))}
              onToggle={() => toggleActive(category)}
            />
          ))}
        </div>
      )}

      {form && (
        <VehicleEditor
          form={form}
          isSaving={isSaving}
          onChange={updateForm}
          onClose={() => setForm(null)}
          onSave={saveCategory}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: "blue" | "green" | "cyan";
}) {
  const background =
    tone === "blue" ? "rgba(59, 130, 246, 0.1)" : tone === "cyan" ? "rgba(8, 145, 178, 0.1)" : "rgba(34, 197, 94, 0.1)";

  return (
    <div className="rounded-xl p-4" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background }}>
          {icon}
        </div>
      </div>
      <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
      <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function VehicleCard({
  category,
  onEdit,
  onToggle,
}: {
  category: VehicleCategoryResponse;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl p-5" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ background: category.is_active ? "rgba(59, 130, 246, 0.12)" : "rgba(100, 116, 139, 0.12)" }}
          >
            {category.image_url ? (
              <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
            ) : (
              <Car size={20} style={{ color: category.is_active ? "#3b82f6" : "#64748b" }} />
            )}
          </div>
          <div>
            <h3 className="text-[16px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {category.name}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] px-2 py-0.5 rounded"
                style={{
                  background: category.is_active ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  color: category.is_active ? "var(--success)" : "var(--error)",
                  fontWeight: 600,
                }}
              >
                {category.is_active ? "Active" : "Inactive"}
              </span>
              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                {category.slug}
              </span>
            </div>
          </div>
        </div>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
          <MoreHorizontal size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <CapacityBox icon={<Users size={12} />} label="Passengers" value={category.passenger_capacity} />
        <CapacityBox icon={<Briefcase size={12} />} label="Luggage" value={category.luggage_capacity} />
      </div>

      <div className="space-y-2 mb-4">
        <PriceRow label="Base Fare" value={formatMoney(category.base_fare, category.currency)} />
        <PriceRow label="Price per km" value={formatMoney(category.price_per_km, category.currency)} />
        <PriceRow label="Minimum Fare" value={formatMoney(category.minimum_fare, category.currency)} />
        <PriceRow label="Airport Surcharge" value={formatMoney(category.airport_surcharge, category.currency)} />
        <PriceRow label="Night Surcharge" value={formatMoney(category.night_surcharge, category.currency)} />
      </div>

      <div className="rounded-lg p-3 mb-4" style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
        <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>
          Features
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(category.features || []).slice(0, 5).map((feature) => (
            <span key={feature} className="text-[11px] px-2 py-1 rounded" style={{ background: "rgba(34, 197, 94, 0.12)", color: "var(--success)", fontWeight: 600 }}>
              {feature}
            </span>
          ))}
          {(!category.features || category.features.length === 0) && (
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              No features configured
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onEdit} className="flex-1 px-3 py-2 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}>
          <Edit size={14} />
          Edit Pricing
        </button>
        <button onClick={onToggle} className="px-3 py-2 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all" style={{ background: category.is_active ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)", color: category.is_active ? "var(--error)" : "var(--success)", fontWeight: 600 }}>
          {category.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />}
          {category.is_active ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}

function CapacityBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
      <div className="flex items-center gap-2 mb-1" style={{ color: "var(--text-tertiary)" }}>
        {icon}
        <p className="text-[11px]">{label}</p>
      </div>
      <p className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
        {value}
      </p>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
        {value}
      </p>
    </div>
  );
}

function VehicleEditor({
  form,
  isSaving,
  onChange,
  onClose,
  onSave,
}: {
  form: VehicleFormState;
  isSaving: boolean;
  onChange: (key: keyof VehicleFormState, value: string | boolean) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(15, 23, 42, 0.35)" }}>
      <div className="w-full max-w-4xl max-h-[88vh] rounded-2xl overflow-hidden flex flex-col" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-xl)" }}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <div>
            <h2 className="text-[18px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {form.id ? "Edit Vehicle Category" : "Add Vehicle Category"}
            </h2>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              Changes here update the transport quote engine used by customers
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--input-background)", color: "var(--text-secondary)" }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-2 gap-4 overflow-y-auto">
          <Field label="Name" value={form.name} onChange={(value) => onChange("name", value)} />
          <Field label="Slug" value={form.slug} onChange={(value) => onChange("slug", value)} />
          <Field label="Passenger Capacity" value={form.passenger_capacity} onChange={(value) => onChange("passenger_capacity", value)} type="number" />
          <Field label="Luggage Capacity" value={form.luggage_capacity} onChange={(value) => onChange("luggage_capacity", value)} type="number" />
          <Field label="Base Fare" value={form.base_fare} onChange={(value) => onChange("base_fare", value)} type="number" />
          <Field label="Price per km" value={form.price_per_km} onChange={(value) => onChange("price_per_km", value)} type="number" />
          <Field label="Minimum Fare" value={form.minimum_fare} onChange={(value) => onChange("minimum_fare", value)} type="number" />
          <Field label="Airport Surcharge" value={form.airport_surcharge} onChange={(value) => onChange("airport_surcharge", value)} type="number" />
          <Field label="Night Surcharge" value={form.night_surcharge} onChange={(value) => onChange("night_surcharge", value)} type="number" />
          <Field label="Currency" value={form.currency} onChange={(value) => onChange("currency", value)} />
          <Field label="Sort Order" value={form.sort_order} onChange={(value) => onChange("sort_order", value)} type="number" />
          <Field label="Image URL" value={form.image_url} onChange={(value) => onChange("image_url", value)} />

          <div className="col-span-2">
            <label className="text-[11px] block mb-1" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
              Description
            </label>
            <textarea value={form.description} onChange={(event) => onChange("description", event.target.value)} rows={3} className="w-full rounded-lg px-3 py-2 text-[13px] outline-none resize-none" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
          </div>

          <div className="col-span-2">
            <label className="text-[11px] block mb-1" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
              Features, one per line
            </label>
            <textarea value={form.features} onChange={(event) => onChange("features", event.target.value)} rows={4} className="w-full rounded-lg px-3 py-2 text-[13px] outline-none resize-none" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }} />
          </div>

          <label className="col-span-2 flex items-center gap-2 text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            <input type="checkbox" checked={form.is_active} onChange={(event) => onChange("is_active", event.target.checked)} />
            Active and available for customer quotes
          </label>
        </div>

        <div className="p-5 flex justify-end gap-3 shrink-0" style={{ borderTop: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]" style={{ background: "var(--input-background)", color: "var(--text-secondary)", fontWeight: 600 }}>
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving || !form.name.trim()}
            className="px-5 py-2.5 rounded-lg text-[13px] flex items-center gap-2 shadow-sm"
            style={{
              background: isSaving || !form.name.trim() ? "#93c5fd" : "#2563eb",
              color: "#ffffff",
              fontWeight: 700,
              cursor: isSaving || !form.name.trim() ? "not-allowed" : "pointer",
            }}
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Category
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[11px] block mb-1" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full h-10 rounded-lg px-3 text-[13px] outline-none"
        style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
      />
    </div>
  );
}

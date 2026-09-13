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
  DollarSign,
  TrendingUp,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  Plane,
  Moon,
  Info,
  ShieldCheck,
  Check,
  Trash2,
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
  base_fare: "15.00",
  price_per_km: "0.85",
  minimum_fare: "25.00",
  airport_surcharge: "10.00",
  night_surcharge: "15.00",
  currency: "USD",
  image_url: "",
  features: "Air Conditioning\nLuggage Assistance\nBottled Water\nGPS Navigation",
  is_active: true,
  sort_order: "0",
};

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number, currency = "USD") {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<VehicleCategoryResponse[]>("/admin/transport/categories");
      setCategories(Array.isArray(data) ? data : []);
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

    const maxPassengers = categories.reduce(
      (max, c) => Math.max(max, c.passenger_capacity || 0),
      0
    );

    return {
      totalCategories: categories.length,
      activeCategories: active.length,
      averageRate,
      maxPassengers,
      surchargeRules: categories.filter(
        (category) => Number(category.airport_surcharge) > 0 || Number(category.night_surcharge) > 0
      ).length,
      currency: active[0]?.currency || categories[0]?.currency || "USD",
    };
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (statusFilter === "active" && !cat.is_active) return false;
      if (statusFilter === "inactive" && cat.is_active) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (cat.name || "").toLowerCase().includes(q);
        const matchesSlug = (cat.slug || "").toLowerCase().includes(q);
        const matchesDesc = (cat.description || "").toLowerCase().includes(q);
        const matchesFeatures = (cat.features || []).some((f) => f.toLowerCase().includes(q));

        return matchesName || matchesSlug || matchesDesc || matchesFeatures;
      }
      return true;
    });
  }, [categories, statusFilter, searchQuery]);

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
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Vehicle Fleet Categories
            </h1>
            <span
              className="px-2.5 py-0.5 rounded-full text-[12px] font-bold"
              style={{
                background: "var(--active-overlay)",
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
              }}
            >
              {categories.length} Categories
            </span>
          </div>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Configure vehicle classes, seating & luggage specs, base fares, and distance pricing formulas
          </p>
        </div>

        <button
          onClick={() => setForm(emptyForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all shadow-md self-start sm:self-auto"
          style={{
            background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
            border: "1px solid var(--border-accent)",
          }}
        >
          <Plus size={16} />
          <span>Add Vehicle Category</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-[13px] flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Top KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Categories */}
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{
            background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
            border: "1px solid var(--border-accent)",
            boxShadow: "0 0 20px var(--border-accent)",
          }}
        >
          <div className="flex items-center justify-between text-white/75 text-[11px] uppercase font-bold tracking-wider">
            <span>Active Categories</span>
            <Car size={16} className="text-emerald-400" />
          </div>
          <p className="text-[26px] font-extrabold text-white">
            {stats.activeCategories}
          </p>
          <p className="text-[11px] text-white/70">Operational for live quotes</p>
        </div>

        {/* Average Rate / km */}
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between text-[11px] uppercase font-bold tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            <span>Avg Rate per km</span>
            <DollarSign size={16} className="text-sky-400" />
          </div>
          <p className="text-[26px] font-extrabold text-sky-400">
            ${stats.averageRate.toFixed(2)}
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Base per km distance multiplier</p>
        </div>

        {/* Max Passenger Capacity */}
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between text-[11px] uppercase font-bold tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            <span>Max Seating Capacity</span>
            <Users size={16} className="text-purple-400" />
          </div>
          <p className="text-[26px] font-extrabold text-purple-400">
            {stats.maxPassengers} Pax
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Highest vehicle capacity</p>
        </div>

        {/* Surcharge Rules Active */}
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between text-[11px] uppercase font-bold tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            <span>Surcharge Rules</span>
            <Plane size={16} className="text-amber-400" />
          </div>
          <p className="text-[26px] font-extrabold text-amber-400">
            {stats.surchargeRules}
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Airport & Night add-on rules</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div
        className="rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
        }}
      >
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Categories", count: categories.length },
            { id: "active", label: "Active", count: stats.activeCategories },
            { id: "inactive", label: "Inactive", count: categories.length - stats.activeCategories },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className="px-3.5 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5"
              style={{
                background: statusFilter === tab.id ? "var(--active-overlay)" : "transparent",
                border: statusFilter === tab.id ? "1px solid var(--border-accent)" : "1px solid transparent",
                color: statusFilter === tab.id ? "var(--accent-navy-light)" : "var(--text-secondary)",
              }}
            >
              <span>{tab.label}</span>
              <span
                className="px-1.5 py-0.2 rounded-full text-[10px]"
                style={{
                  background: statusFilter === tab.id ? "var(--border-accent)" : "var(--input-background)",
                  color: statusFilter === tab.id ? "white" : "var(--text-tertiary)",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & View Mode */}
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category, specs..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-[12px] outline-none"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div
            className="flex items-center p-1 rounded-xl shrink-0"
            style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
          >
            <button
              onClick={() => setViewMode("grid")}
              className="p-1.5 rounded-lg transition-all"
              style={{
                background: viewMode === "grid" ? "var(--active-overlay)" : "transparent",
                color: viewMode === "grid" ? "var(--accent-navy-light)" : "var(--text-tertiary)",
              }}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className="p-1.5 rounded-lg transition-all"
              style={{
                background: viewMode === "table" ? "var(--active-overlay)" : "transparent",
                color: viewMode === "table" ? "var(--accent-navy-light)" : "var(--text-tertiary)",
              }}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content View ── */}
      {isLoading ? (
        <div className="py-24 flex items-center justify-center gap-3" style={{ color: "var(--text-tertiary)" }}>
          <Loader2 size={24} className="animate-spin text-sky-400" />
          <span className="text-[13px]">Loading vehicle categories...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div
          className="py-20 text-center rounded-2xl p-8 max-w-md mx-auto"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}
        >
          <Car size={36} className="text-slate-500 mx-auto mb-3" />
          <p className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
            No vehicle categories found
          </p>
          <p className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>
            Try adjusting your search criteria or add a new vehicle category.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <ModernVehicleCard
              key={category.id}
              category={category}
              onEdit={() => setForm(formFromCategory(category))}
              onToggle={() => toggleActive(category)}
            />
          ))}
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr
                  className="text-[11px] uppercase font-bold tracking-wider"
                  style={{
                    background: "var(--input-background)",
                    borderBottom: "1px solid var(--border-light)",
                    color: "var(--text-tertiary)",
                  }}
                >
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-4 py-4">Capacity</th>
                  <th className="px-4 py-4">Base & Distance Rate</th>
                  <th className="px-4 py-4">Surcharges</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: cat.is_active ? "rgba(59, 130, 246, 0.15)" : "rgba(100, 116, 139, 0.15)",
                          }}
                        >
                          <Car size={18} className={cat.is_active ? "text-sky-400" : "text-slate-400"} />
                        </div>
                        <div>
                          <p className="font-bold text-[14px]" style={{ color: "var(--text-primary)" }}>
                            {cat.name}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">{cat.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[12px] space-y-0.5">
                        <p style={{ color: "var(--text-primary)" }}>{cat.passenger_capacity} Passengers</p>
                        <p style={{ color: "var(--text-tertiary)" }}>{cat.luggage_capacity} Luggage items</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-bold text-emerald-400">
                          ${Number(cat.price_per_km).toFixed(2)}/km
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          Base: ${Number(cat.base_fare).toFixed(2)} • Min: ${Number(cat.minimum_fare).toFixed(2)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[11px] space-y-0.5" style={{ color: "var(--text-secondary)" }}>
                        <p>Airport: +${Number(cat.airport_surcharge).toFixed(2)}</p>
                        <p>Night: +${Number(cat.night_surcharge).toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{
                          background: cat.is_active ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
                          color: cat.is_active ? "#4ade80" : "#f87171",
                        }}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
                        {cat.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setForm(formFromCategory(cat))}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all"
                          style={{
                            background: "var(--input-background)",
                            border: "1px solid var(--border-light)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Edit size={12} /> Edit
                        </button>
                        <button
                          onClick={() => toggleActive(cat)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                          style={{
                            background: cat.is_active ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
                            color: cat.is_active ? "#f87171" : "#4ade80",
                            border: cat.is_active ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(34,197,94,0.3)",
                          }}
                        >
                          {cat.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Vehicle Category Editor Slide-Over Modal ── */}
      {form && (
        <ModernVehicleEditor
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

function ModernVehicleCard({
  category,
  onEdit,
  onToggle,
}: {
  category: VehicleCategoryResponse;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col justify-between space-y-4 transition-all hover:scale-[1.01]"
      style={{
        background: "var(--bg-panel)",
        border: category.is_active ? "1px solid var(--border-light)" : "1px solid rgba(239,68,68,0.2)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Top Bar */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 overflow-hidden"
              style={{
                background: category.is_active
                  ? "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))"
                  : "linear-gradient(135deg, #475569, #334155)",
                boxShadow: category.is_active ? "0 0 14px var(--border-accent)" : "none",
              }}
            >
              {category.image_url ? (
                <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
              ) : (
                <Car size={22} className={category.is_active ? "text-sky-300" : "text-slate-400"} />
              )}
            </div>
            <div>
              <h3 className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>
                {category.name}
              </h3>
              <p className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>
                {category.slug}
              </p>
            </div>
          </div>

          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{
              background: category.is_active ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
              color: category.is_active ? "#4ade80" : "#f87171",
            }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${category.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
            {category.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        {category.description && (
          <p className="text-[12px] mt-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
            {category.description}
          </p>
        )}
      </div>

      {/* Capacities */}
      <div className="grid grid-cols-2 gap-3 text-[13px]">
        <div
          className="p-3 rounded-xl flex items-center gap-2.5"
          style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
        >
          <Users size={16} className="text-sky-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Seating</span>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>
              {category.passenger_capacity} Passengers
            </span>
          </div>
        </div>

        <div
          className="p-3 rounded-xl flex items-center gap-2.5"
          style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
        >
          <Briefcase size={16} className="text-purple-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Luggage</span>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>
              {category.luggage_capacity} Luggage items
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Formula Breakdown */}
      <div
        className="rounded-xl p-4 space-y-2 text-[12px]"
        style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
      >
        <div className="flex items-center justify-between">
          <span style={{ color: "var(--text-tertiary)" }}>Price per KM:</span>
          <span className="font-bold text-emerald-400 text-[14px]">
            ${Number(category.price_per_km).toFixed(2)}/km
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ color: "var(--text-tertiary)" }}>Base Starting Fare:</span>
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            ${Number(category.base_fare).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ color: "var(--text-tertiary)" }}>Minimum Fare:</span>
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            ${Number(category.minimum_fare).toFixed(2)}
          </span>
        </div>
        {(Number(category.airport_surcharge) > 0 || Number(category.night_surcharge) > 0) && (
          <div className="pt-2 flex items-center justify-between text-[11px]" style={{ borderTop: "1px solid var(--border-light)", color: "var(--text-tertiary)" }}>
            <span>Airport: +${Number(category.airport_surcharge).toFixed(2)}</span>
            <span>Night: +${Number(category.night_surcharge).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Feature Tags */}
      {category.features && category.features.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {category.features.slice(0, 4).map((f, i) => (
            <span
              key={i}
              className="text-[11px] px-2.5 py-0.5 rounded-lg font-medium"
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                color: "#38bdf8",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              {f}
            </span>
          ))}
          {category.features.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-lg text-slate-400 bg-white/5">
              +{category.features.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={onEdit}
          className="py-2.5 px-4 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all"
          style={{
            background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
            color: "white",
            border: "1px solid var(--border-accent)",
          }}
        >
          <Edit size={13} /> Edit Pricing
        </button>

        <button
          onClick={onToggle}
          className="py-2.5 px-4 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all"
          style={{
            background: category.is_active ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
            border: category.is_active ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(34, 197, 94, 0.3)",
            color: category.is_active ? "#f87171" : "#4ade80",
          }}
        >
          {category.is_active ? <XCircle size={13} /> : <CheckCircle size={13} />}
          {category.is_active ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}

function ModernVehicleEditor({
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
  const estDistanceKm = 40;
  const sampleFare =
    toNumber(form.base_fare) +
    estDistanceKm * toNumber(form.price_per_km) +
    toNumber(form.airport_surcharge);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease-out" }}
      />

      <div
        className="fixed inset-0 m-auto max-w-2xl max-h-[90vh] z-50 rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="p-6 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border-light)" }}
        >
          <div>
            <h2 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
              {form.id ? "Edit Vehicle Category & Pricing" : "Create New Vehicle Category"}
            </h2>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              Updates the real-time quote generation engine and customer transfer booking formulas
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--input-background)", color: "var(--text-tertiary)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Basic Details */}
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Category Name *"
              value={form.name}
              onChange={(val) => onChange("name", val)}
              placeholder="e.g. Standard Sedan, Luxury Van"
            />
            <FormInput
              label="URL Slug *"
              value={form.slug}
              onChange={(val) => onChange("slug", val)}
              placeholder="e.g. standard-sedan"
            />
          </div>

          {/* Capacities */}
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Passenger Capacity *"
              value={form.passenger_capacity}
              onChange={(val) => onChange("passenger_capacity", val)}
              type="number"
              placeholder="4"
            />
            <FormInput
              label="Luggage Capacity (Pieces) *"
              value={form.luggage_capacity}
              onChange={(val) => onChange("luggage_capacity", val)}
              type="number"
              placeholder="3"
            />
          </div>

          {/* Pricing Formula */}
          <div
            className="p-4 rounded-2xl space-y-4"
            style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-emerald-400">
                Distance & Fare Pricing Formula (USD)
              </span>
              <span className="text-[11px] text-slate-400">Currency: {form.currency}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormInput
                label="Base Starting Fare ($)"
                value={form.base_fare}
                onChange={(val) => onChange("base_fare", val)}
                type="number"
                placeholder="15.00"
              />
              <FormInput
                label="Price per KM ($) *"
                value={form.price_per_km}
                onChange={(val) => onChange("price_per_km", val)}
                type="number"
                placeholder="0.85"
              />
              <FormInput
                label="Minimum Trip Fare ($)"
                value={form.minimum_fare}
                onChange={(val) => onChange("minimum_fare", val)}
                type="number"
                placeholder="25.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <FormInput
                label="Airport Pickup Surcharge ($)"
                value={form.airport_surcharge}
                onChange={(val) => onChange("airport_surcharge", val)}
                type="number"
                placeholder="10.00"
              />
              <FormInput
                label="Night Surcharge ($)"
                value={form.night_surcharge}
                onChange={(val) => onChange("night_surcharge", val)}
                type="number"
                placeholder="15.00"
              />
            </div>

            {/* Live Estimate Simulation Box */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[12px] flex items-center justify-between">
              <span className="text-emerald-300">
                <strong>Simulated 40 km Airport Quote:</strong> Base (${toNumber(form.base_fare)}) + 40km (${(40 * toNumber(form.price_per_km)).toFixed(2)}) + Airport (${toNumber(form.airport_surcharge)})
              </span>
              <span className="font-extrabold text-[15px] text-emerald-400">
                ${Math.max(sampleFare, toNumber(form.minimum_fare)).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[12px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={2}
              placeholder="Comfortable air-conditioned sedan suitable for individuals and couples..."
              className="w-full px-3 py-2 rounded-xl text-[12px] outline-none resize-none"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Features */}
          <div>
            <label className="text-[12px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Vehicle Features (One per line)
            </label>
            <textarea
              value={form.features}
              onChange={(e) => onChange("features", e.target.value)}
              rows={3}
              placeholder="Air Conditioning&#10;Bottled Water&#10;WiFi Hotspot&#10;Luggage Space"
              className="w-full px-3 py-2 rounded-xl text-[12px] outline-none resize-none font-mono"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Active Checkbox */}
          <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer" style={{ background: "var(--input-background)" }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => onChange("is_active", e.target.checked)}
              className="w-4 h-4 rounded text-blue-600"
            />
            <div>
              <span className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                Active & Available for Customer Quotes
              </span>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                When checked, customers can select this vehicle category when booking transfers.
              </p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div
          className="p-5 flex items-center justify-end gap-3"
          style={{ borderTop: "1px solid var(--border-light)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all"
            style={{ background: "var(--input-background)", color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving || !form.name.trim()}
            className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
              border: "1px solid var(--border-accent)",
            }}
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Category
          </button>
        </div>
      </div>
    </>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2 rounded-xl text-[13px] outline-none transition-all"
        style={{
          background: "var(--input-background)",
          border: "1px solid var(--border-light)",
          color: "var(--text-primary)",
        }}
      />
    </div>
  );
}

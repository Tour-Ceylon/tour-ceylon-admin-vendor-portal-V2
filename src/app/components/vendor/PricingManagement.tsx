import { useState } from "react";
import {
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Tag,
  Percent,
  Clock,
  ChevronDown,
} from "lucide-react";

interface PricingTier {
  id: string;
  listingName: string;
  category: string;
  variantName: string;
  basePrice: number;
  currency: string;
  unit: string;
  minCapacity: number;
  maxCapacity: number;
  seasonalPricing: boolean;
  discounts: number;
  status: "active" | "inactive";
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: "price_001",
    listingName: "Yala National Park Safari",
    category: "Safari",
    variantName: "Standard Safari",
    basePrice: 85,
    currency: "USD",
    unit: "Per Person",
    minCapacity: 2,
    maxCapacity: 6,
    seasonalPricing: true,
    discounts: 2,
    status: "active",
  },
  {
    id: "price_002",
    listingName: "Yala National Park Safari",
    category: "Safari",
    variantName: "Private Safari",
    basePrice: 380,
    currency: "USD",
    unit: "Per Group",
    minCapacity: 1,
    maxCapacity: 6,
    seasonalPricing: true,
    discounts: 1,
    status: "active",
  },
  {
    id: "price_003",
    listingName: "Yala National Park Safari",
    category: "Safari",
    variantName: "Premium Sunrise",
    basePrice: 120,
    currency: "USD",
    unit: "Per Person",
    minCapacity: 2,
    maxCapacity: 4,
    seasonalPricing: false,
    discounts: 0,
    status: "active",
  },
  {
    id: "price_004",
    listingName: "Minneriya Wildlife Safari",
    category: "Safari",
    variantName: "Group Tour",
    basePrice: 65,
    currency: "USD",
    unit: "Per Person",
    minCapacity: 4,
    maxCapacity: 8,
    seasonalPricing: true,
    discounts: 3,
    status: "active",
  },
  {
    id: "price_005",
    listingName: "Galle Fort Heritage Walk",
    category: "Tour",
    variantName: "Standard Tour",
    basePrice: 45,
    currency: "USD",
    unit: "Per Person",
    minCapacity: 2,
    maxCapacity: 15,
    seasonalPricing: false,
    discounts: 1,
    status: "active",
  },
];

interface SeasonalRate {
  id: string;
  season: string;
  dateRange: string;
  priceMultiplier: number;
  status: "active" | "upcoming" | "expired";
}

const SEASONAL_RATES: SeasonalRate[] = [
  {
    id: "season_001",
    season: "Peak Season",
    dateRange: "Dec 15 - Jan 31",
    priceMultiplier: 1.3,
    status: "upcoming",
  },
  {
    id: "season_002",
    season: "High Season",
    dateRange: "Feb 1 - Apr 30",
    priceMultiplier: 1.15,
    status: "active",
  },
  {
    id: "season_003",
    season: "Low Season",
    dateRange: "May 1 - Sep 30",
    priceMultiplier: 0.85,
    status: "upcoming",
  },
];

export function PricingManagement() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = PRICING_TIERS.filter(
    (tier) => selectedCategory === "all" || tier.category === selectedCategory
  );

  const stats = {
    totalVariants: PRICING_TIERS.length,
    avgPrice: 139,
    totalRevenue: "$12.4K",
    activeDiscounts: PRICING_TIERS.reduce((sum, tier) => sum + tier.discounts, 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Pricing Management
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Manage pricing variants, seasonal rates, and discounts
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] transition-all"
          style={{
            background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
            color: "white",
            boxShadow: "0 0 16px var(--border-accent)",
            border: "1px solid var(--border-accent)",
            fontWeight: 500,
          }}
        >
          <Plus size={14} />
          Create Pricing Tier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Pricing Variants",
            value: stats.totalVariants,
            icon: Tag,
            color: "#3b82f6",
            glow: "rgba(59,130,246,0.2)",
          },
          {
            label: "Avg. Price",
            value: `$${stats.avgPrice}`,
            icon: DollarSign,
            color: "#22c55e",
            glow: "rgba(34,197,94,0.15)",
          },
          {
            label: "Revenue (30d)",
            value: stats.totalRevenue,
            icon: TrendingUp,
            color: "#10b981",
            glow: "rgba(16,185,129,0.15)",
          },
          {
            label: "Active Discounts",
            value: stats.activeDiscounts,
            icon: Percent,
            color: "#f59e0b",
            glow: "rgba(245,158,11,0.15)",
          },
        ].map(({ label, value, icon: Icon, color, glow }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: glow }}
              >
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <p className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {value}
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Pricing Tiers & Seasonal Rates */}
      <div className="grid grid-cols-3 gap-6">
        {/* Pricing Tiers */}
        <div
          className="col-span-2 rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Pricing Tiers
            </h2>
            <div className="flex gap-1.5">
              {["all", "Safari", "Tour"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3 py-1 rounded-lg text-[11px] transition-all capitalize"
                  style={
                    selectedCategory === cat
                      ? {
                          background: "var(--active-overlay)",
                          color: "var(--accent-navy-light)",
                          border: "1px solid var(--border-accent)",
                        }
                      : {
                          color: "var(--text-tertiary)",
                          border: "1px solid var(--border-light)",
                        }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            {filtered.map((tier) => (
              <div
                key={tier.id}
                className="px-5 py-4 group cursor-pointer transition-all"
                style={{ borderBottom: "1px solid var(--border-light)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] mb-0.5 truncate" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {tier.listingName}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                      {tier.variantName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "var(--active-overlay)";
                        (e.currentTarget as HTMLElement).style.color = "var(--accent-navy-light)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
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
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <DollarSign size={12} style={{ color: "var(--success)" }} />
                    <span className="text-[13px]" style={{ color: "var(--success)", fontWeight: 600 }}>
                      ${tier.basePrice}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {tier.currency}
                    </span>
                  </div>
                  <div
                    className="w-px h-3"
                    style={{ background: "var(--border-light)" }}
                  />
                  <div className="flex items-center gap-1">
                    <Users size={11} style={{ color: "var(--text-tertiary)" }} />
                    <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      {tier.minCapacity}-{tier.maxCapacity}
                    </span>
                  </div>
                  <div
                    className="w-px h-3"
                    style={{ background: "var(--border-light)" }}
                  />
                  <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {tier.unit}
                  </span>

                  {tier.seasonalPricing && (
                    <>
                      <div
                        className="w-px h-3"
                        style={{ background: "var(--border-light)" }}
                      />
                      <div className="flex items-center gap-1">
                        <Calendar size={11} style={{ color: "var(--warning)" }} />
                        <span className="text-[10px]" style={{ color: "var(--warning)" }}>
                          Seasonal
                        </span>
                      </div>
                    </>
                  )}

                  {tier.discounts > 0 && (
                    <>
                      <div
                        className="w-px h-3"
                        style={{ background: "var(--border-light)" }}
                      />
                      <div className="flex items-center gap-1">
                        <Percent size={11} style={{ color: "var(--accent-navy-light)" }} />
                        <span className="text-[10px]" style={{ color: "var(--accent-navy-light)" }}>
                          {tier.discounts} discount{tier.discounts > 1 ? "s" : ""}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal Rates */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Seasonal Rates
            </h2>
            <button
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
              }}
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="p-5 space-y-3">
            {SEASONAL_RATES.map((rate) => (
              <div
                key={rate.id}
                className="rounded-lg p-3 transition-all cursor-pointer"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--input-background)";
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {rate.season}
                    </p>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Calendar size={10} style={{ color: "var(--text-tertiary)" }} />
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {rate.dateRange}
                      </p>
                    </div>
                  </div>
                  <div
                    className="px-2 py-0.5 rounded text-[10px]"
                    style={
                      rate.status === "active"
                        ? { background: "rgba(34,197,94,0.1)", color: "#4ade80" }
                        : rate.status === "upcoming"
                        ? { background: "rgba(245,158,11,0.1)", color: "#fbbf24" }
                        : { background: "rgba(100,116,139,0.1)", color: "#94a3b8" }
                    }
                  >
                    {rate.status}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {rate.priceMultiplier > 1 ? (
                    <TrendingUp size={14} style={{ color: "#22c55e" }} />
                  ) : (
                    <TrendingDown size={14} style={{ color: "#3b82f6" }} />
                  )}
                  <span
                    className="text-[14px]"
                    style={{
                      color: rate.priceMultiplier > 1 ? "#22c55e" : "#3b82f6",
                      fontWeight: 600,
                    }}
                  >
                    {rate.priceMultiplier > 1 ? "+" : ""}
                    {((rate.priceMultiplier - 1) * 100).toFixed(0)}%
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    price adjustment
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            title: "Bulk Price Update",
            description: "Update prices across multiple listings",
            icon: Tag,
            color: "#3b82f6",
          },
          {
            title: "Create Discount",
            description: "Set up promotional pricing",
            icon: Percent,
            color: "#f59e0b",
          },
          {
            title: "Revenue Report",
            description: "View pricing performance",
            icon: TrendingUp,
            color: "#22c55e",
          },
        ].map(({ title, description, icon: Icon, color }) => (
          <div
            key={title}
            className="rounded-xl p-5 cursor-pointer transition-all"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)";
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${color}20` }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <h3 className="text-[14px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {title}
            </h3>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

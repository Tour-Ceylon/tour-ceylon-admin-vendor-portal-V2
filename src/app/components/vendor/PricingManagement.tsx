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
  X,
  Check,
  AlertTriangle,
  Search,
  Filter,
  Save,
  Eye,
} from "lucide-react";
import { vendorMockData } from "../../services/vendorMockData";

interface PricingTier {
  id: string;
  listingId: string;
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

interface SeasonalRate {
  id: string;
  season: string;
  startDate: string;
  endDate: string;
  adjustmentType: "percentage" | "fixed";
  adjustmentValue: number;
  appliesTo: "all" | "selected";
  selectedListings: string[];
  status: "active" | "upcoming" | "expired";
}

interface Discount {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  startDate: string;
  endDate: string;
  appliesTo: "listing" | "category";
  targetId: string;
  targetName: string;
  status: "active" | "upcoming" | "expired";
}

const INITIAL_PRICING_TIERS: PricingTier[] = [
  {
    id: "price_001",
    listingId: "lst_001",
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
    listingId: "lst_001",
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
    listingId: "lst_002",
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
    id: "price_004",
    listingId: "lst_003",
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

const INITIAL_SEASONAL_RATES: SeasonalRate[] = [
  {
    id: "season_001",
    season: "Peak Season",
    startDate: "2024-12-15",
    endDate: "2025-01-31",
    adjustmentType: "percentage",
    adjustmentValue: 30,
    appliesTo: "all",
    selectedListings: [],
    status: "upcoming",
  },
  {
    id: "season_002",
    season: "High Season",
    startDate: "2024-02-01",
    endDate: "2024-04-30",
    adjustmentType: "percentage",
    adjustmentValue: 15,
    appliesTo: "all",
    selectedListings: [],
    status: "active",
  },
  {
    id: "season_003",
    season: "Low Season",
    startDate: "2024-05-01",
    endDate: "2024-09-30",
    adjustmentType: "percentage",
    adjustmentValue: -15,
    appliesTo: "all",
    selectedListings: [],
    status: "upcoming",
  },
];

const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: "disc_001",
    name: "Early Bird Special",
    type: "percentage",
    value: 10,
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    appliesTo: "category",
    targetId: "Safari",
    targetName: "Safari",
    status: "active",
  },
  {
    id: "disc_002",
    name: "Group Discount",
    type: "fixed",
    value: 50,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    appliesTo: "listing",
    targetId: "lst_001",
    targetName: "Yala National Park Safari",
    status: "active",
  },
];

const CURRENCIES = ["USD", "EUR", "GBP", "LKR", "AUD", "SGD"];
const PRICING_UNITS = ["Per Person", "Per Group", "Per Vehicle", "Per Night", "Per Hour", "Per Trip"];

// Success Toast Component
function SuccessToast({ message, isVisible, onClose }: { 
  message: string; 
  isVisible: boolean; 
  onClose: () => void; 
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid rgba(34,197,94,0.3)",
          boxShadow: "0 0 20px rgba(34,197,94,0.1)",
        }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: "rgba(34,197,94,0.1)" }}
        >
          <Check size={14} style={{ color: "#22c55e" }} />
        </div>
        <span className="text-[13px]" style={{ color: "var(--text-primary)" }}>
          {message}
        </span>
        <button onClick={onClose}>
          <X size={14} style={{ color: "var(--text-tertiary)" }} />
        </button>
      </div>
    </div>
  );
}

// Pricing Tier Modal
function PricingTierModal({ 
  isOpen, 
  onClose, 
  tier, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  tier?: PricingTier; 
  onSave: (tier: PricingTier) => void; 
}) {
  const [formData, setFormData] = useState<Partial<PricingTier>>(
    tier || {
      listingId: "",
      listingName: "",
      category: "Safari",
      variantName: "",
      basePrice: 0,
      currency: "USD",
      unit: "Per Person",
      minCapacity: 1,
      maxCapacity: 10,
      seasonalPricing: false,
      discounts: 0,
      status: "active",
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const listings = vendorMockData.getVendorListings();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.listingId) newErrors.listingId = "Please select a listing";
    if (!formData.variantName?.trim()) newErrors.variantName = "Variant name is required";
    if (!formData.basePrice || formData.basePrice <= 0) newErrors.basePrice = "Base price must be greater than 0";
    if (!formData.minCapacity || formData.minCapacity < 1) newErrors.minCapacity = "Minimum capacity must be at least 1";
    if (!formData.maxCapacity || formData.maxCapacity < formData.minCapacity!) newErrors.maxCapacity = "Maximum capacity must be greater than minimum";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const selectedListing = listings.find(l => l.id === formData.listingId);
    const newTier: PricingTier = {
      id: tier?.id || `price_${Date.now()}`,
      listingId: formData.listingId!,
      listingName: selectedListing?.title || formData.listingName!,
      category: selectedListing?.category || formData.category!,
      variantName: formData.variantName!,
      basePrice: formData.basePrice!,
      currency: formData.currency!,
      unit: formData.unit!,
      minCapacity: formData.minCapacity!,
      maxCapacity: formData.maxCapacity!,
      seasonalPricing: formData.seasonalPricing!,
      discounts: formData.discounts!,
      status: formData.status!,
    };

    onSave(newTier);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {tier ? "Edit Pricing Tier" : "Create Pricing Tier"}
          </h2>
          <button onClick={onClose}>
            <X size={20} style={{ color: "var(--text-tertiary)" }} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Listing <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <select
                value={formData.listingId}
                onChange={(e) => {
                  const selectedListing = listings.find(l => l.id === e.target.value);
                  setFormData({ 
                    ...formData, 
                    listingId: e.target.value,
                    listingName: selectedListing?.title || "",
                    category: selectedListing?.category || "Safari"
                  });
                }}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: errors.listingId ? "1px solid var(--error)" : "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Select listing...</option>
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.title}
                  </option>
                ))}
              </select>
              {errors.listingId && (
                <p className="text-[11px] mt-1" style={{ color: "var(--error)" }}>
                  {errors.listingId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Variant Name <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.variantName}
                onChange={(e) => setFormData({ ...formData, variantName: e.target.value })}
                placeholder="e.g. Standard Safari"
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: errors.variantName ? "1px solid var(--error)" : "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
              {errors.variantName && (
                <p className="text-[11px] mt-1" style={{ color: "var(--error)" }}>
                  {errors.variantName}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Base Price <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: errors.basePrice ? "1px solid var(--error)" : "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
              {errors.basePrice && (
                <p className="text-[11px] mt-1" style={{ color: "var(--error)" }}>
                  {errors.basePrice}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Pricing Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                {PRICING_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Min Capacity <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <input
                type="number"
                value={formData.minCapacity}
                onChange={(e) => setFormData({ ...formData, minCapacity: Number(e.target.value) })}
                placeholder="1"
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: errors.minCapacity ? "1px solid var(--error)" : "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
              {errors.minCapacity && (
                <p className="text-[11px] mt-1" style={{ color: "var(--error)" }}>
                  {errors.minCapacity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Max Capacity <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <input
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                placeholder="10"
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: errors.maxCapacity ? "1px solid var(--error)" : "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
              {errors.maxCapacity && (
                <p className="text-[11px] mt-1" style={{ color: "var(--error)" }}>
                  {errors.maxCapacity}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.seasonalPricing}
                onChange={(e) => setFormData({ ...formData, seasonalPricing: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                Enable seasonal pricing
              </span>
            </label>

            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                className="px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{
              background: "var(--input-background)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-light)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{
              background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
              color: "white",
              border: "1px solid var(--border-accent)",
            }}
          >
            {tier ? "Update Tier" : "Create Tier"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Seasonal Rate Modal
function SeasonalRateModal({ 
  isOpen, 
  onClose, 
  rate, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  rate?: SeasonalRate; 
  onSave: (rate: SeasonalRate) => void; 
}) {
  const [formData, setFormData] = useState<Partial<SeasonalRate>>(
    rate || {
      season: "",
      startDate: "",
      endDate: "",
      adjustmentType: "percentage",
      adjustmentValue: 0,
      appliesTo: "all",
      selectedListings: [],
      status: "upcoming",
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.season?.trim()) newErrors.season = "Season name is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = "End date must be after start date";
    }
    if (formData.adjustmentValue === undefined || formData.adjustmentValue === 0) {
      newErrors.adjustmentValue = "Adjustment value is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const newRate: SeasonalRate = {
      id: rate?.id || `season_${Date.now()}`,
      season: formData.season!,
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      adjustmentType: formData.adjustmentType!,
      adjustmentValue: formData.adjustmentValue!,
      appliesTo: formData.appliesTo!,
      selectedListings: formData.selectedListings!,
      status: formData.status!,
    };

    onSave(newRate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative rounded-xl p-6 max-w-lg w-full mx-4"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {rate ? "Edit Seasonal Rate" : "Add Seasonal Rate"}
          </h2>
          <button onClick={onClose}>
            <X size={20} style={{ color: "var(--text-tertiary)" }} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
              Season Name <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              placeholder="e.g. Peak Season"
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
              style={{
                background: "var(--input-background)",
                border: errors.season ? "1px solid var(--error)" : "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            />
            {errors.season && (
              <p className="text-[11px] mt-1" style={{ color: "var(--error)" }}>
                {errors.season}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Start Date <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: errors.startDate ? "1px solid var(--error)" : "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
              {errors.startDate && (
                <p className="text-[11px] mt-1" style={{ color: "var(--error)" }}>
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                End Date <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: errors.endDate ? "1px solid var(--error)" : "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
              {errors.endDate && (
                <p className="text-[11px] mt-1" style={{ color: "var(--error)" }}>
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Adjustment Type
              </label>
              <select
                value={formData.adjustmentType}
                onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value as "percentage" | "fixed" })}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Adjustment Value <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <input
                type="number"
                value={formData.adjustmentValue}
                onChange={(e) => setFormData({ ...formData, adjustmentValue: Number(e.target.value) })}
                placeholder={formData.adjustmentType === "percentage" ? "15" : "50"}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: errors.adjustmentValue ? "1px solid var(--error)" : "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
              {errors.adjustmentValue && (
                <p className="text-[11px] mt-1" style={{ color: "var(--error)" }}>
                  {errors.adjustmentValue}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
              Applies To
            </label>
            <select
              value={formData.appliesTo}
              onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value as "all" | "selected" })}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            >
              <option value="all">All Listings</option>
              <option value="selected">Selected Listings</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{
              background: "var(--input-background)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-light)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{
              background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
              color: "white",
              border: "1px solid var(--border-accent)",
            }}
          >
            {rate ? "Update Rate" : "Add Rate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative rounded-xl p-6 max-w-md w-full mx-4"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.1)" }}
          >
            <AlertTriangle size={18} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold" style={{ color: "var(--text-primary)" }}>
              {title}
            </h3>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              This action cannot be undone
            </p>
          </div>
        </div>
        
        <p className="text-[13px] mb-6" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{
              background: "var(--input-background)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-light)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{
              background: "#ef4444",
              color: "white",
              border: "1px solid #ef4444",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Pricing Preview Component
function PricingPreview({ 
  basePrice, 
  currency, 
  seasonalRates, 
  discounts 
}: { 
  basePrice: number; 
  currency: string; 
  seasonalRates: SeasonalRate[]; 
  discounts: Discount[]; 
}) {
  const activeSeasonalRate = seasonalRates.find(r => r.status === "active");
  const activeDiscount = discounts.find(d => d.status === "active");

  let finalPrice = basePrice;
  let adjustments = [];

  if (activeSeasonalRate) {
    if (activeSeasonalRate.adjustmentType === "percentage") {
      const adjustment = (basePrice * activeSeasonalRate.adjustmentValue) / 100;
      finalPrice += adjustment;
      adjustments.push({
        type: "seasonal",
        name: activeSeasonalRate.season,
        value: activeSeasonalRate.adjustmentValue > 0 ? `+${activeSeasonalRate.adjustmentValue}%` : `${activeSeasonalRate.adjustmentValue}%`,
        amount: adjustment,
      });
    } else {
      finalPrice += activeSeasonalRate.adjustmentValue;
      adjustments.push({
        type: "seasonal",
        name: activeSeasonalRate.season,
        value: activeSeasonalRate.adjustmentValue > 0 ? `+${currency} ${activeSeasonalRate.adjustmentValue}` : `${currency} ${activeSeasonalRate.adjustmentValue}`,
        amount: activeSeasonalRate.adjustmentValue,
      });
    }
  }

  if (activeDiscount) {
    if (activeDiscount.type === "percentage") {
      const discount = (finalPrice * activeDiscount.value) / 100;
      finalPrice -= discount;
      adjustments.push({
        type: "discount",
        name: activeDiscount.name,
        value: `-${activeDiscount.value}%`,
        amount: -discount,
      });
    } else {
      finalPrice -= activeDiscount.value;
      adjustments.push({
        type: "discount",
        name: activeDiscount.name,
        value: `-${currency} ${activeDiscount.value}`,
        amount: -activeDiscount.value,
      });
    }
  }

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--bg-panel)",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <h3 className="text-[14px] mb-3" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
        Pricing Preview
      </h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>Base Price</span>
          <span className="text-[12px]" style={{ color: "var(--text-primary)" }}>
            {currency} {basePrice.toFixed(2)}
          </span>
        </div>
        
        {adjustments.map((adj, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              {adj.name} ({adj.value})
            </span>
            <span 
              className="text-[11px]" 
              style={{ 
                color: adj.type === "discount" ? "#22c55e" : adj.amount > 0 ? "#ef4444" : "#22c55e" 
              }}
            >
              {adj.amount > 0 ? "+" : ""}{currency} {Math.abs(adj.amount).toFixed(2)}
            </span>
          </div>
        ))}
        
        <div 
          className="flex justify-between pt-2" 
          style={{ borderTop: "1px solid var(--border-light)" }}
        >
          <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Final Price
          </span>
          <span className="text-[13px]" style={{ color: "var(--success)", fontWeight: 700 }}>
            {currency} {finalPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PricingManagement() {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(INITIAL_PRICING_TIERS);
  const [seasonalRates, setSeasonalRates] = useState<SeasonalRate[]>(INITIAL_SEASONAL_RATES);
  const [discounts, setDiscounts] = useState<Discount[]>(INITIAL_DISCOUNTS);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showTierModal, setShowTierModal] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [editingTier, setEditingTier] = useState<PricingTier | undefined>();
  const [editingSeason, setEditingSeason] = useState<SeasonalRate | undefined>();
  const [deletingItem, setDeletingItem] = useState<{ type: string; id: string; name: string } | null>(null);
  
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter pricing tiers
  const filteredTiers = pricingTiers.filter((tier) => {
    const matchCategory = selectedCategory === "all" || tier.category === selectedCategory;
    const matchSearch = !searchTerm || 
      tier.listingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tier.variantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tier.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchCategory && matchSearch;
  });

  // Calculate stats
  const stats = {
    totalVariants: pricingTiers.length,
    avgPrice: Math.round(pricingTiers.reduce((sum, tier) => sum + tier.basePrice, 0) / pricingTiers.length),
    totalRevenue: "$12.4K",
    activeDiscounts: discounts.filter(d => d.status === "active").length,
  };

  // Success toast helper
  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Pricing tier handlers
  const handleCreateTier = () => {
    setEditingTier(undefined);
    setShowTierModal(true);
  };

  const handleEditTier = (tier: PricingTier) => {
    setEditingTier(tier);
    setShowTierModal(true);
  };

  const handleSaveTier = (tier: PricingTier) => {
    if (editingTier) {
      setPricingTiers(prev => prev.map(t => t.id === tier.id ? tier : t));
      showSuccessToast("Pricing tier updated successfully");
    } else {
      setPricingTiers(prev => [tier, ...prev]);
      showSuccessToast("Pricing tier created successfully");
    }
  };

  const handleDeleteTier = (tier: PricingTier) => {
    setDeletingItem({ type: "tier", id: tier.id, name: tier.variantName });
    setShowDeleteModal(true);
  };

  const handleToggleTierStatus = (id: string) => {
    setPricingTiers(prev => prev.map(tier => 
      tier.id === id 
        ? { ...tier, status: tier.status === "active" ? "inactive" : "active" }
        : tier
    ));
    showSuccessToast("Pricing tier status updated");
  };

  // Seasonal rate handlers
  const handleCreateSeason = () => {
    setEditingSeason(undefined);
    setShowSeasonModal(true);
  };

  const handleEditSeason = (season: SeasonalRate) => {
    setEditingSeason(season);
    setShowSeasonModal(true);
  };

  const handleSaveSeason = (season: SeasonalRate) => {
    if (editingSeason) {
      setSeasonalRates(prev => prev.map(s => s.id === season.id ? season : s));
      showSuccessToast("Seasonal rate updated successfully");
    } else {
      setSeasonalRates(prev => [season, ...prev]);
      showSuccessToast("Seasonal rate added successfully");
    }
  };

  const handleDeleteSeason = (season: SeasonalRate) => {
    setDeletingItem({ type: "season", id: season.id, name: season.season });
    setShowDeleteModal(true);
  };

  // Delete confirmation handler
  const handleConfirmDelete = () => {
    if (!deletingItem) return;

    if (deletingItem.type === "tier") {
      setPricingTiers(prev => prev.filter(t => t.id !== deletingItem.id));
      showSuccessToast("Pricing tier deleted successfully");
    } else if (deletingItem.type === "season") {
      setSeasonalRates(prev => prev.filter(s => s.id !== deletingItem.id));
      showSuccessToast("Seasonal rate deleted successfully");
    }

    setShowDeleteModal(false);
    setDeletingItem(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Success Toast */}
      <SuccessToast
        message={successMessage}
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

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
          onClick={handleCreateTier}
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

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2 px-3 h-9 rounded-lg flex-1 max-w-md"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
          }}
        >
          <Search size={14} style={{ color: "var(--text-tertiary)" }} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pricing tiers..."
            className="flex-1 bg-transparent outline-none text-[13px]"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        <div className="flex gap-2">
          {["all", "Safari", "Tour", "Stay", "Experience", "Transfer"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-3 py-1.5 rounded-lg text-[12px] transition-all capitalize"
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

      {/* Main Content */}
      <div className="grid grid-cols-4 gap-6">
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
              Pricing Tiers ({filteredTiers.length})
            </h2>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredTiers.map((tier) => (
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
                  <div className="flex items-center gap-1 ml-3">
                    <button
                      onClick={() => handleToggleTierStatus(tier.id)}
                      className={`opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all text-[10px] ${
                        tier.status === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tier.status === "active" ? "ON" : "OFF"}
                    </button>
                    <button
                      onClick={() => handleEditTier(tier)}
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
                      onClick={() => handleDeleteTier(tier)}
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
              onClick={handleCreateSeason}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
              }}
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
            {seasonalRates.map((rate) => (
              <div
                key={rate.id}
                className="rounded-lg p-3 transition-all cursor-pointer group"
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
                        {new Date(rate.startDate).toLocaleDateString()} - {new Date(rate.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleEditSeason(rate)}
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      onClick={() => handleDeleteSeason(rate)}
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ color: "#ef4444" }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                  <div
                    className="px-2 py-0.5 rounded text-[10px] ml-2"
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
                  {rate.adjustmentValue > 0 ? (
                    <TrendingUp size={14} style={{ color: "#22c55e" }} />
                  ) : (
                    <TrendingDown size={14} style={{ color: "#3b82f6" }} />
                  )}
                  <span
                    className="text-[14px]"
                    style={{
                      color: rate.adjustmentValue > 0 ? "#22c55e" : "#3b82f6",
                      fontWeight: 600,
                    }}
                  >
                    {rate.adjustmentValue > 0 ? "+" : ""}{rate.adjustmentValue}
                    {rate.adjustmentType === "percentage" ? "%" : " USD"}
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    adjustment
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Preview */}
        <PricingPreview
          basePrice={85}
          currency="USD"
          seasonalRates={seasonalRates}
          discounts={discounts}
        />
      </div>

      {/* Modals */}
      <PricingTierModal
        isOpen={showTierModal}
        onClose={() => setShowTierModal(false)}
        tier={editingTier}
        onSave={handleSaveTier}
      />

      <SeasonalRateModal
        isOpen={showSeasonModal}
        onClose={() => setShowSeasonModal(false)}
        rate={editingSeason}
        onSave={handleSaveSeason}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deletingItem?.type === "tier" ? "Pricing Tier" : "Seasonal Rate"}`}
        message={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
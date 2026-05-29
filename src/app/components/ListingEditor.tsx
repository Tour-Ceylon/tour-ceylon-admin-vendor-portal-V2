import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Info,
  MapPin,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Shield,
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  Send,
  X,
  AlertTriangle,
  Check,
  Upload,
  Trash2,
  Star,
  Plus,
  Building2,
  Compass,
  Globe,
  Anchor,
  Car,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";
import { vendorMockData, VendorListing } from "../services/vendorMockData";
import { useAuth } from "../contexts/AuthContext";
import { getAccessibleCategories, canCreateListing, isAdmin, validateCategoryAccess } from "../utils/permissions";

type ListingMode = "create" | "edit";
type Category = "Stay" | "Tour" | "Safari" | "Experience" | "Transfer";
type Step = "basic" | "destination" | "media" | "pricing" | "category" | "policies";

interface ListingEditorProps {
  mode: ListingMode;
}

interface FormData {
  // Basic Info
  title: string;
  category: Category;
  shortDescription: string;
  fullDescription: string;
  status: "draft" | "pending_review";
  
  // Destination
  country: string;
  city: string;
  address: string;
  coordinates: { lat: string; lng: string };
  nearbyAttractions: string[];
  
  // Media
  images: { id: string; url: string; isFeatured: boolean }[];
  
  // Pricing
  basePrice: string;
  currency: string;
  pricingType: string;
  
  // Category-specific fields
  categoryDetails: Record<string, any>;
  
  // Policies
  cancellationPolicy: string;
  paymentTerms: string;
  houseRules: string;
}

const STEPS: { id: Step; label: string; icon: React.ComponentType<any> }[] = [
  { id: "basic", label: "Basic Info", icon: Info },
  { id: "destination", label: "Location", icon: MapPin },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "category", label: "Details", icon: Tag },
  { id: "policies", label: "Policies", icon: Shield },
];

const CATEGORIES: { id: Category; label: string; icon: React.ComponentType<any> }[] = [
  { id: "Stay", label: "Stay", icon: Building2 },
  { id: "Tour", label: "Tour", icon: Compass },
  { id: "Safari", label: "Safari", icon: Globe },
  { id: "Experience", label: "Experience", icon: Anchor },
  { id: "Transfer", label: "Transfer", icon: Car },
];

const CURRENCIES = ["USD", "EUR", "GBP", "LKR", "AUD", "SGD"];
const PRICING_TYPES = ["Per Person", "Per Group", "Per Vehicle", "Per Night", "Per Hour"];

// Unsaved Changes Warning Modal
function UnsavedChangesModal({ 
  isOpen, 
  onClose, 
  onDiscard, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onDiscard: () => void; 
  onSave: () => void; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative bg-white rounded-xl p-6 max-w-md w-full mx-4"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.1)" }}
          >
            <AlertTriangle size={18} style={{ color: "#f59e0b" }} />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold" style={{ color: "var(--text-primary)" }}>
              Unsaved Changes
            </h3>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              You have unsaved changes
            </p>
          </div>
        </div>
        
        <p className="text-[13px] mb-6" style={{ color: "var(--text-secondary)" }}>
          You have unsaved changes that will be lost if you leave this page. What would you like to do?
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onDiscard}
            className="flex-1 px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{
              background: "var(--input-background)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-light)",
            }}
          >
            Discard Changes
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{
              background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
              color: "white",
              border: "1px solid var(--border-accent)",
            }}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// Form Components
function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
        {label}
        {required && <span style={{ color: "var(--error)" }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-all"
        style={{
          background: "var(--input-background)",
          border: error ? "1px solid var(--error)" : "1px solid var(--border-light)",
          color: "var(--text-primary)",
        }}
        onFocus={(e) => {
          if (!error) {
            (e.currentTarget as HTMLElement).style.border = "1px solid var(--border-accent)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-navy-subtle)";
          }
        }}
        onBlur={(e) => {
          if (!error) {
            (e.currentTarget as HTMLElement).style.border = "1px solid var(--border-light)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }
        }}
      />
      {error && (
        <p className="text-[11px] mt-1" style={{ color: "var(--error)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  error,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  error?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
        {label}
        {required && <span style={{ color: "var(--error)" }}> *</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-all resize-none"
        style={{
          background: "var(--input-background)",
          border: error ? "1px solid var(--error)" : "1px solid var(--border-light)",
          color: "var(--text-primary)",
        }}
        onFocus={(e) => {
          if (!error) {
            (e.currentTarget as HTMLElement).style.border = "1px solid var(--border-accent)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-navy-subtle)";
          }
        }}
        onBlur={(e) => {
          if (!error) {
            (e.currentTarget as HTMLElement).style.border = "1px solid var(--border-light)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }
        }}
      />
      {maxLength && (
        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
          {value.length} / {maxLength} characters
        </p>
      )}
      {error && (
        <p className="text-[11px] mt-1" style={{ color: "var(--error)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
        {label}
        {required && <span style={{ color: "var(--error)" }}> *</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-[13px] outline-none appearance-none transition-all"
        style={{
          background: "var(--input-background)",
          border: error ? "1px solid var(--error)" : "1px solid var(--border-light)",
          color: "var(--text-primary)",
        }}
      >
        <option value="">Select {label.toLowerCase()}...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-[11px] mt-1" style={{ color: "var(--error)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// Step Components
function BasicInfoStep({ formData, setFormData, errors, accessibleCategories }: { 
  formData: FormData; 
  setFormData: (data: FormData) => void; 
  errors: Record<string, string>;
  accessibleCategories: string[];
}) {
  // Filter categories based on user permissions
  const availableCategories = CATEGORIES.filter(cat => 
    accessibleCategories.includes(cat.id)
  );

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
        }}
      >
        <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Basic Information
        </h3>
        
        <div className="space-y-4">
          <FormInput
            label="Listing Title"
            value={formData.title}
            onChange={(v) => setFormData({ ...formData, title: v })}
            placeholder="e.g. Yala National Park Safari"
            required
            error={errors.title}
          />
          
          <div>
            <label className="block text-[12px] mb-2" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
              Category <span style={{ color: "var(--error)" }}>*</span>
            </label>
            {availableCategories.length > 0 ? (
              <div className={`grid gap-3 ${availableCategories.length <= 3 ? 'grid-cols-3' : 'grid-cols-5'}`}>
                {availableCategories.map((cat) => {
                  const isSelected = formData.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all"
                      style={
                        isSelected
                          ? {
                              background: "var(--active-overlay)",
                              color: "var(--accent-navy-light)",
                              border: "1px solid var(--border-accent)",
                            }
                          : {
                              background: "var(--input-background)",
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border-light)",
                            }
                      }
                    >
                      <cat.icon size={18} />
                      <span className="text-[11px] font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div 
                className="p-4 rounded-lg text-center"
                style={{ 
                  background: "rgba(239,68,68,0.05)", 
                  border: "1px solid rgba(239,68,68,0.2)" 
                }}
              >
                <p className="text-[13px]" style={{ color: "#dc2626" }}>
                  No categories available for your account type.
                </p>
                <p className="text-[11px] mt-1" style={{ color: "#7f1d1d" }}>
                  Contact support to request access to listing categories.
                </p>
              </div>
            )}
            {errors.category && (
              <p className="text-[11px] mt-1" style={{ color: "var(--error)" }}>
                {errors.category}
              </p>
            )}
          </div>
          
          <FormTextarea
            label="Short Description"
            value={formData.shortDescription}
            onChange={(v) => setFormData({ ...formData, shortDescription: v })}
            placeholder="Brief summary of your listing (1-2 sentences)"
            rows={2}
            maxLength={200}
            required
            error={errors.shortDescription}
          />
          
          <FormTextarea
            label="Full Description"
            value={formData.fullDescription}
            onChange={(v) => setFormData({ ...formData, fullDescription: v })}
            placeholder="Detailed description of your listing, what makes it special, what guests can expect..."
            rows={6}
            maxLength={2000}
            required
            error={errors.fullDescription}
          />
        </div>
      </div>
    </div>
  );
}

function DestinationStep({ formData, setFormData, errors }: { 
  formData: FormData; 
  setFormData: (data: FormData) => void; 
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
        }}
      >
        <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Location Details
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Country"
            value={formData.country}
            onChange={(v) => setFormData({ ...formData, country: v })}
            placeholder="e.g. Sri Lanka"
            required
            error={errors.country}
          />
          
          <FormInput
            label="City/Region"
            value={formData.city}
            onChange={(v) => setFormData({ ...formData, city: v })}
            placeholder="e.g. Yala, Southern Province"
            required
            error={errors.city}
          />
          
          <div className="col-span-2">
            <FormInput
              label="Address"
              value={formData.address}
              onChange={(v) => setFormData({ ...formData, address: v })}
              placeholder="Full address or location description"
              required
              error={errors.address}
            />
          </div>
          
          <FormInput
            label="Latitude (Optional)"
            value={formData.coordinates.lat}
            onChange={(v) => setFormData({ 
              ...formData, 
              coordinates: { ...formData.coordinates, lat: v }
            })}
            placeholder="e.g. 6.3728"
            type="number"
          />
          
          <FormInput
            label="Longitude (Optional)"
            value={formData.coordinates.lng}
            onChange={(v) => setFormData({ 
              ...formData, 
              coordinates: { ...formData.coordinates, lng: v }
            })}
            placeholder="e.g. 81.5156"
            type="number"
          />
        </div>
      </div>
      
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
        }}
      >
        <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Nearby Attractions (Optional)
        </h3>
        
        <div className="space-y-3">
          {formData.nearbyAttractions.map((attraction, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={attraction}
                onChange={(e) => {
                  const newAttractions = [...formData.nearbyAttractions];
                  newAttractions[index] = e.target.value;
                  setFormData({ ...formData, nearbyAttractions: newAttractions });
                }}
                placeholder="e.g. Yala National Park - 5 minutes"
                className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={() => {
                  const newAttractions = formData.nearbyAttractions.filter((_, i) => i !== index);
                  setFormData({ ...formData, nearbyAttractions: newAttractions });
                }}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                style={{ color: "var(--text-secondary)" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          
          <button
            onClick={() => {
              setFormData({ 
                ...formData, 
                nearbyAttractions: [...formData.nearbyAttractions, ""]
              });
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-all"
            style={{
              background: "var(--input-background)",
              color: "var(--text-secondary)",
              border: "1px dashed var(--border-light)",
            }}
          >
            <Plus size={12} />
            Add Nearby Attraction
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaStep({ formData, setFormData }: { 
  formData: FormData; 
  setFormData: (data: FormData) => void; 
}) {
  const addPlaceholderImage = () => {
    const newImage = {
      id: `img_${Date.now()}`,
      url: `https://picsum.photos/400/300?random=${Date.now()}`,
      isFeatured: formData.images.length === 0,
    };
    setFormData({ 
      ...formData, 
      images: [...formData.images, newImage]
    });
  };

  const removeImage = (id: string) => {
    const newImages = formData.images.filter(img => img.id !== id);
    // If we removed the featured image, make the first one featured
    if (newImages.length > 0 && !newImages.some(img => img.isFeatured)) {
      newImages[0].isFeatured = true;
    }
    setFormData({ ...formData, images: newImages });
  };

  const setFeatured = (id: string) => {
    const newImages = formData.images.map(img => ({
      ...img,
      isFeatured: img.id === id
    }));
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
        }}
      >
        <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Media Gallery
        </h3>
        
        {/* Upload Area */}
        <div
          className="rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer mb-5 transition-all"
          style={{
            height: 120,
            border: "2px dashed var(--border-accent)",
            background: "var(--accent-navy-subtle)",
          }}
          onClick={addPlaceholderImage}
        >
          <Upload size={20} style={{ color: "var(--text-tertiary)" }} />
          <div className="text-center">
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              Drop files here or <span style={{ color: "var(--accent-navy)" }}>click to upload</span>
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              PNG, JPG, WEBP up to 10MB each
            </p>
          </div>
        </div>
        
        {/* Image Grid */}
        {formData.images.length > 0 ? (
          <div className="grid grid-cols-4 gap-3">
            {formData.images.map((image) => (
              <div
                key={image.id}
                className="rounded-xl aspect-square relative overflow-hidden group"
                style={{ border: "1px solid var(--border-light)" }}
              >
                <img
                  src={image.url}
                  alt="Listing"
                  className="w-full h-full object-cover"
                />
                
                {image.isFeatured && (
                  <div
                    className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px]"
                    style={{ background: "var(--accent-navy)", color: "white" }}
                  >
                    Featured
                  </div>
                )}
                
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  {!image.isFeatured && (
                    <button
                      onClick={() => setFeatured(image.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.2)" }}
                    >
                      <Star size={12} className="text-white" />
                    </button>
                  )}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.3)" }}
                  >
                    <Trash2 size={12} style={{ color: "#f87171" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ImageIcon size={32} style={{ color: "var(--text-tertiary)", margin: "0 auto 12px" }} />
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              No images uploaded yet
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Add some photos to showcase your listing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PricingStep({ formData, setFormData, errors }: { 
  formData: FormData; 
  setFormData: (data: FormData) => void; 
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
        }}
      >
        <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Base Pricing
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <FormInput
            label="Base Price"
            value={formData.basePrice}
            onChange={(v) => setFormData({ ...formData, basePrice: v })}
            placeholder="0.00"
            type="number"
            required
            error={errors.basePrice}
          />
          
          <FormSelect
            label="Currency"
            value={formData.currency}
            onChange={(v) => setFormData({ ...formData, currency: v })}
            options={CURRENCIES}
            required
            error={errors.currency}
          />
          
          <FormSelect
            label="Pricing Type"
            value={formData.pricingType}
            onChange={(v) => setFormData({ ...formData, pricingType: v })}
            options={PRICING_TYPES}
            required
            error={errors.pricingType}
          />
        </div>
        
        <div className="mt-4 p-4 rounded-lg" style={{ background: "var(--accent-navy-subtle)" }}>
          <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            <strong>Preview:</strong> {formData.basePrice && formData.currency && formData.pricingType 
              ? `${formData.currency} ${formData.basePrice} ${formData.pricingType.toLowerCase()}`
              : "Enter pricing details to see preview"
            }
          </p>
        </div>
      </div>
    </div>
  );
}

function CategoryDetailsStep({ formData, setFormData }: { 
  formData: FormData; 
  setFormData: (data: FormData) => void; 
}) {
  if (!formData.category) {
    return (
      <div className="text-center py-12">
        <Tag size={32} style={{ color: "var(--text-tertiary)", margin: "0 auto 12px" }} />
        <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
          Please select a category first
        </p>
        <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          Go back to Basic Info to choose your listing category
        </p>
      </div>
    );
  }

  // Category-specific forms would go here
  // For now, showing a placeholder for each category
  const categoryContent = {
    Stay: (
      <div className="space-y-6">
        <div className="rounded-xl p-5" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
          <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Property Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Property Type"
              value={formData.categoryDetails.propertyType || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, propertyType: v }
              })}
              options={["Hotel", "Resort", "Villa", "Guesthouse", "Apartment", "Boutique Hotel"]}
            />
            <FormSelect
              label="Star Rating"
              value={formData.categoryDetails.starRating || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, starRating: v }
              })}
              options={["1", "2", "3", "4", "5"]}
            />
            <FormInput
              label="Check-in Time"
              value={formData.categoryDetails.checkinTime || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, checkinTime: v }
              })}
              type="time"
            />
            <FormInput
              label="Check-out Time"
              value={formData.categoryDetails.checkoutTime || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, checkoutTime: v }
              })}
              type="time"
            />
          </div>
        </div>
      </div>
    ),
    Tour: (
      <div className="space-y-6">
        <div className="rounded-xl p-5" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
          <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Tour Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Duration (hours)"
              value={formData.categoryDetails.duration || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, duration: v }
              })}
              type="number"
              placeholder="e.g. 4"
            />
            <FormInput
              label="Max Group Size"
              value={formData.categoryDetails.maxGroupSize || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, maxGroupSize: v }
              })}
              type="number"
              placeholder="e.g. 15"
            />
            <FormSelect
              label="Difficulty Level"
              value={formData.categoryDetails.difficulty || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, difficulty: v }
              })}
              options={["Easy", "Moderate", "Challenging"]}
            />
            <FormInput
              label="Meeting Point"
              value={formData.categoryDetails.meetingPoint || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, meetingPoint: v }
              })}
              placeholder="e.g. Hotel lobby"
            />
          </div>
        </div>
      </div>
    ),
    Safari: (
      <div className="space-y-6">
        <div className="rounded-xl p-5" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
          <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Safari Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="National Park"
              value={formData.categoryDetails.park || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, park: v }
              })}
              options={["Yala National Park", "Minneriya National Park", "Udawalawe National Park", "Wilpattu National Park"]}
            />
            <FormInput
              label="Duration (hours)"
              value={formData.categoryDetails.duration || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, duration: v }
              })}
              type="number"
              placeholder="e.g. 6"
            />
            <FormSelect
              label="Vehicle Type"
              value={formData.categoryDetails.vehicleType || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, vehicleType: v }
              })}
              options={["4WD Jeep", "Safari Vehicle", "Open-top Vehicle"]}
            />
            <FormInput
              label="Best Season"
              value={formData.categoryDetails.bestSeason || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, bestSeason: v }
              })}
              placeholder="e.g. Feb-Jul, Sep-Dec"
            />
          </div>
        </div>
      </div>
    ),
    Experience: (
      <div className="space-y-6">
        <div className="rounded-xl p-5" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
          <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Experience Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Activity Type"
              value={formData.categoryDetails.activityType || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, activityType: v }
              })}
              options={["Cultural", "Adventure", "Culinary", "Wellness", "Educational"]}
            />
            <FormInput
              label="Duration (hours)"
              value={formData.categoryDetails.duration || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, duration: v }
              })}
              type="number"
              placeholder="e.g. 3"
            />
            <FormSelect
              label="Difficulty Level"
              value={formData.categoryDetails.difficulty || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, difficulty: v }
              })}
              options={["Easy", "Moderate", "Challenging"]}
            />
            <FormInput
              label="Age Restrictions"
              value={formData.categoryDetails.ageRestrictions || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, ageRestrictions: v }
              })}
              placeholder="e.g. 12+"
            />
          </div>
        </div>
      </div>
    ),
    Transfer: (
      <div className="space-y-6">
        <div className="rounded-xl p-5" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
          <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Transfer Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Vehicle Category"
              value={formData.categoryDetails.vehicleCategory || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, vehicleCategory: v }
              })}
              options={["Economy", "Standard", "Premium", "Luxury", "Van", "Bus"]}
            />
            <FormInput
              label="Passenger Capacity"
              value={formData.categoryDetails.passengerCapacity || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, passengerCapacity: v }
              })}
              type="number"
              placeholder="e.g. 4"
            />
            <FormInput
              label="Luggage Capacity"
              value={formData.categoryDetails.luggageCapacity || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, luggageCapacity: v }
              })}
              placeholder="e.g. 2 large, 2 small"
            />
            <FormInput
              label="Price per KM"
              value={formData.categoryDetails.pricePerKm || ""}
              onChange={(v) => setFormData({ 
                ...formData, 
                categoryDetails: { ...formData.categoryDetails, pricePerKm: v }
              })}
              type="number"
              placeholder="e.g. 2.50"
            />
          </div>
        </div>
      </div>
    ),
  };

  return categoryContent[formData.category] || null;
}

function PoliciesStep({ formData, setFormData }: { 
  formData: FormData; 
  setFormData: (data: FormData) => void; 
}) {
  return (
    <div className="space-y-6">
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
        }}
      >
        <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Policies & Terms
        </h3>
        
        <div className="space-y-4">
          <FormTextarea
            label="Cancellation Policy"
            value={formData.cancellationPolicy}
            onChange={(v) => setFormData({ ...formData, cancellationPolicy: v })}
            placeholder="Describe your cancellation policy, refund terms, and any fees..."
            rows={3}
          />
          
          <FormTextarea
            label="Payment Terms"
            value={formData.paymentTerms}
            onChange={(v) => setFormData({ ...formData, paymentTerms: v })}
            placeholder="Payment methods accepted, deposit requirements, payment schedule..."
            rows={3}
          />
          
          <FormTextarea
            label="House Rules / Terms"
            value={formData.houseRules}
            onChange={(v) => setFormData({ ...formData, houseRules: v })}
            placeholder="Important rules, restrictions, or terms guests should know..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

export function ListingEditor({ mode }: ListingEditorProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { effectiveUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user permissions
  const userIsAdmin = isAdmin(effectiveUser);
  const accessibleCategories = getAccessibleCategories(effectiveUser);
  const canCreate = canCreateListing(effectiveUser);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "Safari",
    shortDescription: "",
    fullDescription: "",
    status: "draft",
    country: "Sri Lanka",
    city: "",
    address: "",
    coordinates: { lat: "", lng: "" },
    nearbyAttractions: [],
    images: [],
    basePrice: "",
    currency: "USD",
    pricingType: "Per Person",
    categoryDetails: {},
    cancellationPolicy: "",
    paymentTerms: "",
    houseRules: "",
  });

  // Load existing listing data in edit mode
  useEffect(() => {
    if (mode === "edit" && id) {
      const listings = vendorMockData.getVendorListings();
      const listing = listings.find(l => l.id === id);
      if (listing) {
        // Map existing listing data to form data
        setFormData({
          title: listing.title,
          category: listing.category,
          shortDescription: listing.title, // Use title as short description for now
          fullDescription: "Detailed description of " + listing.title,
          status: listing.status === "approved" ? "draft" : listing.status as "draft" | "pending_review",
          country: "Sri Lanka",
          city: listing.location,
          address: listing.destination,
          coordinates: { lat: "", lng: "" },
          nearbyAttractions: [],
          images: [],
          basePrice: "100",
          currency: "USD",
          pricingType: "Per Person",
          categoryDetails: {},
          cancellationPolicy: "",
          paymentTerms: "",
          houseRules: "",
        });
      }
    }
  }, [mode, id]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case "basic":
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.category) newErrors.category = "Category is required";
        if (!formData.shortDescription.trim()) newErrors.shortDescription = "Short description is required";
        if (!formData.fullDescription.trim()) newErrors.fullDescription = "Full description is required";
        break;
      case "destination":
        if (!formData.country.trim()) newErrors.country = "Country is required";
        if (!formData.city.trim()) newErrors.city = "City/Region is required";
        if (!formData.address.trim()) newErrors.address = "Address is required";
        break;
      case "pricing":
        if (!formData.basePrice.trim()) newErrors.basePrice = "Base price is required";
        if (!formData.currency) newErrors.currency = "Currency is required";
        if (!formData.pricingType) newErrors.pricingType = "Pricing type is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllSteps = (): boolean => {
    return validateStep("basic") && validateStep("destination") && validateStep("pricing");
  };

  const handleStepChange = (newStep: Step) => {
    if (validateStep(currentStep)) {
      setCurrentStep(newStep);
    }
  };

  const handleNext = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      handleStepChange(STEPS[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const handleSaveDraft = () => {
    // Save as draft - minimal validation
    console.log("Saving draft:", formData);
    setHasUnsavedChanges(false);
    // TODO: Save to backend/mock service
  };

  const handleSubmitForReview = () => {
    if (!validateAllSteps()) {
      // Find first step with errors and navigate to it
      if (errors.title || errors.category || errors.shortDescription || errors.fullDescription) {
        setCurrentStep("basic");
      } else if (errors.country || errors.city || errors.address) {
        setCurrentStep("destination");
      } else if (errors.basePrice || errors.currency || errors.pricingType) {
        setCurrentStep("pricing");
      }
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Submitting for review:", { ...formData, status: "pending_review" });
      setHasUnsavedChanges(false);
      setIsSubmitting(false);
      navigate("/listings");
    }, 1000);
  };

  const handlePreview = () => {
    console.log("Opening preview:", formData);
    // TODO: Open preview modal/drawer
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation("/listings");
      setShowUnsavedModal(true);
    } else {
      navigate("/listings");
    }
  };

  const handleUnsavedDiscard = () => {
    setShowUnsavedModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const handleUnsavedSave = () => {
    handleSaveDraft();
    setShowUnsavedModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const renderStepContent = () => {
    switch (currentStep) {
      case "basic":
        return <BasicInfoStep formData={formData} setFormData={setFormData} errors={errors} accessibleCategories={accessibleCategories} />;
      case "destination":
        return <DestinationStep formData={formData} setFormData={setFormData} errors={errors} />;
      case "media":
        return <MediaStep formData={formData} setFormData={setFormData} />;
      case "pricing":
        return <PricingStep formData={formData} setFormData={setFormData} errors={errors} />;
      case "category":
        return <CategoryDetailsStep formData={formData} setFormData={setFormData} />;
      case "policies":
        return <PoliciesStep formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-6 py-4"
        style={{
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {mode === "create" ? "Create New Listing" : "Edit Listing"}
            </h1>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {formData.title || "Complete all steps to publish your listing"}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-[13px] transition-all"
              style={{
                background: "var(--input-background)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-light)",
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] transition-all"
              style={{
                background: "var(--input-background)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-light)",
              }}
            >
              <Save size={14} />
              Save Draft
            </button>
            
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] transition-all"
              style={{
                background: "var(--active-overlay)",
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
              }}
            >
              <Eye size={14} />
              Preview
            </button>
            
            <button
              onClick={handleSubmitForReview}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] transition-all"
              style={{
                background: isSubmitting 
                  ? "var(--input-background)" 
                  : "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                color: isSubmitting ? "var(--text-tertiary)" : "white",
                border: "1px solid var(--border-accent)",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Submit for Review
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Steps */}
        <div
          className="w-64 p-6"
          style={{
            background: "var(--bg-elevated)",
            borderRight: "1px solid var(--border-light)",
            minHeight: "calc(100vh - 73px)",
          }}
        >
          <div className="space-y-2">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = index < currentStepIndex;
              const hasError = Object.keys(errors).some(key => {
                switch (step.id) {
                  case "basic":
                    return ["title", "category", "shortDescription", "fullDescription"].includes(key);
                  case "destination":
                    return ["country", "city", "address"].includes(key);
                  case "pricing":
                    return ["basePrice", "currency", "pricingType"].includes(key);
                  default:
                    return false;
                }
              });

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepChange(step.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                  style={
                    isActive
                      ? {
                          background: "var(--active-overlay)",
                          color: "var(--accent-navy-light)",
                          border: "1px solid var(--border-accent)",
                        }
                      : {
                          background: "transparent",
                          color: "var(--text-secondary)",
                          border: "1px solid transparent",
                        }
                  }
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={
                      isCompleted
                        ? { background: "var(--success)", color: "white" }
                        : hasError
                        ? { background: "rgba(239,68,68,0.1)", color: "#f87171" }
                        : isActive
                        ? { background: "var(--accent-navy)", color: "white" }
                        : { background: "var(--input-background)", color: "var(--text-tertiary)" }
                    }
                  >
                    {isCompleted ? (
                      <Check size={14} />
                    ) : hasError ? (
                      <AlertTriangle size={14} />
                    ) : (
                      <step.icon size={14} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium">{step.label}</p>
                    <p className="text-[11px] opacity-75">
                      Step {index + 1} of {STEPS.length}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            {renderStepContent()}
            
            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: "1px solid var(--border-light)" }}>
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] transition-all"
                style={{
                  background: isFirstStep ? "var(--input-background)" : "var(--active-overlay)",
                  color: isFirstStep ? "var(--text-tertiary)" : "var(--accent-navy-light)",
                  border: "1px solid var(--border-light)",
                  opacity: isFirstStep ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {STEPS.map((_, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: index <= currentStepIndex 
                        ? "var(--accent-navy)" 
                        : "var(--border-light)",
                    }}
                  />
                ))}
              </div>
              
              <button
                onClick={handleNext}
                disabled={isLastStep}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] transition-all"
                style={{
                  background: isLastStep ? "var(--input-background)" : "var(--active-overlay)",
                  color: isLastStep ? "var(--text-tertiary)" : "var(--accent-navy-light)",
                  border: "1px solid var(--border-light)",
                  opacity: isLastStep ? 0.5 : 1,
                }}
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onDiscard={handleUnsavedDiscard}
        onSave={handleUnsavedSave}
      />
    </div>
  );
}
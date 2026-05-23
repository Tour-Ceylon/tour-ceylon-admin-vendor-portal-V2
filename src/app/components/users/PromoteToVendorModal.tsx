import { useState } from "react";
import {
  X,
  Building2,
  FileText,
  Upload,
  Check,
  Globe,
  Compass,
  Anchor,
  Car,
  CheckCircle,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface PromoteToVendorModalProps {
  user: User;
  onClose: () => void;
}

type Category = "Stay" | "Tour" | "Safari" | "Experience" | "Transfer";
type VendorStatus = "pending_review" | "approved" | "rejected" | "suspended";

const CATEGORIES: { id: Category; label: string; icon: any }[] = [
  { id: "Stay", label: "Stay (Hotels, Resorts)", icon: Building2 },
  { id: "Tour", label: "Tour Packages", icon: Compass },
  { id: "Safari", label: "Safari Experiences", icon: Globe },
  { id: "Experience", label: "Local Experiences", icon: Anchor },
  { id: "Transfer", label: "Transport Services", icon: Car },
];

const VENDOR_STATUSES: { id: VendorStatus; label: string; color: string }[] = [
  { id: "pending_review", label: "Pending Review", color: "#f59e0b" },
  { id: "approved", label: "Approved", color: "#22c55e" },
  { id: "rejected", label: "Rejected", color: "#ef4444" },
  { id: "suspended", label: "Suspended", color: "#64748b" },
];

export function PromoteToVendorModal({ user, onClose }: PromoteToVendorModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
  const [companyName, setCompanyName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [vendorStatus, setVendorStatus] = useState<VendorStatus>("pending_review");
  const [documents, setDocuments] = useState<File[]>([]);

  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handlePromote = () => {
    // Handle promotion logic
    console.log({
      userId: user.id,
      categories: Array.from(selectedCategories),
      companyName,
      businessDescription,
      vendorStatus,
      documents,
    });
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease-out" }}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          borderRadius: "16px",
          animation: "scaleIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{
            background: "var(--bg-panel)",
            borderBottom: "1px solid var(--border-light)",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <div>
            <h2 className="text-[18px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              Promote to Vendor
            </h2>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {user.name} • {user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-tertiary)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Category Selection */}
          <div>
            <label className="block text-[13px] mb-3" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Select Vendor Categories *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategories.has(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center gap-3 p-3 rounded-lg transition-all text-left"
                    style={
                      isSelected
                        ? {
                            background: "var(--active-overlay)",
                            border: "1px solid var(--border-accent)",
                            boxShadow: "0 0 8px var(--border-accent)",
                          }
                        : {
                            background: "var(--input-background)",
                            border: "1px solid var(--border-light)",
                          }
                    }
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: isSelected ? "rgba(37,99,235,0.15)" : "var(--bg-elevated)",
                      }}
                    >
                      <category.icon
                        size={18}
                        style={{ color: isSelected ? "var(--accent-navy-light)" : "var(--text-tertiary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {category.label}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle size={18} style={{ color: "var(--accent-navy-light)" }} />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedCategories.size > 0 && (
              <p className="text-[11px] mt-2" style={{ color: "var(--text-secondary)" }}>
                {selectedCategories.size} category selected
              </p>
            )}
          </div>

          {/* Company Details */}
          <div>
            <label className="block text-[13px] mb-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Company / Business Name *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Jetwing Hotels, Safari Adventures LK"
              className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Business Description */}
          <div>
            <label className="block text-[13px] mb-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Business Description
            </label>
            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="Brief description of the vendor's business..."
              className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
                minHeight: "80px",
              }}
            />
          </div>

          {/* Vendor Status */}
          <div>
            <label className="block text-[13px] mb-3" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Vendor Status *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {VENDOR_STATUSES.map((status) => {
                const isSelected = vendorStatus === status.id;
                return (
                  <button
                    key={status.id}
                    onClick={() => setVendorStatus(status.id)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all text-left"
                    style={
                      isSelected
                        ? {
                            background: `${status.color}15`,
                            border: `1px solid ${status.color}40`,
                          }
                        : {
                            background: "var(--input-background)",
                            border: "1px solid var(--border-light)",
                          }
                    }
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: status.color }}
                    />
                    <span className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {status.label}
                    </span>
                    {isSelected && (
                      <Check size={14} style={{ color: status.color }} className="ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-[13px] mb-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Upload / Verify Documents
            </label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all"
              style={{
                borderColor: "var(--border-medium)",
                background: "var(--input-background)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
                (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-medium)";
                (e.currentTarget as HTMLElement).style.background = "var(--input-background)";
              }}
            >
              <Upload size={32} style={{ color: "var(--text-tertiary)", margin: "0 auto 8px" }} />
              <p className="text-[12px] mb-1" style={{ color: "var(--text-secondary)" }}>
                Click to upload or drag and drop
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Business license, registration, tax documents
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-end gap-3"
          style={{
            borderTop: "1px solid var(--border-light)",
            background: "var(--bg-elevated)",
            borderRadius: "0 0 16px 16px",
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-[12px] transition-all"
            style={{
              background: "var(--input-background)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-light)",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handlePromote}
            disabled={selectedCategories.size === 0 || !companyName}
            className="px-4 py-2.5 rounded-lg text-[12px] transition-all"
            style={
              selectedCategories.size > 0 && companyName
                ? {
                    background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                    color: "white",
                    boxShadow: "0 0 16px var(--border-accent)",
                    border: "1px solid var(--border-accent)",
                    fontWeight: 500,
                  }
                : {
                    background: "var(--input-background)",
                    color: "var(--text-tertiary)",
                    border: "1px solid var(--border-light)",
                    cursor: "not-allowed",
                    opacity: 0.5,
                  }
            }
          >
            Promote to Vendor
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}

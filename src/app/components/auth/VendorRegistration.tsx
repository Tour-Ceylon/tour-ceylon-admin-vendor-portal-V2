import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Compass, ArrowLeft, Upload, Building2, Globe, Anchor } from "lucide-react";
import { useAuth, VendorRegistrationData, Category } from "../../contexts/AuthContext";

const CATEGORIES: { id: Category; label: string; icon: React.ComponentType<any> }[] = [
  { id: "Stay", label: "Stay", icon: Building2 },
  { id: "Tour", label: "Tour", icon: Compass },
  { id: "Safari", label: "Safari", icon: Globe },
  { id: "Experience", label: "Experience", icon: Anchor },
];

interface VendorRegistrationProps {
  onBackToRoleSelect?: () => void;
}

export function VendorRegistration({ onBackToRoleSelect }: VendorRegistrationProps = {}) {
  const { register, registerVendorDocuments } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessDocs, setBusinessDocs] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<VendorRegistrationData>({
    businessName: "",
    vendorName: "",
    email: "",
    phone: "",
    password: "",
    country: "Sri Lanka",
    businessDescription: "",
    categories: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await register(formData);
      // Upload business documents if any were selected
      if (businessDocs.length > 0 && result?.id) {
        try {
          await registerVendorDocuments(result.id, businessDocs);
        } catch (docErr) {
          // Document upload failure is non-fatal — registration already succeeded
          console.warn("Vendor document upload failed (non-fatal):", docErr);
        }
      }
      navigate("/pending");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: Category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--bg-main)" }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
              boxShadow: "0 0 24px var(--border-accent)",
            }}
          >
            <Compass size={32} className="text-white" />
          </div>
          <h1 className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Vendor Partner Application
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>
            Join Tour Ceylon as a verified travel service provider (Stays, Tours, Safaris & Experiences)
          </p>
        </div>

        {/* Registration Card */}
        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="p-4 rounded-lg flex items-start gap-3 text-[13px]"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                }}
              >
                <span>{error}</span>
              </div>
            )}
            {/* Business Information */}
            <div>
              <h3 className="text-[13px] mb-4" style={{ color: "var(--accent-navy-light)", fontWeight: 600 }}>
                Business Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. Safari Adventures Lanka"
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                    Vendor Contact Name *
                  </label>
                  <input
                    type="text"
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    placeholder="Your full name"
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@example.com"
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                    Password (for portal login) *
                  </label>
                  <input
                    type="password"
                    value={formData.password || ""}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+94 77 123 4567"
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Business Description */}
            <div>
              <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Business Description *
              </label>
              <textarea
                value={formData.businessDescription}
                onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                placeholder="Describe your business and services..."
                required
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-[12px] mb-2" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Select Categories to Apply For *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CATEGORIES.map(({ id, label, icon: Icon }) => {
                  const isSelected = formData.categories.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleCategory(id)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px] transition-all"
                      style={
                        isSelected
                          ? {
                              background: "var(--active-overlay)",
                              color: "var(--accent-navy-light)",
                              border: "1px solid var(--border-accent)",
                              fontWeight: 500,
                            }
                          : {
                              background: "var(--input-background)",
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border-light)",
                            }
                      }
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] mt-2" style={{ color: "var(--text-tertiary)" }}>
                Selected: {formData.categories.length > 0 ? formData.categories.join(", ") : "None"}
              </p>
            </div>

            {/* Business Documents */}
            <div>
              <label className="block text-[12px] mb-2" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Business Documents
              </label>
              {/* Hidden file input — the dashed dropzone div below acts as the trigger */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setBusinessDocs(Array.from(e.target.files));
                  }
                }}
              />
              <label
                htmlFor="vendor-doc-upload"
                className="cursor-pointer block"
                onClick={() => fileInputRef.current?.click()}
              >
                <div
                  className="rounded-lg flex flex-col items-center justify-center gap-2 p-6 transition-all hover:opacity-80"
                  style={{
                    border: "2px dashed var(--border-accent)",
                    background: businessDocs.length > 0 ? "rgba(34, 197, 94, 0.05)" : "var(--accent-navy-subtle)",
                  }}
                >
                  <Upload size={20} style={{ color: businessDocs.length > 0 ? "#22c55e" : "var(--text-tertiary)" }} />
                  <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    {businessDocs.length > 0
                      ? `${businessDocs.length} file${businessDocs.length > 1 ? "s" : ""} selected — click to change`
                      : "Upload business registration, licenses, or certifications"}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    PDF, JPG, PNG up to 10MB
                  </p>
                </div>
              </label>
              {/* Selected file list */}
              {businessDocs.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {businessDocs.map((file, i) => (
                    <li key={i} className="flex items-center gap-2 text-[11px]" style={{ color: "#4ade80" }}>
                      <span>✓</span>
                      <span className="truncate">{file.name}</span>
                      <span className="text-gray-500">({(file.size / 1024).toFixed(0)} KB)</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (onBackToRoleSelect) {
                    onBackToRoleSelect();
                  } else {
                    navigate("/login");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] transition-all"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <ArrowLeft size={14} />
                {onBackToRoleSelect ? "Change Role" : "Back to Login"}
              </button>
              <button
                type="submit"
                disabled={loading || formData.categories.length === 0}
                className="flex-1 py-2.5 rounded-lg text-[13px] transition-all"
                style={{
                  background:
                    loading || formData.categories.length === 0
                      ? "var(--border-medium)"
                      : "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                  color: "white",
                  boxShadow:
                    loading || formData.categories.length === 0 ? "none" : "0 0 16px var(--border-accent)",
                  border: "1px solid var(--border-accent)",
                  fontWeight: 500,
                  cursor: loading || formData.categories.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

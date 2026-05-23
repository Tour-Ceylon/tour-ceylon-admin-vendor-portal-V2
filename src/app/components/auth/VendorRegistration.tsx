import { useState } from "react";
import { useNavigate } from "react-router";
import { Compass, ArrowLeft, Upload, Building2, Globe, Anchor, Car } from "lucide-react";
import { useAuth, VendorRegistrationData, Category } from "../../contexts/AuthContext";

const CATEGORIES: { id: Category; label: string; icon: React.ComponentType<any> }[] = [
  { id: "Stay", label: "Stay", icon: Building2 },
  { id: "Tour", label: "Tour", icon: Compass },
  { id: "Safari", label: "Safari", icon: Globe },
  { id: "Experience", label: "Experience", icon: Anchor },
  { id: "Transfer", label: "Transfer", icon: Car },
];

export function VendorRegistration() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VendorRegistrationData>({
    businessName: "",
    vendorName: "",
    email: "",
    phone: "",
    country: "Sri Lanka",
    businessDescription: "",
    categories: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      navigate("/pending");
    } catch (err) {
      console.error(err);
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
            Vendor Application
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>
            Join Voyage as a verified travel service provider
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
                    Vendor Name *
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
                <div>
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
              <div className="grid grid-cols-3 gap-3">
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
              <div
                className="rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-all p-6"
                style={{
                  border: "2px dashed var(--border-accent)",
                  background: "var(--accent-navy-subtle)",
                }}
              >
                <Upload size={20} style={{ color: "var(--text-tertiary)" }} />
                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  Upload business registration, licenses, or certifications
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  PDF, JPG, PNG up to 10MB
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] transition-all"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <ArrowLeft size={14} />
                Back to Login
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

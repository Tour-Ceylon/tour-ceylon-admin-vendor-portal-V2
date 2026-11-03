import { useRef, useState } from "react";
import { useAuth as useClerkAuth, useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { Compass, ArrowLeft, Upload, Building2 } from "lucide-react";
import { useAuth, VendorRegistrationData, Category } from "../../contexts/AuthContext";
import { useToast } from "../shared/Toast";

// Vendors are Stay partners only; tours, safaris and experiences are run by the Tour Ceylon team.
const VENDOR_CATEGORIES: Category[] = ["Stay"];

interface VendorRegistrationProps {
  onBackToRoleSelect?: () => void;
}

export function VendorRegistration({ onBackToRoleSelect }: VendorRegistrationProps = {}) {
  const { applyAsVendor, registerVendorDocuments, resyncProfile } = useAuth();
  const { isSignedIn } = useClerkAuth();
  const { isLoaded: signUpLoaded, signUp, setActive } = useSignUp();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [code, setCode] = useState("");
  const toast = useToast();
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
    categories: VENDOR_CATEGORIES,
  });

  /**
   * SEC-5: the password goes to Clerk from this browser and never through our server.
   * 1. create the Clerk account  2. verify the email with a code  3. send the business profile
   * (no password) to the server as that signed-in user.
   */
  const finishApplication = async () => {
    const result = await applyAsVendor(formData);
    // Upload business documents if any were selected
    if (businessDocs.length > 0 && result?.id) {
      try {
        await registerVendorDocuments(result.id, businessDocs);
      } catch (docErr) {
        // Document upload failure is non-fatal: the application already went through.
        console.warn("Vendor document upload failed (non-fatal):", docErr);
        toast.warning(
          "Application received, but your documents did not upload",
          "Please email them to our support team so we can finish reviewing your application."
        );
      }
    }
    resyncProfile(); // reload the user now that the application exists
    navigate("/pending");
  };

  const clerkMessage = (err: any, fallback: string) =>
    err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || fallback;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignedIn) {
        // Already has an account (for example a customer account being upgraded): just send the profile.
        await finishApplication();
        return;
      }
      if (!signUpLoaded || !signUp) throw new Error("Sign-up is still loading. Please try again in a moment.");
      const [firstName, ...rest] = formData.vendorName.trim().split(/\s+/);
      await signUp.create({
        emailAddress: formData.email.trim(),
        password: formData.password || "",
        firstName,
        lastName: rest.join(" ") || undefined,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: any) {
      console.error(err);
      setError(clerkMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpLoaded || !signUp || !setActive) return;
    setLoading(true);
    setError(null);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (attempt.status !== "complete") {
        throw new Error(
          attempt.missingFields?.length
            ? `Your account needs one more detail: ${attempt.missingFields.join(", ")}. Please contact support.`
            : "That code was not accepted. Check it and try again."
        );
      }
      await setActive({ session: attempt.createdSessionId });
      await finishApplication();
    } catch (err: any) {
      console.error(err);
      setError(clerkMessage(err, "We could not verify that code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (!signUp) return;
    setError(null);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      toast.success("Code sent", `We sent a new code to ${formData.email}.`);
    } catch (err: any) {
      setError(clerkMessage(err, "We could not send a new code. Please try again."));
    }
  };

  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg-main)" }}>
        <form
          onSubmit={handleVerify}
          className="w-full max-w-md rounded-xl p-8 space-y-5"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-lg)" }}
        >
          <div className="text-center">
            <h1 className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>Check your email</h1>
            <p className="text-[13px] mt-2" style={{ color: "var(--text-tertiary)" }}>
              We sent a verification code to <strong>{formData.email}</strong>. Enter it to finish creating your account
              and send your application.
            </p>
          </div>
          {error && (
            <div role="alert" className="p-3 rounded-lg text-[13px]" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444" }}>
              {error}
            </div>
          )}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Verification code"
            required
            className="w-full px-3 py-3 rounded-lg text-[16px] text-center tracking-[0.3em] outline-none"
            style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3 rounded-lg text-[14px] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))", color: "white", fontWeight: 600 }}
          >
            {loading ? "Verifying…" : "Verify and send application"}
          </button>
          <div className="flex justify-between text-[12px]">
            <button type="button" onClick={() => { setStep("form"); setError(null); }} style={{ color: "var(--text-secondary)" }}>
              Use a different email
            </button>
            <button type="button" onClick={resendCode} style={{ color: "var(--accent-navy-light)" }}>
              Send a new code
            </button>
          </div>
        </form>
      </div>
    );
  }

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
            List your hotel, villa or guesthouse on Tour Ceylon and manage rooms, rates and reservations in your own partner portal
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

            {/* What the partner portal is for */}
            <div
              className="flex items-start gap-3 rounded-lg px-4 py-3"
              style={{ background: "var(--active-overlay)", border: "1px solid var(--border-accent)" }}
            >
              <Building2 size={18} style={{ color: "var(--accent-navy-light)" }} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  Stay partner account
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  This application is for accommodation providers. Tours, safaris and experiences are created and managed by the
                  Tour Ceylon team.
                </p>
              </div>
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
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg text-[13px] transition-all"
                style={{
                  background:
                    loading
                      ? "var(--border-medium)"
                      : "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                  color: "white",
                  boxShadow:
                    loading ? "none" : "0 0 16px var(--border-accent)",
                  border: "1px solid var(--border-accent)",
                  fontWeight: 500,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
            {/* Clerk renders its bot check here when the instance has it switched on */}
            <div id="clerk-captcha" />
          </form>
        </div>
      </div>
    </div>
  );
}

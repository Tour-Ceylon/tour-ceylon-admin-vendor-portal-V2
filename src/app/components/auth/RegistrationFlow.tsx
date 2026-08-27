import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Compass, Building2, Car, ArrowRight, ShieldCheck, CheckCircle, ArrowLeft } from "lucide-react";
import { VendorRegistration } from "./VendorRegistration";
import { DriverRegistration } from "./DriverRegistration";

type SelectedRole = "vendor" | "driver" | null;

export function RegistrationFlow() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read initial role from query param ?role=vendor or ?role=driver
  const initialRoleParam = searchParams.get("role");
  const initialRole: SelectedRole =
    initialRoleParam === "vendor" || initialRoleParam === "driver" ? initialRoleParam : null;

  const [selectedRole, setSelectedRole] = useState<SelectedRole>(initialRole);

  const handleSelectRole = (role: "vendor" | "driver") => {
    setSelectedRole(role);
    setSearchParams({ role });
  };

  const handleBackToSelector = () => {
    setSelectedRole(null);
    setSearchParams({});
  };

  // Render Vendor Registration
  if (selectedRole === "vendor") {
    return <VendorRegistration onBackToRoleSelect={handleBackToSelector} />;
  }

  // Render Driver Registration
  if (selectedRole === "driver") {
    return <DriverRegistration onBackToRoleSelect={handleBackToSelector} />;
  }

  // Role Selector Landing View
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ background: "var(--bg-main)" }}
    >
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
              boxShadow: "0 0 30px var(--border-accent)",
            }}
          >
            <Compass size={34} className="text-white" />
          </div>
          <h1 className="text-[26px] sm:text-[30px] tracking-tight" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Partner with Tour Ceylon
          </h1>
          <p className="text-[14px] mt-2 max-w-md mx-auto" style={{ color: "var(--text-tertiary)" }}>
            Select your partner type to start your onboarding application
          </p>
        </div>

        {/* 2 Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card 1: Vendor Partner */}
          <div
            onClick={() => handleSelectRole("vendor")}
            className="rounded-2xl p-6 sm:p-8 cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-lg)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-accent)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-light)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #0f172a, #1e293b)",
                    border: "1px solid var(--border-accent)",
                    color: "var(--accent-navy-light)",
                  }}
                >
                  <Building2 size={28} />
                </div>
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
                  style={{
                    background: "var(--active-overlay)",
                    color: "var(--accent-navy-light)",
                    border: "1px solid var(--border-accent)",
                  }}
                >
                  Vendor Partner
                </span>
              </div>

              <h2 className="text-[19px] mb-2 font-bold" style={{ color: "var(--text-primary)" }}>
                Hospitality & Experiences
              </h2>
              <p className="text-[13px] leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
                List and operate hotel stays, villas, multi-day guided tours, wildlife safaris, and activity experiences.
              </p>

              <div className="space-y-2.5 mb-6 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  <span>Stays, Hotels, Villas & Homestays</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  <span>Guided Tours & Sightseeing Packages</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  <span>National Park Safari Drives & Activities</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  <span>Vendor booking management & calendar sync</span>
                </div>
              </div>
            </div>

            <div
              className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-[13px] transition-all"
              style={{
                background: "var(--input-background)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-light)",
              }}
            >
              <span>Apply as Vendor</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Transfer Driver */}
          <div
            onClick={() => handleSelectRole("driver")}
            className="rounded-2xl p-6 sm:p-8 cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-lg)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.6)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-light)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
                    border: "1px solid rgba(59, 130, 246, 0.4)",
                    color: "white",
                  }}
                >
                  <Car size={28} />
                </div>
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
                  style={{
                    background: "rgba(59, 130, 246, 0.15)",
                    color: "#60a5fa",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                  }}
                >
                  Transfer Driver
                </span>
              </div>

              <h2 className="text-[19px] mb-2 font-bold" style={{ color: "var(--text-primary)" }}>
                Transport & Chauffeurs
              </h2>
              <p className="text-[13px] leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
                Provide airport pick-ups, city-to-city transfers, and private chauffeur drive services across Sri Lanka.
              </p>

              <div className="space-y-2.5 mb-6 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 shrink-0" />
                  <span>Bandaranaike Airport (CMB) direct pickups</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 shrink-0" />
                  <span>Sedan, SUV, Van & Mini-coach vehicle tiers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 shrink-0" />
                  <span>Accurate luggage capacity & seat configurations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-blue-400 shrink-0" />
                  <span>Verified chauffeur badge & direct booking dispatch</span>
                </div>
              </div>
            </div>

            <div
              className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-[13px] transition-all"
              style={{
                background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                color: "white",
                border: "1px solid rgba(59, 130, 246, 0.4)",
              }}
            >
              <span>Apply as Transfer Driver</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Footer info & Login link */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[12px] text-gray-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>All partners undergo document verification and quality review</span>
          </div>

          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-semibold transition-all hover:underline"
              style={{ color: "var(--accent-navy-light)" }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

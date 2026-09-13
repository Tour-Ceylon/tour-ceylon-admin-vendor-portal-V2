import { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  ExternalLink,
  Loader2,
  Car,
  CreditCard,
  Star,
  Globe,
  Hash,
  Package,
  BadgeCheck,
  AlertCircle,
  Calendar,
  Clock,
} from "lucide-react";
import { apiFetch } from "../api/apiClient";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  role: string;
  status: string;
  joinedDate: string;
  lastLogin: string;
  company?: string;
  vendorCategories?: string[];
  adminRole?: string;
  totalBookings?: number;
  totalSpent?: number;
}

interface LuggageCapacity {
  luggage_size_type_id: string;
  name?: string | null;
  quantity: number;
}

interface DriverResponse {
  id: string;
  user_id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  nic_number: string;
  license_number?: string | null;
  license_photo_url?: string | null;
  nic_photo_url?: string | null;
  vehicle_registration_doc_url?: string | null;
  insurance_doc_url?: string | null;
  police_clearance_doc_url?: string | null;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_plate_number: string;
  seats: number;
  status: string;
  base_location?: string | null;
  languages_spoken?: string[] | null;
  years_experience?: number | null;
  bank_account_holder?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  rating?: number | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  luggage_capacities: LuggageCapacity[];
}

interface VendorDoc {
  url: string;
  name: string;
  uploaded_at?: string;
}

interface UserDetailDrawerProps {
  user: UserData;
  onClose: () => void;
  driverUserId?: string;
  vendorDocuments?: VendorDoc[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function isPdfUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes(".pdf") || lower.includes("/raw/");
}

function fmtDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function statusColor(s: string) {
  switch (s.toLowerCase()) {
    case "approved": return { bg: "rgba(34,197,94,0.12)", color: "#4ade80", border: "rgba(34,197,94,0.3)" };
    case "pending_review": return { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "rgba(251,191,36,0.3)" };
    case "rejected": return { bg: "rgba(239,68,68,0.12)", color: "#f87171", border: "rgba(239,68,68,0.3)" };
    case "suspended": return { bg: "rgba(168,85,247,0.12)", color: "#c084fc", border: "rgba(168,85,247,0.3)" };
    default: return { bg: "var(--active-overlay)", color: "var(--text-secondary)", border: "var(--border-light)" };
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}>
      <h3 className="text-[13px] mb-4 uppercase tracking-wide" style={{ color: "var(--accent-navy-light)", fontWeight: 700, letterSpacing: "0.06em" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value?: string | number | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p className={`text-[13px] ${mono ? "font-mono" : ""}`} style={{ color: value ? "var(--text-primary)" : "var(--text-tertiary)", fontWeight: value ? 500 : 400 }}>
        {value ?? "—"}
      </p>
    </div>
  );
}

function DocSlot({ label, url }: { label: string; url?: string | null }) {
  const base: React.CSSProperties = {
    background: "var(--input-background)",
    border: "1px solid var(--border-light)",
    borderRadius: "0.5rem",
    padding: "0.75rem",
  };

  if (!url) {
    return (
      <div style={base}>
        <p className="text-[10px] mb-1" style={{ color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Not provided</p>
      </div>
    );
  }

  if (isPdfUrl(url)) {
    return (
      <div style={base}>
        <p className="text-[10px] mb-2" style={{ color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:opacity-80 w-fit"
          style={{ background: "var(--active-overlay)", color: "var(--accent-navy-light)", border: "1px solid var(--border-accent)" }}>
          <FileText size={12} /> View PDF <ExternalLink size={10} />
        </a>
      </div>
    );
  }

  return (
    <div style={base}>
      <p className="text-[10px] mb-2" style={{ color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
        <img src={url} alt={label} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "0.375rem", border: "1px solid var(--border-light)" }} />
      </a>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function UserDetailDrawer({ user, onClose, driverUserId, vendorDocuments }: UserDetailDrawerProps) {
  const [driver, setDriver] = useState<DriverResponse | null>(null);
  const [docsLoading, setDocsLoading] = useState(false);

  const isDriver = user.role.toUpperCase() === "DRIVER";
  const isVendor = user.role.toUpperCase() === "VENDOR";

  useEffect(() => {
    if (!isDriver || !driverUserId) return;
    setDocsLoading(true);
    apiFetch<DriverResponse>(`/admin/drivers/by-user/${driverUserId}`)
      .then((data) => setDriver(data))
      .catch((err) => console.warn("Failed to load driver profile:", err))
      .finally(() => setDocsLoading(false));
  }, [isDriver, driverUserId]);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} style={{ animation: "fadeIn 0.2s ease-out" }} />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-[520px] z-50 overflow-y-auto"
        style={{ background: "var(--bg-main)", borderLeft: "1px solid var(--border-light)", boxShadow: "-4px 0 32px rgba(0,0,0,0.35)", animation: "slideInRight 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between" style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border-light)" }}>
          <div>
            <h2 className="text-[18px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 700 }}>{user.name}</h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>User ID: {user.id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-tertiary)" }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">

          {/* ── Personal Information ── */}
          <Card title="Personal Information">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Full Name" value={user.name} />
              </div>
              <Field label="Email" value={user.email} />
              <Field label="Phone" value={user.phone} />
              <Field label="Country" value={user.country} />
              <div className="col-span-2 flex items-center gap-2 pt-1">
                <span className="text-[11px] px-2.5 py-1 rounded-full capitalize"
                  style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)", fontWeight: 600 }}>
                  {user.role}
                </span>
                {(() => { const c = statusColor(user.status); return (
                  <span className="text-[11px] px-2.5 py-1 rounded-full capitalize" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600 }}>
                    {user.status.replace(/_/g, " ")}
                  </span>
                ); })()}
              </div>
            </div>
          </Card>

          {/* ── Account Details ── */}
          <Card title="Account Details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Joined" value={user.joinedDate} />
              <Field label="Last Login" value={user.lastLogin} />
            </div>
          </Card>

          {/* ── Driver-specific sections ── */}
          {isDriver && (
            <>
              {docsLoading ? (
                <div className="flex items-center gap-3 py-6 justify-center rounded-xl" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
                  <Loader2 size={18} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
                  <span className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>Loading driver profile…</span>
                </div>
              ) : driver ? (
                <>
                  {/* Identity & Licence */}
                  <Card title="Identity & Licence">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="NIC Number" value={driver.nic_number} mono />
                      <Field label="Licence Number" value={driver.license_number} mono />
                      <Field label="Base Location" value={driver.base_location} />
                      <Field label="Years Experience" value={driver.years_experience != null ? `${driver.years_experience} yr${driver.years_experience !== 1 ? "s" : ""}` : null} />
                      {driver.languages_spoken && driver.languages_spoken.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-[10px] mb-1.5" style={{ color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Languages Spoken</p>
                          <div className="flex flex-wrap gap-1.5">
                            {driver.languages_spoken.map((lang) => (
                              <span key={lang} className="text-[11px] px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)", fontWeight: 500 }}>
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="col-span-2 flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          {driver.rating != null ? (
                            <>
                              <Star size={13} style={{ color: "#fbbf24" }} />
                              <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{driver.rating.toFixed(1)}</span>
                              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>rating</span>
                            </>
                          ) : (
                            <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>No rating yet</span>
                          )}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto"
                          style={{ background: driver.is_active ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: driver.is_active ? "#4ade80" : "#f87171", border: driver.is_active ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(239,68,68,0.3)", fontWeight: 600 }}>
                          {driver.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Vehicle Details */}
                  <Card title="Vehicle Details">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Make" value={driver.vehicle_make} />
                      <Field label="Model" value={driver.vehicle_model} />
                      <Field label="Plate Number" value={driver.vehicle_plate_number} mono />
                      <Field label="Seats" value={driver.seats} />
                      {driver.luggage_capacities && driver.luggage_capacities.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-[10px] mb-2" style={{ color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Luggage Capacity</p>
                          <div className="flex flex-wrap gap-2">
                            {driver.luggage_capacities.map((cap) => (
                              <div key={cap.luggage_size_type_id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
                                <Package size={11} style={{ color: "var(--text-tertiary)" }} />
                                <span className="text-[11px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>{cap.name || "Bag"}</span>
                                <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "var(--active-overlay)", color: "var(--accent-navy-light)" }}>×{cap.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Bank / Payout Details */}
                  {(driver.bank_account_holder || driver.bank_name || driver.bank_account_number) && (
                    <Card title="Bank / Payout Details">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Field label="Account Holder" value={driver.bank_account_holder} />
                        </div>
                        <Field label="Bank Name" value={driver.bank_name} />
                        <Field label="Account Number" value={driver.bank_account_number} mono />
                      </div>
                    </Card>
                  )}

                  {/* Driver Record Timestamps */}
                  <Card title="Record Info">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Driver ID</p>
                        <p className="text-[11px] font-mono break-all" style={{ color: "var(--text-tertiary)" }}>{driver.id}</p>
                      </div>
                      <div>
                        <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Application Status</p>
                        {(() => { const c = statusColor(driver.status); return (
                          <span className="text-[11px] px-2 py-0.5 rounded-full capitalize"
                            style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600 }}>
                            {driver.status.replace(/_/g, " ")}
                          </span>
                        ); })()}
                      </div>
                      <Field label="Registered" value={fmtDate(driver.created_at)} />
                      <Field label="Last Updated" value={fmtDate(driver.updated_at)} />
                    </div>
                  </Card>

                  {/* Verification Documents */}
                  <Card title="Verification Documents">
                    <div className="grid grid-cols-2 gap-3">
                      <DocSlot label="Driving License"      url={driver.license_photo_url} />
                      <DocSlot label="NIC"                  url={driver.nic_photo_url} />
                      <DocSlot label="Vehicle Registration" url={driver.vehicle_registration_doc_url} />
                      <DocSlot label="Insurance"            url={driver.insurance_doc_url} />
                      <DocSlot label="Police Clearance"     url={driver.police_clearance_doc_url} />
                    </div>
                  </Card>
                </>
              ) : (
                <div className="flex items-center gap-2 p-4 rounded-xl" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-tertiary)" }}>
                  <AlertCircle size={14} />
                  <span className="text-[12px]">Driver profile could not be loaded.</span>
                </div>
              )}
            </>
          )}

          {/* ── Vendor sections ── */}
          {isVendor && (
            <>
              {user.company && (
                <Card title="Vendor Information">
                  <div className="space-y-3">
                    <Field label="Company" value={user.company} />
                    {user.vendorCategories && user.vendorCategories.length > 0 && (
                      <div>
                        <p className="text-[10px] mb-2" style={{ color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Approved Categories</p>
                        <div className="flex flex-wrap gap-1.5">
                          {user.vendorCategories.map((cat) => (
                            <span key={cat} className="text-[11px] px-2.5 py-1 rounded"
                              style={{ background: "var(--active-overlay)", color: "var(--accent-navy-light)", border: "1px solid var(--border-accent)", fontWeight: 500 }}>
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              <Card title="Verification Documents">
                {!vendorDocuments || vendorDocuments.length === 0 ? (
                  <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>No documents uploaded.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {vendorDocuments.map((doc, i) => (
                      <DocSlot key={i} label={doc.name || `Document ${i + 1}`} url={doc.url} />
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}

          {/* ── Admin ── */}
          {user.role.toUpperCase() === "ADMIN" && user.adminRole && (
            <Card title="Admin Information">
              <Field label="Admin Role" value={user.adminRole} />
            </Card>
          )}

          {/* ── Tourist ── */}
          {user.role.toUpperCase() === "TOURIST" && user.totalBookings !== undefined && (
            <Card title="Booking Statistics">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] mb-1" style={{ color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Bookings</p>
                  <p className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>{user.totalBookings}</p>
                </div>
                <div>
                  <p className="text-[10px] mb-1" style={{ color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Spent</p>
                  <p className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>${user.totalSpent?.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
}

import { useState, useEffect } from "react";
import { FileText, Clock, CreditCard, Baby, Dog, Cigarette, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useStayHotel, StayHotelPropertyGate } from "./StayHotelContext";
import { updateStayProperty } from "../api/stayVendorApi";

function PoliciesContent() {
  const { selectedProperty, refreshProperties } = useStayHotel();

  // Check-in / out
  const [checkInFrom, setCheckInFrom] = useState("14:00");
  const [checkInUntil, setCheckInUntil] = useState("22:00");
  const [checkOutFrom, setCheckOutFrom] = useState("07:00");
  const [checkOutUntil, setCheckOutUntil] = useState("11:00");
  const [earlyCheckInPolicy, setEarlyCheckInPolicy] = useState("subject");
  const [lateCheckOutPolicy, setLateCheckOutPolicy] = useState("fee");

  // Cancellation
  const [cancellationWindowDays, setCancellationWindowDays] = useState("7");
  const [partialRefundPercent, setPartialRefundPercent] = useState("50");
  const [cancellationDetails, setCancellationDetails] = useState("");

  // Payment
  const [paymentMethods, setPaymentMethods] = useState("Visa, Mastercard, Cash, Bank Transfer");
  const [depositRequired, setDepositRequired] = useState("30% at confirmation");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [acceptedCurrencies, setAcceptedCurrencies] = useState("LKR / USD");

  // House rules
  const [childrenAllowed, setChildrenAllowed] = useState(true);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [smokingAllowed, setSmokingAllowed] = useState(false);

  // Status
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProperty) return;
    const policies = (selectedProperty.policies as Record<string, any>) || {};

    setCheckInFrom(policies.checkInFrom || "14:00");
    setCheckInUntil(policies.checkInUntil || "22:00");
    setCheckOutFrom(policies.checkOutFrom || "07:00");
    setCheckOutUntil(policies.checkOutUntil || "11:00");
    setEarlyCheckInPolicy(policies.earlyCheckInPolicy || "subject");
    setLateCheckOutPolicy(policies.lateCheckOutPolicy || "fee");

    setCancellationWindowDays(policies.cancellationWindowDays ? String(policies.cancellationWindowDays) : "7");
    setPartialRefundPercent(policies.partialRefundPercent ? String(policies.partialRefundPercent) : "50");
    setCancellationDetails(policies.cancellationDetails || "");

    setPaymentMethods(policies.paymentMethods || "Visa, Mastercard, Cash (LKR/USD/EUR), Bank Transfer");
    setDepositRequired(policies.depositRequired || "30% at confirmation");
    setSecurityDeposit(policies.securityDeposit || "");
    setAcceptedCurrencies(policies.acceptedCurrencies || "LKR / USD");

    setChildrenAllowed(policies.childrenAllowed !== false);
    setPetsAllowed(Boolean(policies.petsAllowed));
    setSmokingAllowed(Boolean(policies.smokingAllowed));
  }, [selectedProperty?.id, selectedProperty?.updatedAt]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProperty?.id) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        policies: {
          ...((selectedProperty.policies as Record<string, any>) || {}),
          checkInFrom,
          checkInUntil,
          checkOutFrom,
          checkOutUntil,
          earlyCheckInPolicy,
          lateCheckOutPolicy,
          cancellationWindowDays: Number(cancellationWindowDays) || 7,
          partialRefundPercent: Number(partialRefundPercent) || 50,
          cancellationDetails,
          paymentMethods,
          depositRequired,
          securityDeposit,
          acceptedCurrencies,
          childrenAllowed,
          petsAllowed,
          smokingAllowed,
        },
      };

      await updateStayProperty(selectedProperty.id, payload as any, {
        existingProperty: selectedProperty,
      });
      await refreshProperties();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to update property policies:", err);
      setSaveError(err.message || "Failed to update property policies. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="p-6 space-y-6 max-w-[1000px]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={15} style={{ color: "var(--accent-navy-light)" }} />
            <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "var(--accent-navy-light)" }}>
              Policies & House Rules
            </span>
          </div>
          <h1 className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {selectedProperty?.name} — Policies
          </h1>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-50"
          style={{
            background: saveSuccess ? "rgba(34,197,94,0.18)" : "var(--accent-navy)",
            color: saveSuccess ? "#4ade80" : "white",
            border: saveSuccess ? "1px solid rgba(34,197,94,0.35)" : "1px solid var(--border-accent)",
            boxShadow: saveSuccess ? "none" : "0 4px 14px rgba(59, 130, 246, 0.25)",
          }}
        >
          {saving ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 size={15} />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save size={15} />
              <span>Save Policies</span>
            </>
          )}
        </button>
      </div>

      {saveError && (
        <div className="p-3.5 rounded-xl border flex items-center gap-2.5 bg-red-500/10 border-red-500/25 text-red-400 text-[13px]">
          <AlertCircle size={16} className="shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Check-in / Check-out */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <Clock size={15} style={{ color: "var(--accent-navy-light)" }} />
          <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Check-in & Check-out Windows
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Check-in From</label>
            <input
              type="time"
              value={checkInFrom}
              onChange={(e) => setCheckInFrom(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Check-in Until</label>
            <input
              type="time"
              value={checkInUntil}
              onChange={(e) => setCheckInUntil(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Check-out From</label>
            <input
              type="time"
              value={checkOutFrom}
              onChange={(e) => setCheckOutFrom(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Check-out Until</label>
            <input
              type="time"
              value={checkOutUntil}
              onChange={(e) => setCheckOutUntil(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Early Check-in Policy</label>
            <select
              value={earlyCheckInPolicy}
              onChange={(e) => setEarlyCheckInPolicy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              <option value="subject">Subject to availability (no charge)</option>
              <option value="fee">Available with additional fee</option>
              <option value="no">Not available</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Late Check-out Policy</label>
            <select
              value={lateCheckOutPolicy}
              onChange={(e) => setLateCheckOutPolicy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              <option value="fee">Available with additional fee</option>
              <option value="subject">Subject to availability (no charge)</option>
              <option value="no">Not available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cancellation */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <FileText size={15} style={{ color: "var(--accent-navy-light)" }} />
          <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Cancellation Terms
          </span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Free Cancellation Window (Days prior to check-in)
              </label>
              <input
                type="number"
                value={cancellationWindowDays}
                onChange={(e) => setCancellationWindowDays(e.target.value)}
                placeholder="e.g. 7"
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Partial Refund Percentage (%)
              </label>
              <input
                type="number"
                value={partialRefundPercent}
                onChange={(e) => setPartialRefundPercent(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Detailed Cancellation Policy Notes
            </label>
            <textarea
              value={cancellationDetails}
              onChange={(e) => setCancellationDetails(e.target.value)}
              rows={3}
              placeholder="e.g. Guests may cancel free of charge up to 7 days before arrival. Cancellations within 3-7 days receive 50% refund..."
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <CreditCard size={15} style={{ color: "var(--accent-navy-light)" }} />
          <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Payment & Deposit Terms
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Accepted Payment Methods</label>
            <input
              value={paymentMethods}
              onChange={(e) => setPaymentMethods(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Deposit Required</label>
            <input
              value={depositRequired}
              onChange={(e) => setDepositRequired(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Security Deposit (Optional)</label>
            <input
              value={securityDeposit}
              onChange={(e) => setSecurityDeposit(e.target.value)}
              placeholder="e.g. LKR 10,000 on arrival"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Accepted Currencies</label>
            <input
              value={acceptedCurrencies}
              onChange={(e) => setAcceptedCurrencies(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* House Rules */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>House Rules</span>
        </div>
        <div className="p-5 space-y-3">
          {[
            {
              label: "Children Allowed",
              icon: Baby,
              value: childrenAllowed,
              setter: setChildrenAllowed,
              sub: "Children of all ages welcome at property",
            },
            {
              label: "Pets Allowed",
              icon: Dog,
              value: petsAllowed,
              setter: setPetsAllowed,
              sub: "Permit domestic pets or service animals",
            },
            {
              label: "Smoking Allowed",
              icon: Cigarette,
              value: smokingAllowed,
              setter: setSmokingAllowed,
              sub: "Permitted in designated smoking zones",
            },
          ].map((rule) => (
            <div
              key={rule.label}
              onClick={() => rule.setter(!rule.value)}
              className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all hover:bg-white/[0.03]"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: rule.value ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.08)" }}
                >
                  <rule.icon size={16} style={{ color: rule.value ? "#4ade80" : "#f87171" }} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{rule.label}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{rule.sub}</p>
                </div>
              </div>

              <div
                className="w-11 h-6 rounded-full relative transition-colors"
                style={{ background: rule.value ? "var(--accent-navy)" : "var(--border-light)" }}
              >
                <div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                  style={{ left: rule.value ? "calc(100% - 20px)" : "4px" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}

export function Policies() {
  return (
    <StayHotelPropertyGate>
      <PoliciesContent />
    </StayHotelPropertyGate>
  );
}

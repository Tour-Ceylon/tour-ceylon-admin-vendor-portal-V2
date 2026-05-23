import { useState } from "react";
import { FileText, Clock, CreditCard, Baby, Dog, Cigarette, Save } from "lucide-react";

export function Policies() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-[900px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={15} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>Policies</span>
          </div>
          <h1 className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>Property Policies</h1>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] transition-all"
          style={{
            background: saved ? "rgba(34,197,94,0.15)" : "var(--accent-navy)",
            color: saved ? "#4ade80" : "white",
            fontWeight: 600,
            border: saved ? "1px solid rgba(34,197,94,0.3)" : "none",
            boxShadow: saved ? "none" : "0 0 12px var(--border-accent)",
          }}
        >
          <Save size={14} />
          {saved ? "Saved!" : "Save Policies"}
        </button>
      </div>

      {/* Check-in / Check-out */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <Clock size={13} style={{ color: "var(--accent-navy)" }} />
          <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Check-in & Check-out</span>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Check-in From", type: "time", value: "14:00" },
            { label: "Check-in Until", type: "time", value: "22:00" },
            { label: "Check-out From", type: "time", value: "07:00" },
            { label: "Check-out Until", type: "time", value: "11:00" },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>{f.label}</label>
              <input
                type={f.type}
                defaultValue={f.value}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-navy)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
              />
            </div>
          ))}
          <div className="col-span-2">
            <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Early Check-in Policy</label>
            <select
              defaultValue="subject"
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
            >
              <option value="subject">Subject to availability (no charge)</option>
              <option value="fee">Available with additional fee</option>
              <option value="no">Not available</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Late Check-out Policy</label>
            <select
              defaultValue="fee"
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
            >
              <option value="subject">Subject to availability (no charge)</option>
              <option value="fee">Available with additional fee</option>
              <option value="no">Not available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cancellation */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <FileText size={13} style={{ color: "var(--accent-navy)" }} />
          <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Cancellation Policy</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Free cancellation up to", value: "7", unit: "days before check-in" },
              { label: "Partial refund", value: "50", unit: "% if cancelled 3–7 days before" },
              { label: "No refund", value: "0", unit: "% if cancelled < 3 days before" },
            ].map((r) => (
              <div
                key={r.label}
                className="rounded-lg p-3 text-center"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}
              >
                <p className="text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>{r.label}</p>
                <p className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>{r.value}</p>
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{r.unit}</p>
              </div>
            ))}
          </div>
          <div>
            <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Cancellation Details</label>
            <textarea
              defaultValue="Guests may cancel free of charge up to 7 days before arrival. Cancellations made within 3–7 days of arrival receive a 50% refund. No-shows and cancellations within 72 hours are non-refundable."
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <CreditCard size={13} style={{ color: "var(--accent-navy)" }} />
          <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Payment & Deposit</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          {[
            { label: "Accepted Payment Methods", value: "Visa, Mastercard, Cash (LKR/USD/EUR), Bank Transfer" },
            { label: "Deposit Required", value: "30% of total booking at confirmation" },
            { label: "Security Deposit", value: "USD 200 on arrival (refundable)" },
            { label: "Currency", value: "USD / LKR" },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>{f.label}</label>
              <input
                defaultValue={f.value}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-navy)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
              />
            </div>
          ))}
        </div>
      </div>

      {/* House rules toggles */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>House Rules</span>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: "Children Allowed", icon: Baby, value: true, sub: "Children of all ages welcome" },
            { label: "Pets Allowed", icon: Dog, value: false, sub: "No pets permitted" },
            { label: "Smoking Allowed", icon: Cigarette, value: false, sub: "Strictly non-smoking property" },
          ].map((rule) => (
            <div
              key={rule.label}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: rule.value ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.08)" }}
                >
                  <rule.icon size={14} style={{ color: rule.value ? "#4ade80" : "#f87171" }} />
                </div>
                <div>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>{rule.label}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{rule.sub}</p>
                </div>
              </div>
              <div
                className="w-10 h-5 rounded-full relative cursor-pointer transition-all"
                style={{ background: rule.value ? "var(--accent-navy)" : "var(--border-light)" }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: rule.value ? "calc(100% - 18px)" : "2px" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

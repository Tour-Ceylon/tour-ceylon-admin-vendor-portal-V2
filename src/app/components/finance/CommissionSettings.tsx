import { useState } from "react";
import {
  Building2,
  Compass,
  Globe,
  Anchor,
  Car,
  Percent,
  DollarSign,
  Save,
  RotateCcw,
  TrendingUp,
  AlertCircle,
  Info,
} from "lucide-react";

interface CommissionRate {
  category: string;
  percentage: number;
  flatFee: number;
  usePercentage: boolean;
  icon: any;
  color: string;
  bg: string;
}

const CATEGORY_ICONS = {
  Stay: { icon: Building2, color: "#3b82f6", bg: "rgba(37, 99, 235, 0.12)" },
  Tour: { icon: Compass, color: "#0891b2", bg: "rgba(8, 145, 178, 0.12)" },
  Safari: { icon: Globe, color: "#059669", bg: "rgba(5, 150, 105, 0.12)" },
  Experience: { icon: Anchor, color: "#d97706", bg: "rgba(217, 119, 6, 0.12)" },
  Transfer: { icon: Car, color: "#64748b", bg: "rgba(100, 116, 139, 0.12)" },
};

const INITIAL_RATES: CommissionRate[] = [
  { category: "Stay", percentage: 12, flatFee: 0, usePercentage: true, ...CATEGORY_ICONS.Stay },
  { category: "Tour", percentage: 15, flatFee: 0, usePercentage: true, ...CATEGORY_ICONS.Tour },
  { category: "Safari", percentage: 10, flatFee: 0, usePercentage: true, ...CATEGORY_ICONS.Safari },
  { category: "Experience", percentage: 12, flatFee: 0, usePercentage: true, ...CATEGORY_ICONS.Experience },
  { category: "Transfer", percentage: 8, flatFee: 5, usePercentage: true, ...CATEGORY_ICONS.Transfer },
];

export function CommissionSettings() {
  const [rates, setRates] = useState<CommissionRate[]>(INITIAL_RATES);
  const [hasChanges, setHasChanges] = useState(false);

  const handlePercentageChange = (category: string, value: number) => {
    setRates((prev) =>
      prev.map((rate) =>
        rate.category === category ? { ...rate, percentage: value } : rate
      )
    );
    setHasChanges(true);
  };

  const handleFlatFeeChange = (category: string, value: number) => {
    setRates((prev) =>
      prev.map((rate) =>
        rate.category === category ? { ...rate, flatFee: value } : rate
      )
    );
    setHasChanges(true);
  };

  const handleToggleType = (category: string) => {
    setRates((prev) =>
      prev.map((rate) =>
        rate.category === category ? { ...rate, usePercentage: !rate.usePercentage } : rate
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log("Saving commission rates:", rates);
    setHasChanges(false);
    // In production: API call to save rates
  };

  const handleReset = () => {
    setRates(INITIAL_RATES);
    setHasChanges(false);
  };

  // Calculate revenue simulation
  const sampleBooking = 1000; // $1000 sample booking
  const revenueSimulation = rates.map((rate) => ({
    category: rate.category,
    commission: rate.usePercentage
      ? (sampleBooking * rate.percentage) / 100
      : rate.flatFee,
    vendorEarnings: rate.usePercentage
      ? sampleBooking - (sampleBooking * rate.percentage) / 100
      : sampleBooking - rate.flatFee,
  }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Commission Settings
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Configure platform commission rates by category
        </p>
      </div>

      {/* Info Banner */}
      <div
        className="rounded-xl p-4 flex items-start gap-3 mb-6"
        style={{
          background: "rgba(59, 130, 246, 0.08)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
        }}
      >
        <Info size={18} style={{ color: "#3b82f6" }} className="shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] mb-1" style={{ color: "#3b82f6", fontWeight: 500 }}>
            Commission Configuration
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            Set commission rates as either a percentage of the booking amount or a flat fee. Changes will apply to all new bookings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Commission Rates */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Category Commission Rates
          </h3>

          {rates.map((rate) => {
            const Icon = rate.icon;
            return (
              <div
                key={rate.category}
                className="rounded-xl p-5"
                style={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-light)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: rate.bg }}
                  >
                    <Icon size={18} style={{ color: rate.color }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {rate.category}
                    </h4>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {rate.usePercentage ? `${rate.percentage}% commission` : `$${rate.flatFee} flat fee`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleType(rate.category)}
                      className="px-3 py-1.5 text-[11px] rounded-lg transition-all"
                      style={
                        rate.usePercentage
                          ? {
                              background: "var(--active-overlay)",
                              color: "var(--accent-navy-light)",
                              border: "1px solid var(--border-accent)",
                              fontWeight: 600,
                            }
                          : {
                              background: "var(--input-background)",
                              border: "1px solid var(--border-light)",
                              color: "var(--text-secondary)",
                            }
                      }
                    >
                      Percentage
                    </button>
                    <button
                      onClick={() => handleToggleType(rate.category)}
                      className="px-3 py-1.5 text-[11px] rounded-lg transition-all"
                      style={
                        !rate.usePercentage
                          ? {
                              background: "var(--active-overlay)",
                              color: "var(--accent-navy-light)",
                              border: "1px solid var(--border-accent)",
                              fontWeight: 600,
                            }
                          : {
                              background: "var(--input-background)",
                              border: "1px solid var(--border-light)",
                              color: "var(--text-secondary)",
                            }
                      }
                    >
                      Flat Fee
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Percentage Input */}
                  <div>
                    <label className="text-[11px] mb-2 block" style={{ color: "var(--text-tertiary)" }}>
                      Percentage Rate
                    </label>
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{
                        background: rate.usePercentage ? "var(--input-background)" : "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-light)",
                        opacity: rate.usePercentage ? 1 : 0.5,
                      }}
                    >
                      <input
                        type="number"
                        value={rate.percentage}
                        onChange={(e) => handlePercentageChange(rate.category, Number(e.target.value))}
                        disabled={!rate.usePercentage}
                        className="flex-1 bg-transparent text-[13px] outline-none"
                        style={{ color: "var(--text-primary)" }}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <Percent size={14} style={{ color: "var(--text-tertiary)" }} />
                    </div>
                  </div>

                  {/* Flat Fee Input */}
                  <div>
                    <label className="text-[11px] mb-2 block" style={{ color: "var(--text-tertiary)" }}>
                      Flat Fee Amount
                    </label>
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{
                        background: !rate.usePercentage ? "var(--input-background)" : "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-light)",
                        opacity: !rate.usePercentage ? 1 : 0.5,
                      }}
                    >
                      <DollarSign size={14} style={{ color: "var(--text-tertiary)" }} />
                      <input
                        type="number"
                        value={rate.flatFee}
                        onChange={(e) => handleFlatFeeChange(rate.category, Number(e.target.value))}
                        disabled={rate.usePercentage}
                        className="flex-1 bg-transparent text-[13px] outline-none"
                        style={{ color: "var(--text-primary)" }}
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Action Buttons */}
          {hasChanges && (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "var(--success)",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                <Save size={14} />
                Save Changes
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 text-[13px] rounded-lg flex items-center gap-2 transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Revenue Simulation */}
        <div className="space-y-4">
          <h3 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Revenue Simulation
          </h3>

          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} style={{ color: "var(--accent-navy)" }} />
              <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                Sample Booking: ${sampleBooking.toLocaleString()}
              </p>
            </div>
            <div className="space-y-3">
              {revenueSimulation.map((sim) => (
                <div
                  key={sim.category}
                  className="rounded-lg p-3"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>
                    {sim.category}
                  </p>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      Commission
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--warning)", fontWeight: 600 }}>
                      ${sim.commission.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      Vendor Earnings
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--success)", fontWeight: 600 }}>
                      ${sim.vendorEarnings.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Note */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            <div className="flex items-start gap-2">
              <AlertCircle size={14} style={{ color: "var(--warning)" }} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] mb-1" style={{ color: "var(--warning)", fontWeight: 500 }}>
                  Important Note
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  Commission changes apply to new bookings only. Existing bookings retain their original rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

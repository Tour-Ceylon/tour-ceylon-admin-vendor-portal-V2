import { useState } from "react";
import {
  DollarSign,
  Plane,
  Moon,
  Calendar,
  TrendingUp,
  Save,
  RotateCcw,
  Calculator,
  Info,
} from "lucide-react";

interface PricingRule {
  id: string;
  name: string;
  value: number;
  type: "percentage" | "fixed";
  active: boolean;
}

interface VehiclePricing {
  category: string;
  baseFare: number;
  pricePerKm: number;
  minimumFare: number;
}

const INITIAL_PRICING_RULES: PricingRule[] = [
  { id: "airport", name: "Airport Surcharge", value: 500, type: "fixed", active: true },
  { id: "night", name: "Night Surcharge (10PM - 6AM)", value: 20, type: "percentage", active: true },
  { id: "holiday", name: "Public Holiday Surcharge", value: 15, type: "percentage", active: false },
  { id: "peak", name: "Peak Hour Surcharge", value: 10, type: "percentage", active: false },
];

const INITIAL_VEHICLE_PRICING: VehiclePricing[] = [
  { category: "Standard Car", baseFare: 1500, pricePerKm: 80, minimumFare: 2000 },
  { category: "SUV", baseFare: 2200, pricePerKm: 120, minimumFare: 3000 },
  { category: "Van", baseFare: 3500, pricePerKm: 150, minimumFare: 4500 },
  { category: "Luxury Van", baseFare: 5000, pricePerKm: 200, minimumFare: 6500 },
];

export function TransportPricingPage() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(INITIAL_PRICING_RULES);
  const [vehiclePricing, setVehiclePricing] = useState<VehiclePricing[]>(INITIAL_VEHICLE_PRICING);
  const [hasChanges, setHasChanges] = useState(false);

  // Pricing calculator state
  const [calculatorDistance, setCalculatorDistance] = useState(30);
  const [calculatorVehicle, setCalculatorVehicle] = useState("Standard Car");
  const [calculatorSurcharges, setCalculatorSurcharges] = useState({
    airport: false,
    night: false,
    holiday: false,
  });

  const handleRuleValueChange = (id: string, value: number) => {
    setPricingRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, value } : rule))
    );
    setHasChanges(true);
  };

  const handleToggleRule = (id: string) => {
    setPricingRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, active: !rule.active } : rule))
    );
    setHasChanges(true);
  };

  const handleVehiclePricingChange = (category: string, field: keyof VehiclePricing, value: number) => {
    setVehiclePricing((prev) =>
      prev.map((vehicle) =>
        vehicle.category === category ? { ...vehicle, [field]: value } : vehicle
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log("Saving pricing configuration:", { pricingRules, vehiclePricing });
    setHasChanges(false);
  };

  const handleReset = () => {
    setPricingRules(INITIAL_PRICING_RULES);
    setVehiclePricing(INITIAL_VEHICLE_PRICING);
    setHasChanges(false);
  };

  // Calculate fare
  const selectedVehicle = vehiclePricing.find(v => v.category === calculatorVehicle);
  let calculatedFare = 0;
  if (selectedVehicle) {
    calculatedFare = selectedVehicle.baseFare + (calculatorDistance * selectedVehicle.pricePerKm);

    // Apply surcharges
    if (calculatorSurcharges.airport) {
      const airportRule = pricingRules.find(r => r.id === "airport");
      if (airportRule) calculatedFare += airportRule.value;
    }
    if (calculatorSurcharges.night) {
      const nightRule = pricingRules.find(r => r.id === "night");
      if (nightRule) calculatedFare += (calculatedFare * nightRule.value) / 100;
    }
    if (calculatorSurcharges.holiday) {
      const holidayRule = pricingRules.find(r => r.id === "holiday");
      if (holidayRule) calculatedFare += (calculatedFare * holidayRule.value) / 100;
    }

    calculatedFare = Math.max(calculatedFare, selectedVehicle.minimumFare);
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Transport Pricing Configuration
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Configure base fares, surcharges, and pricing rules
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
            Pricing Configuration
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            Changes to pricing rules will apply to all new transfer bookings. Existing confirmed bookings will retain their original pricing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Pricing Rules */}
        <div className="col-span-2 space-y-6">
          {/* Vehicle Base Pricing */}
          <div>
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Vehicle Category Pricing
            </h3>
            <div className="space-y-3">
              {vehiclePricing.map((vehicle) => (
                <div
                  key={vehicle.category}
                  className="rounded-xl p-5"
                  style={{
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border-light)",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  <h4 className="text-[13px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {vehicle.category}
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] mb-2 block" style={{ color: "var(--text-tertiary)" }}>
                        Base Fare (LKR)
                      </label>
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{
                          background: "var(--input-background)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        <input
                          type="number"
                          value={vehicle.baseFare}
                          onChange={(e) => handleVehiclePricingChange(vehicle.category, "baseFare", Number(e.target.value))}
                          className="flex-1 bg-transparent text-[13px] outline-none"
                          style={{ color: "var(--text-primary)" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] mb-2 block" style={{ color: "var(--text-tertiary)" }}>
                        Price per km (LKR)
                      </label>
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{
                          background: "var(--input-background)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        <input
                          type="number"
                          value={vehicle.pricePerKm}
                          onChange={(e) => handleVehiclePricingChange(vehicle.category, "pricePerKm", Number(e.target.value))}
                          className="flex-1 bg-transparent text-[13px] outline-none"
                          style={{ color: "var(--text-primary)" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] mb-2 block" style={{ color: "var(--text-tertiary)" }}>
                        Minimum Fare (LKR)
                      </label>
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{
                          background: "var(--input-background)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        <input
                          type="number"
                          value={vehicle.minimumFare}
                          onChange={(e) => handleVehiclePricingChange(vehicle.category, "minimumFare", Number(e.target.value))}
                          className="flex-1 bg-transparent text-[13px] outline-none"
                          style={{ color: "var(--text-primary)" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Surcharge Rules */}
          <div>
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Surcharge Rules
            </h3>
            <div className="space-y-3">
              {pricingRules.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-xl p-5"
                  style={{
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border-light)",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: rule.active ? "rgba(34, 197, 94, 0.1)" : "rgba(100, 116, 139, 0.1)" }}
                      >
                        {rule.id === "airport" && <Plane size={16} style={{ color: rule.active ? "var(--success)" : "#64748b" }} />}
                        {rule.id === "night" && <Moon size={16} style={{ color: rule.active ? "var(--success)" : "#64748b" }} />}
                        {rule.id === "holiday" && <Calendar size={16} style={{ color: rule.active ? "var(--success)" : "#64748b" }} />}
                        {rule.id === "peak" && <TrendingUp size={16} style={{ color: rule.active ? "var(--success)" : "#64748b" }} />}
                      </div>
                      <div>
                        <h4 className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                          {rule.name}
                        </h4>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          {rule.type === "percentage" ? "Percentage-based" : "Fixed amount"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className="px-3 py-1.5 text-[11px] rounded-lg transition-all"
                      style={
                        rule.active
                          ? {
                              background: "rgba(34, 197, 94, 0.1)",
                              color: "var(--success)",
                              border: "1px solid rgba(34, 197, 94, 0.2)",
                              fontWeight: 600,
                            }
                          : {
                              background: "var(--input-background)",
                              border: "1px solid var(--border-light)",
                              color: "var(--text-secondary)",
                            }
                      }
                    >
                      {rule.active ? "Active" : "Inactive"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] mb-2 block" style={{ color: "var(--text-tertiary)" }}>
                        {rule.type === "percentage" ? "Percentage (%)" : "Amount (LKR)"}
                      </label>
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{
                          background: rule.active ? "var(--input-background)" : "rgba(255,255,255,0.02)",
                          border: "1px solid var(--border-light)",
                          opacity: rule.active ? 1 : 0.5,
                        }}
                      >
                        <input
                          type="number"
                          value={rule.value}
                          onChange={(e) => handleRuleValueChange(rule.id, Number(e.target.value))}
                          disabled={!rule.active}
                          className="flex-1 bg-transparent text-[13px] outline-none"
                          style={{ color: "var(--text-primary)" }}
                        />
                        {rule.type === "percentage" ? (
                          <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>%</span>
                        ) : (
                          <DollarSign size={14} style={{ color: "var(--text-tertiary)" }} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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

        {/* Right Column - Pricing Calculator */}
        <div className="space-y-4">
          <h3 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Pricing Calculator
          </h3>

          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={14} style={{ color: "var(--accent-navy)" }} />
              <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                Estimate transfer fare
              </p>
            </div>

            <div className="space-y-4">
              {/* Vehicle Selection */}
              <div>
                <label className="text-[11px] mb-2 block" style={{ color: "var(--text-tertiary)" }}>
                  Vehicle Category
                </label>
                <select
                  value={calculatorVehicle}
                  onChange={(e) => setCalculatorVehicle(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                >
                  {vehiclePricing.map((vehicle) => (
                    <option key={vehicle.category} value={vehicle.category}>
                      {vehicle.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distance */}
              <div>
                <label className="text-[11px] mb-2 block" style={{ color: "var(--text-tertiary)" }}>
                  Distance (km)
                </label>
                <input
                  type="number"
                  value={calculatorDistance}
                  onChange={(e) => setCalculatorDistance(Number(e.target.value))}
                  className="w-full px-3 py-2 text-[13px] rounded-lg"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Surcharges */}
              <div>
                <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>
                  Apply Surcharges
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calculatorSurcharges.airport}
                      onChange={(e) => setCalculatorSurcharges({ ...calculatorSurcharges, airport: e.target.checked })}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: "var(--accent-navy)" }}
                    />
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      Airport Surcharge
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calculatorSurcharges.night}
                      onChange={(e) => setCalculatorSurcharges({ ...calculatorSurcharges, night: e.target.checked })}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: "var(--accent-navy)" }}
                    />
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      Night Surcharge
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calculatorSurcharges.holiday}
                      onChange={(e) => setCalculatorSurcharges({ ...calculatorSurcharges, holiday: e.target.checked })}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: "var(--accent-navy)" }}
                    />
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      Holiday Surcharge
                    </span>
                  </label>
                </div>
              </div>

              {/* Calculated Fare */}
              <div
                className="rounded-lg p-4 mt-4"
                style={{
                  background: "rgba(34, 197, 94, 0.08)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                }}
              >
                <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>
                  Estimated Fare
                </p>
                <p className="text-[24px]" style={{ color: "var(--success)", fontWeight: 700 }}>
                  LKR {Math.round(calculatedFare).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

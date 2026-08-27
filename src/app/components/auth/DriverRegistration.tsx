import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Car,
  ArrowLeft,
  Upload,
  Search,
  CheckCircle2,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
  X,
} from "lucide-react";
import { useAuth, DriverRegistrationData, DriverLuggageCapacityInput } from "../../contexts/AuthContext";
import { apiFetch } from "../api/apiClient";

interface LuggageSizeType {
  id: string;
  name: string;
  dimensions_display?: string;
  description?: string;
  sort_order: number;
}

interface VehiclePreset {
  id: string;
  make: string;
  model: string;
  default_seats: number;
  default_luggage_capacity: Record<string, number>;
}

// Fallback luggage size types if server is cold/offline
const DEFAULT_LUGGAGE_TYPES: LuggageSizeType[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    name: "Small",
    dimensions_display: "55 x 35 x 20 cm",
    description: "Cabin / Carry-on (up to 10kg)",
    sort_order: 1,
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    name: "Medium",
    dimensions_display: "65 x 45 x 25 cm",
    description: "Medium suitcase (up to 20kg)",
    sort_order: 2,
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    name: "Large",
    dimensions_display: "75 x 50 x 30 cm",
    description: "Large check-in suitcase (up to 30kg)",
    sort_order: 3,
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    name: "Extra Large",
    dimensions_display: "85 x 60 x 35 cm",
    description: "Oversized / heavy luggage (30kg+)",
    sort_order: 4,
  },
];

// Fallback vehicle presets
const DEFAULT_VEHICLE_PRESETS: VehiclePreset[] = [
  { id: "p1", make: "Toyota", model: "Prius", default_seats: 4, default_luggage_capacity: { Small: 2, Medium: 2, Large: 1, "Extra Large": 0 } },
  { id: "p2", make: "Toyota", model: "Axio", default_seats: 4, default_luggage_capacity: { Small: 2, Medium: 2, Large: 2, "Extra Large": 0 } },
  { id: "p3", make: "Toyota", model: "Allion", default_seats: 4, default_luggage_capacity: { Small: 2, Medium: 2, Large: 2, "Extra Large": 0 } },
  { id: "p4", make: "Toyota", model: "Premio", default_seats: 4, default_luggage_capacity: { Small: 2, Medium: 2, Large: 2, "Extra Large": 0 } },
  { id: "p5", make: "Toyota", model: "Aqua", default_seats: 4, default_luggage_capacity: { Small: 2, Medium: 1, Large: 0, "Extra Large": 0 } },
  { id: "p6", make: "Toyota", model: "Corolla Cross", default_seats: 4, default_luggage_capacity: { Small: 3, Medium: 3, Large: 2, "Extra Large": 1 } },
  { id: "p7", make: "Toyota", model: "KDH / HiAce (Standard Roof)", default_seats: 9, default_luggage_capacity: { Small: 8, Medium: 6, Large: 5, "Extra Large": 3 } },
  { id: "p8", make: "Toyota", model: "HiAce Commuter (High Roof)", default_seats: 14, default_luggage_capacity: { Small: 10, Medium: 8, Large: 6, "Extra Large": 4 } },
  { id: "p9", make: "Toyota", model: "Land Cruiser Prado", default_seats: 6, default_luggage_capacity: { Small: 4, Medium: 4, Large: 3, "Extra Large": 2 } },
  { id: "p10", make: "Suzuki", model: "Wagon R (FX / FZ / Stingray)", default_seats: 4, default_luggage_capacity: { Small: 2, Medium: 1, Large: 0, "Extra Large": 0 } },
  { id: "p11", make: "Suzuki", model: "Spacia / Custom", default_seats: 4, default_luggage_capacity: { Small: 2, Medium: 1, Large: 0, "Extra Large": 0 } },
  { id: "p12", make: "Suzuki", model: "Every (Van)", default_seats: 4, default_luggage_capacity: { Small: 4, Medium: 3, Large: 2, "Extra Large": 1 } },
  { id: "p13", make: "Suzuki", model: "Alto (800 / K10)", default_seats: 4, default_luggage_capacity: { Small: 1, Medium: 1, Large: 0, "Extra Large": 0 } },
  { id: "p14", make: "Honda", model: "Grace", default_seats: 4, default_luggage_capacity: { Small: 2, Medium: 2, Large: 2, "Extra Large": 0 } },
  { id: "p15", make: "Honda", model: "Vezel / HR-V", default_seats: 4, default_luggage_capacity: { Small: 3, Medium: 2, Large: 2, "Extra Large": 0 } },
  { id: "p16", make: "Honda", model: "Fit / Jazz", default_seats: 4, default_luggage_capacity: { Small: 2, Medium: 2, Large: 1, "Extra Large": 0 } },
  { id: "p17", make: "Nissan", model: "Caravan NV350", default_seats: 9, default_luggage_capacity: { Small: 8, Medium: 6, Large: 5, "Extra Large": 3 } },
  { id: "p18", make: "Nissan", model: "X-Trail", default_seats: 5, default_luggage_capacity: { Small: 4, Medium: 3, Large: 2, "Extra Large": 1 } },
  { id: "p19", make: "Mitsubishi", model: "Outlander PHEV", default_seats: 5, default_luggage_capacity: { Small: 4, Medium: 3, Large: 2, "Extra Large": 1 } },
  { id: "p20", make: "Hyundai", model: "Staria", default_seats: 8, default_luggage_capacity: { Small: 6, Medium: 6, Large: 4, "Extra Large": 2 } },
];

interface DocumentUploadItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  file: File | null;
  previewUrl: string | null;
}

interface DriverRegistrationProps {
  onBackToRoleSelect?: () => void;
}

export function DriverRegistration({ onBackToRoleSelect }: DriverRegistrationProps = {}) {
  const { registerDriver } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Luggage Tiers & Vehicle Presets from API
  const [luggageTypes, setLuggageTypes] = useState<LuggageSizeType[]>(DEFAULT_LUGGAGE_TYPES);
  const [presets, setPresets] = useState<VehiclePreset[]>(DEFAULT_VEHICLE_PRESETS);
  const [isPresetsLoading, setIsPresetsLoading] = useState(true);

  // Form State - Personal
  const [fullName, setFullName] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Form State - Vehicle
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [isCustomVehicle, setIsCustomVehicle] = useState(false);
  const [presetSearch, setPresetSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState("");
  const [seats, setSeats] = useState<number | "">(4);
  const [luggageQuantities, setLuggageQuantities] = useState<Record<string, number>>({});

  // Documents
  const [documents, setDocuments] = useState<Record<string, DocumentUploadItem>>({
    license: {
      id: "license",
      label: "Driving License",
      description: "Clear photo or PDF of your valid Sri Lankan driving license (Front & Back)",
      required: true,
      file: null,
      previewUrl: null,
    },
    nic: {
      id: "nic",
      label: "National Identity Card (NIC)",
      description: "Front and back scans of your valid Sri Lankan NIC",
      required: true,
      file: null,
      previewUrl: null,
    },
    vehicleReg: {
      id: "vehicleReg",
      label: "Vehicle Registration (CR)",
      description: "Certificate of Registration (CR Book / Vehicle Ownership document)",
      required: true,
      file: null,
      previewUrl: null,
    },
    insurance: {
      id: "insurance",
      label: "Insurance & Revenue License",
      description: "Valid comprehensive commercial or rental insurance certificate & revenue license",
      required: true,
      file: null,
      previewUrl: null,
    },
    policeClearance: {
      id: "policeClearance",
      label: "Police Clearance Report",
      description: "Official Sri Lanka Police clearance report issued within the last 6 months",
      required: true,
      file: null,
      previewUrl: null,
    },
  });

  // Fetch presets & luggage size tiers from API on mount
  useEffect(() => {
    async function loadReferenceData() {
      try {
        setIsPresetsLoading(true);
        const [loadedLuggage, loadedPresets] = await Promise.all([
          apiFetch<LuggageSizeType[]>("/luggage-size-types").catch(() => DEFAULT_LUGGAGE_TYPES),
          apiFetch<VehiclePreset[]>("/vehicle-model-presets").catch(() => DEFAULT_VEHICLE_PRESETS),
        ]);

        if (Array.isArray(loadedLuggage) && loadedLuggage.length > 0) {
          setLuggageTypes(loadedLuggage);
        }
        if (Array.isArray(loadedPresets) && loadedPresets.length > 0) {
          setPresets(loadedPresets);
        }
      } catch (err) {
        console.warn("Using fallback presets and luggage types:", err);
      } finally {
        setIsPresetsLoading(false);
      }
    }
    loadReferenceData();
  }, []);

  // Initialize luggage quantities when luggageTypes change
  useEffect(() => {
    if (luggageTypes.length > 0) {
      setLuggageQuantities((prev) => {
        const initial: Record<string, number> = { ...prev };
        luggageTypes.forEach((t) => {
          if (initial[t.id] === undefined) {
            initial[t.id] = 0;
          }
        });
        return initial;
      });
    }
  }, [luggageTypes]);

  // Close vehicle dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered Presets for Search Dropdown
  const filteredPresets = useMemo(() => {
    if (!presetSearch.trim()) return presets;
    const query = presetSearch.toLowerCase();
    return presets.filter(
      (p) =>
        p.make.toLowerCase().includes(query) ||
        p.model.toLowerCase().includes(query) ||
        `${p.make} ${p.model}`.toLowerCase().includes(query)
    );
  }, [presets, presetSearch]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: VehiclePreset) => {
    setSelectedPresetId(preset.id);
    setIsCustomVehicle(false);
    setVehicleMake(preset.make);
    setVehicleModel(preset.model);
    setSeats(preset.default_seats || 4);

    // Auto-fill luggage capacity from defaults
    const updatedQuantities: Record<string, number> = {};
    luggageTypes.forEach((tier) => {
      const defaultValue =
        preset.default_luggage_capacity?.[tier.name] ??
        preset.default_luggage_capacity?.[tier.name.toLowerCase()] ??
        preset.default_luggage_capacity?.[tier.id] ??
        0;
      updatedQuantities[tier.id] = defaultValue;
    });
    setLuggageQuantities(updatedQuantities);

    setPresetSearch(`${preset.make} ${preset.model}`);
    setIsDropdownOpen(false);
  };

  // Handle "Not Listed" Selection
  const handleSelectNotListed = () => {
    setSelectedPresetId("");
    setIsCustomVehicle(true);
    setVehicleMake("");
    setVehicleModel("");
    setSeats("");

    // Reset luggage quantities to blank/0
    const resetQuantities: Record<string, number> = {};
    luggageTypes.forEach((tier) => {
      resetQuantities[tier.id] = 0;
    });
    setLuggageQuantities(resetQuantities);

    setPresetSearch("My vehicle isn't listed");
    setIsDropdownOpen(false);
  };

  // Handle Document File Change
  const handleFileChange = (docKey: string, file: File | null) => {
    if (!file) return;

    setDocuments((prev) => ({
      ...prev,
      [docKey]: {
        ...prev[docKey],
        file,
        previewUrl: URL.createObjectURL(file),
      },
    }));
  };

  const handleRemoveFile = (docKey: string) => {
    setDocuments((prev) => ({
      ...prev,
      [docKey]: {
        ...prev[docKey],
        file: null,
        previewUrl: null,
      },
    }));
  };

  const handleLuggageChange = (typeId: string, value: string) => {
    const parsed = parseInt(value, 10);
    setLuggageQuantities((prev) => ({
      ...prev,
      [typeId]: isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  };

  // Validate and submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validations
    if (!fullName.trim() || !nicNumber.trim() || !email.trim() || !phone.trim()) {
      setError("Please complete all personal information fields.");
      return;
    }

    if (!vehicleMake.trim() || !vehicleModel.trim() || !vehiclePlateNumber.trim()) {
      setError("Please complete all vehicle information fields.");
      return;
    }

    const numericSeats = typeof seats === "number" ? seats : parseInt(seats, 10);
    if (isNaN(numericSeats) || numericSeats < 1) {
      setError("Please provide a valid number of vehicle passenger seats.");
      return;
    }

    // Check required documents
    const missingDocs = Object.values(documents).filter((doc) => doc.required && !doc.file);
    if (missingDocs.length > 0) {
      setError(`Please upload all required verification documents: ${missingDocs.map((d) => d.label).join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      // Build luggage capacity array
      const capacities: DriverLuggageCapacityInput[] = luggageTypes.map((tier) => ({
        luggage_size_type_id: tier.id,
        quantity: luggageQuantities[tier.id] || 0,
      }));

      // Document URLs - in mock/simulation, generate descriptive object URLs or fallback URIs
      const driverData: DriverRegistrationData = {
        fullName: fullName.trim(),
        nicNumber: nicNumber.trim().toUpperCase(),
        email: email.trim(),
        phone: phone.trim(),
        password: password || undefined,
        vehicleModelPresetId: isCustomVehicle ? null : selectedPresetId || null,
        vehicleMake: vehicleMake.trim(),
        vehicleModel: vehicleModel.trim(),
        vehiclePlateNumber: vehiclePlateNumber.trim().toUpperCase(),
        seats: numericSeats,
        luggageCapacities: capacities,
        licenseNumber: nicNumber.trim().toUpperCase(),
        licensePhotoUrl: documents.license.file ? `uploads/drivers/license_${Date.now()}_${documents.license.file.name}` : undefined,
        nicPhotoUrl: documents.nic.file ? `uploads/drivers/nic_${Date.now()}_${documents.nic.file.name}` : undefined,
        vehicleRegistrationDocUrl: documents.vehicleReg.file ? `uploads/drivers/cr_${Date.now()}_${documents.vehicleReg.file.name}` : undefined,
        insuranceDocUrl: documents.insurance.file ? `uploads/drivers/insurance_${Date.now()}_${documents.insurance.file.name}` : undefined,
        policeClearanceDocUrl: documents.policeClearance.file ? `uploads/drivers/police_${Date.now()}_${documents.policeClearance.file.name}` : undefined,
      };

      await registerDriver(driverData);
      navigate("/pending");
    } catch (err: any) {
      console.error("Driver registration submission failed:", err);
      setError(err.message || "Failed to submit driver application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ background: "var(--bg-main)" }}
    >
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
              boxShadow: "0 0 24px rgba(59, 130, 246, 0.3)",
            }}
          >
            <Car size={32} className="text-white" />
          </div>
          <h1 className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Transfer Driver Registration
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>
            Join Tour Ceylon as a verified chauffeur and transfer partner (Airport & Inter-City Transfers)
          </p>
        </div>

        {/* Form Card */}
        <div
          className="rounded-xl p-6 sm:p-8"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {error && (
            <div
              className="mb-6 p-4 rounded-lg flex items-start gap-3 text-[13px]"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
              }}
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Section 1: Personal Information */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold"
                  style={{ background: "var(--active-overlay)", color: "var(--accent-navy-light)" }}
                >
                  1
                </div>
                <h3 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kasun Chamara Bandara"
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
                    National Identity Card (NIC) Number *
                  </label>
                  <input
                    type="text"
                    value={nicNumber}
                    onChange={(e) => setNicNumber(e.target.value)}
                    placeholder="e.g. 199012345678 or 901234567V"
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none uppercase"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@example.com"
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
                    Create Account Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                      className="w-full px-3 py-2.5 pr-10 rounded-lg text-[13px] outline-none"
                      style={{
                        background: "var(--input-background)",
                        border: "1px solid var(--border-light)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Vehicle Information */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold"
                  style={{ background: "var(--active-overlay)", color: "var(--accent-navy-light)" }}
                >
                  2
                </div>
                <h3 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  Vehicle Information & Capacity
                </h3>
              </div>

              {/* Searchable Preset Selector */}
              <div className="mb-4" ref={dropdownRef}>
                <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                  Select Vehicle Model (Make & Model) *
                </label>
                <div className="relative">
                  <div
                    onClick={() => setIsDropdownOpen(true)}
                    className="w-full px-3 py-2.5 rounded-lg text-[13px] flex items-center justify-between cursor-pointer"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: presetSearch ? "var(--text-primary)" : "var(--text-tertiary)",
                    }}
                  >
                    <span className="truncate">
                      {presetSearch || (isPresetsLoading ? "Loading vehicle models..." : "Search or choose vehicle model...")}
                    </span>
                    <ChevronDown size={16} className="text-gray-400 shrink-0 ml-2" />
                  </div>

                  {isDropdownOpen && (
                    <div
                      className="absolute left-0 right-0 top-full mt-1.5 rounded-xl z-30 overflow-hidden shadow-2xl"
                      style={{
                        background: "var(--bg-panel)",
                        border: "1px solid var(--border-light)",
                        maxHeight: "280px",
                      }}
                    >
                      {/* Search Input */}
                      <div className="p-2.5 border-b" style={{ borderColor: "var(--border-light)" }}>
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/20">
                          <Search size={14} className="text-gray-400 shrink-0" />
                          <input
                            type="text"
                            value={presetSearch}
                            onChange={(e) => setPresetSearch(e.target.value)}
                            placeholder="Type to filter make or model..."
                            autoFocus
                            className="w-full bg-transparent text-[12px] outline-none text-white placeholder-gray-500"
                          />
                          {presetSearch && (
                            <button
                              type="button"
                              onClick={() => setPresetSearch("")}
                              className="text-gray-400 hover:text-white"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dropdown Items */}
                      <div className="overflow-y-auto max-h-[190px] p-1 space-y-0.5">
                        {filteredPresets.map((preset) => (
                          <div
                            key={preset.id}
                            onClick={() => handleSelectPreset(preset)}
                            className="px-3 py-2 rounded-lg text-[13px] cursor-pointer flex items-center justify-between transition-colors hover:bg-white/5"
                            style={{
                              color: selectedPresetId === preset.id ? "var(--accent-navy-light)" : "var(--text-primary)",
                              background: selectedPresetId === preset.id ? "var(--active-overlay)" : "transparent",
                            }}
                          >
                            <div>
                              <span className="font-semibold">{preset.make}</span>{" "}
                              <span className="text-gray-300">{preset.model}</span>
                            </div>
                            <span className="text-[11px] text-gray-400">{preset.default_seats} seats</span>
                          </div>
                        ))}

                        {filteredPresets.length === 0 && (
                          <div className="p-3 text-center text-[12px] text-gray-400">
                            No matching presets found
                          </div>
                        )}

                        {/* "Not Listed" Option */}
                        <div
                          onClick={handleSelectNotListed}
                          className="px-3 py-2.5 rounded-lg text-[13px] cursor-pointer flex items-center gap-2 mt-1 border-t transition-colors hover:bg-blue-500/10 text-blue-400 font-medium"
                          style={{ borderColor: "var(--border-light)" }}
                        >
                          <span>+ My vehicle isn't listed (Enter manually)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[11px] mt-1 text-gray-400">
                  Selecting a preset model automatically fills recommended passenger seats and luggage breakdown.
                </p>
              </div>

              {/* If "Not Listed" or custom, show make and model text fields */}
              {isCustomVehicle && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-4 rounded-lg bg-blue-950/20 border border-blue-900/30">
                  <div>
                    <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                      Vehicle Make (Manufacturer) *
                    </label>
                    <input
                      type="text"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      placeholder="e.g. DFSK, Micro, Tata, etc."
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
                      Vehicle Model *
                    </label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Glory 580, Panda, etc."
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
              )}

              {/* Plate Number & Seats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                    Vehicle Plate Number *
                  </label>
                  <input
                    type="text"
                    value={vehiclePlateNumber}
                    onChange={(e) => setVehiclePlateNumber(e.target.value)}
                    placeholder="e.g. WP CAB-1234 or GA-5678"
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none uppercase"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                    Passenger Seats (Excluding Driver) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={seats}
                    onChange={(e) => setSeats(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                    placeholder="e.g. 4"
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

              {/* Dynamic Luggage Capacity Breakdown per Tier */}
              <div className="mt-4">
                <label className="block text-[12px] mb-2" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                  Luggage Capacity Breakdown (Number of Bags by Size Tier) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {luggageTypes.map((tier) => (
                    <div
                      key={tier.id}
                      className="p-3 rounded-lg flex flex-col justify-between"
                      style={{
                        background: "var(--input-background)",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      <div>
                        <span className="text-[13px] font-semibold block" style={{ color: "var(--text-primary)" }}>
                          {tier.name}
                        </span>
                        <span className="text-[10px] text-gray-400 block mb-2">
                          {tier.dimensions_display || tier.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={luggageQuantities[tier.id] ?? 0}
                          onChange={(e) => handleLuggageChange(tier.id, e.target.value)}
                          className="w-full px-2 py-1.5 rounded text-[13px] text-center font-semibold outline-none"
                          style={{
                            background: "var(--bg-panel)",
                            border: "1px solid var(--border-light)",
                            color: "var(--text-primary)",
                          }}
                        />
                        <span className="text-[11px] text-gray-400">bags</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Verification Documents */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold"
                  style={{ background: "var(--active-overlay)", color: "var(--accent-navy-light)" }}
                >
                  3
                </div>
                <h3 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  Driver & Vehicle Verification Documents
                </h3>
              </div>

              <div className="space-y-3.5">
                {Object.values(documents).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl transition-all"
                    style={{
                      background: doc.file ? "rgba(34, 197, 94, 0.05)" : "var(--accent-navy-subtle)",
                      border: doc.file ? "1px solid rgba(34, 197, 94, 0.3)" : "1px dashed var(--border-accent)",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            background: doc.file ? "rgba(34, 197, 94, 0.15)" : "var(--active-overlay)",
                            color: doc.file ? "#22c55e" : "var(--accent-navy-light)",
                          }}
                        >
                          {doc.file ? <CheckCircle2 size={18} /> : <FileText size={18} />}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                            {doc.label} {doc.required && <span className="text-red-400">*</span>}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{doc.description}</p>
                          {doc.file && (
                            <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                              <span>✓ Attached: {doc.file.name} ({(doc.file.size / 1024).toFixed(0)} KB)</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* File Upload Button / Trigger */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {doc.file ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(doc.id)}
                            className="px-3 py-1.5 rounded-lg text-[11px] text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                          >
                            Remove
                          </button>
                        ) : null}

                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileChange(doc.id, e.target.files[0]);
                              }
                            }}
                          />
                          <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                            style={{
                              background: doc.file ? "var(--input-background)" : "var(--accent-navy-dark)",
                              color: doc.file ? "var(--text-secondary)" : "white",
                              border: "1px solid var(--border-accent)",
                            }}
                          >
                            <Upload size={13} />
                            <span>{doc.file ? "Replace File" : "Choose File"}</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "var(--border-light)" }}>
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
                className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  background: loading
                    ? "var(--border-medium)"
                    : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "white",
                  boxShadow: loading ? "none" : "0 0 16px rgba(37, 99, 235, 0.4)",
                  border: "1px solid rgba(59, 130, 246, 0.5)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Driver Profile...</span>
                  </>
                ) : (
                  <span>Submit Driver Application</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

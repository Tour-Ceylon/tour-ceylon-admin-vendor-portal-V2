import { useState, useEffect } from "react";
import {
  Settings,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useStayHotel, StayHotelPropertyGate } from "./StayHotelContext";
import { updateStayProperty } from "../api/stayVendorApi";

const AMENITIES_LIST = [
  "Free WiFi",
  "Swimming Pool",
  "Spa & Wellness",
  "Restaurant",
  "Room Service",
  "Airport Transfer",
  "Fitness Center",
  "Beach Access",
  "Nature Walks",
  "Safari Packages",
  "Kids Club",
  "Bar & Lounge",
  "Conference Room",
  "Laundry Service",
  "Bicycle Rental",
  "Garden",
  "Free Parking",
  "24h Reception",
];

function PropertySettingsContent() {
  const { selectedProperty, refreshProperties } = useStayHotel();

  // Basic info state
  const [name, setName] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [starRating, setStarRating] = useState("");
  const [totalRooms, setTotalRooms] = useState("");
  const [description, setDescription] = useState("");

  // Location state
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("Sri Lanka");
  const [postalCode, setPostalCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Contact state
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Amenities
  const [amenities, setAmenities] = useState<string[]>([]);

  // UI state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync form with selectedProperty
  useEffect(() => {
    if (!selectedProperty) return;

    setName(selectedProperty.name || "");
    setPropertyType(selectedProperty.propertyType || "Hotel");
    setDescription(selectedProperty.description || "");
    setAddress(selectedProperty.address || "");
    setCity(selectedProperty.city || "");
    setDistrict(selectedProperty.district || "");
    setLatitude(selectedProperty.latitude != null ? String(selectedProperty.latitude) : "");
    setLongitude(selectedProperty.longitude != null ? String(selectedProperty.longitude) : "");

    const contact = (selectedProperty.contact as Record<string, string>) || {};
    setPhone(contact.phone || "");
    setEmail(contact.email || "");
    setWebsite(contact.website || "");
    setWhatsapp(contact.whatsapp || "");

    const metadata = (selectedProperty.metadata as Record<string, any>) || {};
    setStarRating(metadata.starRating || "4 Stars");
    setTotalRooms(metadata.totalRooms ? String(metadata.totalRooms) : "");
    setProvince(metadata.province || "");
    setCountry(metadata.country || "Sri Lanka");
    setPostalCode(metadata.postalCode || "");
    setAmenities(Array.isArray(metadata.amenities) ? metadata.amenities : []);
  }, [selectedProperty?.id, selectedProperty?.updatedAt]);

  const toggleAmenity = (a: string) => {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProperty?.id) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        name,
        propertyType,
        description,
        address,
        city,
        district,
        latitude: latitude ? Number(latitude) || latitude : null,
        longitude: longitude ? Number(longitude) || longitude : null,
        contact: {
          phone,
          email,
          website,
          whatsapp,
        },
        metadata: {
          ...((selectedProperty.metadata as Record<string, any>) || {}),
          starRating,
          totalRooms: totalRooms ? Number(totalRooms) || totalRooms : null,
          province,
          country,
          postalCode,
          amenities,
        },
      };

      await updateStayProperty(selectedProperty.id, payload as any);
      await refreshProperties();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to update property settings:", err);
      setSaveError(err.message || "Failed to update property settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="p-6 space-y-6 max-w-[1000px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={15} style={{ color: "var(--accent-navy-light)" }} />
            <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "var(--accent-navy-light)" }}>
              Property Settings
            </span>
          </div>
          <h1 className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {name || selectedProperty?.name || "Property Profile"}
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
              <span>Save Changes</span>
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

      {/* Basic Info */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <Building2 size={15} style={{ color: "var(--accent-navy-light)" }} />
          <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Property Information
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Property Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jetwing Yala, Ella Nature Villa"
              required
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-colors"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-colors"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              <option value="Hotel">Hotel</option>
              <option value="Resort">Resort</option>
              <option value="Villa">Villa / Boutique Villa</option>
              <option value="Homestay">Homestay / Guesthouse</option>
              <option value="Eco Lodge">Eco Lodge</option>
              <option value="Apartment">Serviced Apartment</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Star Rating
            </label>
            <select
              value={starRating}
              onChange={(e) => setStarRating(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-colors"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              <option value="5 Stars">5 Stars</option>
              <option value="4 Stars">4 Stars</option>
              <option value="3 Stars">3 Stars</option>
              <option value="Boutique / Luxury">Boutique / Luxury</option>
              <option value="Standard">Standard</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Total Number of Units
            </label>
            <input
              type="number"
              value={totalRooms}
              onChange={(e) => setTotalRooms(e.target.value)}
              placeholder="e.g. 12"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-colors"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Tell guests about your property, location ambiance, and unique features..."
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none transition-colors"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <MapPin size={15} style={{ color: "var(--accent-navy-light)" }} />
          <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Location & Address
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Street Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 124 Beach Road, Yala"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              City
            </label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Yala, Ella, Colombo"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              District
            </label>
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Hambantota, Badulla, Galle"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Province
            </label>
            <input
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="e.g. Southern Province, Uva Province"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Country
            </label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Sri Lanka"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Latitude
            </label>
            <input
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g. 6.3829"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Longitude
            </label>
            <input
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g. 81.5052"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <Phone size={15} style={{ color: "var(--accent-navy-light)" }} />
          <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Contact & Reservation Desk
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +94 47 223 9000"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. reservations@hotel.com"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Official Website
            </label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. https://www.yourhotel.com"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              WhatsApp Contact
            </label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. +94 77 123 4567"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* Amenities Checklist */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <div className="flex items-center gap-2">
            <Star size={15} style={{ color: "var(--accent-navy-light)" }} />
            <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Property Amenities
            </span>
          </div>
          <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            {amenities.length} selected
          </span>
        </div>
        <div className="p-5 flex flex-wrap gap-2">
          {AMENITIES_LIST.map((a) => {
            const active = amenities.includes(a);
            return (
              <button
                type="button"
                key={a}
                onClick={() => toggleAmenity(a)}
                className="px-3 py-1.5 rounded-lg text-[12px] transition-all"
                style={{
                  background: active ? "var(--active-overlay)" : "var(--bg-panel)",
                  color: active ? "var(--accent-navy-light)" : "var(--text-secondary)",
                  border: `1px solid ${active ? "var(--border-accent)" : "var(--border-light)"}`,
                  boxShadow: active ? "inset 0 0 0 1px var(--border-accent)" : "none",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>
    </form>
  );
}

export function PropertySettings() {
  return (
    <StayHotelPropertyGate>
      <PropertySettingsContent />
    </StayHotelPropertyGate>
  );
}

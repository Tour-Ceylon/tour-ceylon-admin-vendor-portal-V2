import { useState } from "react";
import { Settings, MapPin, Phone, Mail, Globe, Star, Building2, Save } from "lucide-react";

const AMENITIES = [
  "Free WiFi", "Swimming Pool", "Spa & Wellness", "Restaurant", "Room Service",
  "Airport Transfer", "Fitness Center", "Beach Access", "Nature Walks",
  "Safari Packages", "Kids Club", "Bar & Lounge", "Conference Room",
  "Laundry Service", "Bicycle Rental", "Garden", "Free Parking", "24h Reception",
];

export function PropertySettings() {
  const [amenities, setAmenities] = useState<string[]>([
    "Free WiFi", "Swimming Pool", "Spa & Wellness", "Restaurant", "Room Service",
    "Airport Transfer", "Beach Access", "Nature Walks", "Bar & Lounge",
  ]);
  const [saved, setSaved] = useState(false);

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-[900px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={15} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>Property Settings</span>
          </div>
          <h1 className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>Jetwing Yala</h1>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] transition-all"
          style={{
            background: saved ? "rgba(34,197,94,0.15)" : "var(--accent-navy)",
            color: saved ? "#4ade80" : "white",
            fontWeight: 600,
            boxShadow: saved ? "none" : "0 0 12px var(--border-accent)",
            border: saved ? "1px solid rgba(34,197,94,0.3)" : "none",
          }}
        >
          <Save size={14} />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Basic info */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <div className="flex items-center gap-2">
            <Building2 size={13} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Property Information</span>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          {[
            { label: "Property Name", value: "Jetwing Yala", icon: Building2 },
            { label: "Property Type", value: "Eco Safari Lodge", icon: Star },
            { label: "Star Rating", value: "5 Stars", icon: Star },
            { label: "Total Rooms", value: "39", icon: Building2 },
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
          <div className="col-span-2">
            <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Description</label>
            <textarea
              defaultValue="Nestled in the heart of Yala National Park, Jetwing Yala is a premier eco-lodge offering an unparalleled wildlife experience. Surrounded by the natural splendor of Sri Lanka's most visited national park, our property blends luxury with nature."
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-navy)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <div className="flex items-center gap-2">
            <MapPin size={13} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Location</span>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          {[
            { label: "Street Address", value: "Yala National Park Road" },
            { label: "City", value: "Tissamaharama" },
            { label: "District", value: "Hambantota" },
            { label: "Province", value: "Southern Province" },
            { label: "Country", value: "Sri Lanka" },
            { label: "Postal Code", value: "82600" },
            { label: "Latitude", value: "6.3829° N" },
            { label: "Longitude", value: "81.5052° E" },
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

      {/* Contact */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Contact Details</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          {[
            { label: "Phone", value: "+94 47 239 5000", icon: Phone },
            { label: "Email", value: "yala@jetwinghotels.com", icon: Mail },
            { label: "Website", value: "www.jetwinghotels.com/yala", icon: Globe },
            { label: "WhatsApp", value: "+94 77 778 8990", icon: Phone },
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

      {/* Amenities */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Amenities</span>
            <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{amenities.length} selected</span>
          </div>
        </div>
        <div className="p-5 flex flex-wrap gap-2">
          {AMENITIES.map((a) => {
            const active = amenities.includes(a);
            return (
              <button
                key={a}
                onClick={() => toggleAmenity(a)}
                className="px-3 py-1.5 rounded-lg text-[12px] transition-all"
                style={{
                  background: active ? "var(--active-overlay)" : "var(--bg-panel)",
                  color: active ? "var(--accent-navy-light)" : "var(--text-secondary)",
                  border: `1px solid ${active ? "var(--border-accent)" : "var(--border-light)"}`,
                  boxShadow: active ? "inset 0 0 0 1px var(--border-accent)" : "none",
                }}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

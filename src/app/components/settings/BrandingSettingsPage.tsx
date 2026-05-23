import { Palette, Image, FileText, Globe, Upload } from "lucide-react";

export function BrandingSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Branding & CMS Settings
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Customize logos, colors, and content management
        </p>
      </div>

      {/* Brand Assets */}
      <div className="grid grid-cols-3 gap-6">
        {/* Logo Upload */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.15)" }}
              >
                <Image size={16} style={{ color: "#3b82f6" }} />
              </div>
              <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Platform Logo
              </h2>
            </div>
          </div>
          <div className="p-5">
            <div
              className="rounded-lg p-8 text-center cursor-pointer border-2 border-dashed transition-all"
              style={{ borderColor: "var(--border-light)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)";
              }}
            >
              <Upload size={32} style={{ color: "var(--text-tertiary)", margin: "0 auto 12px" }} />
              <p className="text-[12px] mb-1" style={{ color: "var(--text-primary)" }}>
                Click to upload logo
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                PNG or SVG, max 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Favicon */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(139,92,246,0.15)" }}
              >
                <Globe size={16} style={{ color: "#8b5cf6" }} />
              </div>
              <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Favicon
              </h2>
            </div>
          </div>
          <div className="p-5">
            <div
              className="rounded-lg p-8 text-center cursor-pointer border-2 border-dashed transition-all"
              style={{ borderColor: "var(--border-light)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)";
              }}
            >
              <Upload size={32} style={{ color: "var(--text-tertiary)", margin: "0 auto 12px" }} />
              <p className="text-[12px] mb-1" style={{ color: "var(--text-primary)" }}>
                Upload favicon
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                ICO or PNG, 32x32px
              </p>
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(236,72,153,0.15)" }}
              >
                <Palette size={16} style={{ color: "#ec4899" }} />
              </div>
              <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Brand Colors
              </h2>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: "Primary Color", value: "#1e40af" },
              { label: "Secondary Color", value: "#3b82f6" },
              { label: "Accent Color", value: "#60a5fa" },
            ].map((color) => (
              <div key={color.label}>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  {color.label}
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border"
                    style={{ background: color.value, borderColor: "var(--border-light)" }}
                  />
                  <input
                    type="text"
                    defaultValue={color.value}
                    className="flex-1 px-3 py-2 rounded-lg text-[13px]"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.15)" }}
            >
              <FileText size={16} style={{ color: "#22c55e" }} />
            </div>
            <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              SEO & Meta Settings
            </h2>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: "Site Title", value: "Travel Ready Tours - Your Adventure Awaits", type: "text" },
            { label: "Meta Description", value: "Discover amazing tours, safaris, and experiences in Sri Lanka", type: "textarea" },
            { label: "Meta Keywords", value: "tours, safaris, sri lanka, experiences, travel", type: "text" },
            { label: "OG Image URL", value: "https://cdn.voyage.com/og-image.jpg", type: "text" },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  defaultValue={field.value}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                    resize: "vertical",
                  }}
                />
              ) : (
                <input
                  type="text"
                  defaultValue={field.value}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Featured Content */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(245,158,11,0.15)" }}
              >
                <Image size={16} style={{ color: "#f59e0b" }} />
              </div>
              <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Featured Destinations
              </h2>
            </div>
            <button
              className="px-3 py-1.5 rounded-lg text-[11px]"
              style={{
                background: "var(--active-overlay)",
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
                fontWeight: 500,
              }}
            >
              Manage Featured
            </button>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-4 gap-4">
            {["Yala National Park", "Sigiriya Rock", "Galle Fort", "Ella"].map((dest) => (
              <div
                key={dest}
                className="rounded-lg p-3"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {dest}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          className="px-4 py-2 rounded-lg text-[12px]"
          style={{
            background: "var(--input-background)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-light)",
            fontWeight: 500,
          }}
        >
          Reset Changes
        </button>
        <button
          className="px-4 py-2 rounded-lg text-[12px]"
          style={{
            background: "var(--active-overlay)",
            color: "var(--accent-navy-light)",
            border: "1px solid var(--border-accent)",
            fontWeight: 500,
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

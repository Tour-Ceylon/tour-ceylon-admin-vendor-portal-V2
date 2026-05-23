import { ShoppingBag, Calendar, XCircle, CheckCircle, Percent, Clock, FileText } from "lucide-react";

export function MarketplaceSettingsPage() {
  const settingSections = [
    {
      title: "Booking Rules",
      icon: Calendar,
      color: "#3b82f6",
      settings: [
        { label: "Minimum Booking Notice", value: "24 hours", type: "select" },
        { label: "Maximum Advance Booking", value: "12 months", type: "select" },
        { label: "Allow Same-Day Bookings", value: true, type: "toggle" },
        { label: "Require Booking Confirmation", value: true, type: "toggle" },
      ],
    },
    {
      title: "Cancellation Policies",
      icon: XCircle,
      color: "#ef4444",
      settings: [
        { label: "Default Cancellation Window", value: "48 hours", type: "select" },
        { label: "Full Refund Period", value: "7 days before", type: "select" },
        { label: "Partial Refund Period", value: "3 days before", type: "select" },
        { label: "Allow Vendor Custom Policies", value: true, type: "toggle" },
      ],
    },
    {
      title: "Commission & Fees",
      icon: Percent,
      color: "#22c55e",
      settings: [
        { label: "Default Commission Rate", value: "15%", type: "input" },
        { label: "Premium Vendor Rate", value: "12%", type: "input" },
        { label: "Booking Processing Fee", value: "$2.50", type: "input" },
        { label: "Apply Commission on Taxes", value: false, type: "toggle" },
      ],
    },
    {
      title: "Approval Requirements",
      icon: CheckCircle,
      color: "#10b981",
      settings: [
        { label: "Require Vendor Verification", value: true, type: "toggle" },
        { label: "Auto-Approve Listings (Verified Vendors)", value: false, type: "toggle" },
        { label: "Require Admin Approval for Price Changes", value: false, type: "toggle" },
        { label: "Review Moderation", value: "Automated", type: "select" },
      ],
    },
    {
      title: "Payout Settings",
      icon: Clock,
      color: "#f59e0b",
      settings: [
        { label: "Payout Schedule", value: "Monthly", type: "select" },
        { label: "Payout Day", value: "25th of each month", type: "select" },
        { label: "Minimum Payout Threshold", value: "$50", type: "input" },
        { label: "Hold Funds After Booking", value: "7 days", type: "select" },
      ],
    },
    {
      title: "Listing Visibility",
      icon: FileText,
      color: "#8b5cf6",
      settings: [
        { label: "Show Pending Listings to Public", value: false, type: "toggle" },
        { label: "Auto-Deactivate Inactive Listings", value: true, type: "toggle" },
        { label: "Inactivity Threshold", value: "90 days", type: "select" },
        { label: "Featured Listings Limit", value: "10", type: "input" },
      ],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Marketplace Settings
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Configure booking rules, policies, and marketplace operations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Rules", value: "12", icon: ShoppingBag, color: "#3b82f6" },
          { label: "Commission Rate", value: "15%", icon: Percent, color: "#22c55e" },
          { label: "Cancellation Window", value: "48h", icon: XCircle, color: "#ef4444" },
          { label: "Payout Cycle", value: "Monthly", icon: Clock, color: "#f59e0b" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-[22px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {stat.value}
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-2 gap-6">
        {settingSections.map((section) => (
          <div
            key={section.title}
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
                  style={{ background: `${section.color}15` }}
                >
                  <section.icon size={16} style={{ color: section.color }} />
                </div>
                <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {section.title}
                </h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {section.settings.map((setting, index) => (
                <div key={index}>
                  <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                    {setting.label}
                  </label>
                  {setting.type === "toggle" ? (
                    <div
                      className="w-10 h-6 rounded-full relative transition-all cursor-pointer"
                      style={{
                        background: setting.value ? section.color : "var(--border-medium)",
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full absolute top-1 transition-all"
                        style={{
                          background: "white",
                          left: setting.value ? "20px" : "4px",
                        }}
                      />
                    </div>
                  ) : setting.type === "input" ? (
                    <input
                      type="text"
                      defaultValue={setting.value as string}
                      className="w-full px-3 py-2 rounded-lg text-[13px]"
                      style={{
                        background: "var(--input-background)",
                        border: "1px solid var(--border-light)",
                        color: "var(--text-primary)",
                      }}
                    />
                  ) : (
                    <select
                      defaultValue={setting.value as string}
                      className="w-full px-3 py-2 rounded-lg text-[13px]"
                      style={{
                        background: "var(--input-background)",
                        border: "1px solid var(--border-light)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <option>{setting.value}</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
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

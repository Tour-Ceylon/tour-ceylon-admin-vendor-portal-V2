import { DollarSign, Percent, Calendar, CreditCard } from "lucide-react";

export function FinanceSettingsPage() {
  const financeSettings = [
    {
      title: "Commission Rates",
      icon: Percent,
      color: "#22c55e",
      settings: [
        { label: "Default Commission Rate", value: "15%", type: "input" },
        { label: "Premium Vendor Rate", value: "12%", type: "input" },
        { label: "New Vendor Promotion Rate", value: "10%", type: "input" },
        { label: "High-Volume Discount (>100 bookings/month)", value: "13%", type: "input" },
      ],
    },
    {
      title: "Payout Settings",
      icon: Calendar,
      color: "#3b82f6",
      settings: [
        { label: "Payout Frequency", value: "Monthly", type: "select" },
        { label: "Payout Day", value: "25", type: "select" },
        { label: "Minimum Payout Amount", value: "$50", type: "input" },
        { label: "Hold Period After Booking", value: "7 days", type: "select" },
        { label: "Currency", value: "USD", type: "select" },
      ],
    },
    {
      title: "Tax & Fees",
      icon: DollarSign,
      color: "#f59e0b",
      settings: [
        { label: "Default Tax Rate", value: "0%", type: "input" },
        { label: "Processing Fee", value: "$2.50", type: "input" },
        { label: "Apply Tax on Commission", value: false, type: "toggle" },
        { label: "Include Tax in Price", value: true, type: "toggle" },
      ],
    },
    {
      title: "Refund Policies",
      icon: CreditCard,
      color: "#ef4444",
      settings: [
        { label: "Default Refund Window", value: "48 hours", type: "select" },
        { label: "Full Refund Period", value: "7 days before", type: "select" },
        { label: "Partial Refund Percentage", value: "50%", type: "input" },
        { label: "Auto-Approve Refunds Under", value: "$100", type: "input" },
      ],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Finance & Payment Settings
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Configure commissions, payouts, and payment settings
        </p>
      </div>

      {/* Finance Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Commission Rate", value: "15%", icon: Percent, color: "#22c55e" },
          { label: "Next Payout", value: "25th", icon: Calendar, color: "#3b82f6" },
          { label: "Processing Fee", value: "$2.50", icon: DollarSign, color: "#f59e0b" },
          { label: "Refund Window", value: "48h", icon: CreditCard, color: "#ef4444" },
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

      {/* Finance Settings Sections */}
      <div className="grid grid-cols-2 gap-6">
        {financeSettings.map((section) => (
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

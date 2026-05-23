import { FolderTree, Building2, Compass, Globe, Anchor, Car, Plus, Edit, Settings as SettingsIcon } from "lucide-react";

type Category = {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  activeListings: number;
  totalVendors: number;
  approvalRequired: boolean;
  customFields: number;
};

export function CategoryManagementPage() {
  const categories: Category[] = [
    {
      id: "stay",
      name: "Stay",
      icon: Building2,
      color: "#3b82f6",
      activeListings: 247,
      totalVendors: 89,
      approvalRequired: true,
      customFields: 12,
    },
    {
      id: "tour",
      name: "Tour",
      icon: Compass,
      color: "#10b981",
      activeListings: 156,
      totalVendors: 42,
      approvalRequired: true,
      customFields: 8,
    },
    {
      id: "safari",
      name: "Safari",
      icon: Globe,
      color: "#f59e0b",
      activeListings: 98,
      totalVendors: 28,
      approvalRequired: true,
      customFields: 10,
    },
    {
      id: "experience",
      name: "Experience",
      icon: Anchor,
      color: "#8b5cf6",
      activeListings: 134,
      totalVendors: 56,
      approvalRequired: false,
      customFields: 6,
    },
    {
      id: "transfer",
      name: "Transfer",
      icon: Car,
      color: "#ec4899",
      activeListings: 67,
      totalVendors: 18,
      approvalRequired: true,
      customFields: 9,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Category Management
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Manage listing categories, custom fields, and category-specific settings
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-[12px] flex items-center gap-2"
          style={{
            background: "var(--active-overlay)",
            color: "var(--accent-navy-light)",
            border: "1px solid var(--border-accent)",
            fontWeight: 500,
          }}
        >
          <Plus size={14} />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Categories", value: "5", icon: FolderTree, color: "#3b82f6" },
          { label: "Active Listings", value: "702", icon: SettingsIcon, color: "#10b981" },
          { label: "Total Vendors", value: "233", icon: Building2, color: "#8b5cf6" },
          { label: "Custom Fields", value: "45", icon: Edit, color: "#f59e0b" },
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

      {/* Categories */}
      <div className="grid grid-cols-2 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
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
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${category.color}15` }}
                  >
                    <category.icon size={20} style={{ color: category.color }} />
                  </div>
                  <div>
                    <h2 className="text-[14px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {category.name}
                    </h2>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {category.activeListings} active listings
                    </p>
                  </div>
                </div>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Edit size={14} />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  Total Vendors
                </span>
                <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {category.totalVendors}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  Custom Fields
                </span>
                <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {category.customFields}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  Approval Required
                </span>
                <div
                  className="w-10 h-6 rounded-full relative transition-all"
                  style={{
                    background: category.approvalRequired ? category.color : "var(--border-medium)",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full absolute top-1 transition-all"
                    style={{
                      background: "white",
                      left: category.approvalRequired ? "20px" : "4px",
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="px-5 py-3" style={{ background: "var(--input-background)", borderTop: "1px solid var(--border-light)" }}>
              <button
                className="text-[12px] w-full py-2 rounded-lg transition-all"
                style={{
                  color: category.color,
                  border: "1px solid var(--border-light)",
                  fontWeight: 500,
                }}
              >
                Configure Fields
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

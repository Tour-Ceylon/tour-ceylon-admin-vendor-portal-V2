import { useNavigate } from "react-router";
import {
  Settings,
  Shield,
  ShoppingBag,
  FolderTree,
  Bell,
  Lock,
  Palette,
  DollarSign,
  FileText,
  Plug,
  ChevronRight,
  Server,
  Database,
  Users,
} from "lucide-react";

interface SettingCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  path: string;
  stats?: { label: string; value: string };
}

export function SystemSettingsDashboard() {
  const navigate = useNavigate();

  const settingCategories: SettingCategory[] = [
    {
      id: "roles",
      title: "Roles & Permissions",
      description: "Manage admin roles, permissions, and access control",
      icon: Shield,
      color: "#8b5cf6",
      path: "/settings/roles",
      stats: { label: "Active Roles", value: "7" },
    },
    {
      id: "marketplace",
      title: "Marketplace Settings",
      description: "Configure booking rules, policies, and operational controls",
      icon: ShoppingBag,
      color: "#3b82f6",
      path: "/settings/marketplace",
      stats: { label: "Active Rules", value: "12" },
    },
    {
      id: "categories",
      title: "Category Management",
      description: "Manage listing categories, fields, and requirements",
      icon: FolderTree,
      color: "#10b981",
      path: "/settings/categories",
      stats: { label: "Categories", value: "5" },
    },
    {
      id: "notifications",
      title: "Notification Settings",
      description: "Configure email, in-app, and notification preferences",
      icon: Bell,
      color: "#f59e0b",
      path: "/settings/notifications",
      stats: { label: "Templates", value: "18" },
    },
    {
      id: "security",
      title: "Security & Access",
      description: "Manage security policies, sessions, and access controls",
      icon: Lock,
      color: "#ef4444",
      path: "/settings/security",
      stats: { label: "Active Sessions", value: "24" },
    },
    {
      id: "branding",
      title: "Branding & CMS",
      description: "Customize logos, colors, and content management",
      icon: Palette,
      color: "#ec4899",
      path: "/settings/branding",
      stats: { label: "Assets", value: "8" },
    },
    {
      id: "finance",
      title: "Finance & Payments",
      description: "Configure commissions, payouts, and payment settings",
      icon: DollarSign,
      color: "#22c55e",
      path: "/settings/finance",
      stats: { label: "Commission Rate", value: "15%" },
    },
    {
      id: "audit",
      title: "Audit & System Logs",
      description: "View system logs, changes, and activity tracking",
      icon: FileText,
      color: "#64748b",
      path: "/settings/audit",
      stats: { label: "Events Today", value: "142" },
    },
    {
      id: "integrations",
      title: "Integrations",
      description: "Manage third-party integrations and API connections",
      icon: Plug,
      color: "#06b6d4",
      path: "/settings/integrations",
      stats: { label: "Connected", value: "3" },
    },
  ];

  const systemStats = [
    { label: "Platform Version", value: "2.4.1", icon: Server, color: "#3b82f6" },
    { label: "Database Status", value: "Healthy", icon: Database, color: "#22c55e" },
    { label: "Total Users", value: "1,247", icon: Users, color: "#8b5cf6" },
    { label: "Uptime", value: "99.98%", icon: Settings, color: "#10b981" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          System Settings
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Configure platform settings, roles, permissions, and system-wide controls
        </p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-4 gap-4">
        {systemStats.map((stat) => (
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

      {/* Settings Categories */}
      <div>
        <h2 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Settings Categories
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {settingCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate(category.path)}
              className="rounded-xl p-5 cursor-pointer transition-all group"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${category.color}15` }}
                >
                  <category.icon size={20} style={{ color: category.color }} />
                </div>
                <ChevronRight
                  size={18}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--accent-navy-light)" }}
                />
              </div>
              <h3 className="text-[14px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {category.title}
              </h3>
              <p className="text-[12px] mb-3" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {category.description}
              </p>
              {category.stats && (
                <div
                  className="pt-3"
                  style={{ borderTop: "1px solid var(--border-light)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {category.stats.label}
                    </span>
                    <span className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {category.stats.value}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--accent-navy-subtle)",
          border: "1px solid var(--border-accent)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(59,130,246,0.2)" }}
          >
            <Settings size={18} style={{ color: "var(--accent-navy-light)" }} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              System Configuration
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              These settings control critical platform operations. Changes may affect vendor operations, booking flows, and customer experience. Always review changes carefully before applying.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

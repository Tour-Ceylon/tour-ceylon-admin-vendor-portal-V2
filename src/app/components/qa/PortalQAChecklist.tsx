import {
  CheckCircle,
  Circle,
  AlertCircle,
  Database,
  Server,
  Layout,
  Users,
  Package,
  DollarSign,
  Settings,
  BarChart3,
  FileText,
  MessageSquare,
  Car,
  Building2,
  Shield,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface QAItem {
  name: string;
  status: "completed" | "partial" | "pending" | "mock_data";
  description: string;
  details?: string[];
}

interface QAModule {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  items: QAItem[];
}

const QA_MODULES: QAModule[] = [
  {
    name: "Core Pages & Navigation",
    icon: Layout,
    color: "#3b82f6",
    items: [
      {
        name: "Dashboard (Admin & Vendor)",
        status: "completed",
        description: "Main dashboard with metrics and quick actions",
        details: ["Revenue metrics", "Activity feed", "Quick stats", "Role-based views"],
      },
      {
        name: "Sidebar Navigation",
        status: "completed",
        description: "Dynamic navigation based on user role",
        details: ["Admin navigation", "Vendor navigation", "Hotel vendor navigation", "Active states"],
      },
      {
        name: "Header & User Menu",
        status: "completed",
        description: "Global header with notifications and user menu",
      },
    ],
  },
  {
    name: "User Management",
    icon: Users,
    color: "#8b5cf6",
    items: [
      {
        name: "User List & Search",
        status: "completed",
        description: "Browse all users with filtering and search",
        details: ["Search by name/email", "Filter by role/status", "Bulk selection", "Export to CSV"],
      },
      {
        name: "User Actions",
        status: "completed",
        description: "All user management actions functional",
        details: [
          "View user profile (drawer)",
          "Promote to vendor (modal)",
          "Promote to admin (modal)",
          "Suspend user (confirmation)",
          "Ban user (confirmation)",
        ],
      },
      {
        name: "User Detail Drawer",
        status: "completed",
        description: "Comprehensive user profile view",
      },
    ],
  },
  {
    name: "Vendor Management",
    icon: Building2,
    color: "#f59e0b",
    items: [
      {
        name: "Vendor Approvals",
        status: "completed",
        description: "Review and approve vendor applications",
        details: ["View application details", "Approve vendor", "Reject with reason", "Document verification"],
      },
      {
        name: "Vendor Actions",
        status: "completed",
        description: "All vendor management actions",
        details: ["Suspend vendor", "Filter by status/category", "Export vendor list"],
      },
    ],
  },
  {
    name: "Booking Management",
    icon: Package,
    color: "#10b981",
    items: [
      {
        name: "Booking List",
        status: "completed",
        description: "View and manage all bookings",
        details: [
          "Status filtering (pending/confirmed/completed/cancelled)",
          "Search by booking ID/customer",
          "Risk flag indicators",
          "Export bookings",
        ],
      },
      {
        name: "Booking Detail Drawer",
        status: "completed",
        description: "Comprehensive booking information",
      },
      {
        name: "Booking Actions",
        status: "partial",
        description: "Common booking actions",
        details: [
          "View details ✓",
          "Update status (pending backend)",
          "Process refund (pending backend)",
          "Contact customer (pending backend)",
        ],
      },
    ],
  },
  {
    name: "Listings & Products",
    icon: Package,
    color: "#06b6d4",
    items: [
      {
        name: "Listing Management",
        status: "completed",
        description: "Manage all marketplace listings",
      },
      {
        name: "Listing Review & Approval",
        status: "completed",
        description: "Review and approve vendor listings",
      },
      {
        name: "Listing Editor",
        status: "partial",
        description: "Create and edit listings",
        details: ["Basic structure ✓", "Form validation (pending)", "Media upload (pending)"],
      },
    ],
  },
  {
    name: "Finance & Payments",
    icon: DollarSign,
    color: "#eab308",
    items: [
      {
        name: "Finance Dashboard",
        status: "completed",
        description: "Revenue overview and financial metrics",
      },
      {
        name: "Payments Page",
        status: "completed",
        description: "Track all payments and transactions",
      },
      {
        name: "Payouts Page",
        status: "completed",
        description: "Manage vendor payouts",
      },
      {
        name: "Refunds Page",
        status: "completed",
        description: "Process and track refunds",
      },
      {
        name: "Commission Settings",
        status: "partial",
        description: "Configure commission rates",
        details: ["UI complete ✓", "Save functionality (pending backend)"],
      },
    ],
  },
  {
    name: "Hotel Operations",
    icon: Building2,
    color: "#ec4899",
    items: [
      {
        name: "Hotel Dashboard",
        status: "completed",
        description: "Property overview for stay vendors",
      },
      {
        name: "Room Inventory",
        status: "completed",
        description: "Manage room types and availability",
      },
      {
        name: "Availability Calendar",
        status: "completed",
        description: "View and manage room availability",
      },
      {
        name: "Reservations",
        status: "completed",
        description: "Track hotel reservations",
      },
      {
        name: "Seasonal Pricing",
        status: "partial",
        description: "Configure seasonal pricing rules",
        details: ["UI complete ✓", "Save functionality (pending backend)"],
      },
    ],
  },
  {
    name: "Transport Operations",
    icon: Car,
    color: "#14b8a6",
    items: [
      {
        name: "Transport Dashboard",
        status: "completed",
        description: "Transfer operations overview",
      },
      {
        name: "Transfer Requests",
        status: "completed",
        description: "Manage transfer bookings",
      },
      {
        name: "Vehicle Categories",
        status: "completed",
        description: "Manage vehicle types",
      },
      {
        name: "Transport Pricing",
        status: "partial",
        description: "Configure route pricing",
        details: ["UI complete ✓", "Save functionality (pending backend)"],
      },
    ],
  },
  {
    name: "Support & Communication",
    icon: MessageSquare,
    color: "#f97316",
    items: [
      {
        name: "Support Dashboard",
        status: "completed",
        description: "Overview of support operations",
      },
      {
        name: "Tickets Page",
        status: "completed",
        description: "Manage support tickets",
      },
      {
        name: "Refund Disputes",
        status: "completed",
        description: "Handle refund disputes",
      },
    ],
  },
  {
    name: "Analytics & Reporting",
    icon: BarChart3,
    color: "#a855f7",
    items: [
      {
        name: "Analytics Dashboard",
        status: "completed",
        description: "Business intelligence and metrics",
      },
      {
        name: "Activity Feed",
        status: "completed",
        description: "Real-time system activity",
      },
      {
        name: "Audit Logs",
        status: "completed",
        description: "Complete audit trail",
      },
    ],
  },
  {
    name: "System Settings",
    icon: Settings,
    color: "#64748b",
    items: [
      {
        name: "System Settings Dashboard",
        status: "completed",
        description: "Central settings hub",
      },
      {
        name: "Roles & Permissions",
        status: "partial",
        description: "Manage user roles",
        details: ["UI complete ✓", "Save functionality (pending backend)"],
      },
      {
        name: "Marketplace Settings",
        status: "partial",
        description: "Configure marketplace parameters",
        details: ["UI complete ✓", "Save functionality (pending backend)"],
      },
      {
        name: "Category Management",
        status: "completed",
        description: "Manage listing categories",
      },
      {
        name: "Notification Settings",
        status: "partial",
        description: "Configure system notifications",
        details: ["UI complete ✓", "Save functionality (pending backend)"],
      },
      {
        name: "Security Settings",
        status: "partial",
        description: "Security and authentication settings",
        details: ["UI complete ✓", "Save functionality (pending backend)"],
      },
      {
        name: "Branding Settings",
        status: "partial",
        description: "Customize portal branding",
        details: ["UI complete ✓", "Save functionality (pending backend)"],
      },
    ],
  },
  {
    name: "Developer Tools",
    icon: Server,
    color: "#0ea5e9",
    items: [
      {
        name: "Workflow Center",
        status: "completed",
        description: "Automation and workflow management",
      },
      {
        name: "API Integration Center",
        status: "completed",
        description: "API management and documentation",
      },
      {
        name: "System Architecture Center",
        status: "completed",
        description: "Database and entity visualization",
      },
    ],
  },
];

const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle,
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.1)",
    label: "Completed",
  },
  partial: {
    icon: AlertCircle,
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.1)",
    label: "Partially Complete",
  },
  pending: {
    icon: Circle,
    color: "#64748b",
    bg: "rgba(100, 116, 139, 0.1)",
    label: "Pending",
  },
  mock_data: {
    icon: Database,
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.1)",
    label: "Mock Data",
  },
};

export function PortalQAChecklist() {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleName: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleName)) {
        next.delete(moduleName);
      } else {
        next.add(moduleName);
      }
      return next;
    });
  };

  // Calculate overall statistics
  const totalItems = QA_MODULES.reduce((sum, mod) => sum + mod.items.length, 0);
  const completedItems = QA_MODULES.reduce(
    (sum, mod) => sum + mod.items.filter((i) => i.status === "completed").length,
    0
  );
  const partialItems = QA_MODULES.reduce(
    (sum, mod) => sum + mod.items.filter((i) => i.status === "partial").length,
    0
  );
  const pendingItems = QA_MODULES.reduce(
    (sum, mod) => sum + mod.items.filter((i) => i.status === "pending").length,
    0
  );
  const mockDataItems = QA_MODULES.reduce(
    (sum, mod) => sum + mod.items.filter((i) => i.status === "mock_data").length,
    0
  );

  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--bg-main)" }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Portal QA Checklist
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Complete status of all modules, features, and integrations
        </p>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <div
          className="rounded-xl p-6"
          style={{
            background: "linear-gradient(135deg, var(--bg-elevated), var(--bg-panel))",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 style={{ color: "var(--text-primary)", fontWeight: 700 }}>Overall Completion</h2>
              <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                {completedItems} of {totalItems} items completed
              </p>
            </div>
            <div
              className="text-[32px]"
              style={{
                color: completionPercentage > 80 ? "#22c55e" : completionPercentage > 50 ? "#f59e0b" : "#64748b",
                fontWeight: 700,
              }}
            >
              {completionPercentage}%
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className="h-3 rounded-full overflow-hidden mb-4"
            style={{
              background: "var(--input-background)",
            }}
          >
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${completionPercentage}%`,
                background: `linear-gradient(90deg, ${completionPercentage > 80 ? "#22c55e" : completionPercentage > 50 ? "#f59e0b" : "#64748b"}, ${completionPercentage > 80 ? "#16a34a" : completionPercentage > 50 ? "#d97706" : "#475569"})`,
              }}
            />
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Completed", count: completedItems, config: STATUS_CONFIG.completed },
              { label: "Partial", count: partialItems, config: STATUS_CONFIG.partial },
              { label: "Pending", count: pendingItems, config: STATUS_CONFIG.pending },
              { label: "Mock Data", count: mockDataItems, config: STATUS_CONFIG.mock_data },
            ].map(({ label, count, config }) => {
              const Icon = config.icon;
              return (
                <div
                  key={label}
                  className="p-3 rounded-lg"
                  style={{
                    background: config.bg,
                    border: `1px solid ${config.color}30`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} style={{ color: config.color }} />
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {label}
                    </span>
                  </div>
                  <p className="text-[20px]" style={{ color: config.color, fontWeight: 700 }}>
                    {count}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Module Breakdown */}
      <div className="space-y-3">
        {QA_MODULES.map((module) => {
          const Icon = module.icon;
          const isExpanded = expandedModules.has(module.name);
          const moduleCompleted = module.items.filter((i) => i.status === "completed").length;
          const moduleTotal = module.items.length;
          const modulePercentage = Math.round((moduleCompleted / moduleTotal) * 100);

          return (
            <div
              key={module.name}
              className="rounded-xl overflow-hidden"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              {/* Module Header */}
              <button
                onClick={() => toggleModule(module.name)}
                className="w-full flex items-center justify-between p-5 transition-all"
                style={{
                  background: isExpanded ? "var(--bg-elevated)" : "transparent",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${module.color}15`,
                    }}
                  >
                    <Icon size={18} style={{ color: module.color }} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {module.name}
                    </h3>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {moduleCompleted} / {moduleTotal} completed ({modulePercentage}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 w-32 rounded-full overflow-hidden"
                    style={{ background: "var(--input-background)" }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${modulePercentage}%`,
                        background: module.color,
                      }}
                    />
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={16} style={{ color: "var(--text-tertiary)" }} />
                  ) : (
                    <ChevronRight size={16} style={{ color: "var(--text-tertiary)" }} />
                  )}
                </div>
              </button>

              {/* Module Items */}
              {isExpanded && (
                <div className="px-5 pb-5" style={{ borderTop: "1px solid var(--border-light)" }}>
                  <div className="space-y-3 mt-4">
                    {module.items.map((item) => {
                      const statusConfig = STATUS_CONFIG[item.status];
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div
                          key={item.name}
                          className="rounded-lg p-4"
                          style={{
                            background: statusConfig.bg,
                            border: `1px solid ${statusConfig.color}20`,
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: `${statusConfig.color}20` }}
                            >
                              <StatusIcon size={14} style={{ color: statusConfig.color }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                                  {item.name}
                                </h4>
                                <span
                                  className="text-[10px] px-2 py-0.5 rounded-full"
                                  style={{
                                    background: statusConfig.color,
                                    color: "white",
                                  }}
                                >
                                  {statusConfig.label}
                                </span>
                              </div>
                              <p className="text-[12px] mb-2" style={{ color: "var(--text-secondary)" }}>
                                {item.description}
                              </p>
                              {item.details && (
                                <ul className="space-y-1">
                                  {item.details.map((detail, i) => (
                                    <li key={i} className="text-[11px] flex items-start gap-2" style={{ color: "var(--text-tertiary)" }}>
                                      <span className="mt-1">•</span>
                                      <span>{detail}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Notes */}
      <div
        className="mt-8 p-5 rounded-xl"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
        }}
      >
        <h3 className="text-[14px] mb-3" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Implementation Notes
        </h3>
        <div className="space-y-2 text-[12px]" style={{ color: "var(--text-secondary)" }}>
          <p>
            <strong style={{ color: "var(--text-primary)" }}>✓ UI Complete:</strong> All pages, components, and
            layouts are fully designed and functional
          </p>
          <p>
            <strong style={{ color: "var(--text-primary)" }}>✓ Common Actions:</strong> Export, filter, approve,
            reject, suspend, and other actions work with toast notifications
          </p>
          <p>
            <strong style={{ color: "var(--text-primary)" }}>⚠ Backend Integration:</strong> Most "Save" actions are
            pending backend API integration
          </p>
          <p>
            <strong style={{ color: "var(--text-primary)" }}>⚠ Mock Data:</strong> All data is currently mock/sample
            data for demonstration
          </p>
          <p>
            <strong style={{ color: "var(--text-primary)" }}>⚠ Real-time Features:</strong> Real-time updates,
            WebSocket connections pending
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import {
  Server,
  Key,
  Users,
  ShoppingBag,
  Calendar,
  CreditCard,
  Wallet,
  Truck,
  Upload,
  Bell,
  Shield,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Database,
  ArrowRight,
  Code,
  FileText,
  GitBranch,
  Activity,
} from "lucide-react";

type APIStatus = "connected" | "in-progress" | "planned" | "failed";
type RiskLevel = "low" | "medium" | "high" | "critical";

interface APIEndpoint {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  description: string;
}

interface APIModule {
  id: string;
  name: string;
  purpose: string;
  icon: React.ComponentType<any>;
  color: string;
  status: APIStatus;
  riskLevel: RiskLevel;
  endpoints: APIEndpoint[];
  connectedPages: string[];
  requiredPermissions: string[];
  mockDataUsed: boolean;
}

interface MockDataPage {
  page: string;
  currentDataSource: string;
  requiredEndpoint: string;
  priority: "high" | "medium" | "low";
  estimatedEffort: string;
}

export function APIIntegrationCenter() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"modules" | "status" | "dataflow" | "checklist" | "mockdata">("modules");

  const apiModules: APIModule[] = [
    {
      id: "auth",
      name: "Authentication API",
      purpose: "Handle user login, registration, session management, and token generation",
      icon: Key,
      color: "#3b82f6",
      status: "connected",
      riskLevel: "critical",
      endpoints: [
        { method: "POST", path: "/api/auth/login", description: "User login with email/password" },
        { method: "POST", path: "/api/auth/register", description: "New user registration" },
        { method: "POST", path: "/api/auth/logout", description: "End user session" },
        { method: "POST", path: "/api/auth/refresh", description: "Refresh access token" },
        { method: "POST", path: "/api/auth/forgot-password", description: "Password reset request" },
        { method: "GET", path: "/api/auth/me", description: "Get current user profile" },
      ],
      connectedPages: ["/login", "/register", "/profile"],
      requiredPermissions: ["public"],
      mockDataUsed: false,
    },
    {
      id: "users",
      name: "User Management API",
      purpose: "Manage customers, vendors, and admin users",
      icon: Users,
      color: "#8b5cf6",
      status: "in-progress",
      riskLevel: "high",
      endpoints: [
        { method: "GET", path: "/api/users", description: "List all users with filters" },
        { method: "GET", path: "/api/users/:id", description: "Get user details" },
        { method: "PATCH", path: "/api/users/:id", description: "Update user profile" },
        { method: "DELETE", path: "/api/users/:id", description: "Delete/deactivate user" },
        { method: "GET", path: "/api/users/:id/activity", description: "Get user activity history" },
      ],
      connectedPages: ["/users", "/users/customers", "/users/vendors", "/users/admins"],
      requiredPermissions: ["admin.users.read", "admin.users.write"],
      mockDataUsed: true,
    },
    {
      id: "vendors",
      name: "Vendor Management API",
      purpose: "Handle vendor applications, approvals, and vendor operations",
      icon: ShoppingBag,
      color: "#f59e0b",
      status: "in-progress",
      riskLevel: "high",
      endpoints: [
        { method: "GET", path: "/api/vendors", description: "List all vendors" },
        { method: "GET", path: "/api/vendors/:id", description: "Get vendor details" },
        { method: "POST", path: "/api/vendors/apply", description: "Submit vendor application" },
        { method: "PATCH", path: "/api/vendors/:id/approve", description: "Approve vendor application" },
        { method: "PATCH", path: "/api/vendors/:id/reject", description: "Reject vendor application" },
        { method: "PATCH", path: "/api/vendors/:id/suspend", description: "Suspend vendor account" },
        { method: "GET", path: "/api/vendors/:id/earnings", description: "Get vendor earnings" },
      ],
      connectedPages: ["/vendors", "/vendor-approvals", "/vendor/revenue"],
      requiredPermissions: ["admin.vendors.read", "admin.vendors.approve", "vendor.self.read"],
      mockDataUsed: true,
    },
    {
      id: "listings",
      name: "Listing Management API",
      purpose: "Create, update, and manage travel listings (stays, tours, safaris, experiences)",
      icon: FileText,
      color: "#10b981",
      status: "planned",
      riskLevel: "high",
      endpoints: [
        { method: "GET", path: "/api/listings", description: "List all listings with filters" },
        { method: "GET", path: "/api/listings/:id", description: "Get listing details" },
        { method: "POST", path: "/api/listings", description: "Create new listing" },
        { method: "PATCH", path: "/api/listings/:id", description: "Update listing" },
        { method: "DELETE", path: "/api/listings/:id", description: "Delete listing" },
        { method: "PATCH", path: "/api/listings/:id/review", description: "Admin review listing" },
        { method: "PATCH", path: "/api/listings/:id/publish", description: "Publish approved listing" },
        { method: "GET", path: "/api/listings/:id/analytics", description: "Get listing performance" },
      ],
      connectedPages: ["/listings", "/listings/create", "/listings/:id/edit", "/reviews"],
      requiredPermissions: ["admin.listings.read", "admin.listings.approve", "vendor.listings.write"],
      mockDataUsed: true,
    },
    {
      id: "bookings",
      name: "Booking Management API",
      purpose: "Handle customer bookings, confirmations, and booking lifecycle",
      icon: Calendar,
      color: "#3b82f6",
      status: "planned",
      riskLevel: "critical",
      endpoints: [
        { method: "GET", path: "/api/bookings", description: "List all bookings" },
        { method: "GET", path: "/api/bookings/:id", description: "Get booking details" },
        { method: "POST", path: "/api/bookings", description: "Create new booking" },
        { method: "PATCH", path: "/api/bookings/:id/status", description: "Update booking status" },
        { method: "PATCH", path: "/api/bookings/:id/confirm", description: "Confirm booking" },
        { method: "PATCH", path: "/api/bookings/:id/cancel", description: "Cancel booking" },
        { method: "POST", path: "/api/bookings/:id/review", description: "Submit booking review" },
      ],
      connectedPages: ["/bookings", "/vendor/bookings", "/hotel/reservations"],
      requiredPermissions: ["admin.bookings.read", "vendor.bookings.read", "customer.bookings.read"],
      mockDataUsed: true,
    },
    {
      id: "payments",
      name: "Payment API",
      purpose: "Process payments, refunds, and payment gateway integration",
      icon: CreditCard,
      color: "#22c55e",
      status: "planned",
      riskLevel: "critical",
      endpoints: [
        { method: "POST", path: "/api/payments/create", description: "Create payment intent" },
        { method: "POST", path: "/api/payments/confirm", description: "Confirm payment" },
        { method: "GET", path: "/api/payments/:id", description: "Get payment details" },
        { method: "GET", path: "/api/payments", description: "List all payments" },
        { method: "POST", path: "/api/payments/:id/refund", description: "Process refund" },
        { method: "GET", path: "/api/payments/:id/receipt", description: "Generate payment receipt" },
      ],
      connectedPages: ["/payments", "/finance", "/refunds"],
      requiredPermissions: ["admin.payments.read", "admin.payments.refund", "vendor.payments.read"],
      mockDataUsed: true,
    },
    {
      id: "payouts",
      name: "Payout API",
      purpose: "Manage vendor payouts and commission calculations",
      icon: Wallet,
      color: "#10b981",
      status: "planned",
      riskLevel: "critical",
      endpoints: [
        { method: "GET", path: "/api/payouts", description: "List all payouts" },
        { method: "GET", path: "/api/payouts/:id", description: "Get payout details" },
        { method: "POST", path: "/api/payouts/calculate", description: "Calculate pending payouts" },
        { method: "POST", path: "/api/payouts/:id/approve", description: "Approve payout" },
        { method: "POST", path: "/api/payouts/:id/process", description: "Process payout transfer" },
        { method: "GET", path: "/api/payouts/vendor/:vendorId", description: "Get vendor payout history" },
      ],
      connectedPages: ["/payouts", "/vendor/revenue", "/finance"],
      requiredPermissions: ["admin.payouts.read", "admin.payouts.approve", "vendor.payouts.read"],
      mockDataUsed: true,
    },
    {
      id: "transport",
      name: "Transport API",
      purpose: "Handle transfer requests, vehicle management, and transport operations",
      icon: Truck,
      color: "#8b5cf6",
      status: "planned",
      riskLevel: "medium",
      endpoints: [
        { method: "GET", path: "/api/transport/requests", description: "List transfer requests" },
        { method: "POST", path: "/api/transport/requests", description: "Create transfer request" },
        { method: "PATCH", path: "/api/transport/requests/:id/confirm", description: "Confirm transfer" },
        { method: "GET", path: "/api/transport/vehicles", description: "List vehicle categories" },
        { method: "GET", path: "/api/transport/pricing", description: "Get route pricing" },
      ],
      connectedPages: ["/transport", "/transport/requests", "/transport/vehicles", "/transport/pricing"],
      requiredPermissions: ["admin.transport.read", "admin.transport.write"],
      mockDataUsed: true,
    },
    {
      id: "media",
      name: "Media Upload API",
      purpose: "Handle file uploads, image processing, and media management",
      icon: Upload,
      color: "#ec4899",
      status: "planned",
      riskLevel: "medium",
      endpoints: [
        { method: "POST", path: "/api/media/upload", description: "Upload media file" },
        { method: "POST", path: "/api/media/upload/multiple", description: "Upload multiple files" },
        { method: "GET", path: "/api/media", description: "List media files" },
        { method: "DELETE", path: "/api/media/:id", description: "Delete media file" },
        { method: "GET", path: "/api/media/:id/url", description: "Get signed media URL" },
      ],
      connectedPages: ["/media", "/listings/create", "/vendor/media"],
      requiredPermissions: ["vendor.media.write", "admin.media.write"],
      mockDataUsed: true,
    },
    {
      id: "notifications",
      name: "Notification API",
      purpose: "Send and manage email, SMS, and in-app notifications",
      icon: Bell,
      color: "#f59e0b",
      status: "planned",
      riskLevel: "low",
      endpoints: [
        { method: "GET", path: "/api/notifications", description: "Get user notifications" },
        { method: "POST", path: "/api/notifications/send", description: "Send notification" },
        { method: "PATCH", path: "/api/notifications/:id/read", description: "Mark as read" },
        { method: "GET", path: "/api/notifications/preferences", description: "Get notification settings" },
        { method: "PATCH", path: "/api/notifications/preferences", description: "Update notification settings" },
      ],
      connectedPages: ["/notifications", "/vendor/notifications", "/settings/notifications"],
      requiredPermissions: ["user.notifications.read"],
      mockDataUsed: true,
    },
    {
      id: "audit",
      name: "Audit Log API",
      purpose: "Track system changes, user actions, and security events",
      icon: Shield,
      color: "#64748b",
      status: "planned",
      riskLevel: "medium",
      endpoints: [
        { method: "GET", path: "/api/audit/logs", description: "List audit logs" },
        { method: "GET", path: "/api/audit/logs/:id", description: "Get audit log details" },
        { method: "POST", path: "/api/audit/log", description: "Create audit log entry" },
        { method: "GET", path: "/api/audit/user/:userId", description: "Get user audit trail" },
        { method: "GET", path: "/api/audit/entity/:type/:id", description: "Get entity audit trail" },
      ],
      connectedPages: ["/audit-logs", "/activity", "/settings/audit"],
      requiredPermissions: ["admin.audit.read"],
      mockDataUsed: true,
    },
    {
      id: "analytics",
      name: "Analytics API",
      purpose: "Provide dashboard metrics, reports, and business intelligence",
      icon: BarChart3,
      color: "#0891b2",
      status: "planned",
      riskLevel: "low",
      endpoints: [
        { method: "GET", path: "/api/analytics/dashboard", description: "Get dashboard metrics" },
        { method: "GET", path: "/api/analytics/revenue", description: "Get revenue analytics" },
        { method: "GET", path: "/api/analytics/bookings", description: "Get booking analytics" },
        { method: "GET", path: "/api/analytics/vendors", description: "Get vendor analytics" },
        { method: "GET", path: "/api/analytics/listings/:id", description: "Get listing performance" },
      ],
      connectedPages: ["/dashboard", "/analytics", "/vendor/insights", "/vendor/performance"],
      requiredPermissions: ["admin.analytics.read", "vendor.analytics.read"],
      mockDataUsed: true,
    },
  ];

  const mockDataPages: MockDataPage[] = [
    { page: "/dashboard", currentDataSource: "hardcoded stats", requiredEndpoint: "GET /api/analytics/dashboard", priority: "high", estimatedEffort: "2 days" },
    { page: "/bookings", currentDataSource: "mock booking array", requiredEndpoint: "GET /api/bookings", priority: "high", estimatedEffort: "3 days" },
    { page: "/vendors", currentDataSource: "static vendor list", requiredEndpoint: "GET /api/vendors", priority: "high", estimatedEffort: "2 days" },
    { page: "/listings", currentDataSource: "sample listings", requiredEndpoint: "GET /api/listings", priority: "high", estimatedEffort: "3 days" },
    { page: "/users", currentDataSource: "mock user data", requiredEndpoint: "GET /api/users", priority: "medium", estimatedEffort: "2 days" },
    { page: "/payments", currentDataSource: "fake payment records", requiredEndpoint: "GET /api/payments", priority: "high", estimatedEffort: "2 days" },
    { page: "/payouts", currentDataSource: "calculated mock data", requiredEndpoint: "GET /api/payouts", priority: "high", estimatedEffort: "2 days" },
    { page: "/transport", currentDataSource: "hardcoded transfers", requiredEndpoint: "GET /api/transport/requests", priority: "medium", estimatedEffort: "2 days" },
    { page: "/analytics", currentDataSource: "static charts", requiredEndpoint: "GET /api/analytics/*", priority: "medium", estimatedEffort: "3 days" },
    { page: "/vendor/revenue", currentDataSource: "sample revenue", requiredEndpoint: "GET /api/vendors/:id/earnings", priority: "high", estimatedEffort: "2 days" },
  ];

  const statusStats = {
    connected: apiModules.filter((m) => m.status === "connected").length,
    inProgress: apiModules.filter((m) => m.status === "in-progress").length,
    planned: apiModules.filter((m) => m.status === "planned").length,
    failed: apiModules.filter((m) => m.status === "failed").length,
    mockDataPages: mockDataPages.length,
  };

  const getStatusConfig = (status: APIStatus) => {
    switch (status) {
      case "connected":
        return { icon: CheckCircle, color: "#22c55e", label: "Connected", bg: "rgba(34,197,94,0.1)" };
      case "in-progress":
        return { icon: Clock, color: "#f59e0b", label: "In Progress", bg: "rgba(245,158,11,0.1)" };
      case "planned":
        return { icon: AlertTriangle, color: "#8b5cf6", label: "Planned", bg: "rgba(139,92,246,0.1)" };
      case "failed":
        return { icon: XCircle, color: "#ef4444", label: "Failed", bg: "rgba(239,68,68,0.1)" };
    }
  };

  const getRiskConfig = (risk: RiskLevel) => {
    switch (risk) {
      case "critical":
        return { color: "#ef4444", label: "Critical", bg: "rgba(239,68,68,0.1)" };
      case "high":
        return { color: "#f59e0b", label: "High", bg: "rgba(245,158,11,0.1)" };
      case "medium":
        return { color: "#3b82f6", label: "Medium", bg: "rgba(59,130,246,0.1)" };
      case "low":
        return { color: "#22c55e", label: "Low", bg: "rgba(34,197,94,0.1)" };
    }
  };

  const integrationChecklist = [
    { category: "Authentication", items: ["JWT token handling", "Token refresh logic", "Session expiry handling", "Logout cleanup"] },
    { category: "Error Handling", items: ["HTTP error status codes", "User-friendly error messages", "Network failure recovery", "Validation error display"] },
    { category: "Loading States", items: ["Skeleton loaders", "Spinner components", "Progress indicators", "Optimistic UI updates"] },
    { category: "Data Operations", items: ["Pagination support", "Filter & search", "Sort functionality", "Infinite scroll"] },
    { category: "Permissions", items: ["Role-based access control", "Permission checks before API calls", "UI element visibility based on roles", "Action authorization"] },
    { category: "Validation", items: ["Client-side validation", "Server error handling", "Form validation feedback", "Data type checking"] },
    { category: "File Handling", items: ["File upload progress", "File size limits", "Supported file types", "Image preview before upload"] },
    { category: "Audit & Logging", items: ["Action logging", "Error tracking", "User activity tracking", "Debug mode"] },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          API Integration Center
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Backend API modules, integration status, and implementation planning
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {[
          { id: "modules", label: "API Modules", icon: Server },
          { id: "status", label: "Status Dashboard", icon: Activity },
          { id: "dataflow", label: "Data Flow", icon: GitBranch },
          { id: "checklist", label: "Integration Checklist", icon: CheckCircle },
          { id: "mockdata", label: "Mock Data Plan", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className="px-4 py-2 rounded-lg text-[13px] flex items-center gap-2 transition-all"
              style={{
                background: selectedTab === tab.id ? "var(--active-overlay)" : "var(--input-background)",
                border: selectedTab === tab.id ? "1px solid var(--border-accent)" : "1px solid var(--border-light)",
                color: selectedTab === tab.id ? "var(--accent-navy-light)" : "var(--text-secondary)",
                fontWeight: selectedTab === tab.id ? 600 : 500,
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* API Modules Tab */}
      {selectedTab === "modules" && (
        <div className="grid grid-cols-3 gap-4">
          {apiModules.map((module) => {
            const Icon = module.icon;
            const statusConfig = getStatusConfig(module.status);
            const riskConfig = getRiskConfig(module.riskLevel);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={module.id}
                onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                className="rounded-xl p-5 cursor-pointer transition-all"
                style={{
                  background: "var(--bg-panel)",
                  border: selectedModule === module.id ? "1px solid var(--border-accent)" : "1px solid var(--border-light)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${module.color}15` }}>
                    <Icon size={20} style={{ color: module.color }} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                      style={{
                        background: statusConfig.bg,
                        color: statusConfig.color,
                        fontWeight: 600,
                      }}
                    >
                      <StatusIcon size={10} />
                      {statusConfig.label}
                    </div>
                    <div
                      className="px-2 py-0.5 rounded text-[10px] text-center"
                      style={{
                        background: riskConfig.bg,
                        color: riskConfig.color,
                        fontWeight: 600,
                      }}
                    >
                      {riskConfig.label}
                    </div>
                  </div>
                </div>

                <h3 className="text-[14px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {module.name}
                </h3>
                <p className="text-[11px] mb-3" style={{ color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                  {module.purpose}
                </p>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  <span>{module.endpoints.length} endpoints</span>
                  <span>•</span>
                  <span>{module.connectedPages.length} pages</span>
                </div>

                {/* Expanded Details */}
                {selectedModule === module.id && (
                  <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
                    {/* Endpoints */}
                    <div className="mb-4">
                      <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                        ENDPOINTS:
                      </p>
                      <div className="space-y-2">
                        {module.endpoints.map((endpoint, i) => (
                          <div
                            key={i}
                            className="p-2 rounded"
                            style={{
                              background: "var(--input-background)",
                              border: "1px solid var(--border-light)",
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="px-1.5 py-0.5 rounded text-[9px]"
                                style={{
                                  background: endpoint.method === "GET" ? "rgba(34,197,94,0.2)" : endpoint.method === "POST" ? "rgba(59,130,246,0.2)" : "rgba(245,158,11,0.2)",
                                  color: endpoint.method === "GET" ? "#22c55e" : endpoint.method === "POST" ? "#3b82f6" : "#f59e0b",
                                  fontWeight: 700,
                                  fontFamily: "monospace",
                                }}
                              >
                                {endpoint.method}
                              </span>
                              <code className="text-[10px]" style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>
                                {endpoint.path}
                              </code>
                            </div>
                            <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                              {endpoint.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Connected Pages */}
                    <div className="mb-4">
                      <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                        CONNECTED PAGES:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {module.connectedPages.map((page, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded text-[10px]"
                            style={{
                              background: "var(--input-background)",
                              border: "1px solid var(--border-light)",
                              color: "var(--text-secondary)",
                              fontFamily: "monospace",
                            }}
                          >
                            {page}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Permissions */}
                    <div>
                      <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                        REQUIRED PERMISSIONS:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {module.requiredPermissions.map((perm, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded text-[10px]"
                            style={{
                              background: "rgba(139,92,246,0.1)",
                              border: "1px solid rgba(139,92,246,0.2)",
                              color: "#8b5cf6",
                              fontFamily: "monospace",
                            }}
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>

                    {module.mockDataUsed && (
                      <div
                        className="mt-3 p-2 rounded"
                        style={{
                          background: "rgba(245,158,11,0.1)",
                          border: "1px solid rgba(245,158,11,0.2)",
                        }}
                      >
                        <p className="text-[10px]" style={{ color: "#f59e0b" }}>
                          ⚠️ Currently using mock data - requires backend implementation
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Status Dashboard Tab */}
      {selectedTab === "status" && (
        <div className="space-y-6">
          {/* Status Stats */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Connected APIs", value: statusStats.connected, color: "#22c55e", icon: CheckCircle },
              { label: "In Progress", value: statusStats.inProgress, color: "#f59e0b", icon: Clock },
              { label: "Planned", value: statusStats.planned, color: "#8b5cf6", icon: AlertTriangle },
              { label: "Failed", value: statusStats.failed, color: "#ef4444", icon: XCircle },
              { label: "Mock Data Pages", value: statusStats.mockDataPages, color: "#0891b2", icon: Database },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
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
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                      <Icon size={18} style={{ color: stat.color }} />
                    </div>
                  </div>
                  <p className="text-[22px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                    {stat.value}
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* API Status Table */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
              <h3 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                API Module Status
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--input-background)" }}>
                    <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                        API Module
                      </span>
                    </th>
                    <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                        Status
                      </span>
                    </th>
                    <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                        Risk Level
                      </span>
                    </th>
                    <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                        Endpoints
                      </span>
                    </th>
                    <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                        Mock Data
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiModules.map((module, index) => {
                    const statusConfig = getStatusConfig(module.status);
                    const riskConfig = getRiskConfig(module.riskLevel);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr
                        key={module.id}
                        style={{
                          borderBottom: index < apiModules.length - 1 ? "1px solid var(--border-light)" : "none",
                        }}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${module.color}15` }}>
                              <module.icon size={14} style={{ color: module.color }} />
                            </div>
                            <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                              {module.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px]"
                            style={{
                              background: statusConfig.bg,
                              color: statusConfig.color,
                              fontWeight: 600,
                            }}
                          >
                            <StatusIcon size={12} />
                            {statusConfig.label}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="px-2.5 py-1 rounded text-[11px]"
                            style={{
                              background: riskConfig.bg,
                              color: riskConfig.color,
                              fontWeight: 600,
                            }}
                          >
                            {riskConfig.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                            {module.endpoints.length}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {module.mockDataUsed ? (
                            <span className="text-[11px]" style={{ color: "#f59e0b" }}>
                              Yes
                            </span>
                          ) : (
                            <span className="text-[11px]" style={{ color: "#22c55e" }}>
                              No
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Data Flow Tab */}
      {selectedTab === "dataflow" && (
        <div className="space-y-6">
          <div
            className="rounded-xl p-6"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[16px] mb-6" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Data Flow Diagram
            </h3>

            {/* Flow Steps */}
            <div className="flex items-center justify-between">
              {[
                { label: "Frontend Page", sublabel: "React Component", icon: Code, color: "#3b82f6" },
                { label: "API Service", sublabel: "API Call Layer", icon: Server, color: "#10b981" },
                { label: "Backend API", sublabel: "Express/Node", icon: Database, color: "#f59e0b" },
                { label: "Database", sublabel: "PostgreSQL/MongoDB", icon: Database, color: "#8b5cf6" },
                { label: "Response", sublabel: "JSON Data", icon: ArrowRight, color: "#22c55e" },
              ].map((step, index) => {
                const Icon = step.icon;
                const isLast = index === 4;

                return (
                  <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center mb-2"
                        style={{
                          background: `${step.color}15`,
                          border: `2px solid ${step.color}`,
                        }}
                      >
                        <Icon size={24} style={{ color: step.color }} />
                      </div>
                      <p className="text-[12px] mb-0.5 text-center" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-center" style={{ color: "var(--text-tertiary)" }}>
                        {step.sublabel}
                      </p>
                    </div>
                    {!isLast && (
                      <div className="mx-4">
                        <ArrowRight size={24} style={{ color: "var(--text-tertiary)" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Example Flow */}
            <div className="mt-8 p-4 rounded-lg" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
              <p className="text-[11px] mb-3" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                EXAMPLE: FETCH BOOKINGS
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] w-32" style={{ color: "var(--text-tertiary)" }}>
                    1. Component:
                  </span>
                  <code className="text-[11px]" style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>
                    useEffect(() =&gt; fetchBookings(), [])
                  </code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] w-32" style={{ color: "var(--text-tertiary)" }}>
                    2. API Service:
                  </span>
                  <code className="text-[11px]" style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>
                    apiClient.get('/api/bookings?status=pending')
                  </code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] w-32" style={{ color: "var(--text-tertiary)" }}>
                    3. Backend:
                  </span>
                  <code className="text-[11px]" style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>
                    bookingController.getBookings(req, res)
                  </code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] w-32" style={{ color: "var(--text-tertiary)" }}>
                    4. Database:
                  </span>
                  <code className="text-[11px]" style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>
                    SELECT * FROM bookings WHERE status = 'pending'
                  </code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] w-32" style={{ color: "var(--text-tertiary)" }}>
                    5. Response:
                  </span>
                  <code className="text-[11px]" style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>
                    {JSON.stringify({ bookings: [], total: 0 })}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integration Checklist Tab */}
      {selectedTab === "checklist" && (
        <div className="grid grid-cols-2 gap-6">
          {integrationChecklist.map((section) => (
            <div
              key={section.category}
              className="rounded-xl p-5"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center mt-0.5"
                      style={{
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.3)",
                      }}
                    >
                      <CheckCircle size={12} style={{ color: "#22c55e" }} />
                    </div>
                    <p className="text-[12px] flex-1" style={{ color: "var(--text-secondary)" }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mock Data Replacement Plan Tab */}
      {selectedTab === "mockdata" && (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <h3 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Mock Data Replacement Plan
            </h3>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>
              Pages currently using hardcoded/mock data that need backend API integration
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--input-background)" }}>
                  <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                      Page
                    </span>
                  </th>
                  <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                      Current Data Source
                    </span>
                  </th>
                  <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                      Required Endpoint
                    </span>
                  </th>
                  <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                      Priority
                    </span>
                  </th>
                  <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                      Effort
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockDataPages.map((item, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: index < mockDataPages.length - 1 ? "1px solid var(--border-light)" : "none",
                    }}
                  >
                    <td className="px-5 py-4">
                      <code className="text-[12px]" style={{ color: "var(--text-primary)", fontFamily: "monospace", fontWeight: 500 }}>
                        {item.page}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {item.currentDataSource}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-[11px]" style={{ color: "var(--accent-navy-light)", fontFamily: "monospace" }}>
                        {item.requiredEndpoint}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-2 py-1 rounded text-[11px]"
                        style={{
                          background: item.priority === "high" ? "rgba(239,68,68,0.1)" : item.priority === "medium" ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
                          color: item.priority === "high" ? "#ef4444" : item.priority === "medium" ? "#f59e0b" : "#22c55e",
                          fontWeight: 600,
                        }}
                      >
                        {item.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        {item.estimatedEffort}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

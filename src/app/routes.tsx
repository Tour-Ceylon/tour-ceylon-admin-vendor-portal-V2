import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { ProtectedLayout } from "./layouts/ProtectedLayout";
import { LoginScreen } from "./components/auth/LoginScreen";
import { VendorRegistration } from "./components/auth/VendorRegistration";
import { PendingApprovalScreen } from "./components/auth/PendingApprovalScreen";
import { Dashboard } from "./components/Dashboard";
import { BookingsPage } from "./components/bookings/BookingsPage";
import { UserManagementPage } from "./components/users/UserManagementPage";
import { ListingsPage } from "./components/ListingsPage";
import { ListingEditor } from "./components/ListingEditor";
import { ListingReviewPage } from "./components/listings/ListingReviewPage";
import { VendorManagement } from "./components/VendorManagement";
import { AdminManagement } from "./components/AdminManagement";
import { MediaLibrary } from "./components/vendor/MediaLibrary";
import { PricingManagement } from "./components/vendor/PricingManagement";
import { HotelDashboard } from "./components/hotel/HotelDashboard";
import { AvailabilityCalendar } from "./components/hotel/AvailabilityCalendar";
import { RoomInventory } from "./components/hotel/RoomInventory";
import { Reservations } from "./components/hotel/Reservations";
import { SeasonalPricing } from "./components/hotel/SeasonalPricing";
import { PropertySettings } from "./components/hotel/PropertySettings";
import { Policies } from "./components/hotel/Policies";
import { FinanceDashboard } from "./components/finance/FinanceDashboard";
import { PaymentsPage } from "./components/finance/PaymentsPage";
import { PayoutsPage } from "./components/finance/PayoutsPage";
import { CommissionSettings } from "./components/finance/CommissionSettings";
import { RefundsPage } from "./components/finance/RefundsPage";
import { TransportDashboard } from "./components/transport/TransportDashboard";
import { TransferRequestsPage } from "./components/transport/TransferRequestsPage";
import { VehicleCategoriesPage } from "./components/transport/VehicleCategoriesPage";
import { TransportPricingPage } from "./components/transport/TransportPricingPage";
import { SupportDashboard } from "./components/support/SupportDashboard";
import { TicketsPage } from "./components/support/TicketsPage";
import { RefundDisputePage } from "./components/support/RefundDisputePage";
import { ActivityFeedPage } from "./components/activity/ActivityFeedPage";
import { AuditLogsPage } from "./components/activity/AuditLogsPage";
import { AnalyticsDashboard } from "./components/analytics/AnalyticsDashboard";
import { VendorBookingCenter } from "./components/vendor/VendorBookingCenter";
import { ListingPerformancePage } from "./components/vendor/ListingPerformancePage";
import { VendorRevenueCenter } from "./components/vendor/VendorRevenueCenter";
import { VendorReviewsPage } from "./components/vendor/VendorReviewsPage";
import { VendorAvailabilityPage } from "./components/vendor/VendorAvailabilityPage";
import { VendorNotificationsPage } from "./components/vendor/VendorNotificationsPage";
import { VendorSupportPage } from "./components/vendor/VendorSupportPage";
import { VendorInsightsPage } from "./components/vendor/VendorInsightsPage";
import { VendorTeamPage } from "./components/vendor/VendorTeamPage";
import { SystemSettingsDashboard } from "./components/settings/SystemSettingsDashboard";
import { RolesPermissionsPage } from "./components/settings/RolesPermissionsPage";
import { MarketplaceSettingsPage } from "./components/settings/MarketplaceSettingsPage";
import { CategoryManagementPage } from "./components/settings/CategoryManagementPage";
import { NotificationSettingsPage } from "./components/settings/NotificationSettingsPage";
import { SecuritySettingsPage } from "./components/settings/SecuritySettingsPage";
import { BrandingSettingsPage } from "./components/settings/BrandingSettingsPage";
import { FinanceSettingsPage } from "./components/settings/FinanceSettingsPage";
import { SystemAuditLogsPage } from "./components/settings/AuditLogsPage";
import { IntegrationSettingsPage } from "./components/settings/IntegrationSettingsPage";
import { WorkflowCenter } from "./components/workflows/WorkflowCenter";
import { APIIntegrationCenter } from "./components/api/APIIntegrationCenter";
import { SystemArchitectureCenter } from "./components/architecture/SystemArchitectureCenter";
import { PortalQAChecklist } from "./components/qa/PortalQAChecklist";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      // Public routes
      { path: "login", Component: LoginScreen },
      { path: "register", Component: VendorRegistration },
      { path: "pending", Component: PendingApprovalScreen },

      // Protected routes
      {
        path: "/",
        Component: ProtectedLayout,
        children: [
          // Dashboard
          { index: true, Component: () => <Navigate to="/dashboard" replace /> },
          { path: "dashboard", Component: Dashboard },

          // Bookings
          { path: "bookings", Component: BookingsPage },

          // User Management
          { path: "users", Component: UserManagementPage },
          { path: "users/customers", Component: UserManagementPage },
          { path: "users/vendors", Component: UserManagementPage },
          { path: "users/admins", Component: UserManagementPage },

          // Vendor Approvals & Management (Admin only)
          { path: "vendor-approvals", Component: VendorManagement },
          { path: "vendors", Component: VendorManagement },
          { path: "admins", Component: AdminManagement },

          // Listings
          { path: "listings", Component: ListingsPage },
          { path: "listings/create", Component: () => <ListingEditor mode="create" /> },
          { path: "listings/:id/edit", Component: () => <ListingEditor mode="edit" /> },

          // Listing Review & Approval (Admin only)
          { path: "reviews", Component: ListingReviewPage },

          // Vendor Business Center
          { path: "vendor/bookings", Component: VendorBookingCenter },
          { path: "vendor/performance", Component: ListingPerformancePage },
          { path: "vendor/revenue", Component: VendorRevenueCenter },
          { path: "vendor/reviews", Component: VendorReviewsPage },
          { path: "vendor/availability", Component: VendorAvailabilityPage },
          { path: "vendor/insights", Component: VendorInsightsPage },
          { path: "vendor/team", Component: VendorTeamPage },
          { path: "vendor/notifications", Component: VendorNotificationsPage },
          { path: "vendor/support", Component: VendorSupportPage },
          { path: "media", Component: MediaLibrary },
          { path: "pricing", Component: PricingManagement },

          // Hotel Operations (Stay vendors)
          { path: "hotel/dashboard", Component: HotelDashboard },
          { path: "hotel/availability", Component: AvailabilityCalendar },
          { path: "hotel/rooms", Component: RoomInventory },
          { path: "hotel/reservations", Component: Reservations },
          { path: "hotel/pricing", Component: SeasonalPricing },
          { path: "hotel/settings", Component: PropertySettings },
          { path: "hotel/policies", Component: Policies },

          // Finance Module (Admin only)
          { path: "finance", Component: FinanceDashboard },
          { path: "payments", Component: PaymentsPage },
          { path: "payouts", Component: PayoutsPage },
          { path: "refunds", Component: RefundsPage },
          { path: "revenue", Component: FinanceDashboard },
          { path: "commission", Component: CommissionSettings },

          // Transport Operations (Admin only)
          { path: "transport", Component: TransportDashboard },
          { path: "transport/requests", Component: TransferRequestsPage },
          { path: "transport/vehicles", Component: VehicleCategoriesPage },
          { path: "transport/pricing", Component: TransportPricingPage },

          // Support Module (Admin only)
          { path: "support", Component: SupportDashboard },
          { path: "support/tickets", Component: TicketsPage },
          { path: "support/refunds", Component: RefundDisputePage },

          // Activity & Monitoring (Admin only)
          { path: "activity", Component: ActivityFeedPage },
          { path: "audit-logs", Component: AuditLogsPage },

          // Analytics (Admin only)
          { path: "analytics", Component: AnalyticsDashboard },

          // Workflows
          { path: "workflows", Component: WorkflowCenter },

          // API Integration
          { path: "api-integration", Component: APIIntegrationCenter },

          // System Architecture
          { path: "system-architecture", Component: SystemArchitectureCenter },

          // QA Checklist
          { path: "qa-checklist", Component: PortalQAChecklist },

          // System Settings (Admin only)
          { path: "settings/system", Component: SystemSettingsDashboard },
          { path: "settings/roles", Component: RolesPermissionsPage },
          { path: "settings/marketplace", Component: MarketplaceSettingsPage },
          { path: "settings/categories", Component: CategoryManagementPage },
          { path: "settings/notifications", Component: NotificationSettingsPage },
          { path: "settings/security", Component: SecuritySettingsPage },
          { path: "settings/branding", Component: BrandingSettingsPage },
          { path: "settings/finance", Component: FinanceSettingsPage },
          { path: "settings/audit", Component: SystemAuditLogsPage },
          { path: "settings/integrations", Component: IntegrationSettingsPage },
        ],
      },

      // Catch all - 404
      { path: "*", Component: () => <Navigate to="/dashboard" replace /> },
    ],
  },
]);

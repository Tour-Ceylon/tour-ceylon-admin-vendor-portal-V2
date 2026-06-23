import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Settings,
  ChevronDown,
  ChevronRight,
  Globe,
  Compass,
  Anchor,
  Layers,
  Plus,
  Users,
  Bell,
  HelpCircle,
  LogOut,
  Building2,
  Image,
  DollarSign,
  UserCircle,
  Shield,
  FolderTree,
  Car,
  CalendarDays,
  BedDouble,
  CalendarCheck,
  TrendingUp,
  FileText,
  Wallet,
  Star,
  UserCheck,
  BarChart2,
  ThumbsUp,
  CalendarRange,
  HeadphonesIcon,
  Target,
  UsersRound,
  ShoppingBag,
  Lock,
  Palette,
  Plug,
  Server,
  Database,
  CheckSquare,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const DEFAULT_COLLAPSED_GROUPS: Record<string, boolean> = {
  Developer: true,
  "System Settings": true,
  Settings: true,
  Insights: true,
  "Customer Relations": true,
};

// Map sidebar item IDs to routes
const ROUTE_MAP: Record<string, string> = {
  dashboard: "/dashboard",
  bookings: "/bookings",
  support: "/support",
  tickets: "/support/tickets",
  "refund-disputes": "/support/refunds",
  users: "/users",
  customers: "/users/customers",
  "vendors-users": "/users/vendors",
  admins: "/users/admins",
  "vendor-approvals": "/vendor-approvals",
  listings: "/listings",
  "create-listing": "/listings/create",
  "listing-reviews": "/reviews",
  stays: "/listings",
  tours: "/listings",
  safaris: "/listings",
  experiences: "/listings",
  transfers: "/listings",
  vendors: "/vendors",
  categories: "/categories",
  reviews: "/reviews",
  finance: "/finance",
  "vendor-bookings": "/vendor/bookings",
  "vendor-performance": "/vendor/performance",
  "vendor-revenue": "/vendor/revenue",
  "vendor-reviews": "/vendor/reviews",
  "vendor-availability": "/vendor/availability",
  "vendor-insights": "/vendor/insights",
  "vendor-team": "/vendor/team",
  "vendor-notifications": "/vendor/notifications",
  "vendor-support": "/vendor/support",
  "settings-system": "/settings/system",
  "settings-roles": "/settings/roles",
  "settings-marketplace": "/settings/marketplace",
  "settings-categories": "/settings/categories",
  "settings-notifications": "/settings/notifications",
  "settings-security": "/settings/security",
  "settings-branding": "/settings/branding",
  "settings-finance": "/settings/finance",
  "settings-audit": "/settings/audit",
  "settings-integrations": "/settings/integrations",
  payments: "/payments",
  payouts: "/payouts",
  refunds: "/refunds",
  revenue: "/revenue",
  commission: "/commission",
  transport: "/transport",
  "transport-requests": "/transport/requests",
  "transport-vehicles": "/transport/vehicles",
  "transport-pricing": "/transport/pricing",
  drivers: "/drivers",
  activity: "/activity",
  "audit-logs": "/audit-logs",
  analytics: "/analytics",
  workflows: "/workflows",
  "api-integration": "/api-integration",
  "system-architecture": "/system-architecture",
  "qa-checklist": "/qa-checklist",
  performance: "/performance",
  "revenue-reports": "/revenue-reports",
  media: "/media",
  "media-library": "/media",
  pricing: "/pricing",
  "hotel-dashboard": "/hotel/dashboard",
  "availability-calendar": "/hotel/availability",
  "room-inventory": "/hotel/rooms",
  reservations: "/hotel/reservations",
  "seasonal-pricing": "/hotel/pricing",
  "property-settings": "/hotel/settings",
  policies: "/hotel/policies",
  profile: "/profile",
  notifications: "/notifications",
  help: "/help",
  settings: "/settings",
};

export function Sidebar() {
  const { user, effectiveUser, logout, viewAsVendor, toggleViewAsVendor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(DEFAULT_COLLAPSED_GROUPS);
  const isAdmin = effectiveUser?.role === "admin";
  const isVendor = effectiveUser?.role === "vendor";
  const approvedCategories = effectiveUser?.approvedCategories || [];
  const isStayVendor = isVendor && approvedCategories.length === 1 && approvedCategories.includes("Stay");

  // Determine active section from current route
  const getActiveSection = () => {
    const path = location.pathname;
    const listingCategory = new URLSearchParams(location.search).get("category");
    if (path.startsWith("/hotel/")) {
      if (path === "/hotel/dashboard") return "hotel-dashboard";
      if (path === "/hotel/availability") return "availability-calendar";
      if (path === "/hotel/rooms") return "room-inventory";
      if (path === "/hotel/reservations") return "reservations";
      if (path === "/hotel/pricing") return "seasonal-pricing";
      if (path === "/hotel/settings") return "property-settings";
      if (path === "/hotel/policies") return "policies";
    }
    if (path.startsWith("/vendor/")) {
      if (path === "/vendor/bookings") return "vendor-bookings";
      if (path === "/vendor/performance") return "vendor-performance";
      if (path === "/vendor/revenue") return "vendor-revenue";
      if (path === "/vendor/reviews") return "vendor-reviews";
      if (path === "/vendor/availability") return "vendor-availability";
      if (path === "/vendor/insights") return "vendor-insights";
      if (path === "/vendor/team") return "vendor-team";
      if (path === "/vendor/notifications") return "vendor-notifications";
      if (path === "/vendor/support") return "vendor-support";
    }
    if (path.startsWith("/settings/")) {
      if (path === "/settings/system") return "settings-system";
      if (path === "/settings/roles") return "settings-roles";
      if (path === "/settings/marketplace") return "settings-marketplace";
      if (path === "/settings/categories") return "settings-categories";
      if (path === "/settings/notifications") return "settings-notifications";
      if (path === "/settings/security") return "settings-security";
      if (path === "/settings/branding") return "settings-branding";
      if (path === "/settings/finance") return "settings-finance";
      if (path === "/settings/audit") return "settings-audit";
      if (path === "/settings/integrations") return "settings-integrations";
    }
    if (path === "/dashboard") return "dashboard";
    if (path === "/bookings") return "bookings";
    if (path === "/listings/create") return "create-listing";
    if (path === "/listings") {
      if (isAdmin) {
        if (listingCategory === "stay") return "stays";
        if (listingCategory === "tour") return "tours";
        if (listingCategory === "safari") return "safaris";
        if (listingCategory === "experience") return "experiences";
      }
      if (isVendor) {
        if (listingCategory === "stay") return "stays";
        if (listingCategory === "safari") return "safaris";
        if (listingCategory === "experience") return "experiences";
      }
      return "listings";
    }
    if (path.startsWith("/listings/")) return "listings";
    if (path === "/reviews") return "listing-reviews";
    if (path === "/vendors") return "vendors";
    if (path === "/admins") return "admins";
    if (path === "/media") return "media";
    if (path === "/pricing") return "pricing";
    if (path === "/finance") return "finance";
    if (path === "/payments") return "payments";
    if (path === "/payouts") return "payouts";
    if (path === "/refunds") return "refunds";
    if (path === "/revenue") return "revenue";
    if (path === "/commission") return "commission";
    if (path === "/transport" && !path.startsWith("/transport/")) return "transport";
    if (path === "/transport/requests") return "transport-requests";
    if (path === "/transport/vehicles") return "transport-vehicles";
    if (path === "/transport/pricing") return "transport-pricing";
    if (path === "/support" && !path.startsWith("/support/")) return "support";
    if (path === "/support/tickets") return "tickets";
    if (path === "/support/refunds") return "refund-disputes";
    if (path === "/activity") return "activity";
    if (path === "/audit-logs") return "audit-logs";
    if (path === "/analytics") return "analytics";
    if (path === "/workflows") return "workflows";
    if (path === "/api-integration") return "api-integration";
    if (path === "/system-architecture") return "system-architecture";
    if (path === "/qa-checklist") return "qa-checklist";
    return "dashboard";
  };

  const activeSection = getActiveSection();

  const getRouteForItem = (id: string) => {
    if (isVendor) {
      if (id === "stays") return "/listings?category=stay";
      if (id === "safaris") return "/listings?category=safari";
      if (id === "experiences") return "/listings?category=experience";
      return ROUTE_MAP[id] || "/dashboard";
    }
    if (!isAdmin) return ROUTE_MAP[id] || "/dashboard";
    if (id === "stays") return "/listings?category=stay";
    if (id === "tours") return "/listings?category=tour";
    if (id === "safaris") return "/listings?category=safari";
    if (id === "experiences") return "/listings?category=experience";
    return ROUTE_MAP[id] || "/dashboard";
  };

  // Build dynamic navigation based on role
  const buildNav = () => {
    const nav = [];

    // Hotel-specific navigation for Stay-only vendors
    if (isStayVendor) {
      nav.push({
        group: "Hotel Operations",
        items: [
          { id: "hotel-dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "availability-calendar", label: "Availability Calendar", icon: CalendarDays },
          { id: "room-inventory", label: "Room Inventory", icon: BedDouble },
          { id: "reservations", label: "Reservations", icon: CalendarCheck },
        ],
      });
      nav.push({
        group: "Pricing",
        items: [
          { id: "pricing", label: "Pricing & Rates", icon: DollarSign },
          { id: "seasonal-pricing", label: "Seasonal Pricing", icon: TrendingUp },
        ],
      });
      nav.push({
        group: "Property",
        items: [
          { id: "media", label: "Media", icon: Image },
          { id: "property-settings", label: "Property Settings", icon: Settings },
          { id: "policies", label: "Policies", icon: FileText },
        ],
      });
      nav.push({
        group: "Account",
        items: [
          { id: "profile", label: "Profile", icon: UserCircle },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "help", label: "Help & Docs", icon: HelpCircle },
        ],
      });
      return nav;
    }

    // Dashboard (all users) + Bookings for admins
    const overviewItems = [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }];
    if (isAdmin) {
      overviewItems.push({ id: "bookings", label: "Bookings", icon: CalendarCheck });
    }
    
    nav.push({
      group: "Overview",
      items: overviewItems,
    });

    // Listings sections (role-aware)
    const stayItems = [];
    const otherListingsItems = [];

    if (isAdmin) {
      stayItems.push({ id: "stays", label: "Stays", icon: Building2 });
      otherListingsItems.push({ id: "listings", label: "All Listings", icon: Layers });
      otherListingsItems.push({ id: "tours", label: "Tours", icon: Compass });
      otherListingsItems.push({ id: "safaris", label: "Safaris", icon: Globe });
      otherListingsItems.push({ id: "experiences", label: "Experiences", icon: Anchor });
    } else if (isVendor) {
      if (approvedCategories.includes("Stay")) {
        stayItems.push({ id: "stays", label: "Stay Listings", icon: Building2 });
      }

      otherListingsItems.push({ id: "listings", label: "All Listings", icon: Layers });
      if (effectiveUser?.vendorStatus === "approved") {
        otherListingsItems.push({ id: "create-listing", label: "Create Listing", icon: Plus });
      }

      // Vendors only see their approved categories
      if (approvedCategories.includes("Safari")) {
        otherListingsItems.push({ id: "safaris", label: "Safari Listings", icon: Globe });
      }
      if (approvedCategories.includes("Experience")) {
        otherListingsItems.push({ id: "experiences", label: "Experience Listings", icon: Anchor });
      }
    }

    const pushListingsSections = () => {
      if (stayItems.length > 0) {
        nav.push({
          group: "Stays",
          items: stayItems,
        });
      }

      if (otherListingsItems.length > 0) {
        nav.push({
          group: "Other Listings",
          items: otherListingsItems,
        });
      }
    };

    if (isAdmin) {
      nav.push({
        group: "Transport",
        items: [
          { id: "transport", label: "Transport Dashboard", icon: LayoutDashboard },
          { id: "transport-requests", label: "Transfer Requests", icon: Car },
          { id: "transport-vehicles", label: "Vehicle Categories", icon: Car },
          { id: "transport-pricing", label: "Pricing Rules", icon: DollarSign },
        ],
      });

      pushListingsSections();
      nav.push({
        group: "Management",
        items: [
          { id: "users", label: "All Users", icon: Users },
          { id: "vendor-approvals", label: "Vendor Approvals", icon: UserCheck },
          { id: "listing-reviews", label: "Listing Reviews", icon: Star },
        ],
      });

      nav.push({
        group: "Developer",
        items: [
          { id: "api-integration", label: "API Integration", icon: Server },
          { id: "system-architecture", label: "System Architecture", icon: Database },
          { id: "qa-checklist", label: "Portal QA Checklist", icon: CheckSquare },
        ],
      });

      nav.push({
        group: "System Settings",
        items: [
          { id: "settings-system", label: "Settings Dashboard", icon: Settings },
          { id: "settings-roles", label: "Roles & Permissions", icon: Shield },
          { id: "settings-marketplace", label: "Marketplace", icon: ShoppingBag },
          { id: "settings-categories", label: "Categories", icon: FolderTree },
          { id: "settings-notifications", label: "Notifications", icon: Bell },
          { id: "settings-security", label: "Security", icon: Lock },
          { id: "settings-branding", label: "Branding", icon: Palette },
          { id: "settings-finance", label: "Finance", icon: DollarSign },
          { id: "settings-audit", label: "Audit Logs", icon: FileText },
          { id: "settings-integrations", label: "Integrations", icon: Plug },
        ],
      });
    } else {
      pushListingsSections();
    }


    // Vendor-only: Business Center
    if (isVendor && !isStayVendor) {
      nav.push({
        group: "Business",
        items: [
          { id: "vendor-bookings", label: "Booking Center", icon: CalendarCheck },
          { id: "vendor-availability", label: "Availability", icon: CalendarRange },
        ],
      });

      nav.push({
        group: "Customer Relations",
        items: [
          { id: "vendor-reviews", label: "Reviews", icon: ThumbsUp },
        ],
      });

      nav.push({
        group: "Insights",
        items: [
          { id: "vendor-insights", label: "Business Insights", icon: Target },
          { id: "vendor-team", label: "Team", icon: UsersRound },
          { id: "vendor-performance", label: "Performance", icon: BarChart2 },
          { id: "vendor-revenue", label: "Revenue", icon: Wallet },
        ],
      });
    }

    // Settings (all users)
    const settingsItems = [];

    if (isAdmin) {
      settingsItems.push({ id: "settings", label: "Settings", icon: Settings });
      settingsItems.push({ id: "media-library", label: "Media Library", icon: Image });
    }

    if (isVendor) {
      settingsItems.push({ id: "profile", label: "Profile", icon: UserCircle });
      if (!isStayVendor) {
        settingsItems.push({ id: "vendor-notifications", label: "Notifications", icon: Bell });
        settingsItems.push({ id: "vendor-support", label: "Support", icon: HeadphonesIcon });
      }
    }

    if (!isVendor || isStayVendor) {
      settingsItems.push({ id: "notifications", label: "Notifications", icon: Bell });
    }

    settingsItems.push({ id: "help", label: "Help & Docs", icon: HelpCircle });

    nav.push({
      group: "Settings",
      items: settingsItems,
    });

    return nav;
  };

  const NAV = buildNav();

  const toggle = (group: string) =>
    setCollapsed((p) => ({ ...p, [group]: !p[group] }));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Hotel vendor badge in logo area
  const logoSub = isStayVendor ? "Hotel Portal" : "Admin";

  return (
    <aside
      className="flex flex-col h-full w-[220px] shrink-0 overflow-y-auto"
      style={{
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-light)",
      }}
    >
      {/* Vendor Preview Banner */}
      {viewAsVendor && (
        <button
          onClick={() => toggleViewAsVendor()}
          className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[10px] font-semibold tracking-wider uppercase transition-all shrink-0"
          style={{
            background: "linear-gradient(90deg, #7c3aed, #6d28d9)",
            color: "white",
            letterSpacing: "0.08em",
          }}
          title="Click to exit vendor preview"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
          Vendor Preview — Click to Exit
        </button>
      )}

      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 py-5"
        style={{ borderBottom: "1px solid var(--border-light)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
            boxShadow: "0 0 12px var(--border-accent)",
          }}
        >
          <Compass size={16} className="text-white" />
        </div>
        <div>
          <p className="text-[13px] tracking-wide" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Voyage
          </p>
          <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--accent-navy)" }}>
            {logoSub}
          </p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV.map(({ group, items }) => (
          <div key={group}>
            <button
              onClick={() => toggle(group)}
              className="flex items-center justify-between w-full px-2 mb-1.5 group"
            >
              <span
                className="text-[10px] tracking-widest uppercase"
                style={{ color: "var(--text-tertiary)", fontWeight: 600 }}
              >
                {group}
              </span>
              {collapsed[group] ? (
                <ChevronRight size={11} style={{ color: "var(--text-tertiary)" }} />
              ) : (
                <ChevronDown size={11} style={{ color: "var(--text-tertiary)" }} />
              )}
            </button>

            {!collapsed[group] && (
              <ul className="space-y-0.5">
                {items.map(({ id, label, icon: Icon }) => {
                  const isActive = activeSection === id;
                  const route = getRouteForItem(id);
                  return (
                    <li key={id}>
                      <Link
                        to={route}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg transition-all duration-150 text-[13px]"
                        style={
                          isActive
                            ? {
                                background: "var(--active-overlay)",
                                color: "var(--accent-navy-light)",
                                boxShadow: "inset 0 0 0 1px var(--border-accent)",
                              }
                            : { color: "var(--text-secondary)" }
                        }
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                            (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                          }
                        }}
                      >
                        <Icon size={14} />
                        <span style={{ fontWeight: isActive ? 500 : 400 }}>{label}</span>
                        {isActive && (
                          <div
                            className="ml-auto w-1.5 h-1.5 rounded-full"
                            style={{ background: "var(--accent-navy)", boxShadow: "0 0 6px var(--accent-navy)" }}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* User Info & Footer */}
      <div style={{ borderTop: "1px solid var(--border-light)" }}>
        <div className="px-3 py-3">
          <div className="flex items-center gap-2.5 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                boxShadow: "0 0 0 2px var(--border-accent)",
                color: "white",
                fontWeight: 600,
              }}
            >
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] truncate" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {user?.name}
              </p>
              <p
                className="text-[10px] truncate capitalize"
                style={{
                  color: viewAsVendor ? "#a78bfa" : "var(--text-tertiary)",
                  fontWeight: viewAsVendor ? 600 : 400,
                }}
              >
                {effectiveUser?.role}{viewAsVendor && " ✦ preview"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] transition-all"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--error)";
              (e.currentTarget as HTMLElement).style.background = "rgba(239, 68, 68, 0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

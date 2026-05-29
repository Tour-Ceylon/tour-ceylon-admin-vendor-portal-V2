import { User, Category } from "../contexts/AuthContext";

/**
 * Permission utility functions for role-based access control
 * Handles admin, vendor, and category-specific permissions
 */

// Basic role checks
export function isAdmin(user: User | null): boolean {
  return user?.role === "admin";
}

export function isVendor(user: User | null): boolean {
  return user?.role === "vendor";
}

export function isApprovedVendor(user: User | null): boolean {
  return isVendor(user) && user?.vendorStatus === "approved";
}

// Check if user has admin privileges (admin role or admin-vendor hybrid)
export function hasAdminPrivileges(user: User | null): boolean {
  return isAdmin(user);
}

export function isPendingVendor(user: User | null): boolean {
  return isVendor(user) && user?.vendorStatus === "pending";
}

export function isSuspendedVendor(user: User | null): boolean {
  return isVendor(user) && user?.vendorStatus === "suspended";
}

export function isRejectedVendor(user: User | null): boolean {
  return isVendor(user) && user?.vendorStatus === "rejected";
}

// Category access checks
export function hasCategoryAccess(user: User | null, category: Category): boolean {
  if (isAdmin(user)) return true;
  if (!isApprovedVendor(user)) return false;
  
  const approvedCategories = user?.approvedCategories || [];
  return approvedCategories.includes(category);
}

export function hasAnyCategoryAccess(user: User | null, categories: Category[]): boolean {
  if (isAdmin(user)) return true;
  if (!isApprovedVendor(user)) return false;
  
  const approvedCategories = user?.approvedCategories || [];
  return categories.some(category => approvedCategories.includes(category));
}

export function getAccessibleCategories(user: User | null): Category[] {
  if (isAdmin(user)) {
    return ["Stay", "Tour", "Safari", "Experience", "Transfer"];
  }
  
  if (!isApprovedVendor(user)) return [];
  
  return user?.approvedCategories || [];
}

// Listing permissions
export function canCreateListing(user: User | null, category?: Category): boolean {
  // Admin/admin-vendor can create any listing category
  if (hasAdminPrivileges(user)) return true;
  
  // Normal vendors must be approved
  if (!isApprovedVendor(user)) return false;
  
  if (category) {
    return hasCategoryAccess(user, category);
  }
  
  // Can create if has any approved categories
  const approvedCategories = user?.approvedCategories || [];
  return approvedCategories.length > 0;
}

export function canEditListing(user: User | null, listingCategory?: Category): boolean {
  if (isAdmin(user)) return true;
  if (!isApprovedVendor(user)) return false;
  
  if (listingCategory) {
    return hasCategoryAccess(user, listingCategory);
  }
  
  return true; // Can edit own listings if approved vendor
}

export function canDeleteListing(user: User | null, listingCategory?: Category): boolean {
  return canEditListing(user, listingCategory);
}

// Hotel/Stay-specific permissions
export function canAccessHotelTools(user: User | null): boolean {
  // Admin/admin-vendor can access hotel tools regardless of category approval
  if (hasAdminPrivileges(user)) return true;
  
  // Normal vendors need Stay category approval
  return hasCategoryAccess(user, "Stay");
}

export function isStayOnlyVendor(user: User | null): boolean {
  if (!isApprovedVendor(user)) return false;
  
  const approvedCategories = user?.approvedCategories || [];
  return approvedCategories.length === 1 && approvedCategories.includes("Stay");
}

// Portal access permissions
export function canAccessVendorPortal(user: User | null): boolean {
  return isApprovedVendor(user) || hasAdminPrivileges(user);
}

export function canAccessVendorPage(user: User | null): boolean {
  return isApprovedVendor(user) || hasAdminPrivileges(user);
}

export function canAccessAdminPage(user: User | null): boolean {
  return hasAdminPrivileges(user);
}

// Specific admin-only features
export function canAccessUserManagement(user: User | null): boolean {
  return isAdmin(user);
}

export function canAccessVendorApprovals(user: User | null): boolean {
  return isAdmin(user);
}

export function canAccessFinanceModule(user: User | null): boolean {
  return isAdmin(user);
}

export function canAccessTransportModule(user: User | null): boolean {
  return isAdmin(user);
}

export function canAccessSupportModule(user: User | null): boolean {
  return isAdmin(user);
}

export function canAccessAnalytics(user: User | null): boolean {
  return isAdmin(user);
}

export function canAccessSystemSettings(user: User | null): boolean {
  return isAdmin(user);
}

export function canAccessWorkflows(user: User | null): boolean {
  return isAdmin(user);
}

export function canAccessAPIIntegration(user: User | null): boolean {
  return isAdmin(user);
}

export function canAccessSystemArchitecture(user: User | null): boolean {
  return isAdmin(user);
}

export function canAccessQAChecklist(user: User | null): boolean {
  return isAdmin(user);
}

// Route permission checks
export function canAccessRoute(user: User | null, path: string): boolean {
  // Admin can access everything
  if (hasAdminPrivileges(user)) return true;
  
  // Vendor route checks
  if (isVendor(user)) {
    // Pending/rejected/suspended vendors (unless they have admin privileges)
    if (!isApprovedVendor(user) && !hasAdminPrivileges(user)) {
      // Only allow dashboard and profile for non-approved vendors
      return path === "/dashboard" || path === "/profile";
    }
    
    // Admin-only routes (blocked for normal vendors, allowed for admin-vendors)
    const adminOnlyPaths = [
      "/users", "/vendor-approvals", "/vendors", "/admins",
      "/finance", "/payments", "/payouts", "/refunds", "/commission",
      "/transport", "/support", "/activity", "/audit-logs",
      "/analytics", "/workflows", "/api-integration", 
      "/system-architecture", "/qa-checklist", "/settings/"
    ];
    
    if (adminOnlyPaths.some(adminPath => path.startsWith(adminPath))) {
      return hasAdminPrivileges(user);
    }
    
    // Hotel-specific routes (only restricted for normal vendors without Stay category)
    if (path.startsWith("/hotel/")) {
      return hasAdminPrivileges(user) || canAccessHotelTools(user);
    }
    
    // Vendor portal pages - accessible to all approved vendors and admin-vendors
    const vendorPortalPaths = [
      "/dashboard", "/listings", "/pricing", "/availability", "/reviews", 
      "/revenue", "/performance", "/vendor-insights", "/media", "/profile", 
      "/notifications", "/help", "/vendor/"
    ];
    
    if (vendorPortalPaths.some(vendorPath => path.startsWith(vendorPath))) {
      return isApprovedVendor(user) || hasAdminPrivileges(user);
    }
    
    // Allow any other vendor-specific routes
    return isApprovedVendor(user) || hasAdminPrivileges(user);
  }
  
  return false;
}

// UI helper functions
export function shouldShowInNavigation(user: User | null, itemId: string): boolean {
  // Admin can see everything
  if (hasAdminPrivileges(user)) return true;
  
  // Non-approved vendors (without admin privileges) see limited items
  if (isVendor(user) && !isApprovedVendor(user) && !hasAdminPrivileges(user)) {
    return ["dashboard", "profile", "help"].includes(itemId);
  }
  
  // Approved vendors or admin-vendors
  if (isApprovedVendor(user) || hasAdminPrivileges(user)) {
    // Category-specific navigation items (only restricted for normal vendors)
    const categoryItems = {
      "stays": "Stay",
      "tours": "Tour", 
      "safaris": "Safari",
      "experiences": "Experience",
      "transfers": "Transfer"
    };
    
    if (itemId in categoryItems) {
      // Admin-vendors can see all categories, normal vendors need approval
      return hasAdminPrivileges(user) || hasCategoryAccess(user, categoryItems[itemId as keyof typeof categoryItems] as Category);
    }
    
    // Hotel-specific items (only restricted for normal vendors without Stay)
    const hotelItems = [
      "hotel-dashboard", "availability-calendar", "room-inventory", 
      "reservations", "seasonal-pricing", "property-settings", "policies"
    ];
    
    if (hotelItems.includes(itemId)) {
      return hasAdminPrivileges(user) || canAccessHotelTools(user);
    }
    
    // Admin-only items (blocked for normal vendors, allowed for admin-vendors)
    const adminOnlyItems = [
      "users", "customers", "vendors-users", "admins", "vendor-approvals",
      "finance", "payments", "payouts", "refunds", "commission",
      "transport", "transport-requests", "transport-vehicles", "transport-pricing",
      "support", "tickets", "refund-disputes", "activity", "audit-logs",
      "analytics", "workflows", "api-integration", "system-architecture", 
      "qa-checklist", "settings-system", "settings-roles", "settings-marketplace",
      "settings-categories", "settings-notifications", "settings-security",
      "settings-branding", "settings-finance", "settings-audit", "settings-integrations"
    ];
    
    if (adminOnlyItems.includes(itemId)) {
      return hasAdminPrivileges(user);
    }
    
    // Allow vendor-specific items for all approved vendors and admin-vendors
    const vendorItems = [
      "dashboard", "listings", "vendor-bookings", "vendor-performance", 
      "vendor-revenue", "vendor-reviews", "vendor-availability", 
      "vendor-insights", "vendor-team", "vendor-notifications", 
      "vendor-support", "media", "pricing", "profile", "notifications", "help"
    ];
    
    return vendorItems.includes(itemId);
  }
  
  return false;
}

// Validation helpers
export function validateCategoryAccess(user: User | null, category: Category): { valid: boolean; message?: string } {
  if (!user) {
    return { valid: false, message: "User not authenticated" };
  }
  
  if (isAdmin(user)) {
    return { valid: true };
  }
  
  if (!isApprovedVendor(user)) {
    return { valid: false, message: "Vendor account must be approved to access categories" };
  }
  
  if (!hasCategoryAccess(user, category)) {
    return { valid: false, message: `You don't have access to ${category} category. Contact admin to request access.` };
  }
  
  return { valid: true };
}

// Get user status message
export function getUserStatusMessage(user: User | null): string | null {
  if (!user) return null;
  
  if (isAdmin(user)) return null;
  
  if (isPendingVendor(user)) {
    return "Your vendor application is pending approval";
  }
  
  if (isRejectedVendor(user)) {
    return "Your vendor application has been rejected";
  }
  
  if (isSuspendedVendor(user)) {
    return "Your vendor account has been suspended";
  }
  
  if (isApprovedVendor(user)) {
    const categories = user?.approvedCategories || [];
    if (categories.length === 0) {
      return "No categories approved yet. Contact admin to request category access.";
    }
  }
  
  return null;
}
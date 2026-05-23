import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/clerk-react";
import { apiFetch } from "../components/api/apiClient";

export type UserRole = "admin" | "vendor" | "customer/client";
export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";
export type Category = "Stay" | "Tour" | "Safari" | "Experience" | "Transfer";

export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
  role: UserRole;
  vendorStatus?: VendorStatus;
  approvedCategories?: Category[];
  company?: string;
}

interface AuthContextType {
  user: User | null;
  /** effectiveUser is what the UI should use — swapped to vendor role when viewAsVendor is active */
  effectiveUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  /** Dev-only: true when an admin is previewing as a vendor */
  viewAsVendor: boolean;
  toggleViewAsVendor: () => void;
  logout: () => Promise<void>;
  register: (data: VendorRegistrationData) => Promise<void>;
}

export interface VendorRegistrationData {
  businessName: string;
  vendorName: string;
  email: string;
  phone: string;
  country: string;
  businessDescription: string;
  categories: Category[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, signOut, userId } = useClerkAuth();
  const { user: clerkUser } = useClerkUser();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Dev-only view-as-vendor toggle — persisted in sessionStorage so it survives hot reload
  const [viewAsVendor, setViewAsVendor] = useState<boolean>(
    () => sessionStorage.getItem("dev:viewAsVendor") === "true"
  );

  const toggleViewAsVendor = () => {
    setViewAsVendor((prev) => {
      const next = !prev;
      sessionStorage.setItem("dev:viewAsVendor", String(next));
      return next;
    });
  };

  // Computed: what the UI renders — admin stays real, but role is spoofed when toggle is on
  const effectiveUser: User | null =
    user && user.role === "admin" && viewAsVendor
      ? {
          ...user,
          role: "vendor",
          vendorStatus: "approved",
          approvedCategories: user.approvedCategories?.length
            ? user.approvedCategories
            : ["Stay", "Tour", "Safari", "Experience", "Transfer"],
          company: user.company || "Voyage Operations",
        }
      : user;

  useEffect(() => {
    async function syncProfile() {
      // If Clerk is not loaded yet, keep loading
      if (!isLoaded) {
        setLoading(true);
        return;
      }

      // If not signed in to Clerk, clear auth states and stop loading
      if (!isSignedIn || !userId || !clerkUser) {
        setUser(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Call backend /users/me or /users/sync endpoint to resolve local DB record
        // The backend automatically auto-provisions or resolves the local user record using get_current_user
        const backendUser = await apiFetch("/users/me");

        if (!backendUser) {
          throw new Error("Unable to retrieve backend user profile.");
        }

        // 2. Resolve Role (admin / vendor / customer/client)
        // Map backend enums ("admin", "vendor", "tourist", "support") to frontend roles
        let role: UserRole = "customer/client";
        if (backendUser.role === "admin" || backendUser.role === "support") {
          role = "admin";
        } else if (backendUser.role === "vendor") {
          role = "vendor";
        }

        // Block customer/client role from entering the admin/vendor portal
        if (role === "customer/client") {
          throw new Error("Customer accounts are not authorized to access the management portal.");
        }

        // 3. Resolve Vendor Status & Approved Categories
        // Since backend uses standard model, read status, categories, and company details 
        // primarily from backendUser, and fallback to Clerk metadata or secure defaults
        const clerkMetadata = clerkUser.publicMetadata || {};
        const vendorStatus =
          (backendUser.vendorStatus || backendUser.vendor_status || clerkMetadata.vendorStatus as VendorStatus) ||
          "approved";
        const approvedCategories =
          (backendUser.approvedCategories || backendUser.approved_categories || clerkMetadata.approvedCategories as Category[]) || [
            "Stay", "Tour", "Safari", "Experience", "Transfer"
          ];
        const company =
          (backendUser.company || backendUser.company_name || clerkMetadata.company as string) ||
          "Voyage Operations";

        const normalizedUser: User = {
          id: backendUser.id || backendUser.clerk_user_id || userId,
          clerkUserId: userId,
          email: backendUser.email || clerkUser.primaryEmailAddress?.emailAddress || "",
          name: backendUser.full_name || clerkUser.fullName || "Management Member",
          role,
          vendorStatus,
          approvedCategories,
          company,
        };

        setUser(normalizedUser);
      } catch (err: any) {
        console.error("Backend auth profile synchronization failed:", err);
        setError(err.message || "Authentication synchronization failed. Please try again.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    syncProfile();
  }, [isLoaded, isSignedIn, userId, clerkUser]);

  const logout = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: VendorRegistrationData) => {
    setLoading(true);
    try {
      let responseUser;
      if (isSignedIn) {
        // If already signed in to Clerk, call the apply-vendor endpoint to update/apply for vendor role
        responseUser = await apiFetch("/users/apply-vendor", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } else {
        // Otherwise, create a new pending vendor user profile
        responseUser = await apiFetch("/users/", {
          method: "POST",
          body: JSON.stringify({
            clerk_user_id: null,
            email: data.email,
            full_name: data.vendorName,
            country: data.country,
            role: "vendor",
            is_active: true,
            vendor_status: "pending",
            company_name: data.businessName,
            approved_categories: data.categories,
            business_profile: {
              phone: data.phone,
              description: data.businessDescription,
            },
          }),
        });
      }

      // After registering/applying, set user in state to simulate immediate transition or updated profile
      const pendingUser: User = {
        id: responseUser?.id || userId || `vendor_${Date.now()}`,
        clerkUserId: userId || "",
        email: data.email,
        name: data.vendorName,
        role: "vendor",
        vendorStatus: "pending",
        approvedCategories: data.categories,
        company: data.businessName,
      };
      setUser(pendingUser);
      setError(null); // Clear any access denied errors so the pending approval screen renders correctly
    } catch (err: any) {
      console.error("Vendor registration failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        effectiveUser,
        isAuthenticated: !!user,
        loading,
        error,
        viewAsVendor,
        toggleViewAsVendor,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

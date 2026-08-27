import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/clerk-react";
import { apiFetch } from "../components/api/apiClient";

export type UserRole = "admin" | "vendor" | "driver" | "customer/client";
export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";
export type Category = "Stay" | "Tour" | "Safari" | "Experience";

export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  vendorStatus?: VendorStatus;
  approvedCategories?: Category[];
  company?: string;
  nicNumber?: string;
  vehiclePlateNumber?: string;
}

export interface DriverLuggageCapacityInput {
  luggage_size_type_id: string;
  quantity: number;
}

export interface DriverRegistrationData {
  fullName: string;
  nicNumber: string;
  email: string;
  phone: string;
  password?: string;
  vehicleModelPresetId?: string | null;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlateNumber: string;
  seats: number;
  luggageCapacities: DriverLuggageCapacityInput[];
  licenseNumber?: string;
  licensePhotoUrl?: string;
  nicPhotoUrl?: string;
  vehicleRegistrationDocUrl?: string;
  insuranceDocUrl?: string;
  policeClearanceDocUrl?: string;
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
  registerDriver: (data: DriverRegistrationData) => Promise<void>;
}

export interface VendorRegistrationData {
  businessName: string;
  vendorName: string;
  email: string;
  phone: string;
  password?: string;
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
          isActive: true,
          vendorStatus: "approved",
          approvedCategories: user.approvedCategories?.length
            ? user.approvedCategories
            : ["Stay", "Tour", "Safari", "Experience"],
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
        const backendUser = await apiFetch("/users/me");

        if (!backendUser) {
          throw new Error("Unable to retrieve backend user profile.");
        }

        // 2. Resolve Role (admin / vendor / driver / customer/client)
        let role: UserRole = "customer/client";
        const backendRole = String(backendUser.role || "").toUpperCase();
        if (backendRole === "ADMIN") {
          role = "admin";
        } else if (backendRole === "VENDOR") {
          role = "vendor";
        } else if (backendRole === "DRIVER") {
          role = "driver";
        }

        // Block customer/client/TOURIST role from entering the admin/vendor portal
        if (role === "customer/client") {
          throw new Error("Customer accounts are not authorized to access the management portal.");
        }

        const clerkMetadata = clerkUser.publicMetadata || {};

        const rawVendorStatus =
          backendUser.vendorStatus ||
          backendUser.vendor_status ||
          (clerkMetadata.vendorStatus as VendorStatus | undefined);
        const vendorStatus: VendorStatus =
          rawVendorStatus || (role === "vendor" || role === "driver" ? "pending" : "approved");

        const approvedCategories: Category[] =
          backendUser.approvedCategories ||
          backendUser.approved_categories ||
          (clerkMetadata.approvedCategories as Category[] | undefined) ||
          (role === "admin" ? ["Stay", "Tour", "Safari", "Experience"] : []);

        const company =
          (backendUser.company || backendUser.company_name || clerkMetadata.company as string) ||
          (role === "driver" ? "Independent Driver" : "Voyage Operations");

        // is_active comes from the SoftDeleteMixin column on the User model
        const isActive: boolean = backendUser.is_active !== false;

        const normalizedUser: User = {
          id: backendUser.id || backendUser.clerk_user_id || userId,
          clerkUserId: userId,
          email: backendUser.email || clerkUser.primaryEmailAddress?.emailAddress || "",
          name: backendUser.full_name || clerkUser.fullName || "Management Member",
          role,
          isActive,
          vendorStatus,
          approvedCategories,
          company,
          nicNumber: backendUser.driver_profile?.nic_number,
          vehiclePlateNumber: backendUser.driver_profile?.vehicle_plate_number,
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
        responseUser = await apiFetch("/users/apply-vendor", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } else {
        responseUser = await apiFetch("/users/", {
          method: "POST",
          body: JSON.stringify({
            clerk_user_id: userId || null,
            email: data.email,
            full_name: data.vendorName,
            password: data.password,
            country: data.country,
            role: "VENDOR",
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

      const pendingUser: User = {
        id: responseUser?.id || userId || `vendor_${Date.now()}`,
        clerkUserId: userId || "",
        email: data.email,
        name: data.vendorName,
        role: "vendor",
        isActive: true,
        vendorStatus: "pending",
        approvedCategories: data.categories,
        company: data.businessName,
      };
      setUser(pendingUser);
      setError(null);
    } catch (err: any) {
      console.error("Vendor registration failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerDriver = async (data: DriverRegistrationData) => {
    setLoading(true);
    try {
      const responseDriver = await apiFetch("/auth/driver/signup", {
        method: "POST",
        body: JSON.stringify({
          full_name: data.fullName,
          nic_number: data.nicNumber,
          email: data.email,
          phone: data.phone,
          password: data.password,
          clerk_user_id: userId || null,
          country: "Sri Lanka",
          vehicle_model_preset_id: data.vehicleModelPresetId || null,
          vehicle_make: data.vehicleMake,
          vehicle_model: data.vehicleModel,
          vehicle_plate_number: data.vehiclePlateNumber,
          seats: data.seats,
          luggage_capacities: data.luggageCapacities,
          license_number: data.licenseNumber,
          license_photo_url: data.licensePhotoUrl,
          nic_photo_url: data.nicPhotoUrl,
          vehicle_registration_doc_url: data.vehicleRegistrationDocUrl,
          insurance_doc_url: data.insuranceDocUrl,
          police_clearance_doc_url: data.policeClearanceDocUrl,
        }),
      });

      const pendingDriverUser: User = {
        id: responseDriver?.id || responseDriver?.user_id || userId || `driver_${Date.now()}`,
        clerkUserId: userId || "",
        email: data.email,
        name: data.fullName,
        role: "driver",
        isActive: true,
        vendorStatus: "pending",
        company: `${data.vehicleMake} ${data.vehicleModel} (${data.vehiclePlateNumber})`,
        nicNumber: data.nicNumber,
        vehiclePlateNumber: data.vehiclePlateNumber,
      };
      setUser(pendingDriverUser);
      setError(null);
    } catch (err: any) {
      console.error("Driver registration failed:", err);
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
        registerDriver,
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

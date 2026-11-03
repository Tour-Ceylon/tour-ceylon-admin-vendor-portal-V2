import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/clerk-react";
import { apiFetch } from "../components/api/apiClient";
import { toPortalRole, type PortalRole } from "../lib/roles";

export type UserRole = PortalRole;
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
  /** Re-read the signed-in user from /users/me without the full-screen loader (e.g. to see an approval). */
  refreshProfile: () => Promise<void>;
  /**
   * Send the vendor application for the account that is signed in right now. The password is never
   * sent: the account itself is created through Clerk's sign-up in the browser (SEC-5).
   */
  register: (data: VendorRegistrationData) => Promise<{ id: string } | undefined>;
  /** Same as register, but does not depend on this provider having re-rendered after a fresh sign-in. */
  applyAsVendor: (data: VendorRegistrationData) => Promise<{ id: string } | undefined>;
  /** Re-run the full profile load, with the loader (used right after the account or application changes). */
  resyncProfile: () => void;
  /** Send driver signup as multipart FormData (files included). */
  registerDriver: (formData: FormData) => Promise<void>;
  /** Upload vendor business documents after registration. */
  registerVendorDocuments: (userId: string, files: File[]) => Promise<void>;
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
    () => import.meta.env.DEV && sessionStorage.getItem("dev:viewAsVendor") === "true"
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

  // Bumped to force a full reload; syncSeq makes sure only the newest load may write state.
  const [syncKey, setSyncKey] = useState(0);
  const syncSeq = useRef(0);

  useEffect(() => {
    const seq = ++syncSeq.current;
    const isCurrent = () => seq === syncSeq.current;

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
        // Get the Clerk session token to pass to API calls
        const session = (window as any).Clerk?.session;
        let token: string | undefined;
        
        if (session) {
          try {
            token = await session.getToken();
          } catch (tokenErr) {
            console.error("Failed to get Clerk token:", tokenErr);
          }
        }
        
        if (!token) {
          throw new Error("Unable to retrieve authentication token. Please try signing in again.");
        }

        // 1. Call backend /users/me or /users/sync endpoint to resolve local DB record
        const backendUser = await apiFetch("/users/me");

        if (!backendUser) {
          throw new Error("Unable to retrieve backend user profile.");
        }

        // 2. Resolve the role through the one shared mapping (ADMIN/VENDOR/DRIVER/TOURIST -> admin/vendor/driver/customer)
        const role: UserRole = toPortalRole(backendUser.role);

        // Customers (TOURIST) cannot enter the admin/vendor/driver portal
        if (role === "customer") {
          console.warn("Customer account denied access to management portal. Backend role:", backendUser.role, "| User ID:", userId);
          throw new Error("Customer accounts are not authorized to access the management portal.");
        }

        const clerkMetadata = clerkUser.publicMetadata || {};

        const rawVendorStatus =
          backendUser.vendorStatus ||
          backendUser.vendor_status;
        const vendorStatus: VendorStatus =
          rawVendorStatus || "pending";

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

        if (isCurrent()) setUser(normalizedUser);
      } catch (err: any) {
        console.error("Backend auth profile synchronization failed:", err);
        if (isCurrent()) {
          setError(err.message || "Authentication synchronization failed. Please try again.");
          setUser(null);
        }
      } finally {
        if (isCurrent()) setLoading(false);
      }
    }

    syncProfile();
  }, [isLoaded, isSignedIn, userId, clerkUser, syncKey]);

  const resyncProfile = () => setSyncKey((key) => key + 1);

  const refreshProfile = async () => {
    try {
      const backendUser = await apiFetch("/users/me");
      if (!backendUser) return;
      const rawStatus = backendUser.vendorStatus || backendUser.vendor_status;
      setUser((prev) =>
        prev
          ? {
              ...prev,
              vendorStatus: (rawStatus as VendorStatus) || prev.vendorStatus,
              isActive: backendUser.is_active !== false,
              approvedCategories:
                backendUser.approvedCategories || backendUser.approved_categories || prev.approvedCategories,
            }
          : prev
      );
    } catch (err) {
      // A failed check just means we try again on the next poll; the user keeps what they had.
      console.warn("Could not refresh the profile:", err);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error("Logout failed:", err);
      setError("We could not sign you out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyAsVendor = async (data: VendorRegistrationData) => {
    // Everything except the password. Passwords belong to Clerk and never travel through our server.
    const { password: _password, ...profile } = data;
    const responseUser = await apiFetch("/users/apply-vendor", {
      method: "POST",
      body: JSON.stringify(profile),
    });
    return { id: responseUser?.id as string };
  };

  const register = async (data: VendorRegistrationData) => {
    if (!isSignedIn) {
      throw new Error("Create your account first, then send the application.");
    }
    setLoading(true);
    try {
      const result = await applyAsVendor(data);
      const pendingUser: User = {
        id: result.id || userId || `vendor_${Date.now()}`,
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
      return { id: result.id || pendingUser.id };
    } catch (err: any) {
      console.error("Vendor registration failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerVendorDocuments = async (userId: string, files: File[]): Promise<void> => {
    if (!files.length) return;
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    await apiFetch(`/users/${userId}/documents`, {
      method: "POST",
      body: formData,
    });
  };

  const registerDriver = async (formData: FormData): Promise<void> => {
    setLoading(true);
    try {
      // Inject clerk_user_id if the user is already signed in
      if (userId && !formData.has("clerk_user_id")) {
        formData.append("clerk_user_id", userId);
      }

      const responseDriver = await apiFetch("/auth/driver/signup", {
        method: "POST",
        body: formData, // apiFetch skips Content-Type for FormData
      });

      const pendingDriverUser: User = {
        id: responseDriver?.user_id || responseDriver?.id || userId || `driver_${Date.now()}`,
        clerkUserId: userId || "",
        email: (formData.get("email") as string) || "",
        name: (formData.get("full_name") as string) || "Driver",
        role: "driver",
        isActive: true,
        vendorStatus: "pending",
        company: [
          formData.get("vehicle_make"),
          formData.get("vehicle_model"),
          formData.get("vehicle_plate_number") ? `(${formData.get("vehicle_plate_number")})` : "",
        ]
          .filter(Boolean)
          .join(" "),
        nicNumber: (formData.get("nic_number") as string) || undefined,
        vehiclePlateNumber: (formData.get("vehicle_plate_number") as string) || undefined,
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
        applyAsVendor,
        resyncProfile,
        registerDriver,
        registerVendorDocuments,
        refreshProfile,
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

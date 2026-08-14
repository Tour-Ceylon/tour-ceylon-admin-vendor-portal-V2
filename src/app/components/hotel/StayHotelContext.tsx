import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Building2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import { listStayProperties, type StayPropertySummary } from "../api/stayVendorApi";
import { DashboardSkeleton } from "../common/SkeletonLoader";
import { EmptyState } from "../common/EmptyState";

const STORAGE_KEY = "stay-hotel:selected-property-id";

interface StayHotelContextValue {
  properties: StayPropertySummary[];
  selectedPropertyId: string | null;
  selectedProperty: StayPropertySummary | null;
  loading: boolean;
  error: string | null;
  refreshProperties: () => Promise<void>;
  setSelectedPropertyId: (propertyId: string | null) => void;
}

const StayHotelContext = createContext<StayHotelContextValue | undefined>(undefined);

export function StayHotelProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<StayPropertySummary[]>([]);
  const [selectedPropertyId, setSelectedPropertyIdState] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectProperty = (propertyId: string | null) => {
    setSelectedPropertyIdState(propertyId);
    if (propertyId) {
      sessionStorage.setItem(STORAGE_KEY, propertyId);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const refreshProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listStayProperties();
      const nextProperties = response.properties || [];
      setProperties(nextProperties);

      const savedId = sessionStorage.getItem(STORAGE_KEY);
      const hasSaved = savedId && nextProperties.some((property) => property.id === savedId);
      if (nextProperties.length === 1) {
        selectProperty(nextProperties[0].id);
      } else if (hasSaved) {
        selectProperty(savedId);
      } else {
        selectProperty(null);
      }
    } catch (err: any) {
      setError(err?.message || "Unable to load your stay properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshProperties();
  }, []);

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === selectedPropertyId) ?? null,
    [properties, selectedPropertyId],
  );

  const value = useMemo(
    () => ({
      properties,
      selectedPropertyId,
      selectedProperty,
      loading,
      error,
      refreshProperties,
      setSelectedPropertyId: selectProperty,
    }),
    [properties, selectedPropertyId, selectedProperty, loading, error],
  );

  return <StayHotelContext.Provider value={value}>{children}</StayHotelContext.Provider>;
}

export function useStayHotel() {
  const context = useContext(StayHotelContext);
  if (!context) {
    throw new Error("useStayHotel must be used within StayHotelProvider");
  }
  return context;
}

export function StayHotelPropertySwitcher({ className = "" }: { className?: string }) {
  const { properties, selectedPropertyId, setSelectedPropertyId } = useStayHotel();

  if (properties.length <= 1) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
        Property
      </label>
      <select
        value={selectedPropertyId ?? ""}
        onChange={(event) => setSelectedPropertyId(event.target.value || null)}
        className="px-3 py-2 rounded-lg text-[12px] outline-none"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          color: "var(--text-primary)",
        }}
      >
        <option value="">Select a property</option>
        {properties.map((property) => (
          <option key={property.id} value={property.id}>
            {property.name}
          </option>
        ))}
      </select>
    </div>
  );
}

interface StayHotelPropertyGateProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
}

export function StayHotelPropertyGate({ children, loadingFallback }: StayHotelPropertyGateProps) {
  const navigate = useNavigate();
  const { properties, selectedProperty, loading, error, refreshProperties } = useStayHotel();

  if (loading) {
    return <>{loadingFallback ?? <DashboardSkeleton />}</>;
  }

  if (error) {
    return (
      <EmptyState
        icon={RefreshCw}
        title="Unable to load stay operations"
        description={error}
        action={{ label: "Retry", onClick: () => void refreshProperties() }}
      />
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No stay property found"
        description="Create or complete a stay listing first, then the hotel operations area will connect to its inventory and reservations automatically."
        action={{ label: "Open Stay Listings", onClick: () => navigate("/listings?category=stay") }}
        secondaryAction={{ label: "Create Listing", onClick: () => navigate("/listings/create") }}
      />
    );
  }

  if (!selectedProperty) {
    return (
      <div className="flex items-center justify-center min-h-[420px] p-8">
        <div
          className="w-full max-w-lg rounded-2xl p-6 text-center"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "var(--accent-navy-subtle)",
              border: "1px solid var(--border-accent)",
            }}
          >
            <Building2 size={24} style={{ color: "var(--accent-navy-light)" }} />
          </div>
          <h3 className="text-[16px] mb-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Select a stay property
          </h3>
          <p className="text-[13px] mb-5" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Choose which hotel property you want to manage. The availability calendar, room inventory, and reservations will update to match it.
          </p>
          <div className="flex items-center justify-center">
            <StayHotelPropertySwitcher />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

import { useState } from "react";
import {
  Car,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Edit,
  MoreHorizontal,
} from "lucide-react";

interface VehicleCategory {
  id: string;
  name: string;
  passengerCapacity: number;
  luggageCapacity: number;
  baseFare: number;
  pricePerKm: number;
  minimumFare: number;
  airportSurcharge: number;
  nightSurcharge: number;
  active: boolean;
  totalBookings: number;
  revenue: number;
}

const SAMPLE_CATEGORIES: VehicleCategory[] = [
  {
    id: "1",
    name: "Standard Car",
    passengerCapacity: 4,
    luggageCapacity: 3,
    baseFare: 1500,
    pricePerKm: 80,
    minimumFare: 2000,
    airportSurcharge: 500,
    nightSurcharge: 300,
    active: true,
    totalBookings: 485,
    revenue: 324500,
  },
  {
    id: "2",
    name: "SUV",
    passengerCapacity: 6,
    luggageCapacity: 5,
    baseFare: 2200,
    pricePerKm: 120,
    minimumFare: 3000,
    airportSurcharge: 700,
    nightSurcharge: 400,
    active: true,
    totalBookings: 325,
    revenue: 421800,
  },
  {
    id: "3",
    name: "Van",
    passengerCapacity: 10,
    luggageCapacity: 8,
    baseFare: 3500,
    pricePerKm: 150,
    minimumFare: 4500,
    airportSurcharge: 1000,
    nightSurcharge: 500,
    active: true,
    totalBookings: 215,
    revenue: 382400,
  },
  {
    id: "4",
    name: "Luxury Van",
    passengerCapacity: 8,
    luggageCapacity: 6,
    baseFare: 5000,
    pricePerKm: 200,
    minimumFare: 6500,
    airportSurcharge: 1500,
    nightSurcharge: 800,
    active: true,
    totalBookings: 125,
    revenue: 298600,
  },
];

export function VehicleCategoriesPage() {
  const [categories, setCategories] = useState<VehicleCategory[]>(SAMPLE_CATEGORIES);

  const handleToggleActive = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, active: !cat.active } : cat
      )
    );
  };

  const stats = {
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.active).length,
    totalBookings: categories.reduce((sum, c) => sum + c.totalBookings, 0),
    totalRevenue: categories.reduce((sum, c) => sum + c.revenue, 0),
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Vehicle Categories
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Manage vehicle types, capacity, and pricing
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(59, 130, 246, 0.1)" }}
            >
              <Car size={18} style={{ color: "#3b82f6" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Total Categories
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.totalCategories}
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(34, 197, 94, 0.1)" }}
            >
              <CheckCircle size={18} style={{ color: "var(--success)" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Active Categories
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.activeCategories}
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(8, 145, 178, 0.1)" }}
            >
              <TrendingUp size={18} style={{ color: "#0891b2" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Total Bookings
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.totalBookings.toLocaleString()}
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(34, 197, 94, 0.1)" }}
            >
              <DollarSign size={18} style={{ color: "var(--success)" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Total Revenue
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            LKR {stats.totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Vehicle Categories Grid */}
      <div className="grid grid-cols-2 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: category.active ? "rgba(59, 130, 246, 0.12)" : "rgba(100, 116, 139, 0.12)" }}
                >
                  <Car size={20} style={{ color: category.active ? "#3b82f6" : "#64748b" }} />
                </div>
                <div>
                  <h3 className="text-[16px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] px-2 py-0.5 rounded"
                      style={{
                        background: category.active ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: category.active ? "var(--success)" : "var(--error)",
                        fontWeight: 600,
                      }}
                    >
                      {category.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                <MoreHorizontal size={14} />
              </button>
            </div>

            {/* Capacity */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div
                className="rounded-lg p-3"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users size={12} style={{ color: "var(--text-tertiary)" }} />
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    Passengers
                  </p>
                </div>
                <p className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {category.passengerCapacity}
                </p>
              </div>
              <div
                className="rounded-lg p-3"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase size={12} style={{ color: "var(--text-tertiary)" }} />
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    Luggage
                  </p>
                </div>
                <p className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {category.luggageCapacity}
                </p>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  Base Fare
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  LKR {category.baseFare.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  Price per km
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  LKR {category.pricePerKm.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  Minimum Fare
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  LKR {category.minimumFare.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  Airport Surcharge
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  LKR {category.airportSurcharge.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  Night Surcharge
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  LKR {category.nightSurcharge.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Performance */}
            <div
              className="rounded-lg p-3 mb-4"
              style={{
                background: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  Total Bookings
                </p>
                <p className="text-[14px]" style={{ color: "var(--success)", fontWeight: 700 }}>
                  {category.totalBookings}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  Revenue
                </p>
                <p className="text-[14px]" style={{ color: "var(--success)", fontWeight: 700 }}>
                  LKR {category.revenue.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <Edit size={14} />
                Edit Pricing
              </button>
              <button
                onClick={() => handleToggleActive(category.id)}
                className="px-3 py-2 text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all"
                style={{
                  background: category.active ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
                  color: category.active ? "var(--error)" : "var(--success)",
                  fontWeight: 600,
                }}
              >
                {category.active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                {category.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

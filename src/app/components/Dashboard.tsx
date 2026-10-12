import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { AdminDashboard } from "./dashboards/AdminDashboard";
import { VendorDashboard } from "./dashboards/VendorDashboard";

export function Dashboard() {
  const { effectiveUser } = useAuth();
  const isAdmin = effectiveUser?.role === "admin";
  const approvedCategories = effectiveUser?.approvedCategories || [];
  const isStayVendor =
    effectiveUser?.role === "vendor" &&
    (approvedCategories.includes("Stay") || approvedCategories.length === 0);

  if (isStayVendor) {
    return <Navigate to="/hotel/dashboard" replace />;
  }

  return isAdmin ? <AdminDashboard /> : <VendorDashboard />;
}
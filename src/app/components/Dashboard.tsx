import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { AdminDashboard } from "./dashboards/AdminDashboard";
import { VendorDashboard } from "./dashboards/VendorDashboard";

export function Dashboard() {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isStayVendor =
    user?.role === "vendor" &&
    user?.approvedCategories?.length === 1 &&
    user?.approvedCategories?.includes("Stay");

  if (isStayVendor) {
    return <Navigate to="/hotel/dashboard" replace />;
  }

  return isAdmin ? <AdminDashboard /> : <VendorDashboard />;
}
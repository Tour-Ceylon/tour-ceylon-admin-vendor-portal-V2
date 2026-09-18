import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { AdminDashboard } from "./dashboards/AdminDashboard";
import { VendorDashboard } from "./dashboards/VendorDashboard";

export function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return isAdmin ? <AdminDashboard /> : <VendorDashboard />;
}
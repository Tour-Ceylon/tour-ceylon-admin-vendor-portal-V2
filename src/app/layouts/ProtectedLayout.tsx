import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { Compass, AlertTriangle, ShieldAlert, LogOut, Lock } from "lucide-react";

export function ProtectedLayout() {
  const { isAuthenticated, user, effectiveUser, loading, error, logout } = useAuth();
  const location = useLocation();

  // 1. Loading State Screen
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "var(--bg-main)", color: "var(--text-primary)" }}
      >
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center animate-spin"
          style={{
            background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
            boxShadow: "0 0 24px var(--border-accent)",
          }}
        >
          <Compass size={32} className="text-white" />
        </div>
        <p className="text-[13px] animate-pulse" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
          Synchronizing secure credentials...
        </p>
      </div>
    );
  }

  // 2. Error Screen (Unauthorized / Sync Failures)
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "var(--bg-main)" }}
      >
        <div
          className="w-full max-w-md rounded-xl p-6 text-center"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="text-red-500" size={24} />
          </div>
          <h2 className="text-[18px] mb-2" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Access Denied
          </h2>
          <p className="text-[13px] mb-6" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {error}
          </p>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[13px] transition-all"
            style={{
              background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
              color: "white",
              border: "1px solid var(--border-accent)",
              fontWeight: 500,
            }}
          >
            <LogOut size={14} />
            <span>Sign Out & Switch Account</span>
          </button>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Pending Vendor Routing
  if (effectiveUser?.role === "vendor" && effectiveUser?.vendorStatus === "pending") {
    return <Navigate to="/pending" replace />;
  }

  // 4. Block Rejected / Suspended Vendors
  if (effectiveUser?.role === "vendor" && (effectiveUser?.vendorStatus === "rejected" || effectiveUser?.vendorStatus === "suspended")) {
    const isSuspended = effectiveUser?.vendorStatus === "suspended";
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "var(--bg-main)" }}
      >
        <div
          className="w-full max-w-md rounded-xl p-6 text-center"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            {isSuspended ? (
              <Lock className="text-amber-500" size={24} />
            ) : (
              <AlertTriangle className="text-amber-500" size={24} />
            )}
          </div>
          <h2 className="text-[18px] mb-2" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {isSuspended ? "Account Suspended" : "Application Rejected"}
          </h2>
          <p className="text-[13px] mb-6" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {isSuspended
              ? "Your vendor portal access has been temporarily suspended. Please contact the Voyage operations desk for clarification."
              : "Your vendor partnership application has been reviewed and rejected by the administration team."}
          </p>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[13px] transition-all"
            style={{
              background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
              color: "white",
              border: "1px solid var(--border-accent)",
              fontWeight: 500,
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  // 5. Vendor Route Authorization Guard
  // Prevent vendors from navigating to admin-only pages
  const isAdminPath =
    location.pathname.startsWith("/users") ||
    location.pathname.startsWith("/vendor-approvals") ||
    location.pathname.startsWith("/vendors") ||
    location.pathname.startsWith("/admins") ||
    location.pathname.startsWith("/finance") ||
    location.pathname.startsWith("/payments") ||
    location.pathname.startsWith("/payouts") ||
    location.pathname.startsWith("/refunds") ||
    location.pathname.startsWith("/commission") ||
    location.pathname.startsWith("/transport") ||
    location.pathname.startsWith("/support") ||
    location.pathname.startsWith("/activity") ||
    location.pathname.startsWith("/audit-logs") ||
    location.pathname.startsWith("/analytics") ||
    location.pathname.startsWith("/workflows") ||
    location.pathname.startsWith("/api-integration") ||
    location.pathname.startsWith("/system-architecture") ||
    location.pathname.startsWith("/qa-checklist") ||
    location.pathname.startsWith("/settings/");

  if (effectiveUser?.role === "vendor" && isAdminPath) {
    console.warn(`Vendor unauthorized for admin path: ${location.pathname}`);
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-main)", color: "var(--text-primary)" }}
    >
      {/* Sidebar - Hidden on mobile, visible on large screens */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />

        <main className="flex-1 overflow-auto" style={{ background: "var(--bg-main)" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

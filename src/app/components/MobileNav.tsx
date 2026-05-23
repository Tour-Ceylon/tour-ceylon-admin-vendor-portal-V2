import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Menu, X, Home, ShoppingBag, Users, Calendar, DollarSign, BarChart3, Settings, HelpCircle, LogOut } from "lucide-react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const mainNavItems = [
    { label: "Dashboard", icon: Home, path: "/" },
    { label: "Listings", icon: ShoppingBag, path: "/listings" },
    { label: "Vendors", icon: Users, path: "/vendors" },
    { label: "Bookings", icon: Calendar, path: "/bookings" },
    { label: "Finance", icon: DollarSign, path: "/finance" },
    { label: "Analytics", icon: BarChart3, path: "/analytics" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on small screens */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all"
        style={{
          background: "var(--input-background)",
          border: "1px solid var(--border-light)",
          color: "var(--text-primary)",
        }}
      >
        <Menu size={16} />
      </button>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 lg:hidden"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div
            className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            style={{
              background: "var(--bg-sidebar)",
              borderRight: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-2xl)",
              animation: "slideInLeft 0.3s ease-out",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--border-light)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px]"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  V
                </div>
                <div>
                  <p className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    Voyage Admin
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    Travel Platform
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-tertiary)",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="p-4 space-y-1">
              {mainNavItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all"
                    style={{
                      background: isActive ? "var(--active-overlay)" : "transparent",
                      border: isActive ? "1px solid var(--border-accent)" : "1px solid transparent",
                      color: isActive ? "var(--accent-navy-light)" : "var(--text-tertiary)",
                    }}
                  >
                    <item.icon size={18} />
                    <span className="text-[14px]" style={{ fontWeight: isActive ? 600 : 500 }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div
              className="absolute bottom-0 left-0 right-0 p-4 space-y-2"
              style={{ borderTop: "1px solid var(--border-light)" }}
            >
              <button
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-tertiary)",
                }}
              >
                <HelpCircle size={18} />
                <span className="text-[14px]" style={{ fontWeight: 500 }}>
                  Help & Support
                </span>
              </button>
              <button
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-tertiary)",
                }}
              >
                <LogOut size={18} />
                <span className="text-[14px]" style={{ fontWeight: 500 }}>
                  Sign Out
                </span>
              </button>
            </div>

            <style>{`
              @keyframes slideInLeft {
                from {
                  transform: translateX(-100%);
                }
                to {
                  transform: translateX(0);
                }
              }
            `}</style>
          </div>
        </>
      )}
    </>
  );
}

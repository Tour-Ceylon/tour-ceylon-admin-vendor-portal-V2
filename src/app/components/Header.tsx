import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Search, ChevronRight, ChevronDown, Bell, HelpCircle, ArrowLeft, Sun, Moon, Command, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "./shared/CommandPalette";
import { useAuth } from "../contexts/AuthContext";

const DATA_LAYERS = ["Production", "Staging", "Development", "Preview"];

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, viewAsVendor, toggleViewAsVendor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dataLayer, setDataLayer] = useState("Production");
  const [ddOpen, setDdOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global command palette keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Determine page info from route
  const isListingsPage = location.pathname === "/listings";
  const isEditor = location.pathname.startsWith("/listings/");
  const isCreate = location.pathname.endsWith("/create");
  const isEdit = location.pathname.includes("/edit");
  const showBreadcrumbs = isListingsPage || isEditor;

  const pageTitle = isCreate
    ? "Create Listing"
    : isEdit
    ? "Edit Listing"
    : isListingsPage
    ? "Listings"
    : "";

  const crumbs = isCreate || isEdit
    ? ["Listings", "Inventory", isCreate ? "New" : "Edit"]
    : isListingsPage
    ? ["Listings", "Inventory"]
    : [];

  return (
    <header
      className="flex items-center gap-2 md:gap-4 px-4 md:px-6 h-14 shrink-0"
      style={{
        background: "var(--bg-header)",
        borderBottom: "1px solid var(--border-light)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Mobile Menu */}
      <MobileNav />

      {/* Back button (editor only) */}
      {isEditor && (
        <button
          onClick={() => navigate("/listings")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all mr-1"
          style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-light)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--accent-navy-light)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)";
          }}
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>
      )}

      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <>
          <div className="flex items-center gap-1.5">
            {crumbs.map((crumb, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={12} style={{ color: "var(--text-tertiary)" }} />}
                <span
                  className="text-[12px]"
                  style={{ color: i === crumbs.length - 1 ? "var(--accent-navy-light)" : "var(--text-tertiary)" }}
                >
                  {crumb}
                </span>
              </div>
            ))}
          </div>

          <div className="w-px h-4 mx-1" style={{ background: "var(--border-medium)" }} />

          {/* Page title */}
          <h1
            className="text-[15px] shrink-0"
            style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "15px" }}
          >
            {pageTitle}
          </h1>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* View as Vendor toggle — dev helper, admin only */}
      {user?.role === "admin" && (
        <button
          id="view-as-vendor-toggle"
          onClick={() => {
            toggleViewAsVendor();
            // Navigate to dashboard to avoid landing on an admin-restricted page
            navigate("/dashboard");
          }}
          className="hidden md:flex items-center gap-1.5 px-3 h-8 rounded-lg text-[12px] font-medium transition-all shrink-0"
          style={{
            background: viewAsVendor
              ? "linear-gradient(135deg, #7c3aed22, #7c3aed44)"
              : "var(--hover-overlay)",
            border: viewAsVendor
              ? "1px solid #7c3aed"
              : "1px solid var(--border-light)",
            color: viewAsVendor ? "#a78bfa" : "var(--text-tertiary)",
          }}
          onMouseEnter={(e) => {
            if (!viewAsVendor) {
              (e.currentTarget as HTMLElement).style.borderColor = "#7c3aed";
              (e.currentTarget as HTMLElement).style.color = "#a78bfa";
            }
          }}
          onMouseLeave={(e) => {
            if (!viewAsVendor) {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
            }
          }}
          title={viewAsVendor ? "Exit vendor preview" : "Preview portal as a vendor"}
        >
          {viewAsVendor ? <EyeOff size={13} /> : <Eye size={13} />}
          <span>{viewAsVendor ? "Exit Vendor View" : "View as Vendor"}</span>
          {viewAsVendor && (
            <span
              className="ml-0.5 w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#a78bfa", boxShadow: "0 0 5px #a78bfa" }}
            />
          )}
        </button>
      )}

      {/* Command Palette Button - Icon only on mobile, full on desktop */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 px-3 h-8 rounded-lg transition-all w-auto md:w-56"
        style={{
          background: "var(--input-background)",
          border: "1px solid var(--border-light)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)";
        }}
      >
        <Search size={13} style={{ color: "var(--text-tertiary)" }} />
        <span className="hidden md:flex flex-1 text-left text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          Search...
        </span>
        <div
          className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]"
          style={{
            background: "var(--hover-overlay)",
            color: "var(--text-tertiary)",
            fontWeight: 500,
          }}
        >
          <Command size={10} />K
        </div>
      </button>

      {/* Data Layer Dropdown - Hidden on mobile */}
      <div className="relative hidden md:block">
        <button
          onClick={() => setDdOpen((p) => !p)}
          className="flex items-center gap-2 px-3 h-8 rounded-lg text-[12px] transition-all"
          style={{
            background: "var(--accent-navy-subtle)",
            border: "1px solid var(--border-accent)",
            color: "var(--accent-navy-light)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--success)", boxShadow: "0 0 5px var(--success)" }}
          />
          {dataLayer}
          <ChevronDown size={12} />
        </button>

        {ddOpen && (
          <div
            className="absolute right-0 top-full mt-1.5 w-40 rounded-xl overflow-hidden z-50"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-accent)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {DATA_LAYERS.map((layer) => (
              <button
                key={layer}
                onClick={() => {
                  setDataLayer(layer);
                  setDdOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px] text-left transition-all"
                style={{
                  color: dataLayer === layer ? "var(--accent-navy-light)" : "var(--text-tertiary)",
                  background: dataLayer === layer ? "var(--active-overlay)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (dataLayer !== layer)
                    (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                }}
                onMouseLeave={(e) => {
                  if (dataLayer !== layer)
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background:
                      layer === "Production"
                        ? "var(--success)"
                        : layer === "Staging"
                        ? "var(--warning)"
                        : "var(--text-tertiary)",
                  }}
                />
                {layer}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
        style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-light)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--accent-navy-light)";
          (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      </button>

      {/* Notification bell */}
      <button
        className="w-8 h-8 rounded-lg flex items-center justify-center relative transition-all"
        style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-light)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
          (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <Bell size={14} />
        <span
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--accent-navy)", boxShadow: "0 0 4px var(--accent-navy)" }}
        />
      </button>

      {/* Help - Hidden on mobile */}
      <button
        className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center transition-all"
        style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-light)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
          (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <HelpCircle size={14} />
      </button>

      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] shrink-0 cursor-pointer uppercase"
        style={{
          background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
          boxShadow: "0 0 0 2px var(--border-accent)",
          color: "white",
          fontWeight: 600,
        }}
        title={user?.name || "User Profile"}
      >
        {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
      </div>

      {/* Command Palette */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </header>
  );
}

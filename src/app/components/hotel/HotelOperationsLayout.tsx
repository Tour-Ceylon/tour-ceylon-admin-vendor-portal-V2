import { useState, useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Calendar,
  BedDouble,
  CalendarCheck,
  DollarSign,
  Building,
  ShieldCheck,
  Layers,
  PlusCircle,
  HeadphonesIcon,
  Building2,
  ExternalLink,
  RefreshCw,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Check,
  MapPin,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  User as UserIcon,
  Hotel,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { StayHotelProvider, useStayHotel } from "./StayHotelContext";

const OPERATIONS_NAV = [
  { to: "/hotel/dashboard", icon: LayoutDashboard, label: "Dashboard", hint: "Operational KPIs & arrivals" },
  { to: "/hotel/availability", icon: Calendar, label: "Availability Calendar", hint: "Room calendar & blackout dates" },
  { to: "/hotel/rooms", icon: BedDouble, label: "Room Inventory", hint: "Room types, units & capacity" },
  { to: "/hotel/reservations", icon: CalendarCheck, label: "Reservations", hint: "Guest bookings & rosters" },
  { to: "/hotel/pricing", icon: DollarSign, label: "Seasonal Pricing", hint: "Seasonal multipliers & weekend rates" },
  { to: "/hotel/settings", icon: Building, label: "Property Profile", hint: "Amenities, geo coordinates & contact" },
  { to: "/hotel/policies", icon: ShieldCheck, label: "Policies & Rules", hint: "Check-in windows & cancellation terms" },
];

const LISTINGS_NAV = [
  { to: "/hotel/listings?category=stay", icon: Layers, label: "Stay Listings" },
  { to: "/hotel/listings/create", icon: PlusCircle, label: "Create Listing" },
];

const MOBILE_BOTTOM_NAV = [
  { to: "/hotel/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/hotel/availability", icon: Calendar, label: "Calendar" },
  { to: "/hotel/rooms", icon: BedDouble, label: "Rooms" },
  { to: "/hotel/reservations", icon: CalendarCheck, label: "Bookings" },
];

function StayVendorLayoutInner() {
  const { properties, selectedProperty, selectedPropertyId, setSelectedPropertyId, refreshProperties, loading } =
    useStayHotel();
  const { user, effectiveUser, logout, viewAsVendor, toggleViewAsVendor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === "admin";
  const isSimulatingVendor = isAdmin && viewAsVendor;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPropertyDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setPropertyDropdownOpen(false);
  }, [location.pathname, location.search]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProperties();
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const vendorInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ST";

  const publicListingUrl = selectedProperty?.listingId
    ? `http://localhost:5173/stays/${selectedProperty.listingId}`
    : selectedProperty?.id
    ? `http://localhost:5173/stays/${selectedProperty.id}`
    : null;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "var(--bg-main)",
        color: "var(--text-primary)",
      }}
    >
      {/* ── Desktop Navigation Sidebar ── */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 overflow-y-auto border-r transition-all"
        style={{
          background: "var(--bg-sidebar)",
          borderColor: "var(--border-light)",
        }}
      >
        {/* Brand Area */}
        <div
          className="px-5 pt-6 pb-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border-light)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md"
              style={{
                background: "linear-gradient(135deg, #1E3A8A, #3B82F6)",
                boxShadow: "0 0 16px rgba(59, 130, 246, 0.35)",
              }}
            >
              <Hotel size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[15px] leading-tight" style={{ color: "var(--text-primary)" }}>
                  Voyage
                </span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase"
                  style={{
                    background: "var(--accent-navy-subtle)",
                    color: "var(--accent-navy-light)",
                    border: "1px solid var(--border-accent)",
                  }}
                >
                  STAY
                </span>
              </div>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "var(--text-tertiary)" }}>
                Hospitality & Operations
              </p>
            </div>
          </div>
        </div>

        {/* Selected Property Quick Card */}
        <div className="p-3 mx-3 my-3 rounded-xl border" style={{ background: "var(--bg-panel)", borderColor: "var(--border-light)" }}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  {selectedProperty?.status || "Active Property"}
                </span>
              </div>
              <p className="text-[12px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {selectedProperty?.name || (loading ? "Loading..." : "No Property Selected")}
              </p>
              <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>
                {[selectedProperty?.city, selectedProperty?.district].filter(Boolean).join(", ") ||
                  selectedProperty?.propertyType ||
                  "Sri Lanka"}
              </p>
            </div>
            <button
              onClick={() => navigate("/hotel/settings")}
              title="Edit Property Profile"
              className="p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
              style={{ color: "var(--text-tertiary)" }}
            >
              <Building size={14} />
            </button>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 space-y-4 overflow-y-auto">
          {/* Operations Links */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
              Operations
            </p>
            <div className="space-y-0.5">
              {OPERATIONS_NAV.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      isActive
                        ? "bg-blue-600/15 text-blue-400 border border-blue-500/25 font-semibold"
                        : "hover:bg-white/[0.04]"
                    }`
                  }
                  style={({ isActive }) => ({
                    color: isActive ? "var(--accent-navy-light)" : "var(--text-secondary)",
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span className="truncate">{label}</span>
                      {isActive && <ChevronRight size={12} className="ml-auto opacity-70" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Listings Links */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
              Inventory & Listings
            </p>
            <div className="space-y-0.5">
              {LISTINGS_NAV.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      isActive
                        ? "bg-blue-600/15 text-blue-400 border border-blue-500/25 font-semibold"
                        : "hover:bg-white/[0.04]"
                    }`
                  }
                  style={({ isActive }) => ({
                    color: isActive ? "var(--accent-navy-light)" : "var(--text-secondary)",
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span className="truncate">{label}</span>
                      {isActive && <ChevronRight size={12} className="ml-auto opacity-70" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Dev Mode Switcher */}
        {isAdmin && (
          <div className="p-3 mx-3 mb-2 rounded-xl border" style={{ background: "rgba(59, 130, 246, 0.08)", borderColor: "var(--border-accent)" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                <Sparkles size={11} /> Admin Mode
              </span>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5"
              >
                Exit <ArrowLeft size={10} />
              </button>
            </div>
            <p className="text-[11px] leading-tight" style={{ color: "var(--text-secondary)" }}>
              Viewing hotel operations as Stay Vendor.
            </p>
          </div>
        )}

        {/* User Card & Sign Out */}
        <div className="p-3 border-t mt-auto" style={{ borderColor: "var(--border-light)" }}>
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #1E3A8A, #3B82F6)" }}
            >
              {vendorInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {user?.name || "Stay Operator"}
              </p>
              <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>
                {user?.company || "Hotel Partner"}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Area with Header and Outlet ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Operational Header */}
        <header
          className="sticky top-0 z-30 px-4 lg:px-6 py-3 border-b flex items-center justify-between gap-3 shrink-0"
          style={{
            background: "var(--bg-panel)",
            borderColor: "var(--border-light)",
          }}
        >
          {/* Left: Mobile Toggle & Global Property Switcher Pill */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg border hover:bg-white/5 transition-colors"
              style={{ borderColor: "var(--border-light)", color: "var(--text-primary)" }}
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            {/* Global Property Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setPropertyDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-left transition-all hover:border-blue-500/40"
                style={{
                  background: "var(--bg-card)",
                  borderColor: propertyDropdownOpen ? "var(--border-accent)" : "var(--border-light)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "var(--accent-navy-subtle)", color: "var(--accent-navy-light)" }}
                >
                  <Building2 size={15} />
                </div>
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold truncate max-w-[140px] sm:max-w-[220px]" style={{ color: "var(--text-primary)" }}>
                      {selectedProperty?.name || (loading ? "Loading..." : "Select Property")}
                    </span>
                    <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[10px] truncate leading-tight" style={{ color: "var(--text-tertiary)" }}>
                    {[selectedProperty?.city, selectedProperty?.district].filter(Boolean).join(", ") ||
                      "Property Selector"}
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 shrink-0 ${propertyDropdownOpen ? "rotate-180" : ""}`}
                  style={{ color: "var(--text-tertiary)" }}
                />
              </button>

              {/* Property Selector Dropdown Menu */}
              {propertyDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-80 rounded-xl border shadow-xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    background: "var(--bg-panel)",
                    borderColor: "var(--border-light)",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  <div className="px-3 py-2 border-b mb-1" style={{ borderColor: "var(--border-light)" }}>
                    <p className="text-[11px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                      Switch Stay Property ({properties.length})
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                      Multi-property operations & room inventories
                    </p>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {properties.map((prop) => {
                      const isSelected = prop.id === selectedPropertyId;
                      return (
                        <button
                          key={prop.id}
                          onClick={() => {
                            setSelectedPropertyId(prop.id);
                            setPropertyDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left text-[12px] transition-all ${
                            isSelected
                              ? "bg-blue-600/15 border border-blue-500/20 text-blue-400 font-semibold"
                              : "hover:bg-white/[0.04]"
                          }`}
                          style={{
                            color: isSelected ? "var(--accent-navy-light)" : "var(--text-primary)",
                          }}
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">{prop.name}</p>
                            <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>
                              {[prop.city, prop.district].filter(Boolean).join(", ") || prop.propertyType}
                            </p>
                          </div>
                          {isSelected && <Check size={14} className="text-blue-400 shrink-0" />}
                        </button>
                      );
                    })}

                    {properties.length === 0 && !loading && (
                      <div className="p-3 text-center text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        No stay properties found.
                      </div>
                    )}
                  </div>

                  <div className="border-t mt-1 pt-1" style={{ borderColor: "var(--border-light)" }}>
                    <button
                      onClick={() => {
                        setPropertyDropdownOpen(false);
                        navigate("/hotel/listings/create");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold text-blue-400 hover:bg-blue-500/10 transition-colors"
                    >
                      <PlusCircle size={13} />
                      <span>Register New Stay Property</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions Suite */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh Data */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh property data"
              className="p-2 rounded-xl border hover:bg-white/5 transition-all text-slate-400 hover:text-slate-200"
              style={{ borderColor: "var(--border-light)" }}
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin text-blue-400" : ""} />
            </button>

            {/* Marketplace Client Preview Link */}
            {publicListingUrl && (
              <a
                href={publicListingUrl}
                target="_blank"
                rel="noreferrer"
                title="Preview public stay listing in marketplace"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all hover:bg-white/5"
                style={{
                  borderColor: "var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                <span>Guest Preview</span>
                <ExternalLink size={12} />
              </a>
            )}

            {/* Admin return button */}
            {isAdmin && (
              <button
                onClick={() => navigate("/dashboard")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all hover:bg-blue-500/15"
                style={{
                  borderColor: "var(--border-accent)",
                  background: "var(--accent-navy-subtle)",
                  color: "var(--accent-navy-light)",
                }}
              >
                <span>Admin Console</span>
              </button>
            )}

            {/* User Avatar pill */}
            <div className="flex items-center gap-2 pl-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #1E3A8A, #3B82F6)" }}
              >
                {vendorInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content Outlet */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0" style={{ background: "var(--bg-main)" }}>
          <Outlet />
        </main>

        {/* ── Mobile Bottom Navigation Bar ── */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 border-t z-40 transition-all"
          style={{
            background: "var(--bg-panel)",
            borderColor: "var(--border-light)",
          }}
        >
          <div className="flex items-center justify-around py-1">
            {MOBILE_BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center py-2 px-3 text-[10px] font-medium transition-all ${
                    isActive ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={19} strokeWidth={isActive ? 2.3 : 1.8} />
                    <span className="mt-1">{label}</span>
                    {isActive && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-400 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* More / Menu Button to open Drawer */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="flex flex-col items-center justify-center py-2 px-3 text-[10px] font-medium text-slate-400 hover:text-slate-200"
            >
              <Menu size={19} />
              <span className="mt-1">More</span>
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile Slide-out Drawer ── */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div
            className="relative w-4/5 max-w-xs h-full flex flex-col p-4 shadow-2xl z-10 overflow-y-auto"
            style={{
              background: "var(--bg-sidebar)",
              borderColor: "var(--border-light)",
            }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--border-light)" }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ background: "linear-gradient(135deg, #1E3A8A, #3B82F6)" }}
                >
                  <Hotel size={16} />
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
                    Voyage Stay
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    Partner Portal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5"
                style={{ color: "var(--text-secondary)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Property Summary */}
            <div className="my-3 p-3 rounded-xl border" style={{ background: "var(--bg-panel)", borderColor: "var(--border-light)" }}>
              <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">
                {selectedProperty?.status || "Active"}
              </p>
              <p className="text-[12px] font-bold truncate" style={{ color: "var(--text-primary)" }}>
                {selectedProperty?.name || "No Property"}
              </p>
              <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>
                {[selectedProperty?.city, selectedProperty?.district].filter(Boolean).join(", ")}
              </p>
            </div>

            {/* Drawer Nav Items */}
            <div className="flex-1 space-y-4 py-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1 px-2" style={{ color: "var(--text-tertiary)" }}>
                  Operations
                </p>
                <div className="space-y-0.5">
                  {OPERATIONS_NAV.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          isActive
                            ? "bg-blue-600/15 text-blue-400 border border-blue-500/25 font-semibold"
                            : "hover:bg-white/[0.04]"
                        }`
                      }
                      style={({ isActive }) => ({
                        color: isActive ? "var(--accent-navy-light)" : "var(--text-secondary)",
                      })}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1 px-2" style={{ color: "var(--text-tertiary)" }}>
                  Listings
                </p>
                <div className="space-y-0.5">
                  {LISTINGS_NAV.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          isActive
                            ? "bg-blue-600/15 text-blue-400 border border-blue-500/25 font-semibold"
                            : "hover:bg-white/[0.04]"
                        }`
                      }
                      style={({ isActive }) => ({
                        color: isActive ? "var(--accent-navy-light)" : "var(--text-secondary)",
                      })}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>

              {isAdmin && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      navigate("/dashboard");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Admin Console</span>
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Sign Out */}
            <div className="pt-3 border-t mt-auto" style={{ borderColor: "var(--border-light)" }}>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function HotelOperationsLayout() {
  return (
    <StayHotelProvider>
      <StayVendorLayoutInner />
    </StayHotelProvider>
  );
}

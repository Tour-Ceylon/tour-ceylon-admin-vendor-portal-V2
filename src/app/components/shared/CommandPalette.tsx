import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Calendar,
  Users,
  Package,
  DollarSign,
  HelpCircle,
  Settings,
  Home,
  BarChart3,
  Truck,
  Hotel,
  Star,
  MessageSquare,
  FileText,
  Clock,
  TrendingUp,
  Command,
} from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  category: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick actions and navigation
  const allActions: QuickAction[] = [
    // Dashboard & Overview
    {
      id: "dashboard",
      label: "Dashboard",
      description: "Platform overview and metrics",
      icon: Home,
      iconColor: "#3b82f6",
      category: "Navigation",
      action: () => navigate("/dashboard"),
      keywords: ["home", "overview", "main"],
    },
    {
      id: "analytics",
      label: "Analytics",
      description: "Platform analytics and insights",
      icon: BarChart3,
      iconColor: "#8b5cf6",
      category: "Navigation",
      action: () => navigate("/analytics"),
      keywords: ["stats", "metrics", "reports"],
    },

    // Bookings
    {
      id: "bookings",
      label: "Bookings",
      description: "View all bookings",
      icon: Calendar,
      iconColor: "#3b82f6",
      category: "Bookings",
      action: () => navigate("/bookings"),
      keywords: ["reservations", "orders"],
    },
    {
      id: "vendor-bookings",
      label: "Vendor Bookings",
      description: "Manage vendor bookings",
      icon: Calendar,
      iconColor: "#22c55e",
      category: "Vendor",
      action: () => navigate("/vendor/bookings"),
      keywords: ["vendor", "reservations"],
    },

    // Vendors & Users
    {
      id: "vendors",
      label: "Vendors",
      description: "Manage vendors",
      icon: Users,
      iconColor: "#f59e0b",
      category: "Management",
      action: () => navigate("/vendors"),
      keywords: ["partners", "providers"],
    },
    {
      id: "vendor-approvals",
      label: "Vendor Approvals",
      description: "Review pending vendors",
      icon: Users,
      iconColor: "#ef4444",
      category: "Management",
      action: () => navigate("/vendor-approvals"),
      keywords: ["pending", "review"],
    },
    {
      id: "users",
      label: "Users",
      description: "Manage users and customers",
      icon: Users,
      iconColor: "#8b5cf6",
      category: "Management",
      action: () => navigate("/users"),
      keywords: ["customers", "accounts"],
    },

    // Listings
    {
      id: "listings",
      label: "Listings",
      description: "View all listings",
      icon: Package,
      iconColor: "#10b981",
      category: "Listings",
      action: () => navigate("/listings"),
      keywords: ["products", "inventory"],
    },
    {
      id: "create-listing",
      label: "Create Listing",
      description: "Add a new listing",
      icon: Package,
      iconColor: "#22c55e",
      category: "Quick Actions",
      action: () => navigate("/listings/create"),
      keywords: ["new", "add"],
    },
    {
      id: "listing-reviews",
      label: "Listing Reviews",
      description: "Review pending listings",
      icon: Star,
      iconColor: "#f59e0b",
      category: "Listings",
      action: () => navigate("/reviews"),
      keywords: ["approval", "pending"],
    },

    // Finance
    {
      id: "finance",
      label: "Finance Dashboard",
      description: "Financial overview",
      icon: DollarSign,
      iconColor: "#22c55e",
      category: "Finance",
      action: () => navigate("/finance"),
      keywords: ["money", "revenue"],
    },
    {
      id: "payments",
      label: "Payments",
      description: "View all payments",
      icon: DollarSign,
      iconColor: "#3b82f6",
      category: "Finance",
      action: () => navigate("/payments"),
      keywords: ["transactions"],
    },
    {
      id: "payouts",
      label: "Payouts",
      description: "Manage vendor payouts",
      icon: DollarSign,
      iconColor: "#10b981",
      category: "Finance",
      action: () => navigate("/payouts"),
      keywords: ["withdrawals", "transfers"],
    },
    {
      id: "vendor-revenue",
      label: "Vendor Revenue",
      description: "Track vendor earnings",
      icon: TrendingUp,
      iconColor: "#22c55e",
      category: "Vendor",
      action: () => navigate("/vendor/revenue"),
      keywords: ["earnings", "income"],
    },

    // Support
    {
      id: "support",
      label: "Support Dashboard",
      description: "Support overview",
      icon: HelpCircle,
      iconColor: "#3b82f6",
      category: "Support",
      action: () => navigate("/support"),
      keywords: ["help", "tickets"],
    },
    {
      id: "tickets",
      label: "Support Tickets",
      description: "View all tickets",
      icon: MessageSquare,
      iconColor: "#f59e0b",
      category: "Support",
      action: () => navigate("/support/tickets"),
      keywords: ["issues", "help"],
    },

    // Hotel Operations
    {
      id: "hotel-dashboard",
      label: "Hotel Dashboard",
      description: "Hotel operations overview",
      icon: Hotel,
      iconColor: "#3b82f6",
      category: "Hotel",
      action: () => navigate("/hotel/dashboard"),
      keywords: ["stay", "accommodation"],
    },
    {
      id: "hotel-rooms",
      label: "Room Inventory",
      description: "Manage hotel rooms",
      icon: Hotel,
      iconColor: "#10b981",
      category: "Hotel",
      action: () => navigate("/hotel/rooms"),
      keywords: ["accommodation", "units"],
    },
    {
      id: "hotel-availability",
      label: "Availability Calendar",
      description: "Manage room availability",
      icon: Calendar,
      iconColor: "#8b5cf6",
      category: "Hotel",
      action: () => navigate("/hotel/availability"),
      keywords: ["calendar", "booking"],
    },

    // Transport
    {
      id: "transport",
      label: "Transport Dashboard",
      description: "Transport operations overview",
      icon: Truck,
      iconColor: "#3b82f6",
      category: "Transport",
      action: () => navigate("/transport"),
      keywords: ["transfers", "vehicles"],
    },
    {
      id: "transfer-requests",
      label: "Transfer Requests",
      description: "Manage transfer bookings",
      icon: Truck,
      iconColor: "#f59e0b",
      category: "Transport",
      action: () => navigate("/transport/requests"),
      keywords: ["rides", "trips"],
    },

    // Activity
    {
      id: "activity",
      label: "Activity Feed",
      description: "Recent platform activity",
      icon: Clock,
      iconColor: "#8b5cf6",
      category: "Monitoring",
      action: () => navigate("/activity"),
      keywords: ["logs", "history"],
    },
    {
      id: "audit-logs",
      label: "Audit Logs",
      description: "System audit trail",
      icon: FileText,
      iconColor: "#64748b",
      category: "Monitoring",
      action: () => navigate("/audit-logs"),
      keywords: ["security", "compliance"],
    },

    // Settings
    {
      id: "settings",
      label: "System Settings",
      description: "Platform configuration",
      icon: Settings,
      iconColor: "#64748b",
      category: "Settings",
      action: () => navigate("/settings/system"),
      keywords: ["config", "admin"],
    },
  ];

  // Filter actions based on query
  const filteredActions = query.trim()
    ? allActions.filter((action) => {
        const searchText = query.toLowerCase();
        return (
          action.label.toLowerCase().includes(searchText) ||
          action.description?.toLowerCase().includes(searchText) ||
          action.category.toLowerCase().includes(searchText) ||
          action.keywords?.some((kw) => kw.toLowerCase().includes(searchText))
        );
      })
    : allActions;

  // Group by category
  const groupedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = [];
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredActions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-accent)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <Search size={18} style={{ color: "var(--text-tertiary)" }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for pages, actions, or features..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-[14px] outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          <div className="flex items-center gap-1">
            <kbd
              className="px-2 py-1 rounded text-[10px]"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-tertiary)",
                fontFamily: "monospace",
              }}
            >
              esc
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {Object.keys(groupedActions).length > 0 ? (
            <div className="p-2">
              {Object.entries(groupedActions).map(([category, actions]) => (
                <div key={category} className="mb-3 last:mb-0">
                  <div className="px-3 py-1.5">
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                      {category}
                    </p>
                  </div>
                  {actions.map((action, index) => {
                    const globalIndex = filteredActions.indexOf(action);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={action.id}
                        onClick={() => {
                          action.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className="w-full px-3 py-2.5 rounded-lg flex items-center gap-3 text-left transition-all"
                        style={{
                          background: isSelected ? "var(--hover-overlay)" : "transparent",
                          border: isSelected ? "1px solid var(--border-accent)" : "1px solid transparent",
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${action.iconColor}15` }}
                        >
                          <action.icon size={16} style={{ color: action.iconColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                            {action.label}
                          </p>
                          {action.description && (
                            <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                              {action.description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <kbd
                            className="px-2 py-1 rounded text-[10px]"
                            style={{
                              background: "var(--input-background)",
                              border: "1px solid var(--border-light)",
                              color: "var(--text-tertiary)",
                              fontFamily: "monospace",
                            }}
                          >
                            ↵
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Search size={32} className="mx-auto mb-3" style={{ color: "var(--text-quaternary)" }} />
              <p className="text-[13px] mb-1" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                No results found
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Try a different search term
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: "var(--input-background)", borderTop: "1px solid var(--border-light)" }}
        >
          <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", fontFamily: "monospace" }}>
                ↑↓
              </kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", fontFamily: "monospace" }}>
                ↵
              </kbd>
              <span>Open</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", fontFamily: "monospace" }}>
                esc
              </kbd>
              <span>Close</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-quaternary)" }}>
            <Command size={12} />
            <span>Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}

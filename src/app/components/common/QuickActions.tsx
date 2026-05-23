import { useState } from "react";
import { Plus, X, ShoppingBag, Users, Calendar, FileText, DollarSign, Settings } from "lucide-react";

interface QuickAction {
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

export function FloatingActionButton({ actions }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultActions: QuickAction[] = actions || [
    {
      label: "Create Listing",
      icon: ShoppingBag,
      color: "#10b981",
      onClick: () => console.log("Create listing"),
    },
    {
      label: "Add Vendor",
      icon: Users,
      color: "#3b82f6",
      onClick: () => console.log("Add vendor"),
    },
    {
      label: "New Booking",
      icon: Calendar,
      color: "#f59e0b",
      onClick: () => console.log("New booking"),
    },
    {
      label: "Generate Report",
      icon: FileText,
      color: "#8b5cf6",
      onClick: () => console.log("Generate report"),
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3">
      {/* Action Items */}
      {isOpen && (
        <div className="flex flex-col-reverse gap-2 mb-2">
          {defaultActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all group"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-accent)",
                boxShadow: "var(--shadow-lg)",
                backdropFilter: "blur(12px)",
                animation: `fadeInUp 0.2s ease-out ${index * 0.05}s backwards`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = `${action.color}15`;
                (e.currentTarget as HTMLElement).style.borderColor = action.color;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${action.color}20` }}
              >
                <action.icon size={16} style={{ color: action.color }} />
              </div>
              <span className="text-[13px] whitespace-nowrap" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
        style={{
          background: isOpen
            ? "var(--input-background)"
            : "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
          border: "1px solid var(--border-accent)",
          boxShadow: "var(--shadow-xl)",
          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          }
        }}
      >
        {isOpen ? (
          <X size={24} style={{ color: "var(--text-primary)" }} />
        ) : (
          <Plus size={24} style={{ color: "white" }} />
        )}
      </button>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

interface ContextualAction {
  label: string;
  icon: React.ComponentType<any>;
  variant?: "primary" | "secondary" | "danger";
  onClick: () => void;
}

interface ContextualActionsProps {
  actions: ContextualAction[];
  position?: "top" | "bottom";
  sticky?: boolean;
}

export function ContextualActions({ actions, position = "bottom", sticky = true }: ContextualActionsProps) {
  const getVariantStyles = (variant: ContextualAction["variant"] = "secondary") => {
    switch (variant) {
      case "primary":
        return {
          background: "var(--active-overlay)",
          color: "var(--accent-navy-light)",
          border: "1px solid var(--border-accent)",
        };
      case "danger":
        return {
          background: "rgba(239, 68, 68, 0.1)",
          color: "#ef4444",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        };
      default:
        return {
          background: "var(--input-background)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-light)",
        };
    }
  };

  return (
    <div
      className={`flex items-center gap-3 px-6 py-4 ${sticky ? "sticky" : ""} ${position === "top" ? "top-14" : "bottom-0"}`}
      style={{
        background: "var(--bg-panel)",
        borderTop: position === "bottom" ? "1px solid var(--border-light)" : "none",
        borderBottom: position === "top" ? "1px solid var(--border-light)" : "none",
        boxShadow: position === "bottom" ? "0 -4px 12px rgba(0,0,0,0.1)" : "0 4px 12px rgba(0,0,0,0.1)",
        backdropFilter: "blur(12px)",
        zIndex: 30,
      }}
    >
      <div className="flex items-center gap-2 flex-1 justify-end">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] transition-all"
            style={{
              ...getVariantStyles(action.variant),
              fontWeight: 500,
            }}
          >
            <action.icon size={14} />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

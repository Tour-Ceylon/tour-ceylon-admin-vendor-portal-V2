import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: "var(--accent-navy-subtle)",
            border: "1px solid var(--border-accent)",
          }}
        >
          <Icon size={28} style={{ color: "var(--accent-navy-light)" }} />
        </div>
        <h3 className="text-[16px] mb-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {title}
        </h3>
        <p className="text-[13px] mb-6" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {description}
        </p>
        {action && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={action.onClick}
              className="px-4 py-2.5 rounded-lg text-[13px] transition-all"
              style={{
                background: "var(--active-overlay)",
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
                fontWeight: 500,
              }}
            >
              {action.label}
            </button>
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="px-4 py-2.5 rounded-lg text-[13px] transition-all"
                style={{
                  background: "var(--input-background)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-light)",
                  fontWeight: 500,
                }}
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

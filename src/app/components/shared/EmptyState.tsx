import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  iconColor?: string;
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
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  iconColor = "var(--text-quaternary)",
  title,
  description,
  action,
  secondaryAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-12" : "py-20"}`}>
      <div
        className={`${compact ? "w-16 h-16 mb-4" : "w-20 h-20 mb-6"} rounded-2xl flex items-center justify-center`}
        style={{
          background: `${iconColor}10`,
          border: `1px solid ${iconColor}20`,
        }}
      >
        <Icon size={compact ? 28 : 36} style={{ color: iconColor }} />
      </div>
      <h3 className={`${compact ? "text-[15px]" : "text-[16px]"} mb-2`} style={{ color: "var(--text-primary)", fontWeight: 600 }}>
        {title}
      </h3>
      <p className={`${compact ? "text-[12px]" : "text-[13px]"} max-w-md mb-6`} style={{ color: "var(--text-tertiary)", lineHeight: 1.6 }}>
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="px-4 py-2 rounded-lg text-[13px] transition-all"
              style={{
                background: "var(--active-overlay)",
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
                fontWeight: 500,
              }}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 rounded-lg text-[13px] transition-all"
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
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an error while loading this content. Please try again.",
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-[16px] mb-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
        {title}
      </h3>
      <p className="text-[13px] max-w-md mb-6" style={{ color: "var(--text-tertiary)", lineHeight: 1.6 }}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg text-[13px] transition-all"
          style={{
            background: "var(--active-overlay)",
            color: "var(--accent-navy-light)",
            border: "1px solid var(--border-accent)",
            fontWeight: 500,
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  compact?: boolean;
}

export function LoadingState({ message = "Loading...", compact = false }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${compact ? "py-12" : "py-20"}`}>
      <div className="relative w-12 h-12 mb-4">
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: "2px solid var(--border-light)",
            borderTopColor: "var(--accent-navy-light)",
          }}
        />
      </div>
      <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
        {message}
      </p>
    </div>
  );
}

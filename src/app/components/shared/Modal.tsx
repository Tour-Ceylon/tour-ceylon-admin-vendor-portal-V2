import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
  icon?: React.ComponentType<any>;
  iconColor?: string;
  preventClose?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
  icon: Icon,
  iconColor,
  preventClose = false,
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !preventClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, preventClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={() => !preventClose && onClose()}
    >
      <div
        className={`w-full ${sizeClasses[size]} rounded-2xl overflow-hidden flex flex-col`}
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-accent)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start gap-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
          {Icon && (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: iconColor ? `${iconColor}15` : "var(--input-background)" }}
            >
              <Icon size={20} style={{ color: iconColor || "var(--text-secondary)" }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {title}
            </h2>
            {description && (
              <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                {description}
              </p>
            )}
          </div>
          {!preventClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-tertiary)",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4" style={{ background: "var(--input-background)", borderTop: "1px solid var(--border-light)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
}: ConfirmModalProps) {
  const variantStyles = {
    danger: {
      iconColor: "#ef4444",
      confirmBg: "#ef4444",
      confirmBorder: "#dc2626",
    },
    warning: {
      iconColor: "#f59e0b",
      confirmBg: "#f59e0b",
      confirmBorder: "#d97706",
    },
    primary: {
      iconColor: "#3b82f6",
      confirmBg: "var(--accent-navy-light)",
      confirmBorder: "var(--border-accent)",
    },
  };

  const style = variantStyles[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      preventClose={isLoading}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{
              background: "var(--input-background)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
              fontWeight: 500,
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{
              background: style.confirmBg,
              color: "white",
              border: `1px solid ${style.confirmBorder}`,
              fontWeight: 500,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      }
    />
  );
}

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X, Undo } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onUndo?: () => void;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration (default 5 seconds)
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div
      className="fixed top-6 right-6 z-50 flex flex-col gap-3"
      style={{ maxWidth: "420px", width: "calc(100vw - 48px)" }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const config = {
    success: {
      icon: CheckCircle,
      color: "#10b981",
      borderColor: "rgba(16, 185, 129, 0.3)",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
    },
    error: {
      icon: XCircle,
      color: "#ef4444",
      borderColor: "rgba(239, 68, 68, 0.3)",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
    },
    warning: {
      icon: AlertCircle,
      color: "#f59e0b",
      borderColor: "rgba(245, 158, 11, 0.3)",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
    },
    info: {
      icon: Info,
      color: "#3b82f6",
      borderColor: "rgba(59, 130, 246, 0.3)",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
    },
  };

  const { icon: Icon, color, borderColor, backgroundColor } = config[toast.type];

  return (
    <div
      className="rounded-xl p-4 transition-all duration-200"
      style={{
        background: "var(--bg-panel)",
        border: `1px solid ${borderColor}`,
        boxShadow: "var(--shadow-lg)",
        backdropFilter: "blur(12px)",
        transform: isExiting ? "translateX(450px)" : "translateX(0)",
        opacity: isExiting ? 0 : 1,
        animation: isExiting ? "" : "slideIn 0.3s ease-out",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: backgroundColor }}
        >
          <Icon size={18} style={{ color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-[12px]" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {toast.message}
            </p>
          )}

          {/* Actions */}
          {(toast.action || toast.onUndo) && (
            <div className="flex items-center gap-2 mt-3">
              {toast.onUndo && (
                <button
                  onClick={() => {
                    toast.onUndo?.();
                    handleClose();
                  }}
                  className="px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 transition-all"
                  style={{
                    background: "var(--active-overlay)",
                    color: "var(--accent-navy-light)",
                    border: "1px solid var(--border-accent)",
                    fontWeight: 500,
                  }}
                >
                  <Undo size={12} />
                  Undo
                </button>
              )}
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    handleClose();
                  }}
                  className="px-3 py-1.5 rounded-lg text-[11px] transition-all"
                  style={{
                    background: backgroundColor,
                    color: color,
                    border: `1px solid ${borderColor}`,
                    fontWeight: 500,
                  }}
                >
                  {toast.action.label}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--input-background)";
          }}
        >
          <X size={12} style={{ color: "var(--text-tertiary)" }} />
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(450px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

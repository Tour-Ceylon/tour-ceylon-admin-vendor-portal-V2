import { useState } from "react";
import { Modal } from "./Modal";
import { AlertCircle } from "lucide-react";

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  description: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
  multiline?: boolean;
  variant?: "primary" | "warning" | "danger";
}

export function PromptModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  placeholder = "Enter value...",
  confirmText = "Submit",
  cancelText = "Cancel",
  required = false,
  multiline = false,
  variant = "primary",
}: PromptModalProps) {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (required && !value.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(value);
      setValue("");
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setValue("");
    onClose();
  };

  const variantStyles = {
    primary: {
      iconColor: "#3b82f6",
      confirmBg: "var(--accent-navy-light)",
      confirmBorder: "var(--border-accent)",
    },
    warning: {
      iconColor: "#f59e0b",
      confirmBg: "#f59e0b",
      confirmBorder: "#d97706",
    },
    danger: {
      iconColor: "#ef4444",
      confirmBg: "#ef4444",
      confirmBorder: "#dc2626",
    },
  };

  const style = variantStyles[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      size="sm"
      icon={AlertCircle}
      iconColor={style.iconColor}
      preventClose={isLoading}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
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
            onClick={handleSubmit}
            disabled={isLoading || (required && !value.trim())}
            className="px-4 py-2 rounded-lg text-[13px] transition-all"
            style={{
              background: style.confirmBg,
              color: "white",
              border: `1px solid ${style.confirmBorder}`,
              fontWeight: 500,
              opacity: isLoading || (required && !value.trim()) ? 0.5 : 1,
            }}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      }
    >
      <div>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full px-4 py-3 rounded-lg text-[13px] resize-none outline-none"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
            disabled={isLoading}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-lg text-[13px] outline-none"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
            disabled={isLoading}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && !multiline) {
                handleSubmit();
              }
            }}
          />
        )}
        {required && (
          <p className="text-[11px] mt-2" style={{ color: "var(--text-tertiary)" }}>
            * This field is required
          </p>
        )}
      </div>
    </Modal>
  );
}

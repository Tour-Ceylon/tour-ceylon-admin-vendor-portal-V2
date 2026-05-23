import { CheckCircle, Clock, XCircle, AlertCircle, Ban, Loader, DollarSign, Shield, Package } from "lucide-react";

export type StatusType =
  | "pending" | "confirmed" | "completed" | "cancelled" | "processing"
  | "approved" | "rejected" | "suspended" | "active" | "inactive"
  | "draft" | "pending-review" | "published"
  | "paid" | "unpaid" | "refunded" | "failed"
  | "open" | "in-progress" | "resolved" | "closed"
  | "success" | "warning" | "error" | "info";

interface StatusConfig {
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  background: string;
  border: string;
  priority?: number;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  // Booking Statuses
  "pending": {
    label: "Pending",
    icon: Clock,
    color: "#f59e0b",
    background: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    priority: 2,
  },
  "confirmed": {
    label: "Confirmed",
    icon: CheckCircle,
    color: "#3b82f6",
    background: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.3)",
    priority: 1,
  },
  "completed": {
    label: "Completed",
    icon: CheckCircle,
    color: "#22c55e",
    background: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    priority: 0,
  },
  "cancelled": {
    label: "Cancelled",
    icon: XCircle,
    color: "#ef4444",
    background: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    priority: 0,
  },
  "processing": {
    label: "Processing",
    icon: Loader,
    color: "#8b5cf6",
    background: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.3)",
    priority: 2,
  },

  // Vendor Statuses
  "approved": {
    label: "Approved",
    icon: Shield,
    color: "#22c55e",
    background: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    priority: 0,
  },
  "rejected": {
    label: "Rejected",
    icon: Ban,
    color: "#ef4444",
    background: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    priority: 0,
  },
  "suspended": {
    label: "Suspended",
    icon: AlertCircle,
    color: "#f59e0b",
    background: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    priority: 3,
  },
  "active": {
    label: "Active",
    icon: CheckCircle,
    color: "#22c55e",
    background: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    priority: 0,
  },
  "inactive": {
    label: "Inactive",
    icon: XCircle,
    color: "#64748b",
    background: "rgba(100,116,139,0.1)",
    border: "rgba(100,116,139,0.3)",
    priority: 0,
  },

  // Listing Statuses
  "draft": {
    label: "Draft",
    icon: Package,
    color: "#64748b",
    background: "rgba(100,116,139,0.1)",
    border: "rgba(100,116,139,0.3)",
    priority: 1,
  },
  "pending-review": {
    label: "Pending Review",
    icon: Clock,
    color: "#f59e0b",
    background: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    priority: 2,
  },
  "published": {
    label: "Published",
    icon: CheckCircle,
    color: "#22c55e",
    background: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    priority: 0,
  },

  // Payment Statuses
  "paid": {
    label: "Paid",
    icon: DollarSign,
    color: "#22c55e",
    background: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    priority: 0,
  },
  "unpaid": {
    label: "Unpaid",
    icon: DollarSign,
    color: "#f59e0b",
    background: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    priority: 2,
  },
  "refunded": {
    label: "Refunded",
    icon: DollarSign,
    color: "#8b5cf6",
    background: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.3)",
    priority: 1,
  },
  "failed": {
    label: "Failed",
    icon: XCircle,
    color: "#ef4444",
    background: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    priority: 3,
  },

  // Support Ticket Statuses
  "open": {
    label: "Open",
    icon: AlertCircle,
    color: "#f59e0b",
    background: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    priority: 3,
  },
  "in-progress": {
    label: "In Progress",
    icon: Loader,
    color: "#3b82f6",
    background: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.3)",
    priority: 2,
  },
  "resolved": {
    label: "Resolved",
    icon: CheckCircle,
    color: "#22c55e",
    background: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    priority: 0,
  },
  "closed": {
    label: "Closed",
    icon: CheckCircle,
    color: "#64748b",
    background: "rgba(100,116,139,0.1)",
    border: "rgba(100,116,139,0.3)",
    priority: 0,
  },

  // Generic Statuses
  "success": {
    label: "Success",
    icon: CheckCircle,
    color: "#22c55e",
    background: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    priority: 0,
  },
  "warning": {
    label: "Warning",
    icon: AlertCircle,
    color: "#f59e0b",
    background: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    priority: 2,
  },
  "error": {
    label: "Error",
    icon: XCircle,
    color: "#ef4444",
    background: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    priority: 3,
  },
  "info": {
    label: "Info",
    icon: AlertCircle,
    color: "#3b82f6",
    background: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.3)",
    priority: 1,
  },
};

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  customLabel?: string;
  pulse?: boolean;
}

export function StatusBadge({ status, showIcon = true, size = "md", customLabel, pulse = false }: StatusBadgeProps) {
  const config = statusConfigs[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-[11px] gap-1.5",
    lg: "px-3 py-1.5 text-[12px] gap-2",
  };

  const iconSizes = {
    sm: 10,
    md: 11,
    lg: 12,
  };

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]} rounded-lg relative`}
      style={{
        background: config.background,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontWeight: 600,
      }}
    >
      {pulse && config.priority && config.priority >= 2 && (
        <span
          className="absolute inset-0 rounded-lg animate-pulse"
          style={{
            background: config.background,
            border: `1px solid ${config.border}`,
          }}
        />
      )}
      {showIcon && <Icon size={iconSizes[size]} className="relative z-10" />}
      <span className="relative z-10">{customLabel || config.label}</span>
    </div>
  );
}

export function getStatusPriority(status: StatusType): number {
  return statusConfigs[status].priority || 0;
}

export function getStatusConfig(status: StatusType): StatusConfig {
  return statusConfigs[status];
}

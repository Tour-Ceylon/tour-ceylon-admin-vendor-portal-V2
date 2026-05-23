import { Link } from "react-router";
import { ExternalLink, User, Package, Calendar, DollarSign, Hotel, Truck, MessageSquare, FileText } from "lucide-react";

export type EntityType = "user" | "vendor" | "listing" | "booking" | "payment" | "payout" | "ticket" | "hotel" | "transfer" | "audit";

interface EntityLinkProps {
  type: EntityType;
  id: string;
  label?: string;
  showIcon?: boolean;
  external?: boolean;
  compact?: boolean;
}

const entityConfig: Record<
  EntityType,
  {
    icon: React.ComponentType<any>;
    color: string;
    getPath: (id: string) => string;
    prefix: string;
  }
> = {
  user: {
    icon: User,
    color: "#8b5cf6",
    getPath: (id) => `/users?id=${id}`,
    prefix: "User",
  },
  vendor: {
    icon: User,
    color: "#f59e0b",
    getPath: (id) => `/vendors?id=${id}`,
    prefix: "Vendor",
  },
  listing: {
    icon: Package,
    color: "#10b981",
    getPath: (id) => `/listings?id=${id}`,
    prefix: "Listing",
  },
  booking: {
    icon: Calendar,
    color: "#3b82f6",
    getPath: (id) => `/bookings?id=${id}`,
    prefix: "Booking",
  },
  payment: {
    icon: DollarSign,
    color: "#22c55e",
    getPath: (id) => `/payments?id=${id}`,
    prefix: "Payment",
  },
  payout: {
    icon: DollarSign,
    color: "#10b981",
    getPath: (id) => `/payouts?id=${id}`,
    prefix: "Payout",
  },
  ticket: {
    icon: MessageSquare,
    color: "#f59e0b",
    getPath: (id) => `/support/tickets?id=${id}`,
    prefix: "Ticket",
  },
  hotel: {
    icon: Hotel,
    color: "#3b82f6",
    getPath: (id) => `/hotel/reservations?id=${id}`,
    prefix: "Reservation",
  },
  transfer: {
    icon: Truck,
    color: "#8b5cf6",
    getPath: (id) => `/transport/requests?id=${id}`,
    prefix: "Transfer",
  },
  audit: {
    icon: FileText,
    color: "#64748b",
    getPath: (id) => `/audit-logs?id=${id}`,
    prefix: "Audit",
  },
};

export function EntityLink({ type, id, label, showIcon = true, external = false, compact = false }: EntityLinkProps) {
  const config = entityConfig[type];
  const Icon = config.icon;
  const path = config.getPath(id);
  const displayLabel = label || `${config.prefix} #${id}`;

  const content = (
    <div className={`inline-flex items-center ${compact ? "gap-1" : "gap-1.5"} group`}>
      {showIcon && (
        <div
          className={`${compact ? "w-5 h-5" : "w-6 h-6"} rounded flex items-center justify-center transition-all`}
          style={{
            background: `${config.color}15`,
            border: `1px solid ${config.color}25`,
          }}
        >
          <Icon size={compact ? 11 : 12} style={{ color: config.color }} />
        </div>
      )}
      <span
        className={`${compact ? "text-[11px]" : "text-[12px]"} group-hover:underline transition-all`}
        style={{
          color: config.color,
          fontWeight: 500,
        }}
      >
        {displayLabel}
      </span>
      {external && <ExternalLink size={compact ? 10 : 11} style={{ color: config.color, opacity: 0.6 }} />}
    </div>
  );

  return (
    <Link to={path} className="inline-flex">
      {content}
    </Link>
  );
}

interface EntityCardProps {
  type: EntityType;
  id: string;
  title: string;
  description?: string;
  metadata?: Array<{ label: string; value: string }>;
  status?: React.ReactNode;
  onClick?: () => void;
}

export function EntityCard({ type, id, title, description, metadata, status, onClick }: EntityCardProps) {
  const config = entityConfig[type];
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className="rounded-xl p-4 cursor-pointer transition-all group"
      style={{
        background: "var(--bg-panel)",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${config.color}15` }}>
          <Icon size={16} style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-[13px] truncate" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {title}
            </h4>
            {status}
          </div>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {config.prefix} #{id}
          </p>
        </div>
      </div>
      {description && (
        <p className="text-[12px] mb-3" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {metadata && metadata.length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
          {metadata.map((item, i) => (
            <div key={i}>
              <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                {item.label}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

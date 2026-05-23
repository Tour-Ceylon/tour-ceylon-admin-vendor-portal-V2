import { useState } from "react";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Calendar,
  Building2,
  Layers,
  CreditCard,
  DollarSign,
  Car,
  MessageSquare,
  AlertCircle,
  ShoppingCart,
  UserCheck,
  Star,
  Filter,
} from "lucide-react";

type NotificationCategory = "bookings" | "vendors" | "listings" | "payments" | "refunds" | "transport" | "support" | "system";
type NotificationPriority = "low" | "medium" | "high" | "urgent";

interface Notification {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionLink?: string;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    category: "bookings",
    priority: "high",
    title: "New Booking Received",
    message: "Safari tour booking BK-8445 for LKR 95,000 from Marcus Weber",
    timestamp: "2 min ago",
    read: false,
    actionLabel: "View Booking",
    actionLink: "/bookings",
  },
  {
    id: "2",
    category: "support",
    priority: "urgent",
    title: "Support Ticket Escalated",
    message: "TKT-2451 escalated to refunds team - requires immediate attention",
    timestamp: "15 min ago",
    read: false,
    actionLabel: "View Ticket",
    actionLink: "/support/tickets",
  },
  {
    id: "3",
    category: "vendors",
    priority: "medium",
    title: "Vendor Submitted for Approval",
    message: "New vendor 'Colombo City Tours' awaiting approval",
    timestamp: "1 hr ago",
    read: false,
    actionLabel: "Review Vendor",
    actionLink: "/vendor-approvals",
  },
  {
    id: "4",
    category: "payments",
    priority: "high",
    title: "Payment Failed",
    message: "Payment for BK-8432 failed - customer notified",
    timestamp: "2 hr ago",
    read: false,
    actionLabel: "View Payment",
    actionLink: "/payments",
  },
  {
    id: "5",
    category: "listings",
    priority: "low",
    title: "Listing Approved",
    message: "Ocean Villa listing by Jetwing Hotels has been approved",
    timestamp: "3 hr ago",
    read: true,
  },
  {
    id: "6",
    category: "refunds",
    priority: "medium",
    title: "Refund Requested",
    message: "Customer requested full refund for BK-8421 - LKR 120,000",
    timestamp: "4 hr ago",
    read: true,
    actionLabel: "Process Refund",
    actionLink: "/support/refunds",
  },
  {
    id: "7",
    category: "transport",
    priority: "medium",
    title: "Transfer Request Pending",
    message: "Airport pickup for tomorrow 8:00 AM needs driver assignment",
    timestamp: "5 hr ago",
    read: true,
    actionLabel: "Assign Driver",
    actionLink: "/transport/requests",
  },
  {
    id: "8",
    category: "system",
    priority: "low",
    title: "Daily Report Ready",
    message: "Your daily operations summary is ready to view",
    timestamp: "1 day ago",
    read: true,
  },
];

const CATEGORY_CONFIG: Record<NotificationCategory, { label: string; icon: React.ComponentType<any>; color: string }> = {
  bookings: { label: "Bookings", icon: Calendar, color: "#3b82f6" },
  vendors: { label: "Vendors", icon: Building2, color: "#8b5cf6" },
  listings: { label: "Listings", icon: Layers, color: "#10b981" },
  payments: { label: "Payments", icon: CreditCard, color: "#f59e0b" },
  refunds: { label: "Refunds", icon: DollarSign, color: "#ec4899" },
  transport: { label: "Transport", icon: Car, color: "#0891b2" },
  support: { label: "Support", icon: MessageSquare, color: "#f97316" },
  system: { label: "System", icon: AlertCircle, color: "#64748b" },
};

const PRIORITY_CONFIG = {
  urgent: { color: "#f87171", bg: "rgba(239,68,68,0.12)" },
  high: { color: "#fb923c", bg: "rgba(249,115,22,0.12)" },
  medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  low: { color: "#60a5fa", bg: "rgba(59,130,246,0.12)" },
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [filterCategory, setFilterCategory] = useState<NotificationCategory | "all">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => filterCategory === "all" || n.category === filterCategory);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Notification Panel */}
      <div
        className="fixed top-[60px] right-4 w-[420px] max-h-[600px] rounded-xl flex flex-col z-50"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <div className="flex items-center gap-2">
            <Bell size={16} style={{ color: "var(--accent-navy)" }} />
            <h3 className="text-[15px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600 }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-all"
                style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
              >
                <CheckCheck size={11} />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ background: "var(--bg-card)", color: "var(--text-tertiary)" }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-5 py-3 flex items-center gap-2 overflow-x-auto" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <button
            onClick={() => setFilterCategory("all")}
            className="shrink-0 px-2.5 py-1 rounded text-[11px] transition-all"
            style={{
              background: filterCategory === "all" ? "var(--active-overlay)" : "transparent",
              color: filterCategory === "all" ? "var(--accent-navy-light)" : "var(--text-tertiary)",
              border: `1px solid ${filterCategory === "all" ? "var(--border-accent)" : "transparent"}`,
            }}
          >
            All
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
            const count = notifications.filter((n) => n.category === key && !n.read).length;
            return (
              <button
                key={key}
                onClick={() => setFilterCategory(key as NotificationCategory)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all"
                style={{
                  background: filterCategory === key ? cfg.color + "20" : "transparent",
                  color: filterCategory === key ? cfg.color : "var(--text-tertiary)",
                  border: `1px solid ${filterCategory === key ? cfg.color + "40" : "transparent"}`,
                }}
              >
                <cfg.icon size={10} />
                {cfg.label}
                {count > 0 && (
                  <span
                    className="text-[9px] px-1 py-0.5 rounded-full"
                    style={{ background: cfg.color, color: "white" }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Bell size={32} className="mx-auto mb-2" style={{ color: "var(--text-tertiary)", opacity: 0.5 }} />
              <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                No notifications
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
              {filtered.map((notification) => {
                const categoryCfg = CATEGORY_CONFIG[notification.category];
                const priorityCfg = PRIORITY_CONFIG[notification.priority];
                return (
                  <div
                    key={notification.id}
                    className="px-5 py-3 cursor-pointer transition-all"
                    style={{
                      background: notification.read ? "transparent" : "rgba(59,130,246,0.04)",
                    }}
                    onClick={() => markAsRead(notification.id)}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)")}
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = notification.read
                        ? "transparent"
                        : "rgba(59,130,246,0.04)")
                    }
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: categoryCfg.color + "15" }}
                      >
                        <categoryCfg.icon size={14} style={{ color: categoryCfg.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                            {notification.title}
                          </p>
                          {notification.priority === "urgent" || notification.priority === "high" ? (
                            <div
                              className="w-2 h-2 rounded-full shrink-0 mt-1"
                              style={{ background: priorityCfg.color }}
                            />
                          ) : null}
                        </div>
                        <p className="text-[12px] mb-2" style={{ color: "var(--text-secondary)" }}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            {notification.timestamp}
                          </span>
                          {notification.actionLabel && (
                            <button
                              className="text-[11px] px-2 py-0.5 rounded transition-all"
                              style={{
                                background: "var(--accent-navy)",
                                color: "white",
                                fontWeight: 600,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Navigate to action link
                              }}
                            >
                              {notification.actionLabel}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 text-center" style={{ borderTop: "1px solid var(--border-light)" }}>
          <button
            className="text-[12px] transition-all"
            style={{ color: "var(--accent-navy-light)", fontWeight: 600 }}
          >
            View All Activity →
          </button>
        </div>
      </div>
    </>
  );
}

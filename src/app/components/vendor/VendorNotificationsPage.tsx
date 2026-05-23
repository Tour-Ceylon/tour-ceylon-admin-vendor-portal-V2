import { Bell, CheckCircle, Clock, DollarSign, Star, MessageSquare, Calendar, Settings } from "lucide-react";

type NotificationType = "booking" | "payout" | "review" | "system" | "message";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

export function VendorNotificationsPage() {
  const notifications: Notification[] = [
    {
      id: "1",
      type: "booking",
      title: "New Booking Request",
      message: "John Smith requested Yala National Park Safari for May 25, 2026",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: "2",
      type: "review",
      title: "New 5-Star Review",
      message: "Sarah Johnson left a review for Yala National Park Safari",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "3",
      type: "payout",
      title: "Payout Processed",
      message: "Your payout of $18,275 has been processed and will arrive in 2-3 business days",
      time: "1 day ago",
      read: true,
    },
    {
      id: "4",
      type: "booking",
      title: "Booking Confirmed",
      message: "Emma Wilson's booking for Galle Fort Heritage Walk has been confirmed",
      time: "1 day ago",
      read: true,
    },
    {
      id: "5",
      type: "message",
      title: "New Customer Message",
      message: "Michael Brown sent you a message about Minneriya Wildlife Safari",
      time: "2 days ago",
      read: true,
    },
    {
      id: "6",
      type: "system",
      title: "Listing Approved",
      message: "Your listing 'Sigiriya Rock Fortress Tour' has been approved and is now live",
      time: "3 days ago",
      read: true,
    },
  ];

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "booking":
        return { icon: Calendar, color: "#3b82f6" };
      case "payout":
        return { icon: DollarSign, color: "#10b981" };
      case "review":
        return { icon: Star, color: "#eab308" };
      case "message":
        return { icon: MessageSquare, color: "#8b5cf6" };
      case "system":
        return { icon: Bell, color: "#64748b" };
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Notifications
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg text-[12px] flex items-center gap-2"
            style={{
              background: "var(--input-background)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
              fontWeight: 500,
            }}
          >
            <CheckCircle size={14} />
            Mark All Read
          </button>
          <button
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
            }}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Notification Preferences
          </h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Booking Requests", sublabel: "New bookings and requests", enabled: true },
              { label: "Payout Updates", sublabel: "Payment and payout notifications", enabled: true },
              { label: "Customer Reviews", sublabel: "New reviews and ratings", enabled: true },
              { label: "Customer Messages", sublabel: "Direct messages from customers", enabled: true },
              { label: "Listing Updates", sublabel: "Listing approval status", enabled: true },
              { label: "Marketing Updates", sublabel: "Platform news and promotions", enabled: false },
            ].map((pref) => (
              <div
                key={pref.label}
                className="rounded-lg p-4"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {pref.label}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {pref.sublabel}
                    </p>
                  </div>
                  <div
                    className="w-10 h-6 rounded-full relative transition-all cursor-pointer"
                    style={{
                      background: pref.enabled ? "var(--accent-navy)" : "var(--border-medium)",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full absolute top-1 transition-all"
                      style={{
                        background: "white",
                        left: pref.enabled ? "20px" : "4px",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Recent Activity
          </h2>
        </div>
        <div>
          {notifications.map((notification, index) => {
            const { icon: Icon, color } = getNotificationIcon(notification.type);
            return (
              <div
                key={notification.id}
                className="group cursor-pointer transition-all"
                style={{
                  background: !notification.read ? "var(--active-overlay)" : "transparent",
                  borderBottom: index < notifications.length - 1 ? "1px solid var(--border-light)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (notification.read) {
                    (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (notification.read) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                <div className="px-5 py-4 flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}15` }}
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: notification.read ? 500 : 600 }}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div
                          className="w-2 h-2 rounded-full shrink-0 ml-2"
                          style={{ background: "var(--accent-navy)", boxShadow: "0 0 6px var(--accent-navy)" }}
                        />
                      )}
                    </div>
                    <p className="text-[12px] mb-1.5" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1">
                      <Clock size={10} style={{ color: "var(--text-tertiary)" }} />
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {notification.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

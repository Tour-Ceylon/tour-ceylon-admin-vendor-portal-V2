import { Bell, Mail, Smartphone, MessageSquare, Check } from "lucide-react";

type NotificationChannel = "email" | "in-app" | "sms" | "whatsapp";

export function NotificationSettingsPage() {
  const notificationGroups = [
    {
      title: "Booking Notifications",
      icon: Bell,
      color: "#3b82f6",
      notifications: [
        { id: "booking.new", name: "New Booking", description: "Customer creates new booking", channels: ["email", "in-app"] as NotificationChannel[] },
        { id: "booking.confirmed", name: "Booking Confirmed", description: "Vendor confirms booking", channels: ["email", "in-app"] as NotificationChannel[] },
        { id: "booking.cancelled", name: "Booking Cancelled", description: "Booking is cancelled", channels: ["email", "in-app"] as NotificationChannel[] },
        { id: "booking.reminder", name: "Booking Reminder", description: "Upcoming booking reminder", channels: ["email", "sms"] as NotificationChannel[] },
      ],
    },
    {
      title: "Vendor Notifications",
      icon: MessageSquare,
      color: "#10b981",
      notifications: [
        { id: "vendor.application", name: "Vendor Application", description: "New vendor registration", channels: ["email", "in-app"] as NotificationChannel[] },
        { id: "vendor.approved", name: "Vendor Approved", description: "Vendor application approved", channels: ["email"] as NotificationChannel[] },
        { id: "vendor.listing", name: "New Listing Submitted", description: "Vendor submits new listing", channels: ["email", "in-app"] as NotificationChannel[] },
      ],
    },
    {
      title: "Financial Notifications",
      icon: Mail,
      color: "#22c55e",
      notifications: [
        { id: "payout.scheduled", name: "Payout Scheduled", description: "Payout scheduled for processing", channels: ["email"] as NotificationChannel[] },
        { id: "payout.completed", name: "Payout Completed", description: "Payout transferred to vendor", channels: ["email"] as NotificationChannel[] },
        { id: "refund.requested", name: "Refund Requested", description: "Customer requests refund", channels: ["email", "in-app"] as NotificationChannel[] },
        { id: "refund.processed", name: "Refund Processed", description: "Refund has been processed", channels: ["email"] as NotificationChannel[] },
      ],
    },
    {
      title: "Review Notifications",
      icon: MessageSquare,
      color: "#f59e0b",
      notifications: [
        { id: "review.new", name: "New Review", description: "Customer leaves a review", channels: ["email", "in-app"] as NotificationChannel[] },
        { id: "review.response", name: "Review Response", description: "Vendor responds to review", channels: ["in-app"] as NotificationChannel[] },
      ],
    },
    {
      title: "Support Notifications",
      icon: Smartphone,
      color: "#8b5cf6",
      notifications: [
        { id: "support.new", name: "New Support Ticket", description: "New support ticket created", channels: ["email", "in-app"] as NotificationChannel[] },
        { id: "support.response", name: "Support Response", description: "Support team responds", channels: ["email"] as NotificationChannel[] },
      ],
    },
  ];

  const channelIcons = {
    email: Mail,
    "in-app": Bell,
    sms: Smartphone,
    whatsapp: MessageSquare,
  };

  const channelColors = {
    email: "#3b82f6",
    "in-app": "#10b981",
    sms: "#f59e0b",
    whatsapp: "#22c55e",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Notification Settings
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Configure email, in-app, and notification preferences
        </p>
      </div>

      {/* Channel Stats */}
      <div className="grid grid-cols-4 gap-4">
        {(["email", "in-app", "sms", "whatsapp"] as NotificationChannel[]).map((channel) => {
          const Icon = channelIcons[channel];
          const color = channelColors[channel];
          return (
            <div
              key={channel}
              className="rounded-xl p-4"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}15` }}
                >
                  <Icon size={16} style={{ color }} />
                </div>
              </div>
              <p className="text-[12px] capitalize" style={{ color: "var(--text-tertiary)" }}>
                {channel}
              </p>
              <div
                className="w-10 h-6 rounded-full relative transition-all mt-2"
                style={{
                  background: color,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full absolute top-1 transition-all"
                  style={{
                    background: "white",
                    left: "20px",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Notification Groups */}
      <div className="space-y-6">
        {notificationGroups.map((group) => (
          <div
            key={group.title}
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${group.color}15` }}
                >
                  <group.icon size={16} style={{ color: group.color }} />
                </div>
                <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {group.title}
                </h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "var(--input-background)" }}>
                    <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                        Notification
                      </span>
                    </th>
                    <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <Mail size={14} style={{ color: "var(--text-tertiary)", margin: "0 auto" }} />
                    </th>
                    <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <Bell size={14} style={{ color: "var(--text-tertiary)", margin: "0 auto" }} />
                    </th>
                    <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <Smartphone size={14} style={{ color: "var(--text-tertiary)", margin: "0 auto" }} />
                    </th>
                    <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <MessageSquare size={14} style={{ color: "var(--text-tertiary)", margin: "0 auto" }} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {group.notifications.map((notif, index) => (
                    <tr
                      key={notif.id}
                      style={{ borderBottom: index < group.notifications.length - 1 ? "1px solid var(--border-light)" : "none" }}
                    >
                      <td className="px-5 py-4">
                        <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                          {notif.name}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          {notif.description}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {notif.channels.includes("email") ? (
                          <Check size={16} style={{ color: "#3b82f6", margin: "0 auto" }} />
                        ) : (
                          <div className="w-4 h-4 rounded border mx-auto" style={{ borderColor: "var(--border-light)" }} />
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {notif.channels.includes("in-app") ? (
                          <Check size={16} style={{ color: "#10b981", margin: "0 auto" }} />
                        ) : (
                          <div className="w-4 h-4 rounded border mx-auto" style={{ borderColor: "var(--border-light)" }} />
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {notif.channels.includes("sms") ? (
                          <Check size={16} style={{ color: "#f59e0b", margin: "0 auto" }} />
                        ) : (
                          <div className="w-4 h-4 rounded border mx-auto" style={{ borderColor: "var(--border-light)" }} />
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {notif.channels.includes("whatsapp") ? (
                          <Check size={16} style={{ color: "#22c55e", margin: "0 auto" }} />
                        ) : (
                          <div className="w-4 h-4 rounded border mx-auto" style={{ borderColor: "var(--border-light)" }} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Save Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          className="px-4 py-2 rounded-lg text-[12px]"
          style={{
            background: "var(--input-background)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-light)",
            fontWeight: 500,
          }}
        >
          Reset Changes
        </button>
        <button
          className="px-4 py-2 rounded-lg text-[12px]"
          style={{
            background: "var(--active-overlay)",
            color: "var(--accent-navy-light)",
            border: "1px solid var(--border-accent)",
            fontWeight: 500,
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

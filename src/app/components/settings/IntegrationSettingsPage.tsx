import { Plug, CreditCard, MapPin, Mail, MessageSquare, BarChart3, Database, CheckCircle, XCircle, Settings as SettingsIcon } from "lucide-react";

type IntegrationStatus = "connected" | "disconnected" | "pending";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  color: string;
  status: IntegrationStatus;
  lastSync?: string;
}

export function IntegrationSettingsPage() {
  const integrations: Integration[] = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Payment processing and payouts",
      category: "Payment Gateways",
      icon: CreditCard,
      color: "#635BFF",
      status: "connected",
      lastSync: "2 minutes ago",
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Alternative payment method",
      category: "Payment Gateways",
      icon: CreditCard,
      color: "#003087",
      status: "disconnected",
    },
    {
      id: "google-maps",
      name: "Google Maps",
      description: "Location services and geocoding",
      category: "Maps & Location",
      icon: MapPin,
      color: "#4285F4",
      status: "connected",
      lastSync: "1 hour ago",
    },
    {
      id: "sendgrid",
      name: "SendGrid",
      description: "Email delivery service",
      category: "Email Services",
      icon: Mail,
      color: "#1A82E2",
      status: "connected",
      lastSync: "5 minutes ago",
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Marketing email campaigns",
      category: "Email Services",
      icon: Mail,
      color: "#FFE01B",
      status: "disconnected",
    },
    {
      id: "twilio",
      name: "Twilio",
      description: "SMS notifications",
      category: "Communication",
      icon: MessageSquare,
      color: "#F22F46",
      status: "pending",
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "WhatsApp messaging",
      category: "Communication",
      icon: MessageSquare,
      color: "#25D366",
      status: "disconnected",
    },
    {
      id: "google-analytics",
      name: "Google Analytics",
      description: "Website and user analytics",
      category: "Analytics",
      icon: BarChart3,
      color: "#E37400",
      status: "connected",
      lastSync: "30 minutes ago",
    },
    {
      id: "salesforce",
      name: "Salesforce",
      description: "CRM integration",
      category: "CRM",
      icon: Database,
      color: "#00A1E0",
      status: "disconnected",
    },
  ];

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) acc[integration.category] = [];
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  const getStatusStyle = (status: IntegrationStatus) => {
    switch (status) {
      case "connected":
        return { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.3)", icon: CheckCircle };
      case "disconnected":
        return { bg: "rgba(100,116,139,0.1)", color: "#94a3b8", border: "rgba(100,116,139,0.3)", icon: XCircle };
      case "pending":
        return { bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.3)", icon: SettingsIcon };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Integrations
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Manage third-party integrations and API connections
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Integrations", value: "9", icon: Plug, color: "#3b82f6" },
          { label: "Connected", value: "4", icon: CheckCircle, color: "#22c55e" },
          { label: "Pending Setup", value: "1", icon: SettingsIcon, color: "#f59e0b" },
          { label: "Available", value: "4", icon: XCircle, color: "#64748b" },
        ].map((stat) => (
          <div
            key={stat.label}
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
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-[22px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {stat.value}
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Integration Categories */}
      <div className="space-y-6">
        {Object.entries(groupedIntegrations).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-[13px] mb-4 uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
              {category}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {items.map((integration) => {
                const statusStyle = getStatusStyle(integration.status);
                const StatusIcon = statusStyle.icon;

                return (
                  <div
                    key={integration.id}
                    className="rounded-xl overflow-hidden cursor-pointer transition-all"
                    style={{
                      background: "var(--bg-panel)",
                      border: "1px solid var(--border-light)",
                      boxShadow: "var(--shadow-md)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ background: `${integration.color}15` }}
                        >
                          <integration.icon size={20} style={{ color: integration.color }} />
                        </div>
                        <div
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] capitalize"
                          style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            border: `1px solid ${statusStyle.border}`,
                            fontWeight: 600,
                          }}
                        >
                          <StatusIcon size={10} />
                          {integration.status}
                        </div>
                      </div>
                      <h3 className="text-[14px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {integration.name}
                      </h3>
                      <p className="text-[12px] mb-3" style={{ color: "var(--text-secondary)" }}>
                        {integration.description}
                      </p>
                      {integration.lastSync && (
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          Last sync: {integration.lastSync}
                        </p>
                      )}
                    </div>
                    <div className="px-5 py-3" style={{ background: "var(--input-background)", borderTop: "1px solid var(--border-light)" }}>
                      <button
                        className="text-[12px] w-full py-2 rounded-lg transition-all"
                        style={
                          integration.status === "connected"
                            ? {
                                color: "var(--text-secondary)",
                                border: "1px solid var(--border-light)",
                                fontWeight: 500,
                              }
                            : {
                                background: "var(--active-overlay)",
                                color: "var(--accent-navy-light)",
                                border: "1px solid var(--border-accent)",
                                fontWeight: 500,
                              }
                        }
                      >
                        {integration.status === "connected" ? "Manage" : integration.status === "pending" ? "Complete Setup" : "Connect"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Info Notice */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--accent-navy-subtle)",
          border: "1px solid var(--border-accent)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(59,130,246,0.2)" }}
          >
            <Plug size={18} style={{ color: "var(--accent-navy-light)" }} />
          </div>
          <div>
            <p className="text-[13px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Integration Management
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Integrations are currently in beta. Some services may require API keys or authentication credentials. Contact support for assistance with enterprise integrations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { HelpCircle, MessageSquare, FileText, CheckCircle, Clock, Plus, Search } from "lucide-react";

type TicketStatus = "open" | "in-progress" | "resolved";
type TicketPriority = "low" | "medium" | "high";

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  created: string;
  updated: string;
  messages: number;
}

export function VendorSupportPage() {
  const tickets: SupportTicket[] = [
    {
      id: "TKT-2026-0124",
      subject: "Payout delay inquiry",
      category: "Payments",
      status: "in-progress",
      priority: "high",
      created: "May 18, 2026",
      updated: "1 hour ago",
      messages: 3,
    },
    {
      id: "TKT-2026-0115",
      subject: "How to update listing photos?",
      category: "Listings",
      status: "resolved",
      priority: "low",
      created: "May 15, 2026",
      updated: "2 days ago",
      messages: 2,
    },
    {
      id: "TKT-2026-0108",
      subject: "Customer cancellation policy question",
      category: "Policies",
      status: "resolved",
      priority: "medium",
      created: "May 12, 2026",
      updated: "5 days ago",
      messages: 4,
    },
  ];

  const helpTopics = [
    { icon: FileText, title: "Getting Started", articles: 12, color: "#3b82f6" },
    { icon: MessageSquare, title: "Managing Bookings", articles: 18, color: "#10b981" },
    { icon: HelpCircle, title: "Payments & Payouts", articles: 15, color: "#eab308" },
    { icon: FileText, title: "Listing Optimization", articles: 10, color: "#8b5cf6" },
  ];

  const getStatusStyle = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return { bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" };
      case "in-progress":
        return { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" };
      case "resolved":
        return { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.3)" };
    }
  };

  const getPriorityStyle = (priority: TicketPriority) => {
    switch (priority) {
      case "low":
        return { color: "var(--text-tertiary)" };
      case "medium":
        return { color: "#fbbf24" };
      case "high":
        return { color: "#f87171" };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Support Center
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Get help and manage your support tickets
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-[12px] flex items-center gap-2"
          style={{
            background: "var(--active-overlay)",
            color: "var(--accent-navy-light)",
            border: "1px solid var(--border-accent)",
            fontWeight: 500,
          }}
        >
          <Plus size={14} />
          New Ticket
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Open Tickets", value: "1", icon: Clock, color: "#f59e0b" },
          { label: "In Progress", value: "1", icon: MessageSquare, color: "#3b82f6" },
          { label: "Resolved", value: "24", icon: CheckCircle, color: "#22c55e" },
          { label: "Avg Response", value: "2.4h", icon: HelpCircle, color: "#10b981" },
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

      {/* Help Topics */}
      <div>
        <h2 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Browse Help Topics
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {helpTopics.map((topic) => (
            <div
              key={topic.title}
              className="rounded-xl p-4 cursor-pointer transition-all"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)";
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${topic.color}15` }}
              >
                <topic.icon size={18} style={{ color: topic.color }} />
              </div>
              <p className="text-[13px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {topic.title}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                {topic.articles} articles
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Search Help */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Search size={20} style={{ color: "var(--text-tertiary)" }} />
          <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Search Knowledge Base
          </h2>
        </div>
        <input
          type="text"
          placeholder="Search for help articles, guides, and FAQs..."
          className="w-full px-4 py-3 rounded-lg text-[13px]"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border-light)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Support Tickets */}
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
            Your Support Tickets
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 800 }}>
            <thead>
              <tr style={{ background: "var(--input-background)" }}>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Ticket ID
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Subject
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Category
                  </span>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Priority
                  </span>
                </th>
                <th className="px-5 py-3 text-center" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Status
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Last Updated
                  </span>
                </th>
                <th className="px-5 py-3 text-right" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, index) => (
                <tr
                  key={ticket.id}
                  className="group cursor-pointer transition-all"
                  style={{ borderBottom: index < tickets.length - 1 ? "1px solid var(--border-light)" : "none" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <td className="px-5 py-4">
                    <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {ticket.id}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {ticket.subject}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {ticket.messages} message{ticket.messages !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {ticket.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ background: getPriorityStyle(ticket.priority).color }}
                    />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] capitalize"
                      style={{
                        background: getStatusStyle(ticket.status).bg,
                        color: getStatusStyle(ticket.status).color,
                        border: `1px solid ${getStatusStyle(ticket.status).border}`,
                        fontWeight: 600,
                      }}
                    >
                      {ticket.status === "in-progress" ? "In Progress" : ticket.status}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {ticket.updated}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      className="px-3 py-1.5 rounded-lg text-[11px] transition-all"
                      style={{
                        background: "var(--active-overlay)",
                        color: "var(--accent-navy-light)",
                        border: "1px solid var(--border-accent)",
                        fontWeight: 500,
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

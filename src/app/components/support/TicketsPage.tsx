import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Timer,
  XCircle,
  AlertTriangle,
  User,
} from "lucide-react";
import { TicketDetailDrawer } from "./TicketDetailDrawer";

type TicketStatus = "open" | "in-progress" | "waiting" | "escalated" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";
type TicketCategory =
  | "Booking Issue"
  | "Refund Request"
  | "Vendor Complaint"
  | "Payment Issue"
  | "Transport Issue"
  | "Stay Complaint"
  | "Listing Issue"
  | "Account Problem";

interface Ticket {
  id: string;
  ticketId: string;
  customer: string;
  email: string;
  category: TicketCategory;
  bookingRef?: string;
  priority: TicketPriority;
  assignedAgent?: string;
  lastUpdate: string;
  status: TicketStatus;
  slaStatus: "ok" | "warning" | "breach";
  subject: string;
  messages: number;
}

const SAMPLE_TICKETS: Ticket[] = [
  { id: "1", ticketId: "TKT-2451", customer: "Priya Sharma", email: "priya@example.com", category: "Refund Request", bookingRef: "BK-8432", priority: "urgent", assignedAgent: "Sarah Johnson", lastUpdate: "12 min ago", status: "open", slaStatus: "breach", subject: "Request full refund for cancelled safari booking", messages: 3 },
  { id: "2", ticketId: "TKT-2450", customer: "Marcus Weber", email: "marcus@example.com", category: "Booking Issue", bookingRef: "BK-8429", priority: "high", assignedAgent: "Mike Chen", lastUpdate: "35 min ago", status: "in-progress", slaStatus: "warning", subject: "Hotel confirmation not received after payment", messages: 5 },
  { id: "3", ticketId: "TKT-2449", customer: "Yuki Tanaka", email: "yuki@example.com", category: "Transport Issue", bookingRef: "BK-8425", priority: "medium", assignedAgent: "Anna Lee", lastUpdate: "1 hr ago", status: "waiting", slaStatus: "ok", subject: "Airport transfer driver not at pickup location", messages: 8 },
  { id: "4", ticketId: "TKT-2448", customer: "Anika Roth", email: "anika@example.com", category: "Payment Issue", bookingRef: "BK-8421", priority: "high", assignedAgent: "Sarah Johnson", lastUpdate: "2 hr ago", status: "escalated", slaStatus: "warning", subject: "Payment charged twice for same booking", messages: 12 },
  { id: "5", ticketId: "TKT-2447", customer: "James Okonkwo", email: "james@example.com", category: "Stay Complaint", bookingRef: "BK-8418", priority: "medium", assignedAgent: "Mike Chen", lastUpdate: "3 hr ago", status: "in-progress", slaStatus: "ok", subject: "Room condition not as described in listing", messages: 6 },
  { id: "6", ticketId: "TKT-2446", customer: "Leila Nazari", email: "leila@example.com", category: "Vendor Complaint", priority: "low", assignedAgent: "Anna Lee", lastUpdate: "4 hr ago", status: "resolved", slaStatus: "ok", subject: "Poor customer service from tour operator", messages: 9 },
  { id: "7", ticketId: "TKT-2445", customer: "Tom Eriksson", email: "tom@example.com", category: "Listing Issue", priority: "medium", lastUpdate: "5 hr ago", status: "open", slaStatus: "ok", subject: "Unable to view complete listing details", messages: 2 },
  { id: "8", ticketId: "TKT-2444", customer: "Sophie Chen", email: "sophie@example.com", category: "Account Problem", priority: "low", assignedAgent: "Sarah Johnson", lastUpdate: "6 hr ago", status: "closed", slaStatus: "ok", subject: "Cannot reset password via email", messages: 4 },
  { id: "9", ticketId: "TKT-2443", customer: "David Kim", email: "david@example.com", category: "Refund Request", bookingRef: "BK-8401", priority: "urgent", assignedAgent: "Mike Chen", lastUpdate: "8 hr ago", status: "escalated", slaStatus: "breach", subject: "Partial refund for cancelled tour due to weather", messages: 15 },
  { id: "10", ticketId: "TKT-2442", customer: "Maria Garcia", email: "maria@example.com", category: "Booking Issue", bookingRef: "BK-8398", priority: "high", lastUpdate: "1 day ago", status: "waiting", slaStatus: "warning", subject: "Special dietary requirements not confirmed", messages: 7 },
];

const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; text: string; icon: React.ComponentType<any> }> = {
  open: { label: "Open", bg: "rgba(59,130,246,0.12)", text: "#60a5fa", icon: MessageSquare },
  "in-progress": { label: "In Progress", bg: "rgba(251,191,36,0.12)", text: "#fbbf24", icon: Clock },
  waiting: { label: "Waiting", bg: "rgba(139,92,246,0.12)", text: "#a78bfa", icon: Timer },
  escalated: { label: "Escalated", bg: "rgba(239,68,68,0.12)", text: "#f87171", icon: AlertTriangle },
  resolved: { label: "Resolved", bg: "rgba(34,197,94,0.12)", text: "#4ade80", icon: CheckCircle },
  closed: { label: "Closed", bg: "rgba(100,116,139,0.12)", text: "#94a3b8", icon: XCircle },
};

const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", bg: "rgba(239,68,68,0.12)", text: "#f87171", border: "rgba(239,68,68,0.25)" },
  high: { label: "High", bg: "rgba(249,115,22,0.12)", text: "#fb923c", border: "rgba(249,115,22,0.25)" },
  medium: { label: "Medium", bg: "rgba(251,191,36,0.12)", text: "#fbbf24", border: "rgba(251,191,36,0.25)" },
  low: { label: "Low", bg: "rgba(59,130,246,0.12)", text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
};

const SLA_CONFIG = {
  ok: { color: "#4ade80", icon: CheckCircle },
  warning: { color: "#fbbf24", icon: AlertCircle },
  breach: { color: "#f87171", icon: AlertTriangle },
};

export function TicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "all">("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filtered = SAMPLE_TICKETS.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      t.ticketId.toLowerCase().includes(q) ||
      t.customer.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      (t.bookingRef ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchSearch && matchStatus && matchPriority && matchCategory;
  });

  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s] = SAMPLE_TICKETS.filter((t) => t.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const categories = Array.from(new Set(SAMPLE_TICKETS.map((t) => t.category)));

  return (
    <div className="p-6 space-y-5 max-w-[1800px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={15} style={{ color: "var(--accent-navy)" }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>
              Support Tickets
            </span>
          </div>
          <h1 className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Ticket Queue — {SAMPLE_TICKETS.length} Total
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Manage customer and vendor support requests
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] transition-all"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          <Download size={14} />
          Export Queue
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className="px-3 py-1.5 rounded-lg text-[12px] transition-all"
          style={{
            background: statusFilter === "all" ? "var(--accent-navy)" : "var(--bg-card)",
            color: statusFilter === "all" ? "white" : "var(--text-secondary)",
            border: `1px solid ${statusFilter === "all" ? "transparent" : "var(--border-light)"}`,
            fontWeight: statusFilter === "all" ? 600 : 400,
          }}
        >
          All ({SAMPLE_TICKETS.length})
        </button>
        {(Object.entries(STATUS_CONFIG) as [TicketStatus, typeof STATUS_CONFIG[TicketStatus]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all"
            style={{
              background: statusFilter === key ? cfg.bg : "var(--bg-card)",
              color: statusFilter === key ? cfg.text : "var(--text-secondary)",
              border: `1px solid ${statusFilter === key ? cfg.text + "40" : "var(--border-light)"}`,
            }}
          >
            <cfg.icon size={11} />
            {cfg.label} ({statusCounts[key] ?? 0})
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1" style={{ minWidth: 280, maxWidth: 400 }}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets, customers, booking refs..."
            className="w-full pl-8 pr-3 py-2 rounded-lg text-[13px] outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | "all")}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-[13px] outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as TicketCategory | "all")}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-[13px] outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
        </div>

        {/* Showing count */}
        <div className="ml-auto text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          Showing {filtered.length} of {SAMPLE_TICKETS.length} tickets
        </div>
      </div>

      {/* Tickets Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
      >
        {/* Table Header */}
        <div
          className="grid text-[11px] uppercase tracking-wider px-5 py-3"
          style={{
            gridTemplateColumns: "100px 180px 1fr 100px 80px 120px 100px 90px 50px",
            borderBottom: "1px solid var(--border-light)",
            color: "var(--text-tertiary)",
            background: "var(--bg-panel)",
          }}
        >
          <div>Ticket ID</div>
          <div>Customer</div>
          <div>Subject</div>
          <div>Category</div>
          <div>Priority</div>
          <div>Assigned To</div>
          <div>Last Update</div>
          <div>Status</div>
          <div></div>
        </div>

        {/* Table Rows */}
        <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
          {filtered.map((ticket) => {
            const statusCfg = STATUS_CONFIG[ticket.status];
            const priorityCfg = PRIORITY_CONFIG[ticket.priority];
            const slaCfg = SLA_CONFIG[ticket.slaStatus];

            return (
              <div
                key={ticket.id}
                className="grid items-center px-5 py-3.5 cursor-pointer transition-all"
                style={{ gridTemplateColumns: "100px 180px 1fr 100px 80px 120px 100px 90px 50px" }}
                onClick={() => setSelectedTicket(ticket)}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                {/* Ticket ID */}
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-mono" style={{ color: "var(--accent-navy-light)" }}>
                    {ticket.ticketId}
                  </span>
                  {ticket.slaStatus !== "ok" && <slaCfg.icon size={11} style={{ color: slaCfg.color }} />}
                </div>

                {/* Customer */}
                <div>
                  <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {ticket.customer}
                  </p>
                  {ticket.bookingRef && (
                    <p className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>
                      {ticket.bookingRef}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div className="flex items-center gap-2">
                  <p className="text-[13px] truncate" style={{ color: "var(--text-secondary)" }}>
                    {ticket.subject}
                  </p>
                  {ticket.messages > 0 && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}
                    >
                      {ticket.messages}
                    </span>
                  )}
                </div>

                {/* Category */}
                <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  {ticket.category}
                </div>

                {/* Priority */}
                <div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded inline-block"
                    style={{ background: priorityCfg.bg, color: priorityCfg.text, border: `1px solid ${priorityCfg.border}` }}
                  >
                    {priorityCfg.label}
                  </span>
                </div>

                {/* Assigned Agent */}
                <div>
                  {ticket.assignedAgent ? (
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                        style={{ background: "var(--bg-panel)", color: "var(--accent-navy-light)", fontWeight: 600 }}
                      >
                        {ticket.assignedAgent
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {ticket.assignedAgent.split(" ")[0]}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      Unassigned
                    </span>
                  )}
                </div>

                {/* Last Update */}
                <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  {ticket.lastUpdate}
                </div>

                {/* Status */}
                <div>
                  <span
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: statusCfg.bg, color: statusCfg.text }}
                  >
                    <statusCfg.icon size={9} />
                    {statusCfg.label}
                  </span>
                </div>

                {/* Actions */}
                <div>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: "var(--bg-panel)", color: "var(--text-tertiary)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTicket(ticket);
                    }}
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket Detail Drawer */}
      {selectedTicket && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSelectedTicket(null)} style={{ background: "rgba(0,0,0,0.3)" }} />
          <TicketDetailDrawer ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
        </>
      )}
    </div>
  );
}

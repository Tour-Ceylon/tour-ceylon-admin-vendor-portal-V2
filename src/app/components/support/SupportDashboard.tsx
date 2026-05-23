import { useState } from "react";
import {
  LifeBuoy,
  AlertCircle,
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  Timer,
  UserCircle,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface TicketSummary {
  id: string;
  ticketId: string;
  customer: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: string;
  timeAgo: string;
  slaStatus: "ok" | "warning" | "breach";
}

const URGENT_TICKETS: TicketSummary[] = [
  { id: "1", ticketId: "TKT-2451", customer: "Priya Sharma", category: "Refund Request", priority: "urgent", status: "open", timeAgo: "12 min ago", slaStatus: "breach" },
  { id: "2", ticketId: "TKT-2448", customer: "Marcus Weber", category: "Booking Issue", priority: "urgent", status: "in-progress", timeAgo: "35 min ago", slaStatus: "warning" },
  { id: "3", ticketId: "TKT-2442", customer: "Yuki Tanaka", category: "Payment Issue", priority: "high", status: "open", timeAgo: "1 hr ago", slaStatus: "warning" },
  { id: "4", ticketId: "TKT-2439", customer: "Anika Roth", category: "Vendor Complaint", priority: "high", status: "escalated", timeAgo: "2 hr ago", slaStatus: "ok" },
];

const RECENT_TICKETS: TicketSummary[] = [
  { id: "5", ticketId: "TKT-2456", customer: "James Okonkwo", category: "Transport Issue", priority: "medium", status: "open", timeAgo: "5 min ago", slaStatus: "ok" },
  { id: "6", ticketId: "TKT-2455", customer: "Leila Nazari", category: "Stay Complaint", priority: "low", status: "waiting", timeAgo: "18 min ago", slaStatus: "ok" },
  { id: "7", ticketId: "TKT-2454", customer: "Tom Eriksson", category: "Account Problem", priority: "medium", status: "in-progress", timeAgo: "42 min ago", slaStatus: "ok" },
  { id: "8", ticketId: "TKT-2453", customer: "Sophie Chen", category: "Listing Issue", priority: "low", status: "resolved", timeAgo: "1 hr ago", slaStatus: "ok" },
];

const RESPONSE_TIME_TREND = [
  { month: "Mar", avg: 3.2 },
  { month: "Apr", avg: 2.8 },
  { month: "May", avg: 2.5 },
  { month: "Jun", avg: 2.9 },
  { month: "Jul", avg: 2.6 },
  { month: "Aug", avg: 2.3 },
];

const CATEGORY_STATS = [
  { category: "Booking", count: 45 },
  { category: "Refund", count: 38 },
  { category: "Vendor", count: 28 },
  { category: "Payment", count: 22 },
  { category: "Transport", count: 18 },
];

const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", bg: "rgba(239,68,68,0.12)", text: "#f87171", border: "rgba(239,68,68,0.25)" },
  high: { label: "High", bg: "rgba(249,115,22,0.12)", text: "#fb923c", border: "rgba(249,115,22,0.25)" },
  medium: { label: "Medium", bg: "rgba(251,191,36,0.12)", text: "#fbbf24", border: "rgba(251,191,36,0.25)" },
  low: { label: "Low", bg: "rgba(59,130,246,0.12)", text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
};

const SLA_CONFIG = {
  ok: { color: "#4ade80", icon: CheckCircle },
  warning: { color: "#fbbf24", icon: AlertTriangle },
  breach: { color: "#f87171", icon: AlertCircle },
};

export function SupportDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <LifeBuoy size={15} style={{ color: "var(--accent-navy)" }} />
          <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent-navy)" }}>
            Customer Support
          </span>
        </div>
        <h1 className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Support Operations Center
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Travel Ready Tours — Ticket management and customer service
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: "Open Tickets", value: "142", delta: "+12", up: true, icon: MessageSquare, color: "#3b82f6" },
          { label: "High Priority", value: "23", delta: "+5", up: true, icon: AlertCircle, color: "#f97316" },
          { label: "Avg Response", value: "2.3h", delta: "-18%", up: false, icon: Clock, color: "#10b981" },
          { label: "Resolved Today", value: "67", delta: "+8", up: true, icon: CheckCircle, color: "#22c55e" },
          { label: "Refund Requests", value: "18", delta: "+3", up: true, icon: DollarSign, color: "#8b5cf6" },
          { label: "Vendor Support", value: "31", delta: "-2", up: false, icon: Users, color: "#0891b2" },
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
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
              {stat.label}
            </p>
            <div className="flex items-end gap-2">
              <p className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700, lineHeight: 1 }}>
                {stat.value}
              </p>
              <div
                className="flex items-center gap-0.5 text-[11px] mb-0.5"
                style={{ color: stat.up ? "var(--success)" : "var(--error)" }}
              >
                {stat.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                {stat.delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column - Urgent & Recent */}
        <div className="col-span-5 space-y-6">
          {/* Urgent Issues */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
              <div className="flex items-center gap-2">
                <AlertCircle size={14} style={{ color: "#f97316" }} />
                <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  Urgent Issues
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>
                {URGENT_TICKETS.length} urgent
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
              {URGENT_TICKETS.map((ticket) => {
                const priorityCfg = PRIORITY_CONFIG[ticket.priority];
                const slaCfg = SLA_CONFIG[ticket.slaStatus];
                return (
                  <div
                    key={ticket.id}
                    className="px-5 py-3 cursor-pointer transition-all"
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono" style={{ color: "var(--accent-navy-light)" }}>
                          {ticket.ticketId}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: priorityCfg.bg, color: priorityCfg.text, border: `1px solid ${priorityCfg.border}` }}
                        >
                          {priorityCfg.label}
                        </span>
                      </div>
                      <slaCfg.icon size={12} style={{ color: slaCfg.color }} />
                    </div>
                    <p className="text-[13px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {ticket.customer}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {ticket.category}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {ticket.timeAgo}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Tickets */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
              <div className="flex items-center gap-2">
                <Clock size={14} style={{ color: "var(--accent-navy)" }} />
                <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  Recent Tickets
                </span>
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
              {RECENT_TICKETS.map((ticket) => {
                const priorityCfg = PRIORITY_CONFIG[ticket.priority];
                return (
                  <div
                    key={ticket.id}
                    className="px-5 py-3 cursor-pointer transition-all"
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono" style={{ color: "var(--accent-navy-light)" }}>
                          {ticket.ticketId}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: priorityCfg.bg, color: priorityCfg.text }}
                        >
                          {priorityCfg.label}
                        </span>
                      </div>
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {ticket.timeAgo}
                      </span>
                    </div>
                    <p className="text-[12px] mb-1" style={{ color: "var(--text-primary)" }}>
                      {ticket.customer}
                    </p>
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {ticket.category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column - Charts & Analytics */}
        <div className="col-span-7 space-y-6">
          {/* Response Time Trend */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} style={{ color: "var(--accent-navy)" }} />
                <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  Average Response Time Trend
                </span>
              </div>
              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Last 6 months
              </span>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={RESPONSE_TIME_TREND}>
                  <XAxis
                    dataKey="month"
                    stroke="var(--text-tertiary)"
                    style={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--text-tertiary)"
                    style={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}h`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-light)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "var(--text-primary)" }}
                    formatter={(value: number) => [`${value} hours`, "Avg Response"]}
                  />
                  <Line type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Issues by Category */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
              <div className="flex items-center gap-2">
                <MessageSquare size={14} style={{ color: "var(--accent-navy)" }} />
                <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  Issues by Category
                </span>
              </div>
              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                This month
              </span>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={CATEGORY_STATS} layout="vertical">
                  <XAxis type="number" stroke="var(--text-tertiary)" style={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    stroke="var(--text-tertiary)"
                    style={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-light)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "var(--text-primary)" }}
                    formatter={(value: number) => [`${value} tickets`, "Count"]}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SLA & Workload Metrics */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "SLA Compliance", value: "94.2%", sub: "Target: 95%", icon: Timer, color: "#fbbf24" },
              { label: "Avg Resolution", value: "18.5h", sub: "Target: 24h", icon: CheckCircle, color: "#22c55e" },
              { label: "CSAT Score", value: "4.6/5", sub: "312 responses", icon: UserCircle, color: "#8b5cf6" },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl p-4"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${metric.color}15` }}
                  >
                    <metric.icon size={14} style={{ color: metric.color }} />
                  </div>
                </div>
                <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                  {metric.label}
                </p>
                <p className="text-[20px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 700, lineHeight: 1 }}>
                  {metric.value}
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  {metric.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

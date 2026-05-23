import { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  MessageSquare,
  Send,
  Paperclip,
  AlertCircle,
  UserPlus,
  ArrowUpCircle,
  CheckCircle,
  RefreshCw,
  Building2,
  Clock,
  FileText,
} from "lucide-react";

interface Message {
  id: string;
  sender: string;
  role: "customer" | "agent" | "system";
  content: string;
  timestamp: string;
  attachments?: string[];
}

interface InternalNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  flagged?: boolean;
}

interface TicketDetailProps {
  ticket: {
    id: string;
    ticketId: string;
    customer: string;
    email: string;
    category: string;
    bookingRef?: string;
    priority: string;
    assignedAgent?: string;
    lastUpdate: string;
    status: string;
    subject: string;
    messages: number;
  };
  onClose: () => void;
}

const SAMPLE_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "Priya Sharma",
    role: "customer",
    content: "I booked a 3-day safari tour (BK-8432) for August 25-27 but had to cancel due to a family emergency. I paid LKR 85,000 and would like a full refund as this is an emergency situation.",
    timestamp: "Aug 18, 2:34 PM",
  },
  {
    id: "2",
    sender: "Sarah Johnson",
    role: "agent",
    content: "Hello Priya, thank you for reaching out. I'm sorry to hear about your family emergency. I've reviewed your booking and I see it was made on August 10th. According to our cancellation policy, cancellations made within 7 days of the tour receive a 50% refund. However, given the emergency circumstances, let me escalate this to our refunds team for special consideration.",
    timestamp: "Aug 18, 3:12 PM",
  },
  {
    id: "3",
    sender: "Priya Sharma",
    role: "customer",
    content: "Thank you for understanding. I can provide medical documentation if needed to support the emergency claim. Please let me know what additional information you require.",
    timestamp: "Aug 18, 3:45 PM",
    attachments: ["medical_certificate.pdf"],
  },
];

const SAMPLE_NOTES: InternalNote[] = [
  {
    id: "1",
    author: "Sarah Johnson",
    content: "Customer has provided medical documentation. Recommend approving full refund exception. Vendor (Wild Sri Lanka Tours) has been contacted and agreed to waive their cancellation fee given the circumstances.",
    timestamp: "Aug 18, 4:15 PM",
    flagged: true,
  },
  {
    id: "2",
    author: "Mike Chen",
    content: "Approved full refund of LKR 85,000. Processing refund to original payment method. Expected to reflect in 5-7 business days.",
    timestamp: "Aug 18, 5:20 PM",
  },
];

const ACTIVITY_TIMELINE = [
  { event: "Ticket created", user: "System", time: "Aug 18, 2:34 PM" },
  { event: "Assigned to Sarah Johnson", user: "Auto-assign", time: "Aug 18, 2:34 PM" },
  { event: "First response sent", user: "Sarah Johnson", time: "Aug 18, 3:12 PM" },
  { event: "Customer replied", user: "Priya Sharma", time: "Aug 18, 3:45 PM" },
  { event: "Escalated to Refunds Team", user: "Sarah Johnson", time: "Aug 18, 4:15 PM" },
  { event: "Status changed to In Progress", user: "Sarah Johnson", time: "Aug 18, 4:16 PM" },
];

export function TicketDetailDrawer({ ticket, onClose }: TicketDetailProps) {
  const [activeTab, setActiveTab] = useState<"conversation" | "notes" | "activity">("conversation");
  const [replyText, setReplyText] = useState("");
  const [noteText, setNoteText] = useState("");

  return (
    <div
      className="fixed right-0 top-0 h-full w-[750px] flex flex-col z-50"
      style={{
        background: "var(--bg-panel)",
        borderLeft: "1px solid var(--border-light)",
        boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-start justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
        <div>
          <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: "var(--accent-navy)" }}>
            Support Ticket
          </p>
          <p className="text-[16px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {ticket.ticketId}
          </p>
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            {ticket.subject}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{ background: "var(--bg-card)", color: "var(--text-tertiary)" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Customer & Booking Info */}
      <div className="px-5 py-4 grid grid-cols-2 gap-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
        {/* Customer Info */}
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <User size={12} style={{ color: "var(--text-tertiary)" }} />
            <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
              Customer
            </p>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[12px]"
              style={{ background: "var(--bg-panel)", color: "var(--accent-navy-light)", fontWeight: 700 }}
            >
              {ticket.customer
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className="text-[14px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {ticket.customer}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Customer since 2023
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail size={11} style={{ color: "var(--text-tertiary)" }} />
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{ticket.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={11} style={{ color: "var(--text-tertiary)" }} />
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={11} style={{ color: "var(--text-tertiary)" }} />
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>Mumbai, India</span>
            </div>
          </div>
        </div>

        {/* Booking Info */}
        {ticket.bookingRef && (
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={12} style={{ color: "var(--text-tertiary)" }} />
              <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
                Booking Details
              </p>
            </div>
            <div className="space-y-2.5">
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>Booking Reference</p>
                <p className="text-[13px] font-mono" style={{ color: "var(--accent-navy-light)", fontWeight: 600 }}>
                  {ticket.bookingRef}
                </p>
              </div>
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>Service Type</p>
                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>3-Day Safari Tour</p>
              </div>
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>Booking Amount</p>
                <p className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  LKR 85,000
                </p>
              </div>
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>Vendor</p>
                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>Wild Sri Lanka Tours</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 px-5 py-3" style={{ borderBottom: "1px solid var(--border-light)" }}>
        {[
          { key: "conversation", label: "Conversation", icon: MessageSquare, count: SAMPLE_MESSAGES.length },
          { key: "notes", label: "Internal Notes", icon: FileText, count: SAMPLE_NOTES.length },
          { key: "activity", label: "Activity", icon: Clock, count: ACTIVITY_TIMELINE.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all"
            style={{
              background: activeTab === tab.key ? "var(--active-overlay)" : "transparent",
              color: activeTab === tab.key ? "var(--accent-navy-light)" : "var(--text-secondary)",
              border: `1px solid ${activeTab === tab.key ? "var(--border-accent)" : "transparent"}`,
            }}
          >
            <tab.icon size={12} />
            {tab.label}
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{
                background: activeTab === tab.key ? "var(--accent-navy)" : "var(--bg-card)",
                color: activeTab === tab.key ? "white" : "var(--text-tertiary)",
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Conversation Tab */}
        {activeTab === "conversation" && (
          <div className="p-5 space-y-4">
            {SAMPLE_MESSAGES.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "agent" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[85%] rounded-xl p-4"
                  style={{
                    background: msg.role === "agent" ? "rgba(59,130,246,0.08)" : "var(--bg-card)",
                    border: `1px solid ${msg.role === "agent" ? "rgba(59,130,246,0.2)" : "var(--border-light)"}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                      style={{
                        background: msg.role === "agent" ? "var(--accent-navy)" : "var(--bg-panel)",
                        color: msg.role === "agent" ? "white" : "var(--accent-navy-light)",
                        fontWeight: 600,
                      }}
                    >
                      {msg.sender
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {msg.sender}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{msg.timestamp}</p>
                    </div>
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {msg.content}
                  </p>
                  {msg.attachments && (
                    <div className="mt-3 flex items-center gap-2">
                      {msg.attachments.map((att) => (
                        <div
                          key={att}
                          className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px]"
                          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}
                        >
                          <Paperclip size={10} style={{ color: "var(--text-tertiary)" }} />
                          {att}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Internal Notes Tab */}
        {activeTab === "notes" && (
          <div className="p-5 space-y-3">
            {SAMPLE_NOTES.map((note) => (
              <div
                key={note.id}
                className="rounded-xl p-4"
                style={{
                  background: note.flagged ? "rgba(251,191,36,0.06)" : "var(--bg-card)",
                  border: `1px solid ${note.flagged ? "rgba(251,191,36,0.2)" : "var(--border-light)"}`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {note.flagged && <AlertCircle size={12} style={{ color: "#fbbf24" }} />}
                  <p className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {note.author}
                  </p>
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {note.timestamp}
                  </span>
                </div>
                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  {note.content}
                </p>
              </div>
            ))}
            {/* Add Note */}
            <div className="mt-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add internal note (visible to support team only)..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                className="mt-2 px-3 py-1.5 rounded-lg text-[12px]"
                style={{
                  background: "var(--accent-navy)",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                Add Note
              </button>
            </div>
          </div>
        )}

        {/* Activity Timeline Tab */}
        {activeTab === "activity" && (
          <div className="p-5">
            <div className="space-y-3">
              {ACTIVITY_TIMELINE.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: "var(--accent-navy)" }}
                    />
                    {idx < ACTIVITY_TIMELINE.length - 1 && (
                      <div className="w-px flex-1 mt-1" style={{ background: "var(--border-light)", minHeight: 20 }} />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)" }}>
                      {item.event}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {item.user} · {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reply Area (only on conversation tab) */}
      {activeTab === "conversation" && (
        <div className="p-5" style={{ borderTop: "1px solid var(--border-light)" }}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply to customer..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none mb-3"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
          />
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px]"
              style={{
                background: "var(--accent-navy)",
                color: "white",
                fontWeight: 600,
                boxShadow: "0 0 12px var(--border-accent)",
              }}
            >
              <Send size={13} />
              Send Reply
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px]"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
              }}
            >
              <Paperclip size={12} />
              Attach
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-5 py-4 grid grid-cols-2 gap-2" style={{ borderTop: "1px solid var(--border-light)" }}>
        <button
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px]"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          <UserPlus size={12} />
          Assign Agent
        </button>
        <button
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px]"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171",
          }}
        >
          <ArrowUpCircle size={12} />
          Escalate
        </button>
        <button
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px]"
          style={{
            background: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.2)",
            color: "#a78bfa",
          }}
        >
          <DollarSign size={12} />
          Process Refund
        </button>
        <button
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px]"
          style={{
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
            color: "#4ade80",
          }}
        >
          <CheckCircle size={12} />
          Resolve Ticket
        </button>
      </div>
    </div>
  );
}

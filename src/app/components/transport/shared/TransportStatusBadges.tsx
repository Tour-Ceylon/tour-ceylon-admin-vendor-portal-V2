/** One place for the booking, payment and dispatch status colours that were repeated across the transport screens. */

type Tone = { label: string; bg: string; text: string; dot: string };

const BOOKING: Record<string, Tone> = {
  pending: { label: "Pending", bg: "rgba(245, 158, 11, 0.12)", text: "#fbbf24", dot: "#f59e0b" },
  confirmed: { label: "Confirmed", bg: "rgba(34, 197, 94, 0.12)", text: "#4ade80", dot: "#22c55e" },
  completed: { label: "Completed", bg: "rgba(100, 116, 139, 0.15)", text: "#94a3b8", dot: "#64748b" },
  cancelled: { label: "Cancelled", bg: "rgba(239, 68, 68, 0.12)", text: "#f87171", dot: "#ef4444" },
};

const PAYMENT: Record<string, Tone> = {
  paid: { label: "Paid", bg: "rgba(34, 197, 94, 0.12)", text: "#4ade80", dot: "#22c55e" },
  unpaid: { label: "Unpaid", bg: "rgba(245, 158, 11, 0.12)", text: "#fbbf24", dot: "#f59e0b" },
  refunded: { label: "Refunded", bg: "rgba(100, 116, 139, 0.15)", text: "#94a3b8", dot: "#64748b" },
};

export const ASSIGNMENT: Record<string, Tone> = {
  unassigned: { label: "Unassigned", bg: "rgba(245, 158, 11, 0.12)", text: "#fbbf24", dot: "#f59e0b" },
  assigned: { label: "Awaiting driver", bg: "rgba(59, 130, 246, 0.12)", text: "#60a5fa", dot: "#3b82f6" },
  acknowledged: { label: "Accepted", bg: "rgba(168, 85, 247, 0.12)", text: "#c084fc", dot: "#a855f7" },
  en_route: { label: "En route", bg: "rgba(14, 165, 233, 0.12)", text: "#38bdf8", dot: "#0ea5e9" },
  arrived: { label: "Arrived", bg: "rgba(20, 184, 166, 0.12)", text: "#2dd4bf", dot: "#14b8a6" },
  in_progress: { label: "In progress", bg: "rgba(99, 102, 241, 0.12)", text: "#818cf8", dot: "#6366f1" },
  completed: { label: "Completed", bg: "rgba(34, 197, 94, 0.12)", text: "#4ade80", dot: "#22c55e" },
};

const UNKNOWN: Tone = { label: "Unknown", bg: "rgba(100, 116, 139, 0.15)", text: "#94a3b8", dot: "#64748b" };

function pick(map: Record<string, Tone>, value?: string | null): Tone {
  if (!value) return UNKNOWN;
  return map[value] || { ...UNKNOWN, label: value.replace(/_/g, " ") };
}

function Pill({ tone, withDot }: { tone: Tone; withDot?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
      style={{ background: tone.bg, color: tone.text }}
    >
      {withDot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: tone.dot }} aria-hidden />}
      {tone.label}
    </span>
  );
}

export const BookingStatusBadge = ({ status }: { status?: string | null }) => <Pill tone={pick(BOOKING, status)} withDot />;
export const PaymentStatusBadge = ({ status }: { status?: string | null }) => <Pill tone={pick(PAYMENT, status)} />;
export const AssignmentStatusBadge = ({ status }: { status?: string | null }) => <Pill tone={pick(ASSIGNMENT, status || "unassigned")} withDot />;

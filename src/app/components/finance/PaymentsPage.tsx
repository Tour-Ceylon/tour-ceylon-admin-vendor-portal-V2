import { useCallback, useEffect, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import {
  getPaymentsSummary,
  listPayments,
  type AdminPayment,
  type PaymentsSummary,
} from "../api/adminOpsApi";
import { useToast } from "../shared/Toast";
import { formatMoney } from "../../lib/money";

const PAGE_SIZE = 20;

const TABS = [
  { id: "all", label: "All" },
  { id: "succeeded", label: "Paid" },
  { id: "pending", label: "Pending" },
  { id: "initiated", label: "Started" },
  { id: "failed", label: "Failed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "chargedback", label: "Charged back" },
];

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  succeeded: { bg: "rgba(34,197,94,0.12)", text: "#16a34a", label: "Paid" },
  pending: { bg: "rgba(245,158,11,0.12)", text: "#d97706", label: "Pending" },
  initiated: { bg: "rgba(59,130,246,0.12)", text: "#2563eb", label: "Started" },
  failed: { bg: "rgba(239,68,68,0.12)", text: "#dc2626", label: "Failed" },
  cancelled: { bg: "rgba(148,163,184,0.18)", text: "#64748b", label: "Cancelled" },
  chargedback: { bg: "rgba(168,85,247,0.12)", text: "#9333ea", label: "Charged back" },
};

const TARGET_LABEL: Record<string, string> = {
  booking_inquiry: "Booking request",
  transport_booking: "Transfer",
};

/** FEAT-4: online payments as recorded by the payment gateway integration. Real data, read-only. */
export function PaymentsPage() {
  const toast = useToast();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AdminPayment[] | null>(null);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<PaymentsSummary | null>(null);

  const load = useCallback(async () => {
    setRows(null);
    try {
      const result = await listPayments(status, page, PAGE_SIZE);
      setRows(result.items);
      setTotal(result.total);
    } catch (err) {
      setRows([]);
      toast.error("Could not load payments", err instanceof Error ? err.message : "Please try again.");
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getPaymentsSummary()
      .then(setSummary)
      .catch((err) => toast.error("Could not load the totals", err instanceof Error ? err.message : "Please try again."));
  }, []);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1100px]">
      <div>
        <div className="flex items-center gap-2 mb-1" style={{ color: "var(--accent-navy-light)" }}>
          <CreditCard size={15} />
          <span className="text-[11px] uppercase tracking-widest font-semibold">Finance</span>
        </div>
        <h1 className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>Online payments</h1>
        <p className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>
          Every online payment attempt, from the payment gateway. Payments made in cash or by bank transfer are not listed here.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl p-4" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Received</p>
          {summary === null ? (
            <Loader2 size={16} className="animate-spin mt-2" />
          ) : summary.received.length === 0 ? (
            <p className="text-[20px] mt-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>Nothing yet</p>
          ) : (
            summary.received.map((r) => (
              <p key={r.currency} className="text-[20px] mt-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                {formatMoney(Number(r.total), r.currency)}
                <span className="text-[11px] ml-2" style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>
                  {r.count} payment{r.count === 1 ? "" : "s"}
                </span>
              </p>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => { setStatus(t.id); setPage(1); }} className="px-3 py-1.5 rounded-lg text-[12px]"
            style={{
              background: status === t.id ? "var(--accent-navy)" : "var(--bg-panel)",
              color: status === t.id ? "white" : "var(--text-secondary)",
              border: "1px solid var(--border-light)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 720 }}>
            <thead>
              <tr style={{ background: "var(--input-background)" }}>
                {["Date", "For", "Gateway", "Order", "Amount", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows === null && (
                <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="animate-spin inline" size={18} /></td></tr>
              )}
              {rows?.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>No payments match.</td></tr>
              )}
              {rows?.map((p) => {
                const style = STATUS_STYLE[p.status] ?? { bg: "var(--input-background)", text: "var(--text-secondary)", label: p.status };
                return (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--border-light)" }}>
                    <td className="px-4 py-3 text-[12px]" style={{ color: "var(--text-secondary)" }}>{new Date(p.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: "var(--text-primary)" }}>
                      {TARGET_LABEL[p.target_type] ?? p.target_type}
                      <span className="block text-[10px]" style={{ color: "var(--text-tertiary)" }}>{p.target_id.slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-3 text-[12px] capitalize" style={{ color: "var(--text-secondary)" }}>{p.provider}</td>
                    <td className="px-4 py-3 text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>{p.order_id}</td>
                    <td className="px-4 py-3 text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formatMoney(Number(p.amount), p.currency)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px]" style={{ background: style.bg, color: style.text }}>{style.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 text-[12px]" style={{ borderTop: "1px solid var(--border-light)", color: "var(--text-tertiary)" }}>
          <span>{total} payment{total === 1 ? "" : "s"}</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg disabled:opacity-40" style={{ border: "1px solid var(--border-light)" }}>Previous</button>
            <span>Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg disabled:opacity-40" style={{ border: "1px solid var(--border-light)" }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

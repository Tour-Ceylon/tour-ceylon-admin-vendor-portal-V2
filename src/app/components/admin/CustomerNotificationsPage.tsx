import { useCallback, useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { listCustomerNotifications, type CustomerNotification } from "../api/adminOpsApi";
import { useToast } from "../shared/Toast";

const TYPES: Array<{ id: CustomerNotification["type"] | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "booking_quoted", label: "Approved" },
  { id: "booking_confirmed", label: "Confirmed" },
  { id: "booking_cancelled", label: "Cancelled" },
];

/** FEAT-3: what customers were told in-app, so staff can answer "did you notify me?". Read-only. */
export function CustomerNotificationsPage() {
  const toast = useToast();
  const [type, setType] = useState<CustomerNotification["type"] | "all">("all");
  const [items, setItems] = useState<CustomerNotification[] | null>(null);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setItems(null);
    try {
      const result = await listCustomerNotifications(type);
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setItems([]);
      toast.error("Could not load notifications", err instanceof Error ? err.message : "Please try again.");
    }
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1000px]">
      <div>
        <div className="flex items-center gap-2 mb-1" style={{ color: "var(--accent-navy-light)" }}>
          <Bell size={15} />
          <span className="text-[11px] uppercase tracking-widest font-semibold">Customers</span>
        </div>
        <h1 className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>Customer notifications</h1>
        <p className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>
          In-app notifications created when a request is approved, confirmed or cancelled.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TYPES.map((t) => (
          <button key={t.id} onClick={() => setType(t.id)} className="px-3 py-1.5 rounded-lg text-[12px]"
            style={{
              background: type === t.id ? "var(--accent-navy)" : "var(--bg-panel)",
              color: type === t.id ? "white" : "var(--text-secondary)",
              border: "1px solid var(--border-light)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", borderRadius: 12 }}>
        {items === null && <div className="p-6 flex justify-center"><Loader2 className="animate-spin" size={18} /></div>}
        {items?.length === 0 && <p className="p-8 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>No notifications yet.</p>}
        {items?.map((n) => (
          <div key={n.id} className="p-4 flex flex-wrap gap-2 justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="min-w-0">
              <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{n.title}</p>
              <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{n.message}</p>
              <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                {n.recipient_email}{n.reference ? ` · ${n.reference}` : ""}
              </p>
            </div>
            <div className="text-right text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              <p>{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</p>
              <p style={{ color: n.is_read ? "var(--text-tertiary)" : "#d97706", fontWeight: 600 }}>{n.is_read ? "Read" : "Unread"}</p>
            </div>
          </div>
        ))}
      </div>
      {items && items.length > 0 && <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Showing {items.length} of {total}.</p>}
    </div>
  );
}

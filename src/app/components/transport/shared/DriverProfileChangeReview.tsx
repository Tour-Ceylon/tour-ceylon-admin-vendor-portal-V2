import { useState } from "react";
import { AlertCircle, CheckCircle, ClipboardCheck, Loader2, XCircle } from "lucide-react";
import {
  AdminDriverItem,
  approveDriverProfileChange,
  rejectDriverProfileChange,
} from "../../api/adminDriverApi";
import { maskAccountNumber } from "./transportFormat";

type Field = {
  key: string;
  label: string;
  current: (d: AdminDriverItem) => string | null;
  proposed: (value: any) => string;
  sensitive?: boolean;
};

const FIELDS: Field[] = [
  { key: "base_location", label: "Base location", current: (d) => d.base_location || null, proposed: (v) => String(v) },
  {
    key: "languages_spoken",
    label: "Languages spoken",
    current: (d) => (d.languages_spoken?.length ? d.languages_spoken.join(", ") : null),
    proposed: (v) => (Array.isArray(v) ? v.join(", ") : String(v)),
  },
  {
    key: "years_experience",
    label: "Driving experience",
    current: (d) => (d.years_experience != null ? `${d.years_experience} ${d.years_experience === 1 ? "year" : "years"}` : null),
    proposed: (v) => `${v} ${Number(v) === 1 ? "year" : "years"}`,
  },
  { key: "bank_account_holder", label: "Account holder", current: (d) => d.bank_account_holder || null, proposed: (v) => String(v), sensitive: true },
  { key: "bank_name", label: "Bank name", current: (d) => d.bank_name || null, proposed: (v) => String(v), sensitive: true },
  {
    key: "bank_account_number",
    label: "Account number",
    current: (d) => d.bank_account_number || null,
    proposed: (v) => String(v),
    sensitive: true,
  },
];

const NOT_SET = <span style={{ color: "var(--text-tertiary)" }}>Not set</span>;

/**
 * What the driver sent for review, side by side with what is saved today.
 * Nothing reaches the driver's record until the admin approves it here.
 */
export function DriverProfileChangeReview({
  driver,
  onChanged,
}: {
  driver: AdminDriverItem;
  /** Called with the refreshed driver after an approval or rejection. */
  onChanged: (updated: AdminDriverItem) => void;
}) {
  const change = driver.latest_profile_change;
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!change || change.status !== "pending") return null;

  const rows = FIELDS.filter((f) => change.proposed[f.key] !== undefined && change.proposed[f.key] !== null);
  const touchesBank = rows.some((r) => r.sensitive);

  const run = async (kind: "approve" | "reject") => {
    setBusy(kind);
    setErrorMsg(null);
    try {
      const updated =
        kind === "approve"
          ? await approveDriverProfileChange(driver.id)
          : await rejectDriverProfileChange(driver.id, reason.trim());
      setRejecting(false);
      setReason("");
      onChanged(updated);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not complete this action. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section
      aria-label="Profile update waiting for review"
      className="rounded-2xl p-5 space-y-4"
      style={{ background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.35)" }}
    >
      <div className="flex items-start gap-3">
        <ClipboardCheck size={18} className="text-amber-400 mt-0.5 shrink-0" aria-hidden />
        <div>
          <h3 className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>
            Profile update waiting for your review
          </h3>
          <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            The driver sent these details. They are not saved to the driver's record until you approve them.
            {touchesBank && " This includes payout details, so check them against the driver's documents."}
          </p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px]" style={{ color: "var(--text-tertiary)", borderBottom: "1px solid var(--border-light)" }}>
              <th scope="col" className="px-4 py-2 font-semibold">Detail</th>
              <th scope="col" className="px-4 py-2 font-semibold">Saved today</th>
              <th scope="col" className="px-4 py-2 font-semibold">Driver's new value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const current = row.current(driver);
              const proposed = row.proposed(change.proposed[row.key]);
              return (
                <tr key={row.key} style={{ borderTop: "1px solid var(--border-light)" }}>
                  <th scope="row" className="px-4 py-2.5 text-left font-medium" style={{ color: "var(--text-secondary)" }}>
                    {row.label}
                  </th>
                  <td className="px-4 py-2.5 break-words" style={{ color: "var(--text-primary)" }}>
                    {current ? (row.key === "bank_account_number" ? maskAccountNumber(current) : current) : NOT_SET}
                  </td>
                  <td className="px-4 py-2.5 font-semibold break-words" style={{ color: "#fbbf24" }}>
                    {proposed}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {errorMsg && (
        <div role="alert" className="flex items-start gap-2 rounded-lg px-3 py-2 text-[12px]" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--error)" }}>
          <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden />
          {errorMsg}
        </div>
      )}

      {rejecting ? (
        <div className="space-y-2">
          <label htmlFor="profile-change-reason" className="text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>
            Tell the driver what to fix (they will see this)
          </label>
          <textarea
            id="profile-change-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="e.g. The account holder name does not match your NIC."
            className="w-full px-3 py-2 text-[13px] rounded-lg resize-none"
            style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => run("reject")}
              disabled={busy !== null || reason.trim().length < 3}
              className="px-4 py-2 rounded-xl text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-50"
              style={{ background: "var(--error)" }}
            >
              {busy === "reject" ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
              Send rejection
            </button>
            <button
              onClick={() => { setRejecting(false); setReason(""); }}
              disabled={busy !== null}
              className="px-4 py-2 rounded-xl text-[12px] font-semibold"
              style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => run("approve")}
            disabled={busy !== null}
            className="px-4 py-2 rounded-xl text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            {busy === "approve" ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
            Approve and save
          </button>
          <button
            onClick={() => setRejecting(true)}
            disabled={busy !== null}
            className="px-4 py-2 rounded-xl text-[12px] font-semibold flex items-center gap-1.5"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <XCircle size={13} /> Reject
          </button>
        </div>
      )}
    </section>
  );
}

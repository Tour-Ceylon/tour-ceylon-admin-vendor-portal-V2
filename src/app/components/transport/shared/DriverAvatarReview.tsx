import { useState } from "react";
import { AlertCircle, CheckCircle, Image as ImageIcon, Loader2, XCircle } from "lucide-react";
import { AdminDriverItem, approveDriverAvatar, rejectDriverAvatar } from "../../api/adminDriverApi";
import { UserAvatar } from "../../shared/UserAvatar";

/**
 * A profile photo the driver uploaded. It is not shown anywhere until it is approved here.
 */
export function DriverAvatarReview({
  driver,
  onChanged,
}: {
  driver: AdminDriverItem;
  /** Called with the refreshed driver after an approval or rejection. */
  onChanged: (updated: AdminDriverItem) => void;
}) {
  const submission = driver.latest_avatar_submission;
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!submission || submission.status !== "pending") return null;

  const run = async (kind: "approve" | "reject") => {
    setBusy(kind);
    setErrorMsg(null);
    try {
      const updated = kind === "approve" ? await approveDriverAvatar(driver.id) : await rejectDriverAvatar(driver.id, reason.trim());
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
      aria-label="Profile photo waiting for review"
      className="rounded-2xl p-5 space-y-4"
      style={{ background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.35)" }}
    >
      <div className="flex items-start gap-3">
        <ImageIcon size={18} className="text-amber-400 mt-0.5 shrink-0" aria-hidden />
        <div>
          <h3 className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>
            Profile photo waiting for your review
          </h3>
          <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            Customers and other staff will see this photo once you approve it. Check that it is a clear photo of the driver's face.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <figure className="space-y-1.5 text-center">
          <img
            src={submission.image_url}
            alt={`New profile photo submitted by ${driver.full_name || "the driver"}`}
            width={160}
            height={160}
            className="w-40 h-40 rounded-2xl object-cover"
            style={{ border: "1px solid var(--border-light)" }}
          />
          <figcaption className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>New photo</figcaption>
        </figure>
        <figure className="space-y-1.5 text-center">
          <div className="w-20 h-20 flex items-center justify-center">
            <UserAvatar name={driver.full_name} src={driver.avatar_url} size={80} />
          </div>
          <figcaption className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {driver.avatar_url ? "Current photo" : "No photo yet"}
          </figcaption>
        </figure>
      </div>

      {errorMsg && (
        <div role="alert" className="flex items-start gap-2 rounded-lg px-3 py-2 text-[12px]" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--error)" }}>
          <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden />
          {errorMsg}
        </div>
      )}

      {rejecting ? (
        <div className="space-y-2">
          <label htmlFor="avatar-reject-reason" className="text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>
            Tell the driver what to fix (they will see this)
          </label>
          <textarea
            id="avatar-reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="e.g. Your face is not visible. Please retake the photo in good light."
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
            Approve photo
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

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, UserCheck, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  createAssignment,
  listAssignments,
  removeAssignment,
  type InquiryAssignment,
} from "../api/adminOpsApi";
import { fetchApprovedDrivers, type DriverPoolItem } from "../api/adminTransportApi";
import { useToast } from "../shared/Toast";

interface AssignmentSectionProps {
  inquiryId: string;
  /** Raw inquiry status. A guide or driver can only be assigned once the request is approved. */
  inquiryStatus?: string;
}

const field = {
  background: "var(--input-background)",
  border: "1px solid var(--border-light)",
  color: "var(--text-primary)",
} as const;

/** FEAT-2: who delivers a tour, safari or experience. Admins only (the endpoints are admin-only). */
export function AssignmentSection({ inquiryId, inquiryStatus }: AssignmentSectionProps) {
  const { effectiveUser } = useAuth();
  const toast = useToast();
  const isAdmin = effectiveUser?.role === "admin";
  const approved = inquiryStatus === "quoted" || inquiryStatus === "converted_to_booking";

  const [items, setItems] = useState<InquiryAssignment[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<"guide" | "driver">("guide");
  const [drivers, setDrivers] = useState<DriverPoolItem[]>([]);
  const [driverId, setDriverId] = useState("");
  const [guideName, setGuideName] = useState("");
  const [guidePhone, setGuidePhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await listAssignments(inquiryId));
    } catch (err) {
      setItems([]);
      toast.error("Could not load assignments", err instanceof Error ? err.message : "Please try again.");
    }
  }, [inquiryId]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  useEffect(() => {
    if (!adding || type !== "driver" || drivers.length > 0) return;
    fetchApprovedDrivers().then(setDrivers).catch((err) =>
      toast.error("Could not load drivers", err instanceof Error ? err.message : "Please try again.")
    );
  }, [adding, type, drivers.length]);

  if (!isAdmin) return null;

  const active = (items ?? []).filter((a) => a.status === "assigned");

  async function handleAssign(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await createAssignment(
        inquiryId,
        type === "driver"
          ? { assignee_type: "driver", driver_id: driverId, notes: notes.trim() || undefined }
          : { assignee_type: "guide", guide_name: guideName.trim(), guide_phone: guidePhone.trim() || undefined, notes: notes.trim() || undefined }
      );
      toast.success(type === "driver" ? "Driver assigned" : "Guide assigned");
      setAdding(false);
      setDriverId("");
      setGuideName("");
      setGuidePhone("");
      setNotes("");
      await load();
    } catch (err) {
      toast.error("Could not assign", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(assignment: InquiryAssignment) {
    if (!window.confirm("Remove this assignment?")) return;
    try {
      await removeAssignment(inquiryId, assignment.id);
      await load();
    } catch (err) {
      toast.error("Could not remove the assignment", err instanceof Error ? err.message : "Please try again.");
    }
  }

  return (
    <div className="rounded-xl p-5" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] flex items-center gap-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          <UserCheck size={16} style={{ color: "#10b981" }} /> Guide &amp; driver
        </h3>
        {approved && !adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px]"
            style={{ border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
            <Plus size={12} /> Assign
          </button>
        )}
      </div>

      {!approved && (
        <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          Approve the request first. A guide or driver can only be assigned to an approved request.
        </p>
      )}

      {items === null && approved && <Loader2 size={16} className="animate-spin" />}
      {approved && items !== null && active.length === 0 && !adding && (
        <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Nobody is assigned yet.</p>
      )}

      <div className="space-y-2">
        {active.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-3 p-3 rounded-lg" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
            <div className="min-w-0 text-[12px]">
              <p style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {a.assignee_type === "driver" ? "Driver" : "Guide"}: {a.assignee_type === "driver" ? a.driver?.full_name ?? "Driver" : a.guide_name}
              </p>
              <p style={{ color: "var(--text-tertiary)" }}>
                {a.assignee_type === "driver"
                  ? [a.driver?.phone, a.driver?.vehicle, a.driver?.plate].filter(Boolean).join(" · ")
                  : a.guide_phone || "No phone given"}
              </p>
              {a.notes && <p className="mt-1" style={{ color: "var(--text-secondary)" }}>{a.notes}</p>}
            </div>
            <button onClick={() => handleRemove(a)} aria-label="Remove assignment" className="p-1.5 rounded-lg" style={{ color: "#ef4444" }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {adding && (
        <form onSubmit={handleAssign} className="mt-3 space-y-3">
          <div className="flex gap-2">
            {(["guide", "driver"] as const).map((t) => (
              <button type="button" key={t} onClick={() => setType(t)} className="px-3 py-1.5 rounded-lg text-[12px] capitalize"
                style={{ background: type === t ? "var(--accent-navy)" : "var(--input-background)", color: type === t ? "white" : "var(--text-secondary)", border: "1px solid var(--border-light)" }}>
                {t}
              </button>
            ))}
          </div>
          {type === "driver" ? (
            <select value={driverId} onChange={(e) => setDriverId(e.target.value)} required className="w-full px-3 py-2 rounded-lg text-[13px]" style={field}>
              <option value="">Choose an approved driver…</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.full_name ?? d.email} · {d.vehicle_make} {d.vehicle_model} ({d.seats} seats){d.is_online ? " · online" : ""}</option>
              ))}
            </select>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <input value={guideName} onChange={(e) => setGuideName(e.target.value)} placeholder="Guide's name" required maxLength={150} className="px-3 py-2 rounded-lg text-[13px]" style={field} />
              <input value={guidePhone} onChange={(e) => setGuidePhone(e.target.value)} placeholder="Phone (optional)" maxLength={40} className="px-3 py-2 rounded-lg text-[13px]" style={field} />
            </div>
          )}
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" maxLength={500} className="w-full px-3 py-2 rounded-lg text-[13px]" style={field} />
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg text-[12px] disabled:opacity-50" style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600 }}>
              {busy ? "Assigning…" : "Assign"}
            </button>
            <button type="button" onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg text-[12px]" style={{ border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

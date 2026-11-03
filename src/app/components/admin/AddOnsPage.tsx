import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Puzzle, Trash2 } from "lucide-react";
import { apiFetch } from "../api/apiClient";
import { createAddOn, deleteAddOn, listAddOns, updateAddOn, type AddOn } from "../api/adminOpsApi";
import { useToast } from "../shared/Toast";
import { formatMoney } from "../../lib/money";

interface ListingOption {
  id: string;
  title: string;
  category: string;
  currency: string;
}

const card = { background: "var(--bg-panel)", border: "1px solid var(--border-light)", borderRadius: 12 } as const;
const field = {
  background: "var(--input-background)",
  border: "1px solid var(--border-light)",
  color: "var(--text-primary)",
} as const;

/** FEAT-3: optional extras (airport pickup, packed lunch...) shown on a listing page. */
export function AddOnsPage() {
  const toast = useToast();
  const [listings, setListings] = useState<ListingOption[]>([]);
  const [listingId, setListingId] = useState("");
  const [addOns, setAddOns] = useState<AddOn[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "" });

  const selected = useMemo(() => listings.find((l) => l.id === listingId), [listings, listingId]);

  useEffect(() => {
    (async () => {
      try {
        const snapshot: any = await apiFetch("/admin/snapshot");
        const all = Object.values(snapshot.listings || {}).flat() as any[];
        setListings(
          all.map((l) => ({
            id: l.id,
            title: l.title || "Untitled",
            category: l.category || "",
            // DATA-2: an add-on defaults to the listing's own currency.
            currency: String(l.fromPrice?.currency || l.baseCurrency || l.base_currency || "USD").toUpperCase(),
          }))
        );
      } catch (err) {
        toast.error("Could not load listings", err instanceof Error ? err.message : "Please refresh the page.");
      }
    })();
  }, []);

  const load = useCallback(async (id: string) => {
    setAddOns(null);
    try {
      setAddOns(await listAddOns(id));
    } catch (err) {
      setAddOns([]);
      toast.error("Could not load add-ons", err instanceof Error ? err.message : "Please try again.");
    }
  }, []);

  useEffect(() => {
    if (listingId) load(listingId);
    else setAddOns(null);
  }, [listingId, load]);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const price = Number(form.price);
    if (!selected || !form.name.trim() || !Number.isFinite(price) || price < 0) {
      toast.error("Check the add-on", "Enter a name and a price of 0 or more.");
      return;
    }
    setBusy(true);
    try {
      await createAddOn({
        listing_id: selected.id,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price,
        base_currency: selected.currency,
      });
      setForm({ name: "", description: "", price: "" });
      toast.success("Add-on added", "It now shows on the listing page.");
      await load(selected.id);
    } catch (err) {
      toast.error("Could not add the add-on", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggle(addOn: AddOn) {
    try {
      await updateAddOn(addOn.id, { is_active: !addOn.is_active });
      await load(addOn.listing_id);
    } catch (err) {
      toast.error("Could not update the add-on", err instanceof Error ? err.message : "Please try again.");
    }
  }

  async function handleDelete(addOn: AddOn) {
    if (!window.confirm(`Delete the add-on "${addOn.name}"? Guests will no longer see it.`)) return;
    try {
      await deleteAddOn(addOn.id);
      await load(addOn.listing_id);
    } catch (err) {
      toast.error("Could not delete the add-on", err instanceof Error ? err.message : "Please try again.");
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[900px]">
      <div>
        <div className="flex items-center gap-2 mb-1" style={{ color: "var(--accent-navy-light)" }}>
          <Puzzle size={15} />
          <span className="text-[11px] uppercase tracking-widest font-semibold">Add-ons</span>
        </div>
        <h1 className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>Listing add-ons</h1>
        <p className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>
          Optional extras shown on a listing page. They are for display; the booking total does not include them yet.
        </p>
      </div>

      <div style={card} className="p-4">
        <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Listing</label>
        <select
          value={listingId}
          onChange={(e) => setListingId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-[13px]"
          style={field}
        >
          <option value="">Choose a listing…</option>
          {listings.map((l) => (
            <option key={l.id} value={l.id}>{l.title} ({l.category})</option>
          ))}
        </select>
      </div>

      {selected && (
        <>
          <form onSubmit={handleAdd} style={card} className="p-4 grid gap-3 md:grid-cols-[1fr_140px_auto] items-end">
            <div>
              <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Name</label>
              <input value={form.name} maxLength={150} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-[13px]" style={field} placeholder="e.g. Airport pickup" required />
            </div>
            <div>
              <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Price ({selected.currency})</label>
              <input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-[13px]" style={field} required />
            </div>
            <button type="submit" disabled={busy}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[13px] disabled:opacity-50"
              style={{ background: "var(--accent-navy)", color: "white", fontWeight: 600 }}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add
            </button>
            <div className="md:col-span-3">
              <label className="text-[11px] block mb-1" style={{ color: "var(--text-secondary)" }}>Description (optional)</label>
              <input value={form.description} maxLength={1000} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-[13px]" style={field} />
            </div>
          </form>

          <div style={card} className="divide-y" >
            {addOns === null && <div className="p-6 flex justify-center"><Loader2 className="animate-spin" size={18} /></div>}
            {addOns?.length === 0 && (
              <p className="p-6 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>No add-ons for this listing yet.</p>
            )}
            {addOns?.map((addOn) => (
              <div key={addOn.id} className="p-4 flex flex-wrap items-center gap-3 justify-between" style={{ borderColor: "var(--border-light)" }}>
                <div className="min-w-0">
                  <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600, opacity: addOn.is_active ? 1 : 0.55 }}>
                    {addOn.name} <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>· {formatMoney(addOn.price, addOn.base_currency)}</span>
                  </p>
                  {addOn.description && <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{addOn.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggle(addOn)} className="px-3 py-1.5 rounded-lg text-[12px]"
                    style={{ border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                    {addOn.is_active ? "Hide from guests" : "Show to guests"}
                  </button>
                  <button onClick={() => handleDelete(addOn)} aria-label={`Delete ${addOn.name}`} className="p-2 rounded-lg"
                    style={{ border: "1px solid var(--border-light)", color: "#ef4444" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

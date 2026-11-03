import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquareQuote, Star } from "lucide-react";
import { listReviews, setReviewStatus, type ModeratedReview, type ReviewStatus } from "../api/adminOpsApi";
import { useToast } from "../shared/Toast";

const TABS: Array<{ id: ReviewStatus | "all"; label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "published", label: "Published" },
  { id: "hidden", label: "Hidden" },
  { id: "all", label: "All" },
];

/** FEAT-3: publish or hide guest reviews. */
export function ReviewModerationPage() {
  const toast = useToast();
  const [tab, setTab] = useState<ReviewStatus | "all">("pending");
  const [reviews, setReviews] = useState<ModeratedReview[] | null>(null);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setReviews(null);
    try {
      const result = await listReviews(tab);
      setReviews(result.items);
      setTotal(result.total);
    } catch (err) {
      setReviews([]);
      toast.error("Could not load reviews", err instanceof Error ? err.message : "Please try again.");
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function change(review: ModeratedReview, status: ReviewStatus) {
    try {
      await setReviewStatus(review.id, status);
      toast.success(status === "published" ? "Review published" : status === "hidden" ? "Review hidden" : "Review set to pending");
      await load();
    } catch (err) {
      toast.error("Could not update the review", err instanceof Error ? err.message : "Please try again.");
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[900px]">
      <div>
        <div className="flex items-center gap-2 mb-1" style={{ color: "var(--accent-navy-light)" }}>
          <MessageSquareQuote size={15} />
          <span className="text-[11px] uppercase tracking-widest font-semibold">Moderation</span>
        </div>
        <h1 className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>Guest reviews</h1>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="px-3 py-1.5 rounded-lg text-[12px]"
            style={{
              background: tab === t.id ? "var(--accent-navy)" : "var(--bg-panel)",
              color: tab === t.id ? "white" : "var(--text-secondary)",
              border: "1px solid var(--border-light)",
              fontWeight: tab === t.id ? 600 : 400,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", borderRadius: 12 }}>
        {reviews === null && <div className="p-6 flex justify-center"><Loader2 className="animate-spin" size={18} /></div>}
        {reviews?.length === 0 && (
          <div className="p-8 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            <p>No reviews here.</p>
            <p className="mt-1 text-[12px]">
              Guests cannot submit reviews on the customer site yet, so this list fills up once a submission form is added.
            </p>
          </div>
        )}
        {reviews?.map((review) => (
          <div key={review.id} className="p-4 flex flex-wrap gap-3 justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="min-w-0">
              <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{review.title || "(no title)"}</p>
              <p className="text-[12px] flex items-center gap-1" style={{ color: "var(--text-tertiary)" }}>
                <Star size={12} fill="#f59e0b" color="#f59e0b" /> {review.rating}/5 · {review.listing_title ?? "Unknown listing"} · {review.user_email ?? "unknown guest"}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-[11px] capitalize px-2 py-0.5 rounded" style={{ background: "var(--input-background)", color: "var(--text-secondary)" }}>{review.status}</span>
              {review.status !== "published" && (
                <button onClick={() => change(review, "published")} className="px-3 py-1.5 rounded-lg text-[12px] bg-emerald-600 text-white">Publish</button>
              )}
              {review.status !== "hidden" && (
                <button onClick={() => change(review, "hidden")} className="px-3 py-1.5 rounded-lg text-[12px]"
                  style={{ border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>Hide</button>
              )}
            </div>
          </div>
        ))}
      </div>
      {reviews && reviews.length > 0 && <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Showing {reviews.length} of {total}.</p>}
    </div>
  );
}

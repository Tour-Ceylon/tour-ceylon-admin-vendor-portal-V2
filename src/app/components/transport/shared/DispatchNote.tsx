import { Megaphone } from "lucide-react";
import { formatDateTime } from "./transportFormat";

/** A note from the admin team to the driver on this trip. Shown above the customer's own request. */
export function DispatchNote({ text, updatedAt }: { text?: string | null; updatedAt?: string | null }) {
  if (!text || !text.trim()) return null;

  return (
    <div className="flex items-start gap-2.5 bg-blue-500/[0.09] border border-blue-500/25 rounded-xl px-3.5 py-2.5">
      <Megaphone size={13} className="text-blue-300 mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="text-[10px] text-blue-300/80 uppercase tracking-wide">Message from dispatch</p>
        <p className="text-blue-100 text-sm leading-snug whitespace-pre-line break-words">{text}</p>
        {updatedAt && <p className="text-[10px] text-blue-300/60 mt-1">Updated {formatDateTime(updatedAt)}</p>}
      </div>
    </div>
  );
}

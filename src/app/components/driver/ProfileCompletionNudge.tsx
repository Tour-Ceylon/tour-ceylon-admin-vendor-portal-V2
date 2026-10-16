import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, UserCog } from "lucide-react";
import { fetchMyDriverProfile } from "../api/driverProfileApi";

/**
 * Asks a driver to finish the profile details that are filled in after registration (languages and payout
 * details). Hidden once they are saved, while an update is waiting for review, or if the profile cannot be read.
 */
export function ProfileCompletionNudge() {
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchMyDriverProfile()
      .then((profile) => {
        if (cancelled || profile.latest_profile_change?.status === "pending") return;
        const gaps: string[] = [];
        if (!profile.languages_spoken || profile.languages_spoken.length === 0) gaps.push("languages");
        if (!profile.bank_account_holder || !profile.bank_name || !profile.bank_account_number) gaps.push("payout details");
        setMissing(gaps);
      })
      .catch(() => {
        /* the nudge is optional; the profile page reports load problems itself */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (missing.length === 0) return null;

  return (
    <Link
      to="/driver/profile"
      className="flex items-center gap-3 rounded-2xl bg-blue-500/[0.07] border border-blue-500/25 p-4 hover:bg-blue-500/[0.12] transition-colors"
    >
      <span className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
        <UserCog size={18} className="text-blue-300" aria-hidden />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-blue-200">Finish your profile</span>
        <span className="block text-xs text-blue-200/70">
          Add your {missing.join(" and ")} so we can pay you and match you with the right trips.
        </span>
      </span>
      <ChevronRight size={16} className="text-blue-300 shrink-0" aria-hidden />
    </Link>
  );
}

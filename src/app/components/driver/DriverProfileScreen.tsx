import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
} from "lucide-react";
import {
  DriverProfileChangePayload,
  MyDriverProfile,
  fetchMyDriverProfile,
  submitMyProfileChange,
  withdrawMyProfileChange,
} from "../api/driverProfileApi";
import { formatDateTime } from "../transport/shared/transportFormat";
import { ProfilePhotoCard } from "./ProfilePhotoCard";

const SUGGESTED_LANGUAGES = [
  "English", "Sinhala", "Tamil", "Hindi", "German", "French", "Russian", "Chinese", "Japanese", "Arabic", "Italian", "Spanish",
];
const MAX_LANGUAGES = 10;

interface FormState {
  languages: string[];
  yearsExperience: string;
  baseLocation: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
}

const compactAccount = (value: string) => value.replace(/[ -]/g, "").toUpperCase();

/**
 * The form's starting values: what the driver last sent if it is still open or was rejected (so they can fix it
 * instead of retyping everything), otherwise what is saved.
 */
function startingValues(profile: MyDriverProfile): FormState {
  const latest = profile.latest_profile_change;
  const pending = latest && (latest.status === "pending" || latest.status === "rejected") ? latest.proposed : {};
  const pick = <T,>(key: keyof DriverProfileChangePayload, saved: T | null | undefined, fallback: T) =>
    ((pending as any)[key] ?? saved ?? fallback) as T;
  return {
    languages: pick("languages_spoken", profile.languages_spoken, [] as string[]),
    yearsExperience: String(pick("years_experience", profile.years_experience, "" as any)),
    baseLocation: pick("base_location", profile.base_location, ""),
    accountHolder: pick("bank_account_holder", profile.bank_account_holder, ""),
    bankName: pick("bank_name", profile.bank_name, ""),
    accountNumber: pick("bank_account_number", profile.bank_account_number, ""),
  };
}

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Only the fields that differ from what is saved today; this is exactly what is sent for review. */
function changesAgainstSaved(form: FormState, profile: MyDriverProfile): DriverProfileChangePayload {
  const changes: DriverProfileChangePayload = {};
  const text = (value: string) => value.trim();

  if (!sameList(form.languages, profile.languages_spoken || []) && form.languages.length > 0) changes.languages_spoken = form.languages;
  if (form.yearsExperience.trim() !== "" && Number(form.yearsExperience) !== profile.years_experience) {
    changes.years_experience = Number(form.yearsExperience);
  }
  if (text(form.baseLocation) && text(form.baseLocation) !== (profile.base_location || "")) changes.base_location = text(form.baseLocation);
  if (text(form.accountHolder) && text(form.accountHolder) !== (profile.bank_account_holder || "")) changes.bank_account_holder = text(form.accountHolder);
  if (text(form.bankName) && text(form.bankName) !== (profile.bank_name || "")) changes.bank_name = text(form.bankName);
  if (text(form.accountNumber) && compactAccount(form.accountNumber) !== (profile.bank_account_number || "")) {
    changes.bank_account_number = text(form.accountNumber);
  }
  return changes;
}

const FIELD =
  "w-full h-12 px-4 rounded-xl text-sm bg-white/[0.03] border border-white/[0.08] text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors aria-[invalid=true]:border-red-500/50";

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-[#070E1D] border border-white/[0.06] overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-white/[0.06]">
        <h2 className="text-white font-bold text-sm">{title}</h2>
        {hint && <p className="text-slate-500 text-xs mt-0.5">{hint}</p>}
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ id, label, optional, hint, error, children }: { id: string; label: string; optional?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-baseline gap-2 text-xs font-semibold text-slate-300">
        {label}
        {optional && <span className="text-[10px] font-normal text-slate-500">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[11px] font-semibold text-red-400">{error}</p>
      ) : (
        hint && <p id={`${id}-hint`} className="text-[11px] text-slate-500">{hint}</p>
      )}
    </div>
  );
}

function ReadOnlyRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 text-right break-words">{value || "—"}</span>
    </div>
  );
}

export function DriverProfileScreen() {
  const [profile, setProfile] = useState<MyDriverProfile | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [customLanguage, setCustomLanguage] = useState("");

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchMyDriverProfile();
      setProfile(data);
      setForm(startingValues(data));
    } catch (err: any) {
      setLoadError(err.message || "We couldn't load your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changes = useMemo(() => (profile && form ? changesAgainstSaved(form, profile) : {}), [profile, form]);
  const changedCount = Object.keys(changes).length;

  const pendingChange = profile?.latest_profile_change?.status === "pending" ? profile.latest_profile_change : null;
  // Nothing to send if the form still matches what is already waiting for review.
  const matchesPending =
    !!pendingChange &&
    JSON.stringify(Object.entries(changes).sort()) === JSON.stringify(Object.entries(pendingChange.proposed).sort());
  const canSubmit = changedCount > 0 && !matchesPending && !submitting;

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
    setNotice(null);
    setSubmitError(null);
  };

  const toggleLanguage = (language: string) => {
    if (!form) return;
    const has = form.languages.some((l) => l.toLowerCase() === language.toLowerCase());
    if (has) update({ languages: form.languages.filter((l) => l.toLowerCase() !== language.toLowerCase()) });
    else if (form.languages.length < MAX_LANGUAGES) update({ languages: [...form.languages, language] });
  };

  const addCustomLanguage = () => {
    const value = customLanguage.trim();
    if (value.length < 2 || !form) return;
    if (!form.languages.some((l) => l.toLowerCase() === value.toLowerCase()) && form.languages.length < MAX_LANGUAGES) {
      update({ languages: [...form.languages, value] });
    }
    setCustomLanguage("");
  };

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!form) return errors;
    const years = form.yearsExperience.trim();
    if (years !== "" && (!/^\d+$/.test(years) || Number(years) > 60)) errors.years = "Enter a whole number of years, from 0 to 60.";
    if (form.baseLocation.trim() && form.baseLocation.trim().length < 2) errors.base = "Enter a town or area.";

    const holder = form.accountHolder.trim();
    const bank = form.bankName.trim();
    const number = form.accountNumber.trim();
    if (holder || bank || number) {
      if (!holder) errors.holder = "Enter the account holder's name.";
      if (!bank) errors.bank = "Enter the bank name.";
      if (!number) errors.number = "Enter the account number.";
      else if (!/^[A-Za-z0-9 -]+$/.test(number)) errors.number = "Use only letters, digits, spaces and hyphens.";
      else if (compactAccount(number).length < 6 || compactAccount(number).length > 34) errors.number = "An account number has 6 to 34 characters.";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      document.getElementById(`dp-${Object.keys(errors)[0]}`)?.focus();
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitMyProfileChange(changes);
      setNotice("Sent for review. We'll save these details once our team has checked them.");
      await load();
    } catch (err: any) {
      setSubmitError(err.message || "We couldn't send your update. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setSubmitError(null);
    try {
      await withdrawMyProfileChange();
      setNotice("Your update was withdrawn. Nothing was changed.");
      await load();
    } catch (err: any) {
      setSubmitError(err.message || "We couldn't withdraw your update.");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-500 text-xs">
        <Loader2 size={16} className="animate-spin text-blue-400" /> Loading your profile…
      </div>
    );
  }

  if (loadError || !profile || !form) {
    return (
      <div className="px-4 py-16 text-center space-y-4 max-w-sm mx-auto">
        <AlertCircle size={32} className="text-red-400 mx-auto" aria-hidden />
        <p className="text-white font-bold text-base">{loadError || "Profile not found"}</p>
        <button onClick={load} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-slate-300">
          <RefreshCw size={14} aria-hidden /> Try again
        </button>
      </div>
    );
  }

  const latest = profile.latest_profile_change;
  const canEdit = profile.status === "pending_review" || profile.status === "approved";

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl lg:max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-white font-bold text-xl">My profile</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Update your details here. Our team checks them before they are saved to your profile.
        </p>
      </div>

      {/* Review status */}
      {notice && (
        <div role="status" className="flex items-start gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs">
          <CheckCircle2 size={14} className="shrink-0 mt-0.5" aria-hidden /> {notice}
        </div>
      )}
      {pendingChange && (
        <div className="rounded-2xl bg-amber-500/[0.07] border border-amber-500/25 p-4 space-y-2">
          <div className="flex items-start gap-2.5">
            <Clock size={15} className="text-amber-400 mt-0.5 shrink-0" aria-hidden />
            <div className="flex-1">
              <p className="text-amber-200 text-sm font-semibold">Waiting for review</p>
              <p className="text-amber-200/70 text-xs mt-0.5">
                You sent {Object.keys(pendingChange.proposed).length} {Object.keys(pendingChange.proposed).length === 1 ? "detail" : "details"} on {formatDateTime(pendingChange.updated_at || pendingChange.created_at)}.
                Your saved profile hasn't changed yet. You can edit and send again to replace it.
              </p>
            </div>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing}
            className="text-xs font-semibold text-amber-300 underline underline-offset-2 disabled:opacity-60"
          >
            {withdrawing ? "Withdrawing…" : "Withdraw this update"}
          </button>
        </div>
      )}
      {latest?.status === "rejected" && (
        <div role="alert" className="flex items-start gap-2.5 rounded-2xl bg-red-500/[0.07] border border-red-500/25 p-4">
          <ShieldAlert size={15} className="text-red-400 mt-0.5 shrink-0" aria-hidden />
          <div>
            <p className="text-red-300 text-sm font-semibold">Your last update needs a change</p>
            <p className="text-red-200/80 text-xs mt-0.5 whitespace-pre-line">{latest.rejection_reason}</p>
            <p className="text-slate-500 text-[11px] mt-1">Fix the details below and send them again.</p>
          </div>
        </div>
      )}
      {latest?.status === "approved" && !pendingChange && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 size={14} className="mt-0.5 shrink-0" aria-hidden />
          Your last update was approved and saved{latest.reviewed_at ? ` on ${formatDateTime(latest.reviewed_at)}` : ""}.
        </div>
      )}
      {!canEdit && (
        <div role="alert" className="flex items-start gap-2.5 rounded-2xl bg-red-500/[0.07] border border-red-500/25 p-4 text-xs text-red-300">
          <Lock size={14} className="mt-0.5 shrink-0" aria-hidden />
          Your driver account isn't active, so your profile can't be changed. Please contact support.
        </div>
      )}

      <ProfilePhotoCard profile={profile} onChanged={load} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Card title="About you" hint="Shown to our team to help match you with trips.">
          <Field id="dp-languages" label="Languages you speak" hint={`Choose up to ${MAX_LANGUAGES}.`}>
            <div id="dp-languages" role="group" aria-label="Languages you speak" className="flex flex-wrap gap-2">
              {Array.from(new Set([...SUGGESTED_LANGUAGES, ...form.languages])).map((language) => {
                const selected = form.languages.some((l) => l.toLowerCase() === language.toLowerCase());
                return (
                  <button
                    key={language}
                    type="button"
                    aria-pressed={selected}
                    disabled={!canEdit || (!selected && form.languages.length >= MAX_LANGUAGES)}
                    onClick={() => toggleLanguage(language)}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors disabled:opacity-40 ${
                      selected ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {language}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pt-1">
              <input
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomLanguage();
                  }
                }}
                disabled={!canEdit}
                aria-label="Add another language"
                placeholder="Another language…"
                maxLength={40}
                className={FIELD + " h-10"}
              />
              <button
                type="button"
                onClick={addCustomLanguage}
                disabled={!canEdit || customLanguage.trim().length < 2}
                aria-label="Add language"
                className="shrink-0 w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 flex items-center justify-center disabled:opacity-40"
              >
                <Plus size={16} aria-hidden />
              </button>
            </div>
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="dp-years" label="Years of driving experience" optional error={fieldErrors.years}>
              <input
                id="dp-years"
                name="years_experience"
                inputMode="numeric"
                autoComplete="off"
                value={form.yearsExperience}
                onChange={(e) => update({ yearsExperience: e.target.value.replace(/[^\d]/g, "").slice(0, 2) })}
                disabled={!canEdit}
                aria-invalid={!!fieldErrors.years}
                placeholder="e.g. 8"
                className={FIELD}
              />
            </Field>
            <Field id="dp-base" label="Base location" optional error={fieldErrors.base} hint="The town or area you usually start from.">
              <input
                id="dp-base"
                name="base_location"
                autoComplete="off"
                value={form.baseLocation}
                onChange={(e) => update({ baseLocation: e.target.value })}
                disabled={!canEdit}
                aria-invalid={!!fieldErrors.base}
                maxLength={255}
                placeholder="e.g. Negombo"
                className={FIELD}
              />
            </Field>
          </div>
        </Card>

        <Card title="Payout details" hint="Where we send your earnings. Our team checks these against your documents before saving them.">
          <Field id="dp-holder" label="Account holder name" optional error={fieldErrors.holder}>
            <input
              id="dp-holder"
              name="bank_account_holder"
              autoComplete="off"
              value={form.accountHolder}
              onChange={(e) => update({ accountHolder: e.target.value })}
              disabled={!canEdit}
              aria-invalid={!!fieldErrors.holder}
              maxLength={150}
              placeholder="As it appears on the account"
              className={FIELD}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="dp-bank" label="Bank name" optional error={fieldErrors.bank}>
              <input
                id="dp-bank"
                name="bank_name"
                autoComplete="off"
                value={form.bankName}
                onChange={(e) => update({ bankName: e.target.value })}
                disabled={!canEdit}
                aria-invalid={!!fieldErrors.bank}
                maxLength={150}
                placeholder="e.g. Commercial Bank"
                className={FIELD}
              />
            </Field>
            <Field id="dp-number" label="Account number" optional error={fieldErrors.number}>
              <input
                id="dp-number"
                name="bank_account_number"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                value={form.accountNumber}
                onChange={(e) => update({ accountNumber: e.target.value })}
                disabled={!canEdit}
                aria-invalid={!!fieldErrors.number}
                maxLength={40}
                placeholder="Digits only, no spaces"
                className={FIELD}
              />
            </Field>
          </div>
          <p className="text-[11px] text-slate-500">Enter all three payout details together, or leave them all blank.</p>
        </Card>

        {submitError && (
          <div role="alert" className="flex items-start gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
            <AlertCircle size={13} className="shrink-0 mt-0.5" aria-hidden /> {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || !canEdit}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2.5 hover:from-blue-600 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/30"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Send size={16} aria-hidden />}
          {submitting
            ? "Sending…"
            : matchesPending
            ? "Already sent for review"
            : changedCount === 0
            ? "Change a detail to send it"
            : pendingChange
            ? "Replace what I sent for review"
            : "Send for review"}
        </button>
      </form>

      <Card title="Account details" hint="These can't be changed here. Contact support if something is wrong.">
        <ReadOnlyRow label="Name" value={profile.full_name} />
        <ReadOnlyRow label="Email" value={profile.email} />
        <ReadOnlyRow label="Phone" value={profile.phone} />
        <ReadOnlyRow label="NIC" value={profile.nic_number} />
        <ReadOnlyRow label="Vehicle" value={`${profile.vehicle_make} ${profile.vehicle_model}`.trim()} />
        <ReadOnlyRow label="Plate number" value={profile.vehicle_plate_number} />
        <ReadOnlyRow label="Seats" value={profile.seats} />
      </Card>
    </div>
  );
}

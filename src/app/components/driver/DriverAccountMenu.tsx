import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { LogOut, UserCog } from "lucide-react";
import { UserAvatar } from "../shared/UserAvatar";

/**
 * The driver's avatar in the top corner of the mobile header. Tapping it opens a small menu with a link to the
 * profile details and a log out button.
 */
export function DriverAccountMenu({
  name,
  email,
  avatarUrl,
  onLogout,
}: {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 touch-manipulation"
      >
        <UserAvatar name={name} src={avatarUrl} size={32} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-[#070E1D] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-white text-sm font-semibold truncate">{name || "Driver"}</p>
            {email && <p className="text-slate-500 text-[11px] truncate">{email}</p>}
          </div>
          <div className="p-1.5">
            <Link
              to="/driver/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-200 hover:bg-white/[0.05] focus-visible:bg-white/[0.05] focus-visible:outline-none"
            >
              <UserCog size={16} className="text-slate-400" aria-hidden />
              Profile details
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-300 hover:bg-red-500/10 focus-visible:bg-red-500/10 focus-visible:outline-none"
            >
              <LogOut size={16} aria-hidden />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

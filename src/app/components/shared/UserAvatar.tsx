import { useEffect, useState } from "react";

function initialsOf(name?: string | null) {
  const words = (name || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "DR";
  return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * A person's photo as a circle, falling back to their initials when there is no (approved) photo or it fails to load.
 */
export function UserAvatar({
  name,
  src,
  size = 36,
  className = "",
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  const box = { width: size, height: size, minWidth: size };

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        style={box}
        className={`rounded-full object-cover bg-slate-800 ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{ ...box, fontSize: Math.max(10, Math.round(size * 0.36)) }}
      className={`rounded-full bg-blue-900/60 border border-blue-700/40 text-blue-200 font-bold flex items-center justify-center select-none ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, CheckCircle2, Clock, FlipHorizontal2, ImagePlus, Loader2, ShieldAlert } from "lucide-react";
import {
  MyDriverProfile,
  announceDriverProfileUpdated,
  uploadMyAvatar,
  withdrawMyAvatar,
} from "../api/driverProfileApi";
import { UserAvatar } from "../shared/UserAvatar";

const OUTPUT_SIZE = 512;
const MAX_INPUT_BYTES = 20 * 1024 * 1024;

/**
 * Centre-crop to a square and shrink, so uploads are small and every photo has the same shape.
 *
 * The photo is decoded through an <img> element, which is exactly how the browser (and the phone's own gallery) shows
 * it: the camera's rotation/mirror information is applied once and nothing else is flipped. `mirror` is only ever set
 * when the driver taps Flip.
 */
async function toSquareJpeg(file: File, mirror: boolean): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();

    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const side = Math.min(width, height);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("no canvas");
    if (mirror) {
      context.translate(OUTPUT_SIZE, 0);
      context.scale(-1, 1);
    }
    context.drawImage(image, (width - side) / 2, (height - side) / 2, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("no blob"))), "image/jpeg", 0.85)
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * The driver's profile photo: take one with the camera or pick one from the gallery, check the preview, and send it.
 * Our team approves a photo before it is shown anywhere.
 */
export function ProfilePhotoCard({
  profile,
  onChanged,
}: {
  profile: MyDriverProfile;
  /** Reload the profile after a photo is sent or withdrawn. */
  onChanged: () => Promise<void> | void;
}) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [prepared, setPrepared] = useState<{ blob: Blob; previewUrl: string; source: File; mirrored: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => () => {
    if (prepared) URL.revokeObjectURL(prepared.previewUrl);
  }, [prepared]);

  const submission = profile.latest_avatar_submission;
  const pending = submission?.status === "pending" ? submission : null;
  const rejected = submission?.status === "rejected" ? submission : null;
  const canEdit = profile.status === "pending_review" || profile.status === "approved";

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets the same photo be chosen again
    if (!file) return;
    setError(null);
    setNotice(null);

    if (!file.type.startsWith("image/")) {
      setError("Please choose a photo (JPEG, PNG or WebP).");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError("That photo is too large. Please choose one under 20 MB.");
      return;
    }

    setProcessing(true);
    try {
      const blob = await toSquareJpeg(file, false);
      setPrepared({ blob, previewUrl: URL.createObjectURL(blob), source: file, mirrored: false });
    } catch {
      setError("We couldn't read that photo. Please try a JPEG or PNG.");
    } finally {
      setProcessing(false);
    }
  };

  // Mirror the photo left to right, for a camera that saves selfies the other way round from how they looked.
  const flip = async () => {
    if (!prepared) return;
    setProcessing(true);
    setError(null);
    try {
      const mirrored = !prepared.mirrored;
      const blob = await toSquareJpeg(prepared.source, mirrored);
      setPrepared({ blob, previewUrl: URL.createObjectURL(blob), source: prepared.source, mirrored });
    } catch {
      setError("We couldn't flip that photo. Please choose it again.");
    } finally {
      setProcessing(false);
    }
  };

  const send = async () => {
    if (!prepared) return;
    setUploading(true);
    setError(null);
    try {
      await uploadMyAvatar(prepared.blob);
      setPrepared(null);
      setNotice("Photo sent for review. We'll show it once our team has approved it.");
      await onChanged();
      announceDriverProfileUpdated();
    } catch (err: any) {
      setError(err.message || "We couldn't send your photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const withdraw = async () => {
    setWithdrawing(true);
    setError(null);
    try {
      await withdrawMyAvatar();
      setNotice("Your photo was withdrawn.");
      await onChanged();
      announceDriverProfileUpdated();
    } catch (err: any) {
      setError(err.message || "We couldn't withdraw your photo.");
    } finally {
      setWithdrawing(false);
    }
  };

  const shownUrl = prepared?.previewUrl ?? profile.avatar_url ?? null;

  return (
    <section aria-labelledby="photo-title" className="rounded-2xl bg-[#070E1D] border border-white/[0.06] overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-white/[0.06]">
        <h2 id="photo-title" className="text-white font-bold text-sm">Profile photo</h2>
        <p className="text-slate-500 text-xs mt-0.5">A clear photo of your face helps customers recognise you. Our team approves it before it is shown.</p>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="flex items-center gap-4">
          <UserAvatar name={profile.full_name} src={shownUrl} size={96} />
          <div className="flex-1 min-w-0 space-y-2">
            {prepared ? (
              <>
                <p className="text-slate-300 text-xs">This is how your photo will look. If it looks the wrong way round, tap Flip.</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={send}
                    disabled={uploading}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60"
                  >
                    {uploading && <Loader2 size={13} className="animate-spin" aria-hidden />}
                    {uploading ? "Sending…" : "Use this photo"}
                  </button>
                  <button
                    type="button"
                    onClick={flip}
                    disabled={uploading || processing}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <FlipHorizontal2 size={13} aria-hidden />
                    Flip
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrepared(null)}
                    disabled={uploading}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs font-semibold"
                  >
                    Choose another
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => cameraInput.current?.click()}
                  disabled={!canEdit || processing}
                  className="px-4 py-2.5 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {processing ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Camera size={14} aria-hidden />}
                  Take photo
                </button>
                <button
                  type="button"
                  onClick={() => galleryInput.current?.click()}
                  disabled={!canEdit || processing}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <ImagePlus size={14} aria-hidden />
                  Choose from gallery
                </button>
              </div>
            )}
          </div>
        </div>

        {/* "capture" opens the camera on phones; the second input opens the gallery or file picker. */}
        <input ref={cameraInput} type="file" accept="image/*" capture="user" onChange={handleFile} className="hidden" aria-label="Take a photo with the camera" />
        <input ref={galleryInput} type="file" accept="image/jpeg,image/png,image/webp,image/*" onChange={handleFile} className="hidden" aria-label="Choose a photo from your gallery" />

        {error && (
          <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
            <AlertCircle size={13} className="shrink-0 mt-0.5" aria-hidden /> {error}
          </div>
        )}
        {notice && !error && (
          <div role="status" className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs">
            <CheckCircle2 size={13} className="shrink-0 mt-0.5" aria-hidden /> {notice}
          </div>
        )}

        {pending && !prepared && (
          <div className="rounded-xl bg-amber-500/[0.07] border border-amber-500/25 p-3.5 flex items-center gap-3">
            <img src={pending.image_url} alt="The photo you sent for review" width={48} height={48} className="w-12 h-12 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-amber-200 text-xs font-semibold flex items-center gap-1.5">
                <Clock size={12} aria-hidden /> Waiting for review
              </p>
              <p className="text-amber-200/70 text-[11px]">
                {profile.avatar_url ? "Your current photo stays until this one is approved." : "It will show once our team approves it."}
              </p>
            </div>
            <button type="button" onClick={withdraw} disabled={withdrawing} className="text-xs font-semibold text-amber-300 underline underline-offset-2 disabled:opacity-60 shrink-0">
              {withdrawing ? "Withdrawing…" : "Withdraw"}
            </button>
          </div>
        )}

        {rejected && !pending && !prepared && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl bg-red-500/[0.07] border border-red-500/25 p-3.5">
            <ShieldAlert size={14} className="text-red-400 mt-0.5 shrink-0" aria-hidden />
            <div>
              <p className="text-red-300 text-xs font-semibold">Your last photo wasn't approved</p>
              <p className="text-red-200/80 text-[11px] whitespace-pre-line">{rejected.rejection_reason}</p>
              <p className="text-slate-500 text-[11px] mt-1">Take or choose a new photo above.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

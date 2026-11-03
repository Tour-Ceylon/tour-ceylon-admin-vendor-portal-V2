import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { uploadStayImages } from "../api/stayVendorApi";

export const MAX_ROOM_PHOTOS = 10;
const MAX_EDGE_PX = 1600;

/** Shrinks a large photo to a JPEG file before upload, so uploads stay quick. Small photos pass through unchanged. */
async function prepareImage(file: File): Promise<File> {
  try {
    const url = URL.createObjectURL(file);
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("decode"));
      element.src = url;
    });
    URL.revokeObjectURL(url);
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(image.width, image.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

/** Photos of one room type. The first photo is the cover shown on the room card. */
export function RoomPhotosField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (images.length !== files.length) setError("Only image files can be added.");
    const room = MAX_ROOM_PHOTOS - value.length;
    if (images.length > room) setError(`A room can have up to ${MAX_ROOM_PHOTOS} photos.`);
    setUploading(true);
    try {
      const prepared = await Promise.all(images.slice(0, Math.max(0, room)).map(prepareImage));
      if (prepared.length) {
        // Uploaded now; only the returned URLs go into the form and the save request.
        const uploaded = await uploadStayImages(prepared);
        onChange([...value, ...uploaded.map((image) => image.url)]);
      }
    } catch (err) {
      setError(err instanceof Error && err.message ? `Photos were not added: ${err.message}` : "Photos were not added. Please try again.");
    } finally {
      setUploading(false);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  const makeCover = (index: number) => onChange([value[index], ...value.filter((_, i) => i !== index)]);
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((url, index) => (
          <div key={`${index}-${url.slice(-24)}`} className="relative" style={{ width: 132 }}>
            <img
              src={url}
              alt={`Room photo ${index + 1}`}
              style={{ width: 132, height: 88, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border-light)" }}
            />
            {index === 0 && (
              <span
                className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px]"
                style={{ background: "var(--accent-navy)", color: "white", fontWeight: 700 }}
              >
                Cover
              </span>
            )}
            <div className="absolute top-1.5 right-1.5 flex gap-1">
              {index !== 0 && (
                <button
                  type="button"
                  aria-label="Make cover photo"
                  title="Make cover photo"
                  onClick={() => makeCover(index)}
                  className="p-1"
                  style={{ background: "rgba(0,0,0,0.55)", borderRadius: 6 }}
                >
                  <Star size={12} color="white" />
                </button>
              )}
              <button
                type="button"
                aria-label="Remove photo"
                title="Remove photo"
                onClick={() => remove(index)}
                className="p-1"
                style={{ background: "rgba(0,0,0,0.55)", borderRadius: 6 }}
              >
                <Trash2 size={12} color="white" />
              </button>
            </div>
          </div>
        ))}

        {value.length < MAX_ROOM_PHOTOS && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1 text-[12px]"
            style={{
              width: 132,
              height: 88,
              borderRadius: 10,
              border: "1px dashed var(--border-light)",
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
            }}
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            {uploading ? "Uploading…" : "Add photos"}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />
      <p className="text-[11px] mt-2" style={{ color: error ? "#ef4444" : "var(--text-tertiary)" }}>
        {error ?? `Up to ${MAX_ROOM_PHOTOS} photos. The first one is the cover shown to guests; use the star to change it.`}
      </p>
    </div>
  );
}

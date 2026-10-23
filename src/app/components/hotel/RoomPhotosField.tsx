import { useRef, useState } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";

export const MAX_ROOM_PHOTOS = 10;
const MAX_EDGE_PX = 1600;

/** Reads a picked file as a JPEG/PNG data URL, shrinking large photos so the save request stays small. */
async function fileToDataUrl(file: File): Promise<string> {
  const original = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("decode"));
      element.src = original;
    });
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(image.width, image.height));
    if (scale === 1 && file.size < 1_500_000) return original;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return original;
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

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (images.length !== files.length) setError("Only image files can be added.");
    const room = MAX_ROOM_PHOTOS - value.length;
    if (images.length > room) setError(`A room can have up to ${MAX_ROOM_PHOTOS} photos.`);
    try {
      const added = await Promise.all(images.slice(0, Math.max(0, room)).map(fileToDataUrl));
      if (added.length) onChange([...value, ...added]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "A photo could not be read.");
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
            <ImagePlus size={18} />
            Add photos
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

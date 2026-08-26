import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Category = "Stay" | "Tour" | "Safari" | "Experience" | "Transfer";

export interface PricingVariant {
  id: string;
  name: string;
  unit: string;
  minCapacity: string;
  maxCapacity: string;
  price: string;
  currency: string;
  priority: number;
  isDefault: boolean;
}

type DraftState = {
  category: Category | null;
  subcategory?: string | null;
  title: string;
  active: boolean;
  description: string;
  destination: string;
  lat: string;
  lng: string;
  variants: PricingVariant[];
  categoryData?: Record<string, any>;
  setDraft: (d: Partial<DraftState>) => void;
  clearDraft: () => void;
};

const customStorage = {
  getItem: (name: string) => {
    try {
      const str = localStorage.getItem(name);
      return str ? JSON.parse(str) : null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: any) => {
    try {
      const clone = JSON.parse(JSON.stringify(value));
      if (clone?.state?.categoryData?.images) {
        const imgs = clone.state.categoryData.images;
        if (imgs.cover && typeof imgs.cover === "string" && imgs.cover.startsWith("data:")) {
          imgs.cover = "";
        }
        if (Array.isArray(imgs.gallery)) {
          imgs.gallery = imgs.gallery.map((g: any) => {
            if (typeof g === "string" && g.startsWith("data:")) return "";
            if (g && typeof g === "object" && typeof g.url === "string" && g.url.startsWith("data:")) {
              return { ...g, url: "" };
            }
            return g;
          });
        }
      }
      localStorage.setItem(name, JSON.stringify(clone));
    } catch (e) {
      console.warn("localStorage quota exceeded or write failed; draft kept in memory.", e);
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch {}
  },
};

export const useListingDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      category: null,
      subcategory: null,
      title: "",
      active: true,
      description: "",
      destination: "",
      lat: "",
      lng: "",
      variants: [],
      categoryData: {},
      setDraft: (d: Partial<DraftState>) => set((s) => ({ ...s, ...d })),
      clearDraft: () => {
        try {
          localStorage.removeItem("listing-create-draft");
        } catch {}
        set(() => ({
          category: null,
          subcategory: null,
          title: "",
          active: true,
          description: "",
          destination: "",
          lat: "",
          lng: "",
          variants: [],
          categoryData: {},
        }));
      },
    }),
    {
      name: "listing-create-draft",
      storage: createJSONStorage(() => customStorage),
    },
  ),
);

export default useListingDraftStore;

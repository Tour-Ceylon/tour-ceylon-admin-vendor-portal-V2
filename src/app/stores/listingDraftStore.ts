import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      clearDraft: () =>
        {
          localStorage.removeItem("listing-create-draft");
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
    { name: "listing-create-draft" },
  ),
);

export default useListingDraftStore;

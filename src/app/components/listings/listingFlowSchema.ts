import type { Category } from "../../stores/listingDraftStore";

export type CategoryIconKey =
  | "stay"
  | "tour"
  | "safari"
  | "experience"
  | "transfer";

export interface FlowTreeOption {
  id: string;
  label: string;
  summary: string;
}

export interface FlowTreeBranch {
  id: string;
  label: string;
  summary: string;
  options: FlowTreeOption[];
}

export interface ListingFlowDefinition {
  id: Category;
  label: string;
  iconKey: CategoryIconKey;
  summary: string;
  details: string;
  flow: string;
  step2Layout: "core-details" | "tree-selector";
  detailsComponentKey: "stay" | "tour" | "safari" | "experience" | "transfer";
  reusableSections: (
    | "basic"
    | "destination"
    | "media"
    | "pricing"
    | "policies"
  )[];
  treeSelection?: {
    title: string;
    helperText: string;
    branches: FlowTreeBranch[];
  };
  step3MultiSelect?: {
    title: string;
    helperText: string;
    options: string[];
  };
}

export const CATEGORY_ORDER: Category[] = [
  "Stay",
  "Tour",
  "Safari",
  "Experience",
  "Transfer",
];

export const LISTING_FLOW_SCHEMA: Record<Category, ListingFlowDefinition> = {
  Stay: {
    id: "Stay",
    label: "Stay",
    iconKey: "stay",
    summary: "Hotels, villas, resorts, and overnight stays.",
    details:
      "Use this flow for room inventories, property settings, meal plans, and guest policies.",
    flow: "Property setup, room rates, guest rules",
    step2Layout: "tree-selector",
    detailsComponentKey: "stay",
    reusableSections: ["media", "pricing", "policies"],
    treeSelection: {
      title: "Select Stay Type",
      helperText:
        "Choose a branch and subtype. This tree drives the rest of the form flow.",
      branches: [
        {
          id: "homes",
          label: "Homes",
          summary: "Private stays in houses, apartments, and homestays.",
          options: [
            {
              id: "apartment",
              label: "Apartment",
              summary: "Self-contained units in buildings or complexes.",
            },
            {
              id: "home",
              label: "Home",
              summary: "Entire houses and private homes.",
            },
            {
              id: "guesthouse",
              label: "Guesthouse",
              summary: "Family-run homes with hosted stays.",
            },
            {
              id: "villa",
              label: "Villa",
              summary: "Premium private properties.",
            },
          ],
        },
        {
          id: "hotels-and-more",
          label: "Hotel, B&B & More",
          summary: "Hospitality properties with rooms and services.",
          options: [
            {
              id: "hotel",
              label: "Hotel",
              summary: "Full-service hotel properties.",
            },
            {
              id: "guesthouse",
              label: "Guesthouse",
              summary: "Smaller lodging with essential guest services.",
            },
            {
              id: "bed-breakfast",
              label: "Bed and Breakfast",
              summary: "Hosted stays with breakfast.",
            },
            {
              id: "homestay",
              label: "Homestay",
              summary: "Hosted accommodation in a local home.",
            },
            {
              id: "hostel",
              label: "Hostel",
              summary: "Budget-friendly shared or private room stays.",
            },
            {
              id: "condo-hotel",
              label: "Condo Hotel",
              summary: "Apartment-style units with hotel-style services.",
            },
            {
              id: "capsule-hotel",
              label: "Capsule Hotel",
              summary: "Compact sleeping pods with shared amenities.",
            },
            {
              id: "country-house",
              label: "Country House",
              summary: "Rural lodging with a homely atmosphere.",
            },
            {
              id: "farm-stay",
              label: "Farm Stay",
              summary: "Accommodation on a working farm or estate.",
            },
            {
              id: "inn",
              label: "Inn",
              summary:
                "Small traditional lodging, often roadside or town-based.",
            },
            {
              id: "love-hotel",
              label: "Love Hotel",
              summary: "Short-stay themed private accommodation.",
            },
            {
              id: "motel",
              label: "Motel",
              summary: "Roadside lodging with direct parking access.",
            },
            {
              id: "resort",
              label: "Resort",
              summary: "Leisure-focused larger properties.",
            },
            {
              id: "riad",
              label: "Riad",
              summary: "Traditional courtyard house accommodation.",
            },
            {
              id: "ryokan",
              label: "Ryokan",
              summary: "Traditional Japanese-style inn experience.",
            },
            {
              id: "lodge",
              label: "Lodge",
              summary: "Nature-oriented or rural accommodation property.",
            },
          ],
        },
        {
          id: "alternative-places",
          label: "Alternative Places",
          summary: "Unique or non-standard accommodation types.",
          options: [
            {
              id: "campground",
              label: "Campground",
              summary: "Outdoor campsite listings.",
            },
            {
              id: "boat",
              label: "Boat",
              summary: "Overnight boat or houseboat stays.",
            },
            {
              id: "luxury-tent",
              label: "Luxury Tent",
              summary: "Glamping and premium tent stays.",
            },
          ],
        },
      ],
    },
    step3MultiSelect: {
      title: "Select Property Features",
      helperText: "Choose all amenities that apply to this stay listing.",
      options: [
        "Bar",
        "Sauna",
        "Garden",
        "Terrace",
        "Hot tub/Jacuzzi",
        "Heating",
        "Free WiFi",
        "Air conditioning",
        "Swimming pool",
      ],
    },
  },
  Tour: {
    id: "Tour",
    label: "Tour",
    iconKey: "tour",
    summary: "Guided sightseeing itineraries and day tours.",
    details:
      "Use this flow for route planning, inclusions, languages, and itinerary steps.",
    flow: "Route summary, inclusions, schedule",
    step2Layout: "core-details",
    detailsComponentKey: "tour",
    reusableSections: ["basic", "destination", "media", "pricing", "policies"],
  },
  Safari: {
    id: "Safari",
    label: "Safari",
    iconKey: "safari",
    summary: "Park visits, wildlife experiences, and jeep safaris.",
    details:
      "Built for wildlife highlights, seasonality, guides, and pickup notes.",
    flow: "Wildlife highlights, timings, park rules",
    step2Layout: "core-details",
    detailsComponentKey: "safari",
    reusableSections: ["basic", "destination", "media", "pricing", "policies"],
  },
  Experience: {
    id: "Experience",
    label: "Experience",
    iconKey: "experience",
    summary: "Local activities, workshops, and short experiences.",
    details:
      "Ideal for activity details, audience fit, and flexible booking rules.",
    flow: "Activity setup, highlights, restrictions",
    step2Layout: "core-details",
    detailsComponentKey: "experience",
    reusableSections: ["basic", "destination", "media", "pricing", "policies"],
  },
  Transfer: {
    id: "Transfer",
    label: "Transfer",
    iconKey: "transfer",
    summary: "Airport, hotel, and custom-location transfers.",
    details:
      "Use for vehicle types, operating hours, pickup instructions, and waiting policies.",
    flow: "Vehicle setup, pickup rules, route notes",
    step2Layout: "core-details",
    detailsComponentKey: "transfer",
    reusableSections: ["basic", "destination", "media", "pricing", "policies"],
  },
};

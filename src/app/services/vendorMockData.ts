// Centralized mock data service for vendor-specific data
// This will be replaced with real API calls when backend is ready

export interface VendorKPI {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: string;
}

export interface VendorBooking {
  id: string;
  vendorId: string;
  bookingRef: string;
  customer: string;
  customerEmail: string;
  listing: string;
  listingId: string;
  date: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  amount: string;
  urgent?: boolean;
}

export interface VendorListing {
  id: string;
  vendorId: string;
  title: string;
  location: string;
  category: "Stay" | "Tour" | "Safari" | "Experience" | "Transfer";
  destination: string;
  media: number;
  variants: number;
  status: "active" | "draft" | "pending_review" | "needs_changes" | "approved" | "rejected" | "archived";
  views: number;
  bookings: number;
  lastUpdated: string;
  color: string;
  createdDate: string;
  revenue: number;
}

export interface VendorReview {
  id: string;
  vendorId: string;
  customer: string;
  listing: string;
  listingId: string;
  rating: number;
  comment: string;
  date: string;
  responded: boolean;
}

export interface VendorTask {
  id: string;
  vendorId: string;
  type: "review_response" | "availability_update" | "booking_confirm" | "listing_complete" | "payout_review";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  actionUrl: string;
}

export interface PricingTier {
  id: string;
  vendorId: string;
  listingId: string;
  name: string;
  basePrice: number;
  currency: string;
  capacity: number;
  description: string;
  active: boolean;
}

export interface AvailabilitySlot {
  id: string;
  vendorId: string;
  listingId: string;
  date: string;
  available: boolean;
  capacity: number;
  booked: number;
  price?: number;
}

export interface VendorRevenue {
  thisMonth: number;
  lastMonth: number;
  pendingPayout: number;
  currency: string;
}

class VendorMockDataService {
  // Define mock vendor IDs for different vendor types
  private readonly VENDOR_IDS = {
    SAFARI_VENDOR: "vendor_safari_001",
    TOUR_VENDOR: "vendor_tour_001", 
    STAY_VENDOR: "vendor_stay_001",
    EXPERIENCE_VENDOR: "vendor_exp_001",
    TRANSFER_VENDOR: "vendor_transfer_001",
    ADMIN: "admin_001"
  };

  // Get vendor-specific KPIs based on vendorId
  getVendorKPIs(vendorId?: string): VendorKPI[] {
    // For now, return static KPIs but these would be calculated based on vendor's actual data
    return [
      {
        label: "Active Listings",
        value: 8,
        change: "+2 this month",
        trend: "up",
        icon: "layers"
      },
      {
        label: "Pending Bookings",
        value: 5,
        change: "Awaiting response",
        trend: "neutral",
        icon: "clock"
      },
      {
        label: "Upcoming Bookings",
        value: 12,
        change: "Next 7 days",
        trend: "up",
        icon: "calendar"
      },
      {
        label: "Monthly Revenue",
        value: "$8,450",
        change: "+24% vs last month",
        trend: "up",
        icon: "dollar-sign"
      },
      {
        label: "Average Rating",
        value: "4.8",
        change: "Based on 89 reviews",
        trend: "up",
        icon: "star"
      },
      {
        label: "Listing Views",
        value: "1,247",
        change: "+18% this month",
        trend: "up",
        icon: "eye"
      }
    ];
  }

  // Get vendor-specific tasks
  getVendorTasks(vendorId?: string): VendorTask[] {
    const allTasks: VendorTask[] = [
      {
        id: "1",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        type: "review_response",
        title: "Respond to 3 new reviews",
        description: "Customer reviews waiting for your response",
        priority: "high",
        actionUrl: "/vendor/reviews"
      },
      {
        id: "2",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        type: "booking_confirm",
        title: "Confirm 2 booking requests",
        description: "New booking requests need confirmation",
        priority: "high",
        dueDate: "Today",
        actionUrl: "/vendor/bookings"
      },
      {
        id: "3",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        type: "availability_update",
        title: "Update May availability",
        description: "Calendar has gaps that need attention",
        priority: "medium",
        actionUrl: "/vendor/availability"
      },
      {
        id: "4",
        vendorId: this.VENDOR_IDS.TOUR_VENDOR,
        type: "listing_complete",
        title: "Complete Sigiriya tour listing",
        description: "Missing photos and description",
        priority: "medium",
        actionUrl: "/listings/lst_004/edit"
      },
      {
        id: "5",
        vendorId: this.VENDOR_IDS.STAY_VENDOR,
        type: "payout_review",
        title: "Review pending payout",
        description: "$2,150 ready for payout on May 25",
        priority: "low",
        actionUrl: "/vendor/revenue"
      }
    ];

    // Filter by vendorId if provided
    if (vendorId) {
      return allTasks.filter(task => task.vendorId === vendorId);
    }
    return allTasks;
  }

  // Get vendor-specific bookings
  getRecentBookings(vendorId?: string): VendorBooking[] {
    const allBookings: VendorBooking[] = [
      {
        id: "1",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        bookingRef: "BKG-2026-0547",
        customer: "John Smith",
        customerEmail: "john.smith@email.com",
        listing: "Yala National Park Safari",
        listingId: "lst_001",
        date: "May 25, 2026",
        status: "pending",
        amount: "$340",
        urgent: true
      },
      {
        id: "2",
        vendorId: this.VENDOR_IDS.TOUR_VENDOR,
        bookingRef: "BKG-2026-0548",
        customer: "Emma Wilson",
        customerEmail: "emma.w@email.com",
        listing: "Galle Fort Heritage Walk",
        listingId: "lst_003",
        date: "May 24, 2026",
        status: "confirmed",
        amount: "$85"
      },
      {
        id: "3",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        bookingRef: "BKG-2026-0549",
        customer: "Michael Brown",
        customerEmail: "m.brown@email.com",
        listing: "Minneriya Wildlife Safari",
        listingId: "lst_002",
        date: "May 26, 2026",
        status: "confirmed",
        amount: "$170"
      },
      {
        id: "4",
        vendorId: this.VENDOR_IDS.TOUR_VENDOR,
        bookingRef: "BKG-2026-0550",
        customer: "Sarah Johnson",
        customerEmail: "sarah.j@email.com",
        listing: "Sigiriya Rock Fortress Tour",
        listingId: "lst_004",
        date: "May 28, 2026",
        status: "completed",
        amount: "$120"
      },
      {
        id: "5",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        bookingRef: "BKG-2026-0545",
        customer: "David Lee",
        customerEmail: "david.lee@email.com",
        listing: "Yala National Park Safari",
        listingId: "lst_001",
        date: "May 22, 2026",
        status: "cancelled",
        amount: "$340"
      }
    ];

    // Filter by vendorId if provided
    if (vendorId) {
      return allBookings.filter(booking => booking.vendorId === vendorId);
    }
    return allBookings;
  }

  // Get vendor-specific listings
  getVendorListings(vendorId?: string): VendorListing[] {
    const allListings: VendorListing[] = [
      {
        id: "lst_001",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        title: "Yala National Park Safari",
        location: "Yala, Southern Province",
        category: "Safari",
        destination: "Yala, Sri Lanka",
        media: 24,
        variants: 3,
        status: "approved",
        views: 342,
        bookings: 18,
        lastUpdated: "2 hours ago",
        color: "#059669",
        createdDate: "2026-04-15",
        revenue: 3060
      },
      {
        id: "lst_002",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        title: "Minneriya Wildlife Safari",
        location: "Minneriya, North Central",
        category: "Safari",
        destination: "Minneriya, Sri Lanka",
        media: 18,
        variants: 2,
        status: "approved",
        views: 256,
        bookings: 12,
        lastUpdated: "1 day ago",
        color: "#059669",
        createdDate: "2026-04-10",
        revenue: 2040
      },
      {
        id: "lst_003",
        vendorId: this.VENDOR_IDS.TOUR_VENDOR,
        title: "Galle Fort Heritage Walk",
        location: "Galle, Southern Province",
        category: "Tour",
        destination: "Galle, Sri Lanka",
        media: 15,
        variants: 2,
        status: "approved",
        views: 189,
        bookings: 8,
        lastUpdated: "3 days ago",
        color: "#0891b2",
        createdDate: "2026-04-08",
        revenue: 680
      },
      {
        id: "lst_004",
        vendorId: this.VENDOR_IDS.TOUR_VENDOR,
        title: "Sigiriya Rock Fortress Tour",
        location: "Sigiriya, Central Province",
        category: "Tour",
        destination: "Sigiriya, Sri Lanka",
        media: 8,
        variants: 1,
        status: "draft",
        views: 0,
        bookings: 0,
        lastUpdated: "1 week ago",
        color: "#0891b2",
        createdDate: "2026-05-10",
        revenue: 0
      },
      {
        id: "lst_005",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        title: "Kaudulla National Park Safari",
        location: "Kaudulla, North Central",
        category: "Safari",
        destination: "Kaudulla, Sri Lanka",
        media: 12,
        variants: 2,
        status: "pending_review",
        views: 0,
        bookings: 0,
        lastUpdated: "2 days ago",
        color: "#059669",
        createdDate: "2026-05-16",
        revenue: 0
      },
      {
        id: "lst_006",
        vendorId: this.VENDOR_IDS.EXPERIENCE_VENDOR,
        title: "Colombo City Experience",
        location: "Colombo, Western Province",
        category: "Experience",
        destination: "Colombo, Sri Lanka",
        media: 6,
        variants: 1,
        status: "needs_changes",
        views: 45,
        bookings: 0,
        lastUpdated: "5 days ago",
        color: "#d97706",
        createdDate: "2026-05-08",
        revenue: 0
      },
      {
        id: "lst_007",
        vendorId: this.VENDOR_IDS.STAY_VENDOR,
        title: "Jetwing Yala Resort",
        location: "Yala, Southern Province",
        category: "Stay",
        destination: "Yala, Sri Lanka",
        media: 32,
        variants: 8,
        status: "approved",
        views: 428,
        bookings: 24,
        lastUpdated: "4 hours ago",
        color: "#2563eb",
        createdDate: "2026-03-20",
        revenue: 4800
      },
      {
        id: "lst_008",
        vendorId: this.VENDOR_IDS.STAY_VENDOR,
        title: "Galle Fort Boutique Hotel",
        location: "Galle, Southern Province",
        category: "Stay",
        destination: "Galle, Sri Lanka",
        media: 28,
        variants: 6,
        status: "approved",
        views: 312,
        bookings: 16,
        lastUpdated: "1 day ago",
        color: "#2563eb",
        createdDate: "2026-03-25",
        revenue: 3200
      },
      {
        id: "lst_009",
        vendorId: this.VENDOR_IDS.STAY_VENDOR,
        title: "Nuwara Eliya Tea Estate Stay",
        location: "Nuwara Eliya, Central Province",
        category: "Stay",
        destination: "Nuwara Eliya, Sri Lanka",
        media: 22,
        variants: 4,
        status: "draft",
        views: 0,
        bookings: 0,
        lastUpdated: "3 days ago",
        color: "#2563eb",
        createdDate: "2026-05-12",
        revenue: 0
      },
      {
        id: "lst_010",
        vendorId: this.VENDOR_IDS.TRANSFER_VENDOR,
        title: "CMB Airport Luxury Transfer",
        location: "Katunayake, Western Province",
        category: "Transfer",
        destination: "Colombo, Sri Lanka",
        media: 8,
        variants: 4,
        status: "approved",
        views: 156,
        bookings: 22,
        lastUpdated: "6 hours ago",
        color: "#64748b",
        createdDate: "2026-04-01",
        revenue: 1320
      },
      {
        id: "lst_011",
        vendorId: this.VENDOR_IDS.EXPERIENCE_VENDOR,
        title: "Kandy Cultural Experience",
        location: "Kandy, Central Province",
        category: "Experience",
        destination: "Kandy, Sri Lanka",
        media: 14,
        variants: 2,
        status: "rejected",
        views: 23,
        bookings: 0,
        lastUpdated: "1 week ago",
        color: "#d97706",
        createdDate: "2026-04-28",
        revenue: 0
      },
      {
        id: "lst_012",
        vendorId: this.VENDOR_IDS.TOUR_VENDOR,
        title: "Ella Nine Arch Bridge Tour",
        location: "Ella, Uva Province",
        category: "Tour",
        destination: "Ella, Sri Lanka",
        media: 16,
        variants: 1,
        status: "archived",
        views: 89,
        bookings: 3,
        lastUpdated: "2 weeks ago",
        color: "#0891b2",
        createdDate: "2026-02-15",
        revenue: 255
      }
    ];

    // Filter by vendorId if provided
    if (vendorId) {
      return allListings.filter(listing => listing.vendorId === vendorId);
    }
    return allListings;
  }

  // Get vendor-specific reviews
  getRecentReviews(vendorId?: string): VendorReview[] {
    const allReviews: VendorReview[] = [
      {
        id: "1",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        customer: "Sarah Johnson",
        listing: "Yala National Park Safari",
        listingId: "lst_001",
        rating: 5,
        comment: "Amazing experience! Our guide was knowledgeable and we saw so many animals including leopards.",
        date: "2 hours ago",
        responded: false
      },
      {
        id: "2",
        vendorId: this.VENDOR_IDS.TOUR_VENDOR,
        customer: "Mike Chen",
        listing: "Galle Fort Heritage Walk",
        listingId: "lst_003",
        rating: 4,
        comment: "Great tour with lots of historical insights. Would have loved a bit more time at certain locations.",
        date: "1 day ago",
        responded: false
      },
      {
        id: "3",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        customer: "Emma Wilson",
        listing: "Minneriya Wildlife Safari",
        listingId: "lst_002",
        rating: 5,
        comment: "Best safari of our trip! Saw elephants and beautiful birds. Our guide was fantastic.",
        date: "2 days ago",
        responded: true
      }
    ];

    // Filter by vendorId if provided
    if (vendorId) {
      return allReviews.filter(review => review.vendorId === vendorId);
    }
    return allReviews;
  }

  // Get vendor-specific revenue data
  getVendorRevenue(vendorId?: string): VendorRevenue {
    // For now, return static revenue but this would be calculated based on vendor's actual data
    return {
      thisMonth: 8450,
      lastMonth: 6800,
      pendingPayout: 2150,
      currency: "USD"
    };
  }

  // Additional methods for pricing and availability data
  getPricingTiers(vendorId?: string, listingId?: string): PricingTier[] {
    const allPricingTiers: PricingTier[] = [
      {
        id: "price_001",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        listingId: "lst_001",
        name: "Standard Safari",
        basePrice: 120,
        currency: "USD",
        capacity: 6,
        description: "Half-day safari with experienced guide",
        active: true
      },
      {
        id: "price_002",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        listingId: "lst_001",
        name: "Premium Safari",
        basePrice: 180,
        currency: "USD",
        capacity: 4,
        description: "Full-day safari with lunch included",
        active: true
      },
      {
        id: "price_003",
        vendorId: this.VENDOR_IDS.TOUR_VENDOR,
        listingId: "lst_003",
        name: "Group Tour",
        basePrice: 25,
        currency: "USD",
        capacity: 15,
        description: "2-hour walking tour",
        active: true
      }
    ];

    let filtered = allPricingTiers;
    if (vendorId) {
      filtered = filtered.filter(tier => tier.vendorId === vendorId);
    }
    if (listingId) {
      filtered = filtered.filter(tier => tier.listingId === listingId);
    }
    return filtered;
  }

  getAvailabilitySlots(vendorId?: string, listingId?: string): AvailabilitySlot[] {
    const allSlots: AvailabilitySlot[] = [
      {
        id: "slot_001",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        listingId: "lst_001",
        date: "2026-05-25",
        available: true,
        capacity: 6,
        booked: 2,
        price: 120
      },
      {
        id: "slot_002",
        vendorId: this.VENDOR_IDS.SAFARI_VENDOR,
        listingId: "lst_001",
        date: "2026-05-26",
        available: false,
        capacity: 6,
        booked: 6,
        price: 120
      },
      {
        id: "slot_003",
        vendorId: this.VENDOR_IDS.TOUR_VENDOR,
        listingId: "lst_003",
        date: "2026-05-25",
        available: true,
        capacity: 15,
        booked: 8,
        price: 25
      }
    ];

    let filtered = allSlots;
    if (vendorId) {
      filtered = filtered.filter(slot => slot.vendorId === vendorId);
    }
    if (listingId) {
      filtered = filtered.filter(slot => slot.listingId === listingId);
    }
    return filtered;
  }

  // Helper method to get vendor ID constants (for testing/development)
  getVendorIds() {
    return this.VENDOR_IDS;
  }
}

export const vendorMockData = new VendorMockDataService();
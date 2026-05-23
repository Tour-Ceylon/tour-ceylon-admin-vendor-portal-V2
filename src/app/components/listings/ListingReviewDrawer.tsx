import {
  X,
  CheckCircle2,
  AlertTriangle,
  Image,
  DollarSign,
  FileText,
  Shield,
  Building2,
  Compass,
  Globe,
  Anchor,
  Car,
  MapPin,
  Clock,
  Users,
  Calendar,
  CheckSquare,
  XSquare,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

interface ListingData {
  id: string;
  name: string;
  category: "Stay" | "Tour" | "Safari" | "Experience" | "Transfer";
  vendor: string;
  destination: string;
  price: number;
  status: "draft" | "submitted" | "pending_review" | "needs_changes" | "approved" | "rejected" | "archived";
  qualityScore: number;
  thumbnail: string;
  description: string;
  mediaCount: number;
  variants: number;
  submittedDate: string;
  issues: string[];
  // Category-specific fields
  categoryData?: {
    // Stay
    roomTypes?: string[];
    amenities?: string[];
    checkIn?: string;
    checkOut?: string;
    cancellationPolicy?: string;
    // Tour
    duration?: string;
    itinerary?: string[];
    inclusions?: string[];
    // Safari
    parkName?: string;
    vehicleType?: string;
    wildlife?: string[];
    // Experience
    activityType?: string;
    maxParticipants?: number;
    restrictions?: string[];
    // Transfer
    vehicleModel?: string;
    capacity?: number;
    route?: string;
  };
}

interface ListingReviewDrawerProps {
  listing: ListingData;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onRequestChanges: (id: string, feedback: string[]) => void;
}

const CATEGORY_ICONS = {
  Stay: Building2,
  Tour: Compass,
  Safari: Globe,
  Experience: Anchor,
  Transfer: Car,
};

const FEEDBACK_SUGGESTIONS = {
  Stay: [
    "Add more room photos",
    "Specify cancellation policy",
    "Add amenities list",
    "Update pricing details",
    "Add check-in/out times",
  ],
  Tour: [
    "Add detailed itinerary",
    "Specify inclusions/exclusions",
    "Add pickup locations",
    "Update tour duration",
    "Add activity difficulty level",
  ],
  Safari: [
    "Add vehicle details",
    "Specify park information",
    "Add wildlife viewing seasons",
    "Update group size limits",
    "Add safety guidelines",
  ],
  Experience: [
    "Add activity photos",
    "Specify age restrictions",
    "Add equipment details",
    "Update max participants",
    "Add safety requirements",
  ],
  Transfer: [
    "Add vehicle photos",
    "Specify luggage capacity",
    "Add route details",
    "Update pricing tiers",
    "Add driver information",
  ],
};

export function ListingReviewDrawer({
  listing,
  onClose,
  onApprove,
  onReject,
  onRequestChanges,
}: ListingReviewDrawerProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "checklist" | "category" | "timeline">("preview");
  const [reviewChecklist, setReviewChecklist] = useState({
    contentQuality: false,
    imageQuality: false,
    pricingAccuracy: false,
    policyComplete: false,
    safetyCompliance: false,
  });
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);
  const [customFeedback, setCustomFeedback] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  const CategoryIcon = CATEGORY_ICONS[listing.category];

  const handleToggleFeedback = (feedback: string) => {
    setSelectedFeedback((prev) =>
      prev.includes(feedback) ? prev.filter((f) => f !== feedback) : [...prev, feedback]
    );
  };

  const handleRequestChanges = () => {
    const allFeedback = [...selectedFeedback];
    if (customFeedback.trim()) {
      allFeedback.push(customFeedback.trim());
    }
    onRequestChanges(listing.id, allFeedback);
    onClose();
  };

  const handleApprove = () => {
    onApprove(listing.id);
    onClose();
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(listing.id, rejectReason);
      onClose();
    }
  };

  const allChecksPassed = Object.values(reviewChecklist).every((v) => v);

  // Sample timeline events
  const timelineEvents = [
    { type: "created", user: listing.vendor, date: "2024-03-10 09:15", status: "completed" },
    { type: "submitted", user: listing.vendor, date: listing.submittedDate, status: "completed" },
    { type: "under_review", user: "Admin Team", date: "2024-03-15 14:30", status: "completed" },
    { type: "pending_action", user: "You", date: "Now", status: "pending" },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease-out" }}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-[900px] z-50 overflow-y-auto"
        style={{
          background: "var(--bg-main)",
          borderLeft: "1px solid var(--border-light)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
          animation: "slideInRight 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-4"
          style={{
            background: "var(--bg-panel)",
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CategoryIcon size={18} style={{ color: "var(--accent-navy-light)" }} />
                <h2 className="text-[18px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                  {listing.name}
                </h2>
              </div>
              <div className="flex items-center gap-3 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {listing.destination}
                </span>
                <span>•</span>
                <span>{listing.vendor}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  Quality: {listing.qualityScore}%
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ml-4"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-tertiary)",
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {[
              { id: "preview", label: "Preview" },
              { id: "checklist", label: "Review Checklist" },
              { id: "category", label: `${listing.category} Details` },
              { id: "timeline", label: "Timeline" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="px-4 py-2 text-[12px] rounded-lg transition-all"
                style={
                  activeTab === tab.id
                    ? {
                        background: "var(--active-overlay)",
                        color: "var(--accent-navy-light)",
                        border: "1px solid var(--border-accent)",
                        fontWeight: 600,
                      }
                    : {
                        color: "var(--text-secondary)",
                        border: "1px solid transparent",
                      }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Preview Tab */}
          {activeTab === "preview" && (
            <div className="space-y-5">
              {/* Hero Image */}
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  border: "1px solid var(--border-light)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div
                  className="h-[300px] bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))` }}
                >
                  <Image size={48} className="text-white/30" />
                </div>
              </div>

              {/* Description */}
              <div
                className="rounded-xl p-5"
                style={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-light)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <h3 className="text-[14px] mb-3" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  Description
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {listing.description}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border-light)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Price
                  </p>
                  <p className="text-[18px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                    ${listing.price}
                  </p>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border-light)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Media
                  </p>
                  <p className="text-[18px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                    {listing.mediaCount}
                  </p>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border-light)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Variants
                  </p>
                  <p className="text-[18px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                    {listing.variants}
                  </p>
                </div>
              </div>

              {/* Issues */}
              {listing.issues && listing.issues.length > 0 && (
                <div
                  className="rounded-xl p-5"
                  style={{
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} style={{ color: "var(--warning)" }} />
                    <h3 className="text-[14px]" style={{ color: "var(--warning)", fontWeight: 600 }}>
                      Issues Found ({listing.issues.length})
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {listing.issues.map((issue, idx) => (
                      <li key={idx} className="text-[13px] flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                        <span className="text-[10px] mt-0.5" style={{ color: "var(--warning)" }}>●</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Checklist Tab */}
          {activeTab === "checklist" && (
            <div className="space-y-4">
              <div
                className="rounded-xl p-5"
                style={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-light)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  Quality Checklist
                </h3>
                <div className="space-y-3">
                  {[
                    { key: "contentQuality", label: "Content Quality", desc: "Description is clear and detailed" },
                    { key: "imageQuality", label: "Image Quality", desc: "Photos are high-res and professional" },
                    { key: "pricingAccuracy", label: "Pricing Accuracy", desc: "Pricing is complete and competitive" },
                    { key: "policyComplete", label: "Policy Completeness", desc: "Cancellation and terms are clear" },
                    { key: "safetyCompliance", label: "Safety Compliance", desc: "Meets safety and legal requirements" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all"
                      style={{
                        background: reviewChecklist[item.key as keyof typeof reviewChecklist]
                          ? "var(--active-overlay)"
                          : "var(--input-background)",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={reviewChecklist[item.key as keyof typeof reviewChecklist]}
                        onChange={(e) =>
                          setReviewChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))
                        }
                        className="w-4 h-4 rounded mt-0.5"
                        style={{ accentColor: "var(--accent-navy)" }}
                      />
                      <div className="flex-1">
                        <p className="text-[13px] mb-0.5" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                          {item.label}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          {item.desc}
                        </p>
                      </div>
                      {reviewChecklist[item.key as keyof typeof reviewChecklist] ? (
                        <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
                      ) : (
                        <XSquare size={16} style={{ color: "var(--text-tertiary)" }} />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {allChecksPassed && (
                <div
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{
                    background: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                  }}
                >
                  <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
                  <p className="text-[13px]" style={{ color: "var(--success)", fontWeight: 500 }}>
                    All quality checks passed. This listing is ready for approval.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Category-Specific Tab */}
          {activeTab === "category" && (
            <div
              className="rounded-xl p-5"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {listing.category} Specific Information
              </h3>

              {listing.category === "Stay" && listing.categoryData && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>Room Types</p>
                    <div className="flex gap-2 flex-wrap">
                      {listing.categoryData.roomTypes?.map((room) => (
                        <span
                          key={room}
                          className="text-[12px] px-3 py-1.5 rounded"
                          style={{
                            background: "var(--active-overlay)",
                            color: "var(--accent-navy-light)",
                            border: "1px solid var(--border-accent)",
                          }}
                        >
                          {room}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>Amenities</p>
                    <div className="flex gap-2 flex-wrap">
                      {listing.categoryData.amenities?.map((amenity) => (
                        <span
                          key={amenity}
                          className="text-[11px] px-2.5 py-1 rounded"
                          style={{
                            background: "var(--input-background)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-light)",
                          }}
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>Check-in</p>
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {listing.categoryData.checkIn || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>Check-out</p>
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {listing.categoryData.checkOut || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>Cancellation Policy</p>
                    <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {listing.categoryData.cancellationPolicy || "Not specified"}
                    </p>
                  </div>
                </div>
              )}

              {listing.category === "Tour" && listing.categoryData && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>Duration</p>
                    <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {listing.categoryData.duration || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>Itinerary</p>
                    <ul className="space-y-2">
                      {listing.categoryData.itinerary?.map((item, idx) => (
                        <li key={idx} className="text-[13px] flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                          <span className="text-[10px] mt-0.5" style={{ color: "var(--accent-navy)" }}>●</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>Inclusions</p>
                    <div className="flex gap-2 flex-wrap">
                      {listing.categoryData.inclusions?.map((item) => (
                        <span
                          key={item}
                          className="text-[11px] px-2.5 py-1 rounded"
                          style={{
                            background: "var(--active-overlay)",
                            color: "var(--accent-navy-light)",
                            border: "1px solid var(--border-accent)",
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {listing.category === "Safari" && listing.categoryData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>Park Name</p>
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {listing.categoryData.parkName || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>Vehicle Type</p>
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {listing.categoryData.vehicleType || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>Wildlife Viewing</p>
                    <div className="flex gap-2 flex-wrap">
                      {listing.categoryData.wildlife?.map((animal) => (
                        <span
                          key={animal}
                          className="text-[11px] px-2.5 py-1 rounded"
                          style={{
                            background: "var(--active-overlay)",
                            color: "var(--accent-navy-light)",
                            border: "1px solid var(--border-accent)",
                          }}
                        >
                          {animal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {listing.category === "Experience" && listing.categoryData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>Activity Type</p>
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {listing.categoryData.activityType || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>Max Participants</p>
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {listing.categoryData.maxParticipants || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>Restrictions</p>
                    <ul className="space-y-2">
                      {listing.categoryData.restrictions?.map((item, idx) => (
                        <li key={idx} className="text-[13px] flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                          <AlertTriangle size={12} className="shrink-0 mt-0.5" style={{ color: "var(--warning)" }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {listing.category === "Transfer" && listing.categoryData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>Vehicle Model</p>
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {listing.categoryData.vehicleModel || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>Capacity</p>
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {listing.categoryData.capacity ? `${listing.categoryData.capacity} passengers` : "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>Route</p>
                    <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {listing.categoryData.route || "Not specified"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div
              className="rounded-xl p-5"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Activity Timeline
              </h3>
              <div className="space-y-4">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: event.status === "completed" ? "var(--success)" : "var(--warning)",
                          boxShadow: event.status === "completed" ? "0 0 0 3px rgba(34, 197, 94, 0.2)" : "0 0 0 3px rgba(245, 158, 11, 0.2)",
                        }}
                      >
                        {event.status === "completed" ? (
                          <CheckCircle2 size={12} className="text-white" />
                        ) : (
                          <Clock size={12} className="text-white" />
                        )}
                      </div>
                      {idx < timelineEvents.length - 1 && (
                        <div
                          className="w-0.5 h-8 mt-1"
                          style={{ background: "var(--border-light)" }}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-[13px] mb-1 capitalize" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {event.type.replace("_", " ")}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {event.user} • {event.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback System */}
          <div
            className="mt-6 rounded-xl p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-[14px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Feedback for Vendor
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>
                  Quick Suggestions
                </p>
                <div className="flex gap-2 flex-wrap">
                  {FEEDBACK_SUGGESTIONS[listing.category].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleToggleFeedback(suggestion)}
                      className="text-[11px] px-3 py-1.5 rounded transition-all"
                      style={
                        selectedFeedback.includes(suggestion)
                          ? {
                              background: "var(--active-overlay)",
                              color: "var(--accent-navy-light)",
                              border: "1px solid var(--border-accent)",
                            }
                          : {
                              background: "var(--input-background)",
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border-light)",
                            }
                      }
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>
                  Custom Feedback
                </p>
                <textarea
                  value={customFeedback}
                  onChange={(e) => setCustomFeedback(e.target.value)}
                  placeholder="Add specific feedback or instructions..."
                  rows={3}
                  className="w-full px-3 py-2 text-[13px] rounded-lg resize-none"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="sticky bottom-0 px-6 py-4 flex gap-3"
          style={{
            background: "var(--bg-panel)",
            borderTop: "1px solid var(--border-light)",
            boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <button
            onClick={() => setShowApproveConfirm(true)}
            className="flex-1 px-4 py-2.5 text-[13px] rounded-lg transition-all"
            style={{
              background: "var(--success)",
              color: "white",
              fontWeight: 600,
              boxShadow: "0 0 12px rgba(34, 197, 94, 0.3)",
            }}
          >
            <CheckCircle2 size={14} className="inline mr-2" />
            Approve Listing
          </button>
          <button
            onClick={handleRequestChanges}
            disabled={selectedFeedback.length === 0 && !customFeedback.trim()}
            className="flex-1 px-4 py-2.5 text-[13px] rounded-lg transition-all"
            style={{
              background: "var(--warning)",
              color: "white",
              fontWeight: 600,
              opacity: selectedFeedback.length === 0 && !customFeedback.trim() ? 0.5 : 1,
              cursor: selectedFeedback.length === 0 && !customFeedback.trim() ? "not-allowed" : "pointer",
            }}
          >
            <MessageSquare size={14} className="inline mr-2" />
            Request Changes
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className="flex-1 px-4 py-2.5 text-[13px] rounded-lg transition-all"
            style={{
              background: "var(--error)",
              color: "white",
              fontWeight: 600,
            }}
          >
            <XSquare size={14} className="inline mr-2" />
            Reject Listing
          </button>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-[60]"
            onClick={() => setShowApproveConfirm(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[450px] rounded-xl p-6"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(34, 197, 94, 0.15)" }}
              >
                <CheckCircle2 size={20} style={{ color: "var(--success)" }} />
              </div>
              <h3 className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                Approve Listing
              </h3>
            </div>
            <p className="text-[13px] mb-6" style={{ color: "var(--text-secondary)" }}>
              Are you sure you want to approve "{listing.name}"? This listing will be published and visible to customers.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="flex-1 px-4 py-2 text-[13px] rounded-lg"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2 text-[13px] rounded-lg"
                style={{
                  background: "var(--success)",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                Approve
              </button>
            </div>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-[60]"
            onClick={() => setShowRejectModal(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[450px] rounded-xl p-6"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(239, 68, 68, 0.15)" }}
              >
                <XSquare size={20} style={{ color: "var(--error)" }} />
              </div>
              <h3 className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                Reject Listing
              </h3>
            </div>
            <p className="text-[13px] mb-4" style={{ color: "var(--text-secondary)" }}>
              Please provide a reason for rejecting this listing:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-3 py-2 text-[13px] rounded-lg resize-none mb-6"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 text-[13px] rounded-lg"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 text-[13px] rounded-lg"
                style={{
                  background: "var(--error)",
                  color: "white",
                  fontWeight: 600,
                  opacity: !rejectReason.trim() ? 0.5 : 1,
                  cursor: !rejectReason.trim() ? "not-allowed" : "pointer",
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

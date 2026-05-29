import { useState, useMemo } from "react";
import { Star, MessageSquare, ThumbsUp, Flag, Calendar, Filter, Search, TrendingUp, Award, Edit, Trash2, X, Check, Send, ChevronDown } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { vendorMockData, VendorReview } from "../../services/vendorMockData";

type ReviewRating = 1 | 2 | 3 | 4 | 5;
type FilterType = "all" | "needs_response" | "responded" | "low_rating" | "five_star";
type SortType = "newest" | "oldest" | "highest_rating" | "lowest_rating";

interface Review extends VendorReview {
  response?: string;
  helpful: number;
  verified: boolean;
  reported?: boolean;
  reportReason?: string;
}

interface ReportData {
  reason: "inappropriate" | "fake" | "unrelated" | "abusive";
  description: string;
}

export function VendorReviewsPage() {
  const { effectiveUser } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [editingResponse, setEditingResponse] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingReview, setReportingReview] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData>({ reason: "inappropriate", description: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingResponse, setDeletingResponse] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Get vendor-specific reviews from mock service
  const vendorId = effectiveUser?.id;
  const vendorReviews = vendorMockData.getRecentReviews(vendorId);
  
  // Convert to local Review format with additional properties
  const [reviewsData, setReviewsData] = useState<Review[]>(
    vendorReviews.map(review => ({
      ...review,
      response: review.responded ? "Thank you for your feedback!" : undefined,
      helpful: Math.floor(Math.random() * 10) + 1,
      verified: true,
      reported: false,
    }))
  );

  // Calculate dynamic stats from review data
  const calculatedStats = useMemo(() => {
    const totalReviews = reviewsData.length;
    const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : "0.0";
    const fiveStarCount = reviewsData.filter(r => r.rating === 5).length;
    const respondedCount = reviewsData.filter(r => r.response).length;
    const responseRate = totalReviews > 0 ? Math.round((respondedCount / totalReviews) * 100) : 0;

    return [
      { label: "Average Rating", value: averageRating, subtext: `Based on ${totalReviews} reviews`, icon: Star, color: "#eab308" },
      { label: "5-Star Reviews", value: fiveStarCount.toString(), subtext: `${Math.round((fiveStarCount / totalReviews) * 100)}% of total`, icon: Award, color: "#22c55e" },
      { label: "Response Rate", value: `${responseRate}%`, subtext: `${respondedCount} of ${totalReviews} responded`, icon: MessageSquare, color: "#3b82f6" },
      { label: "Rating Trend", value: "+0.2", subtext: "vs last month", icon: TrendingUp, color: "#10b981" },
    ];
  }, [reviewsData]);

  // Calculate dynamic rating breakdown
  const calculatedRatingBreakdown = useMemo(() => {
    const totalReviews = reviewsData.length;
    const breakdown = [5, 4, 3, 2, 1].map(stars => {
      const count = reviewsData.filter(r => r.rating === stars).length;
      const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
      return { stars, count, percentage };
    });
    return breakdown;
  }, [reviewsData]);

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviewsData.filter((review) => {
      // Apply filters
      if (filter === "needs_response") return !review.response;
      if (filter === "responded") return !!review.response;
      if (filter === "low_rating") return review.rating <= 2;
      if (filter === "five_star") return review.rating === 5;

      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          review.customer.toLowerCase().includes(query) ||
          review.listing.toLowerCase().includes(query) ||
          review.comment.toLowerCase().includes(query)
        );
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "highest_rating":
          return b.rating - a.rating;
        case "lowest_rating":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [reviewsData, filter, searchQuery, sortBy]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRespond = (reviewId: string) => {
    setRespondingTo(reviewId);
    setResponseText("");
  };

  const handleSaveResponse = (reviewId: string) => {
    if (!responseText.trim()) {
      showToast("Response cannot be empty", "error");
      return;
    }

    setReviewsData(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, response: responseText.trim() }
        : review
    ));

    setRespondingTo(null);
    setResponseText("");
    showToast("Response saved successfully", "success");
  };

  const handleEditResponse = (reviewId: string, currentResponse: string) => {
    setEditingResponse(reviewId);
    setResponseText(currentResponse);
  };

  const handleUpdateResponse = (reviewId: string) => {
    if (!responseText.trim()) {
      showToast("Response cannot be empty", "error");
      return;
    }

    setReviewsData(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, response: responseText.trim() }
        : review
    ));

    setEditingResponse(null);
    setResponseText("");
    showToast("Response updated successfully", "success");
  };

  const handleDeleteResponse = (reviewId: string) => {
    setDeletingResponse(reviewId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteResponse = () => {
    if (deletingResponse) {
      setReviewsData(prev => prev.map(review => 
        review.id === deletingResponse 
          ? { ...review, response: undefined }
          : review
      ));
      showToast("Response deleted successfully", "success");
    }
    setShowDeleteConfirm(false);
    setDeletingResponse(null);
  };

  const handleReportReview = (reviewId: string) => {
    setReportingReview(reviewId);
    setShowReportModal(true);
    setReportData({ reason: "inappropriate", description: "" });
  };

  const handleSubmitReport = () => {
    if (!reportData.description.trim()) {
      showToast("Please provide a description", "error");
      return;
    }

    if (reportingReview) {
      setReviewsData(prev => prev.map(review => 
        review.id === reportingReview 
          ? { ...review, reported: true, reportReason: reportData.reason }
          : review
      ));
      showToast("Review reported successfully", "success");
    }

    setShowReportModal(false);
    setReportingReview(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getFilterLabel = (filterType: FilterType) => {
    switch (filterType) {
      case "all": return "All Reviews";
      case "needs_response": return "Needs Response";
      case "responded": return "Responded";
      case "low_rating": return "Low Rating";
      case "five_star": return "5-Star Reviews";
      default: return "All Reviews";
    }
  };

  const getSortLabel = (sortType: SortType) => {
    switch (sortType) {
      case "newest": return "Newest First";
      case "oldest": return "Oldest First";
      case "highest_rating": return "Highest Rating";
      case "lowest_rating": return "Lowest Rating";
      default: return "Newest First";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed top-4 right-4 px-4 py-3 rounded-lg text-[13px] z-50 flex items-center gap-2"
          style={{
            background: toast.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: toast.type === "success" ? "#22c55e" : "#ef4444",
          }}
        >
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Reviews & Reputation
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Manage customer reviews and build your reputation
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {calculatedStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-[22px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {stat.value}
            </p>
            <p className="text-[12px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
              {stat.label}
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Rating Breakdown */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Rating Distribution
          </h2>
        </div>
        <div className="p-5 space-y-3">
          {calculatedRatingBreakdown.map((item) => (
            <div key={item.stars} className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 w-16">
                <span className="text-[12px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {item.stars}
                </span>
                <Star size={12} style={{ color: "#eab308", fill: "#eab308" }} />
              </div>
              <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "var(--input-background)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.percentage}%`,
                    background: "linear-gradient(90deg, var(--accent-navy), var(--accent-navy-light))",
                  }}
                />
              </div>
              <div className="flex items-baseline gap-2 w-24">
                <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {item.count}
                </span>
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg text-[13px] w-64"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(["all", "needs_response", "responded", "low_rating", "five_star"] as FilterType[]).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className="px-4 py-2 rounded-lg text-[12px] transition-all"
                style={
                  filter === filterType
                    ? {
                        background: "var(--active-overlay)",
                        color: "var(--accent-navy-light)",
                        border: "1px solid var(--border-accent)",
                        fontWeight: 500,
                      }
                    : {
                        background: "var(--input-background)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-light)",
                      }
                }
              >
                {getFilterLabel(filterType)}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="px-4 py-2 rounded-lg text-[12px] appearance-none cursor-pointer pr-8"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_rating">Highest Rating</option>
            <option value="lowest_rating">Lowest Rating</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredAndSortedReviews.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <MessageSquare size={48} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
            <p className="text-[14px] mb-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              No reviews found
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {searchQuery ? "Try adjusting your search or filters" : "Reviews will appear here once customers leave feedback"}
            </p>
          </div>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl overflow-hidden"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div className="p-5">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] shrink-0"
                      style={{
                        background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      {review.customer.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                          {review.customer}
                        </p>
                        {review.verified && (
                          <div
                            className="px-2 py-0.5 rounded text-[10px]"
                            style={{
                              background: "rgba(34,197,94,0.1)",
                              color: "#4ade80",
                              fontWeight: 600,
                            }}
                          >
                            Verified
                          </div>
                        )}
                        {review.reported && (
                          <div
                            className="px-2 py-0.5 rounded text-[10px]"
                            style={{
                              background: "rgba(239,68,68,0.1)",
                              color: "#f87171",
                              fontWeight: 600,
                            }}
                          >
                            Reported
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                        {review.listing}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              style={{
                                color: i < review.rating ? "#eab308" : "var(--text-tertiary)",
                                fill: i < review.rating ? "#eab308" : "none",
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          •
                        </span>
                        <div className="flex items-center gap-1">
                          <Calendar size={10} style={{ color: "var(--text-tertiary)" }} />
                          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            {formatDate(review.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleReportReview(review.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-opacity-80"
                    style={{
                      background: review.reported ? "rgba(239,68,68,0.1)" : "var(--input-background)",
                      border: `1px solid ${review.reported ? "rgba(239,68,68,0.3)" : "var(--border-light)"}`,
                      color: review.reported ? "#f87171" : "var(--text-tertiary)",
                    }}
                  >
                    <Flag size={14} />
                  </button>
                </div>

                {/* Review Content */}
                <p className="text-[13px] mb-3" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {review.comment}
                </p>

                {/* Review Response */}
                {review.response && !editingResponse && (
                  <div
                    className="rounded-lg p-3 mb-3"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px]" style={{ color: "var(--accent-navy-light)", fontWeight: 600 }}>
                        Your Response
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditResponse(review.id, review.response!)}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-opacity-80 transition-all"
                          style={{
                            background: "var(--input-background)",
                            border: "1px solid var(--border-light)",
                            color: "var(--text-tertiary)",
                          }}
                        >
                          <Edit size={10} />
                        </button>
                        <button
                          onClick={() => handleDeleteResponse(review.id)}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-opacity-80 transition-all"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "#f87171",
                          }}
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[12px]" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      {review.response}
                    </p>
                  </div>
                )}

                {/* Edit Response Form */}
                {editingResponse === review.id && (
                  <div
                    className="rounded-lg p-3 mb-3"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <p className="text-[11px] mb-2" style={{ color: "var(--accent-navy-light)", fontWeight: 600 }}>
                      Edit Response
                    </p>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Update your response..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg text-[12px] mb-3 resize-none"
                      style={{
                        background: "var(--bg-panel)",
                        border: "1px solid var(--border-light)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateResponse(review.id)}
                        className="px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5"
                        style={{
                          background: "var(--active-overlay)",
                          color: "var(--accent-navy-light)",
                          border: "1px solid var(--border-accent)",
                          fontWeight: 500,
                        }}
                      >
                        <Check size={12} />
                        Update
                      </button>
                      <button
                        onClick={() => {
                          setEditingResponse(null);
                          setResponseText("");
                        }}
                        className="px-3 py-1.5 rounded-lg text-[11px]"
                        style={{
                          background: "var(--input-background)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Respond Form */}
                {respondingTo === review.id && (
                  <div
                    className="rounded-lg p-3 mb-3"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <p className="text-[11px] mb-2" style={{ color: "var(--accent-navy-light)", fontWeight: 600 }}>
                      Your Response
                    </p>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Write your response..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg text-[12px] mb-3 resize-none"
                      style={{
                        background: "var(--bg-panel)",
                        border: "1px solid var(--border-light)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveResponse(review.id)}
                        className="px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5"
                        style={{
                          background: "var(--active-overlay)",
                          color: "var(--accent-navy-light)",
                          border: "1px solid var(--border-accent)",
                          fontWeight: 500,
                        }}
                      >
                        <Send size={12} />
                        Send Response
                      </button>
                      <button
                        onClick={() => {
                          setRespondingTo(null);
                          setResponseText("");
                        }}
                        className="px-3 py-1.5 rounded-lg text-[11px]"
                        style={{
                          background: "var(--input-background)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
                  <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    <ThumbsUp size={12} />
                    <span>{review.helpful} found helpful</span>
                  </div>
                  {!review.response && respondingTo !== review.id && (
                    <button
                      onClick={() => handleRespond(review.id)}
                      className="px-4 py-1.5 rounded-lg text-[11px] transition-all hover:bg-opacity-80"
                      style={{
                        background: "var(--active-overlay)",
                        color: "var(--accent-navy-light)",
                        border: "1px solid var(--border-accent)",
                        fontWeight: 500,
                      }}
                    >
                      <MessageSquare size={12} className="inline mr-1.5" />
                      Respond
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="rounded-xl p-6 w-full max-w-md mx-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Report Review
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Reason for reporting
                </label>
                <select
                  value={reportData.reason}
                  onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="fake">Fake review</option>
                  <option value="unrelated">Unrelated to service</option>
                  <option value="abusive">Abusive language</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                  Description *
                </label>
                <textarea
                  value={reportData.description}
                  onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Please provide details about why you're reporting this review..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg text-[13px] resize-none"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                className="flex-1 px-4 py-2 rounded-lg text-[13px]"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#ef4444",
                  fontWeight: 500,
                }}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Response Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="rounded-xl p-6 w-full max-w-sm mx-4"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                }}
              >
                <Trash2 size={20} />
              </div>
              <h3 className="text-[16px] mb-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Delete Response
              </h3>
              <p className="text-[13px] mb-6" style={{ color: "var(--text-secondary)" }}>
                Are you sure you want to delete this response? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteResponse}
                  className="flex-1 px-4 py-2 rounded-lg text-[13px]"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#ef4444",
                    fontWeight: 500,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

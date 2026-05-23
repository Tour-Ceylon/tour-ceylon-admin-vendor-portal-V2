import { useState } from "react";
import { Star, MessageSquare, ThumbsUp, Flag, Calendar, Filter, Search, TrendingUp, Award } from "lucide-react";

type ReviewRating = 1 | 2 | 3 | 4 | 5;

interface Review {
  id: string;
  customer: string;
  listing: string;
  rating: ReviewRating;
  date: string;
  comment: string;
  response?: string;
  helpful: number;
  verified: boolean;
}

export function VendorReviewsPage() {
  const [filter, setFilter] = useState<"all" | "responded" | "pending">("all");

  const stats = [
    { label: "Average Rating", value: "4.8", subtext: "Based on 127 reviews", icon: Star, color: "#eab308" },
    { label: "5-Star Reviews", value: "89", subtext: "70% of total", icon: Award, color: "#22c55e" },
    { label: "Response Rate", value: "94%", subtext: "123 of 127 responded", icon: MessageSquare, color: "#3b82f6" },
    { label: "Rating Trend", value: "+0.2", subtext: "vs last month", icon: TrendingUp, color: "#10b981" },
  ];

  const ratingBreakdown = [
    { stars: 5, count: 89, percentage: 70 },
    { stars: 4, count: 24, percentage: 19 },
    { stars: 3, count: 10, percentage: 8 },
    { stars: 2, count: 3, percentage: 2 },
    { stars: 1, count: 1, percentage: 1 },
  ];

  const reviews: Review[] = [
    {
      id: "1",
      customer: "Sarah Johnson",
      listing: "Yala National Park Safari",
      rating: 5,
      date: "May 18, 2026",
      comment: "Amazing experience! Our guide was knowledgeable and we saw so many animals including leopards. Highly recommend this safari!",
      response: "Thank you so much for your kind words! We're thrilled you had such a great experience.",
      helpful: 12,
      verified: true,
    },
    {
      id: "2",
      customer: "Mike Chen",
      listing: "Galle Fort Heritage Walk",
      rating: 4,
      date: "May 17, 2026",
      comment: "Great tour with lots of historical insights. Would have loved a bit more time at certain locations.",
      response: "Thanks for the feedback! We'll consider extending time at key spots.",
      helpful: 8,
      verified: true,
    },
    {
      id: "3",
      customer: "Emma Wilson",
      listing: "Yala National Park Safari",
      rating: 5,
      date: "May 16, 2026",
      comment: "Best safari of our trip! Saw elephants, leopards, and beautiful birds. Our guide was fantastic.",
      helpful: 15,
      verified: true,
    },
    {
      id: "4",
      customer: "David Lee",
      listing: "Minneriya Wildlife Safari",
      rating: 5,
      date: "May 15, 2026",
      comment: "Incredible elephant gathering! The timing was perfect and we got amazing photos.",
      response: "We're so glad you caught the gathering! Thank you for choosing us.",
      helpful: 9,
      verified: true,
    },
    {
      id: "5",
      customer: "Lisa Martinez",
      listing: "Galle Fort Heritage Walk",
      rating: 3,
      date: "May 14, 2026",
      comment: "Good tour but felt a bit rushed. Guide was nice though.",
      helpful: 4,
      verified: true,
    },
  ];

  const filteredReviews = reviews.filter((review) => {
    if (filter === "responded") return !!review.response;
    if (filter === "pending") return !review.response;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
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
        {stats.map((stat) => (
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
          {ratingBreakdown.map((item) => (
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

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {["all", "pending", "responded"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as typeof filter)}
              className="px-4 py-2 rounded-lg text-[12px] capitalize transition-all"
              style={
                filter === status
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
              {status === "all" ? "All Reviews" : status === "pending" ? "Needs Response" : "Responded"}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
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
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-tertiary)",
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
              {review.response && (
                <div
                  className="rounded-lg p-3 mb-3"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <p className="text-[11px] mb-1" style={{ color: "var(--accent-navy-light)", fontWeight: 600 }}>
                    Your Response
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {review.response}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
                <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  <ThumbsUp size={12} />
                  <span>{review.helpful} found helpful</span>
                </div>
                {!review.response && (
                  <button
                    className="px-4 py-1.5 rounded-lg text-[11px] transition-all"
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
        ))}
      </div>
    </div>
  );
}

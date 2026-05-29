import { useState } from "react";
import { Calendar, Plus, Edit, Trash2, Check, X } from "lucide-react";

export function VendorAvailabilityPage() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 4, 19));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const blockedDates = [21, 22, 27, 28, 29];
  const limitedDates = [24, 25, 26];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Availability & Calendar
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Manage your listing availability and booking calendar
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-[12px] flex items-center gap-2"
          style={{
            background: "var(--active-overlay)",
            color: "var(--accent-navy-light)",
            border: "1px solid var(--border-accent)",
            fontWeight: 500,
          }}
        >
          <Plus size={14} />
          Block Dates
        </button>
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-3 gap-6">
        {/* Calendar View */}
        <div
          className="col-span-2 rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <h2 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              May 2026
            </h2>
            <div className="flex gap-2">
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                ‹
              </button>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
              >
                ›
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-7 gap-2 mb-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center">
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    {day}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth(selectedDate).map((day, i) => {
                if (!day) {
                  return <div key={`empty-${i}`} />;
                }
                const isBlocked = blockedDates.includes(day);
                const isLimited = limitedDates.includes(day);
                const isToday = day === 19;
                return (
                  <button
                    key={day}
                    className="aspect-square rounded-lg flex items-center justify-center text-[13px] transition-all"
                    style={
                      isBlocked
                        ? {
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "#f87171",
                          }
                        : isLimited
                          ? {
                              background: "rgba(245,158,11,0.1)",
                              border: "1px solid rgba(245,158,11,0.3)",
                              color: "#fbbf24",
                            }
                          : isToday
                            ? {
                                background: "var(--active-overlay)",
                                border: "1px solid var(--border-accent)",
                                color: "var(--accent-navy-light)",
                                fontWeight: 600,
                              }
                            : {
                                background: "var(--input-background)",
                                border: "1px solid var(--border-light)",
                                color: "var(--text-primary)",
                              }
                    }
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-6 mt-5 pt-5" style={{ borderTop: "1px solid var(--border-light)" }}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }} />
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }} />
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Limited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }} />
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Blocked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Rules */}
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
              Availability Rules
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                Default Capacity
              </label>
              <input
                type="number"
                defaultValue={20}
                className="w-full px-3 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                Minimum Notice
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <option>Same day</option>
                <option>1 day</option>
                <option>2 days</option>
                <option>3 days</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] block mb-2" style={{ color: "var(--text-secondary)" }}>
                Maximum Advance
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg text-[13px]"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <option>3 months</option>
                <option>6 months</option>
                <option>1 year</option>
                <option>Unlimited</option>
              </select>
            </div>
            <button
              className="w-full px-4 py-2 rounded-lg text-[12px]"
              style={{
                background: "var(--active-overlay)",
                color: "var(--accent-navy-light)",
                border: "1px solid var(--border-accent)",
                fontWeight: 500,
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Blocked Periods */}
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
            Blocked Periods
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--input-background)" }}>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Date Range
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Reason
                  </span>
                </th>
                <th className="px-5 py-3 text-left" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Type
                  </span>
                </th>
                <th className="px-5 py-3 text-right" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { range: "May 21-22, 2026", reason: "Equipment Maintenance", type: "Full Block" },
                { range: "May 27-29, 2026", reason: "National Holiday", type: "Full Block" },
                { range: "May 24-26, 2026", reason: "High Demand Period", type: "Capacity Limit" },
              ].map((block, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: i < 2 ? "1px solid var(--border-light)" : "none" }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} style={{ color: "var(--text-tertiary)" }} />
                      <span className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {block.range}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {block.reason}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div
                      className="inline-block px-2.5 py-1 rounded-lg text-[11px]"
                      style={{
                        background: block.type === "Full Block" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                        color: block.type === "Full Block" ? "#f87171" : "#fbbf24",
                        fontWeight: 600,
                      }}
                    >
                      {block.type}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: "var(--input-background)",
                          border: "1px solid var(--border-light)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          color: "#f87171",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  Banknote,
  TrendingUp,
  CheckCircle2,
  Loader2,
  RefreshCw,
  AlertCircle,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { DriverEarningsData, fetchMyEarnings } from "../api/driverTripApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Period = "today" | "week" | "month";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0D1628] border border-white/[0.1] rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-0.5">{label}</p>
      <p className="text-white font-bold">${Number(payload[0].value).toFixed(2)}</p>
      {payload[0].payload.trip_count !== undefined && (
        <p className="text-slate-500 text-[10px]">
          {payload[0].payload.trip_count} trip
          {payload[0].payload.trip_count !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

export function DriverEarningsScreen() {
  const { user } = useAuth();

  const [period, setPeriod] = useState<Period>("week");
  const [data, setData] = useState<DriverEarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadEarnings = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchMyEarnings(period);
      setData(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load driver earnings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, [period]);

  const avgFare =
    data && data.trip_count > 0 ? data.total_earnings / data.trip_count : 0;

  const maxEarnings = data?.daily_breakdown
    ? Math.max(...data.daily_breakdown.map((d) => d.earnings), 1)
    : 1;

  const TABS: { key: Period; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
  ];

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl lg:max-w-none mx-auto space-y-4">
      {/* Header + period tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white font-bold text-xl">Earnings & Payout</h1>
          <button
            onClick={loadEarnings}
            disabled={loading}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] transition-all disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Period segmented tabs */}
        <div className="flex gap-2 p-1 bg-[#070E1D] border border-white/[0.06] rounded-xl">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                period === key
                  ? "bg-blue-600/15 border border-blue-500/25 text-blue-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
          <AlertCircle size={13} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Net Earnings */}
        <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] px-4 py-4 col-span-1">
          <div className="flex items-center gap-1.5 mb-2">
            <Banknote size={12} className="text-emerald-400" />
            <p className="text-slate-500 text-[10px] uppercase tracking-wide">Net Earned</p>
          </div>
          <p className="text-emerald-400 font-extrabold text-2xl leading-none">
            ${data ? Number(data.total_earnings).toFixed(0) : "0"}
          </p>
          <p className="text-slate-600 text-[10px] mt-1">{data?.currency ?? "USD"}</p>
        </div>

        {/* Trips */}
        <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] px-4 py-4 col-span-1">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 size={12} className="text-blue-400" />
            <p className="text-slate-500 text-[10px] uppercase tracking-wide">Trips</p>
          </div>
          <p className="text-white font-extrabold text-2xl leading-none">
            {data?.trip_count ?? 0}
          </p>
          <p className="text-slate-600 text-[10px] mt-1">completed</p>
        </div>

        {/* Avg fare */}
        <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] px-4 py-4 col-span-1">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={12} className="text-purple-400" />
            <p className="text-slate-500 text-[10px] uppercase tracking-wide">Avg / Trip</p>
          </div>
          <p className="text-white font-extrabold text-2xl leading-none">
            ${avgFare.toFixed(0)}
          </p>
          <p className="text-slate-600 text-[10px] mt-1">per trip</p>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] overflow-hidden">
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <p className="text-white font-bold text-sm">Daily Revenue</p>
          <p className="text-slate-500 text-xs">
            {data
              ? data.start_date === data.end_date
                ? data.start_date
                : `${data.start_date} – ${data.end_date}`
              : ""}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500 text-xs">
            <Loader2 size={16} className="animate-spin text-blue-400" />
            Calculating daily figures...
          </div>
        ) : !data || data.daily_breakdown.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-12">
            No earnings recorded for this timeframe.
          </p>
        ) : (
          <>
            <div className="px-2 pb-5" style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.daily_breakdown}
                  barCategoryGap="35%"
                  margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                >
                  <XAxis
                    dataKey="day_name"
                    tick={{
                      fill: "#64748B",
                      fontSize: 10,
                      fontFamily: "Inter, sans-serif",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => v.substring(0, 3)}
                  />
                  <YAxis
                    tick={{
                      fill: "#475569",
                      fontSize: 10,
                      fontFamily: "Inter, sans-serif",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v}`}
                    width={42}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(255,255,255,0.04)", radius: 6 }}
                  />
                  <Bar dataKey="earnings" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {data.daily_breakdown.map((entry) => {
                      const intensity = maxEarnings > 0 ? entry.earnings / maxEarnings : 0;
                      const isZero = entry.earnings === 0;
                      return (
                        <Cell
                          key={entry.date}
                          fill={
                            isZero
                              ? "#1E293B"
                              : intensity > 0.7
                              ? "#3B82F6"
                              : intensity > 0.4
                              ? "#2563EB"
                              : "#1D4ED8"
                          }
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {data.daily_breakdown.some((d) => d.earnings === 0) &&
              period !== "today" && (
                <div className="px-5 pb-4">
                  <p className="text-slate-600 text-[10px]">
                    Gray bars indicate days with no completed trips.
                  </p>
                </div>
              )}
          </>
        )}
      </div>

      {/* Payout account */}
      <div className="rounded-2xl bg-[#070E1D] border border-white/[0.06] overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-white/[0.06] flex items-center gap-2">
          <Building2 size={14} className="text-blue-400" />
          <p className="text-white font-bold text-sm">Payout Account</p>
          <span className="ml-auto flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/25 text-emerald-400">
            <ShieldCheck size={9} />
            Verified
          </span>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs">Account Holder</p>
            <p className="text-slate-200 text-xs font-semibold">
              {user?.name || "Driver"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs">Method</p>
            <p className="text-slate-200 text-xs font-semibold">Direct Bank Transfer</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs">Schedule</p>
            <p className="text-slate-200 text-xs font-semibold">Weekly · Every Monday</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs">Status</p>
            <span className="text-emerald-400 text-xs font-semibold">Active</span>
          </div>
        </div>

        <div className="mx-5 mb-5 p-3.5 rounded-xl bg-blue-500/[0.05] border border-blue-500/10">
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Weekly earnings are automatically transferred to your bank account every{" "}
            <span className="text-blue-300 font-medium">Monday morning</span>. No
            action needed.
          </p>
        </div>
      </div>

      {/* Next payout callout */}
      {data && (
        <div className="rounded-2xl bg-gradient-to-r from-[#1E3A8A]/40 to-[#1E40AF]/20 border border-blue-700/30 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs">Next Payout (Estimated)</p>
            <p className="text-white font-bold text-base mt-0.5">
              ${Number(data.total_earnings).toFixed(2)}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              Transferring automatically next Monday
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/25 flex items-center justify-center shrink-0">
            <Banknote size={20} className="text-blue-400" />
          </div>
        </div>
      )}
    </div>
  );
}

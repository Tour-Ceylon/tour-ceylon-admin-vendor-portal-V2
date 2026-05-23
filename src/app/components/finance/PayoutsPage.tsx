import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  PauseCircle,
  DollarSign,
  TrendingUp,
  Wallet,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { PayoutDetailDrawer } from "./PayoutDetailDrawer";

type PayoutStatus = "pending" | "processing" | "paid" | "failed" | "on_hold";

interface Payout {
  id: string;
  payoutId: string;
  vendor: string;
  vendorEmail: string;
  availableBalance: number;
  payoutAmount: number;
  pendingBalance: number;
  payoutMethod: string;
  status: PayoutStatus;
  nextPayoutDate: string;
  requestDate: string;
  processedDate?: string;
  bankAccount: string;
}

const STATUS_CONFIG: Record<PayoutStatus, { bg: string; text: string; dot: string; icon: any }> = {
  pending: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", dot: "#f59e0b", icon: Clock },
  processing: { bg: "rgba(59, 130, 246, 0.1)", text: "#60a5fa", dot: "#3b82f6", icon: TrendingUp },
  paid: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e", icon: CheckCircle },
  failed: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444", icon: XCircle },
  on_hold: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8", dot: "#64748b", icon: PauseCircle },
};

const SAMPLE_PAYOUTS: Payout[] = [
  {
    id: "1",
    payoutId: "PO-8921",
    vendor: "Ceylon Luxury Retreats",
    vendorEmail: "finance@ceylonluxury.lk",
    availableBalance: 45200.00,
    payoutAmount: 42000.00,
    pendingBalance: 12500.00,
    payoutMethod: "Bank Transfer",
    status: "pending",
    nextPayoutDate: "2024-03-25",
    requestDate: "2024-03-18 10:30",
    bankAccount: "****7845",
  },
  {
    id: "2",
    payoutId: "PO-8920",
    vendor: "Heritage Tours Lanka",
    vendorEmail: "admin@heritagetours.lk",
    availableBalance: 28400.00,
    payoutAmount: 28400.00,
    pendingBalance: 8200.00,
    payoutMethod: "Bank Transfer",
    status: "processing",
    nextPayoutDate: "2024-03-25",
    requestDate: "2024-03-17 14:20",
    bankAccount: "****2314",
  },
  {
    id: "3",
    payoutId: "PO-8919",
    vendor: "Wild Adventures",
    vendorEmail: "payouts@wildadventures.lk",
    availableBalance: 18950.00,
    payoutAmount: 18950.00,
    pendingBalance: 5400.00,
    payoutMethod: "Bank Transfer",
    status: "paid",
    nextPayoutDate: "2024-04-01",
    requestDate: "2024-03-10 09:15",
    processedDate: "2024-03-12 16:45",
    bankAccount: "****6892",
  },
  {
    id: "4",
    payoutId: "PO-8918",
    vendor: "Taste of Lanka",
    vendorEmail: "finance@tasteoflanka.lk",
    availableBalance: 12600.00,
    payoutAmount: 12600.00,
    pendingBalance: 3800.00,
    payoutMethod: "PayPal",
    status: "paid",
    nextPayoutDate: "2024-04-01",
    requestDate: "2024-03-08 11:00",
    processedDate: "2024-03-10 14:20",
    bankAccount: "paypal@tasteoflanka.lk",
  },
  {
    id: "5",
    payoutId: "PO-8917",
    vendor: "Premium Transfers LK",
    vendorEmail: "accounts@premiumtransfers.lk",
    availableBalance: 8450.00,
    payoutAmount: 8450.00,
    pendingBalance: 2100.00,
    payoutMethod: "Bank Transfer",
    status: "failed",
    nextPayoutDate: "2024-03-25",
    requestDate: "2024-03-15 13:45",
    bankAccount: "****4521",
  },
  {
    id: "6",
    payoutId: "PO-8916",
    vendor: "Cinnamon Hotels",
    vendorEmail: "finance@cinnamonhotels.lk",
    availableBalance: 62800.00,
    payoutAmount: 55000.00,
    pendingBalance: 18400.00,
    payoutMethod: "Bank Transfer",
    status: "on_hold",
    nextPayoutDate: "2024-03-25",
    requestDate: "2024-03-16 15:30",
    bankAccount: "****9823",
  },
  {
    id: "7",
    payoutId: "PO-8915",
    vendor: "Ocean Adventures",
    vendorEmail: "payroll@oceanadventures.lk",
    availableBalance: 15700.00,
    payoutAmount: 15700.00,
    pendingBalance: 4200.00,
    payoutMethod: "Bank Transfer",
    status: "processing",
    nextPayoutDate: "2024-03-25",
    requestDate: "2024-03-17 10:10",
    bankAccount: "****3456",
  },
  {
    id: "8",
    payoutId: "PO-8914",
    vendor: "Ancient Wonders Tours",
    vendorEmail: "admin@ancientwonders.lk",
    availableBalance: 32100.00,
    payoutAmount: 30000.00,
    pendingBalance: 9500.00,
    payoutMethod: "Bank Transfer",
    status: "pending",
    nextPayoutDate: "2024-03-25",
    requestDate: "2024-03-18 08:45",
    bankAccount: "****7123",
  },
];

export function PayoutsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const statusTabs = [
    { id: "all", label: "All", count: SAMPLE_PAYOUTS.length },
    { id: "pending", label: "Pending", count: SAMPLE_PAYOUTS.filter(p => p.status === "pending").length },
    { id: "processing", label: "Processing", count: SAMPLE_PAYOUTS.filter(p => p.status === "processing").length },
    { id: "paid", label: "Paid", count: SAMPLE_PAYOUTS.filter(p => p.status === "paid").length },
    { id: "failed", label: "Failed", count: SAMPLE_PAYOUTS.filter(p => p.status === "failed").length },
    { id: "on_hold", label: "On Hold", count: SAMPLE_PAYOUTS.filter(p => p.status === "on_hold").length },
  ];

  const filteredPayouts = SAMPLE_PAYOUTS.filter((payout) => {
    const matchStatus = filterStatus === "all" || payout.status === filterStatus;
    const matchSearch = !search ||
      payout.payoutId.toLowerCase().includes(search.toLowerCase()) ||
      payout.vendor.toLowerCase().includes(search.toLowerCase()) ||
      payout.vendorEmail.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleViewPayout = (payout: Payout) => {
    setSelectedPayout(payout);
    setDrawerOpen(true);
  };

  // Calculate stats
  const stats = {
    totalPending: SAMPLE_PAYOUTS.filter(p => p.status === "pending" || p.status === "processing").reduce((sum, p) => sum + p.payoutAmount, 0),
    totalPaid: SAMPLE_PAYOUTS.filter(p => p.status === "paid").reduce((sum, p) => sum + p.payoutAmount, 0),
    onHold: SAMPLE_PAYOUTS.filter(p => p.status === "on_hold").reduce((sum, p) => sum + p.payoutAmount, 0),
    failedPayouts: SAMPLE_PAYOUTS.filter(p => p.status === "failed").length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Vendor Payouts
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Manage vendor earnings and process payouts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(245, 158, 11, 0.1)" }}
            >
              <Clock size={18} style={{ color: "var(--warning)" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Pending Payouts
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${stats.totalPending.toLocaleString()}
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(34, 197, 94, 0.1)" }}
            >
              <CheckCircle size={18} style={{ color: "var(--success)" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Total Paid
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${stats.totalPaid.toLocaleString()}
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(100, 116, 139, 0.1)" }}
            >
              <PauseCircle size={18} style={{ color: "#64748b" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            On Hold
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${stats.onHold.toLocaleString()}
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239, 68, 68, 0.1)" }}
            >
              <AlertCircle size={18} style={{ color: "var(--error)" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Failed Payouts
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.failedPayouts}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="rounded-xl"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Filters */}
        <div className="p-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
              }}
            >
              <Search size={14} style={{ color: "var(--text-tertiary)" }} />
              <input
                type="text"
                placeholder="Search by payout ID, vendor name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-[13px] outline-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
            <button
              className="px-4 py-2 text-[13px] rounded-lg flex items-center gap-2"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
              }}
            >
              <Filter size={14} />
              Filters
            </button>
            <button
              className="px-4 py-2 text-[13px] rounded-lg flex items-center gap-2"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
              }}
            >
              <Download size={14} />
              Export
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className="px-4 py-2 text-[12px] rounded-lg transition-all"
                style={
                  filterStatus === tab.id
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
                <span
                  className="ml-2 px-2 py-0.5 rounded text-[10px]"
                  style={{
                    background: filterStatus === tab.id ? "var(--accent-navy)" : "var(--input-background)",
                    color: filterStatus === tab.id ? "white" : "var(--text-tertiary)",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  PAYOUT ID
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  VENDOR
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  AVAILABLE BALANCE
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  PAYOUT AMOUNT
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  PENDING BALANCE
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  METHOD
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  STATUS
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  NEXT PAYOUT
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.map((payout) => {
                const StatusIcon = STATUS_CONFIG[payout.status].icon;
                return (
                  <tr
                    key={payout.id}
                    className="group cursor-pointer transition-all"
                    style={{ borderBottom: "1px solid var(--border-light)" }}
                    onClick={() => handleViewPayout(payout)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <td className="px-4 py-3">
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {payout.payoutId}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                        {payout.vendor}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {payout.vendorEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        ${payout.availableBalance.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px]" style={{ color: "var(--success)", fontWeight: 600 }}>
                        ${payout.payoutAmount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                        ${payout.pendingBalance.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {payout.payoutMethod}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {payout.bankAccount}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: STATUS_CONFIG[payout.status].dot }}
                        />
                        <span
                          className="text-[12px] capitalize"
                          style={{ color: STATUS_CONFIG[payout.status].text }}
                        >
                          {payout.status.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        {payout.nextPayoutDate}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPayout(payout);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: "var(--input-background)",
                          border: "1px solid var(--border-light)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Detail Drawer */}
      {drawerOpen && selectedPayout && (
        <PayoutDetailDrawer
          payout={selectedPayout}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}

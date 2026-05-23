import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  MoreHorizontal,
  Eye,
  RefreshCw,
  FileText,
  Mail,
  MessageSquare,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { PaymentDetailDrawer } from "./PaymentDetailDrawer";

type PaymentStatus = "paid" | "pending" | "failed" | "refunded" | "partially_refunded" | "pay_later";
type PaymentMethod = "credit_card" | "debit_card" | "bank_transfer" | "paypal" | "pay_later";

interface Payment {
  id: string;
  transactionId: string;
  bookingId: string;
  customer: string;
  vendor: string;
  bookingType: string;
  amount: number;
  platformCommission: number;
  vendorEarnings: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  createdDate: string;
  paidDate?: string;
}

const STATUS_CONFIG: Record<PaymentStatus, { bg: string; text: string; dot: string }> = {
  paid: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e" },
  pending: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", dot: "#f59e0b" },
  failed: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444" },
  refunded: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8", dot: "#64748b" },
  partially_refunded: { bg: "rgba(59, 130, 246, 0.1)", text: "#60a5fa", dot: "#3b82f6" },
  pay_later: { bg: "rgba(217, 119, 6, 0.1)", text: "#fb923c", dot: "#d97706" },
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  bank_transfer: "Bank Transfer",
  paypal: "PayPal",
  pay_later: "Pay Later",
};

const SAMPLE_PAYMENTS: Payment[] = [
  {
    id: "1",
    transactionId: "TXN-89421",
    bookingId: "BKG-5421",
    customer: "Sarah Johnson",
    vendor: "Ceylon Luxury Retreats",
    bookingType: "Stay",
    amount: 1250.00,
    platformCommission: 150.00,
    vendorEarnings: 1100.00,
    paymentMethod: "credit_card",
    status: "paid",
    createdDate: "2024-03-18 14:30",
    paidDate: "2024-03-18 14:32",
  },
  {
    id: "2",
    transactionId: "TXN-89420",
    bookingId: "BKG-5420",
    customer: "Michael Chen",
    vendor: "Heritage Tours Lanka",
    bookingType: "Tour",
    amount: 450.00,
    platformCommission: 67.50,
    vendorEarnings: 382.50,
    paymentMethod: "paypal",
    status: "pending",
    createdDate: "2024-03-18 12:15",
  },
  {
    id: "3",
    transactionId: "TXN-89419",
    bookingId: "BKG-5419",
    customer: "Emma Wilson",
    vendor: "Wild Adventures",
    bookingType: "Safari",
    amount: 680.00,
    platformCommission: 68.00,
    vendorEarnings: 612.00,
    paymentMethod: "credit_card",
    status: "failed",
    createdDate: "2024-03-18 10:45",
  },
  {
    id: "4",
    transactionId: "TXN-89418",
    bookingId: "BKG-5418",
    customer: "David Brown",
    vendor: "Taste of Lanka",
    bookingType: "Experience",
    amount: 180.00,
    platformCommission: 21.60,
    vendorEarnings: 158.40,
    paymentMethod: "credit_card",
    status: "paid",
    createdDate: "2024-03-17 16:20",
    paidDate: "2024-03-17 16:22",
  },
  {
    id: "5",
    transactionId: "TXN-89417",
    bookingId: "BKG-5417",
    customer: "Lisa Martinez",
    vendor: "Premium Transfers LK",
    bookingType: "Transfer",
    amount: 85.00,
    platformCommission: 8.50,
    vendorEarnings: 76.50,
    paymentMethod: "debit_card",
    status: "paid",
    createdDate: "2024-03-17 14:10",
    paidDate: "2024-03-17 14:11",
  },
  {
    id: "6",
    transactionId: "TXN-89416",
    bookingId: "BKG-5416",
    customer: "James Taylor",
    vendor: "Cinnamon Hotels",
    bookingType: "Stay",
    amount: 895.00,
    platformCommission: 107.40,
    vendorEarnings: 787.60,
    paymentMethod: "bank_transfer",
    status: "refunded",
    createdDate: "2024-03-16 11:30",
    paidDate: "2024-03-16 11:35",
  },
  {
    id: "7",
    transactionId: "TXN-89415",
    bookingId: "BKG-5415",
    customer: "Anna Garcia",
    vendor: "Ocean Adventures",
    bookingType: "Experience",
    amount: 320.00,
    platformCommission: 38.40,
    vendorEarnings: 281.60,
    paymentMethod: "credit_card",
    status: "partially_refunded",
    createdDate: "2024-03-15 09:45",
    paidDate: "2024-03-15 09:47",
  },
  {
    id: "8",
    transactionId: "TXN-89414",
    bookingId: "BKG-5414",
    customer: "Robert Lee",
    vendor: "Ancient Wonders Tours",
    bookingType: "Tour",
    amount: 540.00,
    platformCommission: 81.00,
    vendorEarnings: 459.00,
    paymentMethod: "pay_later",
    status: "pay_later",
    createdDate: "2024-03-14 15:20",
  },
];

export function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const statusTabs = [
    { id: "all", label: "All", count: SAMPLE_PAYMENTS.length },
    { id: "paid", label: "Paid", count: SAMPLE_PAYMENTS.filter(p => p.status === "paid").length },
    { id: "pending", label: "Pending", count: SAMPLE_PAYMENTS.filter(p => p.status === "pending").length },
    { id: "failed", label: "Failed", count: SAMPLE_PAYMENTS.filter(p => p.status === "failed").length },
    { id: "refunded", label: "Refunded", count: SAMPLE_PAYMENTS.filter(p => p.status === "refunded").length },
    { id: "pay_later", label: "Pay Later", count: SAMPLE_PAYMENTS.filter(p => p.status === "pay_later").length },
  ];

  const filteredPayments = SAMPLE_PAYMENTS.filter((payment) => {
    const matchStatus = filterStatus === "all" || payment.status === filterStatus;
    const matchSearch = !search ||
      payment.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      payment.customer.toLowerCase().includes(search.toLowerCase()) ||
      payment.vendor.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setDrawerOpen(true);
  };

  // Calculate stats
  const stats = {
    totalRevenue: SAMPLE_PAYMENTS.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: SAMPLE_PAYMENTS.filter(p => p.status === "pending" || p.status === "pay_later").reduce((sum, p) => sum + p.amount, 0),
    totalCommission: SAMPLE_PAYMENTS.filter(p => p.status === "paid").reduce((sum, p) => sum + p.platformCommission, 0),
    failedAmount: SAMPLE_PAYMENTS.filter(p => p.status === "failed").reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Payment Management
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Track and manage all customer payments and transactions
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
              style={{ background: "rgba(34, 197, 94, 0.1)" }}
            >
              <DollarSign size={18} style={{ color: "var(--success)" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Total Revenue
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${stats.totalRevenue.toLocaleString()}
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
              style={{ background: "rgba(245, 158, 11, 0.1)" }}
            >
              <Clock size={18} style={{ color: "var(--warning)" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Pending Payments
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${stats.pendingPayments.toLocaleString()}
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
              style={{ background: "rgba(59, 130, 246, 0.1)" }}
            >
              <TrendingUp size={18} style={{ color: "#3b82f6" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Platform Commission
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${stats.totalCommission.toLocaleString()}
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
              <XCircle size={18} style={{ color: "var(--error)" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Failed Payments
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            ${stats.failedAmount.toLocaleString()}
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
                placeholder="Search by transaction ID, booking, customer..."
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
                  TRANSACTION ID
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  BOOKING ID
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  CUSTOMER
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  VENDOR
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  TYPE
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  AMOUNT
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  COMMISSION
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  PAYMENT METHOD
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  STATUS
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  CREATED
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="group cursor-pointer transition-all"
                  style={{ borderBottom: "1px solid var(--border-light)" }}
                  onClick={() => handleViewPayment(payment)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {payment.transactionId}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                      {payment.bookingId}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                      {payment.customer}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                      {payment.vendor}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] px-2.5 py-1 rounded"
                      style={{
                        background: "var(--input-background)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {payment.bookingType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      ${payment.amount.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                      ${payment.platformCommission.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: STATUS_CONFIG[payment.status].dot }}
                      />
                      <span
                        className="text-[12px] capitalize"
                        style={{ color: STATUS_CONFIG[payment.status].text }}
                      >
                        {payment.status.replace("_", " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                      {payment.createdDate}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPayment(payment);
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Detail Drawer */}
      {drawerOpen && selectedPayment && (
        <PaymentDetailDrawer
          payment={selectedPayment}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}

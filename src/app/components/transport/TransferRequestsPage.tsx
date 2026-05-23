import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
} from "lucide-react";
import { TransferRequestDrawer } from "./TransferRequestDrawer";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "rejected";
type PaymentStatus = "unpaid" | "paid" | "pay_later" | "refunded";

interface TransferRequest {
  id: string;
  bookingId: string;
  customer: string;
  customerEmail: string;
  pickup: string;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  luggage: number;
  vehicleCategory: string;
  estimatedFare: number;
  distance: number;
  duration: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  createdDate: string;
  notes?: string;
}

const BOOKING_STATUS_CONFIG: Record<BookingStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", dot: "#f59e0b" },
  confirmed: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80", dot: "#22c55e" },
  completed: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8", dot: "#64748b" },
  cancelled: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444" },
  rejected: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", dot: "#ef4444" },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { bg: string; text: string }> = {
  paid: { bg: "rgba(34, 197, 94, 0.1)", text: "#4ade80" },
  unpaid: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24" },
  pay_later: { bg: "rgba(59, 130, 246, 0.1)", text: "#60a5fa" },
  refunded: { bg: "rgba(100, 116, 139, 0.1)", text: "#94a3b8" },
};

const SAMPLE_REQUESTS: TransferRequest[] = [
  {
    id: "1",
    bookingId: "TR-8945",
    customer: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    pickup: "Bandaranaike International Airport (CMB)",
    destination: "Shangri-La Colombo",
    pickupDate: "2024-03-20",
    pickupTime: "14:30",
    passengers: 2,
    luggage: 3,
    vehicleCategory: "SUV",
    estimatedFare: 4500,
    distance: 32,
    duration: "45 mins",
    bookingStatus: "pending",
    paymentStatus: "unpaid",
    createdDate: "2024-03-18 10:30",
  },
  {
    id: "2",
    bookingId: "TR-8944",
    customer: "Michael Chen",
    customerEmail: "m.chen@email.com",
    pickup: "Cinnamon Grand Colombo",
    destination: "Kandy City Center",
    pickupDate: "2024-03-21",
    pickupTime: "09:00",
    passengers: 4,
    luggage: 5,
    vehicleCategory: "Van",
    estimatedFare: 8900,
    distance: 115,
    duration: "3 hours",
    bookingStatus: "confirmed",
    paymentStatus: "paid",
    createdDate: "2024-03-17 14:20",
  },
  {
    id: "3",
    bookingId: "TR-8943",
    customer: "Emma Wilson",
    customerEmail: "emma.w@email.com",
    pickup: "Galle Fort Hotel",
    destination: "Mirissa Beach",
    pickupDate: "2024-03-22",
    pickupTime: "08:00",
    passengers: 3,
    luggage: 4,
    vehicleCategory: "Standard Car",
    estimatedFare: 3200,
    distance: 28,
    duration: "35 mins",
    bookingStatus: "confirmed",
    paymentStatus: "pay_later",
    createdDate: "2024-03-16 11:15",
  },
  {
    id: "4",
    bookingId: "TR-8942",
    customer: "David Brown",
    customerEmail: "d.brown@email.com",
    pickup: "CMB Airport",
    destination: "Galle Face Hotel",
    pickupDate: "2024-03-19",
    pickupTime: "22:30",
    passengers: 1,
    luggage: 2,
    vehicleCategory: "Standard Car",
    estimatedFare: 4200,
    distance: 34,
    duration: "50 mins",
    bookingStatus: "completed",
    paymentStatus: "paid",
    createdDate: "2024-03-15 08:45",
  },
  {
    id: "5",
    bookingId: "TR-8941",
    customer: "Lisa Martinez",
    customerEmail: "lisa.m@email.com",
    pickup: "Heritance Kandalama",
    destination: "Sigiriya Rock",
    pickupDate: "2024-03-23",
    pickupTime: "06:30",
    passengers: 2,
    luggage: 2,
    vehicleCategory: "SUV",
    estimatedFare: 2800,
    distance: 18,
    duration: "25 mins",
    bookingStatus: "pending",
    paymentStatus: "unpaid",
    createdDate: "2024-03-18 16:10",
  },
  {
    id: "6",
    bookingId: "TR-8940",
    customer: "James Taylor",
    customerEmail: "j.taylor@email.com",
    pickup: "Colombo Hotels",
    destination: "CMB Airport",
    pickupDate: "2024-03-20",
    pickupTime: "05:00",
    passengers: 2,
    luggage: 4,
    vehicleCategory: "Van",
    estimatedFare: 4500,
    distance: 32,
    duration: "45 mins",
    bookingStatus: "confirmed",
    paymentStatus: "paid",
    createdDate: "2024-03-14 12:30",
  },
  {
    id: "7",
    bookingId: "TR-8939",
    customer: "Anna Garcia",
    customerEmail: "anna.g@email.com",
    pickup: "Kandy City",
    destination: "Nuwara Eliya",
    pickupDate: "2024-03-24",
    pickupTime: "10:00",
    passengers: 5,
    luggage: 6,
    vehicleCategory: "Luxury Van",
    estimatedFare: 12500,
    distance: 78,
    duration: "2.5 hours",
    bookingStatus: "pending",
    paymentStatus: "unpaid",
    createdDate: "2024-03-18 09:20",
  },
  {
    id: "8",
    bookingId: "TR-8938",
    customer: "Robert Lee",
    customerEmail: "r.lee@email.com",
    pickup: "Mirissa Beach Resort",
    destination: "Galle",
    pickupDate: "2024-03-21",
    pickupTime: "15:00",
    passengers: 2,
    luggage: 3,
    vehicleCategory: "Standard Car",
    estimatedFare: 3200,
    distance: 28,
    duration: "35 mins",
    bookingStatus: "cancelled",
    paymentStatus: "refunded",
    createdDate: "2024-03-12 14:50",
  },
];

export function TransferRequestsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const statusTabs = [
    { id: "all", label: "All", count: SAMPLE_REQUESTS.length },
    { id: "pending", label: "Pending", count: SAMPLE_REQUESTS.filter(r => r.bookingStatus === "pending").length },
    { id: "confirmed", label: "Confirmed", count: SAMPLE_REQUESTS.filter(r => r.bookingStatus === "confirmed").length },
    { id: "completed", label: "Completed", count: SAMPLE_REQUESTS.filter(r => r.bookingStatus === "completed").length },
    { id: "cancelled", label: "Cancelled", count: SAMPLE_REQUESTS.filter(r => r.bookingStatus === "cancelled").length },
  ];

  const filteredRequests = SAMPLE_REQUESTS.filter((request) => {
    const matchStatus = filterStatus === "all" || request.bookingStatus === filterStatus;
    const matchSearch = !search ||
      request.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      request.customer.toLowerCase().includes(search.toLowerCase()) ||
      request.pickup.toLowerCase().includes(search.toLowerCase()) ||
      request.destination.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleViewRequest = (request: TransferRequest) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  };

  // Calculate stats
  const stats = {
    totalRequests: SAMPLE_REQUESTS.length,
    pendingRequests: SAMPLE_REQUESTS.filter(r => r.bookingStatus === "pending").length,
    totalRevenue: SAMPLE_REQUESTS.filter(r => r.paymentStatus === "paid").reduce((sum, r) => sum + r.estimatedFare, 0),
    avgFare: Math.round(SAMPLE_REQUESTS.reduce((sum, r) => sum + r.estimatedFare, 0) / SAMPLE_REQUESTS.length),
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Transfer Request Queue
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Manage all transfer booking requests and operations
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
              style={{ background: "rgba(59, 130, 246, 0.1)" }}
            >
              <MapPin size={18} style={{ color: "#3b82f6" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Total Requests
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.totalRequests}
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
            Pending Approval
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {stats.pendingRequests}
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
              <DollarSign size={18} style={{ color: "var(--success)" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Total Revenue
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            LKR {stats.totalRevenue.toLocaleString()}
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
              style={{ background: "rgba(8, 145, 178, 0.1)" }}
            >
              <TrendingUp size={18} style={{ color: "#0891b2" }} />
            </div>
          </div>
          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            Average Fare
          </p>
          <p className="text-[20px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            LKR {stats.avgFare.toLocaleString()}
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
                placeholder="Search by booking ID, customer, location..."
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
                  BOOKING ID
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  CUSTOMER
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  PICKUP
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  DESTINATION
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  PICKUP DATE/TIME
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  PAX
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  VEHICLE
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  FARE
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  BOOKING
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  PAYMENT
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  className="group cursor-pointer transition-all"
                  style={{ borderBottom: "1px solid var(--border-light)" }}
                  onClick={() => handleViewRequest(request)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {request.bookingId}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                      {request.customer}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {request.customerEmail}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {request.pickup}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {request.destination}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px]" style={{ color: "var(--text-primary)" }}>
                      {request.pickupDate}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {request.pickupTime}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Users size={12} style={{ color: "var(--text-tertiary)" }} />
                      <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {request.passengers}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] px-2.5 py-1 rounded"
                      style={{
                        background: "var(--input-background)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {request.vehicleCategory}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      LKR {request.estimatedFare.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: BOOKING_STATUS_CONFIG[request.bookingStatus].dot }}
                      />
                      <span
                        className="text-[12px] capitalize"
                        style={{ color: BOOKING_STATUS_CONFIG[request.bookingStatus].text }}
                      >
                        {request.bookingStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] px-2 py-0.5 rounded capitalize"
                      style={{
                        background: PAYMENT_STATUS_CONFIG[request.paymentStatus].bg,
                        color: PAYMENT_STATUS_CONFIG[request.paymentStatus].text,
                      }}
                    >
                      {request.paymentStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewRequest(request);
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

      {/* Transfer Request Drawer */}
      {drawerOpen && selectedRequest && (
        <TransferRequestDrawer
          request={selectedRequest}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}

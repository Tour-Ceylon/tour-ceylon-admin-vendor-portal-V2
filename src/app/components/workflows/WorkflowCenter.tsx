import { useState } from "react";
import {
  ShoppingBag,
  UserCheck,
  Package,
  Truck,
  DollarSign,
  RefreshCcw,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Shield,
  FileText,
} from "lucide-react";

type WorkflowType = "booking" | "vendor" | "listing" | "transport" | "payment" | "refund";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  actor: "customer" | "vendor" | "admin" | "system";
  status?: "success" | "pending" | "review" | "failed";
  actions?: string[];
  failurePoint?: string;
  branches?: Array<{
    condition: string;
    nextStep: string;
  }>;
}

interface Workflow {
  id: WorkflowType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  steps: WorkflowStep[];
}

export function WorkflowCenter() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>("booking");

  const workflows: Workflow[] = [
    {
      id: "booking",
      title: "Customer Booking Flow",
      description: "End-to-end booking process from search to completion",
      icon: ShoppingBag,
      color: "#3b82f6",
      steps: [
        {
          id: "search",
          title: "Customer Searches Listings",
          description: "Customer browses stays, tours, safaris, or experiences",
          actor: "customer",
          actions: ["Browse catalog", "Filter by category", "View listing details"],
        },
        {
          id: "select",
          title: "Select Package & Date",
          description: "Customer selects desired package and travel dates",
          actor: "customer",
          status: "pending",
          actions: ["Choose dates", "Select guests", "Review pricing"],
        },
        {
          id: "contact",
          title: "Enter Contact Details",
          description: "Customer provides contact and traveler information",
          actor: "customer",
          actions: ["Enter email", "Provide phone", "Add special requests"],
        },
        {
          id: "payment",
          title: "Payment / Request",
          description: "Customer completes payment or submits booking request",
          actor: "customer",
          status: "review",
          failurePoint: "Payment can fail here - retry or alternative payment required",
          branches: [
            { condition: "Payment success", nextStep: "booking-created" },
            { condition: "Payment failed", nextStep: "payment" },
          ],
        },
        {
          id: "booking-created",
          title: "Booking Created",
          description: "System creates booking record with pending status",
          actor: "system",
          status: "success",
          actions: ["Generate booking ID", "Send confirmation email", "Notify vendor"],
        },
        {
          id: "vendor-confirm",
          title: "Vendor/Admin Confirmation",
          description: "Vendor or admin reviews and confirms the booking",
          actor: "vendor",
          status: "review",
          failurePoint: "Vendor may reject if dates unavailable or capacity full",
          actions: ["Review booking details", "Check availability", "Confirm or reject"],
          branches: [
            { condition: "Confirmed", nextStep: "customer-notified" },
            { condition: "Rejected", nextStep: "refund" },
          ],
        },
        {
          id: "customer-notified",
          title: "Customer Notification",
          description: "Customer receives booking confirmation notification",
          actor: "system",
          status: "success",
          actions: ["Send email confirmation", "Update booking status", "Share booking voucher"],
        },
        {
          id: "service-delivered",
          title: "Service Delivered",
          description: "Customer completes the experience/stay",
          actor: "vendor",
          status: "success",
          actions: ["Provide service", "Mark booking complete"],
        },
        {
          id: "review",
          title: "Customer Review",
          description: "Customer submits rating and review",
          actor: "customer",
          actions: ["Rate experience", "Write review", "Upload photos"],
        },
      ],
    },
    {
      id: "vendor",
      title: "Vendor Onboarding Flow",
      description: "Complete vendor registration and approval process",
      icon: UserCheck,
      color: "#f59e0b",
      steps: [
        {
          id: "register",
          title: "User Registration",
          description: "User creates account on the platform",
          actor: "customer",
          actions: ["Enter email & password", "Verify email", "Complete profile"],
        },
        {
          id: "apply",
          title: "Apply as Vendor",
          description: "User submits vendor application",
          actor: "customer",
          status: "pending",
          actions: ["Click 'Become a Vendor'", "Select vendor type", "Start application"],
        },
        {
          id: "business-details",
          title: "Submit Business Details",
          description: "Vendor provides business information and documents",
          actor: "vendor",
          status: "review",
          actions: [
            "Business name & registration",
            "Tax documents",
            "Bank account details",
            "Upload certifications",
            "Provide contact info",
          ],
        },
        {
          id: "admin-review",
          title: "Admin Reviews Application",
          description: "Admin verifies vendor credentials and business legitimacy",
          actor: "admin",
          status: "review",
          failurePoint: "Admin may request additional documentation or reject application",
          actions: ["Verify documents", "Check business registration", "Assess category fit"],
          branches: [
            { condition: "Approved", nextStep: "vendor-approved" },
            { condition: "Rejected", nextStep: "vendor-rejected" },
            { condition: "More info needed", nextStep: "business-details" },
          ],
        },
        {
          id: "vendor-approved",
          title: "Vendor Approved",
          description: "Vendor account is approved and activated",
          actor: "system",
          status: "success",
          actions: ["Activate vendor account", "Send approval email", "Grant category access"],
        },
        {
          id: "vendor-rejected",
          title: "Application Rejected",
          description: "Vendor application is rejected with reason",
          actor: "system",
          status: "failed",
          actions: ["Send rejection email", "Provide rejection reason", "Allow reapplication"],
        },
        {
          id: "category-access",
          title: "Category Access Granted",
          description: "Vendor can now create listings in approved categories",
          actor: "system",
          status: "success",
          actions: ["Enable listing creation", "Show vendor dashboard", "Provide onboarding guide"],
        },
        {
          id: "create-listing",
          title: "Vendor Creates First Listing",
          description: "Vendor creates their first listing/package",
          actor: "vendor",
          actions: ["Add listing details", "Upload photos", "Set pricing", "Submit for approval"],
        },
      ],
    },
    {
      id: "listing",
      title: "Listing Approval Flow",
      description: "Listing creation and approval workflow",
      icon: Package,
      color: "#10b981",
      steps: [
        {
          id: "create-draft",
          title: "Vendor Creates Listing",
          description: "Vendor starts creating a new listing",
          actor: "vendor",
          actions: ["Select category", "Add title & description", "Upload images", "Set pricing"],
        },
        {
          id: "save-draft",
          title: "Save as Draft",
          description: "Listing saved but not submitted for review",
          actor: "vendor",
          status: "pending",
          actions: ["Auto-save progress", "Preview listing", "Edit details"],
        },
        {
          id: "submit-review",
          title: "Submit for Review",
          description: "Vendor submits listing for admin approval",
          actor: "vendor",
          status: "review",
          actions: ["Final review", "Submit to admin", "Listing status: pending review"],
        },
        {
          id: "admin-review",
          title: "Admin Reviews Listing",
          description: "Admin checks listing quality, accuracy, and compliance",
          actor: "admin",
          status: "review",
          failurePoint: "Admin may reject or request changes",
          actions: [
            "Verify photos quality",
            "Check description accuracy",
            "Review pricing",
            "Ensure policy compliance",
          ],
          branches: [
            { condition: "Approved", nextStep: "listing-live" },
            { condition: "Rejected", nextStep: "listing-rejected" },
            { condition: "Changes needed", nextStep: "changes-requested" },
          ],
        },
        {
          id: "listing-live",
          title: "Listing Goes Live",
          description: "Listing is published and visible to customers",
          actor: "system",
          status: "success",
          actions: ["Publish listing", "Notify vendor", "Make searchable", "Send confirmation email"],
        },
        {
          id: "listing-rejected",
          title: "Listing Rejected",
          description: "Listing does not meet platform standards",
          actor: "system",
          status: "failed",
          actions: ["Send rejection reason", "Notify vendor", "Allow resubmission"],
        },
        {
          id: "changes-requested",
          title: "Changes Requested",
          description: "Admin requests specific changes before approval",
          actor: "admin",
          status: "review",
          actions: ["List required changes", "Notify vendor", "Return to draft"],
        },
      ],
    },
    {
      id: "transport",
      title: "Transport Booking Flow",
      description: "Airport transfer and transport request workflow",
      icon: Truck,
      color: "#8b5cf6",
      steps: [
        {
          id: "search-route",
          title: "Customer Searches Route",
          description: "Customer enters pickup and destination",
          actor: "customer",
          actions: ["Enter pickup location", "Enter destination", "Select date & time"],
        },
        {
          id: "select-vehicle",
          title: "Select Vehicle Type",
          description: "Customer chooses vehicle category",
          actor: "customer",
          status: "pending",
          actions: ["View vehicle options", "Compare pricing", "Select vehicle type"],
        },
        {
          id: "contact-details",
          title: "Submit Contact Details",
          description: "Customer provides contact and flight information",
          actor: "customer",
          actions: ["Enter contact info", "Provide flight details", "Add special requests"],
        },
        {
          id: "request-created",
          title: "Transfer Request Created",
          description: "System creates transfer request",
          actor: "system",
          status: "success",
          actions: ["Generate transfer ID", "Send request confirmation", "Notify admin"],
        },
        {
          id: "admin-confirm",
          title: "Admin Confirms Transfer",
          description: "Admin assigns vehicle and confirms availability",
          actor: "admin",
          status: "review",
          failurePoint: "No vehicles available or route not serviced",
          actions: ["Assign vehicle", "Confirm driver", "Set final price"],
          branches: [
            { condition: "Confirmed", nextStep: "payment-status" },
            { condition: "Rejected", nextStep: "request-rejected" },
          ],
        },
        {
          id: "payment-status",
          title: "Payment / Pay Later",
          description: "Customer pays or chooses pay later option",
          actor: "customer",
          status: "pending",
          actions: ["Complete payment", "Choose pay later", "Receive booking voucher"],
        },
        {
          id: "booking-complete",
          title: "Transfer Booking Complete",
          description: "Transfer is confirmed and scheduled",
          actor: "system",
          status: "success",
          actions: ["Send driver details", "Share tracking link", "Confirm pickup time"],
        },
        {
          id: "request-rejected",
          title: "Request Rejected",
          description: "Transfer cannot be fulfilled",
          actor: "system",
          status: "failed",
          actions: ["Send rejection reason", "Suggest alternatives", "Issue refund if paid"],
        },
      ],
    },
    {
      id: "payment",
      title: "Payment & Payout Flow",
      description: "Complete payment processing and vendor payout workflow",
      icon: DollarSign,
      color: "#22c55e",
      steps: [
        {
          id: "customer-payment",
          title: "Customer Payment",
          description: "Customer completes payment for booking",
          actor: "customer",
          status: "pending",
          actions: ["Enter payment details", "Complete transaction", "Receive receipt"],
        },
        {
          id: "commission-calc",
          title: "Platform Commission Calculated",
          description: "System calculates platform commission",
          actor: "system",
          status: "success",
          actions: ["Apply commission rate", "Calculate vendor earnings", "Record transaction"],
        },
        {
          id: "vendor-earnings",
          title: "Vendor Earnings Updated",
          description: "Vendor's pending earnings are updated",
          actor: "system",
          status: "success",
          actions: ["Add to vendor balance", "Update earnings dashboard", "Track by booking"],
        },
        {
          id: "payout-pending",
          title: "Payout Pending",
          description: "Earnings await payout schedule or threshold",
          actor: "system",
          status: "pending",
          actions: ["Hold until payout date", "Check minimum threshold", "Queue for processing"],
        },
        {
          id: "admin-approves",
          title: "Admin Approves Payout",
          description: "Admin reviews and approves vendor payout",
          actor: "admin",
          status: "review",
          failurePoint: "Payout may be held for verification or fraud checks",
          actions: ["Verify vendor account", "Check transaction history", "Approve payout batch"],
          branches: [
            { condition: "Approved", nextStep: "payout-completed" },
            { condition: "On hold", nextStep: "payout-pending" },
          ],
        },
        {
          id: "payout-completed",
          title: "Payout Completed",
          description: "Funds transferred to vendor account",
          actor: "system",
          status: "success",
          actions: ["Transfer funds", "Send payout confirmation", "Update vendor balance", "Generate payout report"],
        },
      ],
    },
    {
      id: "refund",
      title: "Refund / Cancellation Flow",
      description: "Customer cancellation and refund processing",
      icon: RefreshCcw,
      color: "#ef4444",
      steps: [
        {
          id: "cancel-request",
          title: "Customer Requests Cancellation",
          description: "Customer initiates cancellation or refund request",
          actor: "customer",
          actions: ["Select booking", "Choose cancellation reason", "Submit request"],
        },
        {
          id: "review-policy",
          title: "System Checks Cancellation Policy",
          description: "Automated policy check for refund eligibility",
          actor: "system",
          status: "review",
          actions: ["Check booking date", "Apply cancellation policy", "Calculate refund amount"],
        },
        {
          id: "admin-vendor-review",
          title: "Admin/Vendor Reviews Request",
          description: "Human review of cancellation request",
          actor: "admin",
          status: "review",
          failurePoint: "Request may be denied based on policy or timing",
          actions: ["Review cancellation reason", "Check vendor policy", "Assess refund eligibility"],
          branches: [
            { condition: "Full refund approved", nextStep: "refund-decision" },
            { condition: "Partial refund", nextStep: "refund-decision" },
            { condition: "Denied", nextStep: "refund-denied" },
          ],
        },
        {
          id: "refund-decision",
          title: "Refund Decision Made",
          description: "Refund amount and method determined",
          actor: "admin",
          status: "success",
          actions: ["Set refund amount", "Choose refund method", "Approve refund"],
        },
        {
          id: "payment-updated",
          title: "Payment Status Updated",
          description: "Booking payment status changed to refunded",
          actor: "system",
          status: "success",
          actions: ["Update booking status", "Reverse vendor earnings", "Process refund transaction"],
        },
        {
          id: "customer-notified",
          title: "Customer Notified",
          description: "Customer receives refund confirmation",
          actor: "system",
          status: "success",
          actions: ["Send refund email", "Provide refund timeline", "Update customer balance"],
        },
        {
          id: "refund-denied",
          title: "Refund Denied",
          description: "Cancellation request is rejected",
          actor: "system",
          status: "failed",
          actions: ["Send denial reason", "Explain policy", "Offer alternatives"],
        },
      ],
    },
  ];

  const currentWorkflow = workflows.find((w) => w.id === selectedWorkflow)!;

  const getActorConfig = (actor: WorkflowStep["actor"]) => {
    switch (actor) {
      case "customer":
        return { icon: User, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", label: "Customer" };
      case "vendor":
        return { icon: ShoppingBag, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Vendor" };
      case "admin":
        return { icon: Shield, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", label: "Admin" };
      case "system":
        return { icon: FileText, color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "System" };
    }
  };

  const getStatusConfig = (status?: WorkflowStep["status"]) => {
    switch (status) {
      case "success":
        return { icon: CheckCircle, color: "#22c55e", label: "Success" };
      case "pending":
        return { icon: Clock, color: "#f59e0b", label: "Pending" };
      case "review":
        return { icon: AlertTriangle, color: "#8b5cf6", label: "Review" };
      case "failed":
        return { icon: XCircle, color: "#ef4444", label: "Failed" };
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Workflow Center
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          End-to-end business process maps for all platform operations
        </p>
      </div>

      {/* Workflow Selector */}
      <div className="grid grid-cols-6 gap-4">
        {workflows.map((workflow) => {
          const Icon = workflow.icon;
          const isSelected = selectedWorkflow === workflow.id;

          return (
            <button
              key={workflow.id}
              onClick={() => setSelectedWorkflow(workflow.id)}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                background: isSelected ? "var(--active-overlay)" : "var(--bg-panel)",
                border: isSelected ? "1px solid var(--border-accent)" : "1px solid var(--border-light)",
                boxShadow: isSelected ? "var(--shadow-lg)" : "var(--shadow-md)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${workflow.color}15` }}
              >
                <Icon size={18} style={{ color: workflow.color }} />
              </div>
              <h3 className="text-[12px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {workflow.title}
              </h3>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)", lineHeight: 1.4 }}>
                {workflow.steps.length} steps
              </p>
            </button>
          );
        })}
      </div>

      {/* Current Workflow */}
      <div
        className="rounded-xl p-6"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ background: `${currentWorkflow.color}15` }}
          >
            <currentWorkflow.icon size={24} style={{ color: currentWorkflow.color }} />
          </div>
          <div className="flex-1">
            <h2 className="text-[18px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {currentWorkflow.title}
            </h2>
            <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              {currentWorkflow.description}
            </p>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-4">
          {currentWorkflow.steps.map((step, index) => {
            const isLast = index === currentWorkflow.steps.length - 1;
            const actorConfig = getActorConfig(step.actor);
            const statusConfig = getStatusConfig(step.status);
            const ActorIcon = actorConfig.icon;

            return (
              <div key={step.id} className="relative">
                {/* Connecting Line */}
                {!isLast && (
                  <div
                    className="absolute left-6 top-16 bottom-0 w-0.5"
                    style={{
                      background: "var(--border-medium)",
                      transform: "translateX(-50%)",
                    }}
                  />
                )}

                {/* Step Card */}
                <div
                  className="rounded-xl p-5 relative"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Step Number & Icon */}
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center relative z-10"
                        style={{
                          background: actorConfig.bg,
                          border: `2px solid ${actorConfig.color}`,
                        }}
                      >
                        <span className="text-[14px]" style={{ color: actorConfig.color, fontWeight: 700 }}>
                          {index + 1}
                        </span>
                      </div>
                      <div
                        className="px-2 py-1 rounded text-[10px] flex items-center gap-1"
                        style={{
                          background: actorConfig.bg,
                          color: actorConfig.color,
                          fontWeight: 600,
                        }}
                      >
                        <ActorIcon size={10} />
                        {actorConfig.label}
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                              {step.title}
                            </h3>
                            {statusConfig && (
                              <div
                                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                                style={{
                                  background: `${statusConfig.color}15`,
                                  color: statusConfig.color,
                                  fontWeight: 600,
                                }}
                              >
                                <statusConfig.icon size={10} />
                                {statusConfig.label}
                              </div>
                            )}
                          </div>
                          <p className="text-[12px] mb-3" style={{ color: "var(--text-secondary)" }}>
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      {step.actions && step.actions.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                            ACTIONS:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {step.actions.map((action, i) => (
                              <div
                                key={i}
                                className="px-2.5 py-1 rounded text-[11px]"
                                style={{
                                  background: "var(--bg-panel)",
                                  border: "1px solid var(--border-light)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {action}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Failure Point */}
                      {step.failurePoint && (
                        <div
                          className="p-3 rounded-lg mb-3"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <AlertTriangle size={14} style={{ color: "#ef4444", marginTop: 2 }} />
                            <div>
                              <p className="text-[11px] mb-1" style={{ color: "#ef4444", fontWeight: 600 }}>
                                FAILURE POINT
                              </p>
                              <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                                {step.failurePoint}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Branches */}
                      {step.branches && step.branches.length > 0 && (
                        <div>
                          <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                            DECISION BRANCHES:
                          </p>
                          <div className="space-y-2">
                            {step.branches.map((branch, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 p-2 rounded"
                                style={{
                                  background: "var(--bg-panel)",
                                  border: "1px solid var(--border-light)",
                                }}
                              >
                                <ChevronRight size={12} style={{ color: "var(--accent-navy-light)" }} />
                                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                                  {branch.condition}
                                </span>
                                <ChevronRight size={10} style={{ color: "var(--text-tertiary)" }} />
                                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                                  {currentWorkflow.steps.find((s) => s.id === branch.nextStep)?.title || branch.nextStep}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h3 className="text-[13px] mb-4" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Workflow Legend
        </h3>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
              ACTORS
            </p>
            <div className="space-y-2">
              {["customer", "vendor", "admin", "system"].map((actor) => {
                const config = getActorConfig(actor as WorkflowStep["actor"]);
                const Icon = config.icon;
                return (
                  <div key={actor} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ background: config.bg }}
                    >
                      <Icon size={12} style={{ color: config.color }} />
                    </div>
                    <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
              STATUS
            </p>
            <div className="space-y-2">
              {(["success", "pending", "review", "failed"] as const).map((status) => {
                const config = getStatusConfig(status)!;
                const Icon = config.icon;
                return (
                  <div key={status} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ background: `${config.color}15` }}
                    >
                      <Icon size={12} style={{ color: config.color }} />
                    </div>
                    <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
              KEY INDICATORS
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={12} style={{ color: "#ef4444" }} />
                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  Failure Point
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight size={12} style={{ color: "var(--accent-navy-light)" }} />
                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  Decision Branch
                </span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
              WORKFLOW TYPES
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: "#3b82f6" }} />
                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  Booking Flows
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: "#f59e0b" }} />
                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  Vendor Ops
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  Finance Ops
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

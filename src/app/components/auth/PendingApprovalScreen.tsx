import { useNavigate } from "react-router";
import { Compass, Clock, CheckCircle, XCircle, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function PendingApprovalScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const steps = [
    {
      label: "Application Submitted",
      status: "completed",
      date: "May 18, 2026",
    },
    {
      label: "Under Review",
      status: "current",
      date: "In Progress",
    },
    {
      label: "Approved",
      status: "pending",
      date: "Pending",
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--bg-main)" }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
              boxShadow: "0 0 24px var(--border-accent)",
            }}
          >
            <Compass size={32} className="text-white" />
          </div>
          <h1 className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Application Under Review
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>
            Your vendor application is being reviewed by our team
          </p>
        </div>

        {/* Status Card */}
        <div
          className="rounded-xl p-8"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Application Details */}
          <div
            className="rounded-lg p-4 mb-6"
            style={{
              background: "var(--accent-navy-subtle)",
              border: "1px solid var(--border-accent)",
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Business Name
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {user?.company || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Email
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {user?.email}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Application ID
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {user?.id}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <Clock size={14} style={{ color: "var(--warning)" }} />
                  <span className="text-[13px]" style={{ color: "var(--warning)", fontWeight: 500 }}>
                    Pending Review
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4 mb-8">
            {steps.map((step, index) => {
              const isCompleted = step.status === "completed";
              const isCurrent = step.status === "current";
              const isPending = step.status === "pending";

              return (
                <div key={index} className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: isCompleted
                        ? "rgba(34, 197, 94, 0.15)"
                        : isCurrent
                        ? "var(--active-overlay)"
                        : "var(--input-background)",
                      border: isCompleted
                        ? "1px solid var(--success)"
                        : isCurrent
                        ? "1px solid var(--border-accent)"
                        : "1px solid var(--border-light)",
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle size={18} style={{ color: "var(--success)" }} />
                    ) : isCurrent ? (
                      <Clock size={18} style={{ color: "var(--accent-navy-light)" }} />
                    ) : (
                      <XCircle size={18} style={{ color: "var(--text-tertiary)" }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p
                      className="text-[14px] mb-0.5"
                      style={{
                        color: isCompleted || isCurrent ? "var(--text-primary)" : "var(--text-tertiary)",
                        fontWeight: 500,
                      }}
                    >
                      {step.label}
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                      {step.date}
                    </p>
                  </div>

                  {/* Connector */}
                  {index < steps.length - 1 && (
                    <div
                      className="absolute left-5 w-0.5 h-8 mt-12"
                      style={{
                        background: isCompleted ? "var(--success)" : "var(--border-light)",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div
            className="rounded-lg p-4 mb-6"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
            }}
          >
            <h3 className="text-[13px] mb-2" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              What happens next?
            </h3>
            <ul className="space-y-2">
              {[
                "Our team will review your application within 2-3 business days",
                "You'll receive an email notification once the review is complete",
                "Upon approval, you'll gain access to your vendor dashboard",
                "You can start creating and managing your listings immediately",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[12px] mt-0.5" style={{ color: "var(--accent-navy-light)" }}>
                    •
                  </span>
                  <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] transition-all"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border-light)",
              }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
            <button
              className="flex-1 py-2.5 rounded-lg text-[13px] transition-all"
              style={{
                background: "var(--input-background)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-light)",
                cursor: "not-allowed",
              }}
              disabled
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

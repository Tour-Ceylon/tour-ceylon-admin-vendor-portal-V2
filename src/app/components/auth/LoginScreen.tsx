import { Compass } from "lucide-react";
import { SignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router";

export function LoginScreen() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 flex-col"
      style={{ background: "var(--bg-main)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse"
            style={{
              background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
              boxShadow: "0 0 24px var(--border-accent)",
            }}
          >
            <Compass size={32} className="text-white" />
          </div>
          <h1 className="text-[24px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Voyage Admin
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>
            Travel Marketplace Management Platform
          </p>
        </div>

        {/* Clerk Sign In Component Wrapper */}
        <div className="flex justify-center">
          <SignIn
            path="/login"
            routing="path"
            signUpUrl="/register"
            forceRedirectUrl="/dashboard"
            appearance={{
              variables: {
                colorPrimary: '#3b82f6',
                colorBackground: '#0b1329',
                colorText: '#f1f5f9',
                colorInputBackground: '#131e3d',
                colorInputText: '#f1f5f9',
                colorBorder: '#1e293b',
              },
              elements: {
                cardBox: {
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                },
                card: {
                  background: '#0b1329',
                },
                headerTitle: {
                  color: '#f1f5f9',
                  fontWeight: '700',
                  fontSize: '18px',
                },
                headerSubtitle: {
                  color: '#94a3b8',
                },
                socialButtonsBlockButton: {
                  background: '#131e3d',
                  border: '1px solid #1e293b',
                  color: '#f1f5f9',
                  '&:hover': {
                    background: '#1c2d5a',
                  }
                },
                socialButtonsBlockButtonText: {
                  color: '#f1f5f9',
                },
                dividerText: {
                  color: '#64748b',
                },
                dividerLine: {
                  background: '#1e293b',
                },
                formFieldLabel: {
                  color: '#94a3b8',
                },
                formFieldInput: {
                  background: '#131e3d',
                  border: '1px solid #1e293b',
                  color: '#f1f5f9',
                  '&:focus': {
                    borderColor: '#3b82f6',
                  }
                },
                formButtonPrimary: {
                  background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                  border: '1px solid #3b82f6',
                  color: '#ffffff',
                  boxShadow: '0 0 12px rgba(59, 130, 246, 0.2)',
                  fontWeight: '600',
                  '&:hover': {
                    background: '#1e293b',
                  }
                },
                footerActionText: {
                  color: '#94a3b8',
                },
                footerActionLink: {
                  color: '#3b82f6',
                  fontWeight: '600',
                  '&:hover': {
                    color: '#60a5fa',
                  }
                }
              }
            }}
          />
        </div>

        {/* Vendor Registration Link */}
        <div className="mt-6 text-center">
          <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            Applying as a new travel provider?{" "}
            <button
              onClick={() => navigate("/register")}
              className="transition-all hover:underline"
              style={{ color: "var(--accent-navy-light)", fontWeight: 600 }}
            >
              Apply as Vendor
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

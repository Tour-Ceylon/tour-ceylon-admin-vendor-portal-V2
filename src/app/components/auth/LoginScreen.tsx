import { useState } from "react";
import { useNavigate } from "react-router";
import { useSignIn } from "@clerk/clerk-react";
import { Compass, Eye, EyeOff, ArrowRight } from "lucide-react";

export function LoginScreen() {
  const navigate = useNavigate();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Step 2: OTP / second-factor state ──────────────────────────────────
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // ── Email + Password Sign-in ────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/dashboard");
      } else if (
        result.status === "needs_first_factor" ||
        result.status === "needs_second_factor"
      ) {
        // Clerk requires an extra verification step (email code / TOTP / SMS).
        // Determine which strategy to use and prepare the factor.
        const factors =
          result.status === "needs_first_factor"
            ? result.supportedFirstFactors
            : result.supportedSecondFactors;

        // Prefer email_code → phone_code → totp, in that order
        const emailFactor = factors?.find((f: any) => f.strategy === "email_code");
        const phoneFactor = factors?.find((f: any) => f.strategy === "phone_code");
        const totpFactor = factors?.find((f: any) => f.strategy === "totp");

        if (emailFactor) {
          // Trigger Clerk to send the verification email
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: (emailFactor as any).emailAddressId,
          });
        } else if (phoneFactor) {
          await signIn.prepareFirstFactor({
            strategy: "phone_code",
            phoneNumberId: (phoneFactor as any).phoneNumberId,
          });
        } else if (totpFactor) {
          // TOTP doesn't need preparation — user opens their authenticator app
        }

        setPendingVerification(true);
      } else {
        console.warn("Unexpected sign-in status:", result.status, result);
        setError("Sign-in requires additional steps. Please try again or contact support.");
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Invalid email or password. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP / TOTP code ──────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setVerifyLoading(true);
    setError(null);

    try {
      // Try first-factor attempt first; fall through to second-factor if needed
      const attempt = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: verificationCode,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        navigate("/dashboard");
      } else {
        setError("Verification failed. Please check your code and try again.");
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Invalid verification code. Please try again.";
      setError(message);
    } finally {
      setVerifyLoading(false);
    }
  };

  // ── Google OAuth Sign-in ────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return;

    setGoogleLoading(true);
    setError(null);

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/dashboard`,
      });
      // Page will redirect — no further code runs here
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Google sign-in failed. Please try again.";
      setError(message);
      setGoogleLoading(false);
    }
  };

  // ── Render: OTP verification step ──────────────────────────────────────
  if (pendingVerification) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "var(--bg-main)" }}
      >
        <div className="w-full max-w-md">
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
              Voyage Admin
            </h1>
            <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>
              Travel Marketplace Management Platform
            </p>
          </div>

          <div
            className="rounded-xl p-6"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <h2
              className="text-[15px] mb-1"
              style={{ color: "var(--text-primary)", fontWeight: 600 }}
            >
              Verify your identity
            </h2>
            <p className="text-[12px] mb-5" style={{ color: "var(--text-tertiary)" }}>
              A verification code was sent to <strong>{email}</strong>. Enter it below to continue.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label
                  className="block text-[12px] mb-1.5"
                  style={{ color: "var(--text-secondary)", fontWeight: 500 }}
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none tracking-widest text-center"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                    letterSpacing: "0.3em",
                  }}
                />
              </div>

              {error && (
                <div
                  className="text-[12px] px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#ef4444",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={verifyLoading || verificationCode.length < 6}
                className="w-full py-2.5 rounded-lg text-[13px] flex items-center justify-center gap-2 transition-all"
                style={{
                  background:
                    verifyLoading || verificationCode.length < 6
                      ? "var(--border-medium)"
                      : "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                  color: "white",
                  boxShadow:
                    verifyLoading || verificationCode.length < 6
                      ? "none"
                      : "0 0 16px var(--border-accent)",
                  border: "1px solid var(--border-accent)",
                  fontWeight: 500,
                  cursor:
                    verifyLoading || verificationCode.length < 6 ? "not-allowed" : "pointer",
                }}
              >
                {verifyLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Sign In</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPendingVerification(false);
                  setVerificationCode("");
                  setError(null);
                }}
                className="w-full text-[12px] py-1.5 transition-all hover:underline"
                style={{ color: "var(--text-tertiary)" }}
              >
                ← Back to sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Normal login form ───────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--bg-main)" }}
    >
      <div className="w-full max-w-md">
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
            Voyage Admin
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>
            Travel Marketplace Management Platform
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <h2 className="text-[15px] mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Sign in
          </h2>
          <p className="text-[12px] mb-5" style={{ color: "var(--text-tertiary)" }}>
            Enter your credentials to access the admin portal
          </p>

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || !isLoaded}
            className="w-full py-2.5 rounded-lg text-[13px] flex items-center justify-center gap-2.5 transition-all mb-4"
            style={{
              background: "var(--bg-main)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
              fontWeight: 500,
              cursor: googleLoading || !isLoaded ? "not-allowed" : "pointer",
              opacity: googleLoading || !isLoaded ? 0.7 : 1,
            }}
          >
            {googleLoading ? (
              <>
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: "var(--text-tertiary)", borderTopColor: "transparent" }}
                />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                {/* Google "G" logo SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: "var(--border-light)" }} />
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              or sign in with email
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--border-light)" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-[12px] mb-1.5"
                style={{ color: "var(--text-secondary)", fontWeight: 500 }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <label
                className="block text-[12px] mb-1.5"
                style={{ color: "var(--text-secondary)", fontWeight: 500 }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-[13px] outline-none"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-tertiary)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="text-[12px] px-3 py-2 rounded-lg"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isLoaded}
              className="w-full py-2.5 rounded-lg text-[13px] flex items-center justify-center gap-2 transition-all"
              style={{
                background:
                  loading || !isLoaded
                    ? "var(--border-medium)"
                    : "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
                color: "white",
                boxShadow: loading || !isLoaded ? "none" : "0 0 16px var(--border-accent)",
                border: "1px solid var(--border-accent)",
                fontWeight: 500,
                cursor: loading || !isLoaded ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Registration Link */}
        <div className="mt-6 text-center">
          <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            Applying as a new travel or transfer partner?{" "}
            <button
              onClick={() => navigate("/register")}
              className="transition-all hover:underline"
              style={{ color: "var(--accent-navy-light)", fontWeight: 600 }}
            >
              Apply as Vendor or Driver
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
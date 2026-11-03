import { Outlet } from "react-router";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key in environment variables.");
}

export function RootLayout() {
  return (
    <ThemeProvider>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY} 
        afterSignOutUrl="/login"
        appearance={{
          baseTheme: undefined,
          variables: {
            colorPrimary: '#1e40af',
          }
        }}
      >
        <AuthProvider>
          {/* UI-13: one toast system. Its provider is mounted once, in App.tsx. */}
          <Outlet />
        </AuthProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}

const BASE_URL = import.meta.env.VITE_API_URL || "https://tour-ceylon-server.vercel.app/api/v1";
const TOKEN_CACHE_TTL_MS = 15_000;

type TokenCacheEntry = {
  sessionId: string | null;
  token: string;
  cachedAt: number;
};

let tokenCache: TokenCacheEntry | null = null;

interface CustomRequestInit extends RequestInit {
  token?: string;
}

function clearTokenCache() {
  tokenCache = null;
}

// Enhanced token retrieval that works with both global Clerk and React SDK
async function getCachedClerkToken(): Promise<string | undefined> {
  // Method 1: Try React SDK approach through window.__clerk_publishable_key
  if (typeof window !== "undefined" && (window as any).__clerk_db_jwt) {
    try {
      return (window as any).__clerk_db_jwt;
    } catch (err) {
      console.debug("Method 1 failed:", err);
    }
  }

  // Method 2: Try global Clerk instance
  if (typeof window !== "undefined" && (window as any).Clerk) {
    try {
      const clerk = (window as any).Clerk;
      const session = clerk?.session;
      const sessionId = session?.id ?? null;
      
      if (!session || !sessionId) {
        clearTokenCache();
        return undefined;
      }

      if (
        tokenCache &&
        tokenCache.sessionId === sessionId &&
        Date.now() - tokenCache.cachedAt < TOKEN_CACHE_TTL_MS
      ) {
        return tokenCache.token;
      }

      const token = await session.getToken();
      if (!token) {
        clearTokenCache();
        return undefined;
      }
      
      tokenCache = {
        sessionId,
        token,
        cachedAt: Date.now(),
      };
      return token;
    } catch (err) {
      console.debug("Method 2 failed:", err);
    }
  }

  // Method 3: Try accessing through React context (fallback)
  if (typeof window !== "undefined") {
    try {
      // Look for Clerk instance in React DevTools or context
      const reactRoot = (window as any).document?.querySelector('#root')?._reactInternalFiber || 
                       (window as any).document?.querySelector('#root')?._reactInternals;
      if (reactRoot) {
        // This is a fallback - in practice, token should be passed explicitly
        console.debug("React root found, but token should be passed explicitly to apiClient");
      }
    } catch (err) {
      console.debug("Method 3 failed:", err);
    }
  }

  clearTokenCache();
  return undefined;
}

/**
 * Robust API fetch helper that prepends the base URL, automatically
 * fetches and attaches the Clerk Bearer token from the global Clerk instance,
 * and handles response validation.
 */
export async function apiFetch<T = any>(
  path: string,
  options: CustomRequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  // Get token either passed explicitly or from global Clerk session
  let token = options.token;
  if (!token) {
    token = await getCachedClerkToken();
  }

  const headers = new Headers(options.headers || {});
  
  // Set Content-Type by default to JSON unless already set
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Attach token if present
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearTokenCache();
  }

  if (!response.ok) {
    let errorMessage = "An error occurred during the API request.";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // JSON parsing failed, use statusText
      errorMessage = response.statusText || errorMessage;
    }
    
    const error: any = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  // Handle empty or 204 No Content responses gracefully
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("careersim_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      // Attempt silent token refresh before forcing the user to log in
      const refreshToken = localStorage.getItem("careersim_refresh_token");
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();

            // Persist the new tokens
            localStorage.setItem("careersim_token", data.access_token);
            document.cookie = `careersim_token=${data.access_token}; path=/; max-age=604800; SameSite=Lax`;
            if (data.refresh_token) {
              localStorage.setItem("careersim_refresh_token", data.refresh_token);
            }

            // Retry the original request once with the new access token
            const retryHeaders = {
              ...headers,
              Authorization: `Bearer ${data.access_token}`,
            };
            return fetch(`${API_URL}${path}`, { ...options, headers: retryHeaders });
          }
        } catch {
          // Refresh attempt itself failed — fall through to forced logout
        }
      }

      // Refresh also failed or no refresh token — clear session and redirect
      localStorage.removeItem("careersim_token");
      localStorage.removeItem("careersim_refresh_token");
      localStorage.removeItem("careersim_user");
      document.cookie = "careersim_token=; path=/; max-age=0";
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  return response;
}

export const api = {
  get: (path: string) => request(path),

  post: (path: string, body: object) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Streaming variant — returns raw Response so caller can read the body stream
  stream: (path: string, body: object) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: (path: string, body: object) =>
    request(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

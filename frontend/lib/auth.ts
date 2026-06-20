export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("careersim_token");
  },
  setToken: (token: string) => {
    localStorage.setItem("careersim_token", token);
    // Cookie must be set so Next.js middleware can read it on every request
    document.cookie = `careersim_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  },
  removeToken: () => {
    localStorage.removeItem("careersim_token");
    document.cookie = "careersim_token=; path=/; max-age=0";
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("careersim_refresh_token");
  },
  setRefreshToken: (token: string) => {
    localStorage.setItem("careersim_refresh_token", token);
  },
  removeRefreshToken: () => {
    localStorage.removeItem("careersim_refresh_token");
  },

  getUser: (): Record<string, string> | null => {
    if (typeof window === "undefined") return null;
    const u = localStorage.getItem("careersim_user");
    return u ? JSON.parse(u) : null;
  },
  setUser: (user: object) => {
    localStorage.setItem("careersim_user", JSON.stringify(user));
  },
  removeUser: () => {
    localStorage.removeItem("careersim_user");
  },

  clear: () => {
    localStorage.removeItem("careersim_token");
    localStorage.removeItem("careersim_refresh_token");
    localStorage.removeItem("careersim_user");
    // Also clear per-session review data so a different user logging in
    // on the same browser doesn't see the previous user's review/passport
    localStorage.removeItem("careersim_review");
    localStorage.removeItem("careersim_github_url");
    document.cookie = "careersim_token=; path=/; max-age=0";
  },
};

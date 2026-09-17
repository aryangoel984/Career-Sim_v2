"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  full_name: string;
  career?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Restore session from localStorage on every page load.
    // This MUST complete before any protected page checks auth state.
    const storedUser = authStorage.getUser();
    const token = authStorage.getToken();
    if (storedUser && token) {
      setUser(storedUser as User);
      setIsDemo(authStorage.getIsDemo());
    }
    setLoading(false);
  }, []);

  const signup = async (fullName: string, email: string, password: string) => {
    const res = await api.post("/api/auth/signup", {
      full_name: fullName,
      email,
      password,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Signup failed");

    // Persist token to both localStorage AND cookie (middleware reads the cookie)
    authStorage.setToken(data.access_token);
    if (data.refresh_token) {
      authStorage.setRefreshToken(data.refresh_token);
    }
    authStorage.setUser(data.user);
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    const res = await api.post("/api/auth/login", { email, password });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");

    // Persist token to both localStorage AND cookie (middleware reads the cookie)
    authStorage.setToken(data.access_token);
    if (data.refresh_token) {
      authStorage.setRefreshToken(data.refresh_token);
    }
    authStorage.setUser(data.user);
    authStorage.setIsDemo(false);
    setUser(data.user);
    setIsDemo(false);
  };

  const loginAsGuest = async () => {
    // Credentials never touch the client — the backend reads them from its
    // own env vars and signs in to the fixed demo Supabase user server-side.
    const res = await api.post("/api/auth/demo-login", {});
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Guest login failed");

    authStorage.setToken(data.access_token);
    if (data.refresh_token) {
      authStorage.setRefreshToken(data.refresh_token);
    }
    authStorage.setUser(data.user);
    authStorage.setIsDemo(true);
    setUser(data.user);
    setIsDemo(true);
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {});
    } catch {
      // Best-effort — clear local state regardless of server response
    }
    authStorage.clear();
    setUser(null);
    setIsDemo(false);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, login, signup, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

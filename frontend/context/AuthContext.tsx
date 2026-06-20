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
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on every page load.
    // This MUST complete before any protected page checks auth state.
    const storedUser = authStorage.getUser();
    const token = authStorage.getToken();
    if (storedUser && token) {
      setUser(storedUser as User);
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
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {});
    } catch {
      // Best-effort — clear local state regardless of server response
    }
    authStorage.clear();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

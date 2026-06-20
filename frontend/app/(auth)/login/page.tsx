"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Icon, Button, Logo } from "@/components/ui/components";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "24px 16px", position: "relative" }}>
      <div className="grid-bg" />
      <div className="glow" />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Logo onClick={() => router.push("/")} />
        </div>

        {/* Card */}
        <div className="card pad-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>Welcome back</h1>
            <p style={{ color: "var(--text-dim)", fontSize: 14.5, marginTop: 8 }}>
              Sign in to continue your simulation.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-dim)", marginBottom: 7 }}>
                Email
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--elevated)", border: "1px solid var(--border)", borderRadius: 11, padding: "0 14px" }}>
                <Icon name="mail" size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
                <input
                  className="chat-input"
                  style={{ border: "none", background: "transparent", padding: "12px 0", width: "100%" }}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-dim)", marginBottom: 7 }}>
                Password
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--elevated)", border: "1px solid var(--border)", borderRadius: 11, padding: "0 14px" }}>
                <Icon name="lock" size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
                <input
                  className="chat-input"
                  style={{ border: "none", background: "transparent", padding: "12px 0", width: "100%" }}
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: "10px 14px", borderRadius: 9, background: "color-mix(in oklch, var(--bad) 12%, transparent)", border: "1px solid color-mix(in oklch, var(--bad) 30%, transparent)", color: "var(--bad)", fontSize: 13.5 }}>
                <Icon name="zap" size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                {error}
              </div>
            )}

            <Button variant="primary" size="lg" type="submit" icon={loading ? undefined : "arrowRight"}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Reveal, Card, Icon, Button, Badge } from "@/components/ui/components";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="app-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.full_name
    ? user.full_name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w: string) => w[0].toUpperCase())
        .join("")
    : "??";

  return (
    <div className="app-page">
      <Reveal>
        <div style={{ textAlign: "left", marginBottom: 28 }}>
          <div className="eyebrow">Account</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 12 }}>Your Profile</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 16, marginTop: 8 }}>
            Manage your account and career settings.
          </p>
        </div>
      </Reveal>

      <div style={{ maxWidth: 640 }}>
        {/* Identity card */}
        <Reveal delay={60}>
          <Card className="pad-lg" style={{ textAlign: "left", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "color-mix(in oklch, var(--accent) 22%, var(--elevated-2))",
                  color: "var(--accent)",
                  border: "2px solid color-mix(in oklch, var(--accent) 40%, transparent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 800,
                  flexShrink: 0,
                  letterSpacing: ".04em",
                }}
              >
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 22 }}>{user.full_name}</div>
                <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{user.email}</div>
                {user.career && (
                  <div style={{ marginTop: 8 }}>
                    <Badge color="var(--accent)">{user.career}</Badge>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Reveal>

        {/* Career path */}
        <Reveal delay={120}>
          <Card className="pad-lg" style={{ textAlign: "left", marginBottom: 20 }}>
            <div className="mw-panel-title" style={{ marginBottom: 12 }}>Career Path</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: "color-mix(in oklch, var(--accent) 14%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--accent) 30%, transparent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="compass" size={20} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {user.career || "Not selected yet"}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                  {user.career ? "Active track" : "Go to Careers to choose your path"}
                </div>
              </div>
            </div>
            {!user.career && (
              <Button
                variant="outline"
                size="md"
                icon="compass"
                iconRight="arrowRight"
                style={{ marginTop: 16 }}
                onClick={() => router.push("/careers")}
              >
                Choose a career
              </Button>
            )}
          </Card>
        </Reveal>

        {/* Quick links */}
        <Reveal delay={180}>
          <Card className="pad-lg" style={{ textAlign: "left", marginBottom: 20 }}>
            <div className="mw-panel-title" style={{ marginBottom: 12 }}>Quick links</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button variant="secondary" size="md" icon="award" onClick={() => router.push("/passport")}>
                Skill Passport
              </Button>
              <Button variant="secondary" size="md" icon="trending" onClick={() => router.push("/report")}>
                Employability Report
              </Button>
              <Button variant="secondary" size="md" icon="briefcase" onClick={() => router.push("/mission")}>
                Mission
              </Button>
            </div>
          </Card>
        </Reveal>

        {/* Logout */}
        <Reveal delay={240}>
          <div style={{ paddingTop: 4 }}>
            <Button
              variant="ghost"
              size="md"
              icon="x"
              onClick={async () => { await logout(); }}
              style={{ color: "var(--c-rose)" }}
            >
              Log out of CareerSim AI
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

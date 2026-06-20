"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Reveal,
  Button,
  Card,
  Badge,
  Icon,
  CountUp,
  ProgressBar,
  RadarChart,
} from "@/components/ui/components";
import { dashboard as d, radar } from "@/lib/data";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if definitely not logged in (after auth context has loaded)
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

  return (
    <div className="app-page">
      <Reveal>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div style={{ textAlign: "left" }}>
            <div className="eyebrow">Dashboard</div>
            <h1 style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 12 }}>Welcome back, {user?.full_name?.split(" ")[0] ?? "there"}.</h1>
            <p style={{ color: "var(--text-dim)", fontSize: 16, marginTop: 8 }}>
              Career path: <span style={{ color: "var(--text)", fontWeight: 600 }}>{user?.career || d.careerPath}</span> · You're <span style={{ color: "var(--accent)", fontWeight: 700 }}>{d.progress}%</span> of the way to job-ready.
            </p>
          </div>
          <Button variant="primary" icon="briefcase" onClick={() => router.push("/mission")}>Resume mission</Button>
        </div>
      </Reveal>

      <div className="dash-grid">
        {/* KPIs */}
        {[
          { lbl: "Overall progress", num: d.progress, suf: "%", icon: "trending", color: "var(--accent)" },
          { lbl: "Missions completed", num: d.missionsCompleted, suf: `/${d.missionsTotal}`, icon: "check", color: "var(--c-emerald)" },
          { lbl: "Day streak", num: d.streak, suf: "", icon: "flame", color: "var(--c-amber)" },
          { lbl: "Hours simulated", num: d.hoursSimulated, suf: "h", icon: "clock", color: "var(--c-cyan)" },
        ].map((k, i) => (
          <Reveal delay={i * 60} key={i} style={{ gridColumn: "span 3" }}>
            <Card className="pad" style={{ height: "100%", textAlign: "left" }}>
              <div className="kpi">
                <div className="lbl"><Icon name={k.icon} size={14} style={{ color: k.color }} /> {k.lbl}</div>
                <div className="num"><CountUp to={k.num} suffix={k.suf} /></div>
              </div>
            </Card>
          </Reveal>
        ))}

        {/* Current mission */}
        <Reveal delay={120} style={{ gridColumn: "span 8" }}>
          <Card className="pad-lg" style={{ height: "100%", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div className="mw-panel-title" style={{ margin: 0 }}>Current mission</div>
              <Badge color="var(--accent)">Day 3 of 5</Badge>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: "var(--elevated-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="building" size={24} style={{ color: "var(--c-cyan)" }} />
              </div>
              <div>
                <h3 style={{ fontSize: 20 }}>{d.currentMission}</h3>
                <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 3 }}>HealthTech Solutions · Manager: Sarah Chen</p>
              </div>
            </div>
            <div style={{ marginTop: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
                <span>Completion</span><span className="mono" style={{ color: "var(--text)" }}>72%</span>
              </div>
              <ProgressBar value={72} height={10} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <Button variant="secondary" size="md" iconRight="arrowRight" onClick={() => router.push("/mission")}>Open workspace</Button>
              <Button variant="ghost" size="md" onClick={() => router.push("/review")}>View latest review</Button>
            </div>
          </Card>
        </Reveal>

        {/* Next skill */}
        <Reveal delay={180} style={{ gridColumn: "span 4" }}>
          <Card className="pad-lg" style={{ height: "100%", display: "flex", flexDirection: "column", textAlign: "left" }}>
            <div className="mw-panel-title">Next recommended skill</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: "color-mix(in oklch,var(--c-amber) 14%,transparent)", border: "1px solid color-mix(in oklch,var(--c-amber) 30%,transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="zap" size={20} style={{ color: "var(--c-amber)" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{d.nextSkill.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Current level {d.nextSkill.value}/100</div>
              </div>
            </div>
            <p style={{ color: "var(--text-dim)", fontSize: 13.5, marginTop: 16, lineHeight: 1.5, flex: 1 }}>{d.nextSkill.reason}</p>
            <div className="mb-4">
              <ProgressBar value={d.nextSkill.value} color="var(--c-amber)" />
            </div>
            <Button variant="outline" size="md" className="" style={{ marginTop: 16 }} iconRight="arrowRight" onClick={() => router.push("/report")}>See roadmap</Button>
          </Card>
        </Reveal>

        {/* Skill radar */}
        <Reveal delay={220} style={{ gridColumn: "span 5" }}>
          <Card className="pad-lg" style={{ height: "100%", textAlign: "left" }}>
            <div className="mw-panel-title">Skill radar</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <RadarChart data={radar} size={300} />
            </div>
          </Card>
        </Reveal>

        {/* Recent feedback */}
        <Reveal delay={260} style={{ gridColumn: "span 7" }}>
          <Card className="pad-lg" style={{ height: "100%", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="mw-panel-title" style={{ margin: 0 }}>Recent feedback</div>
              <button className="appnav-link" onClick={() => router.push("/review")} style={{ color: "var(--accent)" }}>View all <Icon name="chevronRight" size={14} /></button>
            </div>
            <div style={{ marginTop: 8 }}>
              {d.recentFeedback.map((f, i) => (
                <div className="feedback-item" key={i}>
                  <div className="avatar" style={{ background: `color-mix(in oklch, ${f.color} 18%, transparent)`, color: f.color, border: `1px solid color-mix(in oklch, ${f.color} 35%, transparent)` }}>
                    {f.agent.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{f.agent}</span>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>{f.role}</span>
                      <span className="ft" style={{ marginLeft: "auto" }}>{f.time}</span>
                    </div>
                    <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 4 }}>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Reveal,
  ScoreRing,
  Badge,
  Icon,
  Button,
  CountUp,
  ProgressBar,
} from "@/components/ui/components";
import { api } from "@/lib/api";

// Shape returned by the Groq report generator
interface ApiReport {
  readiness: number;
  confidence: string;
  level: string;
  placement_probability: number;
  percentile: number;
  strengths: { title: string; note: string }[];
  weaknesses: { title: string; note: string }[];
  matched_roles: { title: string; company: string; match: number }[];
  roadmap: { month: number; focus: string; actions: string[] }[];
  summary: string;
}

// Normalised shape expected by the existing UI components
interface DisplayReport {
  readiness: number;
  level: string;
  confidence: string;
  placementProbability: number;
  percentile: number;
  strengths: string[];
  weaknesses: string[];
  matchedRoles: { role: string; company: string; match: number }[];
  roadmap: { month: string; focus: string; lift: string; detail: string }[];
  summary: string;
}

function normalise(raw: ApiReport): DisplayReport {
  return {
    readiness: raw.readiness,
    level: raw.level ?? "Junior Engineer",
    confidence: raw.confidence,
    placementProbability: raw.placement_probability,
    percentile: raw.percentile,
    // strengths/weaknesses: use title as the display string, note as tooltip
    strengths: raw.strengths.map((s) => s.note ?? s.title),
    weaknesses: raw.weaknesses.map((w) => w.note ?? w.title),
    matchedRoles: raw.matched_roles.map((m) => ({
      role: m.title,
      company: m.company,
      match: m.match,
    })),
    roadmap: raw.roadmap.map((rm) => ({
      month: `Month ${rm.month}`,
      focus: rm.focus,
      lift: `+${Math.round(Math.random() * 5 + 4)}% readiness`,
      detail: rm.actions.join(" · "),
    })),
    summary: raw.summary,
  };
}

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<DisplayReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await api.get("/api/report/latest");
        if (res.ok) {
          const data: ApiReport = await res.json();
          setReport(normalise(data));
          return;
        }
        // 404 → no report yet (or it's stale), generate one
        if (res.status === 404) {
          await regenerate();
          return;
        }
        throw new Error(`Unexpected status ${res.status}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function regenerate() {
    setGenerating(true);
    setError(null);
    try {
      // Read the cached review from localStorage so we can pass it as a fallback
      // if the reviews DB table is empty (e.g. review was submitted before DB write was deployed)
      let reviewOverride: object[] = [];
      try {
        const raw = localStorage.getItem("careersim_review");
        const missionRaw = localStorage.getItem("careersim_mission");
        if (raw) {
          const parsed = JSON.parse(raw);
          const missionContext = missionRaw ? JSON.parse(missionRaw) : {};
          reviewOverride = [{
            mission: missionContext.project ?? "Unknown project",
            company: missionContext.company ?? "Unknown company",
            overall: parsed.overall ?? 0,
            scores: parsed.scores ?? [],
            strengths: parsed.strengths ?? [],
            weaknesses: parsed.weaknesses ?? [],
            summary: parsed.summary ?? "",
            verified_skills: parsed.verified_skills ?? [],
          }];
        }
      } catch {
        // If localStorage read fails, generate without override — backend will try DB
      }

      const res = await api.post("/api/report/generate", { review_override: reviewOverride });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail ?? `Error ${res.status}`);
      }
      const data: ApiReport = await res.json();
      setReport(normalise(data));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setError(msg);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  }

  // ── Loading state ──────────────────────────────────────────
  if (loading || generating) {
    return (
      <div className="app-page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,var(--accent),var(--accent-soft))", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0a0f" }}>
          <Icon name="sparkles" size={26} />
        </div>
        <span className="spinner" style={{ width: 32, height: 32 }} />
        <p style={{ color: "var(--text-dim)", fontSize: 15 }}>
          {generating ? "Career Coach Agent is analysing your performance…" : "Loading your report…"}
        </p>
      </div>
    );
  }

  // ── Error / no review state ────────────────────────────────
  if (error || !report) {
    return (
      <div className="app-page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <Icon name="fileText" size={40} style={{ color: "var(--muted)" }} />
        <h2 style={{ fontSize: 22 }}>Report unavailable</h2>
        <p style={{ color: "var(--text-dim)", fontSize: 15, maxWidth: "40ch", textAlign: "center" }}>
          {error ?? "Couldn't generate your report."} Complete a mission and submit a code review first.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="primary" icon="upload" onClick={() => router.push("/submission")}>Submit a review</Button>
          <Button variant="secondary" icon="sparkles" onClick={regenerate}>Try again</Button>
        </div>
      </div>
    );
  }

  const r = report;

  // ── Report UI ──────────────────────────────────────────────
  return (
    <div className="app-page">
      <Reveal>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 26 }}>
          <div style={{ textAlign: "left" }}>
            <div className="eyebrow">Career Coach Agent</div>
            <h1 style={{ fontSize: "clamp(28px,4vw,42px)", marginTop: 12 }}>Your employability report</h1>
            <p style={{ color: "var(--text-dim)", fontSize: 16, marginTop: 8 }}>Generated from your verified skills and mission performance.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" icon="sparkles" onClick={regenerate}>Regenerate report</Button>
            <Button variant="primary" icon="download" onClick={() => window.print()}>Download PDF</Button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="report-doc" style={{ textAlign: "left" }}>
          {/* header */}
          <div className="report-head">
            <div style={{ position: "absolute", top: -100, right: -40, width: 320, height: 280,
              background: "radial-gradient(50% 50% at 50% 50%,color-mix(in oklch,var(--accent) 22%,transparent),transparent 70%)", filter: "blur(24px)" }} />
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                <ScoreRing value={r.readiness} size={132} stroke={11} color="var(--accent)" label="ready" />
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em" }}>Industry readiness</div>
                  <h2 style={{ fontSize: 30, marginTop: 6 }}>{r.level}</h2>
                  <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                    <Badge color="var(--good)"><Icon name="trending" size={12} /> Hiring confidence: {r.confidence}</Badge>
                    <Badge color="var(--accent)"><Icon name="users" size={12} /> Top {100 - r.percentile}% of cohort</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="report-kpis">
            {[
              { num: r.readiness, suf: "%", lbl: "Industry readiness", c: "var(--accent)" },
              { num: r.placementProbability, suf: "%", lbl: "Placement probability", c: "var(--good)" },
              { num: r.percentile, suf: "th", lbl: "Cohort percentile", c: "var(--c-cyan)" },
              { num: r.confidence, lbl: "Hiring confidence", c: "var(--c-amber)", text: true },
            ].map((k, i) => (
              <div className="report-kpi" key={i}>
                <div className="num" style={{ color: k.c }}>{k.text ? k.num : <CountUp to={Number(k.num)} suffix={k.suf} />}</div>
                <div className="lbl">{k.lbl}</div>
              </div>
            ))}
          </div>

          {/* body */}
          <div style={{ padding: 36 }}>
            {/* Summary */}
            {r.summary && (
              <div style={{ marginBottom: 32, padding: "18px 20px", borderRadius: 12, background: "var(--elevated)", border: "1px solid var(--border)", fontSize: 15, lineHeight: 1.7, color: "var(--text-dim)" }}>
                {r.summary}
              </div>
            )}

            <div className="sw-grid">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                  <Icon name="check" size={18} style={{ color: "var(--good)" }} />
                  <h3 style={{ fontSize: 17 }}>Top strengths</h3>
                </div>
                {r.strengths.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: i ? "1px solid var(--border)" : "none", alignItems: "center" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: "color-mix(in oklch,var(--good) 16%,transparent)", color: "var(--good)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="check" size={13} /></div>
                    <span style={{ fontSize: 14.5 }}>{s}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                  <Icon name="zap" size={18} style={{ color: "var(--c-amber)" }} />
                  <h3 style={{ fontSize: 17 }}>Top gaps to close</h3>
                </div>
                {r.weaknesses.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: i ? "1px solid var(--border)" : "none", alignItems: "center" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: "color-mix(in oklch,var(--c-amber) 16%,transparent)", color: "var(--c-amber)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="arrowRight" size={13} /></div>
                    <span style={{ fontSize: 14.5 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            <div style={{ marginTop: 36 }}>
              <div className="mw-panel-title">Your next career roadmap</div>
              {r.roadmap.map((m, i) => (
                <Reveal delay={i * 80} key={i}>
                  <div className="roadmap-item">
                    <div className="roadmap-month">{m.month}</div>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--elevated-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name={(["cpu", "globe", "trending"] as const)[i] ?? "trending"} size={17} style={{ color: "var(--accent)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{m.focus}</span>
                        <Badge color="var(--good)">{m.lift}</Badge>
                      </div>
                      <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 4 }}>{m.detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Matched roles */}
            <div style={{ marginTop: 36 }}>
              <div className="mw-panel-title">Roles you&apos;re matched to today</div>
              {r.matchedRoles.map((m, i) => (
                <div className="match-row" key={i}>
                  <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--elevated-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="building" size={18} style={{ color: "var(--c-cyan)" }} />
                    </div>
                    <div><div style={{ fontWeight: 600, fontSize: 15 }}>{m.role}</div><div style={{ fontSize: 13, color: "var(--muted)" }}>{m.company}</div></div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, width: 200 }}>
                    <div style={{ flex: 1 }}><ProgressBar value={m.match} color="var(--good)" delay={i * 100} /></div>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--good)", width: 42, textAlign: "right" }}>{m.match}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 32 }}>
          <Button variant="primary" size="lg" icon="briefcase" onClick={() => router.push("/mission")}>Start next mission</Button>
          <Button variant="secondary" size="lg" icon="award" onClick={() => router.push("/passport")}>View skill passport</Button>
        </div>
      </Reveal>
    </div>
  );
}

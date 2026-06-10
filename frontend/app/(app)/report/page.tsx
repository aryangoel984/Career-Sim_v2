"use client";

import React, { useEffect } from "react";
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
import { report as r } from "@/lib/data";

export default function ReportPage() {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="app-page">
      <Reveal>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 26 }}>
          <div style={{ textAlign: "left" }}>
            <div className="eyebrow">Career Coach Agent</div>
            <h1 style={{ fontSize: "clamp(28px,4vw,42px)", marginTop: 12 }}>Your employability report</h1>
            <p style={{ color: "var(--text-dim)", fontSize: 16, marginTop: 8 }}>Generated from your verified skills and mission performance.</p>
          </div>
          <Button variant="primary" icon="download" onClick={() => window.print()}>Download PDF</Button>
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
                      <Icon name={["cpu", "globe", "trending"][i]} size={17} style={{ color: "var(--accent)" }} />
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
              <div className="mw-panel-title">Roles you're matched to today</div>
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

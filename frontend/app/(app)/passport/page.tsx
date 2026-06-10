"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Reveal,
  ProgressBar,
  Icon,
  Card,
  Badge,
  Button,
  CountUp,
} from "@/components/ui/components";
import { skills, Skill } from "@/lib/data";

interface SkillRowProps {
  s: Skill;
  delay: number;
}

function SkillRow({ s, delay }: SkillRowProps) {
  const color = s.value >= 85 ? "var(--good)" : s.value >= 70 ? "var(--c-cyan)" : s.value >= 60 ? "var(--c-amber)" : "var(--bad)";
  return (
    <Reveal delay={delay}>
      <div className="skill-row" style={{ textAlign: "left" }}>
        <div className="skill-row-head">
          <div className="skill-name">
            {s.name}
            {s.verified
              ? <span className="verified-tag"><Icon name="check" size={11} /> Verified</span>
              : <span className="verified-tag" style={{ color: "var(--muted)", background: "var(--elevated-2)", borderColor: "var(--border)" }}><Icon name="lock" size={10} /> Unverified</span>}
          </div>
          <span className="skill-val" style={{ color }}><CountUp to={s.value} /></span>
        </div>
        <ProgressBar value={s.value} color={color} delay={delay} />
        <div className="evidence"><Icon name="fileText" size={12} style={{ verticalAlign: "-2px", marginRight: 6, color: "var(--muted)" }} />{s.evidence}</div>
      </div>
    </Reveal>
  );
}

export default function PassportPage() {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const verified = skills.filter((s) => s.verified).length;
  const avg = Math.round(skills.reduce((a, s) => a + s.value, 0) / skills.length);

  return (
    <div className="app-page">
      <div className="dash-grid">
        {/* Passport card */}
        <Reveal style={{ gridColumn: "span 5" }}>
          <div className="passport-card" style={{ position: "sticky", top: 96, textAlign: "left" }}>
            <div style={{ position: "absolute", top: -80, right: -60, width: 240, height: 240,
              background: "radial-gradient(50% 50% at 50% 50%,color-mix(in oklch,var(--accent) 28%,transparent),transparent 70%)", filter: "blur(20px)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="logo-mark" style={{ width: 40, height: 40 }}><Icon name="award" size={22} /></div>
                <Badge color="var(--good)"><Icon name="shield" size={12} /> Verified by CareerSim AI</Badge>
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".12em", marginTop: 28 }}>Skill Passport</div>
              <h2 style={{ fontSize: 28, marginTop: 8 }}>Aryan Sharma</h2>
              <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 4 }}>Junior AI Engineer · Track in progress</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--border)", borderRadius: 12, overflow: "hidden", marginTop: 24, border: "1px solid var(--border)" }}>
                {[{ n: avg, l: "Avg score" }, { n: verified, l: "Verified", suf: `/${skills.length}` }, { n: 91, l: "Percentile", suf: "th" }].map((x, i) => (
                  <div key={i} style={{ background: "var(--surface)", padding: "16px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 800 }}><CountUp to={x.n} suffix={x.suf || ""} /></div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, fontFamily: "var(--mono)" }}>{x.l}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>ID · CSAI-2026-0AR9</span>
                <Button variant="outline" size="sm" icon="download">Share</Button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Skills list */}
        <Reveal delay={100} style={{ gridColumn: "span 7" }}>
          <Card className="pad-lg" style={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <div className="eyebrow">Step 4 · Verified skills</div>
                <h1 style={{ fontSize: 26, marginTop: 10 }}>Skills backed by real evidence</h1>
              </div>
            </div>
            <p style={{ color: "var(--text-dim)", fontSize: 14.5, marginBottom: 26, lineHeight: 1.55 }}>
              Every score is derived from your actual mission submission — not a quiz. Verified skills are ready to show employers.
            </p>
            {skills.map((s, i) => <SkillRow key={s.name} s={s} delay={i * 80} />)}

            <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 22, borderTop: "1px solid var(--border)" }}>
              <Button variant="primary" icon="trending" onClick={() => router.push("/report")}>See employability report</Button>
              <Button variant="ghost" icon="briefcase" onClick={() => router.push("/mission")}>Earn more skills</Button>
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}

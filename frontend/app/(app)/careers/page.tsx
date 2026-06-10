"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Reveal,
  Card,
  Badge,
  Icon,
} from "@/components/ui/components";
import { careers, Career } from "@/lib/data";

interface CareerCardProps {
  c: Career;
  onSelect: (c: Career) => void;
  delay: number;
}

function CareerCard({ c, onSelect, delay }: CareerCardProps) {
  const accent = c.accent;
  return (
    <Reveal delay={delay}>
      <Card className="pad-lg card-hover" style={{ height: "100%", display: "flex", flexDirection: "column", textAlign: "left" }} onClick={() => onSelect(c)}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
            background: `color-mix(in oklch, ${accent} 14%, transparent)`, border: `1px solid color-mix(in oklch, ${accent} 30%, transparent)` }}>
            <Icon name={iconFor(c.id)} size={22} style={{ color: accent }} />
          </div>
          <Badge color="var(--c-emerald)"><Icon name="trending" size={12} /> {c.demand} demand</Badge>
        </div>
        <h3 style={{ fontSize: 21, marginTop: 18 }}>{c.title}</h3>
        <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 8, lineHeight: 1.5, flex: 1 }}>{c.blurb}</p>

        <div className="career-meta">
          <div>
            <div className="k">Salary range</div>
            <div className="v">{c.salary}</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{c.salaryUsd}</div>
          </div>
          <div>
            <div className="k">Difficulty</div>
            <div className="v">{c.difficulty}</div>
            <div className="diff-dots">
              {[1, 2, 3, 4, 5].map((n) => (
                <div className="diff-dot" key={n} style={{ background: n <= c.difficultyLevel ? accent : "var(--elevated-2)" }} />
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="k" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--mono)" }}>Skills you'll prove</div>
          <div className="career-skills">
            {c.skills.map((s) => <span className="skill-chip" key={s}>{s}</span>)}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}><span className="mono" style={{ color: "var(--text-dim)" }}>{c.openRoles}</span> open roles</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: accent, fontWeight: 600, fontSize: 14 }}>
            Choose path <Icon name="arrowRight" size={15} />
          </span>
        </div>
      </Card>
    </Reveal>
  );
}

function iconFor(id: string) {
  return {
    "ai-engineer": "brain",
    "data-scientist": "trending",
    "backend-engineer": "cpu",
    "product-manager": "layout",
    "cybersecurity-analyst": "shield",
  }[id] || "briefcase";
}

export default function CareersPage() {
  const router = useRouter();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const onSelect = () => {
    router.push("/simulation");
  };
  return (
    <div className="app-page">
      <Reveal>
        <div style={{ textAlign: "center", maxWidth: "60ch", margin: "0 auto 14px" }}>
          <div className="eyebrow">Step 1 · Choose your path</div>
          <h1 style={{ fontSize: "clamp(30px,4.5vw,46px)", marginTop: 14 }}>Which career do you want to prove?</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 17, marginTop: 14, lineHeight: 1.55 }}>
            Pick a track and we'll place you inside a virtual company with a real-world mission tailored to it.
          </p>
        </div>
      </Reveal>
      <div className="career-grid" style={{ marginTop: 48 }}>
        {careers.map((c, i) => <CareerCard key={c.id} c={c} onSelect={onSelect} delay={i * 70} />)}
        <Reveal delay={careers.length * 70}>
          <Card className="pad-lg" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            textAlign: "center", borderStyle: "dashed", background: "transparent" }}>
            <div className="feat-icon" style={{ margin: "0 0 14px" }}><Icon name="sparkles" size={20} style={{ color: "var(--muted)" }} /></div>
            <h3 style={{ fontSize: 17 }}>More tracks coming</h3>
            <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 8 }}>Cloud, DevOps, UX & ML Ops simulations are in the pipeline.</p>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}

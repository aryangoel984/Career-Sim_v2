"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Reveal,
  Card,
  ScoreRing,
  Badge,
  Icon,
  Button,
} from "@/components/ui/components";
import { ScoreItem } from "@/lib/data";

// Shape returned by the API (scores 0-100)
interface ApiScoreItem {
  label: string;
  value: number; // 0-100
  note: string;
}

interface ApiEvalItem {
  title: string;
  note: string;
}

interface ApiReview {
  overall: number; // 0-100
  scores: ApiScoreItem[];
  strengths: ApiEvalItem[];
  weaknesses: ApiEvalItem[];
  summary: string;
  verified_skills: string[];
}

// Convert API score (0-100) to the ScoreItem shape the UI expects (value 0-10)
function toDisplayScore(s: ApiScoreItem): ScoreItem {
  return { label: s.label, value: s.value / 10, note: s.note };
}

interface ScoreCardProps {
  s: ScoreItem;
  delay: number;
}

function ScoreCard({ s, delay }: ScoreCardProps) {
  const color = s.value >= 8 ? "var(--good)" : s.value >= 7 ? "var(--c-amber)" : "var(--bad)";
  return (
    <Reveal delay={delay}>
      <Card className="pad score-card" style={{ height: "100%", textAlign: "left" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <ScoreRing value={s.value} max={10} size={92} stroke={7} color={color} decimals={1} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, marginTop: 6, textAlign: "center" }}>{s.label}</div>
        <p style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 6, lineHeight: 1.45 }}>{s.note}</p>
      </Card>
    </Reveal>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const [review, setReview] = useState<ApiReview | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      const raw = localStorage.getItem("careersim_review");
      if (!raw) { setNotFound(true); return; }
      const parsed: ApiReview = JSON.parse(raw);
      setReview(parsed);
    } catch {
      setNotFound(true);
    }
  }, []);

  if (notFound) {
    return (
      <div className="app-page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <Icon name="fileText" size={40} style={{ color: "var(--muted)" }} />
        <h2 style={{ fontSize: 22 }}>No review found</h2>
        <p style={{ color: "var(--text-dim)", fontSize: 15 }}>Submit your repository first to generate an AI review.</p>
        <Button variant="primary" icon="upload" onClick={() => router.push("/submission")}>Go to submission</Button>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="app-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const displayScores = review.scores.map(toDisplayScore);
  const overallDisplay = review.overall / 10;

  return (
    <div className="app-page">
      <Reveal>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 30 }}>
          <div style={{ textAlign: "left" }}>
            <div className="eyebrow">AI Reviewer · Aisha Khan</div>
            <h1 style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 12 }}>Submission review</h1>
            <p style={{ color: "var(--text-dim)", fontSize: 16, marginTop: 8 }}>
              Hospital Support Chatbot · evaluated against project brief
            </p>
          </div>
          <Card className="pad" style={{ display: "flex", alignItems: "center", gap: 18, textAlign: "left" }}>
            <ScoreRing value={overallDisplay} max={10} size={96} stroke={8} color="var(--accent)" decimals={1} />
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".08em" }}>Overall score</div>
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>
                {overallDisplay >= 8 ? "Strong submit" : overallDisplay >= 6 ? "Good progress" : "Needs work"}
              </div>
              {review.verified_skills.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                  {review.verified_skills.map((sk) => (
                    <Badge key={sk} color="var(--good)" className="">{sk}</Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </Reveal>

      <div className="score-grid" style={{ marginBottom: 22 }}>
        {displayScores.map((s, i) => <ScoreCard key={s.label} s={s} delay={i * 70} />)}
      </div>

      <Reveal delay={120}>
        <Card className="pad-lg" style={{ marginBottom: 22, textAlign: "left" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "color-mix(in oklch,var(--accent) 16%,transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="sparkles" size={18} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <div className="mw-panel-title" style={{ margin: "4px 0 8px" }}>Reviewer summary</div>
              <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "var(--text-dim)" }}>{review.summary}</p>
            </div>
          </div>
        </Card>
      </Reveal>

      <div className="sw-grid">
        <Reveal delay={160}>
          <Card className="pad-lg" style={{ height: "100%", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
              <Icon name="check" size={18} style={{ color: "var(--good)" }} />
              <h3 style={{ fontSize: 17 }}>Strengths</h3>
            </div>
            {review.strengths.map((s, i) => (
              <div className="sw-item" key={i}>
                <div className="sw-ic" style={{ background: "color-mix(in oklch,var(--good) 16%,transparent)", color: "var(--good)" }}><Icon name="check" size={15} /></div>
                <div><div style={{ fontWeight: 600, fontSize: 14.5 }}>{s.title}</div><div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{s.note}</div></div>
              </div>
            ))}
          </Card>
        </Reveal>
        <Reveal delay={210}>
          <Card className="pad-lg" style={{ height: "100%", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
              <Icon name="zap" size={18} style={{ color: "var(--c-amber)" }} />
              <h3 style={{ fontSize: 17 }}>Areas to improve</h3>
            </div>
            {review.weaknesses.map((s, i) => (
              <div className="sw-item" key={i}>
                <div className="sw-ic" style={{ background: "color-mix(in oklch,var(--c-amber) 16%,transparent)", color: "var(--c-amber)" }}><Icon name="arrowRight" size={15} /></div>
                <div><div style={{ fontWeight: 600, fontSize: 14.5 }}>{s.title}</div><div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{s.note}</div></div>
              </div>
            ))}
          </Card>
        </Reveal>
      </div>

      <Reveal delay={260}>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 32 }}>
          <Button variant="primary" size="lg" icon="award" onClick={() => router.push("/passport")}>View skill passport</Button>
          <Button variant="secondary" size="lg" icon="trending" onClick={() => router.push("/report")}>Employability report</Button>
          <Button variant="ghost" size="lg" icon="upload" onClick={() => router.push("/submission")}>Re-submit</Button>
        </div>
      </Reveal>
    </div>
  );
}

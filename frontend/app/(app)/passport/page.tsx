"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Reveal,
  ProgressBar,
  Icon,
  Card,
  Badge,
  Button,
  CountUp,
  ScoreRing,
} from "@/components/ui/components";

// ── Types ────────────────────────────────────────────────────────────────────

interface ApiScoreItem {
  label: string;
  value: number; // 0-100
  note: string;
}

interface ApiReview {
  overall: number;
  scores: ApiScoreItem[];
  strengths: { title: string; note: string }[];
  weaknesses: { title: string; note: string }[];
  summary: string;
  verified_skills: string[];
}

// ── Skill → score dimension mapping ─────────────────────────────────────────

const SKILL_DIMENSION_MAP: Record<string, string> = {
  // Languages → Code Quality
  python: "Code Quality",
  javascript: "Code Quality",
  typescript: "Code Quality",
  java: "Code Quality",
  "c++": "Code Quality",
  go: "Code Quality",
  rust: "Code Quality",
  ruby: "Code Quality",
  // Frameworks / APIs → Architecture
  fastapi: "Architecture",
  flask: "Architecture",
  django: "Architecture",
  express: "Architecture",
  nextjs: "Architecture",
  "next.js": "Architecture",
  "rest apis": "Architecture",
  "rest api": "Architecture",
  graphql: "Architecture",
  grpc: "Architecture",
  // AI / ML → Architecture
  rag: "Architecture",
  "vector databases": "Architecture",
  "vector database": "Architecture",
  faiss: "Architecture",
  chromadb: "Architecture",
  pinecone: "Architecture",
  langchain: "Architecture",
  embeddings: "Architecture",
  "openai api": "Architecture",
  "hugging face": "Architecture",
  transformers: "Architecture",
  pytorch: "Architecture",
  tensorflow: "Architecture",
  "scikit-learn": "Architecture",
  "random forest": "Code Quality",
  "random forest classification": "Code Quality",
  // Documentation
  documentation: "Documentation",
  readme: "Documentation",
  "technical writing": "Documentation",
  // Infrastructure → Scalability
  docker: "Scalability",
  kubernetes: "Scalability",
  "ci/cd": "Scalability",
  redis: "Scalability",
  postgresql: "Scalability",
  mysql: "Scalability",
  mongodb: "Scalability",
  "prisma orm": "Scalability",
  prisma: "Scalability",
};

function getDimension(skill: string): string {
  return SKILL_DIMENSION_MAP[skill.toLowerCase()] ?? null;
}

function getScoreForSkill(skill: string, scores: ApiScoreItem[], overall: number): number {
  const dim = getDimension(skill);
  if (dim) {
    const found = scores.find((s) => s.label === dim);
    if (found) return found.value;
  }
  return overall;
}

function getScoreColor(v: number): string {
  if (v >= 80) return "var(--good)";
  if (v >= 65) return "var(--c-cyan)";
  if (v >= 50) return "var(--c-amber)";
  return "var(--bad)";
}

// ── Skill Card ───────────────────────────────────────────────────────────────

interface SkillCardProps {
  skill: string;
  score: number;
  repoName: string;
  githubUrl: string;
  delay: number;
}

function SkillCard({ skill, score, repoName, githubUrl, delay }: SkillCardProps) {
  const color = getScoreColor(score);
  const dim = getDimension(skill) ?? "Overall";

  return (
    <Reveal delay={delay}>
      <Card
        className="pad"
        style={{
          textAlign: "left",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle glow behind ring */}
        <div
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `radial-gradient(circle, color-mix(in oklch, ${color} 18%, transparent), transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Top row: skill name + score ring */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* AI Verified badge */}
            <div style={{ marginBottom: 8 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 20,
                  background: "color-mix(in oklch, var(--accent) 15%, transparent)",
                  color: "var(--accent)",
                  border: "1px solid color-mix(in oklch, var(--accent) 35%, transparent)",
                  letterSpacing: ".03em",
                }}
              >
                <Icon name="check" size={10} />
                AI Verified
              </span>
            </div>

            {/* Skill name */}
            <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{skill}</div>

            {/* Dimension label */}
            <div
              style={{
                fontSize: 11.5,
                color: "var(--muted)",
                marginTop: 4,
                fontFamily: "var(--mono)",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              {dim}
            </div>
          </div>

          {/* Score ring — value/10 because ScoreRing uses max=10 by default */}
          <ScoreRing
            value={score / 10}
            max={10}
            size={72}
            stroke={6}
            color={color}
            decimals={0}
          />
        </div>

        {/* Progress bar */}
        <ProgressBar value={score} color={color} height={4} />

        {/* Evidence line */}
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            color: "var(--muted)",
            textDecoration: "none",
            marginTop: "auto",
            paddingTop: 8,
            borderTop: "1px solid var(--border)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          <Icon name="git" size={12} />
          <span>Verified in: <strong>{repoName}</strong></span>
          <Icon name="link" size={11} style={{ marginLeft: "auto", opacity: 0.5 }} />
        </a>
      </Card>
    </Reveal>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PassportPage() {
  const router = useRouter();
  const [review, setReview] = useState<ApiReview | null>(null);
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      const raw = localStorage.getItem("careersim_review");
      const url = localStorage.getItem("careersim_github_url") || "";
      if (!raw) { setNotFound(true); return; }
      setReview(JSON.parse(raw));
      setGithubUrl(url);
    } catch {
      setNotFound(true);
    }
  }, []);

  // ── Empty state ────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div
        className="app-page"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}
      >
        <Icon name="award" size={40} style={{ color: "var(--muted)" }} />
        <h2 style={{ fontSize: 22 }}>No skills verified yet</h2>
        <p style={{ color: "var(--text-dim)", fontSize: 15 }}>
          Submit a GitHub repository to generate your Skill Passport.
        </p>
        <Button variant="primary" icon="upload" onClick={() => router.push("/submission")}>
          Go to submission
        </Button>
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

  // ── Derived data ───────────────────────────────────────────────────────────
  const repoName = githubUrl
    ? githubUrl.replace(/\.git$/, "").split("/").filter(Boolean).pop() ?? githubUrl
    : "submitted-repo";

  const verifiedSkills = review.verified_skills ?? [];
  const avgScore = verifiedSkills.length
    ? Math.round(verifiedSkills.reduce((sum, sk) => sum + getScoreForSkill(sk, review.scores, review.overall), 0) / verifiedSkills.length)
    : review.overall;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app-page">
      <div className="dash-grid">

        {/* ── Left: Passport Card ── */}
        <Reveal style={{ gridColumn: "span 5" }}>
          <div className="passport-card" style={{ position: "sticky", top: 96, textAlign: "left" }}>
            {/* Glow */}
            <div
              style={{
                position: "absolute", top: -80, right: -60, width: 240, height: 240,
                background: "radial-gradient(50% 50% at 50% 50%,color-mix(in oklch,var(--accent) 28%,transparent),transparent 70%)",
                filter: "blur(20px)",
              }}
            />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="logo-mark" style={{ width: 40, height: 40 }}><Icon name="award" size={22} /></div>
                <Badge color="var(--good)"><Icon name="shield" size={12} /> Verified by CareerSim AI</Badge>
              </div>

              <div className="mono" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".12em", marginTop: 28 }}>
                Skill Passport
              </div>
              <h2 style={{ fontSize: 28, marginTop: 8 }}>Hospital Support Chatbot</h2>
              <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 4 }}>
                Junior AI Engineer · Mission complete
              </p>

              {/* Stats grid */}
              <div
                style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1,
                  background: "var(--border)", borderRadius: 12, overflow: "hidden",
                  marginTop: 24, border: "1px solid var(--border)",
                }}
              >
                {[
                  { n: avgScore, l: "Avg score" },
                  { n: verifiedSkills.length, l: "Verified", suf: " skills" },
                  { n: review.overall, l: "Overall", suf: "/100" },
                ].map((x, i) => (
                  <div key={i} style={{ background: "var(--surface)", padding: "16px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>
                      <CountUp to={x.n} suffix={x.suf || ""} />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, fontFamily: "var(--mono)" }}>{x.l}</div>
                  </div>
                ))}
              </div>

              {/* Aisha's summary quote */}
              {review.summary && (
                <div
                  style={{
                    marginTop: 20, padding: "14px 16px",
                    background: "color-mix(in oklch, var(--accent) 8%, transparent)",
                    border: "1px solid color-mix(in oklch, var(--accent) 20%, transparent)",
                    borderRadius: 10,
                  }}
                >
                  <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
                    Aisha Khan · AI Reviewer
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.55, margin: 0 }}>
                    "{review.summary}"
                  </p>
                </div>
              )}

              <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>ID · CSAI-2026-0AR9</span>
                <Button variant="outline" size="sm" icon="download">Share</Button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Right: Skills List ── */}
        <Reveal delay={100} style={{ gridColumn: "span 7" }}>
          <Card className="pad-lg" style={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <div className="eyebrow">Step 4 · Verified skills</div>
                <h1 style={{ fontSize: 26, marginTop: 10 }}>
                  {verifiedSkills.length > 0
                    ? `${verifiedSkills.length} Skill${verifiedSkills.length !== 1 ? "s" : ""} Verified`
                    : "Skills backed by real evidence"}
                </h1>
              </div>
            </div>

            <p style={{ color: "var(--text-dim)", fontSize: 14.5, marginBottom: 26, lineHeight: 1.55 }}>
              Every skill below was identified by Aisha Khan directly from your submitted code in{" "}
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
                {repoName}
              </a>
              . These are ready to show employers.
            </p>

            {/* Empty skills state */}
            {verifiedSkills.length === 0 ? (
              <div
                style={{
                  padding: "28px 20px", borderRadius: 12, textAlign: "center",
                  background: "color-mix(in oklch, var(--c-amber) 8%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--c-amber) 25%, transparent)",
                }}
              >
                <Icon name="zap" size={28} style={{ color: "var(--c-amber)", marginBottom: 12 }} />
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>No verifiable skills found</div>
                <p style={{ color: "var(--text-dim)", fontSize: 13.5, lineHeight: 1.55, maxWidth: 420, margin: "0 auto" }}>
                  Aisha did not find sufficient evidence of verifiable skills in this submission.
                  Review Aisha's feedback and resubmit with a stronger implementation.
                </p>
                <div style={{ marginTop: 16 }}>
                  <Button variant="secondary" size="sm" icon="upload" onClick={() => router.push("/submission")}>
                    Resubmit
                  </Button>
                </div>
              </div>
            ) : (
              /* Skills grid — 2 cols, wraps responsively via CSS */
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 14,
                }}
              >
                {verifiedSkills.map((skill, i) => (
                  <SkillCard
                    key={skill}
                    skill={skill}
                    score={getScoreForSkill(skill, review.scores, review.overall)}
                    repoName={repoName}
                    githubUrl={githubUrl}
                    delay={i * 70}
                  />
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 22, borderTop: "1px solid var(--border)" }}>
              <Button variant="primary" icon="trending" onClick={() => router.push("/report")}>
                See employability report
              </Button>
              <Button variant="ghost" icon="briefcase" onClick={() => router.push("/mission")}>
                Earn more skills
              </Button>
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Reveal,
  Icon,
  Button,
  Card,
  ProgressBar,
} from "@/components/ui/components";
import { analysisStages } from "@/lib/data";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface MissionData {
  id: string;
  career_id: string;
  project: string;
  company: string;
  company_tag: string;
  summary: string;
  requirements: string[];
  constraints: string[];
  acceptance: string[];
}

export default function SubmissionPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [phase, setPhase] = useState<"form" | "analyzing">("form");
  const [stage, setStage] = useState(0);
  const [github, setGithub] = useState("");
  const [file, setFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mission, setMission] = useState<MissionData | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect to login if not authenticated (wait for loading to complete first)
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Fetch the active mission so review uses real context
  useEffect(() => {
    if (!user) return;
    api.get("/api/mission/active")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data) setMission(data);
      })
      .catch(() => {
        // Non-blocking — falls back to null; handleSubmit will guard
      });
  }, [user]);

  // Advance the visual analysis stage ticker while waiting for the real API call
  useEffect(() => {
    if (phase !== "analyzing") return;
    if (stage >= analysisStages.length - 1) return; // hold on last stage until API resolves
    const t = setTimeout(() => setStage((s) => s + 1), 1400);
    return () => clearTimeout(t);
  }, [phase, stage]);

  // Show spinner while auth context is restoring (all hooks must come before this)
  if (loading) {
    return (
      <div className="app-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const handleSubmit = async () => {
    const url = github.trim();
    if (!url) {
      setError("Please enter a GitHub repository URL.");
      return;
    }
    if (!mission) {
      setError("No active mission found. Please select a career first.");
      return;
    }
    setError(null);
    setPhase("analyzing");
    setStage(0);

    const missionContext = {
      project: mission.project,
      company: mission.company,
      company_tag: mission.company_tag,
      requirements: mission.requirements,
      constraints: mission.constraints,
      acceptance: mission.acceptance,
    };

    try {
      const response = await api.post("/api/review", {
        github_url: url,
        mission_context: missionContext,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${response.statusText}`);
      }

      const reviewData = await response.json();

      // Store review and the submitted GitHub URL — review/passport pages read both
      localStorage.setItem("careersim_review", JSON.stringify(reviewData));
      localStorage.setItem("careersim_github_url", url);
      // Store mission context so review page can display the real project name
      localStorage.setItem("careersim_mission", JSON.stringify(missionContext));

      // Persist verified skills to the database — best-effort
      try {
        await api.post("/api/skills/save", {
          verified_skills: reviewData.verified_skills ?? [],
          career: mission.career_id,
          mission: mission.project,
          repo_url: url,
          scores: reviewData.scores ?? [],
          overall: reviewData.overall ?? 0,
        });
      } catch {
        // Non-blocking — skills save failure should not block review redirect
      }

      // Advance to the last stage before redirecting
      setStage(analysisStages.length);
      setTimeout(() => router.push("/review"), 700);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error occurred.";
      setPhase("form");
      setStage(0);
      setError(message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0].name);
    } else {
      setFile("project.zip");
    }
  };

  if (phase === "analyzing") {
    return (
      <div className="app-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="glow" style={{ opacity: .55 }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 620, margin: "0 auto", width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg,var(--accent),var(--accent-soft))", color: "#0a0a0f", boxShadow: "0 14px 40px -12px color-mix(in oklch,var(--accent) 70%,transparent)" }}>
              <Icon name="cpu" size={30} />
            </div>
            <h1 style={{ fontSize: 28 }}>Aisha is reviewing your code…</h1>
            <p style={{ color: "var(--text-dim)", marginTop: 10 }}>Our AI reviewer is analysing your repository. This takes a few seconds.</p>
          </div>
          {analysisStages.map((s, i) => {
            const st = stage > i ? "done" : stage === i ? "active" : "pending";
            return (
              <div className={`analysis-line ${st}`} key={i}>
                {st === "done" ? <Icon name="check" size={16} /> : st === "active" ? <span className="spinner" /> : <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--border)" }} />}
                <span className="ml-2">{s}</span>
                {st === "done" && <span className="mono" style={{ marginLeft: "auto", fontSize: 12, color: "var(--good)" }}>✓</span>}
              </div>
            );
          })}
          <div style={{ marginTop: 20 }}>
            <ProgressBar value={(stage / analysisStages.length) * 100} height={4} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <Reveal>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="eyebrow">Submit your work</div>
            <h1 style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 12 }}>Ship it for review</h1>
            <p style={{ color: "var(--text-dim)", fontSize: 16, marginTop: 12 }}>
              Link your repository. Aisha Khan will evaluate it exactly like a hiring engineer would.
            </p>
          </div>

          <Card className="pad-lg" style={{ textAlign: "left" }}>
            <div className="mw-panel-title">Repository URL</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--elevated)", border: `1px solid ${error ? "var(--bad)" : "var(--border)"}`, borderRadius: 11, padding: "0 14px" }}>
              <Icon name="git" size={18} style={{ color: "var(--muted)" }} />
              <input
                className="chat-input"
                style={{ border: "none", background: "transparent", padding: "13px 0" }}
                value={github}
                onChange={(e) => { setGithub(e.target.value); setError(null); }}
                placeholder="https://github.com/username/project"
              />
            </div>
            {error && (
              <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 9, background: "color-mix(in oklch, var(--bad) 12%, transparent)", border: "1px solid color-mix(in oklch, var(--bad) 30%, transparent)", color: "var(--bad)", fontSize: 13.5 }}>
                <Icon name="zap" size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                {error}
              </div>
            )}

            <div className="mw-panel-title" style={{ marginTop: 28 }}>Or upload project files</div>
            <label style={{ display: "block", cursor: "pointer" }}>
              <input type="file" style={{ display: "none" }} onChange={handleFileChange} />
              <div style={{ border: "1.5px dashed var(--border-strong)", borderRadius: 14, padding: "36px 20px", textAlign: "center",
                background: "var(--elevated)", transition: "all .2s" }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--elevated-2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Icon name={file ? "fileText" : "upload"} size={22} style={{ color: file ? "var(--good)" : "var(--muted)" }} />
                </div>
                {file ? (
                  <div>
                    <div style={{ fontWeight: 600 }}>{file}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Ready to submit · click to replace</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontWeight: 600 }}>Drag &amp; drop or click to upload</div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>ZIP, up to 50MB</div>
                  </div>
                )}
              </div>
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24 }}>
              <Button variant="primary" size="lg" icon="cpu" onClick={handleSubmit}>Submit for AI review</Button>
              <Button variant="ghost" size="lg" onClick={() => router.push("/mission")}>Back to mission</Button>
            </div>
          </Card>

          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, marginTop: 18 }}>
            <Icon name="lock" size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />
            Your repository is read-only — we never clone or store your code.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

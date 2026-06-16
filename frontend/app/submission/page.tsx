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

const MISSION_CONTEXT = {
  project: "Hospital Support Chatbot",
  company: "HealthTech Solutions",
  requirements: [
    "Bilingual support — English + Hindi",
    "FAQ retrieval over the hospital knowledge base",
    "Appointment scheduling support",
    "Inline source citations on every answer",
  ],
  constraints: ["FastAPI", "Retrieval-Augmented Generation", "Vector Search", "< 1.2s p95 latency"],
  acceptance: [
    "Answers cite at least one source document",
    "Handles code-switching between English & Hindi",
    "Graceful fallback when confidence is low",
  ],
};

export default function SubmissionPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"form" | "analyzing">("form");
  const [stage, setStage] = useState(0);
  const [github, setGithub] = useState("");
  const [file, setFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Advance the visual analysis stage ticker while waiting for the real API call
  useEffect(() => {
    if (phase !== "analyzing") return;
    if (stage >= analysisStages.length - 1) return; // hold on last stage until API resolves
    const t = setTimeout(() => setStage((s) => s + 1), 1400);
    return () => clearTimeout(t);
  }, [phase, stage]);

  const handleSubmit = async () => {
    const url = github.trim();
    if (!url) {
      setError("Please enter a GitHub repository URL.");
      return;
    }
    setError(null);
    setPhase("analyzing");
    setStage(0);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_url: url,
          mission_context: MISSION_CONTEXT,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${response.statusText}`);
      }

      const reviewData = await response.json();

      // Store review and the submitted GitHub URL — passport page reads both
      localStorage.setItem("careersim_review", JSON.stringify(reviewData));
      localStorage.setItem("careersim_github_url", url);

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

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Icon,
  Button,
  Card,
  Badge,
  ProgressBar,
  Reveal,
} from "@/components/ui/components";
import { agents, Agent } from "@/lib/data";
import { api } from "@/lib/api";

// Shape returned by /api/mission/active
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

interface AgentChatProps {
  agent: Agent;
  mission: MissionData;
  onClose: () => void;
}

function AgentChat({ agent, mission, onClose }: AgentChatProps) {
  const [msgs, setMsgs] = useState<{ from: string; text: string }[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [idx, setIdx] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  // play scripted messages in sequence
  useEffect(() => {
    if (idx >= agent.messages.length) return;
    const m = agent.messages[idx];
    if (m.from === "agent") {
      setTyping(true);
      const t = setTimeout(() => {
        setTyping(false);
        setMsgs((p) => [...p, m]);
        setIdx((i) => i + 1);
      }, idx === 0 ? 600 : 1100);
      return () => clearTimeout(t);
    } else {
      // user line auto-appears slightly after previous
      const t = setTimeout(() => {
        setMsgs((p) => [...p, m]);
        setIdx((i) => i + 1);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [idx, agent]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [msgs, typing]);

  const send = async () => {
    if (!input.trim() || typing) return;
    const currentInput = input.trim();
    setInput("");

    // Append the user's message to local chat history state
    const userMessage = { from: "user" as const, text: currentInput };
    const nextMsgs = [...msgs, userMessage];
    setMsgs(nextMsgs);
    setTyping(true);

    try {
      const response = await api.stream("/api/chat", {
        agent_id: agent.id,
        messages: nextMsgs.map((m) => ({
          role: m.from === "user" ? "user" : "assistant",
          content: m.text,
        })),
        mission_context: {
          project: mission.project,
          company: mission.company,
          company_tag: mission.company_tag,
          requirements: mission.requirements,
          constraints: mission.constraints,
          acceptance: mission.acceptance,
        },
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
      }

      setTyping(false);

      if (!response.body) {
        throw new Error("No response body");
      }

      // Add a placeholder message for the streaming agent response
      setMsgs((p) => [...p, { from: "agent", text: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          setMsgs((p) => {
            if (p.length === 0) return p;
            const next = [...p];
            const last = next[next.length - 1];
            if (last.from === "agent") {
              next[next.length - 1] = {
                ...last,
                text: last.text + chunk,
              };
            }
            return next;
          });
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);
      setTyping(false);
      setMsgs((p) => [
        ...p,
        { from: "agent", text: "Sorry, I am having trouble connecting right now." },
      ]);
    }
  };

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-panel" onClick={(e) => e.stopPropagation()} style={{ animation: "slideUp .3s cubic-bezier(.22,1,.36,1)" }}>
        <div className="chat-head">
          <div className="avatar" style={{ width: 38, height: 38, background: `color-mix(in oklch, ${agent.color} 20%, transparent)`, color: agent.color, border: `1px solid color-mix(in oklch, ${agent.color} 40%, transparent)`, fontSize: 13 }}>
            {agent.avatar}
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{agent.name}</span>
              <div className="agent-dot" style={{ margin: 0 }} />
            </div>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{agent.role}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: 7 }}><Icon name="x" size={18} /></button>
        </div>
        <div className="chat-body" ref={bodyRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`bubble ${m.from}`} style={{ animation: "bubbleIn .25s ease", textAlign: "left" }}>{m.text}</div>
          ))}
          {typing && <div className="bubble agent typing"><span></span><span></span><span></span></div>}
        </div>
        <div className="chat-foot">
          <input className="chat-input" placeholder={`Message ${agent.name.split(" ")[0]}…`} value={input}
            onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
          <button className="btn btn-primary btn-md" onClick={send} style={{ padding: 10 }}><Icon name="send" size={16} /></button>
        </div>
      </div>
    </div>
  );
}

export default function MissionPage() {
  const router = useRouter();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [active, setActive] = useState<Agent | null>(null);
  const [mission, setMission] = useState<MissionData | null>(null);
  const [noMission, setNoMission] = useState(false);

  useEffect(() => {
    api.get("/api/mission/active")
      .then((res) => {
        if (res.status === 404) {
          setNoMission(true);
          return null;
        }
        if (!res.ok) throw new Error("Failed to load mission");
        return res.json();
      })
      .then((data) => {
        if (data) setMission(data);
      })
      .catch(() => setNoMission(true));
  }, []);

  if (noMission) {
    return (
      <div className="app-page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <Icon name="briefcase" size={40} style={{ color: "var(--muted)" }} />
        <h2 style={{ fontSize: 22 }}>No active mission</h2>
        <p style={{ color: "var(--text-dim)", fontSize: 15 }}>Pick a career track to receive your mission brief.</p>
        <Button variant="primary" icon="compass" onClick={() => router.push("/careers")}>Choose a career</Button>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="app-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="app-page">
      <Reveal>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 26 }}>
          <div style={{ textAlign: "left" }}>
            <div className="eyebrow">Mission Workspace</div>
            <h1 style={{ fontSize: "clamp(26px,3.6vw,38px)", marginTop: 12 }}>{mission.project}</h1>
          </div>
          <Button variant="primary" icon="upload" onClick={() => router.push("/submission")}>Submit work</Button>
        </div>
      </Reveal>

      <div className="mw-grid">
        {/* LEFT — virtual company */}
        <Reveal delay={60}>
          <Card className="pad" style={{ position: "sticky", top: 96, textAlign: "left" }}>
            <div className="mw-panel-title">Virtual company</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--elevated-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="building" size={22} style={{ color: "var(--c-cyan)" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{mission.company}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{mission.company_tag}</div>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".08em" }}>Your manager</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                <div className="avatar" style={{ background: "color-mix(in oklch,var(--c-cyan) 18%,transparent)", color: "var(--c-cyan)", border: "1px solid color-mix(in oklch,var(--c-cyan) 35%,transparent)" }}>SC</div>
                <div><div style={{ fontWeight: 600, fontSize: 14 }}>Sarah Chen</div><div style={{ fontSize: 11.5, color: "var(--muted)" }}>Engineering Manager</div></div>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".08em" }}>Your role</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginTop: 8 }}>Junior {mission.career_id.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")}</div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
                <span>Mission status</span><span style={{ color: "var(--accent)" }}>Day 1/5</span>
              </div>
              <Badge color="var(--accent)"><div className="agent-dot" style={{ margin: 0, width: 6, height: 6 }} /> In Progress</Badge>
              <div style={{ marginTop: 14 }}><ProgressBar value={20} /></div>
            </div>
          </Card>
        </Reveal>

        {/* CENTER — mission brief */}
        <Reveal delay={120}>
          <Card className="pad-lg" style={{ textAlign: "left" }}>
            <Badge color="var(--c-cyan)"><Icon name="briefcase" size={12} /> Project brief</Badge>
            <h2 style={{ fontSize: 24, marginTop: 16 }}>{mission.project}</h2>
            <p style={{ color: "var(--text-dim)", fontSize: 15.5, marginTop: 12, lineHeight: 1.6 }}>{mission.summary}</p>

            <div style={{ marginTop: 28 }}>
              <div className="mw-panel-title">Requirements</div>
              {mission.requirements.map((r, i) => (
                <div className="req-item" key={i}>
                  <div className="req-check"><Icon name="check" size={13} /></div>
                  <span>{r}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28 }}>
              <div className="mw-panel-title">Technical constraints</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {mission.constraints.map((c) => <span className="skill-chip" key={c} style={{ padding: "6px 11px", fontSize: 13 }}>{c}</span>)}
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <div className="mw-panel-title">Acceptance criteria</div>
              {mission.acceptance.map((a, i) => (
                <div className="req-item" key={i} style={{ borderColor: "var(--border)" }}>
                  <div className="req-check" style={{ color: "var(--c-amber)" }}><Icon name="target" size={12} /></div>
                  <span style={{ color: "var(--text-dim)" }}>{a}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
              <Button variant="primary" icon="upload" onClick={() => router.push("/submission")}>Submit your work</Button>
              <Button variant="secondary" icon="link">Open starter repo</Button>
            </div>
          </Card>
        </Reveal>

        {/* RIGHT — AI team */}
        <Reveal delay={180}>
          <div style={{ position: "sticky", top: 96 }}>
            <Card className="pad" style={{ textAlign: "left" }}>
              <div className="mw-panel-title">Your AI team</div>
              {agents.map((a) => (
                <div className="agent-row" key={a.id} onClick={() => setActive(a)}>
                  <div className="avatar" style={{ width: 36, height: 36, background: `color-mix(in oklch, ${a.color} 18%, transparent)`, color: a.color, border: `1px solid color-mix(in oklch, ${a.color} 35%, transparent)`, fontSize: 12 }}>{a.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.role}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name} · {a.tagline}</div>
                  </div>
                  <Icon name="message" size={15} style={{ color: "var(--muted)" }} />
                </div>
              ))}
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, textAlign: "center", lineHeight: 1.5 }}>
                Click any teammate to chat. They guide, scope and review — just like real colleagues.
              </p>
            </Card>
          </div>
        </Reveal>
      </div>

      {active && <AgentChat agent={active} mission={mission} onClose={() => setActive(null)} />}
    </div>
  );
}

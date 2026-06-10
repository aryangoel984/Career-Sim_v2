"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Reveal,
  Badge,
  Icon,
  Button,
} from "@/components/ui/components";
import { workflowSteps } from "@/lib/data";

export default function WorkflowPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(-1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let i = 0;
    setCurrent(0);
    const id = setInterval(() => {
      i += 1;
      if (i >= workflowSteps.length) {
        clearInterval(id);
        setTimeout(() => {
          setCurrent(workflowSteps.length);
          setDone(true);
        }, 1500);
      } else {
        setCurrent(i);
      }
    }, 1700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="app-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div className="glow" style={{ opacity: .6 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ textAlign: "center", maxWidth: "56ch", margin: "0 auto 44px" }}>
            <Badge color="var(--accent)"><Icon name="cpu" size={12} /> Multi-agent pipeline</Badge>
            <h1 style={{ fontSize: "clamp(28px,4vw,42px)", marginTop: 16 }}>{done ? "Your simulation is ready." : "Spinning up your simulation…"}</h1>
            <p style={{ color: "var(--text-dim)", fontSize: 16, marginTop: 12 }}>
              {done ? "Five specialized agents have set up your virtual company and mission." : "Five specialized AI agents are coordinating to build your personalized experience."}
            </p>
          </div>
        </Reveal>

        <div className="wf-stage">
          {workflowSteps.map((s, i) => {
            const state = current > i ? "done" : current === i ? "active" : "pending";
            return (
              <React.Fragment key={s.id}>
                <div className={`wf-step ${state}`}>
                  <div className="wf-icon">
                    {state === "done" ? <Icon name="check" size={22} /> : <Icon name={s.icon} size={22} />}
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <h3 style={{ fontSize: 17 }}>{s.title}</h3>
                      {state === "active" && <span className="spinner" />}
                      {state === "done" && <Badge color="var(--good)">Done</Badge>}
                    </div>
                    <p style={{ color: "var(--text-dim)", fontSize: 13.5, marginTop: 4 }}>{s.desc}</p>
                    {state === "active" && <div className="wf-bar"><div className="wf-bar-fill" /></div>}
                  </div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--faint)" }}>{String(i + 1).padStart(2, "0")}</div>
                </div>
                {i < workflowSteps.length - 1 && <div className="wf-connector" />}
              </React.Fragment>
            );
          })}
        </div>

        <Reveal delay={0}>
          <div style={{ textAlign: "center", marginTop: 40, height: 50 }}>
            {done && (
              <div style={{ animation: "bubbleIn .4s ease" }}>
                <Button variant="primary" size="lg" icon="briefcase" onClick={() => router.push("/mission")}>Enter your workspace</Button>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

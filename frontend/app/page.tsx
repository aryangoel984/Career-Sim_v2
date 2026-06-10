"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Icon,
  Button,
  Card,
  Badge,
  CountUp,
  ProgressBar,
  Logo,
  Reveal,
} from "@/components/ui/components";
import { testimonials } from "@/lib/data";

function LandingNav() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={`lnav ${scrolled ? "scrolled" : ""}`}>
      <div className="lnav-inner">
        <Logo onClick={() => router.push("/")} />
        <nav className="lnav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#proof">Outcomes</a>
          <Link href="/careers">Careers</Link>
        </nav>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Button variant="ghost" size="md" onClick={() => router.push("/dashboard")}>Sign in</Button>
          <Button variant="primary" size="md" iconRight="arrowRight" onClick={() => router.push("/careers")}>Start free</Button>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const router = useRouter();
  return (
    <section className="hero">
      <div className="page">
        <Reveal>
          <div className="hero-pill">
            <span className="tag">PS-3</span>
            AI Employment Simulator for Higher Education &amp; Skilling
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1>Get job experience <span style={{ color: "var(--accent)" }}>before</span> getting a job.</h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="sub">
            CareerSim AI creates realistic work simulations — real companies, real managers, real assignments — that help students prove employability before entering the workforce.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="hero-cta">
            <Button variant="primary" size="lg" icon="play" onClick={() => router.push("/careers")}>Start Simulation</Button>
            <Button variant="outline" size="lg" icon="message" onClick={() => router.push("/simulation")}>Watch Demo</Button>
          </div>
        </Reveal>
        <Reveal delay={340}>
          <HeroPreview />
        </Reveal>
        <Reveal delay={420}>
          <div className="stat-strip">
            {[
              { n: 78, s: "%", l: "Avg. industry readiness" },
              { n: 5, s: "", l: "Career tracks" },
              { n: 12, s: "k+", l: "Simulated missions" },
              { n: 3.4, s: "x", l: "More interview callbacks" },
            ].map((x, i) => (
              <div className="stat-cell" key={i}>
                <div className="num">
                  <CountUp to={x.n} suffix={x.s} decimals={x.n % 1 ? 1 : 0} />
                </div>
                <div className="lbl">{x.l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div style={{ maxWidth: 940, margin: "56px auto 0", position: "relative" }}>
      <div style={{ position: "absolute", inset: "-1px", borderRadius: 20, padding: 1,
        background: "linear-gradient(180deg,color-mix(in oklch,var(--accent) 50%,transparent),transparent 60%)", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 18, overflow: "hidden", boxShadow: "0 40px 100px -40px rgba(0,0,0,0.9)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: .8 }} />)}
          </div>
          <div className="mono" style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>careersim.ai/mission/hospital-chatbot</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: 280 }}>
          <div style={{ borderRight: "1px solid var(--border)", padding: 18, textAlign: "left" }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em" }}>Virtual Company</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--elevated-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="building" size={17} style={{ color: "var(--c-cyan)" }} />
              </div>
              <div><div style={{ fontWeight: 700, fontSize: 14 }}>HealthTech</div><div style={{ fontSize: 11, color: "var(--muted)" }}>Series B</div></div>
            </div>
            <div style={{ marginTop: 22 }}>
              {["AI CEO", "AI PM", "AI Tech Lead", "AI Reviewer"].map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", fontSize: 12.5, color: "var(--text-dim)" }}>
                  <div className="agent-dot" style={{ margin: 0 }} /> {a}
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: 22, textAlign: "left" }}>
            <Badge color="var(--accent)">Day 3 of 5 · In Progress</Badge>
            <h3 style={{ fontSize: 22, marginTop: 14 }}>Build a multilingual hospital support chatbot</h3>
            <p style={{ color: "var(--text-dim)", fontSize: 13.5, marginTop: 10, lineHeight: 1.55 }}>
              English + Hindi · FAQ retrieval · Appointment support · Source citations · FastAPI + RAG
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
              {["FastAPI", "RAG", "Vector Search"].map((s) => <span key={s} className="skill-chip">{s}</span>)}
            </div>
            <div style={{ marginTop: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 7 }}>
                <span>Mission progress</span><span className="mono">72%</span>
              </div>
              <ProgressBar value={72} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProblemSection() {
  const probs = [
    { icon: "graduation", t: "Degrees ≠ readiness", d: "Students graduate with theory but no proof they can do the actual job. Employers can't tell who's ready." },
    { icon: "briefcase", t: "Internships don't scale", d: "Real-world experience is gated behind a few competitive seats. Most students never get the chance." },
    { icon: "target", t: "No feedback loop", d: "Learners don't know what to fix. Generic courses can't tell you why you're not getting hired." },
  ];
  return (
    <section className="section" id="problem">
      <div className="page">
        <div className="sec-head">
          <div className="eyebrow">The gap</div>
          <h2>The leap from classroom to career is broken.</h2>
          <p>Education teaches knowledge. Hiring demands evidence of work. Between them is a gap that leaves capable students unemployed and employers unsure.</p>
        </div>
        <div className="problem-grid">
          {probs.map((p, i) => (
            <Reveal delay={i * 90} key={i}>
              <Card className="pad problem-card" style={{ height: "100%", textAlign: "left" }}>
                <Icon name={p.icon} size={22} style={{ color: "var(--bad)" }} />
                <h3 style={{ fontSize: 18, margin: "16px 0 9px" }}>{p.t}</h3>
                <p style={{ color: "var(--text-dim)", fontSize: 14.5, lineHeight: 1.55 }}>{p.d}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const router = useRouter();
  const steps = [
    { n: "01", t: "Choose a career", d: "Pick from AI Engineer, Data Scientist, PM and more. See salary, demand and skills." },
    { n: "02", t: "Join a virtual company", d: "Get onboarded by an AI manager into a realistic company with a real-world brief." },
    { n: "03", t: "Ship the mission", d: "Build the project, chat with your AI team, and submit your repo just like at work." },
    { n: "04", t: "Get your passport", d: "AI agents review your work and issue a verified skill passport + employability report." },
  ];
  return (
    <section className="section" id="how" style={{ background: "var(--bg-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="page">
        <div className="sec-head">
          <div className="eyebrow">How it works</div>
          <h2>From choosing a path to proving you're hireable.</h2>
        </div>
        <div className="steps-row">
          {steps.map((s, i) => (
            <Reveal delay={i * 80} key={i}>
              <Card className="pad step-card" style={{ height: "100%", textAlign: "left" }}>
                <div className="step-num">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Button variant="secondary" size="lg" iconRight="arrowRight" onClick={() => router.push("/simulation")}>See the AI workflow</Button>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const feats = [
    { icon: "building", t: "Virtual companies", d: "Realistic startups with briefs, constraints and timelines pulled from actual industry work." },
    { icon: "users", t: "AI manager & team", d: "Chat with an AI CEO, PM, Tech Lead and Reviewer who guide, scope and assess like real colleagues." },
    { icon: "cpu", t: "Multi-agent evaluation", d: "Five specialized agents analyze architecture, code, docs and skills — no humans in the loop." },
    { icon: "award", t: "Verified skill passport", d: "Every skill is backed by evidence from your actual submission, not a quiz score." },
    { icon: "trending", t: "Employability report", d: "Industry readiness, hiring confidence and placement probability — plus exactly what to learn next." },
    { icon: "globe", t: "Bilingual missions", d: "Missions and feedback support multilingual context, built for India's diverse learner base." },
  ];
  return (
    <section className="section" id="features">
      <div className="page">
        <div className="sec-head">
          <div className="eyebrow">Platform</div>
          <h2>An entire career, simulated.</h2>
          <p>Everything a student needs to turn study into demonstrable, hireable experience.</p>
        </div>
        <div className="feat-grid">
          {feats.map((f, i) => (
            <Reveal delay={i * 70} key={i}>
              <Card className="pad-lg feat-card card-hover" style={{ height: "100%", textAlign: "left" }}>
                <div className="feat-icon"><Icon name={f.icon} size={20} style={{ color: "var(--accent)" }} /></div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const rows = [
    { who: "For students", icon: "graduation", items: ["Build a portfolio of real, reviewed projects", "Know your exact gaps before interviews", "Walk in with proof, not just a CV"] },
    { who: "For institutions", icon: "building", items: ["Track placement readiness per cohort", "Bridge curriculum to industry demand", "Outcome data that funders care about"] },
    { who: "For employers", icon: "briefcase", items: ["Hire on verified evidence of work", "Shrink screening time dramatically", "Reduce mis-hires and ramp-up cost"] },
  ];
  return (
    <section className="section" style={{ background: "var(--bg-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="page">
        <div className="sec-head">
          <div className="eyebrow">Benefits</div>
          <h2>One platform, three winners.</h2>
        </div>
        <div className="feat-grid">
          {rows.map((r, i) => (
            <Reveal delay={i * 80} key={i}>
              <Card className="pad-lg" style={{ height: "100%", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 20 }}>
                  <div className="feat-icon" style={{ margin: 0 }}><Icon name={r.icon} size={20} style={{ color: "var(--c-emerald)" }} /></div>
                  <h3 style={{ fontSize: 18 }}>{r.who}</h3>
                </div>
                {r.items.map((it, j) => (
                  <div key={j} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "9px 0", borderTop: j ? "1px solid var(--border)" : "none" }}>
                    <Icon name="check" size={16} style={{ color: "var(--good)", marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14.5, color: "var(--text-dim)" }}>{it}</span>
                  </div>
                ))}
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="section" id="proof">
      <div className="page">
        <div className="sec-head">
          <div className="eyebrow">Outcomes</div>
          <h2>Students who proved it — and got hired.</h2>
        </div>
        <div className="testi-grid">
          {testimonials.map((t, i) => (
            <Reveal delay={i * 90} key={i}>
              <Card className="pad-lg" style={{ height: "100%", textAlign: "left" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {[...Array(5)].map((_, k) => <Icon key={k} name="star" size={14} style={{ color: "var(--c-amber)", fill: "var(--c-amber)" }} />)}
                </div>
                <p>“{t.quote}”</p>
                <div className="testi-foot">
                  <div className="avatar">{t.avatar}</div>
                  <div><div className="nm">{t.name}</div><div className="rl">{t.role}</div></div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const router = useRouter();
  return (
    <section className="section">
      <div className="page">
        <Card className="pad-lg" style={{ textAlign: "center", padding: "64px 32px", position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg,var(--elevated),var(--surface))", borderColor: "var(--border-strong)" }}>
          <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 500, height: 300,
            background: "radial-gradient(50% 50% at 50% 50%,color-mix(in oklch,var(--accent) 30%,transparent),transparent 70%)", filter: "blur(30px)" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontSize: "clamp(28px,4vw,42px)", maxWidth: "18ch", margin: "0 auto" }}>Stop studying for the job. Start doing it.</h2>
            <p style={{ color: "var(--text-dim)", fontSize: 17, marginTop: 16, maxWidth: "46ch", margin: "16px auto 0" }}>
              Choose a career path and ship your first real mission in minutes.
            </p>
            <div className="hero-cta">
              <Button variant="primary" size="lg" icon="rocket" onClick={() => router.push("/careers")}>Start Simulation</Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="page footer-inner">
        <div style={{ maxWidth: 280, textAlign: "left" }}>
          <Logo />
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 14, lineHeight: 1.55 }}>
            The AI employment simulator that turns study into hireable experience. Built for PS-3.
          </p>
        </div>
        <div className="footer-cols">
          <div className="footer-col" style={{ textAlign: "left" }}>
            <h4>Platform</h4>
            <Link href="/careers">Careers</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/mission">Missions</Link>
            <Link href="/passport">Skill Passport</Link>
          </div>
          <div className="footer-col" style={{ textAlign: "left" }}>
            <h4>Company</h4>
            <a href="#">About</a><a href="#">Blog</a><a href="#">Careers</a><a href="#">Contact</a>
          </div>
          <div className="footer-col" style={{ textAlign: "left" }}>
            <h4>Legal</h4>
            <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Security</a>
          </div>
        </div>
      </div>
      <div className="page" style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: 13 }}>
        <span>© 2026 CareerSim AI · Demo prototype</span>
        <span className="mono">Higher Education &amp; Skilling · PS-3</span>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ position: "relative" }}>
      <div className="grid-bg" />
      <div className="glow" />
      <LandingNav />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <FeaturesSection />
        <Benefits />
        <Testimonials />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}

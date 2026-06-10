"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ---- Icons (minimal line set, lucide-style) ---- */
export const ICON_PATHS: Record<string, string> = {
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  git: '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>',
  arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  play: '<polygon points="6 4 20 12 6 20 6 4"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5L17 22l-5-3-5 3 1.5-8.5"/>',
  fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  trending: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  flame: '<path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C8 9 7 11 7 13a5 5 0 0 0 10 0c0-5-5-11-5-11z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  brain: '<path d="M9.5 2a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 8.5a3 3 0 0 0 0 6A3.5 3.5 0 0 0 9 18a3 3 0 0 0 .5-6V2z"/><path d="M14.5 2a3 3 0 0 1 3 3v.5A3 3 0 0 1 20 8.5a3 3 0 0 1 0 6A3.5 3.5 0 0 1 15 18a3 3 0 0 1-.5-6V2z"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="8" y2="6"/><line x1="12" y1="6" x2="12" y2="6"/><line x1="16" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/>',
  chevronRight: '<polyline points="9 18 15 12 9 6"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  message: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  graduation: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5"/>',
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, className = "", style = {}, strokeWidth = 1.8 }: IconProps) {
  const p = ICON_PATHS[name] || "";
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" style={style}
      dangerouslySetInnerHTML={{ __html: p }} />
  );
}

/* ---- Button ---- */
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  icon?: string;
  iconRight?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Button({ children, variant = "primary", size = "md", onClick, icon, iconRight, className = "", style = {} }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} btn-${size} ${className}`} onClick={onClick} style={style}>
      {icon && <Icon name={icon} size={size === "lg" ? 18 : 16} />}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={size === "lg" ? 18 : 16} />}
    </button>
  );
}

/* ---- Card ---- */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", style = {}, hover = false, onClick }: CardProps) {
  return (
    <div className={`card ${hover ? "card-hover" : ""} ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
}

/* ---- Badge ---- */
interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className = "" }: BadgeProps) {
  const st = color ? { color, borderColor: "color-mix(in oklch, " + color + " 35%, transparent)", background: "color-mix(in oklch, " + color + " 12%, transparent)" } : {};
  return <span className={`badge ${className}`} style={st}>{children}</span>;
}

/* ---- Animated count-up number ---- */
interface CountUpProps {
  to: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
  start?: boolean;
}

export function CountUp({ to, duration = 1100, suffix = "", decimals = 0, start = true }: CountUpProps) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number, t0: number;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, start, duration]);
  return <span>{v.toFixed(decimals)}{suffix}</span>;
}

/* ---- Linear progress bar ---- */
interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
  delay?: number;
  showTrack?: boolean;
}

export function ProgressBar({ value, color = "var(--accent)", height = 8, delay = 0, showTrack = true }: ProgressBarProps) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 120 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="progress-track" style={{ height, background: showTrack ? "rgba(255,255,255,0.06)" : "transparent" }}>
      <div className="progress-fill" style={{ width: w + "%", background: color, transition: "width 1.1s cubic-bezier(.22,1,.36,1)" }} />
    </div>
  );
}

/* ---- Circular score ring ---- */
interface ScoreRingProps {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  sub?: string;
  decimals?: number;
}

export function ScoreRing({ value, max = 100, size = 120, stroke = 9, color = "var(--accent)", label, sub, decimals = 0 }: ScoreRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [off, setOff] = useState(c);
  useEffect(() => {
    const t = setTimeout(() => setOff(c - (value / max) * c), 150);
    return () => clearTimeout(t);
  }, [value, max, c]);
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)", transform: "rotate(-90deg)", transformOrigin: "center" }} />
      </svg>
      <div className="ring-center">
        <div className="ring-value"><CountUp to={value} decimals={decimals} /></div>
        {label && <div className="ring-label">{label}</div>}
      </div>
      {sub && <div className="ring-sub">{sub}</div>}
    </div>
  );
}

/* ---- Radar chart (SVG, simple polygon) ---- */
interface RadarDataPoint {
  axis: string;
  value: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  color?: string;
}

export function RadarChart({ data, size = 300, color = "var(--accent)" }: RadarChartProps) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 38;
  const n = data.length;
  const [grow, setGrow] = useState(0);
  useEffect(() => { const t = setTimeout(() => setGrow(1), 200); return () => clearTimeout(t); }, []);
  const pt = (i: number, rad: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
  };
  const rings = [0.25, 0.5, 0.75, 1];
  const poly = data.map((d, i) => pt(i, R * (d.value / 100) * grow).join(",")).join(" ");
  return (
    <svg width={size} height={size} className="radar">
      {rings.map((rg, i) => (
        <polygon key={i} points={data.map((_, j) => pt(j, R * rg).join(",")).join(" ")}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}
      <polygon points={poly} fill={`color-mix(in oklch, ${color} 22%, transparent)`} stroke={color} strokeWidth="2"
        style={{ transition: "all 1.2s cubic-bezier(.22,1,.36,1)" }} />
      {data.map((d, i) => {
        const [x, y] = pt(i, R * (d.value / 100) * grow);
        return <circle key={i} cx={x} cy={y} r="3.5" fill={color} style={{ transition: "all 1.2s cubic-bezier(.22,1,.36,1)" }} />;
      })}
      {data.map((d, i) => {
        const [x, y] = pt(i, R + 22);
        return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
          fill="var(--muted)" fontSize="11" fontWeight="500">{d.axis}</text>;
      })}
    </svg>
  );
}

/* ---- Logo ---- */
interface LogoProps {
  size?: number;
  onClick?: () => void;
}

export function Logo({ size = 28, onClick }: LogoProps) {
  return (
    <div className="logo" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <div className="logo-mark" style={{ width: size, height: size }}>
        <Icon name="brain" size={size * 0.6} />
      </div>
      <span className="logo-text">CareerSim<span style={{ color: "var(--accent)" }}> AI</span></span>
    </div>
  );
}

/* ---- App nav bar ---- */
export function AppNav() {
  const pathname = usePathname();
  const items = [
    { id: "dashboard", label: "Dashboard", icon: "grid" },
    { id: "careers", label: "Careers", icon: "compass" },
    { id: "mission", label: "Mission", icon: "briefcase" },
    { id: "review", label: "Review", icon: "fileText" },
    { id: "passport", label: "Passport", icon: "award" },
    { id: "report", label: "Report", icon: "trending" },
  ];
  return (
    <header className="appnav">
      <Link href="/">
        <Logo size={26} />
      </Link>
      <nav className="appnav-links">
        {items.map((it) => {
          const href = `/${it.id}`;
          const active = pathname === href;
          return (
            <Link key={it.id} href={href} className={`appnav-link ${active ? "active" : ""}`}>
              <Icon name={it.icon} size={15} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="appnav-right">
        <div className="appnav-streak"><Icon name="flame" size={14} style={{ color: "var(--c-amber)" }} /> 11</div>
        <div className="avatar avatar-me">AR</div>
      </div>
    </header>
  );
}

/* ---- Section reveal on mount ---- */
interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Reveal({ children, delay = 0, y = 16, className = "", style = {} }: RevealProps) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className={className} style={{
      ...style,
      opacity: on ? 1 : 0,
      transform: on ? "translateY(0)" : `translateY(${y}px)`,
      transition: "opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1)",
    }}>{children}</div>
  );
}

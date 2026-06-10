export interface Career {
  id: string;
  title: string;
  blurb: string;
  salary: string;
  salaryUsd: string;
  demand: number;
  difficulty: string;
  difficultyLevel: number;
  skills: string[];
  accent: string;
  openRoles: string;
}

export interface Mission {
  id: string;
  project: string;
  company: string;
  companyTag: string;
  manager: string;
  managerTitle: string;
  role: string;
  status: string;
  day: number;
  timeline: number;
  summary: string;
  requirements: string[];
  constraints: string[];
  acceptance: string[];
}

export interface ChatMessage {
  from: "agent" | "user";
  text: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  tagline: string;
  messages: ChatMessage[];
}

export interface WorkflowStep {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export interface ScoreItem {
  label: string;
  value: number;
  note: string;
}

export interface EvaluationItem {
  title: string;
  note: string;
}

export interface Review {
  overall: number;
  scores: ScoreItem[];
  strengths: EvaluationItem[];
  weaknesses: EvaluationItem[];
  summary: string;
}

export interface Skill {
  name: string;
  value: number;
  verified: boolean;
  evidence: string;
}

export interface RadarData {
  axis: string;
  value: number;
}

export interface RoadmapItem {
  month: string;
  focus: string;
  detail: string;
  lift: string;
}

export interface MatchedRole {
  company: string;
  role: string;
  match: number;
}

export interface ReportData {
  readiness: number;
  level: string;
  confidence: string;
  placementProbability: number;
  percentile: number;
  strengths: string[];
  weaknesses: string[];
  roadmap: RoadmapItem[];
  matchedRoles: MatchedRole[];
}

export interface FeedbackItem {
  agent: string;
  role: string;
  text: string;
  time: string;
  color: string;
}

export interface NextSkill {
  name: string;
  reason: string;
  value: number;
}

export interface DashboardData {
  name: string;
  careerPath: string;
  progress: number;
  currentMission: string;
  missionsCompleted: number;
  missionsTotal: number;
  streak: number;
  hoursSimulated: number;
  recentFeedback: FeedbackItem[];
  nextSkill: NextSkill;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export const careers: Career[] = [
  {
    id: "ai-engineer",
    title: "AI Engineer",
    blurb: "Build and ship LLM-powered products, RAG systems, and ML pipelines.",
    salary: "₹18–34 LPA",
    salaryUsd: "$95k–$180k",
    demand: 96,
    difficulty: "Advanced",
    difficultyLevel: 4,
    skills: ["Python", "PyTorch", "RAG", "Prompt Engineering", "FastAPI", "Vector DBs"],
    accent: "var(--accent)",
    openRoles: "12,400",
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    blurb: "Turn raw data into models, experiments, and business decisions.",
    salary: "₹14–28 LPA",
    salaryUsd: "$85k–$160k",
    demand: 91,
    difficulty: "Advanced",
    difficultyLevel: 4,
    skills: ["Python", "Statistics", "SQL", "ML", "Pandas", "Experimentation"],
    accent: "var(--c-cyan)",
    openRoles: "9,800",
  },
  {
    id: "backend-engineer",
    title: "Backend Engineer",
    blurb: "Design APIs, services, and data systems that scale to millions.",
    salary: "₹12–30 LPA",
    salaryUsd: "$90k–$170k",
    demand: 88,
    difficulty: "Intermediate",
    difficultyLevel: 3,
    skills: ["Go / Node", "PostgreSQL", "System Design", "Docker", "Redis", "APIs"],
    accent: "var(--c-emerald)",
    openRoles: "21,300",
  },
  {
    id: "product-manager",
    title: "Product Manager",
    blurb: "Own the why and the what — strategy, roadmap, and execution.",
    salary: "₹16–40 LPA",
    salaryUsd: "$100k–$200k",
    demand: 84,
    difficulty: "Intermediate",
    difficultyLevel: 3,
    skills: ["Strategy", "Discovery", "Analytics", "Roadmapping", "Comms", "SQL"],
    accent: "var(--c-amber)",
    openRoles: "7,200",
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    blurb: "Defend systems, hunt threats, and run incident response.",
    salary: "₹13–26 LPA",
    salaryUsd: "$88k–$150k",
    demand: 89,
    difficulty: "Advanced",
    difficultyLevel: 4,
    skills: ["Networking", "SIEM", "Threat Intel", "Linux", "Forensics", "Python"],
    accent: "var(--c-rose)",
    openRoles: "10,100",
  },
];

export const mission: Mission = {
  id: "hospital-chatbot",
  project: "Hospital Support Chatbot",
  company: "HealthTech Solutions",
  companyTag: "Series B · Health AI",
  manager: "Sarah Chen",
  managerTitle: "Engineering Manager",
  role: "Junior AI Engineer",
  status: "In Progress",
  day: 3,
  timeline: 5,
  summary:
    "Build a multilingual hospital support chatbot that helps patients find answers, book appointments, and get reliable, cited information.",
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

export const agents: Agent[] = [
  {
    id: "ceo",
    name: "Devin Rao",
    role: "AI CEO",
    avatar: "DR",
    color: "var(--accent)",
    tagline: "Sets the vision & the bar.",
    messages: [
      { from: "agent", text: "Welcome to HealthTech, Aryan. Glad to have you on the chatbot squad." },
      { from: "agent", text: "Context: 40% of our support tickets are repetitive FAQs in Hindi. If we deflect even half, we free our nurses for real care." },
      { from: "agent", text: "Ship something patients trust. Citations aren't optional — in healthcare, a confident wrong answer is worse than 'I don't know'." },
      { from: "user", text: "Understood. I'll prioritise grounded answers with sources." },
      { from: "agent", text: "That's the instinct I want to see. Sarah will handle your day-to-day. Make us proud. 🚀" },
    ],
  },
  {
    id: "pm",
    name: "Sarah Chen",
    role: "AI Product Manager",
    avatar: "SC",
    color: "var(--c-cyan)",
    tagline: "Owns scope & priorities.",
    messages: [
      { from: "agent", text: "Hey Aryan! For v1, scope is: FAQ retrieval + appointment intent. Skip live calendar integration for now." },
      { from: "agent", text: "Two languages only — English and Hindi. Don't over-engineer for more yet." },
      { from: "user", text: "Should the appointment flow actually book, or just collect details?" },
      { from: "agent", text: "Great question. v1 = collect name, department, preferred slot, then hand off. We'll wire real booking next sprint." },
      { from: "agent", text: "Acceptance criteria are pinned in the mission panel. Ping me if anything is ambiguous." },
    ],
  },
  {
    id: "techlead",
    name: "Marcus Lee",
    role: "AI Tech Lead",
    avatar: "ML",
    color: "var(--c-emerald)",
    tagline: "Guards the architecture.",
    messages: [
      { from: "agent", text: "Architecture-wise: FastAPI service, a retriever over our vector store, then the generation step. Keep them as separate modules." },
      { from: "agent", text: "Chunk the hospital docs at ~500 tokens with overlap. Store embeddings + metadata so you can cite the source file and section." },
      { from: "user", text: "Which vector store do you recommend?" },
      { from: "agent", text: "Any of pgvector / FAISS / Chroma is fine for the demo. Optimise for clarity over cleverness — I review for readable structure." },
      { from: "agent", text: "Add a /health endpoint and structured logging. Reviewers love to see ops hygiene." },
    ],
  },
  {
    id: "reviewer",
    name: "Aisha Khan",
    role: "AI Reviewer",
    avatar: "AK",
    color: "var(--c-amber)",
    tagline: "Evaluates your submission.",
    messages: [
      { from: "agent", text: "I'll be assessing your final submission across architecture, code quality, documentation and scalability." },
      { from: "agent", text: "Tip: a clear README with setup steps and an architecture diagram moves your documentation score the most." },
      { from: "user", text: "Do tests count?" },
      { from: "agent", text: "Yes — even a handful of unit tests on the retriever signals engineering maturity. Dockerising is a bonus." },
      { from: "agent", text: "Submit when ready. I turn around a full review in under a minute. 📋" },
    ],
  },
];

export const workflowSteps: WorkflowStep[] = [
  { id: "career", title: "Career Agent", desc: "Matching your profile to the AI Engineer track", icon: "compass" },
  { id: "assignment", title: "Assignment Agent", desc: "Generating an industry-grade mission brief", icon: "clipboard" },
  { id: "submission", title: "Submission Analysis Agent", desc: "Parsing repo, architecture & documentation", icon: "git" },
  { id: "skill", title: "Skill Assessment Agent", desc: "Mapping evidence to verified competencies", icon: "target" },
  { id: "coach", title: "Career Coach Agent", desc: "Composing your employability report", icon: "sparkles" },
];

export const analysisStages: string[] = [
  "Cloning repository…",
  "Analyzing architecture…",
  "Evaluating documentation…",
  "Running static checks…",
  "Mapping skills to evidence…",
  "Generating employability report…",
];

export const review: Review = {
  overall: 8.0,
  scores: [
    { label: "Architecture", value: 8.2, note: "Clean separation of retriever and generation layers." },
    { label: "Code Quality", value: 8.8, note: "Readable, typed, well-named modules." },
    { label: "Documentation", value: 7.9, note: "Solid README; add an architecture diagram." },
    { label: "Scalability", value: 7.1, note: "Stateless API is good; caching layer would help." },
  ],
  strengths: [
    { title: "API Design", note: "RESTful, predictable, well-versioned endpoints." },
    { title: "Prompt Engineering", note: "Grounded prompts with citation enforcement." },
    { title: "FastAPI Structure", note: "Dependency injection used idiomatically." },
  ],
  weaknesses: [
    { title: "Docker", note: "No containerisation — add a Dockerfile + compose." },
    { title: "Testing", note: "Retriever lacks unit coverage." },
    { title: "Deployment", note: "No CI/CD or hosting story documented." },
  ],
  summary:
    "Strong, production-leaning submission. The retrieval pipeline is well-architected and your prompts enforce citations — exactly what healthcare demands. Close the gap on containerisation and testing to reach senior-junior level.",
};

export const skills: Skill[] = [
  { name: "Python", value: 92, verified: true, evidence: "Core service & retriever written in idiomatic Python 3.11." },
  { name: "FastAPI", value: 89, verified: true, evidence: "Verified from Hospital Chatbot project — clean DI + routers." },
  { name: "Prompt Engineering", value: 90, verified: true, evidence: "Citation-enforcing prompts with low hallucination rate." },
  { name: "RAG", value: 83, verified: true, evidence: "End-to-end retrieval pipeline with chunking + reranking." },
  { name: "System Design", value: 61, verified: false, evidence: "Stateless API design; caching & sharding not yet shown." },
  { name: "Docker", value: 54, verified: false, evidence: "No container artifacts found in submission." },
];

export const radar: RadarData[] = [
  { axis: "Problem Solving", value: 88 },
  { axis: "Code Quality", value: 86 },
  { axis: "Architecture", value: 82 },
  { axis: "Communication", value: 79 },
  { axis: "Testing", value: 58 },
  { axis: "Ops / Deploy", value: 55 },
];

export const report: ReportData = {
  readiness: 78,
  level: "Junior AI Engineer",
  confidence: "High",
  placementProbability: 82,
  percentile: 91,
  strengths: ["Grounded RAG implementation", "Idiomatic FastAPI & Python", "Clear, citation-first prompting"],
  weaknesses: ["Containerisation & deployment", "Automated test coverage", "System-design depth at scale"],
  roadmap: [
    { month: "Month 1", focus: "Docker", detail: "Containerise the service, add docker-compose for the vector store.", lift: "+8% readiness" },
    { month: "Month 2", focus: "Cloud Deployment", detail: "Ship to a managed host with CI/CD and health checks.", lift: "+7% readiness" },
    { month: "Month 3", focus: "MLOps Basics", detail: "Add eval harness, monitoring, and model/version tracking.", lift: "+6% readiness" },
  ],
  matchedRoles: [
    { company: "Nexa Health", role: "Junior AI Engineer", match: 92 },
    { company: "Lumen Labs", role: "ML Platform Intern", match: 88 },
    { company: "Vyom AI", role: "Applied AI Engineer I", match: 84 },
  ],
};

export const dashboard: DashboardData = {
  name: "Aryan",
  careerPath: "AI Engineer",
  progress: 72,
  currentMission: "Hospital Support Chatbot",
  missionsCompleted: 4,
  missionsTotal: 6,
  streak: 11,
  hoursSimulated: 47,
  recentFeedback: [
    { agent: "Aisha Khan", role: "AI Reviewer", text: "Excellent citation discipline on the FAQ retriever.", time: "2h ago", color: "var(--c-amber)" },
    { agent: "Marcus Lee", role: "AI Tech Lead", text: "Module separation is clean — exactly what I look for.", time: "1d ago", color: "var(--c-emerald)" },
    { agent: "Sarah Chen", role: "AI PM", text: "Great scoping question on the appointment flow.", time: "2d ago", color: "var(--c-cyan)" },
  ],
  nextSkill: { name: "Docker", reason: "Unlocks deployment readiness and +8% employability.", value: 54 },
};

export const testimonials: Testimonial[] = [
  { quote: "I walked into my interview with a real project and a verified skill passport. I got the offer.", name: "Priya N.", role: "Now: AI Engineer @ Fintech", avatar: "PN" },
  { quote: "It finally felt like doing the job, not studying for it. The AI manager felt real.", name: "Rohan M.", role: "Placed: Backend Engineer", avatar: "RM" },
  { quote: "The employability report told me exactly what to learn next. No guesswork.", name: "Sneha K.", role: "Data Scientist Intern", avatar: "SK" },
];

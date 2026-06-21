# 🚀 CareerSim AI

**Live Demo**: [https://career-sim-v2.vercel.app/](https://career-sim-v2.vercel.app/)

CareerSim AI is an advanced, autonomous AI-powered platform designed to simulate real-world tech careers, evaluate developer performance, and generate verifiable digital skill passports. Built for hackathons, coding bootcamps, and developer portfolios, CareerSim acts as your virtual senior engineer, code reviewer, and career coach all in one.

---

## ✨ Features

- **🎯 Career Missions**: Select a tech career track (e.g., AI Engineer) and receive highly-tailored, realistic project requirements to build.
- **🤖 Autonomous AI Code Review**: Submit your GitHub repository link. Our Groq-powered AI agent downloads, bundles, and deeply analyzes your entire codebase to provide actionable feedback, scores, and strengths.
- **🛂 Digital Skill Passport**: As the AI reviews your code, it cryptographically extracts the exact technologies you used and verified. These are added to a dynamic digital Passport. 
- **📲 Verifiable QR Codes**: Instantly generate a shareable QR code that allows employers to instantly verify the skills you've proven you know how to use.
- **📊 Employability Reports**: Get a dynamically generated career readiness report, complete with placement probabilities and a personalized roadmap, based *exclusively* on the quality of your latest code submission.

---

## 🛠️ Tech Stack

### 🎨 Frontend
- **Framework**: Next.js 15 (App Router)
- **Library**: React 19 
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Hosting**: Vercel

### ⚙️ Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn (ASGI)
- **Hosting**: Railway

### 🧠 Artificial Intelligence
- **Inference Engine**: Groq API *(Chosen for ultra-fast, near-instant LLM inference speeds)*
- **Model**: `Llama-3.3-70b-versatile` 

### 🗄️ Database & Auth
- **Platform**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth (JWT-based token system)

---

## 🚀 Running Locally

To run this project on your local machine, you will need to set up both the backend and frontend servers.

### 1. Backend Setup
Navigate to the backend directory and install the Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the `/backend` directory and add the following keys:
```env
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=your_github_token
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `/frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the Next.js development server:
```bash
npm run dev
```

The application will be running at `http://localhost:3000`.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/aryangoel984/Career-Sim_v2/issues).

# 🚀 VentureAI - AI-Powered Startup Incubator Chatbot

VentureAI is a premium, next-generation AI-driven incubator dashboard designed to guide founders from startup ideas to investor-ready pitches. Interact with multiple tailored AI personas, manage tasks, generate essential business documents, and track your progress in real-time.

---

## 🌟 Key Features

*   **Multi-Persona AI Advisory**: Chat with specialized AI advisors (e.g., Nova the CTO, CEO, CMO, CFO, Legal Advisor, and Investor).
*   **Dynamic Startup Dashboard**: Real-time progress trackers, startup scores, stage indicators, and task lists.
*   **AI Document Generation**: Automatically compile ready-to-use business plans, SWOT analyses, pitch decks, lean canvases, marketing plans, and investor summaries.
*   **Interactive Task Manager**: Keep track of AI-suggested milestones and checklist items for your startup.
*   **Bookmarks & Insights**: Save crucial AI insights and messages for quick reference.
*   **Speech & Voice Tools**: Seamless voice-to-text input and text-to-speech voice playback for AI responses.
*   **Offline Fallback Mode**: Fallback local rule engine if API keys or connectivity are missing.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 13 (App Router)
*   **Frontend**: React, TailwindCSS, Lucide Icons, Shadcn UI
*   **Backend & Auth**: Supabase (Database, Auth, Row Level Security)
*   **AI Models**: Gemini API (via `gemini-1.5-flash` model)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone <your-repository-url>
cd venture-ai
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory and add the following keys:
```env
# AI Models
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key_optional

# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL=https://your_project_id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Database Schema (Supabase)
Apply the migration script to create the necessary tables, indexes, and Row Level Security (RLS) policies:
1. Open the migration file: [20260801114657_create_ventureai_schema.sql](supabase/migrations/20260801114657_create_ventureai_schema.sql).
2. Copy the SQL commands.
3. Paste them in the **SQL Editor** on your Supabase dashboard and click **Run**.

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Security & RLS
Every database table operates under **Row Level Security (RLS)** ensuring multi-user isolation:
*   Users can only view, insert, update, or delete data belonging to their own `user_id`.
*   Authentication is handled completely through secure Supabase JWT sessions.

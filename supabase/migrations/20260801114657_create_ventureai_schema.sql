/*
# VentureAI Core Schema

1. Overview
This migration creates the full data model for VentureAI, an AI-powered
startup incubator chatbot. It supports multi-user data isolation: each
signed-in user sees only their own projects, chats, messages, documents,
bookmarks, and tasks.

2. New Tables
- `projects` — a startup idea/project the user is building. Tracks stage,
  startup score, and investor readiness.
- `chats` — a conversation thread tied to a project (optional) and an AI
  persona (ceo, cto, cmo, cfo, legal, investor, general).
- `messages` — individual messages within a chat (user or assistant role).
  Carries optional structured metadata (tool results, charts, follow-ups,
  generated documents, suggested tasks).
- `documents` — generated business plans, pitch decks, lean canvas, SWOT,
  marketing plans, financial projections, investor summaries, launch
  checklists. Linked to a project and/or chat.
- `bookmarks` — saved snippets from messages or chats.
- `tasks` — checklist items the AI suggests and the user can complete.

3. Security
- RLS enabled on every table.
- All policies scope TO authenticated with auth.uid() = user_id ownership
  checks (4 policies per table: select/insert/update/delete).
- user_id columns default to auth.uid() so client inserts that omit
  user_id still satisfy WITH CHECK.
- updated_at auto-maintained on projects and chats via triggers.

4. Important Notes
- Tables use IF NOT EXISTS for idempotency.
- Policies DROP IF EXISTS before CREATE for idempotent re-runs.
- All foreign keys use ON DELETE CASCADE or SET NULL to keep data clean.
*/

-- Updated_at helper function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- projects
-- =========================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  tagline text,
  description text,
  stage text NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea','validation','planning','mvp','launch','growth')),
  startup_score int NOT NULL DEFAULT 0 CHECK (startup_score >= 0 AND startup_score <= 100),
  investor_readiness int NOT NULL DEFAULT 0 CHECK (investor_readiness >= 0 AND investor_readiness <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_projects" ON public.projects;
CREATE POLICY "select_own_projects" ON public.projects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_projects" ON public.projects;
CREATE POLICY "insert_own_projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_projects" ON public.projects;
CREATE POLICY "update_own_projects" ON public.projects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_projects" ON public.projects;
CREATE POLICY "delete_own_projects" ON public.projects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS projects_set_updated_at ON public.projects;
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- chats
-- =========================================================
CREATE TABLE IF NOT EXISTS public.chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  persona text NOT NULL DEFAULT 'general' CHECK (persona IN ('general','ceo','cto','cmo','cfo','legal','investor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chats" ON public.chats;
CREATE POLICY "select_own_chats" ON public.chats FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_chats" ON public.chats;
CREATE POLICY "insert_own_chats" ON public.chats
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_chats" ON public.chats;
CREATE POLICY "update_own_chats" ON public.chats FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chats" ON public.chats;
CREATE POLICY "delete_own_chats" ON public.chats FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS chats_set_updated_at ON public.chats;
CREATE TRIGGER chats_set_updated_at
  BEFORE UPDATE ON public.chats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_chats_user ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_project ON public.chats(project_id);

-- =========================================================
-- messages
-- =========================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  persona text NOT NULL DEFAULT 'general' CHECK (persona IN ('general','ceo','cto','cmo','cfo','legal','investor')),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON public.messages;
CREATE POLICY "select_own_messages" ON public.messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_messages" ON public.messages;
CREATE POLICY "insert_own_messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_messages" ON public.messages;
CREATE POLICY "update_own_messages" ON public.messages FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_messages" ON public.messages;
CREATE POLICY "delete_own_messages" ON public.messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_messages_chat ON public.messages(chat_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_user ON public.messages(user_id);

-- =========================================================
-- documents
-- =========================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  chat_id uuid REFERENCES public.chats(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('business_plan','pitch_deck','lean_canvas','swot','marketing_plan','financial_projection','investor_summary','launch_checklist')),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON public.documents;
CREATE POLICY "select_own_documents" ON public.documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_documents" ON public.documents;
CREATE POLICY "insert_own_documents" ON public.documents
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_documents" ON public.documents;
CREATE POLICY "update_own_documents" ON public.documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_documents" ON public.documents;
CREATE POLICY "delete_own_documents" ON public.documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON public.documents(project_id);

-- =========================================================
-- bookmarks
-- =========================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  chat_id uuid REFERENCES public.chats(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_bookmarks" ON public.bookmarks;
CREATE POLICY "select_own_bookmarks" ON public.bookmarks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_bookmarks" ON public.bookmarks;
CREATE POLICY "insert_own_bookmarks" ON public.bookmarks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_bookmarks" ON public.bookmarks;
CREATE POLICY "update_own_bookmarks" ON public.bookmarks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_bookmarks" ON public.bookmarks;
CREATE POLICY "delete_own_bookmarks" ON public.bookmarks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);

-- =========================================================
-- tasks
-- =========================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tasks" ON public.tasks;
CREATE POLICY "select_own_tasks" ON public.tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tasks" ON public.tasks;
CREATE POLICY "insert_own_tasks" ON public.tasks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tasks" ON public.tasks;
CREATE POLICY "update_own_tasks" ON public.tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tasks" ON public.tasks;
CREATE POLICY "delete_own_tasks" ON public.tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);

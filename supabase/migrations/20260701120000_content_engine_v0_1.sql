-- BodyFix Content Engine MVP v0.1 - Database Schema Draft
-- Date: 2026-07-01
-- Description: Seven tables for content management, approval, and Manus task tracking.

-- 1. Content Projects
CREATE TABLE IF NOT EXISTS public.content_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    current_version_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Content Versions
CREATE TABLE IF NOT EXISTS public.content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.content_projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL,
    created_by TEXT NOT NULL CHECK (created_by IN ('AI', 'HUMAN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, version_number)
);

-- 3. Approval Logs (Append-only)
CREATE TABLE IF NOT EXISTS public.content_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES public.content_versions(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('APPROVE_TEXT', 'APPROVE_VISUAL', 'REQUEST_REVISION', 'REJECT')),
    comment TEXT,
    actor TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Manus Tasks
CREATE TABLE IF NOT EXISTS public.manus_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_task_id TEXT UNIQUE,
    version_id UUID NOT NULL REFERENCES public.content_versions(id) ON DELETE CASCADE,
    idempotency_key TEXT NOT NULL UNIQUE,
    task_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'completed', 'failed')),
    payload JSONB NOT NULL,
    result JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Content Metrics (Manual backfill for v0.1)
CREATE TABLE IF NOT EXISTS public.content_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.content_projects(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    dms INTEGER DEFAULT 0,
    period_label TEXT NOT NULL, -- e.g., '48h', '7d', '30d'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Content Engine Settings
CREATE TABLE IF NOT EXISTS public.content_engine_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Content Templates
CREATE TABLE IF NOT EXISTS public.content_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    structure JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.content_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manus_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_engine_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;

-- Note: RLS Policies should be defined to only allow authenticated 'owner' access.
-- No anon access should be granted.

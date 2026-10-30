CREATE TABLE IF NOT EXISTS public_projects (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_label TEXT NOT NULL,
  description TEXT NOT NULL,
  repository_url TEXT NOT NULL,
  website_url TEXT NULL,
  status TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_priority SMALLINT NOT NULL DEFAULT 0 CHECK (marketing_priority BETWEEN 0 AND 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_projects_priority
  ON public_projects (marketing_priority DESC, name ASC);

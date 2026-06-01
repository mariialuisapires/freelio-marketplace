ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX idx_projects_category_id ON projects(category_id);

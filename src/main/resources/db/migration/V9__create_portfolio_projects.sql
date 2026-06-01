CREATE TABLE portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    technologies TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX idx_portfolio_user_id ON portfolio_projects(user_id);

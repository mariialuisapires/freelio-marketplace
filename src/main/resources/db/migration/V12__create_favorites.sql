CREATE TABLE favorite_freelancers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_favorite UNIQUE (client_id, freelancer_id)
);

CREATE INDEX idx_favorites_client_id ON favorite_freelancers(client_id);

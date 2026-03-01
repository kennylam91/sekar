-- Migration: Add unique index on posts.facebook_id (partial, non-null only)
CREATE UNIQUE INDEX idx_posts_facebook_id ON posts(facebook_id) WHERE facebook_id IS NOT NULL;

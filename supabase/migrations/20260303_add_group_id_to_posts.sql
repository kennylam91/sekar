-- Add group_id foreign key to posts table
ALTER TABLE posts
  ADD COLUMN group_id VARCHAR(255) REFERENCES facebook_groups(facebook_id) ON DELETE SET NULL;

CREATE INDEX idx_posts_group_id ON posts(group_id);

-- Add routes to facebook_groups: admin assigns a list of route strings per group
ALTER TABLE facebook_groups
  ADD COLUMN routes TEXT[] NOT NULL DEFAULT '{}';

-- Add routes to posts: copied from source group at ingest time
ALTER TABLE posts
  ADD COLUMN routes TEXT[] NOT NULL DEFAULT '{}';

-- Add preferred_routes to users: drivers choose which routes they follow
ALTER TABLE users
  ADD COLUMN preferred_routes TEXT[] NOT NULL DEFAULT '{}';

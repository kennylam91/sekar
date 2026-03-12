-- Driver Facebook IDs table
-- Admins can register Facebook profile IDs that belong to known drivers.
-- When the cron job imports a post whose author matches an entry here,
-- the post is automatically classified as author_type = 'driver'.
CREATE TABLE driver_facebook_ids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facebook_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow service role to bypass RLS
ALTER TABLE driver_facebook_ids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on driver_facebook_ids" ON driver_facebook_ids
  FOR ALL USING (true) WITH CHECK (true);

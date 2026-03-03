-- Facebook groups table for cron job configuration
CREATE TABLE facebook_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facebook_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  posts_in_last_month INTEGER DEFAULT 0,
  total_members INTEGER DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow service role to bypass RLS
ALTER TABLE facebook_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on facebook_groups" ON facebook_groups
  FOR ALL USING (true) WITH CHECK (true);

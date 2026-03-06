-- Migration: Add cron_job_logs and facebook_groups tables

CREATE TABLE cron_job_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_at TIMESTAMPTZ DEFAULT NOW(),
  api_source VARCHAR(50),
  group_id VARCHAR(100),
  total_fetched INTEGER DEFAULT 0,
  total_created INTEGER DEFAULT 0,
  total_skipped INTEGER DEFAULT 0,
  total_passenger_posts INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'success',
  duration_ms INTEGER,
  requests_limit INTEGER,
  requests_remaining INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cron_job_logs_group_id ON cron_job_logs(group_id);
CREATE INDEX idx_cron_job_logs_run_at ON cron_job_logs(run_at DESC);
CREATE INDEX idx_cron_job_logs_api_source ON cron_job_logs(api_source);

ALTER TABLE cron_job_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on cron_job_logs" ON cron_job_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE facebook_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255),
  member_count BIGINT,
  last_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE facebook_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on facebook_groups" ON facebook_groups
  FOR ALL USING (true) WITH CHECK (true);

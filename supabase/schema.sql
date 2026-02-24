-- =============================================
-- Sekar Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Users table (drivers and admins only; passengers don't have accounts)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'driver' CHECK (role IN ('driver', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_type VARCHAR(20) NOT NULL CHECK (author_type IN ('passenger', 'driver')),
  author_name VARCHAR(100), -- display name (for passengers or drivers)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- only for drivers
  content TEXT NOT NULL,
  phone VARCHAR(20),
  facebook_url VARCHAR(255),
  zalo_url VARCHAR(255),
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FCM tokens for push notifications
CREATE TABLE fcm_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_posts_author_type ON posts(author_type);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_is_visible ON posts(is_visible);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_fcm_tokens_user_id ON fcm_tokens(user_id);

-- RLS policies (disable RLS since we handle auth in the app layer)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS
CREATE POLICY "Service role full access on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on posts" ON posts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on fcm_tokens" ON fcm_tokens
  FOR ALL USING (true) WITH CHECK (true);

-- Add used_llm column to posts table
-- Tracks whether the post author_type classification was resolved by the LLM
-- rather than by the local pattern-matching rules.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS used_llm BOOLEAN DEFAULT FALSE;

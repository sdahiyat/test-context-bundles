-- Create nutrition_insights table to cache AI-generated insights
CREATE TABLE IF NOT EXISTS nutrition_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  patterns JSONB NOT NULL DEFAULT '[]',
  suggestions JSONB NOT NULL DEFAULT '[]',
  period_days INTEGER NOT NULL DEFAULT 30,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_nutrition_insights_user_id ON nutrition_insights(user_id);
CREATE INDEX idx_nutrition_insights_generated_at ON nutrition_insights(user_id, generated_at DESC);

-- Enable Row Level Security
ALTER TABLE nutrition_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY insights_select_own ON nutrition_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insights_insert_own ON nutrition_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY insights_delete_own ON nutrition_insights
  FOR DELETE USING (auth.uid() = user_id);

-- Create weight_logs table for tracking daily weight entries
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2) NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: only one weight log per day per user (using UTC date)
CREATE UNIQUE INDEX IF NOT EXISTS weight_logs_user_date_unique
  ON weight_logs (user_id, DATE(logged_at AT TIME ZONE 'UTC'));

-- Index for efficient user queries ordered by date
CREATE INDEX IF NOT EXISTS weight_logs_user_logged_at_idx
  ON weight_logs (user_id, logged_at DESC);

-- Enable Row Level Security
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

-- Policy: users can only SELECT their own rows
CREATE POLICY "Users can view own weight logs"
  ON weight_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can only INSERT their own rows
CREATE POLICY "Users can insert own weight logs"
  ON weight_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can only UPDATE their own rows
CREATE POLICY "Users can update own weight logs"
  ON weight_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can only DELETE their own rows
CREATE POLICY "Users can delete own weight logs"
  ON weight_logs
  FOR DELETE
  USING (auth.uid() = user_id);

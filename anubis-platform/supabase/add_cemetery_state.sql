-- Add cemetery_state column to gravesite_profiles
ALTER TABLE gravesite_profiles
ADD COLUMN IF NOT EXISTS cemetery_state TEXT;

-- Index for fast community page state filtering
CREATE INDEX IF NOT EXISTS idx_gravesite_profiles_cemetery_state
ON gravesite_profiles (cemetery_state)
WHERE is_public = true;

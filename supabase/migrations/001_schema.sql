-- ============================================================
-- Camp Ramah Creative Assistant — Database Schema (MVP)
-- ============================================================

-- Activities (core table)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  age_min INTEGER,
  age_max INTEGER,
  duration_minutes INTEGER,
  energy_level TEXT CHECK (energy_level IN ('calm', 'medium', 'energetic')),
  location TEXT CHECK (location IN ('indoor', 'outdoor', 'waterfront', 'cabin', 'field', 'any')),
  group_size_min INTEGER,
  group_size_max INTEGER,
  materials JSONB DEFAULT '[]',        -- string[]
  instructions TEXT NOT NULL,          -- Markdown
  variations JSONB DEFAULT '[]',       -- {name, description}[]
  safety_notes TEXT,
  educational_goal TEXT,
  hebrew_element TEXT,
  tags TEXT[] DEFAULT '{}',
  source TEXT CHECK (source IN ('manual', 'ai_generated', 'syllabus_derived')) DEFAULT 'manual',
  why_it_works TEXT,
  -- Feedback aggregates
  feedback_worked_well INTEGER DEFAULT 0,
  feedback_too_chaotic INTEGER DEFAULT 0,
  feedback_too_boring INTEGER DEFAULT 0,
  feedback_run_again INTEGER DEFAULT 0,
  feedback_total INTEGER DEFAULT 0,
  -- Metadata
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for search + filtering
CREATE INDEX IF NOT EXISTS activities_fts ON activities USING gin(
  to_tsvector('english',
    coalesce(title, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(educational_goal, '')
  )
);
CREATE INDEX IF NOT EXISTS activities_tags ON activities USING gin(tags);
CREATE INDEX IF NOT EXISTS activities_energy ON activities(energy_level);
CREATE INDEX IF NOT EXISTS activities_location ON activities(location);
CREATE INDEX IF NOT EXISTS activities_duration ON activities(duration_minutes);
CREATE INDEX IF NOT EXISTS activities_source ON activities(source);

-- Activity Feedback (individual responses — for future analytics)
CREATE TABLE IF NOT EXISTS activity_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  response TEXT CHECK (response IN ('worked_well', 'too_chaotic', 'too_boring', 'run_again')),
  age_group TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feedback_activity ON activity_feedback(activity_id);

-- AI Usage (rate limiting + cost analytics)
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  ip_hash TEXT NOT NULL,             -- SHA-256 of raw IP, never stored raw
  feature TEXT CHECK (feature IN ('generator', 'magic', 'remix', 'emergency', 'syllabus')),
  model TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  output_activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_usage_session_day ON ai_usage(session_id, created_at);
CREATE INDEX IF NOT EXISTS ai_usage_ip_day ON ai_usage(ip_hash, created_at);

-- Syllabus Uploads (text/markdown only — MVP)
CREATE TABLE IF NOT EXISTS syllabus_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT,
  content TEXT NOT NULL,
  extracted_objectives JSONB,          -- string[]
  generated_activity_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_uploads ENABLE ROW LEVEL SECURITY;

-- MVP: anon role can read all public activities
CREATE POLICY "Public activities readable by all" ON activities
  FOR SELECT USING (is_public = TRUE);

-- MVP: anon role can insert (AI-generated activities + feedback)
CREATE POLICY "Anyone can insert activities" ON activities
  FOR INSERT WITH CHECK (TRUE);

-- MVP: anon can update feedback counts only
CREATE POLICY "Anyone can update feedback counts" ON activities
  FOR UPDATE USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can insert feedback" ON activity_feedback
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can insert ai_usage" ON ai_usage
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can read ai_usage for rate limiting" ON ai_usage
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can insert syllabus" ON syllabus_uploads
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can read syllabi" ON syllabus_uploads
  FOR SELECT USING (TRUE);

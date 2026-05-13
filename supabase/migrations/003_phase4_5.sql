-- Phase 4.5: Topics, bilingual, equipment metadata, operational metadata
-- All changes are non-destructive (ADD COLUMN IF NOT EXISTS)

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS topics             TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS title_he           TEXT,
  ADD COLUMN IF NOT EXISTS description_he     TEXT,
  ADD COLUMN IF NOT EXISTS instructions_he    TEXT,
  ADD COLUMN IF NOT EXISTS counselors_min     INTEGER,
  ADD COLUMN IF NOT EXISTS counselors_max     INTEGER,
  ADD COLUMN IF NOT EXISTS location_type      TEXT,
  ADD COLUMN IF NOT EXISTS coordination_level TEXT
    CHECK (coordination_level IN ('none', 'recommended', 'required'));

-- GIN index for topic array containment / overlap queries
CREATE INDEX IF NOT EXISTS activities_topics ON activities USING gin(topics);

-- Syllabus uploads: store raw content + parsed results
ALTER TABLE syllabus_uploads
  ADD COLUMN IF NOT EXISTS file_type TEXT CHECK (file_type IN ('pdf', 'docx', 'txt', 'md'));

-- RLS: allow anon to insert syllabus uploads (already in 001, but ensure)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'syllabus_uploads' AND policyname = 'anon insert syllabus_uploads'
  ) THEN
    CREATE POLICY "anon insert syllabus_uploads"
      ON syllabus_uploads FOR INSERT TO anon WITH CHECK (true);
  END IF;
END
$$;

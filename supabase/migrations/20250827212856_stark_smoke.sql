/*
  # Create document_versions table

  1. New Tables
    - `document_versions`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key)
      - `version_number` (integer)
      - `file_path` (text)
      - `file_name` (text)
      - `file_size` (bigint)
      - `uploaded_by` (uuid, foreign key)
      - `change_notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `document_versions` table
    - Add policies for version access control
*/

CREATE TABLE IF NOT EXISTS document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  uploaded_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  change_notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, version_number)
);

ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Foundation members can read document versions if they can read the parent document
CREATE POLICY "Foundation members can read document versions"
  ON document_versions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_id AND (is_foundation_member(d.foundation_id) OR is_admin())
    )
  );

-- Foundation members can create document versions if they can access the parent document
CREATE POLICY "Foundation members can create document versions"
  ON document_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_id AND is_foundation_member(d.foundation_id)
    )
  );

-- Only admins can update/delete versions (versions should be immutable)
CREATE POLICY "Only admins can modify document versions"
  ON document_versions
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete document versions"
  ON document_versions
  FOR DELETE
  TO authenticated
  USING (is_admin());
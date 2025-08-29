/*
  # Create documents table

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `foundation_id` (uuid, foreign key)
      - `uploaded_by` (uuid, foreign key)
      - `document_type` (text)
      - `file_name` (text)
      - `file_path` (text)
      - `file_size` (bigint)
      - `mime_type` (text)
      - `status` (text)
      - `approval_notes` (text)
      - `approved_by` (uuid, foreign key)
      - `approved_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `documents` table
    - Add policies for document access control
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  foundation_id uuid NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('articles_of_association', 'bylaws', 'financial_statement', 'board_resolution', 'other')),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  status text DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'pending_approval', 'approved', 'rejected')),
  approval_notes text,
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Foundation members can read documents for their foundation
CREATE POLICY "Foundation members can read documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (is_foundation_member(foundation_id) OR is_admin());

-- Foundation members can upload documents
CREATE POLICY "Foundation members can upload documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (is_foundation_member(foundation_id));

-- Foundation owners and admins can update document status
CREATE POLICY "Foundation owners can update documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (is_foundation_owner(foundation_id) OR is_admin())
  WITH CHECK (is_foundation_owner(foundation_id) OR is_admin());

-- Foundation owners and admins can delete documents
CREATE POLICY "Foundation owners can delete documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (is_foundation_owner(foundation_id) OR is_admin());

-- Trigger to update updated_at on document changes
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
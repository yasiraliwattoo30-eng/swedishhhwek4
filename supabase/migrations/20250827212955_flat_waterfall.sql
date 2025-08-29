/*
  # Create grants table

  1. New Tables
    - `grants`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `grant_name` (text)
      - `grantor_name` (text)
      - `amount` (numeric)
      - `currency` (text)
      - `status` (text)
      - `application_date` (date)
      - `award_date` (date)
      - `completion_date` (date)
      - `requirements` (jsonb)
      - `reporting_schedule` (jsonb)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `grants` table
    - Add policies for grant access control
*/

CREATE TABLE IF NOT EXISTS grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  grant_name text NOT NULL,
  grantor_name text NOT NULL,
  amount numeric(15,2) NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'SEK' NOT NULL,
  status text DEFAULT 'applied' CHECK (status IN ('applied', 'under_review', 'awarded', 'rejected', 'completed', 'cancelled')),
  application_date date NOT NULL,
  award_date date,
  completion_date date,
  requirements jsonb DEFAULT '[]',
  reporting_schedule jsonb DEFAULT '[]',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_award_date CHECK (award_date IS NULL OR award_date >= application_date),
  CONSTRAINT valid_completion_date CHECK (completion_date IS NULL OR completion_date >= COALESCE(award_date, application_date))
);

ALTER TABLE grants ENABLE ROW LEVEL SECURITY;

-- Foundation members can read grants for projects in their foundation
CREATE POLICY "Foundation members can read grants"
  ON grants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (is_foundation_member(p.foundation_id) OR is_admin())
    )
  );

-- Foundation owners can create grants
CREATE POLICY "Foundation owners can create grants"
  ON grants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (is_foundation_owner(p.foundation_id) OR is_admin())
    )
  );

-- Foundation owners and project managers can update grants
CREATE POLICY "Foundation owners can update grants"
  ON grants
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        is_foundation_owner(p.foundation_id) OR 
        auth.uid() = p.project_manager_id OR 
        is_admin()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        is_foundation_owner(p.foundation_id) OR 
        auth.uid() = p.project_manager_id OR 
        is_admin()
      )
    )
  );

-- Foundation owners can delete grants
CREATE POLICY "Foundation owners can delete grants"
  ON grants
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (is_foundation_owner(p.foundation_id) OR is_admin())
    )
  );

-- Trigger to update updated_at on grant changes
CREATE TRIGGER update_grants_updated_at
  BEFORE UPDATE ON grants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
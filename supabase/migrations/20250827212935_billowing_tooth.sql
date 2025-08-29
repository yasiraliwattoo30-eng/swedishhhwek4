/*
  # Create financial_reports table

  1. New Tables
    - `financial_reports`
      - `id` (uuid, primary key)
      - `foundation_id` (uuid, foreign key)
      - `report_type` (text)
      - `report_period_start` (date)
      - `report_period_end` (date)
      - `generated_by` (uuid, foreign key)
      - `file_path` (text)
      - `status` (text)
      - `total_income` (numeric)
      - `total_expenses` (numeric)
      - `net_result` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `financial_reports` table
    - Add policies for report access control
*/

CREATE TABLE IF NOT EXISTS financial_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  foundation_id uuid NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('monthly', 'quarterly', 'annual', 'custom')),
  report_period_start date NOT NULL,
  report_period_end date NOT NULL,
  generated_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_path text,
  status text DEFAULT 'generated' CHECK (status IN ('generated', 'reviewed', 'approved', 'published')),
  total_income numeric(12,2) DEFAULT 0,
  total_expenses numeric(12,2) DEFAULT 0,
  net_result numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_period CHECK (report_period_end >= report_period_start)
);

ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;

-- Foundation owners and members can read financial reports for their foundation
CREATE POLICY "Foundation members can read financial reports"
  ON financial_reports
  FOR SELECT
  TO authenticated
  USING (is_foundation_member(foundation_id) OR is_admin());

-- Foundation owners can create financial reports
CREATE POLICY "Foundation owners can create financial reports"
  ON financial_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (is_foundation_owner(foundation_id) OR is_admin());

-- Foundation owners can update financial reports
CREATE POLICY "Foundation owners can update financial reports"
  ON financial_reports
  FOR UPDATE
  TO authenticated
  USING (is_foundation_owner(foundation_id) OR is_admin())
  WITH CHECK (is_foundation_owner(foundation_id) OR is_admin());

-- Foundation owners can delete financial reports
CREATE POLICY "Foundation owners can delete financial reports"
  ON financial_reports
  FOR DELETE
  TO authenticated
  USING (is_foundation_owner(foundation_id) OR is_admin());
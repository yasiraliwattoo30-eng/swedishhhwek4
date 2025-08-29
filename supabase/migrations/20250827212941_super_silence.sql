/*
  # Create investments table

  1. New Tables
    - `investments`
      - `id` (uuid, primary key)
      - `foundation_id` (uuid, foreign key)
      - `type` (text)
      - `name` (text)
      - `amount` (numeric)
      - `currency` (text)
      - `acquisition_date` (date)
      - `current_value` (numeric)
      - `performance` (numeric)
      - `notes` (text)
      - `managed_by` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `investments` table
    - Add policies for investment access control
*/

CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  foundation_id uuid NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('stock', 'bond', 'mutual_fund', 'real_estate', 'commodity', 'cash', 'other')),
  name text NOT NULL,
  amount numeric(15,2) NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'SEK' NOT NULL,
  acquisition_date date NOT NULL,
  current_value numeric(15,2),
  performance numeric(8,4), -- Percentage performance
  notes text,
  managed_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Foundation members can read investments for their foundation
CREATE POLICY "Foundation members can read investments"
  ON investments
  FOR SELECT
  TO authenticated
  USING (is_foundation_member(foundation_id) OR is_admin());

-- Foundation owners can create investments
CREATE POLICY "Foundation owners can create investments"
  ON investments
  FOR INSERT
  TO authenticated
  WITH CHECK (is_foundation_owner(foundation_id) OR is_admin());

-- Foundation owners can update investments
CREATE POLICY "Foundation owners can update investments"
  ON investments
  FOR UPDATE
  TO authenticated
  USING (is_foundation_owner(foundation_id) OR is_admin())
  WITH CHECK (is_foundation_owner(foundation_id) OR is_admin());

-- Foundation owners can delete investments
CREATE POLICY "Foundation owners can delete investments"
  ON investments
  FOR DELETE
  TO authenticated
  USING (is_foundation_owner(foundation_id) OR is_admin());

-- Trigger to update updated_at on investment changes
CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
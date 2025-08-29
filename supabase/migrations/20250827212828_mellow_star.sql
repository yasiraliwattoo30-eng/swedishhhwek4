/*
  # Create foundations table

  1. New Tables
    - `foundations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `registration_number` (text, unique)
      - `status` (text)
      - `owner_user_id` (uuid, foreign key)
      - `description` (text)
      - `address` (text)
      - `phone` (text)
      - `website` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `foundations` table
    - Add policies for foundation access control
*/

CREATE TABLE IF NOT EXISTS foundations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  registration_number text UNIQUE,
  status text DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'active', 'inactive', 'suspended')),
  owner_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description text,
  address text,
  phone text,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE foundations ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read basic foundation info
CREATE POLICY "Anyone can read foundations"
  ON foundations
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can create foundations (they become the owner)
CREATE POLICY "Users can create foundations"
  ON foundations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

-- Foundation owners can update their foundations
CREATE POLICY "Foundation owners can update their foundations"
  ON foundations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Foundation owners can delete their foundations
CREATE POLICY "Foundation owners can delete their foundations"
  ON foundations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_user_id);

-- Trigger to update updated_at on foundation changes
CREATE TRIGGER update_foundations_updated_at
  BEFORE UPDATE ON foundations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
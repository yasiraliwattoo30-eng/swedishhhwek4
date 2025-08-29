/*
  # Create meeting_minutes table

  1. New Tables
    - `meeting_minutes`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, foreign key)
      - `content` (text)
      - `attendees_present` (jsonb)
      - `decisions_made` (jsonb)
      - `action_items` (jsonb)
      - `created_by` (uuid, foreign key)
      - `approved_by` (uuid, foreign key)
      - `approved_at` (timestamp)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `meeting_minutes` table
    - Add policies for minutes access control
*/

CREATE TABLE IF NOT EXISTS meeting_minutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  content text NOT NULL,
  attendees_present jsonb DEFAULT '[]',
  decisions_made jsonb DEFAULT '[]',
  action_items jsonb DEFAULT '[]',
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Foundation members can read minutes for meetings in their foundation
CREATE POLICY "Foundation members can read meeting minutes"
  ON meeting_minutes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (is_foundation_member(m.foundation_id) OR is_admin())
    )
  );

-- Foundation members can create minutes for meetings in their foundation
CREATE POLICY "Foundation members can create meeting minutes"
  ON meeting_minutes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND is_foundation_member(m.foundation_id)
    )
  );

-- Creators and foundation owners can update minutes
CREATE POLICY "Creators and foundation owners can update meeting minutes"
  ON meeting_minutes
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (is_foundation_owner(m.foundation_id) OR is_admin())
    )
  )
  WITH CHECK (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (is_foundation_owner(m.foundation_id) OR is_admin())
    )
  );

-- Creators and foundation owners can delete minutes
CREATE POLICY "Creators and foundation owners can delete meeting minutes"
  ON meeting_minutes
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (is_foundation_owner(m.foundation_id) OR is_admin())
    )
  );

-- Trigger to update updated_at on minutes changes
CREATE TRIGGER update_meeting_minutes_updated_at
  BEFORE UPDATE ON meeting_minutes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
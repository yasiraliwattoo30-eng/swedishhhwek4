/*
  # Create meetings table

  1. New Tables
    - `meetings`
      - `id` (uuid, primary key)
      - `foundation_id` (uuid, foreign key)
      - `organizer_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `location` (text)
      - `meeting_type` (text)
      - `status` (text)
      - `meeting_url` (text)
      - `attendees` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `meetings` table
    - Add policies for meeting access control
*/

CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  foundation_id uuid NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  organizer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text,
  meeting_type text DEFAULT 'board_meeting' CHECK (meeting_type IN ('board_meeting', 'general_assembly', 'committee_meeting', 'other')),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  meeting_url text,
  attendees jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Foundation members can read meetings for their foundation
CREATE POLICY "Foundation members can read meetings"
  ON meetings
  FOR SELECT
  TO authenticated
  USING (is_foundation_member(foundation_id) OR is_admin());

-- Foundation members can create meetings
CREATE POLICY "Foundation members can create meetings"
  ON meetings
  FOR INSERT
  TO authenticated
  WITH CHECK (is_foundation_member(foundation_id));

-- Meeting organizers and foundation owners can update meetings
CREATE POLICY "Meeting organizers can update meetings"
  ON meetings
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = organizer_id OR 
    is_foundation_owner(foundation_id) OR 
    is_admin()
  )
  WITH CHECK (
    auth.uid() = organizer_id OR 
    is_foundation_owner(foundation_id) OR 
    is_admin()
  );

-- Meeting organizers and foundation owners can delete meetings
CREATE POLICY "Meeting organizers can delete meetings"
  ON meetings
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = organizer_id OR 
    is_foundation_owner(foundation_id) OR 
    is_admin()
  );

-- Trigger to update updated_at on meeting changes
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
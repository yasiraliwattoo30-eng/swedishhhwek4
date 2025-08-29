/*
  # Create foundation_members table

  1. New Tables
    - `foundation_members`
      - `foundation_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `role` (text)
      - `permissions` (jsonb)
      - `invited_by` (uuid, foreign key)
      - `joined_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `foundation_members` table
    - Add policies for member management
*/

CREATE TABLE IF NOT EXISTS foundation_members (
  foundation_id uuid NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions jsonb DEFAULT '{}',
  invited_by uuid REFERENCES profiles(id),
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (foundation_id, user_id)
);

ALTER TABLE foundation_members ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is foundation member
CREATE OR REPLACE FUNCTION is_foundation_member(foundation_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM foundation_members fm
    WHERE fm.foundation_id = $1 AND fm.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is foundation owner
CREATE OR REPLACE FUNCTION is_foundation_owner(foundation_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM foundations f
    WHERE f.id = $1 AND f.owner_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Members can read their own membership and foundation owners can read all members
CREATE POLICY "Foundation members can read memberships"
  ON foundation_members
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    is_foundation_owner(foundation_id) OR 
    is_admin()
  );

-- Foundation owners can add members
CREATE POLICY "Foundation owners can add members"
  ON foundation_members
  FOR INSERT
  TO authenticated
  WITH CHECK (is_foundation_owner(foundation_id) OR is_admin());

-- Foundation owners can update member roles
CREATE POLICY "Foundation owners can update members"
  ON foundation_members
  FOR UPDATE
  TO authenticated
  USING (is_foundation_owner(foundation_id) OR is_admin())
  WITH CHECK (is_foundation_owner(foundation_id) OR is_admin());

-- Foundation owners can remove members
CREATE POLICY "Foundation owners can remove members"
  ON foundation_members
  FOR DELETE
  TO authenticated
  USING (is_foundation_owner(foundation_id) OR is_admin());

-- Automatically add foundation owner as member when foundation is created
CREATE OR REPLACE FUNCTION add_foundation_owner_as_member()
RETURNS trigger AS $$
BEGIN
  INSERT INTO foundation_members (foundation_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.owner_user_id, 'owner', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_foundation_created
  AFTER INSERT ON foundations
  FOR EACH ROW
  EXECUTE FUNCTION add_foundation_owner_as_member();
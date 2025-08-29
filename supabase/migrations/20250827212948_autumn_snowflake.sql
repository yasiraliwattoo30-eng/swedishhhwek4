/*
  # Create projects table

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `foundation_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `status` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `budget` (numeric)
      - `currency` (text)
      - `project_manager_id` (uuid, foreign key)
      - `progress_percentage` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `projects` table
    - Add policies for project access control
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  foundation_id uuid NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  start_date date,
  end_date date,
  budget numeric(15,2),
  currency text DEFAULT 'SEK',
  project_manager_id uuid REFERENCES profiles(id),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Foundation members can read projects for their foundation
CREATE POLICY "Foundation members can read projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (is_foundation_member(foundation_id) OR is_admin());

-- Foundation owners can create projects
CREATE POLICY "Foundation owners can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (is_foundation_owner(foundation_id) OR is_admin());

-- Foundation owners and project managers can update projects
CREATE POLICY "Foundation owners and project managers can update projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    is_foundation_owner(foundation_id) OR 
    auth.uid() = project_manager_id OR 
    is_admin()
  )
  WITH CHECK (
    is_foundation_owner(foundation_id) OR 
    auth.uid() = project_manager_id OR 
    is_admin()
  );

-- Foundation owners can delete projects
CREATE POLICY "Foundation owners can delete projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (is_foundation_owner(foundation_id) OR is_admin());

-- Trigger to update updated_at on project changes
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
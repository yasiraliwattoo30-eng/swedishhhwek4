/*
  # Create roles table

  1. New Tables
    - `roles`
      - `id` (integer, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `roles` table
    - Add policies for reading roles (all authenticated users)
    - Only admins can modify roles

  3. Initial Data
    - Insert default roles: admin, foundation_owner, member
*/

CREATE TABLE IF NOT EXISTS roles (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read roles
CREATE POLICY "Anyone can read roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'System administrator with full access'),
  ('foundation_owner', 'Owner of a foundation with management rights'),
  ('member', 'Regular member with limited access')
ON CONFLICT (name) DO NOTHING;
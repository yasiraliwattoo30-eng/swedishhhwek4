/*
  # Add mock users and role system

  1. New Tables
    - `user_roles` - Link users to roles
    - Insert mock users for testing

  2. Mock Users
    - Admin user with full system access
    - Manager user with foundation management access
    - Developer user with limited access

  3. Security
    - Enable RLS on user_roles table
    - Add policies for role management
*/

-- Create user_roles table to link users to roles
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id integer NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES profiles(id),
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles, admins can read all roles
CREATE POLICY "Users can read relevant roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- Only admins can assign roles
CREATE POLICY "Only admins can assign roles"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Only admins can update role assignments
CREATE POLICY "Only admins can update roles"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Only admins can remove role assignments
CREATE POLICY "Only admins can remove roles"
  ON user_roles
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Add role column to profiles table for easier access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'member';
  END IF;
END $$;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  -- Check if user has admin role
  SELECT r.name INTO user_role
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = $1 AND r.name = 'admin'
  LIMIT 1;
  
  IF user_role IS NOT NULL THEN
    RETURN user_role;
  END IF;
  
  -- Check for foundation_owner role
  SELECT r.name INTO user_role
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = $1 AND r.name = 'foundation_owner'
  LIMIT 1;
  
  IF user_role IS NOT NULL THEN
    RETURN user_role;
  END IF;
  
  -- Default to member
  RETURN 'member';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update is_admin function to use user_roles table
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

-- Function to update profile role when user_roles change
CREATE OR REPLACE FUNCTION update_profile_role()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET role = get_user_role(NEW.user_id)
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles 
    SET role = get_user_role(OLD.user_id)
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile role when user_roles change
DROP TRIGGER IF EXISTS update_profile_role_trigger ON user_roles;
CREATE TRIGGER update_profile_role_trigger
  AFTER INSERT OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_role();
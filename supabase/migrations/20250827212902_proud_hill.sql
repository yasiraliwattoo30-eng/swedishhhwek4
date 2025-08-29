/*
  # Create audit_logs table

  1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key, nullable for system actions)
      - `foundation_id` (uuid, foreign key, nullable for global actions)
      - `action` (text)
      - `target_table` (text)
      - `target_id` (uuid)
      - `old_values` (jsonb)
      - `new_values` (jsonb)
      - `details` (jsonb)
      - `ip_address` (inet)
      - `user_agent` (text)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on `audit_logs` table
    - Add policies for audit log access
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  foundation_id uuid REFERENCES foundations(id),
  action text NOT NULL,
  target_table text,
  target_id uuid,
  old_values jsonb,
  new_values jsonb,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Foundation owners and admins can read audit logs for their foundations
CREATE POLICY "Foundation owners can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    is_admin() OR 
    (foundation_id IS NOT NULL AND is_foundation_owner(foundation_id)) OR
    auth.uid() = user_id
  );

-- Only system/admins can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id uuid,
  p_foundation_id uuid,
  p_action text,
  p_target_table text,
  p_target_id uuid,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_details jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, foundation_id, action, target_table, target_id,
    old_values, new_values, details
  ) VALUES (
    p_user_id, p_foundation_id, p_action, p_target_table, p_target_id,
    p_old_values, p_new_values, p_details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
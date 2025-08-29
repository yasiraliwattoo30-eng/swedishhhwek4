/*
  # Create additional helper functions for RLS

  1. Helper Functions
    - `get_user_foundations()` - Returns foundations user has access to
    - `can_access_foundation(foundation_id)` - Checks if user can access foundation
    - `get_foundation_role(foundation_id)` - Gets user's role in foundation
    - `has_foundation_permission(foundation_id, permission)` - Checks specific permissions

  2. Views
    - `user_foundation_access` - View showing user's foundation access
*/

-- Function to get foundations a user has access to
CREATE OR REPLACE FUNCTION get_user_foundations()
RETURNS TABLE(foundation_id uuid, role text) AS $$
BEGIN
  RETURN QUERY
  SELECT fm.foundation_id, fm.role
  FROM foundation_members fm
  WHERE fm.user_id = auth.uid()
  UNION
  SELECT f.id, 'owner'::text
  FROM foundations f
  WHERE f.owner_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access a foundation
CREATE OR REPLACE FUNCTION can_access_foundation(foundation_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM get_user_foundations() guf
    WHERE guf.foundation_id = $1
  ) OR is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in a foundation
CREATE OR REPLACE FUNCTION get_foundation_role(foundation_id uuid)
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM get_user_foundations() guf
  WHERE guf.foundation_id = $1;
  
  RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check specific permissions
CREATE OR REPLACE FUNCTION has_foundation_permission(foundation_id uuid, permission text)
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  user_role := get_foundation_role(foundation_id);
  
  -- Admin role has all permissions
  IF is_admin() THEN
    RETURN true;
  END IF;
  
  -- Owner role has all permissions for their foundation
  IF user_role = 'owner' THEN
    RETURN true;
  END IF;
  
  -- Admin role within foundation has most permissions
  IF user_role = 'admin' THEN
    RETURN permission NOT IN ('delete_foundation', 'transfer_ownership');
  END IF;
  
  -- Member role has limited permissions
  IF user_role = 'member' THEN
    RETURN permission IN ('read', 'create_expense', 'create_meeting', 'upload_document');
  END IF;
  
  -- Viewer role has read-only access
  IF user_role = 'viewer' THEN
    RETURN permission = 'read';
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for easy access to user foundation permissions
CREATE OR REPLACE VIEW user_foundation_access AS
SELECT 
  f.id as foundation_id,
  f.name as foundation_name,
  f.status as foundation_status,
  guf.role as user_role,
  CASE 
    WHEN guf.role = 'owner' THEN true
    WHEN guf.role = 'admin' THEN true
    ELSE false
  END as can_manage,
  CASE 
    WHEN guf.role IN ('owner', 'admin', 'member') THEN true
    ELSE false
  END as can_contribute
FROM foundations f
JOIN get_user_foundations() guf ON f.id = guf.foundation_id
WHERE auth.uid() IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON user_foundation_access TO authenticated;
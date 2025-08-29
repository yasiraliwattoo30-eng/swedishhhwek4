import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
    roles?: string[];
    foundationRole?: string;
    foundationPermissions?: unknown;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No valid authorization token provided' 
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token' 
      });
    }

    // Get user profile with role information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(
          role_id,
          roles(name, description)
        )
      `)
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User profile not found' 
      });
    }

    // Extract user roles
    const userRoles = profile.user_roles || [];
    const primaryRole = userRoles.length > 0 ? userRoles[0].roles.name : profile.role || 'member';
    const allRoles = userRoles.map((ur: any) => ur.roles.name);

    req.user = {
      id: user.id,
      email: user.email || '',
      role: primaryRole,
      roles: allRoles
    };

    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Authentication verification failed' 
    });
  }
};

export const requireFoundationAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const foundationId = req.params.foundationId || req.body.foundation_id;
    
    if (!foundationId) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Foundation ID is required' 
      });
    }

    // Check if user has access to this foundation
    const { data: membership, error } = await supabase
      .from('foundation_members')
      .select('role, permissions')
      .eq('foundation_id', foundationId)
      .eq('user_id', req.user?.id)
      .single();

    if (error || !membership) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Access denied to this foundation' 
      });
    }

    req.user = {
      ...req.user!,
      foundationRole: membership.role,
      foundationPermissions: membership.permissions
    };

    return next();
  } catch (error) {
    console.error('Foundation access middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Foundation access verification failed' 
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Insufficient permissions' 
      });
    } else {
      return next();
    }
  };
};
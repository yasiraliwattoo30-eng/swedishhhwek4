import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { createError } from './errorHandler';
import { AuthenticatedRequest } from './auth';
import { PERMISSIONS } from '../utils/constants';

export interface PermissionCheck {
  foundation_id?: string;
  required_permissions: string[];
  require_all?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission.
}

export const checkPermissions = (permissionCheck: PermissionCheck) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const foundationId = permissionCheck.foundation_id || 
                          req.params.foundationId || 
                          req.body.foundation_id ||
                          req.query.foundation_id;

      if (!userId) {
        throw createError('User not authenticated', 401);
      }

      if (!foundationId) {
        throw createError('Foundation ID is required', 400);
      }

      // Get user's role and permissions for this foundation
      const { data: membership, error } = await supabase
        .from('foundation_members')
        .select('role, permissions')
        .eq('foundation_id', foundationId)
        .eq('user_id', userId)
        .single();

      if (error || !membership) {
        throw createError('Access denied to this foundation', 403);
      }

      // Check if user has required permissions
      const userPermissions = membership.permissions || {};
      const hasPermission = permissionCheck.require_all
        ? permissionCheck.required_permissions.every(perm => userPermissions[perm] === true)
        : permissionCheck.required_permissions.some(perm => userPermissions[perm] === true);

      if (!hasPermission) {
        throw createError('Insufficient permissions for this action', 403);
      }

      // Add permission info to request
      req.user = {
        ...req.user,
        foundationRole: membership.role,
        foundationPermissions: userPermissions
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Predefined permission checks for common operations
export const requireFoundationManagement = checkPermissions({
  required_permissions: [PERMISSIONS.MANAGE_FOUNDATION],
  require_all: true
});

export const requireDocumentManagement = checkPermissions({
  required_permissions: [PERMISSIONS.UPLOAD_DOCUMENTS, PERMISSIONS.APPROVE_DOCUMENTS],
  require_all: false
});

export const requireFinancialAccess = checkPermissions({
  required_permissions: [PERMISSIONS.VIEW_FINANCIAL_DATA],
  require_all: true
});

export const requireExpenseApproval = checkPermissions({
  required_permissions: [PERMISSIONS.APPROVE_EXPENSES],
  require_all: true
});

export const requireUserManagement = checkPermissions({
  required_permissions: [PERMISSIONS.MANAGE_USERS],
  require_all: true
});

export const requireMeetingManagement = checkPermissions({
  required_permissions: [PERMISSIONS.SCHEDULE_MEETINGS],
  require_all: true
});

export const requireComplianceAccess = checkPermissions({
  required_permissions: [PERMISSIONS.MANAGE_COMPLIANCE, PERMISSIONS.VIEW_AUDIT_LOGS],
  require_all: false
});

export const requireReportGeneration = checkPermissions({
  required_permissions: [PERMISSIONS.GENERATE_REPORTS],
  require_all: true
});

// Owner-only operations
export const requireFoundationOwner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const foundationId = req.params.foundationId || req.body.foundation_id || req.query.foundation_id;

    if (!userId || !foundationId) {
      throw createError('Missing required parameters', 400);
    }

    const { data: foundation, error } = await supabase
      .from('foundations')
      .select('owner_user_id')
      .eq('id', foundationId)
      .single();

    if (error || !foundation) {
      throw createError('Foundation not found', 404);
    }

    if (foundation.owner_user_id !== userId) {
      throw createError('Only foundation owner can perform this action', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Admin-only operations
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    // Check if user has admin role
    const userRoles = req.user?.roles || [];
    const hasAdminRole = userRoles.includes('admin') || req.user?.role === 'admin';

    if (!hasAdminRole) {
      throw createError('Admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Check if user can access specific resource
export const checkResourceAccess = (resourceType: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const resourceId = req.params.id;

      if (!userId || !resourceId) {
        throw createError('Missing required parameters', 400);
      }

      let hasAccess = false;

      switch (resourceType) {
        case 'document':
          const { data: document } = await supabase
            .from('documents')
            .select('foundation_id, uploaded_by')
            .eq('id', resourceId)
            .single();
          
          if (document) {
            // User can access if they uploaded it or are a member of the foundation
            hasAccess = document.uploaded_by === userId || 
                       await checkFoundationMembership(userId, document.foundation_id);
          }
          break;

        case 'expense':
          const { data: expense } = await supabase
            .from('expenses')
            .select('foundation_id, user_id')
            .eq('id', resourceId)
            .single();
          
          if (expense) {
            hasAccess = expense.user_id === userId || 
                       await checkFoundationMembership(userId, expense.foundation_id);
          }
          break;

        case 'meeting':
          const { data: meeting } = await supabase
            .from('meetings')
            .select('foundation_id, organizer_id, attendees')
            .eq('id', resourceId)
            .single();
          
          if (meeting) {
            hasAccess = meeting.organizer_id === userId || 
                       meeting.attendees.includes(userId) ||
                       await checkFoundationMembership(userId, meeting.foundation_id);
          }
          break;

        default:
          throw createError('Unknown resource type', 400);
      }

      if (!hasAccess) {
        throw createError('Access denied to this resource', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Helper function to check foundation membership
async function checkFoundationMembership(userId: string, foundationId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('foundation_members')
    .select('user_id')
    .eq('foundation_id', foundationId)
    .eq('user_id', userId)
    .single();

  return !error && !!data;
}
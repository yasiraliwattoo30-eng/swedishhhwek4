export interface Permission {
  screen: string;
  action?: string;
}

export interface RolePermissions {
  [key: string]: Permission[];
}

export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    { screen: 'dashboard' },
    { screen: 'financial' },
    { screen: 'profile' },
    { screen: 'settings' }
  ],
  foundation_owner: [
    { screen: 'manager-dashboard' },
    { screen: 'foundations' },
    { screen: 'profile' }
  ],
  member: [
    { screen: 'dashboard' },
    { screen: 'profile' },
    { screen: 'grants' },
    { screen: 'projects' },
    { screen: 'meetings' }
  ]
};

export const GOVERNANCE_RESTRICTIONS = {
  foundation_owner: {
    hideRoleManagement: true,
    hideDocumentWorkflows: true,
    hideRoleBasedAccessControl: true
  }
};

export function hasPermission(userRole: string, screen: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.some(permission => permission.screen === screen);
}

export function getPermittedScreens(userRole: string): string[] {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.map(permission => permission.screen);
}

export function getGovernanceRestrictions(userRole: string) {
  return GOVERNANCE_RESTRICTIONS[userRole] || {};
}

export function getDefaultRoute(userRole: string): string {
  switch (userRole) {
    case 'admin':
      return '/dashboard';
    case 'foundation_owner':
      return '/manager-dashboard';
    case 'member':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}
import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasPermission } from '../utils/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredScreen: string;
  userRole: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredScreen,
  userRole
}) => {
  if (!hasPermission(userRole, requiredScreen)) {
    // Redirect to access denied page
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};
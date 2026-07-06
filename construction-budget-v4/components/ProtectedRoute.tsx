import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import type { PortalRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: PortalRole[];
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { session } = useSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return <Navigate to={session.role === 'borrower' ? '/dashboard' : '/review'} replace />;
  }

  return children;
};

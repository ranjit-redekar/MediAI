import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { RouteFallback } from '../ui/RouteFallback';

/**
 * Sends anyone without a session to the login screen. The path they asked for
 * rides along in location state so signing in returns them there instead of
 * dumping them on a generic home.
 */
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useSession();
  const location = useLocation();

  // A stored production session is checked asynchronously — don't bounce to login meanwhile.
  if (isLoading) return <RouteFallback />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <>{children}</>;
};

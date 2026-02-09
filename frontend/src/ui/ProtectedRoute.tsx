import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute Component
 * Protects dashboard routes by ensuring:
 * 1. User is authenticated
 * 2. User's email is verified
 * 
 * If either condition fails, redirects to appropriate page.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Still loading auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Email not verified (for signup flow)
  if (!user.isEmailVerified) {
    return <Navigate to="/signup" replace />;
  }

  // All checks passed, render the protected component
  return <>{children}</>;
}

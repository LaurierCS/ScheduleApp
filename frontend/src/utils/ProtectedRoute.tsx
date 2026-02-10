import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { UserRole } from '@/features/auth/services/authApi';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

/**
 * ProtectedRoute Component
 * Protects dashboard routes by ensuring:
 * 1. User is authenticated
 * 2. User's email is verified
 * 3. User has the required role (if specified)
 * 
 * If any condition fails, redirects to appropriate page.
 * 
 * @param children - The component to render if all checks pass
 * @param requiredRole - Optional role requirement (admin, interviewer, candidate)
 */
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
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

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // All checks passed, render the protected component
  return <>{children}</>;
}

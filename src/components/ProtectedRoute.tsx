import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSchool } from '@/context/SchoolContext';
import { Loader2 } from 'lucide-react';
// import { Loader } from '@/components/ui/'; // Your custom loader component

interface ProtectedRouteProps {
  roles?: string[];
  schoolRoles?: string[];
  requireSchool?: boolean;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  roles = [],
  schoolRoles = [],
  requireSchool = false,
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currentSchool, loading: schoolLoading } = useSchool();
  const location = useLocation();

  if (isLoading || schoolLoading) {
    return <Loader2 />; // Show loading indicator while checking auth state
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check user roles if specified
  if (roles.length > 0 && !roles.some(role => user?.roles?.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if school is required
  if (requireSchool && !currentSchool) {
    return <Navigate to="/schools-select" replace />;
  }

  // Check school roles if specified and school is required
  if (requireSchool && schoolRoles.length > 0 && currentSchool) {
    const roles = user?.memberships?.find(
      (m) => m?.school?._id === currentSchool?._id
    )?.roles;
    console.log("roles", roles)

    const hasSchoolRole = roles?.some(memberRole => schoolRoles.includes(memberRole));

    if (!hasSchoolRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render children or outlet
  return children ? <>{children}</> : <Outlet />;
};

// Usage examples:
// 1. Basic protected route:
// <Route element={<ProtectedRoute />}>
//   <Route path="dashboard" element={<Dashboard />} />
// </Route>

// 2. Admin-only route:
// <Route element={<ProtectedRoute roles={['ADMIN']} />}>
//   <Route path="admin" element={<AdminPanel />} />
// </Route>

// 3. School-specific route:
// <Route element={<ProtectedRoute requireSchool />}>
//   <Route path="school" element={<SchoolDashboard />} />
// </Route>

// 4. School admin route:
// <Route element={<ProtectedRoute requireSchool schoolRoles={['ADMIN']} />}>
//   <Route path="school-admin" element={<SchoolAdminPanel />} />
// </Route>
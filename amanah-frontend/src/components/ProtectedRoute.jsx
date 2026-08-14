import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, allowedRoles, children }) {
  // 1. If no user session state context exists, boot them out to the login terminal
  if (!user) {
    return <Navigate to="/login" replace/>;
  }

  // 2. If the user is logged in, but their role string isn't authorized for this view
  if (!allowedRoles.includes(user.role)) {
  return <Navigate to="/unauthorized" replace/>;
  }

  // 3. If they clear both hurdles, safely render the page they requested
  return children;
}
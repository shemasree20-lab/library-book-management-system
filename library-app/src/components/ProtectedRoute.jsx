import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken, getUser } from "../api/client";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = getToken();
  const user = getUser();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If user tries to access admin-only route or vice-versa
    return <Navigate to="/books" replace />;
  }

  return children;
}

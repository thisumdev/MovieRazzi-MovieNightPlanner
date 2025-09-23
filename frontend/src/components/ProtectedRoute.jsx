// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/useAuth";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4" />
          <p className="text-white text-lg">Loading MovieHub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // No token/user -> go to /auth and remember where we came from
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Authenticated -> render nested routes
  return <Outlet />;
}

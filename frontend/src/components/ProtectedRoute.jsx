import React from "react";
import { useAuth } from "../lib/useAuth.js";
import { AuthPages } from "../pages/AuthPages";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading MovieHub...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPages />;
  return <>{children}</>;
}

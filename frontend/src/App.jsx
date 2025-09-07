import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import FloatingShape from "./components/FloatingShape";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import OverviewPage from "./pages/OverviewPage";

export default function App() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div
      className={`min-h-screen bg-[#f3f4f6] relative overflow-hidden ${
        isAuthPage ? "flex items-center justify-center" : ""
      }`}
    >
      {/* Floating shapes (optional: only on auth pages) */}
      {isAuthPage && (
        <>
          <FloatingShape
            color="bg-[#2563eb]"
            size="w-64 h-64"
            top="-5%"
            left="10%"
            delay={0}
          />
          <FloatingShape
            color="bg-[#2563eb]"
            size="w-48 h-48"
            top="70%"
            left="80%"
            delay={5}
          />
          <FloatingShape
            color="bg-[#2563eb]"
            size="w-32 h-32"
            top="40%"
            left="-10%"
            delay={2}
          />
        </>
      )}

      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/overview"
          element={
            <ProtectedRoute>
              <OverviewPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

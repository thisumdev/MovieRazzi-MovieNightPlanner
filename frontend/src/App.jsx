// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { OverviewPage } from "./pages/OverviewPage";
import { ScheduleCreatorPage } from "./pages/SheduleCreatorPage"; // ✅ fix typo
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthPages } from "./pages/AuthPages";

function App() {
  return (
    <Routes>
      {/* Public route(s) */}
      <Route path="/auth" element={<AuthPages />} />

      {/* Protected group */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<OverviewPage />} /> {/* ✅ protected now */}
        <Route path="/schedule" element={<ScheduleCreatorPage />} />
        {/* ✅ protected */}
      </Route>

      {/* Fallback: unknown paths -> home (which is protected) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

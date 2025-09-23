import { Routes, Route } from "react-router-dom";
import { OverviewPage } from "./pages/OverviewPage";
import { ScheduleCreatorPage } from "./pages/SheduleCreatorPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage />} />
      <Route path="/schedule" element={<ScheduleCreatorPage />} />
    </Routes>
  );
}

export default App;

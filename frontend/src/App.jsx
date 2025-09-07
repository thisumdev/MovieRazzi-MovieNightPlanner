import PreferenceAnalyzer from "./pages/PreferenceAnalyzer";

export default function App() {
  return <PreferenceAnalyzer />;
}



// import { Routes, Route, Navigate } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import FloatingShape from "./components/FloatingShape";
// import LoginPage from "./pages/LoginPage";
// import SignUpPage from "./pages/SignUpPage";
// import OverviewPage from "./pages/OverviewPage"; // placeholder for post-login

// export default function App() {
//   return (
//     <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center relative overflow-hidden">
//       {/* Floating shapes */}
//       <FloatingShape
//         color="bg-[#2563eb]"
//         size="w-64 h-64"
//         top="-5%"
//         left="10%"
//         delay={0}
//       />
//       <FloatingShape
//         color="bg-[#2563eb]"
//         size="w-48 h-48"
//         top="70%"
//         left="80%"
//         delay={5}
//       />
//       <FloatingShape
//         color="bg-[#2563eb]"
//         size="w-32 h-32"
//         top="40%"
//         left="-10%"
//         delay={2}
//       />
//       <Toaster position="top-right" reverseOrder={false} />
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/signup" element={<SignUpPage />} />

//         {/* 🔒 Protected Route */}
//         <Route
//           path="/overview"
//           element={
//             <ProtectedRoute>
//               <OverviewPage />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </div>
//   );
// }

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Analysis from "./pages/admin/Analysis";
import ForgotPassword from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import Result from "./pages/Result";
import Profile from "./pages/Profile";
import Dashboard from "./pages/admin/Dashboard";
import UserDetail from "./pages/admin/UserDetail";
import Reports from "./pages/admin/Reports";
import AdminProfile from "./pages/admin/AdminProfile";

function ProfileSwitch() {
  const { user } = useAuth();
  return user.role === "admin" ? <Navigate to="/admin/profile" replace /> : <Profile />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/result/:id" element={<ProtectedRoute><Result /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfileSwitch /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/admin/analysis" element={<AdminRoute><Analysis /></AdminRoute>} />
      <Route path="/admin/users/:id" element={<AdminRoute><UserDetail /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
      <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
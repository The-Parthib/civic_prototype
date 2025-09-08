import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public pages
import Landing from "./pages/landing/Landing";
import Login from "./pages/login/login";

// Private pages
import Dashboard from "./pages/dashboard/Dashboard";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import CitizenRegister from "./pages/register/CitizenRegister";
import AdminLogin from "./pages/admin/AdminLogin";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import StaffLogin from "./pages/Staff/StaffLogin";
import StaffPage from "./pages/Staff/StaffPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" element={<Register />} /> */}
        <Route path="/register/citizen" element={<CitizenRegister />} />
        {/* <Route path="/register/admin" element={<AdminRegister/>} /> */}

        {/* Private Routes - Protected */}
        <Route path="/p" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Admin Routes - No longer protected */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Staff Routes */}
        <Route path="/staff/login" element={<StaffLogin/>}/>
        <Route path="/staff" element={<StaffPage/>}/>

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

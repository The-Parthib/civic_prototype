import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

// Public pages
import Landing from "./pages/landing/Landing";
import Login from "./pages/login/login";

// Private pages
import Dashboard from "./pages/dashboard/Dashboard";
import ReportDetails from "./pages/reportDetails/ReportDetails";
import HomeScreen from "./pages/home/HomeScreen";
import CreatePostScreen from "./pages/create-post/CreatePostScreen";
import PostsScreen from "./pages/posts/PostsScreen";
import ProfileScreen from "./pages/profile/ProfileScreen";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import CitizenRegister from "./pages/register/CitizenRegister";
import AdminLogin from "./pages/admin/AdminLogin";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import StaffLogin from "./pages/Staff/StaffLogin";
import StaffPage from "./pages/Staff/StaffPage";

// Notification setup
import { useNotifications } from "./hooks/useNotifications";
import { setupComplaintStatusMonitoring } from "./utils/notificationHelpers.jsx";
import CameraTesting from "./pages/testing/page.jsx";

function App() {
  const notifications = useNotifications();

  useEffect(() => {
    // Initialize notifications when app loads
    if (notifications.isSupported) {
      // Setup monitoring for complaint status changes
      setupComplaintStatusMonitoring(notifications);
      
      // Auto-request permission if user previously granted it
      const wasGranted = localStorage.getItem('notificationsEnabled') === 'true';
      if (wasGranted && notifications.permission === 'default') {
        notifications.requestPermission();
      }
    }
  }, [notifications.isSupported]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/citizen" element={<CitizenRegister />} />
        <Route path="/camera" element={CameraTesting}/>

        {/* Private Routes - Protected */}
        <Route path="/p" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute>
            <HomeScreen />
          </ProtectedRoute>
        } />
        <Route path="/create-post" element={
          <ProtectedRoute>
            <CreatePostScreen />
          </ProtectedRoute>
        } />
        <Route path="/posts" element={
          <ProtectedRoute>
            <PostsScreen />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileScreen />
          </ProtectedRoute>
        } />
        <Route path="/report/:reportId" element={
          <ProtectedRoute>
            <ReportDetails />
          </ProtectedRoute>
        } />

        {/* Admin Routes - No longer protected */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Staff Routes */}
        <Route path="/staff/login" element={<StaffLogin/>}/>
        <Route path="/staff" element={<StaffPage/>}/>

        {/* Catch all - redirect based on login status */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

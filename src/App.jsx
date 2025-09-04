import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

// Public pages
import Landing from "./pages/landing/Landing";
import Login from "./pages/login/login";
import Register from "./pages/register/Register";

// Private pages
import Dashboard from "./pages/dashboard/Dashboard";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import CitizenRegister from "./pages/register/CitizenRegister";
import AdminRegister from "./pages/register/AdminRegister";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" element={<Register />} /> */}
        <Route path="/register/citizen" element={<CitizenRegister />} />
        <Route path="/register/admin" element={<AdminRegister/>} />

        {/* Private Routes - No longer protected */}
        <Route path="/p" element={<Dashboard />} />

        {/* Admin Routes - No longer protected */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if user is logged in by looking for civicName in sessionStorage
  const isLoggedIn = sessionStorage.getItem('civicName');
  
  // If not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // If logged in, render the protected component
  return children;
};

export default ProtectedRoute;

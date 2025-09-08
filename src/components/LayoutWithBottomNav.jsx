import React from 'react';
import BottomNavigation from './BottomNavigation';

const LayoutWithBottomNav = ({ children, showBottomNav = true }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

export default LayoutWithBottomNav;

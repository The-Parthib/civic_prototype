import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, FileText, User } from 'lucide-react';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/home',
      activeColor: 'text-blue-600',
      inactiveColor: 'text-gray-400'
    },
    {
      icon: Plus,
      label: 'Post',
      path: '/create-post',
      activeColor: 'text-blue-600',
      inactiveColor: 'text-gray-400'
    },
    {
      icon: FileText,
      label: 'Posts',
      path: '/posts',
      activeColor: 'text-blue-600',
      inactiveColor: 'text-gray-400'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
      activeColor: 'text-blue-600',
      inactiveColor: 'text-gray-400'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 ${
                  active ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <Icon 
                  size={24} 
                  className={active ? item.activeColor : item.inactiveColor}
                />
                <span 
                  className={`text-xs mt-1 truncate ${
                    active ? item.activeColor : item.inactiveColor
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;

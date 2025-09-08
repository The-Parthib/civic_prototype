import React, { useState, useEffect } from 'react';
import { Bell, X, Settings } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationSettings from './NotificationSettings';

const NotificationBanner = () => {
  const { isSupported, permission, requestPermission } = useNotifications();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Show banner if notifications are supported but not granted
    const shouldShow = isSupported && 
                      permission === 'default' && 
                      localStorage.getItem('notificationBannerDismissed') !== 'true';
    setShowBanner(shouldShow);
  }, [isSupported, permission]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('notificationBannerDismissed', 'true');
  };

  if (!showBanner && !showSettings) {
    return null;
  }

  if (showSettings) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Notification Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            <NotificationSettings />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <Bell className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800 mb-1">
            Stay Updated with Notifications
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            Get instant updates when your complaint status changes or when departments respond.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleEnableNotifications}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Enable Notifications
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md text-sm hover:bg-blue-50 transition-colors flex items-center"
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-600 ml-2"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;

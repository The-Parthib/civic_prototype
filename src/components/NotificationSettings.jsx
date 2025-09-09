import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, BellOff, Settings, Check, X } from 'lucide-react';

const NotificationSettings = () => {
  const {
    isSupported,
    permission,
    isInitialized,
    requestPermission,
    showNotification,
    startPeriodicCheck,
    stopPeriodicCheck
  } = useNotifications();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [periodicCheckEnabled, setPeriodicCheckEnabled] = useState(false);
  const [checkInterval, setCheckInterval] = useState(60); // seconds

  useEffect(() => {
    // Load settings from localStorage
    const enabled = localStorage.getItem('notificationsEnabled') === 'true';
    const periodicEnabled = localStorage.getItem('periodicCheckEnabled') === 'true';
    const interval = parseInt(localStorage.getItem('notificationCheckInterval') || '60');

    setNotificationsEnabled(enabled && permission === 'granted');
    setPeriodicCheckEnabled(periodicEnabled);
    setCheckInterval(interval);

    // Start periodic check if enabled
    if (periodicEnabled && permission === 'granted') {
      startPeriodicCheck(interval * 1000);
    }
  }, [permission]);

  const handleEnableNotifications = async () => {
    if (permission === 'granted') {
      const newState = !notificationsEnabled;
      setNotificationsEnabled(newState);
      localStorage.setItem('notificationsEnabled', newState.toString());
      
      if (newState) {
        // Test notification
        showNotification('Notifications Enabled', {
          body: 'You will now receive updates about your complaints.',
          icon: '/icons/icon-192x192.png'
        });
      }
    } else {
      const granted = await requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
        
        // Test notification
        showNotification('Notifications Enabled', {
          body: 'You will now receive updates about your complaints.',
          icon: '/icons/icon-192x192.png'
        });
      }
    }
  };

  const handlePeriodicCheck = () => {
    const newState = !periodicCheckEnabled;
    setPeriodicCheckEnabled(newState);
    localStorage.setItem('periodicCheckEnabled', newState.toString());

    if (newState && notificationsEnabled) {
      startPeriodicCheck(checkInterval * 1000);
    } else {
      stopPeriodicCheck();
    }
  };

  const handleIntervalChange = (newInterval) => {
    setCheckInterval(newInterval);
    localStorage.setItem('notificationCheckInterval', newInterval.toString());
    
    if (periodicCheckEnabled && notificationsEnabled) {
      stopPeriodicCheck();
      startPeriodicCheck(newInterval * 1000);
    }
  };

  const sendTestNotification = () => {
    showNotification('Test Notification', {
      body: 'This is a test notification from JanSamadhan.',
      icon: '/icons/icon-192x192.png',
      tag: 'test-notification'
    });
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <BellOff className="h-5 w-5 text-yellow-600 mr-2" />
          <p className="text-yellow-800">
            Notifications are not supported in this browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center mb-4">
        <Settings className="h-6 w-6 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
      </div>

      <div className="space-y-6">
        {/* Enable Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {notificationsEnabled ? (
              <Bell className="h-5 w-5 text-green-600 mr-3" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400 mr-3" />
            )}
            <div>
              <p className="font-medium text-gray-900">Enable Notifications</p>
              <p className="text-sm text-gray-500">
                Receive updates about your complaint status
              </p>
            </div>
          </div>
          <button
            onClick={handleEnableNotifications}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Permission Status */}
        <div className="flex items-center justify-between py-2 border-t border-gray-100">
          <span className="text-sm text-gray-600">Permission Status:</span>
          <span className={`text-sm font-medium ${
            permission === 'granted' ? 'text-green-600' : 
            permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {permission === 'granted' && <Check className="inline h-4 w-4 mr-1" />}
            {permission === 'denied' && <X className="inline h-4 w-4 mr-1" />}
            {permission.charAt(0).toUpperCase() + permission.slice(1)}
          </span>
        </div>

        {/* Periodic Check */}
        {notificationsEnabled && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-check for Updates</p>
                <p className="text-sm text-gray-500">
                  Automatically check for complaint status updates
                </p>
              </div>
              <button
                onClick={handlePeriodicCheck}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  periodicCheckEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    periodicCheckEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Check Interval */}
            {periodicCheckEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check Interval (seconds)
                </label>
                <select
                  value={checkInterval}
                  onChange={(e) => handleIntervalChange(parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                  <option value={600}>10 minutes</option>
                  <option value={1800}>30 minutes</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Test Notification */}
        {notificationsEnabled && (
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={sendTestNotification}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Send Test Notification
            </button>
          </div>
        )}

        {/* Service Worker Status */}
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
          Service Worker: {isInitialized ? '✅ Ready' : '❌ Not Ready'}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;

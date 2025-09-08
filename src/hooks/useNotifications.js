import { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported(notificationService.isNotificationSupported());
    setPermission(notificationService.getPermissionStatus());

    // Initialize service worker
    const initialize = async () => {
      const swReady = await notificationService.initializeServiceWorker();
      setIsInitialized(swReady);
    };

    initialize();
  }, []);

  const requestPermission = async () => {
    try {
      const granted = await notificationService.requestPermission();
      setPermission(notificationService.getPermissionStatus());
      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  };

  const showNotification = async (title, options = {}) => {
    return notificationService.showNotification(title, options);
  };

  const notifyComplaintUpdate = async (complaint, status) => {
    return notificationService.notifyComplaintUpdate(complaint, status);
  };

  const notifyComplaintSubmitted = async (complaint) => {
    return notificationService.notifyComplaintSubmitted(complaint);
  };

  const startPeriodicCheck = (interval = 60000) => {
    notificationService.startPeriodicCheck(interval);
  };

  const stopPeriodicCheck = () => {
    notificationService.stopPeriodicCheck();
  };

  return {
    isSupported,
    permission,
    isInitialized,
    requestPermission,
    showNotification,
    notifyComplaintUpdate,
    notifyComplaintSubmitted,
    startPeriodicCheck,
    stopPeriodicCheck
  };
};

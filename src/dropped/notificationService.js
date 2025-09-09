// Notification Service for PWA
class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = null;
    this.registration = null;
  }

  // Check if notifications are supported
  isNotificationSupported() {
    return this.isSupported;
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Get current permission status
  getPermissionStatus() {
    return Notification.permission;
  }

  // Initialize service worker for notifications
  async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready for notifications');
        return true;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return false;
      }
    }
    return false;
  }

  // Show immediate notification
  async showNotification(title, options = {}) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      console.warn('Notifications not permitted or supported');
      return false;
    }

    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      vibrate: [200, 100, 200],
      tag: 'civic-notification',
      requireInteraction: false,
      ...options
    };

    try {
      if (this.registration) {
        // Use service worker notification (better for PWA)
        await this.registration.showNotification(title, defaultOptions);
      } else {
        // Fallback to simple notification
        new Notification(title, defaultOptions);
      }
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }

  // Schedule notification (using setTimeout since no backend)
  scheduleNotification(title, options = {}, delayMs = 0) {
    if (delayMs === 0) {
      return this.showNotification(title, options);
    }

    setTimeout(() => {
      this.showNotification(title, options);
    }, delayMs);
  }

  // Show notification for complaint status updates
  async notifyComplaintUpdate(complaint, status) {
    const title = `Complaint #${complaint.id} Updated`;
    const options = {
      body: `Status changed to: ${status}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: `complaint-${complaint.id}`,
      data: {
        type: 'complaint-update',
        complaintId: complaint.id,
        status: status,
        url: `/dashboard?complaint=${complaint.id}`
      },
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/icon-96x96.png'
        }
      ]
    };

    return this.showNotification(title, options);
  }

  // Show notification for new complaint submission
  async notifyComplaintSubmitted(complaint) {
    const title = 'Complaint Submitted Successfully';
    const options = {
      body: `Your complaint #${complaint.id} has been submitted for review.`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: `complaint-submitted-${complaint.id}`,
      data: {
        type: 'complaint-submitted',
        complaintId: complaint.id,
        url: `/dashboard?complaint=${complaint.id}`
      }
    };

    return this.showNotification(title, options);
  }

  // Set up periodic check for complaint updates (simulating push notifications)
  startPeriodicCheck(checkInterval = 60000) { // Default 1 minute
    if (!this.isSupported || Notification.permission !== 'granted') {
      return;
    }

    setInterval(async () => {
      try {
        // Check for updates from JSON server
        const response = await fetch('http://localhost:3000/complaints');
        const complaints = await response.json();
        
        // Get last checked timestamp from localStorage
        const lastChecked = localStorage.getItem('lastNotificationCheck');
        const now = Date.now();
        
        if (lastChecked) {
          // Find complaints updated since last check
          const updatedComplaints = complaints.filter(complaint => {
            const updatedAt = new Date(complaint.updatedAt || complaint.createdAt).getTime();
            return updatedAt > parseInt(lastChecked);
          });

          // Notify about updates
          for (const complaint of updatedComplaints) {
            if (complaint.status !== 'pending') {
              await this.notifyComplaintUpdate(complaint, complaint.status);
            }
          }
        }

        // Update last checked timestamp
        localStorage.setItem('lastNotificationCheck', now.toString());
      } catch (error) {
        console.error('Error checking for complaint updates:', error);
      }
    }, checkInterval);
  }

  // Stop periodic checking
  stopPeriodicCheck() {
    // In a real implementation, you'd clear the interval
    // For now, we'll just remove the timestamp
    localStorage.removeItem('lastNotificationCheck');
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();
export default notificationService;

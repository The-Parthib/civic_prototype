// PWA Notification Helper for Report Processing
export class ReportNotificationManager {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  async requestPermission() {
    if (!this.isSupported) return false;
    
    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }
    
    return this.permission === 'granted';
  }

  async sendNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Notifications not supported or permission not granted');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const defaultOptions = {
        icon: '/icon.png',
        badge: '/icon.png',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        ...options
      };

      await registration.showNotification(title, defaultOptions);
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  // Specific notification for questions needed
  async notifyQuestionsNeeded(reportId, reportTitle, questionCount) {
    return this.sendNotification(
      'Additional Information Needed',
      {
        body: `Please answer ${questionCount} clarifying questions for your report: "${reportTitle}"`,
        tag: `questions-${reportId}`,
        data: {
          reportId,
          action: 'questions_needed',
          type: 'clarifying_questions'
        },
        actions: [
          {
            action: 'answer',
            title: 'Answer Questions'
          },
          {
            action: 'later',
            title: 'Answer Later'
          }
        ],
        requireInteraction: true
      }
    );
  }

  // Specific notification for questions completed
  async notifyQuestionsCompleted(reportId, reportTitle) {
    return this.sendNotification(
      'Questions Completed',
      {
        body: `Thank you! Your additional information for "${reportTitle}" has been submitted.`,
        tag: `completed-${reportId}`,
        data: {
          reportId,
          action: 'questions_completed',
          type: 'questions_completed'
        },
        actions: [
          {
            action: 'view',
            title: 'View Report'
          }
        ]
      }
    );
  }

  // Notification for report status updates
  async notifyStatusUpdate(reportId, reportTitle, newStatus) {
    const statusMessages = {
      'In Progress': 'Your report is now being processed',
      'Resolved': 'Your report has been resolved',
      'Assigned': 'Your report has been assigned to a staff member',
      'Under Review': 'Your report is under review'
    };

    return this.sendNotification(
      `Report ${newStatus}`,
      {
        body: `${statusMessages[newStatus] || 'Status updated'}: "${reportTitle}"`,
        tag: `status-${reportId}`,
        data: {
          reportId,
          action: 'status_update',
          type: 'status_update',
          status: newStatus
        },
        actions: [
          {
            action: 'view',
            title: 'View Report'
          }
        ]
      }
    );
  }

  // Background processing notification
  async notifyBackgroundProcessing(reportId, reportTitle) {
    return this.sendNotification(
      'Report Submitted Successfully',
      {
        body: `"${reportTitle}" is being processed. You may receive follow-up questions.`,
        tag: `processing-${reportId}`,
        data: {
          reportId,
          action: 'background_processing',
          type: 'processing'
        },
        actions: [
          {
            action: 'view',
            title: 'View Report'
          }
        ]
      }
    );
  }
}

// Export a singleton instance
export const reportNotifications = new ReportNotificationManager();

// Auto-request permission on first load if not already decided
export const initializeNotifications = async () => {
  const wasEnabled = localStorage.getItem('reportNotificationsEnabled');
  
  if (wasEnabled === null && reportNotifications.isSupported) {
    // First time - show a nice prompt
    const shouldEnable = confirm(
      'Enable notifications to get updates about your civic reports and any follow-up questions?'
    );
    
    if (shouldEnable) {
      const granted = await reportNotifications.requestPermission();
      localStorage.setItem('reportNotificationsEnabled', granted.toString());
      return granted;
    } else {
      localStorage.setItem('reportNotificationsEnabled', 'false');
      return false;
    }
  } else if (wasEnabled === 'true') {
    return await reportNotifications.requestPermission();
  }
  
  return false;
};

// Utility function to check if notifications should be sent
export const shouldSendNotifications = () => {
  return localStorage.getItem('reportNotificationsEnabled') === 'true' && 
         reportNotifications.permission === 'granted';
};

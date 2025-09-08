import { useNotifications } from '../hooks/useNotifications';

// Higher-order component to add notification functionality to forms
export const withNotifications = (WrappedComponent) => {
  return function NotificationWrapper(props) {
    const notifications = useNotifications();
    
    // Enhanced props with notification methods
    const enhancedProps = {
      ...props,
      notifications,
      // Helper method for complaint submission
      onComplaintSubmit: async (complaint) => {
        // Call original onSubmit if exists
        if (props.onComplaintSubmit) {
          await props.onComplaintSubmit(complaint);
        }
        
        // Show notification
        if (notifications.permission === 'granted') {
          await notifications.notifyComplaintSubmitted(complaint);
        }
      },
      
      // Helper method for status updates
      onStatusUpdate: async (complaint, newStatus) => {
        // Call original onStatusUpdate if exists
        if (props.onStatusUpdate) {
          await props.onStatusUpdate(complaint, newStatus);
        }
        
        // Show notification
        if (notifications.permission === 'granted') {
          await notifications.notifyComplaintUpdate(complaint, newStatus);
        }
      }
    };
    
    return <WrappedComponent {...enhancedProps} />;
  };
};

// Hook for complaint-specific notifications
export const useComplaintNotifications = () => {
  const notifications = useNotifications();
  
  const notifyNewComplaint = async (complaint) => {
    if (notifications.permission === 'granted') {
      return notifications.notifyComplaintSubmitted(complaint);
    }
    return false;
  };
  
  const notifyStatusChange = async (complaint, oldStatus, newStatus) => {
    if (notifications.permission === 'granted') {
      const title = `Complaint #${complaint.id} ${newStatus}`;
      const body = `Status changed from ${oldStatus} to ${newStatus}`;
      
      return notifications.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        tag: `complaint-${complaint.id}`,
        data: {
          type: 'status-change',
          complaintId: complaint.id,
          oldStatus,
          newStatus,
          url: `/dashboard?complaint=${complaint.id}`
        }
      });
    }
    return false;
  };
  
  const notifyDepartmentAssignment = async (complaint, department) => {
    if (notifications.permission === 'granted') {
      const title = `Complaint #${complaint.id} Assigned`;
      const body = `Your complaint has been assigned to ${department}`;
      
      return notifications.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        tag: `complaint-assigned-${complaint.id}`,
        data: {
          type: 'department-assignment',
          complaintId: complaint.id,
          department,
          url: `/dashboard?complaint=${complaint.id}`
        }
      });
    }
    return false;
  };
  
  const scheduleReminder = (complaint, reminderText, delayMs) => {
    const title = `Reminder: Complaint #${complaint.id}`;
    return notifications.scheduleNotification(title, {
      body: reminderText,
      icon: '/icons/icon-192x192.png',
      tag: `reminder-${complaint.id}`,
      data: {
        type: 'reminder',
        complaintId: complaint.id,
        url: `/dashboard?complaint=${complaint.id}`
      }
    }, delayMs);
  };
  
  return {
    ...notifications,
    notifyNewComplaint,
    notifyStatusChange,
    notifyDepartmentAssignment,
    scheduleReminder
  };
};

// Utility function to check and update complaint statuses
export const setupComplaintStatusMonitoring = (notifications) => {
  if (!notifications.isSupported || notifications.permission !== 'granted') {
    return;
  }
  
  // Monitor localStorage changes (for cross-tab communication)
  window.addEventListener('storage', (event) => {
    if (event.key === 'complaintStatusUpdate') {
      const data = JSON.parse(event.newValue || '{}');
      if (data.complaint && data.newStatus && data.oldStatus) {
        notifications.notifyComplaintUpdate(data.complaint, data.newStatus);
      }
    }
  });
  
  // Setup periodic checking
  notifications.startPeriodicCheck(60000); // Check every minute
};

export default {
  withNotifications,
  useComplaintNotifications,
  setupComplaintStatusMonitoring
};

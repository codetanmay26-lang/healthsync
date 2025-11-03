import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationCenter = ({ onNotificationAction }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  const mockNotifications = [
    {
      id: 1,
      type: 'medication',
      title: 'Medication Reminder',
      message: 'Time to take your Metformin (500mg)',
      timestamp: new Date(2025, 8, 8, 8, 0),
      priority: 'high',
      read: false,
      actionable: true,
      actions: [
        { label: 'Take Now', action: 'take_medication', data: { medicationId: 1 } },
        { label: 'Snooze 15min', action: 'snooze', data: { duration: 15 } }
      ]
    },
    {
      id: 2,
      type: 'appointment',
      title: 'Upcoming Appointment',
      message: 'Follow-up with Dr. Johnson tomorrow at 2:00 PM',
      timestamp: new Date(2025, 8, 7, 14, 0),
      priority: 'medium',
      read: false,
      actionable: true,
      actions: [
        { label: 'Confirm', action: 'confirm_appointment', data: { appointmentId: 2 } },
        { label: 'Reschedule', action: 'reschedule', data: { appointmentId: 2 } }
      ]
    },
    {
      id: 3,
      type: 'lab_result',
      title: 'Lab Results Available',
      message: 'Your blood test results from 09/05 are ready for review',
      timestamp: new Date(2025, 8, 6, 10, 30),
      priority: 'medium',
      read: true,
      actionable: true,
      actions: [
        { label: 'View Results', action: 'view_lab_results', data: { resultId: 3 } }
      ]
    },
    {
      id: 4,
      type: 'system',
      title: 'App Update Available',
      message: 'HealthSync v2.1.0 includes new medication tracking features',
      timestamp: new Date(2025, 8, 5, 9, 0),
      priority: 'low',
      read: true,
      actionable: true,
      actions: [
        { label: 'Update Now', action: 'update_app', data: {} }
      ]
    },
    {
      id: 5,
      type: 'health_alert',
      title: 'Health Metric Alert',
      message: 'Your blood pressure reading (145/90) is elevated',
      timestamp: new Date(2025, 8, 4, 16, 45),
      priority: 'high',
      read: true,
      actionable: true,
      actions: [
        { label: 'Log New Reading', action: 'log_vitals', data: { type: 'blood_pressure' } },
        { label: 'Contact Doctor', action: 'contact_doctor', data: {} }
      ]
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'medication': return 'Pill';
      case 'appointment': return 'Calendar';
      case 'lab_result': return 'FileText';
      case 'health_alert': return 'AlertTriangle';
      case 'system': return 'Settings';
      default: return 'Bell';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error bg-error/10 border-error/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'low': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-text-secondary bg-muted border-border';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'medication': return 'text-accent';
      case 'appointment': return 'text-primary';
      case 'lab_result': return 'text-success';
      case 'health_alert': return 'text-error';
      case 'system': return 'text-text-secondary';
      default: return 'text-text-secondary';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp?.toLocaleDateString();
  };

  const filteredNotifications = notifications?.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification?.read;
    return notification?.type === filter;
  });

  const unreadCount = notifications?.filter(n => !n?.read)?.length;

  const handleNotificationAction = (notification, action) => {
    if (onNotificationAction) {
      onNotificationAction(notification, action);
    }

    // Mark as read when action is taken
    setNotifications(prev => 
      prev?.map(n => 
        n?.id === notification?.id ? { ...n, read: true } : n
      )
    );

    // Handle specific actions
    switch (action?.action) {
      case 'take_medication': alert('Medication marked as taken!');
        break;
      case 'snooze':
        alert(`Reminder snoozed for ${action?.data?.duration} minutes`);
        break;
      case 'confirm_appointment': alert('Appointment confirmed!');
        break;
      case 'view_lab_results':
        window.location.href = '/patient-portal#lab-results';
        break;
      default:
        break;
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev?.map(n => 
        n?.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev?.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev?.filter(n => n?.id !== notificationId)
    );
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-text-primary">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-error text-error-foreground text-xs font-medium rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-text-secondary hover:text-text-primary"
            >
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            iconName="Settings"
            iconSize={16}
            onClick={() => setShowSettings(!showSettings)}
            className="text-text-secondary hover:text-text-primary"
          />
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All', count: notifications?.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'medication', label: 'Medications', count: notifications?.filter(n => n?.type === 'medication')?.length },
          { key: 'appointment', label: 'Appointments', count: notifications?.filter(n => n?.type === 'appointment')?.length },
          { key: 'health_alert', label: 'Health Alerts', count: notifications?.filter(n => n?.type === 'health_alert')?.length }
        ]?.map(filterOption => (
          <button
            key={filterOption?.key}
            onClick={() => setFilter(filterOption?.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-medical ${
              filter === filterOption?.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-text-secondary hover:text-text-primary hover:bg-muted/80'
            }`}
          >
            {filterOption?.label}
            {filterOption?.count > 0 && (
              <span className="ml-1 opacity-75">({filterOption?.count})</span>
            )}
          </button>
        ))}
      </div>
      {/* Notification Settings */}
      {showSettings && (
        <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
          <h3 className="font-medium text-text-primary mb-3">Notification Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Medication Reminders</span>
              <button className="w-10 h-6 bg-primary rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Appointment Alerts</span>
              <button className="w-10 h-6 bg-primary rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Health Alerts</span>
              <button className="w-10 h-6 bg-primary rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Bell" size={48} className="text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No notifications</h3>
            <p className="text-text-secondary">
              {filter === 'unread' ? 'All caught up! No unread notifications.' : 'You have no notifications at this time.'}
            </p>
          </div>
        ) : (
          filteredNotifications?.map((notification) => (
            <div
              key={notification?.id}
              className={`p-4 rounded-lg border transition-medical ${
                notification?.read 
                  ? 'bg-surface border-border' :'bg-primary/5 border-primary/20'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  notification?.read ? 'bg-muted' : 'bg-primary/10'
                }`}>
                  <Icon 
                    name={getNotificationIcon(notification?.type)} 
                    size={20} 
                    className={getTypeColor(notification?.type)}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={`font-medium ${
                        notification?.read ? 'text-text-primary' : 'text-text-primary font-semibold'
                      }`}>
                        {notification?.title}
                      </h4>
                      <p className="text-sm text-text-secondary mt-1">
                        {notification?.message}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification?.priority)}`}>
                        {notification?.priority}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="X"
                        iconSize={14}
                        onClick={() => deleteNotification(notification?.id)}
                        className="text-text-secondary hover:text-error"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      {formatTimestamp(notification?.timestamp)}
                    </span>
                    
                    {!notification?.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification?.id)}
                        className="text-xs text-primary hover:bg-primary/10"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  {notification?.actionable && notification?.actions && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {notification?.actions?.map((action, index) => (
                        <Button
                          key={index}
                          variant={index === 0 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleNotificationAction(notification, action)}
                          className="text-xs"
                        >
                          {action?.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Quick Actions */}
      {filteredNotifications?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              Showing {filteredNotifications?.length} of {notifications?.length} notifications
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                iconName="Archive"
                iconSize={14}
                className="text-text-secondary hover:text-text-primary"
              >
                Archive All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconName="Trash2"
                iconSize={14}
                className="text-text-secondary hover:text-error"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
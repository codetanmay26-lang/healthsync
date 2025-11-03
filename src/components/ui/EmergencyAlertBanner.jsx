import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const EmergencyAlertBanner = ({ userRole = 'doctor', alerts = [] }) => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  useEffect(() => {
    // Filter alerts based on user role and dismissed status
    const filteredAlerts = alerts?.filter(alert => {
      const isRelevantRole = alert?.roles?.includes(userRole) || alert?.roles?.includes('all');
      const isNotDismissed = !dismissedAlerts?.has(alert?.id);
      return isRelevantRole && isNotDismissed && alert?.active;
    });

    // Sort by priority (critical > high > medium > low)
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const sortedAlerts = filteredAlerts?.sort((a, b) => 
      priorityOrder?.[b?.priority] - priorityOrder?.[a?.priority]
    );

    setActiveAlerts(sortedAlerts);
  }, [alerts, userRole, dismissedAlerts]);

  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'emergency': return 'AlertTriangle';
      case 'medication': return 'Pill';
      case 'system': return 'Settings';
      case 'patient': return 'User';
      case 'inventory': return 'Package';
      default: return 'Bell';
    }
  };

  const getAlertStyles = (priority) => {
    switch (priority) {
      case 'critical':
        return {
          container: 'bg-error/10 border-error text-error breathing-alert',
          icon: 'text-error',
          button: 'text-error hover:bg-error/20'
        };
      case 'high':
        return {
          container: 'bg-warning/10 border-warning text-warning',
          icon: 'text-warning',
          button: 'text-warning hover:bg-warning/20'
        };
      case 'medium':
        return {
          container: 'bg-primary/10 border-primary text-primary',
          icon: 'text-primary',
          button: 'text-primary hover:bg-primary/20'
        };
      default:
        return {
          container: 'bg-muted border-border text-text-secondary',
          icon: 'text-text-secondary',
          button: 'text-text-secondary hover:bg-muted'
        };
    }
  };

  const handleAlertAction = (alert) => {
    if (alert?.actionUrl) {
      window.location.href = alert?.actionUrl;
    }
    if (alert?.onAction) {
      alert?.onAction();
    }
  };

  if (activeAlerts?.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-1010">
      {activeAlerts?.slice(0, 3)?.map((alert, index) => {
        const styles = getAlertStyles(alert?.priority);
        
        return (
          <div
            key={alert?.id}
            className={`border-b px-4 py-3 transition-medical ${styles?.container}`}
            style={{ top: `${index * 48}px` }}
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-3">
                <Icon 
                  name={getAlertIcon(alert?.type)} 
                  size={20} 
                  className={styles?.icon}
                />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {alert?.title}
                    </span>
                    {alert?.priority === 'critical' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-error text-error-foreground rounded-full">
                        URGENT
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm opacity-90 mt-0.5">
                    {alert?.message}
                  </p>
                  
                  {alert?.timestamp && (
                    <span className="text-xs opacity-75">
                      {new Date(alert.timestamp)?.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {alert?.actionLabel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAlertAction(alert)}
                    className={`text-xs ${styles?.button} transition-medical`}
                  >
                    {alert?.actionLabel}
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="X"
                  iconSize={16}
                  onClick={() => dismissAlert(alert?.id)}
                  className={`${styles?.button} transition-medical`}
                />
              </div>
            </div>
          </div>
        );
      })}
      {activeAlerts?.length > 3 && (
        <div className="bg-muted border-b border-border px-4 py-2">
          <div className="flex items-center justify-center max-w-7xl mx-auto">
            <span className="text-sm text-text-secondary">
              +{activeAlerts?.length - 3} more alerts
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/alerts'}
              className="ml-2 text-xs text-primary hover:bg-primary/10"
            >
              View All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Example usage with sample alerts
EmergencyAlertBanner.defaultProps = {
  alerts: [
    {
      id: 'alert-1',
      type: 'emergency',
      priority: 'critical',
      title: 'Patient Critical Alert',
      message: 'Patient John Doe (Room 302) requires immediate attention - vitals unstable',
      timestamp: new Date()?.toISOString(),
      roles: ['doctor', 'nurse'],
      active: true,
      actionLabel: 'View Patient',
      actionUrl: '/patient-profile/john-doe'
    },
    {
      id: 'alert-2',
      type: 'medication',
      priority: 'high',
      title: 'Medication Shortage',
      message: 'Insulin supply running low - 2 days remaining',
      timestamp: new Date()?.toISOString(),
      roles: ['pharmacy', 'doctor'],
      active: true,
      actionLabel: 'Order Now',
      actionUrl: '/pharmacy-dashboard'
    },
    {
      id: 'alert-3',
      type: 'system',
      priority: 'medium',
      title: 'System Maintenance',
      message: 'Scheduled maintenance tonight at 2:00 AM - 4:00 AM',
      timestamp: new Date()?.toISOString(),
      roles: ['all'],
      active: true
    }
  ]
};

export default EmergencyAlertBanner;
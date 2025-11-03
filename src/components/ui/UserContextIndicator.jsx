import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const UserContextIndicator = ({ 
  userRole = 'doctor', 
  userName = 'Dr. Sarah Johnson',
  userEmail = 'sarah.johnson@healthsync.com',
  sessionTimeout = 30,
  onLogout
}) => {
  const [timeRemaining, setTimeRemaining] = useState(sessionTimeout * 60);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 300 && !showSessionWarning) { // 5 minutes warning
          setShowSessionWarning(true);
        }
        if (prev <= 0) {
          handleSessionExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showSessionWarning]);

  const handleSessionExpired = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('sessionStart');
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/login';
    }
  };

  const extendSession = () => {
    setTimeRemaining(sessionTimeout * 60);
    setShowSessionWarning(false);
    localStorage.setItem('sessionStart', new Date()?.toISOString());
  };

  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds?.toString()?.padStart(2, '0')}`;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor': return 'Stethoscope';
      case 'patient': return 'User';
      case 'pharmacy': return 'Pill';
      case 'admin': return 'Shield';
      default: return 'User';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor': return 'text-primary bg-primary/10';
      case 'patient': return 'text-accent bg-accent/10';
      case 'pharmacy': return 'text-warning bg-warning/10';
      case 'admin': return 'text-error bg-error/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('sessionStart');
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* Session Warning Modal */}
      {showSessionWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1030">
          <div className="bg-surface rounded-lg shadow-medical-md p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                <Icon name="Clock" size={20} className="text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Session Expiring Soon</h3>
                <p className="text-sm text-text-secondary">
                  Your session will expire in {formatTimeRemaining(timeRemaining)}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-text-secondary mb-6">
              For security reasons, your session will automatically end. Would you like to extend your session?
            </p>
            
            <div className="flex space-x-3">
              <Button
                variant="default"
                onClick={extendSession}
                className="flex-1"
              >
                Extend Session
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex-1"
              >
                Logout Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Context Indicator */}
      <div className="relative">
        <button
          onClick={() => setShowUserDetails(!showUserDetails)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-medical"
        >
          {/* User Avatar with Role Indicator */}
          <div className="relative">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon name="User" size={16} color="white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${getRoleColor(userRole)}`}>
              <Icon name={getRoleIcon(userRole)} size={8} />
            </div>
          </div>

          {/* User Info - Hidden on Mobile */}
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-text-primary">{userName}</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-text-secondary capitalize">{userRole}</span>
              {timeRemaining <= 300 && (
                <span className="text-xs text-warning font-medium">
                  {formatTimeRemaining(timeRemaining)}
                </span>
              )}
            </div>
          </div>

          <Icon name="ChevronDown" size={16} className="text-text-secondary" />
        </button>

        {/* User Details Dropdown */}
        {showUserDetails && (
          <div className="absolute top-full right-0 mt-1 w-72 bg-popover border border-border rounded-lg shadow-medical-md z-1020">
            <div className="p-4">
              {/* User Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Icon name="User" size={20} color="white" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${getRoleColor(userRole)}`}>
                    <Icon name={getRoleIcon(userRole)} size={10} />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">{userName}</h4>
                  <p className="text-sm text-text-secondary">{userEmail}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(userRole)}`}>
                    <Icon name={getRoleIcon(userRole)} size={12} className="mr-1" />
                    {userRole}
                  </span>
                </div>
              </div>

              {/* Session Info */}
              <div className="bg-muted rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">Session Status</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs text-success">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Time Remaining:</span>
                  <span className={`font-mono ${timeRemaining <= 300 ? 'text-warning' : 'text-text-primary'}`}>
                    {formatTimeRemaining(timeRemaining)}
                  </span>
                </div>
                {timeRemaining <= 300 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={extendSession}
                    className="w-full mt-2"
                  >
                    Extend Session
                  </Button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-1 mb-4">
                <button
                  onClick={() => {
                    window.location.href = '/profile';
                    setShowUserDetails(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-muted rounded-lg transition-medical"
                >
                  <Icon name="User" size={16} className="mr-3" />
                  Profile Settings
                </button>
                
                <button
                  onClick={() => {
                    window.location.href = '/security';
                    setShowUserDetails(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-muted rounded-lg transition-medical"
                >
                  <Icon name="Shield" size={16} className="mr-3" />
                  Security Settings
                </button>
                
                <button
                  onClick={() => {
                    window.location.href = '/preferences';
                    setShowUserDetails(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-muted rounded-lg transition-medical"
                >
                  <Icon name="Settings" size={16} className="mr-3" />
                  Preferences
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-border pt-3">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-error hover:bg-error/10 hover:text-error"
                  iconName="LogOut"
                  iconPosition="left"
                  iconSize={16}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click Outside Handler */}
      {showUserDetails && (
        <div 
          className="fixed inset-0 z-1019"
          onClick={() => setShowUserDetails(false)}
        />
      )}
    </>
  );
};

export default UserContextIndicator;
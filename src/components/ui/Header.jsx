import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';

const Header = ({ isCollapsed = false, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const getRoleBasedNavigation = () => {
    switch (user?.role) {
      case 'doctor':
        return [
          { label: 'Dashboard', path: '/doctor-dashboard', icon: 'Activity' },
          { label: 'Patients', path: '/patient-profile', icon: 'Users' },
          { label: 'Analytics', path: '/admin-analytics', icon: 'BarChart3' },
        ];
      case 'patient':
        return [
          { label: 'My Portal', path: '/patient-portal', icon: 'User' },
          { label: 'Medications', path: '/patient-portal', icon: 'Pill' },
        ];
      case 'pharmacy':
        return [
          { label: 'Dashboard', path: '/pharmacy-dashboard', icon: 'Package' },
          { label: 'Inventory', path: '/pharmacy-dashboard', icon: 'Archive' },
        ];
      case 'admin':
        return [
          { label: 'Analytics', path: '/admin-analytics', icon: 'BarChart3' },
          { label: 'Users', path: '/admin-analytics', icon: 'Users' },
        ];
      default:
        return [];
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Icon name="Menu" size={20} />
          </Button>
          <div className="font-bold text-xl text-primary">HealthSync</div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-text-secondary">
            {currentTime.toLocaleTimeString()}
          </div>
          
          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
            >
              <Icon name="User" size={16} />
              <span className="hidden sm:inline">{user?.name}</span>
              <Icon name="ChevronDown" size={14} />
            </Button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-text-secondary">
                    {user?.email}
                  </div>
                  <div className="px-3 py-1 text-xs text-text-secondary uppercase">
                    {user?.role}
                  </div>
                  <hr className="my-2" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-error hover:bg-error/10"
                  >
                    <Icon name="LogOut" size={16} />
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

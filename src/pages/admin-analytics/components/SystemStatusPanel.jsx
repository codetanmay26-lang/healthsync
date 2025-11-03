import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SystemStatusPanel = ({ systemData }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-success bg-success/10';
      case 'warning': return 'text-warning bg-warning/10';
      case 'error': return 'text-error bg-error/10';
      case 'offline': return 'text-text-secondary bg-muted';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'XCircle';
      case 'offline': return 'Circle';
      default: return 'Circle';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">System Status</h3>
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <Icon name="Clock" size={16} />
          <span>Last updated: {currentTime?.toLocaleTimeString()}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {systemData?.services?.map((service) => (
          <div key={service?.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(service?.status)}`}>
                <Icon name={getStatusIcon(service?.status)} size={16} />
              </div>
              <div>
                <p className="font-medium text-text-primary">{service?.name}</p>
                <p className="text-sm text-text-secondary">{service?.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">{service?.uptime}</p>
              <p className="text-xs text-text-secondary">Uptime</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-4">
        <h4 className="font-medium text-text-primary mb-3">Active Sessions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemData?.activeSessions?.map((session) => (
            <div key={session?.role} className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-text-primary">{session?.count}</div>
              <div className="text-sm text-text-secondary capitalize">{session?.role}s</div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border pt-4 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-text-primary">System Health</h4>
            <p className="text-sm text-text-secondary">Overall system performance</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full pulse-medical"></div>
            <span className="text-sm font-medium text-success">Healthy</span>
          </div>
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">CPU Usage</span>
            <span className="text-text-primary">{systemData?.performance?.cpu}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${systemData?.performance?.cpu}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Memory Usage</span>
            <span className="text-text-primary">{systemData?.performance?.memory}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${systemData?.performance?.memory}%` }}
            />
          </div>
        </div>
      </div>
      <div className="flex space-x-2 mt-4">
        <Button variant="outline" size="sm" iconName="RefreshCw" iconPosition="left">
          Refresh Status
        </Button>
        <Button variant="ghost" size="sm" iconName="Settings" iconPosition="left">
          System Settings
        </Button>
      </div>
    </div>
  );
};

export default SystemStatusPanel;
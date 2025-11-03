import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmergencyAlertsPanel = ({ alerts, onAlertAction, onDismissAlert }) => {
  // Empty state check - ADD THIS FIRST
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Emergency Alerts</h3>
        <p className="text-text-secondary text-sm">No active alerts</p>
      </div>
    );
  }

  // Rest of existing code...


  const [expandedAlert, setExpandedAlert] = useState(null);
  const [filter, setFilter] = useState('all');

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return 'AlertTriangle';
      case 'medication': return 'Pill';
      case 'vitals': return 'Activity';
      case 'compliance': return 'TrendingDown';
      case 'emergency': return 'Phone';
      default: return 'Bell';
    }
  };

  const getAlertColor = (priority) => {
    switch (priority) {
      case 'critical': return {
        bg: 'bg-error/10',
        border: 'border-error/20',
        text: 'text-error',
        icon: 'text-error',
        pulse: 'breathing-alert'
      };
      case 'high': return {
        bg: 'bg-warning/10',
        border: 'border-warning/20',
        text: 'text-warning',
        icon: 'text-warning',
        pulse: ''
      };
      case 'medium': return {
        bg: 'bg-primary/10',
        border: 'border-primary/20',
        text: 'text-primary',
        icon: 'text-primary',
        pulse: ''
      };
      default: return {
        bg: 'bg-muted',
        border: 'border-border',
        text: 'text-text-secondary',
        icon: 'text-text-secondary',
        pulse: ''
      };
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - alertTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const filteredAlerts = alerts?.filter(alert => {
    if (filter === 'all') return true;
    return alert?.priority === filter;
  });

  const priorityCount = {
    critical: alerts?.filter(a => a?.priority === 'critical')?.length,
    high: alerts?.filter(a => a?.priority === 'high')?.length,
    medium: alerts?.filter(a => a?.priority === 'medium')?.length
  };

  return (
    <div className="bg-surface rounded-lg border border-border shadow-medical-sm h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={20} className="text-error" />
            <h3 className="text-lg font-semibold text-text-primary">Emergency Alerts</h3>
            {alerts?.length > 0 && (
              <span className="px-2 py-1 bg-error/10 text-error rounded-full text-xs font-medium">
                {alerts?.length}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            iconName="RefreshCw"
            iconSize={16}
            className="text-text-secondary hover:text-primary"
            title="Refresh Alerts"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-medical ${
              filter === 'all' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:text-text-primary hover:bg-muted'
            }`}
          >
            All ({alerts?.length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-medical ${
              filter === 'critical' ?'bg-error text-error-foreground' :'text-text-secondary hover:text-text-primary hover:bg-muted'
            }`}
          >
            Critical ({priorityCount?.critical})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-medical ${
              filter === 'high' ?'bg-warning text-warning-foreground' :'text-text-secondary hover:text-text-primary hover:bg-muted'
            }`}
          >
            High ({priorityCount?.high})
          </button>
        </div>
      </div>
      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAlerts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Icon name="CheckCircle" size={48} className="text-success/50 mb-4" />
            <h4 className="text-lg font-medium text-text-primary mb-2">All Clear</h4>
            <p className="text-text-secondary text-sm">
              No {filter !== 'all' ? filter + ' priority' : ''} alerts at this time.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredAlerts?.map((alert) => {
              const colors = getAlertColor(alert?.priority);
              const isExpanded = expandedAlert === alert?.id;

              return (
                <div
                  key={alert?.id}
                  className={`border rounded-lg p-4 transition-medical ${colors?.bg} ${colors?.border} ${colors?.pulse}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors?.bg} border ${colors?.border}`}>
                        <Icon name={getAlertIcon(alert?.type)} size={16} className={colors?.icon} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`text-sm font-medium ${colors?.text}`}>
                            {alert?.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${colors?.bg} ${colors?.text}`}>
                            {alert?.priority}
                          </span>
                        </div>
                        
                        <p className="text-sm text-text-secondary mb-2">
                          {alert?.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-text-secondary">
                          <span>Patient: {alert?.patientName}</span>
                          <span>{formatTimeAgo(alert?.timestamp)}</span>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && alert?.details && (
                          <div className="mt-3 p-3 bg-surface/50 rounded-lg border border-border/50">
                            <h5 className="text-sm font-medium text-text-primary mb-2">Details:</h5>
                            <div className="space-y-1 text-sm text-text-secondary">
                              {Object.entries(alert?.details)?.map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="capitalize">{key?.replace(/([A-Z])/g, ' $1')}:</span>
                                  <span className="font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 ml-2">
                      {alert?.details && (
                        <Button
                          variant="ghost"
                          size="icon"
                          iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                          iconSize={14}
                          onClick={() => setExpandedAlert(isExpanded ? null : alert?.id)}
                          className="text-text-secondary hover:text-text-primary"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        iconName="X"
                        iconSize={14}
                        onClick={() => onDismissAlert(alert?.id)}
                        className="text-text-secondary hover:text-text-primary"
                      />
                    </div>
                  </div>
                  {/* Action Buttons */}
                  {alert?.actions && alert?.actions?.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-border/50">
                      {alert?.actions?.map((action, index) => (
                        <Button
                          key={index}
                          variant={action?.primary ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => onAlertAction(alert?.id, action?.type)}
                          className={action?.primary ? '' : `${colors?.text} border-current hover:bg-current/10`}
                        >
                          {action?.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Footer Actions */}
      {alerts?.length > 0 && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              iconName="CheckCheck"
              iconPosition="left"
              iconSize={16}
              onClick={() => alerts?.forEach(alert => onDismissAlert(alert?.id))}
              className="text-text-secondary hover:text-text-primary"
            >
              Mark All Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="ExternalLink"
              iconPosition="right"
              iconSize={16}
              onClick={() => window.location.href = '/emergency-center'}
            >
              Emergency Center
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyAlertsPanel;

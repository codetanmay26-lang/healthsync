import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsPanel = ({ onActionClick }) => {
  const [showAllActions, setShowAllActions] = useState(false);

  const primaryActions = [
    {
      id: 'add-patient',
      title: 'Add New Patient',
      description: 'Register a new patient for monitoring',
      icon: 'UserPlus',
      color: 'text-primary bg-primary/10 border-primary/20',
      path: '/patient-profile/new'
    },
    {
      id: 'emergency-response',
      title: 'Emergency Response',
      description: 'Access emergency protocols and contacts',
      icon: 'Phone',
      color: 'text-error bg-error/10 border-error/20',
      path: '/emergency-center'
    },
    {
      id: 'bulk-message',
      title: 'Send Bulk Message',
      description: 'Message multiple patients at once',
      icon: 'MessageSquare',
      color: 'text-accent bg-accent/10 border-accent/20',
      action: 'bulk-message'
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create compliance and adherence reports',
      icon: 'FileText',
      color: 'text-warning bg-warning/10 border-warning/20',
      action: 'generate-report'
    }
  ];

  const secondaryActions = [
    {
      id: 'schedule-appointment',
      title: 'Schedule Appointment',
      description: 'Book follow-up appointments',
      icon: 'Calendar',
      color: 'text-primary bg-primary/10 border-primary/20',
      path: '/appointments/new'
    },
    {
      id: 'medication-review',
      title: 'Medication Review',
      description: 'Review and adjust prescriptions',
      icon: 'Pill',
      color: 'text-accent bg-accent/10 border-accent/20',
      action: 'medication-review'
    },
    {
      id: 'lab-results',
      title: 'Review Lab Results',
      description: 'Check pending lab reports',
      icon: 'Activity',
      color: 'text-success bg-success/10 border-success/20',
      path: '/lab-results'
    },
    {
      id: 'patient-analytics',
      title: 'Patient Analytics',
      description: 'View detailed patient insights',
      icon: 'BarChart3',
      color: 'text-warning bg-warning/10 border-warning/20',
      path: '/analytics/patients'
    }
  ];

  const handleActionClick = (action) => {
    if (action?.path) {
      window.location.href = action?.path;
    } else if (action?.action && onActionClick) {
      onActionClick(action?.action, action);
    }
  };

  const actionsToShow = showAllActions 
    ? [...primaryActions, ...secondaryActions]
    : primaryActions;

  return (
    <div className="bg-surface rounded-lg border border-border shadow-medical-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Zap" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Quick Actions</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName={showAllActions ? 'ChevronUp' : 'ChevronDown'}
          iconPosition="right"
          iconSize={16}
          onClick={() => setShowAllActions(!showAllActions)}
          className="text-text-secondary hover:text-primary"
        >
          {showAllActions ? 'Show Less' : 'Show More'}
        </Button>
      </div>
      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actionsToShow?.map((action) => (
          <button
            key={action?.id}
            onClick={() => handleActionClick(action)}
            className={`p-4 rounded-lg border text-left transition-medical hover:shadow-medical-sm hover:-translate-y-0.5 ${action?.color}`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${action?.color}`}>
                <Icon name={action?.icon} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-text-primary mb-1">{action?.title}</h4>
                <p className="text-sm text-text-secondary">{action?.description}</p>
              </div>
              <Icon name="ArrowRight" size={16} className="text-text-secondary mt-1" />
            </div>
          </button>
        ))}
      </div>
      {/* Recent Actions */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-medium text-text-primary mb-3">Recent Actions</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="UserPlus" size={12} className="text-success" />
              </div>
              <span className="text-sm text-text-secondary">Added patient: Rakesh Sharma</span>
            </div>
            <span className="text-xs text-text-secondary">2h ago</span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="MessageSquare" size={12} className="text-primary" />
              </div>
              <span className="text-sm text-text-secondary">Sent message to 15 patients</span>
            </div>
            <span className="text-xs text-text-secondary">4h ago</span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-warning/10 rounded-full flex items-center justify-center">
                <Icon name="FileText" size={12} className="text-warning" />
              </div>
              <span className="text-sm text-text-secondary">Generated compliance report</span>
            </div>
            <span className="text-xs text-text-secondary">1d ago</span>
          </div>
        </div>
      </div>
      {/* Shortcuts */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-medium text-text-primary mb-3">Keyboard Shortcuts</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Add Patient</span>
            <kbd className="px-2 py-1 bg-muted rounded text-text-secondary font-mono">Ctrl+N</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Search</span>
            <kbd className="px-2 py-1 bg-muted rounded text-text-secondary font-mono">Ctrl+K</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Emergency</span>
            <kbd className="px-2 py-1 bg-muted rounded text-text-secondary font-mono">Ctrl+E</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Refresh</span>
            <kbd className="px-2 py-1 bg-muted rounded text-text-secondary font-mono">F5</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;
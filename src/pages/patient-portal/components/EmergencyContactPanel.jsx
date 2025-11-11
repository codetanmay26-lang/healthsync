import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmergencyContactPanel = ({ onEmergencyCall }) => {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const emergencyContacts = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Primary Care Physician",
      phone: "+91 9456XXXX",
      email: "sarah.johnson@healthsync.com",
      availability: "Mon-Fri 8AM-6PM",
      status: "available",
      priority: "primary"
    },
    {
      id: 2,
      name: "City General Hospital",
      role: "Emergency Department",
      phone: "+91 9845XXXX",
      email: "emergency@citygeneral.com",
      availability: "24/7",
      status: "available",
      priority: "emergency"
    },
    {
      id: 3,
      name: "HealthSync Pharmacy",
      role: "Pharmacy Services",
      phone: "+91 8743XXXX",
      email: "support@healthsyncpharmacy.com",
      availability: "Mon-Sat 8AM-10PM",
      status: "available",
      priority: "secondary"
    },
    {
      id: 4,
      name: "Poison Control Center",
      role: "Poison Control",
      phone: "+91 9456XXXX",
      email: "info@poison.org",
      availability: "24/7",
      status: "available",
      priority: "emergency"
    },
    {
      id: 5,
      name: "Mental Health Crisis Line",
      role: "Crisis Support",
      phone: "+91 9456XXXX",
      email: "crisis@mentalhealth.org",
      availability: "24/7",
      status: "available",
      priority: "emergency"
    }
  ];

  const quickActions = [
    {
      id: 'emergency',
      label: 'Emergency Services',
      description: 'Call 112 for immediate emergency',
      icon: 'Phone',
      color: 'bg-error text-error-foreground',
      action: () => handleEmergencyCall('112')
    },
    {
      id: 'doctor',
      label: 'Call Doctor',
      description: 'Contact your primary care physician',
      icon: 'Stethoscope',
      color: 'bg-primary text-primary-foreground',
      action: () => handleContactCall(emergencyContacts[0])
    },
    {
      id: 'pharmacy',
      label: 'Call Pharmacy',
      description: 'Contact pharmacy for medication help',
      icon: 'Pill',
      color: 'bg-accent text-accent-foreground',
      action: () => handleContactCall(emergencyContacts[2])
    },
    {
      id: 'hospital',
      label: 'Hospital',
      description: 'Contact emergency department',
      icon: 'Building2',
      color: 'bg-warning text-warning-foreground',
      action: () => handleContactCall(emergencyContacts[1])
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-success bg-success/10';
      case 'busy': return 'text-warning bg-warning/10';
      case 'unavailable': return 'text-error bg-error/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'emergency': return 'border-l-error';
      case 'primary': return 'border-l-primary';
      case 'secondary': return 'border-l-accent';
      default: return 'border-l-border';
    }
  };

  const handleEmergencyCall = (number) => {
    setShowEmergencyModal(true);
    setSelectedContact({ name: 'Emergency Services', phone: number });
    
    if (onEmergencyCall) {
      onEmergencyCall({ type: 'emergency', number });
    }
  };

  const handleContactCall = (contact) => {
    setShowEmergencyModal(true);
    setSelectedContact(contact);
    
    if (onEmergencyCall) {
      onEmergencyCall({ type: 'contact', contact });
    }
  };

  const makeCall = () => {
    if (selectedContact) {
      // In a real app, this would initiate the call
      window.location.href = `tel:${selectedContact.phone}`;
      setShowEmergencyModal(false);
    }
  };

  const sendMessage = () => {
    if (selectedContact && selectedContact.email) {
      // In a real app, this would open messaging interface
      window.location.href = `mailto:${selectedContact.email}`;
      setShowEmergencyModal(false);
    }
  };

  return (
    <>
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary">Emergency Contacts</h2>
          <p className="text-sm text-text-secondary mt-1">
            Quick access to healthcare providers and emergency services
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`p-4 rounded-lg transition-medical hover:scale-105 ${action.color} shadow-medical-sm`}
            >
              <div className="flex flex-col items-center space-y-2">
                <Icon name={action.icon} size={24} />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Emergency Alert */}
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-error mt-0.5" />
            <div>
              <h3 className="font-medium text-error mb-1">Medical Emergency?</h3>
              <p className="text-sm text-error/80 mb-3">
                If you're experiencing a life-threatening emergency, call 112 immediately.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleEmergencyCall('112')}
                iconName="Phone"
                iconPosition="left"
                iconSize={16}
                className="breathing-alert"
              >
                Call 112 Now
              </Button>
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-text-primary">Your Healthcare Team</h3>
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className={`bg-muted rounded-lg p-4 border-l-4 ${getPriorityColor(contact.priority)} transition-medical hover:bg-muted/80`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-text-primary">{contact.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                      {contact.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-1">{contact.role}</p>
                  <p className="text-sm text-text-secondary">{contact.availability}</p>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1 text-sm text-text-secondary">
                      <Icon name="Phone" size={14} />
                      <span>{contact.phone}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center space-x-1 text-sm text-text-secondary">
                        <Icon name="Mail" size={14} />
                        <span>{contact.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Phone"
                    iconSize={16}
                    onClick={() => handleContactCall(contact)}
                    className="text-primary border-primary hover:bg-primary/10"
                  />
                  {contact.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="MessageCircle"
                      iconSize={16}
                      onClick={() => {
                        setSelectedContact(contact);
                        sendMessage();
                      }}
                      className="text-accent border-accent hover:bg-accent/10"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Resources */}
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="font-medium text-text-primary mb-2 flex items-center">
            <Icon name="Info" size={16} className="mr-2 text-primary" />
            Additional Resources
          </h4>
          <div className="space-y-2 text-sm text-text-secondary">
            <div className="flex items-center space-x-2">
              <Icon name="Globe" size={14} />
              <span>Patient Portal: healthsync.com/portal</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="MessageSquare" size={14} />
              <span>24/7 Chat Support available in app</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Book" size={14} />
              <span>Health Resources: healthsync.com/resources</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Call Modal */}
      {showEmergencyModal && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1030 p-4">
          <div className="bg-surface rounded-lg shadow-medical-md max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Phone" size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Contact {selectedContact.name}</h3>
                  <p className="text-sm text-text-secondary">{selectedContact.phone}</p>
                </div>
              </div>
              
              <p className="text-sm text-text-secondary mb-6">
                You're about to contact {selectedContact.name}. 
                {selectedContact.name === 'Emergency Services' ? ' This will connect you to emergency services.' : ' Choose how you\'d like to reach them.'}
              </p>
              
              <div className="flex space-x-3">
                <Button
                  variant="default"
                  onClick={makeCall}
                  iconName="Phone"
                  iconPosition="left"
                  iconSize={16}
                  className="flex-1"
                >
                  Call Now
                </Button>
                
                {selectedContact.email && selectedContact.name !== 'Emergency Services' && (
                  <Button
                    variant="outline"
                    onClick={sendMessage}
                    iconName="MessageCircle"
                    iconPosition="left"
                    iconSize={16}
                    className="flex-1"
                  >
                    Message
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={() => setShowEmergencyModal(false)}
                  className="px-4"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyContactPanel;

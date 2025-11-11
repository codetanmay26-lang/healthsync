import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import EmergencyAlertBanner from '../../components/ui/EmergencyAlertBanner';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import PatientHeader from './components/PatientHeader';
import MedicationTimeline from './components/MedicationTimeline';
import LabReportsViewer from './components/LabReportsViewer';
import HealthLogsChart from './components/HealthLogsChart';
import AISuggestions from './components/AISuggestions';
import ChatMessaging from './components/ChatMessaging';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const PatientProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('medications');
  const [patientInfo, setPatientInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real data states - will be loaded from localStorage
  const [mockMedications, setMockMedications] = useState([]);
  const [mockLabReports, setMockLabReports] = useState([]);
  const [mockHealthLogs, setMockHealthLogs] = useState([]);
  const [mockAISuggestions, setMockAISuggestions] = useState([]);

useEffect(() => {
  // Get patient ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('id') || 'patient123';

  // Load only data for this specific patient
  const patientMedicines = JSON.parse(localStorage.getItem('patientMedicines') || '[]');
  const labReports = JSON.parse(localStorage.getItem('labReports') || '[]');
  const healthLogs = JSON.parse(localStorage.getItem('healthLogs') || '[]');
  const adherenceReports = JSON.parse(localStorage.getItem('adherenceReports') || '[]');

  // Filter all data by patient ID
  const filteredMedicines = patientMedicines.filter(med => med.patientId === patientId);
  const filteredLabReports = labReports.filter(report => report.patientId === patientId);
  const filteredHealthLogs = healthLogs.filter(log => log.patientId === patientId);
  const filteredAdherenceReports = adherenceReports.filter(report => report.patientId === patientId);

  // Set patient info with consistent ID
  setPatient({
    id: patientId,
    name: 'Rakesh Sharma',
    age: 45,
    gender: 'male',
    bloodType: 'A+',
    phone: '555 123-4567',
    email: 'john.doe@email.com',
    emergencyContact: 'Jane Doe - 555 987-6543',
    status: 'monitoring',
    riskLevel: 'medium',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    vitals: {
      heartRate: 78,
      bloodPressure: '135/85',
      temperature: 98.6,
      lastUpdated: new Date().toISOString()
    },
    lastVisit: '2025-01-05',
    nextAppointment: '2025-01-15'
  });

  // Convert filtered medicines to expected format
  const formattedMedications = filteredMedicines.map((med, index) => ({
    id: `med-${index + 1}`,
    name: med.medicineList || 'Prescribed Medication',
    dosage: '10mg',
    frequency: 'Once daily',
    prescribedDate: '2024-12-15',
    duration: '90 days',
    adherence: filteredAdherenceReports.length > 0 ? 
      Math.round((filteredAdherenceReports.filter(report => report.medicationTaken).length / filteredAdherenceReports.length) * 100) : 92,
    nextDose: 'Tomorrow 8:00 AM',
    status: 'active',
    instructions: 'Take with food in the morning.',
    aiWarnings: ['Monitor blood pressure regularly'],
    recentDoses: [
      { time: 'Today 8:00 AM', taken: true },
      { time: 'Yesterday 8:00 AM', taken: true },
      { time: 'Jan 6 8:00 AM', taken: false },
      { time: 'Jan 5 8:00 AM', taken: true }
    ],
    sideEffects: ['None reported']
  }));

  // Set all the real filtered data
  setMockMedications(formattedMedications);
  setMockLabReports(filteredLabReports);
  setMockHealthLogs(filteredHealthLogs);
  setMockAISuggestions([]);
  
  setLoading(false);
}, []);


  // Mock emergency alerts
  const mockAlerts = [
    {
      id: 'alert-patient-001',
      type: 'patient',
      priority: 'medium',
      title: 'Medication Adherence Alert',
      message: 'Rakesh Sharma missed 2 consecutive Metformin doses',
      timestamp: new Date().toISOString(),
      roles: ['doctor'],
      active: true,
      actionLabel: 'Contact Patient',
      actionUrl: '/patient-profile'
    }
  ];

  // Mock chat messages
  const mockMessages = [
    {
      id: 'msg-001',
      sender: 'Dr. Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      content: 'Hi John! How are you feeling today? I see you\'ve been consistent with your medication schedule.',
      timestamp: '2025-01-08T08:30:00Z',
      type: 'text'
    },
    {
      id: 'msg-002',
      sender: 'Rakesh Sharma',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      content: 'Hi Dr. Johnson! I\'m feeling okay, though I\'ve been having some mild headaches in the mornings.',
      timestamp: '2025-01-08T08:45:00Z',
      type: 'text'
    }
  ];

  const mockParticipants = [
    {
      id: 'user-001',
      name: 'Dr. Sarah Johnson',
      role: 'doctor',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      status: 'online'
    },
    {
      id: 'user-002',
      name: 'Rakesh Sharma',
      role: 'patient',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      status: 'online'
    }
  ];

  const breadcrumbItems = [
    { label: 'Patients', path: '/doctor-dashboard' },
    { label: patientInfo?.name || 'Loading...', clickable: false }
  ];

  const tabs = [
    { key: 'medications', label: 'Medications', icon: 'Pill', count: mockMedications?.length },
    { key: 'lab-reports', label: 'Lab Reports', icon: 'FileText', count: mockLabReports?.length },
    { key: 'health-logs', label: 'Health Logs', icon: 'BarChart3' },
    { key: 'ai-suggestions', label: 'AI Suggestions', icon: 'Brain', count: mockAISuggestions?.length },
    { key: 'messaging', label: 'Messages', icon: 'MessageCircle', count: 3 }
  ];

  // Event handlers
  const handleEditProfile = () => {
    console.log('Edit profile clicked');
  };

  const handleSendMessage = () => {
    setActiveTab('messaging');
  };

  const handleEmergencyContact = () => {
    console.log('Emergency contact initiated');
  };

  const handleEditMedication = (medication) => {
    console.log('Edit medication', medication);
  };

  const handleAddMedication = () => {
    console.log('Add medication clicked');
  };

  const handleUploadReport = () => {
    console.log('Upload report clicked');
  };

  const handleViewReport = (report) => {
    console.log('View report', report);
  };

  const handleAddLog = () => {
    console.log('Add health log clicked');
  };

  const handleAcceptSuggestion = (suggestion) => {
    console.log('Accept suggestion', suggestion);
  };

  const handleDismissSuggestion = (suggestion) => {
    console.log('Dismiss suggestion', suggestion);
  };

  const handleSendChatMessage = (message) => {
    console.log('Send message', message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="doctor" userName="Dr. Sarah Johnson" />
        <EmergencyAlertBanner userRole="doctor" alerts={mockAlerts} />
        
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
              <div className="bg-surface border border-border rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-96 bg-surface border border-border rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="doctor" userName="Dr. Sarah Johnson" />
      <EmergencyAlertBanner userRole="doctor" alerts={mockAlerts} />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb Navigation */}
          <BreadcrumbNavigation 
            items={breadcrumbItems}
            userRole="doctor"
            onBack={() => navigate('/doctor-dashboard')}
          />

          {/* Patient Header */}
          <PatientHeader 
            patient={patientInfo}
            onEditProfile={handleEditProfile}
            onSendMessage={handleSendMessage}
            onEmergencyContact={handleEmergencyContact}
          />

          {/* Tab Navigation */}
          <div className="bg-surface border border-border rounded-lg mb-6">
            <div className="border-b border-border">
              <nav className="flex space-x-8 px-6">
                {tabs?.map(tab => (
                  <button
                    key={tab?.key}
                    onClick={() => setActiveTab(tab?.key)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-medical ${
                      activeTab === tab?.key
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span>{tab?.label}</span>
                    {tab?.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        activeTab === tab?.key 
                          ? 'bg-primary10 text-primary' 
                          : 'bg-muted text-text-secondary'
                      }`}>
                        {tab?.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'medications' && (
                <MedicationTimeline 
                  medications={mockMedications}
                  onEditMedication={handleEditMedication}
                  onAddMedication={handleAddMedication}
                />
              )}
              
              {activeTab === 'lab-reports' && (
                <LabReportsViewer 
                  labReports={mockLabReports}
                  onUploadReport={handleUploadReport}
                  onViewReport={handleViewReport}
                />
              )}
              
              {activeTab === 'health-logs' && (
                <HealthLogsChart 
                  healthLogs={mockHealthLogs}
                  onAddLog={handleAddLog}
                />
              )}
              
              {activeTab === 'ai-suggestions' && (
                <AISuggestions 
                  suggestions={mockAISuggestions}
                  onAcceptSuggestion={handleAcceptSuggestion}
                  onDismissSuggestion={handleDismissSuggestion}
                />
              )}
              
              {activeTab === 'messaging' && (
                <ChatMessaging 
                  messages={mockMessages}
                  participants={mockParticipants}
                  currentUser={{ name: 'Dr. Sarah Johnson', role: 'doctor' }}
                  onSendMessage={handleSendChatMessage}
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/doctor-dashboard')}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Back to Dashboard
            </Button>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline"
                className="h-16 justify-start"
                iconName="Calendar"
                iconPosition="left"
                onClick={() => console.log('Schedule appointment')}
              >
                <div className="text-left">
                  <div className="font-medium">Schedule Follow-up</div>
                  <div className="text-sm text-text-secondary">Next appointment</div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="h-16 justify-start"
                iconName="FileText"
                iconPosition="left"
                onClick={() => console.log('Generate report')}
              >
                <div className="text-left">
                  <div className="font-medium">Generate Report</div>
                  <div className="text-sm text-text-secondary">Patient summary</div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="h-16 justify-start"
                iconName="Share"
                iconPosition="left"
                onClick={() => console.log('Share profile')}
              >
                <div className="text-left">
                  <div className="font-medium">Share Profile</div>
                  <div className="text-sm text-text-secondary">With care team</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;

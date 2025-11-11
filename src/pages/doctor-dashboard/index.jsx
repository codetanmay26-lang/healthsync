import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import { getDoctorPatients } from '../../services/localStorageUserManagement';
import EmergencyAlertBanner from '../../components/ui/EmergencyAlertBanner';
import Header from '../../components/ui/Header';
import FilterControls from './components/FilterControls';
import PatientListTable from './components/PatientListTable';
import PatientAnalyticsRealTime from './components/PatientAnalyticsRealTime';
import PatientVitalsPanel from './components/PatientVitalsPanel'; 
import AnalysisReportsPanel from './components/AnalysisReportsPanel';
import DoctorMessaging from './components/DoctorMessaging';
import DoctorDashboardOverview from './components/DoctorDashboardOverview';
import Icon from '../../components/AppIcon';

const DoctorDashboard = () => {
  const { user, isLoading } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Patient and alert state
  const [patients, setPatients] = useState([]);
  const [realAlerts, setRealAlerts] = useState([]);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    complianceFilter: 'all',
    riskFilter: 'all',
    dateRange: { start: '', end: '' }
  });

  // Check URL for tab parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  // ✅ COMPREHENSIVE ADHERENCE CALCULATION
  const calculateComprehensiveAdherence = (patientId) => {
    const adherenceReports = JSON.parse(localStorage.getItem('adherenceReports') || '[]');
    const labReports = JSON.parse(localStorage.getItem('labReports') || '[]');
    const patientVitals = JSON.parse(localStorage.getItem('patientVitals') || '[]');
    
    const patientAdherence = adherenceReports.filter(r => r.patientId === patientId);
    const patientLabs = labReports.filter(lab => lab.patientId === patientId);
    const patientHealthData = patientVitals.filter(vital => vital.patientId === patientId);
    
    let totalScore = 0;
    let weights = 0;
    
    // Medication adherence (weight: 50%)
    if (patientAdherence.length > 0) {
      const taken = patientAdherence.filter(r => r.medicationTaken === true).length;
      const medAdherence = (taken / patientAdherence.length) * 100;
      totalScore += medAdherence * 0.5;
      weights += 0.5;
    }
    
    // Lab reports submitted (weight: 25%)
    if (patientLabs.length > 0) {
      const labScore = Math.min(100, (patientLabs.length / 2) * 100); // 2+ labs = 100%
      totalScore += labScore * 0.25;
      weights += 0.25;
    }
    
    // Vitals logged (weight: 25%)
    if (patientHealthData.length > 0) {
      const vitalsScore = Math.min(100, (patientHealthData.length / 5) * 100); // 5+ vitals = 100%
      totalScore += vitalsScore * 0.25;
      weights += 0.25;
    }
    
    // Calculate final adherence rate
    const finalAdherence = weights > 0 ? Math.round(totalScore / weights) : 0;
    
    return {
      adherenceRate: finalAdherence,
      medicationAdherence: patientAdherence.length > 0 ? Math.round((patientAdherence.filter(r => r.medicationTaken).length / patientAdherence.length) * 100) : 0,
      labReportsCount: patientLabs.length,
      vitalsCount: patientHealthData.length
    };
  };

  // Load REAL patient data assigned to this doctor
  useEffect(() => {
    if (user && user.role === 'doctor') {
      // Get only patients assigned to THIS doctor from user management system
      const assignedPatients = getDoctorPatients(user.id);
      
      // Build comprehensive patient data
      const patientsWithData = assignedPatients.map(patient => {
        // ✅ Use patient.id consistently for ALL filtering
        const patientId = patient.id;
        
        // Get all data sources
        const adherenceReports = JSON.parse(localStorage.getItem('adherenceReports') || '[]');
        const patientMedicines = JSON.parse(localStorage.getItem('patientMedicines') || '[]');
        const labReports = JSON.parse(localStorage.getItem('labReports') || '[]');
        const patientVitals = JSON.parse(localStorage.getItem('patientVitals') || '[]');
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        
        // Filter data for THIS specific patient
        const patientAdherence = adherenceReports.filter(r => r.patientId === patientId);
        const medications = patientMedicines.filter(m => m.patientId === patientId);
        const patientLabs = labReports.filter(lab => lab.patientId === patientId);
        const patientHealthData = patientVitals.filter(vital => vital.patientId === patientId);
        const patientAppointments = appointments.filter(apt => apt.patientId === patientId);
        
        // ✅ Calculate comprehensive adherence (medications + labs + vitals)
        const adherenceData = calculateComprehensiveAdherence(patientId);
        const adherenceRate = adherenceData.adherenceRate;
        
        // Determine compliance status and risk level
        let complianceStatus = 'Good';
        let riskLevel = 'Low';
        
        if (adherenceRate < 50) {
          complianceStatus = 'Poor';
          riskLevel = 'High';
        } else if (adherenceRate < 70) {
          complianceStatus = 'Fair';
          riskLevel = 'Medium';
        } else if (adherenceRate >= 90) {
          complianceStatus = 'Excellent';
          riskLevel = 'Low';
        }
        
        console.log(`✅ Patient ${patient.name} (ID: ${patientId}):`, {
          medications: medications.length,
          labs: patientLabs.length,
          vitals: patientHealthData.length,
          comprehensiveAdherence: adherenceRate,
          medicationAdherence: adherenceData.medicationAdherence
        });
        
        return {
          ...patient,
          adherenceRate,
          medicationAdherence: adherenceData.medicationAdherence,
          complianceStatus,
          riskLevel,
          lastActivity: new Date().toISOString(),
          currentMedications: medications.length,
          medications: medications.map(med => med.medicineList || 'Prescribed medication'),
          labReports: patientLabs,
          vitals: patientHealthData,
          appointments: patientAppointments,
          labReportsCount: patientLabs.length,
          vitalsCount: patientHealthData.length,
          appointmentsCount: patientAppointments.length,
          contactInfo: {
            phone: patient.phone || 'N/A',
            email: patient.email || 'N/A'
          }
        };
      });
      
      setPatients(patientsWithData);
      
      // Generate comprehensive alerts for all data types
      const alerts = [];
      patientsWithData.forEach(patient => {
        // Low comprehensive adherence alert
        if (patient.adherenceRate < 70 && patient.adherenceRate > 0) {
          alerts.push({
            id: `alert-adherence-${patient.id}`,
            type: 'medication',
            priority: patient.adherenceRate < 50 ? 'critical' : 'high',
            title: 'Overall Adherence Alert',
            message: `${patient.name} has ${patient.adherenceRate}% overall adherence (medications, labs, vitals)`,
            patientName: patient.name,
            patientId: patient.patientId || patient.id,
            timestamp: new Date().toISOString(),
            active: true,
            roles: ['doctor', 'admin'],
            actions: [
              { type: 'call-patient', label: 'Call Patient', primary: true }
            ]
          });
        }
        
        // Missed appointments
        const missedAppointments = patient.appointments.filter(apt => 
          apt.status === 'missed' &&
          new Date(apt.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
        
        if (missedAppointments.length > 0) {
          alerts.push({
            id: `alert-appointment-${patient.id}`,
            type: 'appointment',
            priority: 'high',
            title: 'Missed Appointment',
            message: `${patient.name} has ${missedAppointments.length} missed appointment(s) in the last 30 days`,
            patientName: patient.name,
            patientId: patient.patientId || patient.id,
            timestamp: new Date().toISOString(),
            active: true,
            roles: ['doctor', 'admin'],
            actions: [
              { type: 'schedule-appointment', label: 'Schedule Follow-up', primary: true }
            ]
          });
        }
        
        // No lab reports
        if (patient.labReportsCount === 0) {
          alerts.push({
            id: `alert-no-labs-${patient.id}`,
            type: 'lab',
            priority: 'medium',
            title: 'No Lab Reports',
            message: `${patient.name} has no lab reports uploaded`,
            patientName: patient.name,
            patientId: patient.patientId || patient.id,
            timestamp: new Date().toISOString(),
            active: true,
            roles: ['doctor', 'admin']
          });
        }
        
        // No vitals data
        if (patient.vitalsCount === 0) {
          alerts.push({
            id: `alert-no-vitals-${patient.id}`,
            type: 'vitals',
            priority: 'medium',
            title: 'No Vitals Data',
            message: `${patient.name} has not logged any health vitals`,
            patientName: patient.name,
            patientId: patient.patientId || patient.id,
            timestamp: new Date().toISOString(),
            active: true,
            roles: ['doctor', 'admin']
          });
        }
      });
      
      setRealAlerts(alerts);
    }
  }, [user]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          patient.name?.toLowerCase().includes(searchLower) || 
          patient.patientId?.toLowerCase().includes(searchLower) ||
          patient.email?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Compliance filter
      if (filters.complianceFilter !== 'all') {
        if (filters.complianceFilter === 'good' && patient.complianceStatus !== 'Good') return false;
        if (filters.complianceFilter === 'poor' && patient.complianceStatus !== 'Poor') return false;
      }
      
      // Risk filter
      if (filters.riskFilter !== 'all') {
        if (filters.riskFilter === 'high' && patient.riskLevel !== 'High') return false;
        if (filters.riskFilter === 'low' && patient.riskLevel !== 'Low') return false;
        if (filters.riskFilter === 'medium' && patient.riskLevel !== 'Medium') return false;
      }
      
      return true;
    });
  }, [filters, patients]);

  // Real summary metrics from actual patient data
  const summaryMetrics = useMemo(() => {
    const totalPatients = patients.length;
    
    // Calculate average comprehensive adherence
    let overallAdherence = 0;
    if (patients.length > 0) {
      const totalAdherence = patients.reduce((sum, p) => sum + (p.adherenceRate || 0), 0);
      overallAdherence = Math.round(totalAdherence / patients.length);
    }
    
    const activeAlerts = realAlerts.length;
    const criticalAlerts = realAlerts.filter(a => a.priority === 'critical').length;
    
    return [
      {
        id: 'total-patients',
        title: 'Total Patients',
        value: totalPatients,
        description: 'Patients assigned to you',
        trend: totalPatients > 0 ? 'stable' : 'none'
      },
      {
        id: 'overall-adherence',
        title: 'Overall Adherence',
        value: overallAdherence,
        unit: '%',
        description: 'Medications, labs, and vitals combined',
        trend: overallAdherence >= 70 ? 'up' : overallAdherence >= 50 ? 'stable' : 'down'
      },
      {
        id: 'active-alerts',
        title: 'Active Alerts',
        value: activeAlerts,
        description: `${criticalAlerts} critical alerts`,
        trend: activeAlerts > 0 ? 'down' : 'stable'
      },
      {
        id: 'high-risk-patients',
        title: 'High Risk Patients',
        value: patients.filter(p => p.riskLevel === 'High').length,
        description: 'Patients requiring immediate attention',
        trend: 'stable'
      }
    ];
  }, [patients, realAlerts]);

  // Event handlers
  const handlePatientClick = (patient) => {
    sessionStorage.setItem('selectedPatientProfile', patient.id);
    window.location.href = `/patient-profile?id=${patient.id}`;
  };

  const handleBulkMessage = (selectedPatients, messageType) => {
    console.log(`Sending ${messageType} to ${selectedPatients.length} patients`);
    alert(`Bulk message feature coming soon! Will send ${messageType} to ${selectedPatients.length} patients.`);
  };

  const handleAlertAction = (alertId, action) => {
    console.log(`Handling alert ${alertId} with action ${action.type}`);
    
    const alert = realAlerts.find(a => a.id === alertId);
    if (!alert) return;
    
    if (action.type === 'call-patient') {
      alert(`Initiating call to ${alert.patientName}...`);
    } else if (action.type === 'schedule-appointment') {
      alert(`Opening appointment scheduler for ${alert.patientName}...`);
    }
  };

  const handleDismissAlert = (alertId) => {
    setRealAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleMetricClick = (metric) => {
    console.log(`Metric clicked: ${metric.id}`);
    
    if (metric.id === 'total-patients') {
      setActiveTab('patients');
    } else if (metric.id === 'active-alerts') {
      const alertsPanel = document.querySelector('[data-component="emergency-alerts"]');
      if (alertsPanel) {
        alertsPanel.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (metric.id === 'overall-adherence') {
      setActiveTab('analytics');
    }
  };

  // Tab items for navigation
  const tabItems = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'patients', label: 'Patients', icon: 'Users' },
    { id: 'messages', label: 'Messages', icon: 'MessageCircle' },
    { id: 'vitals', label: 'Patient Vitals', icon: 'Activity' },
    { id: 'reports', label: 'Reports', icon: 'FileText' },
    { id: 'analytics', label: 'Analytics', icon: 'TrendingUp' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="text-text-primary">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EmergencyAlertBanner 
        userRole={user?.role} 
        alerts={realAlerts}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BreadcrumbNavigation 
          items={[
            { label: 'Dashboard', href: '/doctor-dashboard', current: true }
          ]} 
        />
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Doctor Dashboard
          </h1>
          <p className="text-text-secondary">
            {user?.name ? `Welcome back, ${user.name}` : 'Monitor patient adherence and vitals'} • Comprehensive health tracking
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border mb-6">
          <nav className="flex space-x-8">
            {tabItems?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-medical ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <DoctorDashboardOverview
              patients={patients}
              summaryMetrics={summaryMetrics}
              realAlerts={realAlerts}
              onPatientClick={handlePatientClick}
              onViewAllPatients={() => setActiveTab('patients')}
              onViewAllAlerts={() => {
                const alertsPanel = document.querySelector('[data-component="emergency-alerts"]');
                if (alertsPanel) alertsPanel.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'patients' && (
            <div className="bg-surface border border-border rounded-lg">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Patient Management ({patients.length} Total Patients)
                </h2>
                <FilterControls 
                  onFiltersChange={setFilters}
                  patientCount={filteredPatients.length}
                  totalPatients={patients.length}
                  currentFilters={filters}
                />
              </div>
              
              <PatientListTable 
                patients={filteredPatients}
                onPatientClick={handlePatientClick}
                onBulkMessage={handleBulkMessage}
                selectedPatients={selectedPatients}
                onPatientSelect={setSelectedPatients}
              />
              
              {patients.length === 0 && (
                <div className="p-12 text-center">
                  <Icon name="Users" size={48} className="mx-auto text-text-secondary/50 mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    No Patients Assigned
                  </h3>
                  <p className="text-text-secondary">
                    You don't have any patients assigned to you yet. Contact your administrator to assign patients.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && <DoctorMessaging />}

          {activeTab === 'vitals' && (
            <div className="space-y-6">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <PatientVitalsPanel key={patient.id} selectedPatient={patient} />
                ))
              ) : (
                <div className="bg-surface border border-border rounded-lg p-12 text-center">
                  <Icon name="Activity" size={48} className="mx-auto text-text-secondary/50 mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    No Patient Vitals Available
                  </h3>
                  <p className="text-text-secondary">
                    No patients with vitals data found. Patients need to sync their health data via Google Fit.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && <AnalysisReportsPanel />}

          {activeTab === 'analytics' && <PatientAnalyticsRealTime />}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

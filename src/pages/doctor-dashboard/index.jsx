import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import EmergencyAlertBanner from '../../components/ui/EmergencyAlertBanner';
import Header from '../../components/ui/Header';
import SummaryMetricsCards from './components/SummaryMetricsCards';
import FilterControls from './components/FilterControls';
import PatientListTable from './components/PatientListTable';
import EmergencyAlertsPanel from './components/EmergencyAlertsPanel';
import PatientVitalsPanel from './components/PatientVitalsPanel'; // NEW IMPORT
import AnalysisReportsPanel from './components/AnalysisReportsPanel';
import QuickActionsPanel from './components/QuickActionsPanel';
import Icon from '../../components/AppIcon';

const DoctorDashboard = () => {
  const { user, isLoading } = useAuth();

  // Add active tab state for navigation
  const [activeTab, setActiveTab] = useState('overview');

  // Real patient data - only one patient
  const [realPatients, setRealPatients] = useState([]);
  const [realAlerts, setRealAlerts] = useState([]);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    complianceFilter: 'all',
    riskFilter: 'all',
    dateRange: { start: '', end: '' }
  });

  // Load real patient data
  useEffect(() => {
    // Get real data from localStorage
    const patientMedicines = JSON.parse(localStorage.getItem('patientMedicines') || '[]');
    const adherenceReports = JSON.parse(localStorage.getItem('adherenceReports') || '[]');
    
    // Filter for our one real patient
    const patientId = 'patient_123'; // Updated to match your patient portal
    const realMedicines = patientMedicines.filter(med => med.patientId === patientId);
    const patientAdherence = adherenceReports.filter(report => report.patientId === patientId);
    
    // Calculate real adherence rate
    let adherenceRate = 0;
    if (patientAdherence.length > 0) {
      const taken = patientAdherence.filter(report => report.medicationTaken).length;
      adherenceRate = Math.round((taken / patientAdherence.length) * 100);
    }
    
    // Create real patient object
    const realPatient = {
      id: 'patient_123', // Updated to match
      patientId: 'PT-2024-001',
      name: 'Rakesh Sharma',
      age: 45,
      gender: 'Male',
      dischargeDate: '2024-01-15',
      adherenceRate: adherenceRate,
      complianceStatus: adherenceRate >= 70 ? 'Good' : 'Poor',
      riskLevel: adherenceRate >= 70 ? 'Low' : 'High',
      lastActivity: new Date().toISOString(),
      medications: realMedicines.map(med => med.medicineList || 'Prescribed medication'),
      contactInfo: {
        phone: '+1 555 123-4567',
        email: 'john.doe@email.com'
      }
    };

    setRealPatients([realPatient]);

    // Generate real alerts only if there are issues
    const alerts = [];
    if (adherenceRate < 70 && adherenceRate > 0) {
      alerts.push({
        id: 'real-alert-001',
        type: 'medication',
        priority: adherenceRate < 50 ? 'critical' : 'high',
        title: 'Medication Adherence Alert',
        message: `${realPatient.name} has ${adherenceRate}% medication adherence rate`,
        patientName: realPatient.name,
        patientId: realPatient.patientId,
        timestamp: new Date().toISOString(),
        active: true,
        roles: ['doctor', 'admin'],
        actions: [
          { type: 'call-patient', label: 'Call Patient', primary: true }
        ]
      });
    }
    setRealAlerts(alerts);
  }, []);

  // Filter patients (will only have one)
  const filteredPatients = useMemo(() => {
    return realPatients.filter(patient => {
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (!patient.name.toLowerCase().includes(searchLower) && 
            !patient.patientId.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      return true;
    });
  }, [filters, realPatients]);

  // Real summary metrics
  const summaryMetrics = useMemo(() => {
    const totalPatients = filteredPatients.length;
    const overallAdherence = filteredPatients.length > 0 ? filteredPatients[0].adherenceRate : 0;
    const activeAlerts = realAlerts.length;
    
    return [
      {
        id: 'total-patients',
        title: 'Total Patients',
        value: totalPatients,
        description: 'Real patients monitored'
      },
      {
        id: 'overall-adherence',
        title: 'Overall Adherence',
        value: overallAdherence,
        unit: '%',
        description: 'Real medication adherence from patient reports'
      },
      {
        id: 'active-alerts',
        title: 'Active Alerts',
        value: activeAlerts,
        description: 'Real alerts based on patient data'
      }
    ];
  }, [filteredPatients, realAlerts]);

  // Event handlers
  const handlePatientClick = (patient) => {
    window.location.href = `/patient-profile?id=${patient.id}`;
  };

  const handleBulkMessage = (patients, messageType) => {
    console.log(`Sending ${messageType} to ${patients.length} patients`);
  };

  const handleAlertAction = (alertId, action) => {
    console.log(`Handling alert ${alertId} with action ${action.type}`);
  };

  const handleDismissAlert = (alertId) => {
    setRealAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleMetricClick = (metric) => {
    console.log(`Metric clicked: ${metric.type}`);
  };

  // Tab items for navigation
  const tabItems = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'patients', label: 'Patients', icon: 'Users' },
    { id: 'vitals', label: 'Patient Vitals', icon: 'Activity' }, // NEW VITALS TAB
    { id: 'reports', label: 'Reports', icon: 'FileText' },
    { id: 'analytics', label: 'Analytics', icon: 'TrendingUp' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
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
            Monitor patient adherence and vitals - Real data only
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
                    ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <SummaryMetricsCards 
                metrics={summaryMetrics}
                onMetricClick={handleMetricClick}
              />

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-surface border border-border rounded-lg">
                    <div className="p-6 border-b border-border">
                      <h2 className="text-lg font-semibold text-text-primary mb-4">
                        Patient Overview - Real Data Only
                      </h2>
                      <FilterControls 
                        onFiltersChange={setFilters}
                        patientCount={filteredPatients.length}
                        totalPatients={realPatients.length}
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
                  </div>

                  <AnalysisReportsPanel />
                </div>

                <div className="space-y-6">
                  <EmergencyAlertsPanel 
                    alerts={realAlerts}
                    onAlertAction={handleAlertAction}
                    onDismissAlert={handleDismissAlert}
                  />
                  
                  <QuickActionsPanel />
                </div>
              </div>
            </>
          )}

          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <div className="bg-surface border border-border rounded-lg">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Patient Management
                </h2>
                <FilterControls 
                  onFiltersChange={setFilters}
                  patientCount={filteredPatients.length}
                  totalPatients={realPatients.length}
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
            </div>
          )}

          {/* NEW VITALS TAB */}
          {activeTab === 'vitals' && (
            <div className="space-y-6">
              <PatientVitalsPanel selectedPatient={filteredPatients[0]} />
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <AnalysisReportsPanel />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Patient Analytics
              </h2>
              <p className="text-text-secondary">
                Advanced analytics and insights coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

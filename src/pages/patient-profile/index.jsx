import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PatientHeader from './components/PatientHeader';
import MedicationTimeline from './components/MedicationTimeline';
import LabReportsViewer from './components/LabReportsViewer';
import HealthLogsChart from './components/HealthLogsChart';
import { useAuth } from '../../contexts/AuthContext';
import { getUserById } from '../../services/localStorageUserManagement';

const PatientProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Real data states
  const [medications, setMedications] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);
  const [adherenceData, setAdherenceData] = useState(null);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = () => {
    try {
      // Get patient ID from URL or sessionStorage
      const urlParams = new URLSearchParams(window.location.search);
      const patientId = urlParams.get('id') || sessionStorage.getItem('selectedPatientProfile');
      
      if (!patientId) {
        alert('No patient selected');
        navigate('/doctor-dashboard');
        return;
      }

      // Load patient from user management system
      const patientData = getUserById(patientId);
      
      if (!patientData) {
        alert('Patient not found');
        navigate('/doctor-dashboard');
        return;
      }

      setPatient(patientData);

      // Load all related data from localStorage
      const patientMedicines = JSON.parse(localStorage.getItem('patientMedicines') || '[]');
      const adherenceReports = JSON.parse(localStorage.getItem('adherenceReports') || '[]');
      const labReportsData = JSON.parse(localStorage.getItem('labReports') || '[]');
      const vitalsData = JSON.parse(localStorage.getItem('patientVitals') || '[]');

      // Filter data for this patient
      const filteredMedicines = patientMedicines.filter(m => m.patientId === patientId);
      const filteredAdherence = adherenceReports.filter(r => r.patientId === patientId);
      const filteredLabs = labReportsData.filter(l => l.patientId === patientId);
      const filteredVitals = vitalsData.filter(v => v.patientId === patientId);

      // Calculate adherence
      let adherenceRate = 0;
      if (filteredAdherence.length > 0) {
        const taken = filteredAdherence.filter(r => r.medicationTaken).length;
        adherenceRate = Math.round((taken / filteredAdherence.length) * 100);
      }

      setAdherenceData({
        rate: adherenceRate,
        totalDoses: filteredAdherence.length,
        takenDoses: filteredAdherence.filter(r => r.medicationTaken).length,
        missedDoses: filteredAdherence.filter(r => !r.medicationTaken).length
      });

      // Format medications
      const formattedMeds = filteredMedicines.map((med, index) => ({
        id: `med-${index}`,
        name: med.medicineList || 'Prescribed Medication',
        dosage: med.dosage || '10mg',
        frequency: med.frequency || 'Once daily',
        prescribedDate: med.timestamp || new Date().toISOString(),
        adherence: adherenceRate,
        status: 'active'
      }));

      setMedications(formattedMeds);
      setLabReports(filteredLabs);
      setHealthLogs(filteredVitals);
      setLoading(false);

    } catch (error) {
      console.error('Error loading patient data:', error);
      alert('Error loading patient data');
      navigate('/doctor-dashboard');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'medications', label: 'Medications', icon: 'Pill', count: medications.length },
    { id: 'labs', label: 'Lab Reports', icon: 'FileText', count: labReports.length },
    { id: 'vitals', label: 'Health Logs', icon: 'Activity', count: healthLogs.length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Patient Not Found</h2>
          <Button onClick={() => navigate('/doctor-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BreadcrumbNavigation 
          items={[
            { label: 'Dashboard', path: '/doctor-dashboard' },
            { label: 'Patients', path: '/doctor-dashboard?tab=patients' },
            { label: patient.name, current: true }
          ]} 
          onBack={() => navigate('/doctor-dashboard')}
        />

        {/* Patient Header Card */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">
                  {patient.name?.charAt(0)}
                </span>
              </div>

              {/* Patient Info */}
              <div>
                <h1 className="text-2xl font-bold text-text-primary">{patient.name}</h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-text-secondary">
                  <span>ID: {patient.patientId || patient.id}</span>
                  <span>•</span>
                  <span>{patient.age || 'N/A'} years</span>
                  <span>•</span>
                  <span className="capitalize">{patient.gender || 'N/A'}</span>
                  <span>•</span>
                  <span>Blood: {patient.bloodGroup || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Icon name="Phone" size={14} className="text-text-secondary" />
                  <span className="text-sm text-text-secondary">{patient.phone || 'N/A'}</span>
                  <span className="mx-2">•</span>
                  <Icon name="Mail" size={14} className="text-text-secondary" />
                  <span className="text-sm text-text-secondary">{patient.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="MessageCircle"
                onClick={() => {
                  sessionStorage.setItem('selectedPatientId', patient.id);
                  navigate('/doctor-dashboard?tab=messages');
                }}
              >
                Message
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Phone"
                onClick={() => alert(`Calling ${patient.name}...`)}
              >
                Call
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <Icon name="Pill" size={20} className="text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-text-primary">{medications.length}</div>
              <div className="text-xs text-text-secondary">Medications</div>
            </div>
            <div className="text-center">
              <Icon name="TrendingUp" size={20} className="text-success mx-auto mb-1" />
              <div className="text-2xl font-bold text-text-primary">
                {adherenceData?.rate || 0}%
              </div>
              <div className="text-xs text-text-secondary">Adherence</div>
            </div>
            <div className="text-center">
              <Icon name="FileText" size={20} className="text-warning mx-auto mb-1" />
              <div className="text-2xl font-bold text-text-primary">{labReports.length}</div>
              <div className="text-xs text-text-secondary">Lab Reports</div>
            </div>
            <div className="text-center">
              <Icon name="Activity" size={20} className="text-error mx-auto mb-1" />
              <div className="text-2xl font-bold text-text-primary">{healthLogs.length}</div>
              <div className="text-xs text-text-secondary">Vital Readings</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-medical ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Adherence Card */}
                  <div className="bg-muted/30 rounded-lg p-6">
                    <h3 className="font-semibold text-text-primary mb-4">Medication Adherence</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Taken</span>
                        <span className="font-medium text-success">{adherenceData?.takenDoses || 0} doses</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Missed</span>
                        <span className="font-medium text-error">{adherenceData?.missedDoses || 0} doses</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-3 mt-4">
                        <div
                          className="bg-success h-3 rounded-full transition-all"
                          style={{ width: `${adherenceData?.rate || 0}%` }}
                        />
                      </div>
                      <div className="text-center text-2xl font-bold text-text-primary">
                        {adherenceData?.rate || 0}%
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-muted/30 rounded-lg p-6">
                    <h3 className="font-semibold text-text-primary mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {healthLogs.slice(0, 5).map((log, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">Vitals Synced</span>
                          <span className="text-text-primary">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {healthLogs.length === 0 && (
                        <p className="text-text-secondary text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'medications' && (
              <div>
                {medications.length > 0 ? (
                  <div className="space-y-4">
                    {medications.map(med => (
                      <div key={med.id} className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-text-primary">{med.name}</h4>
                            <p className="text-sm text-text-secondary mt-1">
                              {med.dosage} - {med.frequency}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-primary">{med.adherence}%</div>
                            <div className="text-xs text-text-secondary">Adherence</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon name="Pill" size={48} className="text-text-secondary/30 mx-auto mb-3" />
                    <p className="text-text-secondary">No medications found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'labs' && (
              <div>
                {labReports.length > 0 ? (
                  <div className="space-y-4">
                    {labReports.map((report, index) => (
                      <div key={index} className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-text-primary">Lab Report</h4>
                            <p className="text-sm text-text-secondary mt-1">
                              {new Date(report.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" iconName="Eye">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon name="FileText" size={48} className="text-text-secondary/30 mx-auto mb-3" />
                    <p className="text-text-secondary">No lab reports found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vitals' && (
              <div>
                {healthLogs.length > 0 ? (
                  <div className="space-y-4">
                    {healthLogs.map((log, index) => (
                      <div key={index} className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-text-primary">Vital Signs</h4>
                            <p className="text-sm text-text-secondary mt-1">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            {log.data?.heartRate && <div>HR: {log.data.heartRate} bpm</div>}
                            {log.data?.oxygenSaturation && <div>SpO2: {log.data.oxygenSaturation}%</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon name="Activity" size={48} className="text-text-secondary/30 mx-auto mb-3" />
                    <p className="text-text-secondary">No vital signs data found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;

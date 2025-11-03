import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PatientVitalsPanel = ({ selectedPatient }) => {
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);

  useEffect(() => {
    if (selectedPatient) {
      loadPatientVitals();
      loadEmergencyAlerts();
    }
  }, [selectedPatient]);

  const loadPatientVitals = () => {
    const allVitals = JSON.parse(localStorage.getItem('patientVitals') || '[]');
    const patientVitals = allVitals.filter(v => v.patientId === selectedPatient.id);
    setVitalsHistory(patientVitals.slice(-10)); // Last 10 readings
  };

  const loadEmergencyAlerts = () => {
    const alerts = JSON.parse(localStorage.getItem('doctorAlerts') || '[]');
    const patientAlerts = alerts.filter(a => a.patientId === selectedPatient.id && a.type === 'patient_vitals');
    setEmergencyAlerts(patientAlerts.slice(-5)); // Last 5 alerts
  };

  const getVitalStatusColor = (vital, value) => {
    const numValue = parseFloat(value);
    if (!numValue) return 'text-gray-500';

    switch (vital) {
      case 'heartRate':
        if (numValue < 60 || numValue > 100) return 'text-red-600';
        return 'text-green-600';
      case 'oxygenSaturation':
        if (numValue < 95) return 'text-red-600';
        return 'text-green-600';
      default:
        return 'text-gray-700';
    }
  };

  const exportVitalsReport = () => {
    const report = {
      patient: selectedPatient.name,
      reportDate: new Date().toLocaleDateString(),
      vitalsHistory,
      emergencyAlerts
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedPatient.name}_vitals_report.json`;
    link.click();
  };

  if (!selectedPatient) {
    return (
      <div className="bg-surface rounded-lg border border-border p-6">
        <p className="text-text-secondary text-center">Select a patient to view vitals</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          {selectedPatient.name} - Real-time Vitals
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={exportVitalsReport}
          iconName="Download"
          iconPosition="left"
        >
          Export Report
        </Button>
      </div>

      {/* Emergency Alerts */}
      {emergencyAlerts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-error mb-3">⚠️ Emergency Alerts</h3>
          <div className="space-y-2">
            {emergencyAlerts.map(alert => (
              <div key={alert.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900">{alert.title}</p>
                    <p className="text-sm text-red-700">{alert.message}</p>
                  </div>
                  <span className="text-xs text-red-600">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Vitals */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-text-primary">Recent Vitals</h3>
        
        {vitalsHistory.length > 0 ? (
          <div className="space-y-3">
            {vitalsHistory.map((vital, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(vital.timestamp).toLocaleString()}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {vital.data.source === 'manual_google_fit' ? 'Google Fit + Manual' : 'Manual'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vital.data.heartRate && (
                    <div className="flex items-center space-x-2">
                      <Icon name="Heart" size={16} className="text-red-500" />
                      <div>
                        <p className="text-xs text-gray-600">Heart Rate</p>
                        <p className={`font-medium ${getVitalStatusColor('heartRate', vital.data.heartRate)}`}>
                          {vital.data.heartRate} bpm
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {vital.data.steps && (
                    <div className="flex items-center space-x-2">
                      <Icon name="Activity" size={16} className="text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-600">Steps</p>
                        <p className="font-medium text-gray-700">{vital.data.steps}</p>
                      </div>
                    </div>
                  )}
                  
                  {vital.data.weight && (
                    <div className="flex items-center space-x-2">
                      <Icon name="Scale" size={16} className="text-green-500" />
                      <div>
                        <p className="text-xs text-gray-600">Weight</p>
                        <p className="font-medium text-gray-700">{vital.data.weight} lbs</p>
                      </div>
                    </div>
                  )}
                  
                  {vital.data.oxygenSaturation && (
                    <div className="flex items-center space-x-2">
                      <Icon name="Activity" size={16} className="text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-600">O2 Sat</p>
                        <p className={`font-medium ${getVitalStatusColor('oxygenSaturation', vital.data.oxygenSaturation)}`}>
                          {vital.data.oxygenSaturation}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Activity" size={48} className="mx-auto mb-4 opacity-50" />
            <p>No vitals data available</p>
            <p className="text-sm">Patient needs to log vitals or connect Google Fit</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientVitalsPanel;

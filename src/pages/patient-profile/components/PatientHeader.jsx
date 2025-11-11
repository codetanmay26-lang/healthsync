import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PatientHeader = ({ patient, onEditProfile, onSendMessage, onEmergencyContact }) => {
  // Load real data for patient metrics
  const loadRealPatientMetrics = () => {
    if (!patient?.id) return { adherenceRate: 0, complianceStatus: 'Unknown', riskLevel: 'Low', lastActivity: 'N/A' };
    
    const adherenceReports = JSON.parse(localStorage.getItem('adherenceReports') || '[]');
    const patientAdherence = adherenceReports.filter(report => report.patientId === patient.id);
    
    let adherenceRate = 0;
    if (patientAdherence.length > 0) {
      const taken = patientAdherence.filter(report => report.medicationTaken).length;
      adherenceRate = Math.round((taken / patientAdherence.length) * 100);
    }
    
    // Determine compliance and risk based on real data
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
    
    // Get last activity from adherence reports
    const lastActivity = patientAdherence.length > 0 
      ? new Date(patientAdherence[patientAdherence.length - 1].timestamp).toLocaleDateString()
      : 'No recent activity';
    
    return { adherenceRate, complianceStatus, riskLevel, lastActivity };
  };

  const realMetrics = loadRealPatientMetrics();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'excellent': return 'bg-success10 text-success';
      case 'good': return 'bg-primary10 text-primary';
      case 'fair': return 'bg-warning10 text-warning';
      case 'poor': return 'bg-error10 text-error';
      default: return 'bg-muted text-text-secondary';
    }
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  // Discharge patient function
  const handleDischargePatient = () => {
    if (window.confirm(`Are you sure you want to discharge ${patient?.name}? This will remove them from the hospital management system.`)) {
      // Remove patient from all localStorage data
      localStorage.removeItem('patientMedicines');
      localStorage.removeItem('adherenceReports');
      localStorage.removeItem('labReports');
      localStorage.removeItem('healthLogs');
      localStorage.removeItem('doctorAnalyses');
      
      alert(`${patient?.name} has been discharged from the hospital management system.`);
      
      // Navigate back to doctor dashboard
      window.location.href = '/doctor-dashboard';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {/* Patient Avatar */}
          <div className="relative">
            <Image 
              src={patient?.avatar}
              alt={patient?.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(realMetrics.complianceStatus)}`}>
              <Icon 
                name={realMetrics.complianceStatus === 'Excellent' ? 'Check' : realMetrics.complianceStatus === 'Good' ? 'Eye' : 'AlertTriangle'}
                size={12}
              />
            </div>
          </div>

          {/* Patient Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-semibold text-text-primary">{patient?.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(realMetrics.complianceStatus)}`}>
                {realMetrics.complianceStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">Patient ID</span>
                <p className="font-medium text-text-primary">{patient?.patientId}</p>
              </div>
              <div>
                <span className="text-text-secondary">Age</span>
                <p className="font-medium text-text-primary">{patient?.age} years</p>
              </div>
              <div>
                <span className="text-text-secondary">Gender</span>
                <p className="font-medium text-text-primary capitalize">{patient?.gender}</p>
              </div>
              <div>
                <span className="text-text-secondary">Blood Type</span>
                <p className="font-medium text-text-primary">{patient?.bloodType}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-3">
              <div>
                <span className="text-text-secondary">Phone</span>
                <p className="font-medium text-text-primary">{patient?.phone}</p>
              </div>
              <div>
                <span className="text-text-secondary">Email</span>
                <p className="font-medium text-text-primary">{patient?.email}</p>
              </div>
              <div>
                <span className="text-text-secondary">Emergency Contact</span>
                <p className="font-medium text-text-primary">{patient?.emergencyContact?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            size="sm"
            iconName="MessageCircle"
            iconPosition="left"
            onClick={onSendMessage}
          >
            Message
          </Button>
          <Button 
            variant="outline"
            size="sm"
            iconName="Edit"
            iconPosition="left"
            onClick={onEditProfile}
          >
            Edit Profile
          </Button>
          <Button 
            variant="destructive"
            size="sm"
            iconName="UserX"
            iconPosition="left"
            onClick={handleDischargePatient}
          >
            Discharge
          </Button>
          <Button 
            variant="destructive"
            size="sm"
            iconName="Phone"
            iconPosition="left"
            onClick={onEmergencyContact}
          >
            Emergency
          </Button>
        </div>
      </div>

      {/* Real Health Metrics - Synced Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Icon name="TrendingUp" size={16} className="text-primary" />
            <span className="text-sm text-text-secondary">Adherence</span>
          </div>
          <p className="text-lg font-semibold text-text-primary">{realMetrics.adherenceRate}%</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Icon name="Shield" size={16} className="text-success" />
            <span className="text-sm text-text-secondary">Compliance</span>
          </div>
          <p className={`text-lg font-semibold ${getStatusColor(realMetrics.complianceStatus).replace('bg-', 'text-').replace('10', '')}`}>
            {realMetrics.complianceStatus}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Icon name="AlertTriangle" size={16} className={getRiskColor(realMetrics.riskLevel)} />
            <span className="text-sm text-text-secondary">Risk Level</span>
          </div>
          <p className={`text-lg font-semibold capitalize ${getRiskColor(realMetrics.riskLevel)}`}>
            {realMetrics.riskLevel}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Icon name="Clock" size={16} className="text-text-secondary" />
            <span className="text-sm text-text-secondary">Last Activity</span>
          </div>
          <p className="text-lg font-semibold text-text-primary">{realMetrics.lastActivity}</p>
        </div>
      </div>
    </div>
  );
};

export default PatientHeader;

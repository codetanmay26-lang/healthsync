import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MedicationTimeline = ({ medications = [], onMedicationTaken, onMedicationSkipped }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const mockMedications = [
    {
      id: 1,
      name: "Metformin",
      dosage: "500mg",
      time: "08:00",
      status: "taken",
      type: "tablet",
      instructions: "Take with breakfast",
      nextDose: new Date(2025, 8, 8, 8, 0),
      adherenceRate: 95
    },
    {
      id: 2,
      name: "Lisinopril",
      dosage: "10mg",
      time: "08:00",
      status: "pending",
      type: "tablet",
      instructions: "Take on empty stomach",
      nextDose: new Date(2025, 8, 8, 8, 0),
      adherenceRate: 88
    },
    {
      id: 3,
      name: "Atorvastatin",
      dosage: "20mg",
      time: "20:00",
      status: "upcoming",
      type: "tablet",
      instructions: "Take with dinner",
      nextDose: new Date(2025, 8, 8, 20, 0),
      adherenceRate: 92
    },
    {
      id: 4,
      name: "Insulin Glargine",
      dosage: "15 units",
      time: "22:00",
      status: "upcoming",
      type: "injection",
      instructions: "Inject subcutaneously",
      nextDose: new Date(2025, 8, 8, 22, 0),
      adherenceRate: 98
    }
  ];

  const activeMedications = medications?.length > 0 ? medications : mockMedications;

  const getStatusColor = (status) => {
    switch (status) {
      case 'taken': return 'text-success bg-success/10 border-success/20';
      case 'missed': return 'text-error bg-error/10 border-error/20';
      case 'pending': return 'text-warning bg-warning/10 border-warning/20';
      case 'upcoming': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-text-secondary bg-muted border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'taken': return 'CheckCircle';
      case 'missed': return 'XCircle';
      case 'pending': return 'Clock';
      case 'upcoming': return 'Calendar';
      default: return 'Circle';
    }
  };

  const getMedicationIcon = (type) => {
    switch (type) {
      case 'tablet': return 'Pill';
      case 'injection': return 'Syringe';
      case 'liquid': return 'Droplets';
      default: return 'Pill';
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString?.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleMedicationAction = (medication, action) => {
    if (action === 'taken' && onMedicationTaken) {
      onMedicationTaken(medication?.id);
    } else if (action === 'skipped' && onMedicationSkipped) {
      onMedicationSkipped(medication?.id);
    }
  };

  const todayMedications = activeMedications?.filter(med => {
    const today = new Date();
    const medDate = new Date(med.nextDose);
    return medDate?.toDateString() === today?.toDateString();
  });

  const upcomingMedications = todayMedications?.filter(med => med?.status === 'upcoming' || med?.status === 'pending');
  const completedMedications = todayMedications?.filter(med => med?.status === 'taken');

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Today's Medications</h2>
          <p className="text-sm text-text-secondary mt-1">
            {completedMedications?.length} of {todayMedications?.length} medications taken
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--color-muted)"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--color-success)"
                strokeWidth="2"
                strokeDasharray={`${(completedMedications?.length / todayMedications?.length) * 100}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-text-primary">
                {Math.round((completedMedications?.length / todayMedications?.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Upcoming Medications */}
      {upcomingMedications?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <Icon name="Clock" size={20} className="mr-2 text-warning" />
            Upcoming Doses
          </h3>
          <div className="space-y-3">
            {upcomingMedications?.map((medication) => (
              <div
                key={medication?.id}
                className={`p-4 rounded-lg border-2 ${getStatusColor(medication?.status)} transition-medical`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name={getMedicationIcon(medication?.type)} size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">{medication?.name}</h4>
                      <p className="text-sm text-text-secondary">{medication?.dosage} • {formatTime(medication?.time)}</p>
                      <p className="text-xs text-text-secondary mt-1">{medication?.instructions}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMedicationAction(medication, 'skipped')}
                      className="text-error border-error hover:bg-error/10"
                    >
                      Skip
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleMedicationAction(medication, 'taken')}
                      iconName="Check"
                      iconPosition="left"
                      iconSize={16}
                    >
                      Take Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* All Medications Timeline */}
      <div>
        <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
          <Icon name="Calendar" size={20} className="mr-2 text-primary" />
          Today's Schedule
        </h3>
        <div className="space-y-3">
          {todayMedications?.sort((a, b) => a?.time?.localeCompare(b?.time))?.map((medication, index) => (
            <div key={medication?.id} className="flex items-center space-x-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 ${
                  medication?.status === 'taken' ? 'bg-success border-success' :
                  medication?.status === 'pending' ? 'bg-warning border-warning' :
                  medication?.status === 'missed'? 'bg-error border-error' : 'bg-primary border-primary'
                }`} />
                {index < todayMedications?.length - 1 && (
                  <div className="w-0.5 h-12 bg-border mt-2" />
                )}
              </div>

              {/* Medication Card */}
              <div className="flex-1 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon name={getMedicationIcon(medication?.type)} size={16} className="text-text-secondary" />
                    <div>
                      <h5 className="font-medium text-text-primary">{medication?.name}</h5>
                      <p className="text-sm text-text-secondary">{medication?.dosage}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-text-primary">
                      {formatTime(medication?.time)}
                    </span>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(medication?.status)}`}>
                      <Icon name={getStatusIcon(medication?.status)} size={12} />
                      <span className="capitalize">{medication?.status}</span>
                    </div>
                  </div>
                </div>

                {/* Adherence Rate */}
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs text-text-secondary">Adherence:</span>
                  <div className="flex-1 bg-background rounded-full h-1.5">
                    <div 
                      className="bg-success h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${medication?.adherenceRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-text-primary">{medication?.adherenceRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {todayMedications?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Calendar" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No medications scheduled</h3>
          <p className="text-text-secondary">You have no medications scheduled for today.</p>
        </div>
      )}
    </div>
  );
};

export default MedicationTimeline;
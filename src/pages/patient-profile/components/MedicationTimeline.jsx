import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MedicationTimeline = ({ medications, onEditMedication, onAddMedication }) => {
  const [selectedMedication, setSelectedMedication] = useState(null);

  const getAdherenceColor = (percentage) => {
    if (percentage >= 90) return 'text-success bg-success/10';
    if (percentage >= 70) return 'text-warning bg-warning/10';
    return 'text-error bg-error/10';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'CheckCircle';
      case 'paused': return 'PauseCircle';
      case 'discontinued': return 'XCircle';
      default: return 'Clock';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'paused': return 'text-warning';
      case 'discontinued': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="Pill" size={24} className="text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">Current Medications</h2>
          </div>
          <Button
            variant="default"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={onAddMedication}
          >
            Add Medication
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {medications?.map((medication) => (
            <div
              key={medication?.id}
              className={`border rounded-lg p-4 transition-medical cursor-pointer hover:shadow-medical-sm ${
                selectedMedication?.id === medication?.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setSelectedMedication(medication)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-text-primary">{medication?.name}</h3>
                    <span className="text-sm text-text-secondary">
                      {medication?.dosage} • {medication?.frequency}
                    </span>
                    <Icon 
                      name={getStatusIcon(medication?.status)} 
                      size={16} 
                      className={getStatusColor(medication?.status)} 
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-text-secondary">Prescribed:</span>
                      <p className="font-medium text-text-primary">{medication?.prescribedDate}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Duration:</span>
                      <p className="font-medium text-text-primary">{medication?.duration}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Adherence:</span>
                      <p className={`font-medium ${getAdherenceColor(medication?.adherence)?.split(' ')?.[0]}`}>
                        {medication?.adherence}%
                      </p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Next Dose:</span>
                      <p className="font-medium text-text-primary">{medication?.nextDose}</p>
                    </div>
                  </div>

                  {/* Adherence Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-text-secondary">Adherence Progress</span>
                      <span className="font-medium text-text-primary">{medication?.adherence}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          medication?.adherence >= 90 ? 'bg-success' :
                          medication?.adherence >= 70 ? 'bg-warning' : 'bg-error'
                        }`}
                        style={{ width: `${medication?.adherence}%` }}
                      />
                    </div>
                  </div>

                  {/* AI Warnings */}
                  {medication?.aiWarnings && medication?.aiWarnings?.length > 0 && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-3">
                      <div className="flex items-start space-x-2">
                        <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-warning mb-1">AI Alert</p>
                          {medication?.aiWarnings?.map((warning, index) => (
                            <p key={index} className="text-sm text-text-secondary">{warning}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <p className="text-sm text-text-secondary">{medication?.instructions}</p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Edit"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onEditMedication(medication);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="MoreVertical"
                    onClick={(e) => e?.stopPropagation()}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              {selectedMedication?.id === medication?.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">Recent Doses</h4>
                      <div className="space-y-2">
                        {medication?.recentDoses?.map((dose, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary">{dose?.time}</span>
                            <div className="flex items-center space-x-2">
                              <Icon 
                                name={dose?.taken ? 'CheckCircle' : 'XCircle'} 
                                size={14} 
                                className={dose?.taken ? 'text-success' : 'text-error'} 
                              />
                              <span className={dose?.taken ? 'text-success' : 'text-error'}>
                                {dose?.taken ? 'Taken' : 'Missed'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">Side Effects</h4>
                      <div className="space-y-1">
                        {medication?.sideEffects?.map((effect, index) => (
                          <div key={index} className="text-sm text-text-secondary">
                            • {effect}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {medications?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Pill" size={48} className="text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Medications</h3>
            <p className="text-text-secondary mb-4">No medications have been prescribed yet.</p>
            <Button
              variant="default"
              iconName="Plus"
              iconPosition="left"
              onClick={onAddMedication}
            >
              Add First Medication
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationTimeline;
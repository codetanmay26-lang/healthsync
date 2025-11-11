import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmergencyAlertsPanel = ({ onAlertAction, onViewDetails }) => {
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Mock emergency alerts data
    const mockAlerts = [
      {
        id: 'emergency-001',
        type: 'medication_shortage',
        severity: 'critical',
        title: 'Critical Medication Shortage',
        message: 'Insulin Glargine stock critically low - only 2 units remaining',
        timestamp: new Date(Date.now() - 300000)?.toISOString(),
        affectedPatients: 8,
        estimatedOutOfStock: '2024-12-09',
        actionRequired: 'immediate_order',
        supplier: 'DiabetesCare',
        alternativeAvailable: false,
        acknowledged: false
      },
      {
        id: 'emergency-002',
        type: 'cold_chain_breach',
        severity: 'critical',
        title: 'Cold Chain Temperature Breach',
        message: 'Refrigerator 1 temperature exceeded 8°C for 15 minutes',
        timestamp: new Date(Date.now() - 900000)?.toISOString(),
        affectedMedications: ['Insulin Glargine', 'Vaccines', 'Biologics'],
        currentTemp: 9.2,
        maxTemp: 8.0,
        duration: '15 minutes',
        actionRequired: 'immediate_inspection',
        acknowledged: false
      },
      {
        id: 'emergency-003',
        type: 'expired_medication',
        severity: 'high',
        title: 'Expired Medications Detected',
        message: '5 medication batches expired and require immediate removal',
        timestamp: new Date(Date.now() - 1800000)?.toISOString(),
        expiredItems: [
          { name: 'Amoxicillin 250mg', batch: 'AMX2024-001', quantity: 15 },
          { name: 'Ibuprofen 400mg', batch: 'IBU2024-003', quantity: 8 },
          { name: 'Aspirin 81mg', batch: 'ASP2024-007', quantity: 22 }
        ],
        totalValue: 485.50,
        actionRequired: 'quarantine_disposal',
        acknowledged: false
      },
      {
        id: 'emergency-004',
        type: 'urgent_refill',
        severity: 'high',
        title: 'Urgent Patient Refill Request',
        message: 'Patient Maria Garcia needs emergency insulin refill',
        timestamp: new Date(Date.now() - 3600000)?.toISOString(),
        patientName: 'Maria Garcia',
        patientId: 'PAT-003',
        medication: 'Insulin Glargine',
        lastDose: '2024-12-07',
        doctorName: 'Dr. James Wilson',
        contactNumber: '(555) 345-6789',
        actionRequired: 'emergency_dispense',
        acknowledged: true,
        resolvedAt: new Date(Date.now() - 1800000)?.toISOString()
      },
      {
        id: 'emergency-005',
        type: 'system_failure',
        severity: 'medium',
        title: 'Inventory System Sync Error',
        message: 'Automatic inventory sync failed - manual verification required',
        timestamp: new Date(Date.now() - 7200000)?.toISOString(),
        affectedSystems: ['Inventory Management', 'Refill Automation'],
        lastSuccessfulSync: '2024-12-07 14:30:00',
        actionRequired: 'system_check',
        acknowledged: false
      }
    ];
    setEmergencyAlerts(mockAlerts);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-error bg-error/10 border-error/20';
      case 'high': return 'text-warning bg-warning/10 border-warning/20';
      case 'medium': return 'text-primary bg-primary/10 border-primary/20';
      case 'low': return 'text-text-secondary bg-muted border-border';
      default: return 'text-text-secondary bg-muted border-border';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'medication_shortage': return 'Package';
      case 'cold_chain_breach': return 'Thermometer';
      case 'expired_medication': return 'Calendar';
      case 'urgent_refill': return 'Clock';
      case 'system_failure': return 'AlertTriangle';
      default: return 'Bell';
    }
  };

  const getActionLabel = (actionRequired) => {
    switch (actionRequired) {
      case 'immediate_order': return 'Order Now';
      case 'immediate_inspection': return 'Inspect';
      case 'quarantine_disposal': return 'Quarantine';
      case 'emergency_dispense': return 'Dispense';
      case 'system_check': return 'Check System';
      default: return 'Take Action';
    }
  };

  const filteredAlerts = emergencyAlerts?.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'active') return !alert?.acknowledged;
    if (filter === 'resolved') return alert?.acknowledged;
    return alert?.severity === filter;
  });

  const handleAcknowledgeAlert = (alertId) => {
    setEmergencyAlerts(prev => 
      prev?.map(alert => 
        alert?.id === alertId 
          ? { ...alert, acknowledged: true, acknowledgedAt: new Date()?.toISOString() }
          : alert
      )
    );
  };

  const handleAlertAction = (alert) => {
    if (onAlertAction) {
      onAlertAction(alert);
    }
    // Auto-acknowledge after action
    handleAcknowledgeAlert(alert?.id);
  };

  const activeAlerts = emergencyAlerts?.filter(alert => !alert?.acknowledged);
  const criticalAlerts = activeAlerts?.filter(alert => alert?.severity === 'critical');

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center">
            <Icon name="AlertTriangle" size={24} className="text-error mr-2" />
            Emergency Alerts
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {activeAlerts?.length} active alerts • {criticalAlerts?.length} critical
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Alerts</option>
            <option value="active">Active Only</option>
            <option value="resolved">Resolved</option>
            <option value="critical">Critical</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </div>
      {/* Critical Alerts Banner */}
      {criticalAlerts?.length > 0 && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6 breathing-alert">
          <div className="flex items-center space-x-3">
            <Icon name="AlertTriangle" size={24} className="text-error" />
            <div>
              <h3 className="font-semibold text-error">
                {criticalAlerts?.length} Critical Alert{criticalAlerts?.length > 1 ? 's' : ''} Require Immediate Attention
              </h3>
              <p className="text-sm text-error/80">
                These alerts may impact patient safety and require urgent action
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {filteredAlerts?.map((alert) => (
          <div 
            key={alert?.id} 
            className={`border rounded-lg p-4 transition-medical ${
              alert?.acknowledged ? 'opacity-60' : ''
            } ${getSeverityColor(alert?.severity)} ${
              alert?.severity === 'critical' && !alert?.acknowledged ? 'breathing-alert' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Icon name={getAlertIcon(alert?.type)} size={20} />
                  <div>
                    <h3 className="font-semibold">{alert?.title}</h3>
                    <p className="text-sm opacity-90">{alert?.message}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert?.severity)}`}>
                    {alert?.severity}
                  </span>
                </div>

                {/* Alert-specific details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                  {alert?.type === 'medication_shortage' && (
                    <>
                      <div>
                        <span className="opacity-75">Affected Patients:</span>
                        <div className="font-medium">{alert?.affectedPatients}</div>
                      </div>
                      <div>
                        <span className="opacity-75">Est. Out of Stock:</span>
                        <div className="font-medium">{new Date(alert.estimatedOutOfStock)?.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="opacity-75">Supplier:</span>
                        <div className="font-medium">{alert?.supplier}</div>
                      </div>
                      <div>
                        <span className="opacity-75">Alternative Available:</span>
                        <div className="font-medium">{alert?.alternativeAvailable ? 'Yes' : 'No'}</div>
                      </div>
                    </>
                  )}

                  {alert?.type === 'cold_chain_breach' && (
                    <>
                      <div>
                        <span className="opacity-75">Current Temp:</span>
                        <div className="font-medium">{alert?.currentTemp}°C</div>
                      </div>
                      <div>
                        <span className="opacity-75">Max Allowed:</span>
                        <div className="font-medium">{alert?.maxTemp}°C</div>
                      </div>
                      <div>
                        <span className="opacity-75">Duration:</span>
                        <div className="font-medium">{alert?.duration}</div>
                      </div>
                      <div>
                        <span className="opacity-75">Affected Items:</span>
                        <div className="font-medium">{alert?.affectedMedications?.length || 0}</div>
                      </div>
                    </>
                  )}

                  {alert?.type === 'expired_medication' && (
                    <>
                      <div>
                        <span className="opacity-75">Expired Items:</span>
                        <div className="font-medium">{alert?.expiredItems?.length || 0}</div>
                      </div>
                      <div>
                        <span className="opacity-75">Total Value:</span>
                        <div className="font-medium">${alert?.totalValue}</div>
                      </div>
                    </>
                  )}

                  {alert?.type === 'urgent_refill' && (
                    <>
                      <div>
                        <span className="opacity-75">Patient:</span>
                        <div className="font-medium">{alert?.patientName}</div>
                      </div>
                      <div>
                        <span className="opacity-75">Medication:</span>
                        <div className="font-medium">{alert?.medication}</div>
                      </div>
                      <div>
                        <span className="opacity-75">Doctor:</span>
                        <div className="font-medium">{alert?.doctorName}</div>
                      </div>
                      <div>
                        <span className="opacity-75">Contact:</span>
                        <div className="font-medium">{alert?.contactNumber}</div>
                      </div>
                    </>
                  )}

                  <div>
                    <span className="opacity-75">Time:</span>
                    <div className="font-medium">{new Date(alert.timestamp)?.toLocaleString()}</div>
                  </div>
                </div>

                {alert?.acknowledged && alert?.resolvedAt && (
                  <div className="bg-success/10 rounded-lg p-2 text-sm">
                    <span className="text-success font-medium">Resolved:</span>
                    <span className="text-success/80 ml-2">
                      {new Date(alert.resolvedAt)?.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                {!alert?.acknowledged && (
                  <>
                    <Button
                      variant={alert?.severity === 'critical' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAlertAction(alert)}
                    >
                      {getActionLabel(alert?.actionRequired)}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Eye"
                      iconPosition="left"
                      iconSize={14}
                      onClick={() => onViewDetails && onViewDetails(alert)}
                    >
                      Details
                    </Button>
                  </>
                )}
                
                {alert?.acknowledged && (
                  <div className="flex items-center space-x-1 text-success text-sm">
                    <Icon name="Check" size={16} />
                    <span>Resolved</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredAlerts?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Shield" size={48} className="text-success mx-auto mb-3" />
          <p className="text-text-secondary">No emergency alerts found</p>
          <p className="text-sm text-text-secondary mt-1">All systems operating normally</p>
        </div>
      )}
    </div>
  );
};

export default EmergencyAlertsPanel;
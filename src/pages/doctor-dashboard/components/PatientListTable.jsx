import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PatientListTable = ({ patients, onPatientClick, onBulkMessage, selectedPatients, onPatientSelect }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'lastActivity', direction: 'desc' });

  const sortedPatients = useMemo(() => {
    if (!sortConfig?.key) return patients;

    return [...patients]?.sort((a, b) => {
      let aValue = a?.[sortConfig?.key];
      let bValue = b?.[sortConfig?.key];

      if (sortConfig?.key === 'adherenceRate') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortConfig?.key === 'lastActivity' || sortConfig?.key === 'dischargeDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [patients, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getComplianceStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'excellent': return 'text-success bg-success/10';
      case 'good': return 'text-primary bg-primary/10';
      case 'fair': return 'text-warning bg-warning/10';
      case 'poor': return 'text-error bg-error/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const getRiskLevelColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-error';
      case 'critical': return 'text-error font-semibold';
      default: return 'text-text-secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatLastActivity = (dateString) => {
    const now = new Date();
    const activity = new Date(dateString);
    const diffInHours = Math.floor((now - activity) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  const SortableHeader = ({ label, sortKey, className = "" }) => (
    <th className={`px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-medical ${className}`}
        onClick={() => handleSort(sortKey)}>
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <div className="flex flex-col">
          <Icon 
            name="ChevronUp" 
            size={12} 
            className={`${sortConfig?.key === sortKey && sortConfig?.direction === 'asc' ? 'text-primary' : 'text-text-secondary/50'}`}
          />
          <Icon 
            name="ChevronDown" 
            size={12} 
            className={`-mt-1 ${sortConfig?.key === sortKey && sortConfig?.direction === 'desc' ? 'text-primary' : 'text-text-secondary/50'}`}
          />
        </div>
      </div>
    </th>
  );

  return (
    <div className="bg-surface rounded-lg border border-border shadow-medical-sm">
      {/* Table Header with Bulk Actions */}
      {selectedPatients?.length > 0 && (
        <div className="px-6 py-4 bg-primary/5 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">
              {selectedPatients?.length} patient{selectedPatients?.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="MessageSquare"
                iconPosition="left"
                iconSize={16}
                onClick={() => onBulkMessage(selectedPatients)}
              >
                Send Message
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Bell"
                iconPosition="left"
                iconSize={16}
              >
                Set Reminder
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                  checked={selectedPatients?.length === patients?.length && patients?.length > 0}
                  onChange={(e) => {
                    if (e?.target?.checked) {
                      onPatientSelect(patients?.map(p => p?.id));
                    } else {
                      onPatientSelect([]);
                    }
                  }}
                />
              </th>
              <SortableHeader label="Patient" sortKey="name" />
              <SortableHeader label="Discharge Date" sortKey="dischargeDate" />
              <SortableHeader label="Adherence" sortKey="adherenceRate" />
              <SortableHeader label="Compliance" sortKey="complianceStatus" />
              <SortableHeader label="Risk Level" sortKey="riskLevel" />
              <SortableHeader label="Last Activity" sortKey="lastActivity" />
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {sortedPatients?.map((patient) => (
              <tr 
                key={patient?.id}
                className="hover:bg-muted/30 transition-medical cursor-pointer"
                onClick={() => onPatientClick(patient)}
              >
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e?.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                    checked={selectedPatients?.includes(patient?.id)}
                    onChange={(e) => {
                      if (e?.target?.checked) {
                        onPatientSelect([...selectedPatients, patient?.id]);
                      } else {
                        onPatientSelect(selectedPatients?.filter(id => id !== patient?.id));
                      }
                    }}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <Icon name="User" size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{patient?.name}</div>
                      <div className="text-sm text-text-secondary">ID: {patient?.patientId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {formatDate(patient?.dischargeDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-muted rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          patient?.adherenceRate >= 90 ? 'bg-success' :
                          patient?.adherenceRate >= 70 ? 'bg-primary' :
                          patient?.adherenceRate >= 50 ? 'bg-warning' : 'bg-error'
                        }`}
                        style={{ width: `${patient?.adherenceRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-text-primary">
                      {patient?.adherenceRate}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplianceStatusColor(patient?.complianceStatus)}`}>
                    {patient?.complianceStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      patient?.riskLevel?.toLowerCase() === 'low' ? 'bg-success' :
                      patient?.riskLevel?.toLowerCase() === 'medium' ? 'bg-warning' :
                      patient?.riskLevel?.toLowerCase() === 'high' ? 'bg-error' : 'bg-error'
                    }`} />
                    <span className={`text-sm font-medium ${getRiskLevelColor(patient?.riskLevel)}`}>
                      {patient?.riskLevel}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {formatLastActivity(patient?.lastActivity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e?.stopPropagation()}>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="MessageSquare"
                      iconSize={16}
                      className="text-text-secondary hover:text-primary"
                      title="Send Message"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Phone"
                      iconSize={16}
                      className="text-text-secondary hover:text-primary"
                      title="Call Patient"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="MoreHorizontal"
                      iconSize={16}
                      className="text-text-secondary hover:text-primary"
                      title="More Actions"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Empty State */}
      {patients?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Users" size={48} className="text-text-secondary/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No patients found</h3>
          <p className="text-text-secondary">Try adjusting your filters or search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default PatientListTable;
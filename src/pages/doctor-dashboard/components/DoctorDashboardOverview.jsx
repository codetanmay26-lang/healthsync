import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DoctorDashboardOverview = ({ 
  patients, 
  summaryMetrics, 
  realAlerts,
  onPatientClick,
  onViewAllPatients,
  onViewAllAlerts 
}) => {
  
  return (
    <div className="space-y-8">
      {/* Clean Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Overview</h2>
          <p className="text-sm text-text-secondary mt-1">
            Your dashboard summary and key metrics
          </p>
        </div>
        <div className="text-sm text-text-secondary">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Key Metrics - Clean 4-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryMetrics.map(metric => (
          <div 
            key={metric.id}
            className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                metric.id === 'total-patients' ? 'bg-primary/10' :
                metric.id === 'overall-adherence' ? 'bg-success/10' :
                metric.id === 'active-alerts' ? 'bg-error/10' :
                'bg-warning/10'
              }`}>
                <Icon 
                  name={
                    metric.id === 'total-patients' ? 'Users' :
                    metric.id === 'overall-adherence' ? 'TrendingUp' :
                    metric.id === 'active-alerts' ? 'AlertTriangle' :
                    'Activity'
                  }
                  size={24}
                  className={
                    metric.id === 'total-patients' ? 'text-primary' :
                    metric.id === 'overall-adherence' ? 'text-success' :
                    metric.id === 'active-alerts' ? 'text-error' :
                    'text-warning'
                  }
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-secondary">
                {metric.title}
              </p>
              <p className="text-3xl font-bold text-text-primary">
                {metric.value}{metric.unit || ''}
              </p>
              <p className="text-xs text-text-secondary">
                {metric.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout for Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recent Patients (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Patients Card */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-text-primary">Your Patients</h3>
                <p className="text-sm text-text-secondary mt-0.5">
                  {patients.length} patient{patients.length !== 1 ? 's' : ''} assigned
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onViewAllPatients}
              >
                View All
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </div>
            
            <div className="divide-y divide-border">
              {patients.slice(0, 3).map(patient => (
                <div 
                  key={patient.id}
                  onClick={() => onPatientClick(patient)}
                  className="px-6 py-4 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {patient.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{patient.name}</p>
                        <p className="text-sm text-text-secondary">
                          ID: {patient.patientId || patient.id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        patient.adherenceRate >= 80 ? 'bg-success/10 text-success' :
                        patient.adherenceRate >= 60 ? 'bg-warning/10 text-warning' :
                        'bg-error/10 text-error'
                      }`}>
                        {patient.adherenceRate}% Adherence
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {patients.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <Icon name="Users" size={48} className="text-text-secondary/30 mx-auto mb-3" />
                  <p className="text-text-secondary">No patients assigned</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => window.location.href = '/patient-profile'}
              >
                <Icon name="UserPlus" size={18} className="mr-2" />
                Add Patient Note
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => window.location.href = '/doctor-dashboard?tab=reports'}
              >
                <Icon name="FileText" size={18} className="mr-2" />
                Review Reports
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => window.location.href = '/doctor-dashboard?tab=messages'}
              >
                <Icon name="MessageSquare" size={18} className="mr-2" />
                Send Message
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => window.location.href = '/doctor-dashboard?tab=analytics'}
              >
                <Icon name="TrendingUp" size={18} className="mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Alerts & Activity (1/3 width) */}
        <div className="space-y-6">
          
          {/* Active Alerts */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-text-primary">Active Alerts</h3>
                <p className="text-sm text-text-secondary mt-0.5">
                  {realAlerts.length} alert{realAlerts.length !== 1 ? 's' : ''}
                </p>
                <button
      onClick={() => {
        localStorage.setItem('doctorAlerts', '[]');
        window.location.reload();
      }}
      className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium"
      disabled={realAlerts.length === 0}
    >
      Clear All
    </button>
              </div>
              {realAlerts.length > 0 && (
                <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
              )}
            </div>
            
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {realAlerts.slice(0, 5).map(alert => (
                <div 
                  key={alert.id}
                  className="px-6 py-4 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      alert.priority === 'critical' ? 'bg-error/10' :
                      alert.priority === 'high' ? 'bg-warning/10' :
                      'bg-primary/10'
                    }`}>
                      <Icon 
                        name="AlertTriangle" 
                        size={16}
                        className={
                          alert.priority === 'critical' ? 'text-error' :
                          alert.priority === 'high' ? 'text-warning' :
                          'text-primary'
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">
                        {alert.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-text-secondary mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {realAlerts.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <Icon name="CheckCircle" size={48} className="text-success/30 mx-auto mb-3" />
                  <p className="text-text-secondary">No active alerts</p>
                </div>
              )}
            </div>
            
            {realAlerts.length > 5 && (
              <div className="px-6 py-3 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  fullWidth
                  onClick={onViewAllAlerts}
                >
                  View All Alerts
                  <Icon name="ArrowRight" size={14} className="ml-2" />
                </Button>
              </div>
            )}
          </div>

          {/* Today's Summary */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Patients Reviewed</span>
                <span className="text-lg font-bold text-text-primary">{patients.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Reports Analyzed</span>
                <span className="text-lg font-bold text-text-primary">
                  {JSON.parse(localStorage.getItem('doctorAnalyses') || '[]').filter(a => a.reviewed).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Messages Sent</span>
                <span className="text-lg font-bold text-text-primary">
                  {JSON.parse(localStorage.getItem('messages') || '[]').filter(m => 
                    new Date(m.timestamp).toDateString() === new Date().toDateString()
                  ).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardOverview;

import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import EmergencyAlertBanner from '../../components/ui/EmergencyAlertBanner';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import MetricsOverview from './components/MetricsOverview';
import AnalyticsChart from './components/AnalyticsChart';
import SystemStatusPanel from './components/SystemStatusPanel';
import UserManagementPanel from './components/UserManagementPanel';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AdminAnalytics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Mock data for metrics overview
  const metricsData = [
    {
      id: 'patients',
      type: 'patients',
      title: 'Total Monitored Patients',
      description: 'Active patients in the system',
      value: 2847,
      format: 'number',
      trend: 12.5,
      target: 3000
    },
    {
      id: 'adherence',
      type: 'adherence',
      title: 'Overall Adherence Rate',
      description: 'Average medication adherence',
      value: 87.4,
      format: 'percentage',
      trend: 3.2,
      target: 90
    },
    {
      id: 'alerts',
      type: 'alerts',
      title: 'Emergency Alerts',
      description: 'Alerts in last 24 hours',
      value: 23,
      format: 'number',
      trend: -15.3,
      target: 20
    },
    {
      id: 'system',
      type: 'system',
      title: 'System Uptime',
      description: 'Current system availability',
      value: 99.8,
      format: 'percentage',
      trend: 0.2,
      target: 99.9
    }
  ];

  // Mock data for charts
  const patientTrendsData = [
    { name: 'Jan', value: 2400 },
    { name: 'Feb', value: 2210 },
    { name: 'Mar', value: 2290 },
    { name: 'Apr', value: 2000 },
    { name: 'May', value: 2181 },
    { name: 'Jun', value: 2500 },
    { name: 'Jul', value: 2847 }
  ];

  const adherenceData = [
    { name: 'Excellent (>90%)', value: 45 },
    { name: 'Good (80-90%)', value: 32 },
    { name: 'Fair (70-80%)', value: 18 },
    { name: 'Poor (<70%)', value: 5 }
  ];

  const alertsData = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 19 },
    { name: 'Wed', value: 8 },
    { name: 'Thu', value: 15 },
    { name: 'Fri', value: 23 },
    { name: 'Sat', value: 18 },
    { name: 'Sun', value: 14 }
  ];

  // Mock system data
  const systemData = {
    services: [
      {
        id: 'api',
        name: 'API Gateway',
        description: 'Core API services',
        status: 'online',
        uptime: '99.8%'
      },
      {
        id: 'database',
        name: 'Database',
        description: 'Patient data storage',
        status: 'online',
        uptime: '99.9%'
      },
      {
        id: 'ml',
        name: 'ML Pipeline',
        description: 'Predictive analytics',
        status: 'warning',
        uptime: '97.2%'
      },
      {
        id: 'notifications',
        name: 'Notification Service',
        description: 'SMS and email alerts',
        status: 'online',
        uptime: '99.5%'
      }
    ],
    activeSessions: [
      { role: 'doctor', count: 45 },
      { role: 'patient', count: 234 },
      { role: 'pharmacy', count: 12 },
      { role: 'admin', count: 3 }
    ],
    performance: {
      cpu: 68,
      memory: 72
    }
  };

  // Mock user data
  const usersData = [
    {
      id: 'u1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@healthsync.com',
      role: 'doctor',
      status: 'active',
      lastActive: '2025-01-08T16:30:00Z'
    },
    {
      id: 'u2',
      name: 'John Smith',
      email: 'john.smith@email.com',
      role: 'patient',
      status: 'active',
      lastActive: '2025-01-08T15:45:00Z'
    },
    {
      id: 'u3',
      name: 'PharmaCare Staff',
      email: 'staff@pharmacare.com',
      role: 'pharmacy',
      status: 'active',
      lastActive: '2025-01-08T17:20:00Z'
    },
    {
      id: 'u4',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@healthsync.com',
      role: 'doctor',
      status: 'inactive',
      lastActive: '2025-01-07T14:30:00Z'
    },
    {
      id: 'u5',
      name: 'Admin User',
      email: 'admin@healthsync.com',
      role: 'admin',
      status: 'active',
      lastActive: '2025-01-08T17:45:00Z'
    }
  ];

  // Mock predictive analytics data
  const predictionsData = [
    {
      id: 'p1',
      patientId: 'PAT001',
      patientName: 'Rakesh Sharma',
      prediction: 'High risk of medication non-adherence in next 7 days',
      riskLevel: 'high',
      confidence: 89,
      modelUsed: 'Adherence Predictor v2.1',
      timestamp: '2025-01-08T16:30:00Z'
    },
    {
      id: 'p2',
      patientId: 'PAT002',
      patientName: 'Jane Smith',
      prediction: 'Potential emergency room visit within 48 hours',
      riskLevel: 'high',
      confidence: 76,
      modelUsed: 'Emergency Predictor v1.8',
      timestamp: '2025-01-08T15:45:00Z'
    },
    {
      id: 'p3',
      patientId: 'PAT003',
      patientName: 'Robert Johnson',
      prediction: 'Medication dosage adjustment recommended',
      riskLevel: 'medium',
      confidence: 82,
      modelUsed: 'Dosage Optimizer v3.0',
      timestamp: '2025-01-08T14:20:00Z'
    }
  ];

  const mlModelsData = [
    {
      id: 'model1',
      name: 'Adherence Predictor',
      description: 'Predicts medication adherence patterns',
      status: 'active',
      accuracy: 89,
      lastTrained: '2025-01-05T10:00:00Z',
      predictions: 1247
    },
    {
      id: 'model2',
      name: 'Emergency Predictor',
      description: 'Identifies high-risk patients',
      status: 'active',
      accuracy: 76,
      lastTrained: '2025-01-04T14:30:00Z',
      predictions: 892
    },
    {
      id: 'model3',
      name: 'Dosage Optimizer',
      description: 'Optimizes medication dosages',
      status: 'training',
      accuracy: 82,
      lastTrained: '2025-01-03T09:15:00Z',
      predictions: 634
    }
  ];

  // Mock emergency alerts
  const emergencyAlerts = [
    {
      id: 'alert-1',
      type: 'system',
      priority: 'high',
      title: 'ML Model Performance Degradation',
      message: 'Adherence prediction accuracy dropped below 85% threshold',
      timestamp: new Date()?.toISOString(),
      roles: ['admin'],
      active: true,
      actionLabel: 'Review Model',
      actionUrl: '/admin-analytics'
    }
  ];

  const breadcrumbItems = [
    { label: 'Analytics', path: '/admin-analytics' },
    { label: 'Dashboard' }
  ];

  const handleUserAction = (action, user) => {
    console.log(`${action} action for user:`, user);
    // Handle user management actions
  };

  const handleExportReport = () => {
    console.log('Exporting comprehensive report...');
    // Handle report export
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'users', label: 'User Management', icon: 'Users' },
    { id: 'predictions', label: 'Predictive Analytics', icon: 'Brain' },
    { id: 'system', label: 'System Status', icon: 'Activity' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="admin" userName="Admin User" />
     {/* <EmergencyAlertBanner userRole="admin" alerts={emergencyAlerts} /> */}
        
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading analytics dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="admin" userName="Admin User" onToggleSidebar={() => {}} />
      <EmergencyAlertBanner userRole="admin" alerts={emergencyAlerts} />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BreadcrumbNavigation items={breadcrumbItems} userRole="admin" onBack={() => window.history.back()} />
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Admin Analytics</h1>
              <p className="text-text-secondary mt-2">
                Comprehensive system oversight and operational metrics for healthcare continuity management
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e?.target?.value)}
                className="px-3 py-2 border border-border rounded-lg bg-input text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                onClick={handleExportReport}
              >
                Export Report
              </Button>
              
              <Button
                variant="default"
                iconName="RefreshCw"
                iconPosition="left"
              >
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-border mb-8">
            <nav className="flex space-x-8">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-medical ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <MetricsOverview metrics={metricsData} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AnalyticsChart
                  data={patientTrendsData}
                  type="line"
                  title="Patient Enrollment Trends"
                  height={300}
                />
                <AnalyticsChart
                  data={adherenceData}
                  type="pie"
                  title="Adherence Distribution"
                  height={300}
                />
              </div>
              
              <AnalyticsChart
                data={alertsData}
                type="bar"
                title="Emergency Alerts (Last 7 Days)"
                height={250}
              />
            </div>
          )}

          {activeTab === 'users' && (
            <UserManagementPanel users={usersData} onUserAction={handleUserAction} />
          )}

          {activeTab === 'predictions' && (
            <PredictiveAnalytics predictions={predictionsData} mlModels={mlModelsData} />
          )}
          {activeTab === 'system' && (
            <SystemStatusPanel systemData={systemData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
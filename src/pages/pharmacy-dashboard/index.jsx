import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';

// Import dashboard components
import InventoryOverview from './components/InventoryOverview';
import RefillRequestsPanel from './components/RefillRequestsPanel';
import AnalyticsCharts from './components/AnalyticsCharts';
import EmergencyAlertsPanel from './components/EmergencyAlertsPanel';

const PharmacyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Mock dashboard statistics
    const mockStats = {
      totalMedications: 1247,
      lowStockItems: 12,
      pendingRefills: 28,
      activeAlerts: 5,
      monthlyRevenue: 148250,
      automationRate: 82,
      averageTurnover: 4.5,
    };
    setDashboardStats(mockStats);

    // Mock notifications for emergency banner
    const mockNotifications = [
      {
        id: 'notif-001',
        type: 'medication',
        priority: 'critical',
        title: 'Critical Stock Alert',
        message: 'Insulin Glargine critically low - immediate reorder required',
        timestamp: new Date()?.toISOString(),
        roles: ['pharmacy'],
        active: true,
        actionLabel: 'Reorder Now',
        actionUrl: '/pharmacy-dashboard'
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  const handleInventoryAction = (medication) => {
    console.log('Inventory action for:', medication);
    // Handle inventory-related actions
  };

  const handleRefillProcess = (request) => {
    console.log('Processing refill:', request);
    // Handle refill processing
  };

  const handleEmergencyAction = (alert) => {
    console.log('Emergency action:', alert);
    // Handle emergency alerts
  };

  const handleExportReport = (reportData) => {
    console.log('Exporting report:', reportData);
    // Handle report export
  };

  const breadcrumbItems = [
    { label: 'Pharmacy Management', path: '/pharmacy-dashboard' }
  ];

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'inventory', label: 'Inventory', icon: 'Package' },
    { id: 'refills', label: 'Refills', icon: 'RefreshCw' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'alerts', label: 'Alerts', icon: 'AlertTriangle' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole="pharmacy" 
        userName="PharmTech Sarah" 
        onToggleSidebar={() => {}} 
      />
  {/* <EmergencyAlertBanner userRole="pharmacy" alerts={notifications} /> */}

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BreadcrumbNavigation 
            items={breadcrumbItems}
            userRole="pharmacy"
            showBackButton={false}
            onBack={() => {}}
          />

          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Pharmacy Dashboard</h1>
                <p className="text-text-secondary mt-2">
                  Manage inventory, process refills, and monitor storage conditions
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  iconSize={16}
                  onClick={() => handleExportReport({ type: 'daily_summary' })}
                >
                  Export Report
                </Button>
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  iconSize={16}
                  onClick={() => console.log('Add new medication')}
                >
                  Add Medication
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <div className="bg-surface rounded-lg border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Total Medications</p>
                    <p className="text-2xl font-bold text-text-primary">{dashboardStats?.totalMedications?.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Package" size={24} className="text-primary" />
                  </div>
                </div>
                <p className="text-xs text-text-secondary mt-2">Across all categories</p>
              </div>

              <div className="bg-surface rounded-lg border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Low Stock Items</p>
                    <p className="text-2xl font-bold text-warning">{dashboardStats?.lowStockItems}</p>
                  </div>
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Icon name="AlertTriangle" size={24} className="text-warning" />
                  </div>
                </div>
                <p className="text-xs text-text-secondary mt-2">Require attention</p>
              </div>

              <div className="bg-surface rounded-lg border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Pending Refills</p>
                    <p className="text-2xl font-bold text-accent">{dashboardStats?.pendingRefills}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon name="RefreshCw" size={24} className="text-accent" />
                  </div>
                </div>
                <p className="text-xs text-text-secondary mt-2">Awaiting processing</p>
              </div>

              <div className="bg-surface rounded-lg border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-success">${(dashboardStats?.monthlyRevenue / 1000)?.toFixed(0)}K</p>
                  </div>
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="DollarSign" size={24} className="text-success" />
                  </div>
                </div>
                <p className="text-xs text-text-secondary mt-2">+12% from last month</p>
              </div>
            </div>
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
                      ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                  {tab?.id === 'alerts' && dashboardStats?.activeAlerts > 0 && (
                    <span className="bg-error text-error-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                      {dashboardStats?.activeAlerts}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="pb-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <InventoryOverview 
                    onViewDetails={handleInventoryAction}
                    onReorderAlert={handleInventoryAction}
                  />
                  <RefillRequestsPanel 
                    onProcessRefill={handleRefillProcess}
                    onContactPatient={(request) => console.log('Contact patient:', request)}
                  />
                </div>
                <EmergencyAlertsPanel 
                  onAlertAction={handleEmergencyAction}
                  onViewDetails={(alert) => console.log('View alert details:', alert)}
                />
              </div>
            )}

            {activeTab === 'inventory' && (
              <InventoryOverview 
                onViewDetails={handleInventoryAction}
                onReorderAlert={handleInventoryAction}
              />
            )}

            {activeTab === 'refills' && (
              <RefillRequestsPanel 
                onProcessRefill={handleRefillProcess}
                onContactPatient={(request) => console.log('Contact patient:', request)}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsCharts 
                onExportReport={handleExportReport}
              />
            )}

            {activeTab === 'alerts' && (
              <EmergencyAlertsPanel 
                onAlertAction={handleEmergencyAction}
                onViewDetails={(alert) => console.log('View alert details:', alert)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
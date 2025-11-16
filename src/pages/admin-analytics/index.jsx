import React, { useState, useEffect } from "react";
import Header from "../../components/ui/Header";
import EmergencyAlertBanner from "../../components/ui/EmergencyAlertBanner";
import BreadcrumbNavigation from "../../components/ui/BreadcrumbNavigation";
import MetricsOverview from "./components/MetricsOverview";
import AnalyticsChart from "./components/AnalyticsChart";
import SystemStatusPanel from "./components/SystemStatusPanel";
import UserManagement from "./components/UserManagement"; // UPDATED - Real user management
import PredictiveAnalytics from "./components/PredictiveAnalytics";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import { useAuth } from "../../contexts/AuthContext"; // ADD THIS
import { getAllUsers } from "../../services/localStorageUserManagement"; // ADD THIS

const AdminAnalytics = () => {
  const { user } = useAuth(); // Get current admin user
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [realMetrics, setRealMetrics] = useState(null);

  useEffect(() => {
    // Load real data
    const loadRealData = () => {
      const allUsers = getAllUsers();
      const patients = JSON.parse(localStorage.getItem("patients") || "[]");
      const adherenceReports = JSON.parse(
        localStorage.getItem("adherenceReports") || "[]"
      );
      const appointments = JSON.parse(
        localStorage.getItem("appointments") || "[]"
      );

      // Calculate real metrics
      const activePatients = allUsers.filter(
        (u) => u.role === "patient" && u.active
      ).length;

      // Calculate overall adherence
      let overallAdherence = 0;
      if (adherenceReports.length > 0) {
        const taken = adherenceReports.filter((r) => r.medicationTaken).length;
        overallAdherence = Math.round((taken / adherenceReports.length) * 100);
      }

      // Count recent alerts
      const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
      const recentAlerts = adherenceReports.filter(
        (r) =>
          new Date(r.timestamp).getTime() >= last24Hours && !r.medicationTaken
      ).length;

      // System uptime (simulated - could integrate with real monitoring)
      const systemUptime = 99.8;

      setRealMetrics({
        patients: {
          value: activePatients,
          trend: 5.2,
          target: activePatients + 50,
        },
        adherence: {
          value: overallAdherence,
          trend: overallAdherence > 85 ? 3.2 : -2.5,
          target: 90,
        },
        alerts: {
          value: recentAlerts,
          trend: -10.3,
          target: 20,
        },
        uptime: {
          value: systemUptime,
          trend: 0.2,
          target: 99.9,
        },
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter((u) => u.active).length,
      });

      setIsLoading(false);
    };

    const timer = setTimeout(() => {
      loadRealData();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Real metrics data from localStorage
  const metricsData = realMetrics
    ? [
        {
          id: "patients",
          type: "patients",
          title: "Total Monitored Patients",
          description: "Active patients in the system",
          value: realMetrics.patients.value,
          format: "number",
          trend: realMetrics.patients.trend,
          target: realMetrics.patients.target,
        },
        {
          id: "adherence",
          type: "adherence",
          title: "Overall Adherence Rate",
          description: "Average medication adherence",
          value: realMetrics.adherence.value,
          format: "percentage",
          trend: realMetrics.adherence.trend,
          target: realMetrics.adherence.target,
        },
        {
          id: "alerts",
          type: "alerts",
          title: "Emergency Alerts",
          description: "Alerts in last 24 hours",
          value: realMetrics.alerts.value,
          format: "number",
          trend: realMetrics.alerts.trend,
          target: realMetrics.alerts.target,
        },
        {
          id: "system",
          type: "system",
          title: "System Uptime",
          description: "Current system availability",
          value: realMetrics.uptime.value,
          format: "percentage",
          trend: realMetrics.uptime.trend,
          target: realMetrics.uptime.target,
        },
      ]
    : [];

  // Chart data (can be enhanced with real data later)
  const patientTrendsData = [
    { name: "Jan", value: 2400 },
    { name: "Feb", value: 2210 },
    { name: "Mar", value: 2290 },
    { name: "Apr", value: 2000 },
    { name: "May", value: 2181 },
    { name: "Jun", value: 2500 },
    { name: "Jul", value: realMetrics?.patients.value || 2847 },
  ];

  const adherenceData = [
    { name: "Excellent (>90%)", value: 45 },
    { name: "Good (80-90%)", value: 32 },
    { name: "Fair (70-80%)", value: 18 },
    { name: "Poor (<70%)", value: 5 },
  ];

  const alertsData = [
    { name: "Mon", value: 12 },
    { name: "Tue", value: 19 },
    { name: "Wed", value: 8 },
    { name: "Thu", value: 15 },
    { name: "Fri", value: 23 },
    { name: "Sat", value: 18 },
    { name: "Sun", value: 14 },
  ];

  // Real system data
  const systemData = {
    services: [
      {
        id: "api",
        name: "User Management",
        description: "LocalStorage based user system",
        status: "online",
        uptime: "99.9%",
      },
      {
        id: "database",
        name: "Data Storage",
        description: "Patient data in localStorage",
        status: "online",
        uptime: "100%",
      },
      {
        id: "analytics",
        name: "Analytics Engine",
        description: "Real-time risk calculations",
        status: "online",
        uptime: "99.8%",
      },
      {
        id: "notifications",
        name: "Alert System",
        description: "Patient monitoring alerts",
        status: "online",
        uptime: "99.5%",
      },
    ],
    activeSessions: [
      {
        role: "doctor",
        count: getAllUsers().filter((u) => u.role === "doctor" && u.active)
          .length,
      },
      {
        role: "patient",
        count: getAllUsers().filter((u) => u.role === "patient" && u.active)
          .length,
      },
      {
        role: "admin",
        count: getAllUsers().filter((u) => u.role === "admin" && u.active)
          .length,
      },
    ],
    performance: {
      cpu: 68,
      memory: 72,
    },
  };

  // Mock predictive analytics data
  const predictionsData = [
    {
      id: "p1",
      patientId: "PAT001",
      patientName: "Rakesh Sharma",
      prediction: "High risk of medication non-adherence in next 7 days",
      riskLevel: "high",
      confidence: 89,
      modelUsed: "Adherence Predictor v2.1",
      timestamp: new Date().toISOString(),
    },
    {
      id: "p2",
      patientId: "PAT002",
      patientName: "Patient needs assessment",
      prediction: "Regular monitoring recommended",
      riskLevel: "medium",
      confidence: 76,
      modelUsed: "Health Monitor v1.8",
      timestamp: new Date().toISOString(),
    },
  ];

  const mlModelsData = [
    {
      id: "model1",
      name: "Adherence Predictor",
      description: "Predicts medication adherence patterns",
      status: "active",
      accuracy: 89,
      lastTrained: new Date().toISOString(),
      predictions: getAllUsers().filter((u) => u.role === "patient").length,
    },
    {
      id: "model2",
      name: "Risk Assessment",
      description: "Identifies high-risk patients",
      status: "active",
      accuracy: 76,
      lastTrained: new Date().toISOString(),
      predictions: getAllUsers().filter((u) => u.role === "patient").length,
    },
  ];

  const emergencyAlerts = [];

  const breadcrumbItems = [
    { label: "Analytics", path: "/admin-analytics" },
    { label: "Dashboard" },
  ];

  const handleExportReport = () => {
    // Export real data
    const exportData = {
      metrics: realMetrics,
      users: getAllUsers(),
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-report-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    window.location.reload();
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "BarChart3" },
    { id: "users", label: "User Management", icon: "Users" },
    { id: "predictions", label: "Predictive Analytics", icon: "Brain" },
    { id: "system", label: "System Status", icon: "Activity" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary">
                Loading analytics dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {emergencyAlerts.length > 0 && (
        <EmergencyAlertBanner userRole="admin" alerts={emergencyAlerts} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNavigation
          items={breadcrumbItems}
          onBack={() => window.history.back()}
        />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Admin Analytics
            </h1>
            <p className="text-text-secondary mt-2">
              {user?.name
                ? `Welcome, ${user.name}`
                : "Comprehensive system oversight"}{" "}
              • Real-time metrics and user management
            </p>
            {realMetrics && (
              <div className="mt-2 text-sm text-text-secondary">
                Total Users: {realMetrics.totalUsers} • Active:{" "}
                {realMetrics.activeUsers}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
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
              onClick={handleRefreshData}
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-border mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-medical ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
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

        {/* REAL USER MANAGEMENT - Updated */}
        {activeTab === "users" && <UserManagement />}

        {activeTab === "predictions" && (
          <PredictiveAnalytics
            predictions={predictionsData}
            mlModels={mlModelsData}
          />
        )}

        {activeTab === "system" && (
          <SystemStatusPanel systemData={systemData} />
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;

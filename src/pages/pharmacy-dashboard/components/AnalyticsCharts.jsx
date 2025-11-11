import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Button from '../../../components/ui/Button';


const AnalyticsCharts = ({ onExportReport }) => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('sales');

  useEffect(() => {
    // Mock analytics data
    const mockData = {
      inventoryTurnover: [
        { month: 'Jan', turnover: 4.2, revenue: 125000 },
        { month: 'Feb', turnover: 3.8, revenue: 118000 },
        { month: 'Mar', turnover: 4.5, revenue: 135000 },
        { month: 'Apr', turnover: 4.1, revenue: 128000 },
        { month: 'May', turnover: 4.7, revenue: 142000 },
        { month: 'Jun', turnover: 4.3, revenue: 131000 },
        { month: 'Jul', turnover: 4.6, revenue: 138000 },
        { month: 'Aug', turnover: 4.4, revenue: 133000 },
        { month: 'Sep', turnover: 4.8, revenue: 145000 },
        { month: 'Oct', turnover: 4.2, revenue: 127000 },
        { month: 'Nov', turnover: 4.9, revenue: 148000 },
        { month: 'Dec', turnover: 5.1, revenue: 152000 }
      ],
      popularMedications: [
        { name: 'Metformin', prescriptions: 245, revenue: 3062.50, percentage: 18.5 },
        { name: 'Lisinopril', prescriptions: 198, revenue: 1732.50, percentage: 14.9 },
        { name: 'Atorvastatin', prescriptions: 167, revenue: 3674.00, percentage: 12.6 },
        { name: 'Amlodipine', prescriptions: 143, revenue: 1287.00, percentage: 10.8 },
        { name: 'Omeprazole', prescriptions: 128, revenue: 1920.00, percentage: 9.7 },
        { name: 'Levothyroxine', prescriptions: 115, revenue: 1725.00, percentage: 8.7 },
        { name: 'Others', prescriptions: 329, revenue: 8234.50, percentage: 24.8 }
      ],
      seasonalDemand: [
        { category: 'Antibiotics', spring: 85, summer: 65, fall: 120, winter: 145 },
        { category: 'Allergy Meds', spring: 180, summer: 95, fall: 110, winter: 75 },
        { category: 'Cold & Flu', spring: 45, summer: 25, fall: 95, winter: 165 },
        { category: 'Diabetes', spring: 120, summer: 125, fall: 118, winter: 122 },
        { category: 'Heart Meds', spring: 98, summer: 102, fall: 105, winter: 108 }
      ],
      refillTrends: [
        { week: 'Week 1', automated: 45, manual: 23, total: 68 },
        { week: 'Week 2', automated: 52, manual: 19, total: 71 },
        { week: 'Week 3', automated: 48, manual: 25, total: 73 },
        { week: 'Week 4', automated: 55, manual: 18, total: 73 },
        { week: 'Week 5', automated: 58, manual: 16, total: 74 },
        { week: 'Week 6', automated: 61, manual: 14, total: 75 },
        { week: 'Week 7', automated: 59, manual: 17, total: 76 },
        { week: 'Week 8', automated: 63, manual: 13, total: 76 }
      ]
    };
    setAnalyticsData(mockData);
  }, [selectedPeriod]);

  const COLORS = ['#2563EB', '#059669', '#F59E0B', '#DC2626', '#7C3AED', '#EC4899', '#64748B'];

  const handleExportReport = () => {
    if (onExportReport) {
      onExportReport({
        period: selectedPeriod,
        metric: selectedMetric,
        data: analyticsData
      });
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Analytics & Insights</h2>
          <p className="text-sm text-text-secondary mt-1">
            Inventory performance and demand patterns
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            iconSize={14}
            onClick={handleExportReport}
          >
            Export Report
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Turnover Chart */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <Icon name="TrendingUp" size={20} className="text-primary mr-2" />
            Inventory Turnover & Revenue
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.inventoryTurnover || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--color-text-secondary)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-text-secondary)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    name === 'turnover' ? `${value}x` : `$${value?.toLocaleString()}`,
                    name === 'turnover' ? 'Turnover Rate' : 'Revenue'
                  ]}
                />
                <Bar dataKey="turnover" fill="var(--color-primary)" name="turnover" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Medications Pie Chart */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <Icon name="PieChart" size={20} className="text-accent mr-2" />
            Popular Medications
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData?.popularMedications || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="prescriptions"
                >
                  {(analyticsData?.popularMedications || [])?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [`${value} prescriptions`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Demand Patterns */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <Icon name="Calendar" size={20} className="text-warning mr-2" />
            Seasonal Demand Patterns
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.seasonalDemand || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="category" 
                  stroke="var(--color-text-secondary)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-text-secondary)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="spring" stackId="a" fill="#10B981" name="Spring" />
                <Bar dataKey="summer" stackId="a" fill="#F59E0B" name="Summer" />
                <Bar dataKey="fall" stackId="a" fill="#DC2626" name="Fall" />
                <Bar dataKey="winter" stackId="a" fill="#2563EB" name="Winter" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Refill Trends */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <Icon name="RefreshCw" size={20} className="text-success mr-2" />
            Refill Automation Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.refillTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="week" 
                  stroke="var(--color-text-secondary)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-text-secondary)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="automated" 
                  stroke="var(--color-success)" 
                  strokeWidth={3}
                  name="Automated Refills"
                />
                <Line 
                  type="monotone" 
                  dataKey="manual" 
                  stroke="var(--color-warning)" 
                  strokeWidth={3}
                  name="Manual Refills"
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Total Refills"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Key Metrics Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary">Avg Turnover Rate</p>
              <p className="text-2xl font-bold text-primary">4.5x</p>
            </div>
            <Icon name="RotateCcw" size={24} className="text-primary" />
          </div>
          <p className="text-xs text-primary/80 mt-1">+0.3 from last month</p>
        </div>

        <div className="bg-success/10 rounded-lg p-4 border border-success/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-success">Automation Rate</p>
              <p className="text-2xl font-bold text-success">82%</p>
            </div>
            <Icon name="Zap" size={24} className="text-success" />
          </div>
          <p className="text-xs text-success/80 mt-1">+5% from last month</p>
        </div>

        <div className="bg-warning/10 rounded-lg p-4 border border-warning/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-warning">Stock Alerts</p>
              <p className="text-2xl font-bold text-warning">12</p>
            </div>
            <Icon name="AlertTriangle" size={24} className="text-warning" />
          </div>
          <p className="text-xs text-warning/80 mt-1">3 critical, 9 low</p>
        </div>

        <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-accent">Monthly Revenue</p>
              <p className="text-2xl font-bold text-accent">$148K</p>
            </div>
            <Icon name="DollarSign" size={24} className="text-accent" />
          </div>
          <p className="text-xs text-accent/80 mt-1">+12% from last month</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
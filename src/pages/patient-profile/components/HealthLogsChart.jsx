import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const HealthLogsChart = ({ healthLogs, onAddLog }) => {
  const [selectedMetric, setSelectedMetric] = useState('heartRate');
  const [timeRange, setTimeRange] = useState('7days');

  const metrics = [
    { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', color: '#DC2626', icon: 'Heart' },
    { key: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg', color: '#2563EB', icon: 'Activity' },
    { key: 'temperature', label: 'Temperature', unit: '°F', color: '#F59E0B', icon: 'Thermometer' },
    { key: 'weight', label: 'Weight', unit: 'lbs', color: '#059669', icon: 'Scale' },
    { key: 'bloodSugar', label: 'Blood Sugar', unit: 'mg/dL', color: '#7C3AED', icon: 'Droplet' }
  ];

  const timeRanges = [
    { key: '7days', label: '7 Days' },
    { key: '30days', label: '30 Days' },
    { key: '90days', label: '90 Days' },
    { key: '1year', label: '1 Year' }
  ];

  const getCurrentMetric = () => metrics?.find(m => m?.key === selectedMetric);

  const getFilteredData = () => {
    const now = new Date();
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    return healthLogs?.filter(log => new Date(log.date) >= cutoffDate)?.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getChartData = () => {
    const filteredData = getFilteredData();
    return filteredData?.map(log => ({
      date: new Date(log.date)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: log?.[selectedMetric],
      fullDate: log?.date,
      symptoms: log?.symptoms || []
    }));
  };

  const getLatestReading = () => {
    const filteredData = getFilteredData();
    if (filteredData?.length === 0) return null;
    return filteredData?.[filteredData?.length - 1];
  };

  const getAverageReading = () => {
    const filteredData = getFilteredData();
    if (filteredData?.length === 0) return null;
    const sum = filteredData?.reduce((acc, log) => acc + (log?.[selectedMetric] || 0), 0);
    return (sum / filteredData?.length)?.toFixed(1);
  };

  const getTrend = () => {
    const filteredData = getFilteredData();
    if (filteredData?.length < 2) return 'stable';
    
    const recent = filteredData?.slice(-3);
    const older = filteredData?.slice(-6, -3);
    
    if (recent?.length === 0 || older?.length === 0) return 'stable';
    
    const recentAvg = recent?.reduce((acc, log) => acc + (log?.[selectedMetric] || 0), 0) / recent?.length;
    const olderAvg = older?.reduce((acc, log) => acc + (log?.[selectedMetric] || 0), 0) / older?.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return 'TrendingUp';
      case 'decreasing': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return 'text-error';
      case 'decreasing': return 'text-success';
      default: return 'text-text-secondary';
    }
  };

  const currentMetric = getCurrentMetric();
  const chartData = getChartData();
  const latestReading = getLatestReading();
  const averageReading = getAverageReading();
  const trend = getTrend();

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon name="BarChart3" size={24} className="text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">Health Trends</h2>
          </div>
          <Button
            variant="default"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={onAddLog}
          >
            Add Log Entry
          </Button>
        </div>

        {/* Metric Selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {metrics?.map((metric) => (
            <button
              key={metric?.key}
              onClick={() => setSelectedMetric(metric?.key)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-medical ${
                selectedMetric === metric?.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-text-secondary hover:bg-muted/80'
              }`}
            >
              <Icon name={metric?.icon} size={16} />
              <span>{metric?.label}</span>
            </button>
          ))}
        </div>

        {/* Time Range Selection */}
        <div className="flex space-x-2">
          {timeRanges?.map((range) => (
            <button
              key={range?.key}
              onClick={() => setTimeRange(range?.key)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-medical ${
                timeRange === range?.key
                  ? 'bg-primary/10 text-primary' :'text-text-secondary hover:bg-muted'
              }`}
            >
              {range?.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name={currentMetric?.icon} size={16} className="text-primary" />
              <span className="text-sm text-text-secondary">Latest Reading</span>
            </div>
            <p className="text-2xl font-semibold text-text-primary">
              {latestReading ? `${latestReading?.[selectedMetric]} ${currentMetric?.unit}` : 'No data'}
            </p>
            {latestReading && (
              <p className="text-xs text-text-secondary mt-1">
                {new Date(latestReading.date)?.toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="BarChart" size={16} className="text-accent" />
              <span className="text-sm text-text-secondary">Average</span>
            </div>
            <p className="text-2xl font-semibold text-text-primary">
              {averageReading ? `${averageReading} ${currentMetric?.unit}` : 'No data'}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Last {timeRange === '7days' ? '7' : timeRange === '30days' ? '30' : timeRange === '90days' ? '90' : '365'} days
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name={getTrendIcon(trend)} size={16} className={getTrendColor(trend)} />
              <span className="text-sm text-text-secondary">Trend</span>
            </div>
            <p className={`text-2xl font-semibold capitalize ${getTrendColor(trend)}`}>
              {trend}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Recent pattern
            </p>
          </div>
        </div>

        {/* Chart */}
        {chartData?.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748B"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748B"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                  }}
                  formatter={(value) => [`${value} ${currentMetric?.unit}`, currentMetric?.label]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={currentMetric?.color}
                  strokeWidth={2}
                  dot={{ fill: currentMetric?.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: currentMetric?.color, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12">
            <Icon name="BarChart3" size={48} className="text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Health Data</h3>
            <p className="text-text-secondary mb-4">No health logs have been recorded for {currentMetric?.label?.toLowerCase()}.</p>
            <Button
              variant="default"
              iconName="Plus"
              iconPosition="left"
              onClick={onAddLog}
            >
              Add First Entry
            </Button>
          </div>
        )}

        {/* Recent Symptoms */}
        {latestReading && latestReading?.symptoms && latestReading?.symptoms?.length > 0 && (
          <div className="mt-6 bg-warning/5 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="AlertCircle" size={20} className="text-warning mt-0.5" />
              <div>
                <h4 className="font-medium text-warning mb-2">Recent Symptoms</h4>
                <div className="flex flex-wrap gap-2">
                  {latestReading?.symptoms?.map((symptom, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthLogsChart;
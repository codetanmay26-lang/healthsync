import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsOverview = ({ metrics }) => {
  const getMetricIcon = (type) => {
    switch (type) {
      case 'patients': return 'Users';
      case 'adherence': return 'TrendingUp';
      case 'alerts': return 'AlertTriangle';
      case 'system': return 'Activity';
      default: return 'BarChart3';
    }
  };

  const getMetricColor = (type) => {
    switch (type) {
      case 'patients': return 'text-primary bg-primary/10';
      case 'adherence': return 'text-success bg-success/10';
      case 'alerts': return 'text-warning bg-warning/10';
      case 'system': return 'text-accent bg-accent/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const formatValue = (value, format) => {
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return `$${value?.toLocaleString()}`;
      case 'number':
        return value?.toLocaleString();
      default:
        return value;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics?.map((metric) => (
        <div key={metric?.id} className="bg-card rounded-lg border border-border p-6 hover:shadow-medical-md transition-medical">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getMetricColor(metric?.type)}`}>
              <Icon name={getMetricIcon(metric?.type)} size={24} />
            </div>
            {metric?.trend && (
              <div className={`flex items-center space-x-1 ${
                metric?.trend > 0 ? 'text-success' : metric?.trend < 0 ? 'text-error' : 'text-text-secondary'
              }`}>
                <Icon 
                  name={metric?.trend > 0 ? 'TrendingUp' : metric?.trend < 0 ? 'TrendingDown' : 'Minus'} 
                  size={16} 
                />
                <span className="text-sm font-medium">
                  {Math.abs(metric?.trend)}%
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-text-primary">
              {formatValue(metric?.value, metric?.format)}
            </h3>
            <p className="text-sm font-medium text-text-primary">{metric?.title}</p>
            <p className="text-xs text-text-secondary">{metric?.description}</p>
            
            {metric?.target && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>Progress to Target</span>
                  <span>{Math.round((metric?.value / metric?.target) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((metric?.value / metric?.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsOverview;
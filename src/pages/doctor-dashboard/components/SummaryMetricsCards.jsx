import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SummaryMetricsCards = ({ metrics, onCardClick }) => {
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000)?.toFixed(1) + 'K';
    }
    return num?.toString();
  };

  const formatPercentage = (num) => {
    return `${num?.toFixed(1)}%`;
  };

  const getMetricIcon = (type) => {
    switch (type) {
      case 'patients': return 'Users';
      case 'adherence': return 'TrendingUp';
      case 'alerts': return 'AlertTriangle';
      case 'actions': return 'CheckSquare';
      case 'compliance': return 'Shield';
      case 'risk': return 'Activity';
      default: return 'BarChart3';
    }
  };

  const getMetricColor = (type, value, target) => {
    switch (type) {
      case 'adherence':
        if (value >= 90) return 'text-success bg-success/10 border-success/20';
        if (value >= 70) return 'text-primary bg-primary/10 border-primary/20';
        if (value >= 50) return 'text-warning bg-warning/10 border-warning/20';
        return 'text-error bg-error/10 border-error/20';
      case 'alerts':
        if (value === 0) return 'text-success bg-success/10 border-success/20';
        if (value <= 5) return 'text-warning bg-warning/10 border-warning/20';
        return 'text-error bg-error/10 border-error/20';
      case 'actions':
        if (value === 0) return 'text-success bg-success/10 border-success/20';
        if (value <= 10) return 'text-warning bg-warning/10 border-warning/20';
        return 'text-error bg-error/10 border-error/20';
      default:
        return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return { icon: 'TrendingUp', color: 'text-success' };
    if (trend < 0) return { icon: 'TrendingDown', color: 'text-error' };
    return { icon: 'Minus', color: 'text-text-secondary' };
  };

  const defaultMetrics = [
    {
      id: 'total-patients',
      type: 'patients',
      title: 'Total Patients',
      value: 247,
      unit: '',
      trend: 12,
      trendPeriod: 'vs last month',
      description: 'Active monitored patients',
      target: null,
      clickable: true
    },
    {
      id: 'overall-adherence',
      type: 'adherence',
      title: 'Overall Adherence',
      value: 84.2,
      unit: '%',
      trend: 2.1,
      trendPeriod: 'vs last week',
      description: 'Average medication adherence',
      target: 90,
      clickable: true
    },
    {
      id: 'active-alerts',
      type: 'alerts',
      title: 'Active Alerts',
      value: 8,
      unit: '',
      trend: -3,
      trendPeriod: 'vs yesterday',
      description: 'Requiring immediate attention',
      target: 0,
      clickable: true
    },
    {
      id: 'pending-actions',
      type: 'actions',
      title: 'Pending Actions',
      value: 15,
      unit: '',
      trend: -5,
      trendPeriod: 'vs yesterday',
      description: 'Tasks awaiting review',
      target: 0,
      clickable: true
    }
  ];

  const metricsToDisplay = metrics || defaultMetrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {metricsToDisplay?.map((metric) => {
        const colors = getMetricColor(metric?.type, metric?.value, metric?.target);
        const trendInfo = getTrendIcon(metric?.trend);
        const isClickable = metric?.clickable && onCardClick;

        return (
          <div
            key={metric?.id}
            className={`bg-surface rounded-lg border p-6 shadow-medical-sm transition-medical ${
              isClickable 
                ? 'cursor-pointer hover:shadow-medical-md hover:border-primary/30 hover:-translate-y-0.5' 
                : ''
            }`}
            onClick={() => isClickable && onCardClick(metric?.id, metric)}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${colors}`}>
                <Icon name={getMetricIcon(metric?.type)} size={24} />
              </div>
              {isClickable && (
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="ExternalLink"
                  iconSize={16}
                  className="text-text-secondary hover:text-primary opacity-0 group-hover:opacity-100 transition-medical"
                />
              )}
            </div>
            {/* Value */}
            <div className="mb-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-text-primary">
                  {typeof metric?.value === 'number' && metric?.value > 999 
                    ? formatNumber(metric?.value)
                    : metric?.type === 'adherence' 
                      ? formatPercentage(metric?.value)
                      : metric?.value
                  }
                </span>
                {metric?.unit && metric?.type !== 'adherence' && (
                  <span className="text-sm text-text-secondary">{metric?.unit}</span>
                )}
              </div>
              <h3 className="text-sm font-medium text-text-secondary">{metric?.title}</h3>
            </div>
            {/* Description */}
            <p className="text-xs text-text-secondary mb-3">{metric?.description}</p>
            {/* Trend and Target */}
            <div className="flex items-center justify-between">
              {/* Trend */}
              {metric?.trend !== undefined && (
                <div className="flex items-center space-x-1">
                  <Icon name={trendInfo?.icon} size={14} className={trendInfo?.color} />
                  <span className={`text-xs font-medium ${trendInfo?.color}`}>
                    {Math.abs(metric?.trend)}{metric?.type === 'adherence' ? '%' : ''}
                  </span>
                  <span className="text-xs text-text-secondary">{metric?.trendPeriod}</span>
                </div>
              )}

              {/* Target Progress */}
              {metric?.target !== null && metric?.target !== undefined && (
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        metric?.value >= metric?.target ? 'bg-success' :
                        metric?.value >= metric?.target * 0.8 ? 'bg-warning' : 'bg-error'
                      }`}
                      style={{ 
                        width: `${Math.min((metric?.value / metric?.target) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary">
                    {metric?.target}{metric?.type === 'adherence' ? '%' : ''}
                  </span>
                </div>
              )}
            </div>
            {/* Status Indicator */}
            {metric?.type === 'alerts' && metric?.value > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-error">Requires Attention</span>
                </div>
              </div>
            )}
            {metric?.type === 'actions' && metric?.value > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warning rounded-full" />
                  <span className="text-xs font-medium text-warning">Pending Review</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SummaryMetricsCards;
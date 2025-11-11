import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { getAllPatientsWithRiskScores } from '../../../services/realTimeAnalytics';

const PatientAnalyticsRealTime = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Real-time calculation function
  const calculateRealTimeAnalytics = useCallback(() => {
    setIsCalculating(true);
    
    try {
      // Calculate from REAL data only - no mocks
      const realTimeData = getAllPatientsWithRiskScores();
      setAnalyticsData(realTimeData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Real-time calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // Initial calculation
  useEffect(() => {
    calculateRealTimeAnalytics();
  }, [calculateRealTimeAnalytics]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      calculateRealTimeAnalytics();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [autoRefresh, calculateRealTimeAnalytics]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'text-error bg-error/10 border-error/20';
      case 'high': return 'text-warning bg-warning/10 border-warning/20';
      case 'medium': return 'text-primary bg-primary/10 border-primary/20';
      case 'low': return 'text-success bg-success/10 border-success/20';
      case 'excellent': return 'text-success bg-success/10 border-success/20';
      case 'good': return 'text-primary bg-primary/10 border-primary/20';
      case 'declining': return 'text-warning bg-warning/10 border-warning/20';
      default: return 'text-text-secondary bg-muted border-border';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-error text-white';
      case 'high': return 'bg-warning text-white';
      case 'medium': return 'bg-primary text-white';
      default: return 'bg-muted text-text-primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center space-x-2">
              <Icon name="Activity" size={28} className="text-primary" />
              <span>Real-Time Patient Risk Analytics</span>
            </h2>
            <p className="text-text-secondary">
              Combined health deterioration and engagement momentum tracking • All calculations from live data
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm text-text-secondary">Auto-refresh</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconName="RefreshCw"
              iconPosition="left"
              onClick={calculateRealTimeAnalytics}
              disabled={isCalculating}
              className={isCalculating ? 'animate-spin' : ''}
            >
              {isCalculating ? 'Calculating...' : 'Refresh Now'}
            </Button>
          </div>
        </div>

        {/* Last Updated */}
        {lastRefresh && (
          <div className="text-xs text-text-secondary flex items-center space-x-1 mb-4">
            <Icon name="Clock" size={12} />
            <span>Last calculated: {lastRefresh.toLocaleString()}</span>
            {autoRefresh && <span className="ml-2 text-success">• Auto-refresh enabled</span>}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-error/10 border border-error/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="AlertTriangle" size={20} className="text-error" />
              <span className="text-sm font-medium text-error">Critical Risk</span>
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {analyticsData.filter(d => d.combinedLevel === 'critical').length}
            </div>
            <div className="text-xs text-text-secondary mt-1">Immediate action needed</div>
          </div>

          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="AlertCircle" size={20} className="text-warning" />
              <span className="text-sm font-medium text-warning">High Risk</span>
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {analyticsData.filter(d => d.combinedLevel === 'high').length}
            </div>
            <div className="text-xs text-text-secondary mt-1">Close monitoring required</div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Activity" size={20} className="text-primary" />
              <span className="text-sm font-medium text-primary">Medium Risk</span>
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {analyticsData.filter(d => d.combinedLevel === 'medium').length}
            </div>
            <div className="text-xs text-text-secondary mt-1">Regular follow-up</div>
          </div>

          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="CheckCircle" size={20} className="text-success" />
              <span className="text-sm font-medium text-success">Low Risk</span>
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {analyticsData.filter(d => d.combinedLevel === 'low').length}
            </div>
            <div className="text-xs text-text-secondary mt-1">Stable patients</div>
          </div>
        </div>
      </div>

      {/* Patient Risk Cards */}
      <div className="space-y-4">
        {analyticsData.map((data) => (
          <div
            key={data.patient.id}
            className={`bg-surface border-2 rounded-lg p-6 transition-medical hover:shadow-medical-md cursor-pointer ${
              selectedPatient?.id === data.patient.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedPatient(data.patient)}
          >
            {/* Patient Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="User" size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {data.patient.name || 'Unknown Patient'}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    ID: {data.patient.patientId || data.patient.id}
                  </p>
                </div>
              </div>

              {/* Combined Risk Score */}
              <div className={`px-6 py-3 rounded-lg border-2 ${getRiskColor(data.combinedLevel)}`}>
                <div className="text-xs font-medium mb-1">Combined Risk Score</div>
                <div className="text-3xl font-bold">{data.combinedScore}</div>
                <div className="text-xs font-medium capitalize mt-1">{data.combinedLevel} Risk</div>
              </div>
            </div>

            {/* Two Column Layout: Deterioration + Engagement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Health Deterioration Panel */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-text-primary flex items-center space-x-2">
                    <Icon name="Activity" size={18} />
                    <span>Health Deterioration Index</span>
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(data.deterioration.level)}`}>
                    {data.deterioration.score}/100
                  </span>
                </div>

                {/* Deterioration Factors */}
                <div className="space-y-2">
                  {data.deterioration.factors.length > 0 ? (
                    data.deterioration.factors.map((factor, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <Icon 
                          name={factor.type === 'critical' ? 'AlertTriangle' : 'AlertCircle'} 
                          size={16} 
                          className={`mt-0.5 flex-shrink-0 ${
                            factor.type === 'critical' ? 'text-error' : 
                            factor.type === 'high' ? 'text-warning' : 'text-primary'
                          }`}
                        />
                        <div className="flex-1">
                          <span className="text-text-secondary">{factor.message}</span>
                          <span className="text-xs text-text-secondary ml-2">
                            (+{factor.weight} pts)
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-success flex items-center space-x-2">
                      <Icon name="CheckCircle" size={16} />
                      <span>No deterioration factors detected</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Engagement Momentum Panel */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-text-primary flex items-center space-x-2">
                    <Icon name="TrendingUp" size={18} />
                    <span>Engagement Momentum</span>
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(data.engagement.level)}`}>
                    {data.engagement.score}/100
                  </span>
                </div>

                {/* Engagement Alerts */}
                <div className="space-y-2 mb-3">
                  {data.engagement.alerts.length > 0 ? (
                    data.engagement.alerts.map((alert, idx) => (
                      <div key={idx} className={`flex items-start space-x-2 text-sm p-2 rounded ${
                        alert.severity === 'critical' ? 'bg-error/10' :
                        alert.severity === 'high' ? 'bg-warning/10' : 'bg-primary/10'
                      }`}>
                        <Icon 
                          name="AlertTriangle" 
                          size={16} 
                          className={`mt-0.5 flex-shrink-0 ${
                            alert.severity === 'critical' ? 'text-error' : 
                            alert.severity === 'high' ? 'text-warning' : 'text-primary'
                          }`}
                        />
                        <span className="text-text-secondary">{alert.message}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-success flex items-center space-x-2">
                      <Icon name="CheckCircle" size={16} />
                      <span>Good engagement level</span>
                    </p>
                  )}
                </div>

                {/* Trend Metrics */}
                {data.engagement.trendData.length > 0 && (
                  <div className="space-y-2">
                    {data.engagement.trendData.map((trend, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">{trend.metric}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                trend.score >= 80 ? 'bg-success' :
                                trend.score >= 60 ? 'bg-primary' :
                                trend.score >= 40 ? 'bg-warning' : 'bg-error'
                              }`}
                              style={{ width: `${Math.min(trend.score, 100)}%` }}
                            />
                          </div>
                          <Icon 
                            name={trend.trend === 'declining' || trend.trend === 'worsening' ? 'TrendingDown' : 'TrendingUp'} 
                            size={14}
                            className={trend.trend === 'declining' || trend.trend === 'worsening' ? 'text-error' : 'text-success'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Disengagement Prediction */}
                {data.engagement.prediction.risk !== 'low' && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-xs font-medium text-text-secondary mb-1">
                      Disengagement Prediction
                    </div>
                    <div className="text-sm font-semibold text-error">
                      {data.engagement.prediction.risk.toUpperCase()} risk in {data.engagement.prediction.timeframe}
                    </div>
                    <div className="text-xs text-text-secondary">
                      Confidence: {data.engagement.prediction.confidence}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Actions */}
            {data.recommendedActions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold text-text-primary mb-3 flex items-center space-x-2">
                  <Icon name="Zap" size={18} />
                  <span>Recommended Actions</span>
                </h4>
                <div className="space-y-2">
                  {data.recommendedActions.map((rec, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(rec.priority)}`}>
                          {rec.priority.toUpperCase()}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">{rec.action}</p>
                          <p className="text-xs text-text-secondary">{rec.reason}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" iconName="ArrowRight" iconSize={16} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mt-6">
              <Button 
                variant="default" 
                size="sm" 
                iconName="Phone" 
                iconPosition="left"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Calling ${data.patient.name}...`);
                }}
              >
                Call Patient
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                iconName="MessageSquare" 
                iconPosition="left"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Opening chat with ${data.patient.name}...`);
                }}
              >
                Send Message
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                iconName="FileText" 
                iconPosition="left"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/patient-profile?id=${data.patient.id}`;
                }}
              >
                View Profile
              </Button>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-text-secondary mt-4 flex items-center space-x-1">
              <Icon name="Clock" size={12} />
              <span>Last updated: {new Date(data.lastUpdated).toLocaleString()}</span>
            </div>
          </div>
        ))}

        {analyticsData.length === 0 && !isCalculating && (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <Icon name="Users" size={48} className="text-text-secondary/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Patient Data Available</h3>
            <p className="text-text-secondary">Real-time analytics will appear here once patient data is available in your system.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAnalyticsRealTime;

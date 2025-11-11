import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PredictiveAnalytics = ({ predictions, mlModels }) => {
  const [selectedModel, setSelectedModel] = useState(mlModels?.[0]?.id || '');
  const [timeRange, setTimeRange] = useState('7d');

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-error bg-error/10 border-error';
      case 'medium': return 'text-warning bg-warning/10 border-warning';
      case 'low': return 'text-success bg-success/10 border-success';
      default: return 'text-text-secondary bg-muted border-border';
    }
  };

  const getModelStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success bg-success/10';
      case 'training': return 'text-warning bg-warning/10';
      case 'error': return 'text-error bg-error/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const filteredPredictions = predictions?.filter(prediction => {
    const now = new Date();
    const predictionDate = new Date(prediction.timestamp);
    const daysDiff = Math.floor((now - predictionDate) / (1000 * 60 * 60 * 24));
    
    switch (timeRange) {
      case '1d': return daysDiff <= 1;
      case '7d': return daysDiff <= 7;
      case '30d': return daysDiff <= 30;
      default: return true;
    }
  });

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Predictive Analytics</h3>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e?.target?.value)}
            className="px-3 py-1 border border-border rounded-lg bg-input text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button variant="outline" size="sm" iconName="RefreshCw" iconPosition="left">
            Refresh
          </Button>
        </div>
      </div>
      {/* ML Models Status */}
      <div className="mb-6">
        <h4 className="font-medium text-text-primary mb-3">ML Models Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mlModels?.map((model) => (
            <div key={model?.id} className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-text-primary">{model?.name}</h5>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getModelStatusColor(model?.status)}`}>
                  {model?.status}
                </span>
              </div>
              <p className="text-sm text-text-secondary mb-3">{model?.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Accuracy</span>
                  <span className="text-text-primary font-medium">{model?.accuracy}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${model?.accuracy}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Last trained: {new Date(model.lastTrained)?.toLocaleDateString()}</span>
                  <span>{model?.predictions} predictions</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Risk Predictions */}
      <div className="mb-6">
        <h4 className="font-medium text-text-primary mb-3">High-Risk Predictions</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {filteredPredictions?.filter(p => p?.riskLevel === 'high')?.slice(0, 5)?.map((prediction) => (
            <div key={prediction?.id} className={`p-4 rounded-lg border ${getRiskColor(prediction?.riskLevel)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="AlertTriangle" size={16} className="text-error" />
                    <h5 className="font-medium text-text-primary">{prediction?.patientName}</h5>
                    <span className="text-xs text-text-secondary">
                      ID: {prediction?.patientId}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{prediction?.prediction}</p>
                  <div className="flex items-center space-x-4 text-xs text-text-secondary">
                    <span>Confidence: {prediction?.confidence}%</span>
                    <span>Model: {prediction?.modelUsed}</span>
                    <span>{new Date(prediction.timestamp)?.toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="ExternalLink"
                  iconSize={14}
                  onClick={() => window.location.href = `/patient-profile/${prediction?.patientId}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Prediction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-error/10 rounded-lg">
          <div className="text-2xl font-bold text-error">
            {filteredPredictions?.filter(p => p?.riskLevel === 'high')?.length}
          </div>
          <div className="text-sm text-error">High Risk</div>
        </div>
        <div className="text-center p-4 bg-warning/10 rounded-lg">
          <div className="text-2xl font-bold text-warning">
            {filteredPredictions?.filter(p => p?.riskLevel === 'medium')?.length}
          </div>
          <div className="text-sm text-warning">Medium Risk</div>
        </div>
        <div className="text-center p-4 bg-success/10 rounded-lg">
          <div className="text-2xl font-bold text-success">
            {filteredPredictions?.filter(p => p?.riskLevel === 'low')?.length}
          </div>
          <div className="text-sm text-success">Low Risk</div>
        </div>
      </div>
      {/* Model Insights */}
      <div className="border-t border-border pt-4 mt-6">
        <h4 className="font-medium text-text-primary mb-3">Model Insights</h4>
        <div className="bg-muted rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-text-primary mb-2">Top Risk Factors</h5>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li>• Medication non-adherence (34%)</li>
                <li>• Missed appointments (28%)</li>
                <li>• Abnormal vital signs (22%)</li>
                <li>• Age &gt; 65 years (16%)</li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-text-primary mb-2">Prediction Accuracy Trends</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">This Week</span>
                  <span className="text-success">+2.3%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">This Month</span>
                  <span className="text-success">+5.7%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Overall</span>
                  <span className="text-text-primary">87.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
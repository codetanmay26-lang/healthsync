import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AISuggestions = ({ suggestions, onAcceptSuggestion, onDismissSuggestion }) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [filter, setFilter] = useState('all');

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'medication': return 'Pill';
      case 'dosage': return 'Calculator';
      case 'risk': return 'AlertTriangle';
      case 'lifestyle': return 'Heart';
      case 'monitoring': return 'Eye';
      default: return 'Brain';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-error bg-error/5 text-error';
      case 'medium': return 'border-warning bg-warning/5 text-warning';
      case 'low': return 'border-success bg-success/5 text-success';
      default: return 'border-border bg-muted text-text-secondary';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 70) return 'text-warning';
    return 'text-error';
  };

  const filteredSuggestions = suggestions?.filter(suggestion => {
    if (filter === 'all') return true;
    return suggestion?.type === filter;
  });

  const suggestionTypes = [
    { key: 'all', label: 'All Suggestions' },
    { key: 'medication', label: 'Medication' },
    { key: 'dosage', label: 'Dosage' },
    { key: 'risk', label: 'Risk Assessment' },
    { key: 'lifestyle', label: 'Lifestyle' },
    { key: 'monitoring', label: 'Monitoring' }
  ];

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon name="Brain" size={24} className="text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">AI Suggestions</h2>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
              {filteredSuggestions?.length} Active
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {suggestionTypes?.map((type) => (
            <button
              key={type?.key}
              onClick={() => setFilter(type?.key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-medical ${
                filter === type?.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-text-secondary hover:bg-muted/80'
              }`}
            >
              {type?.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {filteredSuggestions?.map((suggestion) => (
            <div
              key={suggestion?.id}
              className={`border rounded-lg p-4 transition-medical ${getPriorityColor(suggestion?.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={getSuggestionIcon(suggestion?.type)} size={20} className="text-primary" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-text-primary">{suggestion?.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(suggestion?.priority)}`}>
                        {suggestion?.priority} Priority
                      </span>
                      <div className="flex items-center space-x-1">
                        <Icon name="Target" size={14} className={getConfidenceColor(suggestion?.confidence)} />
                        <span className={`text-xs font-medium ${getConfidenceColor(suggestion?.confidence)}`}>
                          {suggestion?.confidence}% Confidence
                        </span>
                      </div>
                    </div>

                    <p className="text-text-secondary mb-3">{suggestion?.description}</p>

                    {/* Evidence */}
                    <div className="bg-muted rounded-lg p-3 mb-3">
                      <h4 className="font-medium text-text-primary mb-2">Supporting Evidence</h4>
                      <ul className="space-y-1">
                        {suggestion?.evidence?.map((item, index) => (
                          <li key={index} className="text-sm text-text-secondary flex items-start space-x-2">
                            <Icon name="Check" size={14} className="text-success mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-text-primary">Recommended Actions</h4>
                      {suggestion?.recommendations?.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <Icon name="ArrowRight" size={14} className="text-primary mt-0.5" />
                          <span className="text-text-secondary">{rec}</span>
                        </div>
                      ))}
                    </div>

                    {/* Risk Factors */}
                    {suggestion?.riskFactors && suggestion?.riskFactors?.length > 0 && (
                      <div className="mt-3 bg-warning/10 border border-warning/20 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
                          <div>
                            <h4 className="font-medium text-warning mb-1">Risk Considerations</h4>
                            <ul className="space-y-1">
                              {suggestion?.riskFactors?.map((risk, index) => (
                                <li key={index} className="text-sm text-text-secondary">
                                  • {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="mt-3 flex items-center space-x-4 text-sm text-text-secondary">
                      <div className="flex items-center space-x-1">
                        <Icon name="Clock" size={14} />
                        <span>Generated: {suggestion?.generatedAt}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Calendar" size={14} />
                        <span>Review by: {suggestion?.reviewBy}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Eye"
                    onClick={() => setSelectedSuggestion(suggestion)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Check"
                    onClick={() => onAcceptSuggestion(suggestion)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="X"
                    onClick={() => onDismissSuggestion(suggestion)}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              {selectedSuggestion?.id === suggestion?.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">Data Sources</h4>
                      <div className="space-y-1">
                        {suggestion?.dataSources?.map((source, index) => (
                          <div key={index} className="text-sm text-text-secondary flex items-center space-x-2">
                            <Icon name="Database" size={14} />
                            <span>{source}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">Model Information</h4>
                      <div className="space-y-1 text-sm text-text-secondary">
                        <div>Model: {suggestion?.modelInfo?.name}</div>
                        <div>Version: {suggestion?.modelInfo?.version}</div>
                        <div>Training Data: {suggestion?.modelInfo?.trainingData}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredSuggestions?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Brain" size={48} className="text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No AI Suggestions</h3>
            <p className="text-text-secondary">
              {filter === 'all' ?'No AI suggestions are currently available for this patient.'
                : `No ${filter} suggestions are currently available.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISuggestions;
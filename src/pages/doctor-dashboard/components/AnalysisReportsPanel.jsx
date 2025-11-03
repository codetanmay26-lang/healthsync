import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button.jsx';
import { useNavigate } from 'react-router-dom';

export default function AnalysisReportsPanel() {
  const [analyses, setAnalyses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load only UNREVIEWED analyses
    const storedAnalyses = JSON.parse(localStorage.getItem('doctorAnalyses') || '[]');
    const unreviewedAnalyses = storedAnalyses.filter(analysis => !analysis.reviewed);
    
    // Load adherence reports and doctor alerts for medication adherence
    const adherenceReports = JSON.parse(localStorage.getItem('adherenceReports') || '[]');
    const doctorAlerts = JSON.parse(localStorage.getItem('doctorAlerts') || '[]');
    
    // Combine AI analysis reports with adherence alerts
    const adherenceAlerts = doctorAlerts.filter(alert => alert.active && alert.type === 'medication');
    
    // Transform adherence alerts to match analysis format
    const transformedAdherenceAlerts = adherenceAlerts.map(alert => ({
      id: alert.id,
      type: 'adherence',
      patientName: alert.patientId,
      timestamp: alert.timestamp,
      analysis: alert.message,
      reviewed: false,
      priority: alert.priority || 'high'
    }));
    
    // Show adherence alerts along with AI analysis reports
    setAnalyses([...transformedAdherenceAlerts, ...unreviewedAnalyses].reverse());
  }, []);

  const markAsReviewed = (analysisId) => {
    // Check if it's an adherence alert or regular analysis
    const currentItem = analyses.find(item => item.id === analysisId);
    
    if (currentItem.type === 'adherence') {
      // Handle adherence alert
      const allAlerts = JSON.parse(localStorage.getItem('doctorAlerts') || '[]');
      const updatedAlerts = allAlerts.map(alert => 
        alert.id === analysisId 
          ? { ...alert, active: false, reviewedAt: new Date().toLocaleString() }
          : alert
      );
      localStorage.setItem('doctorAlerts', JSON.stringify(updatedAlerts));
    } else {
      // Handle regular analysis
      const allAnalyses = JSON.parse(localStorage.getItem('doctorAnalyses') || '[]');
      const updatedAnalyses = allAnalyses.map(analysis => 
        analysis.id === analysisId 
          ? { ...analysis, reviewed: true, reviewedAt: new Date().toLocaleString() }
          : analysis
      );
      localStorage.setItem('doctorAnalyses', JSON.stringify(updatedAnalyses));
    }
    
    // Remove from current view
    setAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
  };

  const getAnalysisTypeDisplay = (analysis) => {
    if (analysis.type === 'adherence') {
      return {
        title: '🚨 Medication Adherence Alert',
        color: 'border-red-200 bg-red-50',
        headerColor: 'text-red-900'
      };
    }
    return {
      title: '🤖 AI Analysis Report',
      color: 'border-gray-200',
      headerColor: 'text-gray-900'
    };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          📋 New Reports & Alerts ({analyses.length})
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/doctor-dashboard/reviewed-reports')}
        >
          View Reviewed Reports
        </Button>
      </div>
      
      <div className="space-y-4">
        {analyses.map((analysis) => {
          const displayInfo = getAnalysisTypeDisplay(analysis);
          
          return (
            <div key={analysis.id} className={`border rounded-lg p-4 ${displayInfo.color}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className={`font-medium ${displayInfo.headerColor}`}>
                    {displayInfo.title}
                  </h4>
                  <p className="font-medium text-gray-900">
                    Patient: {analysis.patientName || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {analysis.type === 'adherence' ? 'Alert Time' : 'Analyzed'}: {new Date(analysis.timestamp).toLocaleString()}
                  </p>
                  {analysis.priority && (
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      analysis.priority === 'high' ? 'bg-red-200 text-red-800' :
                      analysis.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {analysis.priority.toUpperCase()} PRIORITY
                    </span>
                  )}
                </div>
                
                <Button 
                  size="sm"
                  onClick={() => markAsReviewed(analysis.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Mark as Reviewed
                </Button>
              </div>
              
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="whitespace-pre-line text-gray-800">
                  {analysis.analysis}
                </div>
              </div>
              
              {analysis.type === 'adherence' && (
                <div className="mt-3 pt-2 border-t border-red-200">
                  <p className="text-xs text-red-700 font-medium">
                    ⚠️ This patient requires immediate attention for medication compliance
                  </p>
                </div>
              )}
            </div>
          );
        })}
        
        {analyses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No new reports or alerts</p>
            <p className="text-sm">AI analysis reports and medication adherence alerts will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

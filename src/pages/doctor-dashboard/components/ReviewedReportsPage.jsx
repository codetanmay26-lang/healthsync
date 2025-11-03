import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button.jsx';
import { useNavigate } from 'react-router-dom';

export default function ReviewedReportsPage() {
  const [reviewedAnalyses, setReviewedAnalyses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load only REVIEWED analyses
    const storedAnalyses = JSON.parse(localStorage.getItem('doctorAnalyses') || '[]');
    const reviewed = storedAnalyses.filter(analysis => analysis.reviewed);
    setReviewedAnalyses(reviewed.reverse());
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          ✅ Reviewed Reports ({reviewedAnalyses.length})
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/doctor-dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
      
      <div className="space-y-4">
        {reviewedAnalyses.map((analysis) => (
          <div key={analysis.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">
                  Patient: {analysis.patientName || 'Unknown'}
                </h4>
                <p className="text-sm text-gray-600">
                  Analyzed: {new Date(analysis.timestamp).toLocaleString()}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  ✓ Reviewed: {analysis.reviewedAt}
                </p>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded text-sm border">
              <div className="whitespace-pre-line text-gray-800">
                {analysis.analysis}
              </div>
            </div>
          </div>
        ))}
        
        {reviewedAnalyses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No reviewed reports yet</p>
            <p className="text-sm">Reports you mark as reviewed will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

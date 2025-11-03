import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const LabReportsViewer = ({ labReports, onUploadReport, onViewReport }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'blood': return 'Droplet';
      case 'urine': return 'TestTube';
      case 'xray': return 'Scan';
      case 'mri': return 'Brain';
      case 'ct': return 'Scan';
      default: return 'FileText';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-success bg-success/10';
      case 'abnormal': return 'text-error bg-error/10';
      case 'pending': return 'text-warning bg-warning/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setViewMode('detail');
    if (onViewReport) {
      onViewReport(report);
    }
  };

  const renderReportDetail = () => {
    if (!selectedReport) return null;

    return (
      <div className="space-y-6">
        {/* Report Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            iconName="ArrowLeft"
            iconPosition="left"
            onClick={() => setViewMode('list')}
          >
            Back to Reports
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
            >
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Share"
              iconPosition="left"
            >
              Share
            </Button>
          </div>
        </div>
        {/* Report Info */}
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name={getReportTypeIcon(selectedReport?.type)} size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary mb-1">{selectedReport?.title}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-text-secondary">Date:</span>
                  <p className="font-medium text-text-primary">{selectedReport?.date}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Type:</span>
                  <p className="font-medium text-text-primary capitalize">{selectedReport?.type}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedReport?.status)}`}>
                    {selectedReport?.status}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary">Doctor:</span>
                  <p className="font-medium text-text-primary">{selectedReport?.doctor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Report Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Document */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <h4 className="font-medium text-text-primary mb-4">Original Document</h4>
            {selectedReport?.fileType === 'pdf' ? (
              <div className="bg-muted rounded-lg p-8 text-center">
                <Icon name="FileText" size={48} className="text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary mb-4">PDF Document</p>
                <Button variant="outline" size="sm">View PDF</Button>
              </div>
            ) : (
              <Image
                src={selectedReport?.imageUrl}
                alt={selectedReport?.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
          </div>

          {/* AI Analysis */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <h4 className="font-medium text-text-primary mb-4">AI Analysis Results</h4>
            <div className="space-y-4">
              {selectedReport?.aiAnalysis?.map((analysis, index) => (
                <div key={index} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-text-primary">{analysis?.parameter}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(analysis?.status)}`}>
                      {analysis?.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Value:</span>
                      <p className="font-medium text-text-primary">{analysis?.value}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Reference:</span>
                      <p className="font-medium text-text-primary">{analysis?.reference}</p>
                    </div>
                  </div>
                  {analysis?.notes && (
                    <p className="text-sm text-text-secondary mt-2">{analysis?.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* AI Recommendations */}
        {selectedReport?.aiRecommendations && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="Brain" size={20} className="text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-primary mb-2">AI Recommendations</h4>
                <ul className="space-y-1">
                  {selectedReport?.aiRecommendations?.map((recommendation, index) => (
                    <li key={index} className="text-sm text-text-secondary">
                      • {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReportsList = () => (
    <div className="space-y-4">
      {labReports?.map((report) => (
        <div
          key={report?.id}
          className="border border-border rounded-lg p-4 hover:shadow-medical-sm transition-medical cursor-pointer"
          onClick={() => handleReportClick(report)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={getReportTypeIcon(report?.type)} size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-text-primary">{report?.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(report?.status)}`}>
                    {report?.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Date:</span>
                    <p className="font-medium text-text-primary">{report?.date}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Type:</span>
                    <p className="font-medium text-text-primary capitalize">{report?.type}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Doctor:</span>
                    <p className="font-medium text-text-primary">{report?.doctor}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Results:</span>
                    <p className="font-medium text-text-primary">{report?.keyFindings}</p>
                  </div>
                </div>
              </div>
            </div>
            <Icon name="ChevronRight" size={20} className="text-text-secondary" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="FileText" size={24} className="text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">Lab Reports</h2>
          </div>
          <Button
            variant="default"
            size="sm"
            iconName="Upload"
            iconPosition="left"
            onClick={onUploadReport}
          >
            Upload Report
          </Button>
        </div>
      </div>
      <div className="p-6">
        {viewMode === 'list' ? renderReportsList() : renderReportDetail()}

        {labReports?.length === 0 && viewMode === 'list' && (
          <div className="text-center py-12">
            <Icon name="FileText" size={48} className="text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Lab Reports</h3>
            <p className="text-text-secondary mb-4">No lab reports have been uploaded yet.</p>
            <Button
              variant="default"
              iconName="Upload"
              iconPosition="left"
              onClick={onUploadReport}
            >
              Upload First Report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabReportsViewer;
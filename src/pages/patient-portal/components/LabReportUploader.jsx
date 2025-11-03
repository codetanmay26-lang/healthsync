import React, { useState } from 'react';
import Button from '../../../components/ui/Button.jsx';
import { analyzeLabReport, sendAnalysisToDoctor } from '../../../utils/aiAnalysis';
import pdfToText from 'react-pdftotext';
import jsPDF from 'jspdf'; 

export default function LabReportUploader({ patientInfo, doctorId }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({});

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      uploadDate: new Date().toLocaleDateString(),
      analyzed: false
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const extractTextFromFile = async (file) => {
    try {
      let text = '';
      
      // Handle different file types
      if (file.type === 'application/pdf') {
        // Extract text from PDF
        text = await pdfToText(file);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        // Read text files directly
        text = await file.text();
      } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        // Read CSV files as text
        text = await file.text();
      } else {
        // Try to read as text anyway
        text = await file.text();
      }
      
      // Check if we got meaningful content
      if (!text || text.trim().length < 10) {
        alert('File seems empty or could not be read. Please try uploading a text file or PDF.');
        return null;
      }
      
      // Clean up the extracted text (remove extra spaces and line breaks)
      const cleanText = text.replace(/\s+/g, ' ').trim();
      
      return cleanText;
      
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Could not read this file. Please make sure it\'s a valid PDF or text file.');
      return null;
    }
  };

  const handleAnalyzeAndSend = async (reportFile) => {
    setAnalyzing(true);
    
    try {
      const reportText = await extractTextFromFile(reportFile.file);
      
      // Stop if we couldn't read the file
      if (!reportText) {
        setAnalyzing(false);
        return;
      }
      
      const analysisResult = await analyzeLabReport(reportText, patientInfo);
      
      if (analysisResult.success) {
        // Send to doctor (stored locally)
        sendAnalysisToDoctor(analysisResult, doctorId, patientInfo.id);
        
        // Update UI with analysis
        setAnalysisResults(prev => ({
          ...prev,
          [reportFile.id]: {
            ...analysisResult,
            sentAt: new Date().toLocaleString()
          }
        }));
        
        // Mark as analyzed
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === reportFile.id ? { ...f, analyzed: true } : f
          )
        );
        
        alert('Report analyzed successfully!');
      } else {
        alert('Error: ' + analysisResult.error);
      }
    } catch (error) {
      alert('Analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadAnalysisAsPDF = (analysis, reportName) => {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(16);
    pdf.text('Medical Lab Report Analysis', 20, 30);
    
    // Add report name
    pdf.setFontSize(12);
    pdf.text(`Report: ${reportName}`, 20, 50);
    pdf.text(`Patient: ${patientInfo.name}`, 20, 65);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80);
    
    // Add analysis content
    pdf.setFontSize(10);
    const splitText = pdf.splitTextToSize(analysis, 170);
    pdf.text(splitText, 20, 100);
    
    // Download the PDF
    pdf.save(`${reportName}_analysis.pdf`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Lab Reports</h3>
        <Button variant="outline" size="sm">
          <label className="cursor-pointer">
            Upload Report
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </Button>
      </div>

      <div className="space-y-4">
        {uploadedFiles.map((report) => (
          <div key={report.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{report.name}</p>
                <p className="text-sm text-gray-500">Uploaded: {report.uploadDate}</p>
              </div>
              
              <div className="flex gap-2">
                {/* Download Analysis button - only shows after analysis */}
                {report.analyzed && analysisResults[report.id] && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadAnalysisAsPDF(
                      analysisResults[report.id].analysis, 
                      report.name
                    )}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Download Analysis
                  </Button>
                )}
                
                {/* AI Analyze button - only shows before analysis */}
                {!report.analyzed && (
                  <Button 
                    size="sm"
                    onClick={() => handleAnalyzeAndSend(report)}
                    disabled={analyzing}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {analyzing ? 'Analyzing...' : 'AI Analyze'}
                  </Button>
                )}
                
                {/* Status indicator - shows after analysis */}
                {report.analyzed && (
                  <Button variant="outline" size="sm" disabled className="text-green-600">
                    ✓ Analyzed
                  </Button>
                )}
              </div>
            </div>
            
            {/* Show AI Analysis Results */}
            {analysisResults[report.id] && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-blue-900">🤖 AI Analysis</h4>
                  <span className="text-xs text-blue-600">
                    Analyzed: {analysisResults[report.id].sentAt}
                  </span>
                </div>
                <div className="text-sm text-blue-800 whitespace-pre-line">
                  {analysisResults[report.id].analysis}
                </div>
                <div className="mt-3 pt-2 border-t border-blue-200">
                  <p className="text-xs text-green-700 font-medium">
                    ✓ Analysis sent to your doctor
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {uploadedFiles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No reports uploaded yet</p>
            <p className="text-sm">Upload lab reports for AI analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}

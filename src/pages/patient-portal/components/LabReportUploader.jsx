import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import Button from "../../../components/ui/Button.jsx";
import {
  analyzeLabReport,
  sendAnalysisToDoctor,
} from "../../../utils/aiAnalysis";
import pdfToText from "react-pdftotext";
import jsPDF from "jspdf";

export default function LabReportUploader({ patientInfo, doctorId }) {
  const { user } = useAuth(); // ✅ GET LOGGED-IN USER
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({});

  // ✅ USE REAL PATIENT ID
  const realPatientId = user?.id || patientInfo?.id || 'guest';

  // Professional medical report formatting (not AI-looking)
// Simple, professional medical report format
const formatAnalysisText = (text) => {
  if (!text) return null;

  let cleanText = text.replace(/\*/g, "");
  const lines = cleanText.split("\n").filter((line) => line.trim());

  const sections = [];
  let currentSection = { title: '', items: [] };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    const isTitle = index === 0;
    const isSectionHeading = /^\d+\.\s*[A-Z]/.test(trimmedLine);
    const hasAbnormal = /\b(High|HIGH|Low|LOW|Critical|CRITICAL|Abnormal|ABNORMAL)\b/i.test(trimmedLine);

    if (isTitle) {
      currentSection.title = trimmedLine;
    } else if (isSectionHeading) {
      if (currentSection.items.length > 0) {
        sections.push({ ...currentSection });
      }
      currentSection = { title: trimmedLine, items: [] };
    } else {
      currentSection.items.push({ text: trimmedLine, abnormal: hasAbnormal });
    }
  });

  if (currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  return (
    <div className="space-y-4">
      {/* Simple Header */}
      <div className="border-b-2 border-gray-800 pb-2">
        <h4 className="text-base font-bold text-gray-900 uppercase tracking-wide">
          Laboratory Analysis Report
        </h4>
        <p className="text-xs text-gray-600 mt-1">{new Date().toLocaleDateString()}</p>
      </div>

      {/* Sections - Clean & Simple */}
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-2">
          <h5 className="font-semibold text-gray-800 text-sm border-l-3 border-blue-600 pl-3">
            {section.title}
          </h5>
          
          <div className="space-y-1 pl-3">
            {section.items.map((item, i) => (
              <div key={i} className="flex items-start text-sm">
                <span className="text-gray-400 mr-2">•</span>
                <p className="text-gray-700 leading-relaxed">
                  {item.text.split(/\b(High|HIGH|Low|LOW|Critical|CRITICAL|Abnormal|ABNORMAL)\b/i).map((part, j) => {
                    if (/^(Critical|CRITICAL)$/i.test(part)) {
                      return <strong key={j} className="text-red-700 font-bold">{part.toUpperCase()}</strong>;
                    } else if (/^(High|HIGH)$/i.test(part)) {
                      return <strong key={j} className="text-red-600">{part.toUpperCase()}</strong>;
                    } else if (/^(Low|LOW)$/i.test(part)) {
                      return <strong key={j} className="text-orange-600">{part.toUpperCase()}</strong>;
                    } else if (/^(Abnormal|ABNORMAL)$/i.test(part)) {
                      return <strong key={j} className="text-yellow-700">{part.toUpperCase()}</strong>;
                    }
                    return part;
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Simple Footer */}
      <div className="border-t border-gray-300 pt-3 mt-4">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> This analysis should be reviewed by your physician. Abnormal values require medical attention.
        </p>
      </div>
    </div>
  );
};
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      uploadDate: new Date().toLocaleDateString(),
      analyzed: false,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const extractTextFromFile = async (file) => {
    try {
      let text = "";

      if (file.type === "application/pdf") {
        text = await pdfToText(file);
      } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        text = await file.text();
      } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        text = await file.text();
      } else {
        text = await file.text();
      }

      if (!text || text.trim().length < 10) {
        alert("File seems empty or could not be read. Please try uploading a text file or PDF.");
        return null;
      }

      const cleanText = text.replace(/\s+/g, " ").trim();
      return cleanText;
    } catch (error) {
      console.error("Error extracting text:", error);
      alert("Could not read this file. Please make sure it's a valid PDF or text file.");
      return null;
    }
  };

  const handleAnalyzeAndSend = async (reportFile) => {
    if (!user || user.role !== 'patient') {
      alert('You must be logged in as a patient to analyze reports');
      return;
    }

    setAnalyzing(true);

    try {
      const reportText = await extractTextFromFile(reportFile.file);

      if (!reportText) {
        setAnalyzing(false);
        return;
      }

      const analysisResult = await analyzeLabReport(reportText, {
        ...patientInfo,
        id: realPatientId,
        name: user?.name || patientInfo?.name
      });

      if (analysisResult.success) {
        // ✅ SAVE LAB REPORT WITH REAL PATIENT ID
        const labReport = {
          id: `lab_${Date.now()}`,
          patientId: realPatientId,  // ✅ REAL PATIENT ID
          patientName: user?.name || patientInfo?.name,
          doctorId: doctorId || 'unassigned',
          reportType: 'lab_analysis',
          fileName: reportFile.name,
          fileSize: reportFile.file.size,
          fileType: reportFile.file.type,
          analysisText: analysisResult.analysis,
          uploadDate: new Date().toISOString(),
          status: 'analyzed',
          reviewed: false
        };

        // Save to localStorage
        const existingReports = JSON.parse(localStorage.getItem('labReports') || '[]');
        existingReports.push(labReport);
        localStorage.setItem('labReports', JSON.stringify(existingReports));

        // Send to doctor
        sendAnalysisToDoctor(analysisResult, doctorId, realPatientId);

        // Update UI
        setAnalysisResults((prev) => ({
          ...prev,
          [reportFile.id]: {
            ...analysisResult,
            sentAt: new Date().toLocaleString(),
          },
        }));

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === reportFile.id ? { ...f, analyzed: true } : f
          )
        );

        console.log('✅ Lab report saved with patient ID:', realPatientId);
        alert("Report analyzed successfully!");
      } else {
        alert("Error: " + analysisResult.error);
      }
    } catch (error) {
      alert("Analysis failed: " + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadAnalysisAsPDF = (analysis, reportName) => {
    const pdf = new jsPDF();
    let yPosition = 30;

    // Add title
    pdf.setFontSize(16);
    pdf.setFont(undefined, "bold");
    pdf.text("Medical Lab Report Analysis", 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont(undefined, "normal");
    pdf.text(`Report: ${reportName}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Patient: ${user?.name || patientInfo?.name}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;

    const cleanText = analysis.replace(/\*/g, "");
    const lines = cleanText.split("\n").filter((line) => line.trim());

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      const isFirstLine = index === 0;
      const isNumberedHeading = /^\d+\.\s*[A-Z]/.test(trimmedLine);

      if (isNumberedHeading && yPosition > 100) {
        yPosition += 5;
      }

      if (isFirstLine) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.setTextColor(0, 0, 0);
      } else if (isNumberedHeading) {
        pdf.setFontSize(11);
        pdf.setFont(undefined, "bold");
        pdf.setTextColor(41, 83, 124);
      } else {
        pdf.setFontSize(10);
        pdf.setFont(undefined, "normal");
        pdf.setTextColor(60, 60, 60);
      }

      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      const xPosition = isFirstLine || isNumberedHeading ? 20 : 25;
      if (!isFirstLine && !isNumberedHeading) {
        pdf.text("•", 20, yPosition);
      }

      let displayText = trimmedLine;
      if (/\b(High|HIGH|Critical|CRITICAL)\b/i.test(trimmedLine)) {
        pdf.setTextColor(220, 38, 38);
      } else if (/\b(Low|LOW)\b/i.test(trimmedLine)) {
        pdf.setTextColor(251, 146, 60);
      }

      const splitText = pdf.splitTextToSize(displayText, 170);
      pdf.text(splitText, xPosition, yPosition);
      yPosition += splitText.length * 7;
    });

    pdf.setTextColor(0, 0, 0);
    pdf.save(`${reportName}_analysis.pdf`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Laboratory Reports</h3>
          <p className="text-sm text-gray-500 mt-1">Upload and analyze your medical lab reports</p>
          <p className="text-xs text-gray-400 mt-1">Uploading as: {user?.name} (ID: {realPatientId})</p>
        </div>
        <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
          <label className="cursor-pointer flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
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
          <div
            key={report.id}
            className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <p className="font-semibold text-gray-900">{report.name}</p>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-7">
                  Uploaded on {report.uploadDate}
                </p>
              </div>

              <div className="flex gap-2">
                {report.analyzed && analysisResults[report.id] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAnalysisAsPDF(analysisResults[report.id].analysis, report.name)}
                    className="bg-green-600 hover:bg-green-700 text-white border-0"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </Button>
                )}

                {!report.analyzed && (
                  <Button
                    size="sm"
                    onClick={() => handleAnalyzeAndSend(report)}
                    disabled={analyzing}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {analyzing ? "Analyzing..." : "Analyze Report"}
                  </Button>
                )}

                {report.analyzed && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Analyzed
                  </span>
                )}
              </div>
            </div>

            {/* Professional Analysis Display */}
            {analysisResults[report.id] && (
              <div className="mt-6 border-t-2 border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Analysis Report</h4>
                      <p className="text-xs text-gray-500">Generated {analysisResults[report.id].sentAt}</p>
                    </div>
                  </div>
                </div>

                {formatAnalysisText(analysisResults[report.id].analysis)}

                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center text-green-700">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Analysis sent to your doctor</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {uploadedFiles.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-600 font-medium">No lab reports uploaded</p>
            <p className="text-sm text-gray-500 mt-1">Upload your lab reports to get instant AI analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}

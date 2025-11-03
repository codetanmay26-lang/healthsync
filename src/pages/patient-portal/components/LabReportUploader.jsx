import React, { useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import {
  analyzeLabReport,
  sendAnalysisToDoctor,
} from "../../../utils/aiAnalysis";
import pdfToText from "react-pdftotext";
import jsPDF from "jspdf";

export default function LabReportUploader({ patientInfo, doctorId }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({});

  // Format AI analysis text with enhanced styling
  const formatAnalysisText = (text) => {
    if (!text) return null;

    // Remove all asterisks
    let cleanText = text.replace(/\*/g, "");

    // Split into lines and process each
    const lines = cleanText.split("\n").filter((line) => line.trim());

    const elements = [];
    let bulletItems = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Check if line is the first line (title/heading)
      const isFirstLine = index === 0;

      // Check if line starts with a number (numbered point/sub heading like "1. Main findings")
      const isNumberedHeading = /^\d+\.\s*[A-Z]/.test(trimmedLine);

      // Check if line contains "High" or "Low"
      const hasHigh = /\b(High|HIGH)\b/i.test(trimmedLine);
      const hasLow = /\b(Low|LOW)\b/i.test(trimmedLine);

      // Determine styling
      let fontSizeClass = "text-sm";

      if (isFirstLine) {
        fontSizeClass = "text-base";
      } else if (isNumberedHeading) {
        fontSizeClass = "text-base";
      }

      // Format the line with highlighted High/Low
      const formattedContent =
        hasHigh || hasLow ? (
          <span
            style={
              isNumberedHeading
                ? { color: "#29537C" }
                : !isFirstLine
                ? { color: "#FF7F7F" }
                : {}
            }
          >
            {trimmedLine.split(/\b(High|HIGH|Low|LOW)\b/i).map((part, i) => {
              if (/^(High|HIGH)$/i.test(part)) {
                return (
                  <span
                    key={i}
                    className="text-red-600 font-bold bg-red-50 px-1 rounded"
                  >
                    {part}
                  </span>
                );
              } else if (/^(Low|LOW)$/i.test(part)) {
                return (
                  <span
                    key={i}
                    className="text-red-400 font-bold bg-red-50 px-1 rounded"
                  >
                    {part}
                  </span>
                );
              }
              return part;
            })}
          </span>
        ) : (
          <span
            style={
              isNumberedHeading
                ? { color: "#29537C" }
                : !isFirstLine
                ? { color: "#FF7F7F" }
                : {}
            }
          >
            {trimmedLine}
          </span>
        );

      // First line or numbered headings render as divs (no bullets)
      if (isFirstLine) {
        // Push any accumulated bullet items first
        if (bulletItems.length > 0) {
          elements.push(
            <ul
              key={`ul-${elements.length}`}
              className="space-y-1 list-disc list-inside ml-4 mb-2"
            >
              {bulletItems}
            </ul>
          );
          bulletItems = [];
        }
        elements.push(
          <div
            key={index}
            className="text-blue-900 font-semibold text-base mb-2"
          >
            {formattedContent}
          </div>
        );
      } else if (isNumberedHeading) {
        // Push any accumulated bullet items first
        if (bulletItems.length > 0) {
          elements.push(
            <ul
              key={`ul-${elements.length}`}
              className="space-y-1 list-disc list-inside ml-4 mb-2"
            >
              {bulletItems}
            </ul>
          );
          bulletItems = [];
        }
        elements.push(
          <div key={index} className="font-semibold text-base mt-3 mb-1">
            {formattedContent}
          </div>
        );
      } else {
        // Regular lines become bullet points
        bulletItems.push(
          <li key={index} className={`${fontSizeClass} leading-relaxed`}>
            {formattedContent}
          </li>
        );
      }
    });

    // Push any remaining bullet items
    if (bulletItems.length > 0) {
      elements.push(
        <ul
          key={`ul-${elements.length}`}
          className="space-y-1 list-disc list-inside ml-4"
        >
          {bulletItems}
        </ul>
      );
    }

    return elements;
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

      // Handle different file types
      if (file.type === "application/pdf") {
        // Extract text from PDF
        text = await pdfToText(file);
      } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        // Read text files directly
        text = await file.text();
      } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        // Read CSV files as text
        text = await file.text();
      } else {
        // Try to read as text anyway
        text = await file.text();
      }

      // Check if we got meaningful content
      if (!text || text.trim().length < 10) {
        alert(
          "File seems empty or could not be read. Please try uploading a text file or PDF."
        );
        return null;
      }

      // Clean up the extracted text (remove extra spaces and line breaks)
      const cleanText = text.replace(/\s+/g, " ").trim();

      return cleanText;
    } catch (error) {
      console.error("Error extracting text:", error);
      alert(
        "Could not read this file. Please make sure it's a valid PDF or text file."
      );
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
        setAnalysisResults((prev) => ({
          ...prev,
          [reportFile.id]: {
            ...analysisResult,
            sentAt: new Date().toLocaleString(),
          },
        }));

        // Mark as analyzed
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === reportFile.id ? { ...f, analyzed: true } : f
          )
        );

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

    // Add report name
    pdf.setFontSize(12);
    pdf.setFont(undefined, "normal");
    pdf.text(`Report: ${reportName}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Patient: ${patientInfo.name}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;

    // Process and format analysis content
    const cleanText = analysis.replace(/\*/g, ""); // Remove asterisks
    const lines = cleanText.split("\n").filter((line) => line.trim());

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Check if line is the first line or numbered heading
      const isFirstLine = index === 0;
      const isNumberedHeading = /^\d+\.\s*[A-Z]/.test(trimmedLine);

      // Add spacing before numbered headings
      if (isNumberedHeading && yPosition > 100) {
        yPosition += 5;
      }

      // Set font based on line type
      if (isFirstLine) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.setTextColor(0, 0, 0); // Black for first line
      } else if (isNumberedHeading) {
        pdf.setFontSize(11);
        pdf.setFont(undefined, "bold");
        pdf.setTextColor(41, 83, 124); // #29537C for numbered headings
      } else {
        pdf.setFontSize(10);
        pdf.setFont(undefined, "normal");
        pdf.setTextColor(255, 127, 127); // #FF7F7F for regular text
      }

      // Check for page break
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      // Add bullet for non-heading lines
      const xPosition = isFirstLine || isNumberedHeading ? 20 : 25;
      if (!isFirstLine && !isNumberedHeading) {
        pdf.setTextColor(255, 127, 127);
        pdf.text("•", 20, yPosition);
      }

      // Handle High/Low highlighting - approximate with color change
      let displayText = trimmedLine;
      if (/\b(High|HIGH)\b/i.test(trimmedLine)) {
        // For PDF, we'll use red color for the whole line if it contains High
        pdf.setTextColor(220, 38, 38); // Bright red
      } else if (/\b(Low|LOW)\b/i.test(trimmedLine)) {
        pdf.setTextColor(248, 113, 113); // Dull red
      }

      // Split text if too long
      const splitText = pdf.splitTextToSize(displayText, 170);
      pdf.text(splitText, xPosition, yPosition);
      yPosition += splitText.length * 7;
    });

    // Reset text color
    pdf.setTextColor(0, 0, 0);

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
          <div
            key={report.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{report.name}</p>
                <p className="text-sm text-gray-500">
                  Uploaded: {report.uploadDate}
                </p>
              </div>

              <div className="flex gap-2">
                {/* Download Analysis button - only shows after analysis */}
                {report.analyzed && analysisResults[report.id] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadAnalysisAsPDF(
                        analysisResults[report.id].analysis,
                        report.name
                      )
                    }
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
                    {analyzing ? "Analyzing..." : "AI Analyze"}
                  </Button>
                )}

                {/* Status indicator - shows after analysis */}
                {report.analyzed && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-green-600"
                  >
                    ✓ Analyzed
                  </Button>
                )}
              </div>
            </div>

            {/* Show AI Analysis Results */}
            {analysisResults[report.id] && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-blue-900">
                    🤖 AI Analysis
                  </h4>
                  <span className="text-xs text-blue-600">
                    Analyzed: {analysisResults[report.id].sentAt}
                  </span>
                </div>
                <div className="space-y-1">
                  {formatAnalysisText(analysisResults[report.id].analysis)}
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

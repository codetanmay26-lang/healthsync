import React, { useState, useEffect } from "react";
import Button from "../../../components/ui/Button.jsx";
import { useNavigate } from "react-router-dom";

export default function ReviewedReportsPage() {
  const [reviewedAnalyses, setReviewedAnalyses] = useState([]);
  const navigate = useNavigate();

  // Format AI analysis text with enhanced styling (same as LabReportUploader)
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
            className="text-gray-900 font-semibold text-base mb-2"
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

  useEffect(() => {
    // Load only REVIEWED analyses
    const storedAnalyses = JSON.parse(
      localStorage.getItem("doctorAnalyses") || "[]"
    );
    const reviewed = storedAnalyses.filter((analysis) => analysis.reviewed);
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
          onClick={() => navigate("/doctor-dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>

      <div className="space-y-4">
        {reviewedAnalyses.map((analysis) => (
          <div
            key={analysis.id}
            className="border border-green-200 bg-green-50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">
                  Patient: {analysis.patientName || "Unknown"}
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
              <div className="space-y-1">
                {formatAnalysisText(analysis.analysis)}
              </div>
            </div>
          </div>
        ))}

        {reviewedAnalyses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No reviewed reports yet</p>
            <p className="text-sm">
              Reports you mark as reviewed will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

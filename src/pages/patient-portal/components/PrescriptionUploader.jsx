import React, { useState } from "react";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";

export default function PrescriptionUploader({ patientId }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [medicineResults, setMedicineResults] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingReminders, setPendingReminders] = useState([]);
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState(null);

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

  const extractTextFromPrescription = async (file) => {
    try {
      if (file.type.startsWith("image/")) {
        // Enhanced image processing with Gemini Vision Pro
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(file);
        });

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY,
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "Carefully extract all medicine information from this prescription image. For each medicine, provide: 1. Medicine Name (clean, no extra words) 2. Dosage (mg, ml, units) 3. Timing notation (if present, look for patterns like 1-0-1, 1-1-1, 0-1-0 which indicate Morning-Afternoon-Evening dosing where 1=take, 0=skip) 4. Any additional instructions. Format each medicine on a new line as: MedicineName - Dosage - TimingNotation - Instructions",
                    },
                    {
                      inline_data: {
                        mime_type: file.type,
                        data: base64,
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );

        const data = await response.json();
        const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!extractedText || extractedText.trim().length < 10) {
          alert(
            "Could not extract text from prescription image. Please try a clearer image."
          );
          return null;
        }

        return extractedText.trim();
      } else if (file.type === "application/pdf") {
        // PDF processing with better error handling
        const text = await file.text();
        if (!text || text.trim().length < 10) {
          alert(
            "Could not extract text from PDF. Please try a different file."
          );
          return null;
        }
        return text.trim();
      } else {
        // Try to read any other file as text
        const text = await file.text();
        if (!text || text.trim().length < 10) {
          alert("File appears to be empty or unreadable.");
          return null;
        }
        return text.trim();
      }
    } catch (error) {
      console.error("Error extracting text:", error);
      alert("Could not read prescription. Please try a different file.");
      return null;
    }
  };

  const createSmartReminders = (prescriptionText, patientId) => {
    const lines = prescriptionText.split("\n").filter((line) => line.trim());
    const reminders = [];

    lines.forEach((line, index) => {
      // Parse medicine information - expect format: MedicineName - Dosage - TimingNotation - Instructions
      const parts = line.split("-").map((p) => p.trim());
      
      if (parts.length >= 2) {
        const medicineInfo = parts[0].replace(/^\d+\.?\s*/, ""); // Remove numbering
        const dosage = parts[1] || "1 tablet";
        const timingNotation = parts[2] || "";
        const instructions = parts[3] || timingNotation; // If no timing notation, instructions might be in part[2]

        // Check if timing notation matches the medical format (1-0-1, 1-1-1, etc.)
        const medicalNotationRegex = /^[01]-[01]-[01]$/;
        let timingSchedule = [];

        if (medicalNotationRegex.test(timingNotation)) {
          // Parse medical notation: Morning-Afternoon-Evening
          const [morning, afternoon, evening] = timingNotation.split("-");
          
          if (morning === "1") {
            timingSchedule.push({
              timing: "morning",
              label: "Morning"
            });
          }
          if (afternoon === "1") {
            timingSchedule.push({
              timing: "afternoon",
              label: "Afternoon"
            });
          }
          if (evening === "1") {
            timingSchedule.push({
              timing: "evening",
              label: "Evening"
            });
          }

          // If no times are set (0-0-0), default to morning
          if (timingSchedule.length === 0) {
            timingSchedule.push({
              timing: "morning",
              label: "Morning"
            });
          }
        } else {
          // Fallback to text-based timing extraction for backward compatibility
          const lowerInstructions = (timingNotation + " " + instructions).toLowerCase();
          
          // Check for specific timing keywords
          if (
            lowerInstructions.includes("evening") ||
            lowerInstructions.includes("night") ||
            lowerInstructions.includes("bedtime")
          ) {
            timingSchedule.push({ timing: "evening", label: "Evening" });
          } else if (
            lowerInstructions.includes("afternoon") ||
            lowerInstructions.includes("lunch")
          ) {
            timingSchedule.push({ timing: "afternoon", label: "Afternoon" });
          } else if (
            lowerInstructions.includes("twice") ||
            lowerInstructions.includes("2 times")
          ) {
            timingSchedule.push({ timing: "morning", label: "Morning" });
            timingSchedule.push({ timing: "evening", label: "Evening" });
          } else if (
            lowerInstructions.includes("three times") ||
            lowerInstructions.includes("3 times") ||
            lowerInstructions.includes("thrice")
          ) {
            timingSchedule.push({ timing: "morning", label: "Morning" });
            timingSchedule.push({ timing: "afternoon", label: "Afternoon" });
            timingSchedule.push({ timing: "evening", label: "Evening" });
          } else if (
            lowerInstructions.includes("morning") ||
            lowerInstructions.includes("breakfast")
          ) {
            timingSchedule.push({ timing: "morning", label: "Morning" });
          } else {
            // Default to morning if no timing information found
            timingSchedule.push({ timing: "morning", label: "Morning" });
          }
        }

        // Create a reminder for each timing in the schedule
        timingSchedule.forEach((scheduleItem, scheduleIndex) => {
          const frequencyText = timingSchedule.length === 1 ? "once daily" : 
                               timingSchedule.length === 2 ? "twice daily" : 
                               timingSchedule.length === 3 ? "three times daily" : 
                               `${timingSchedule.length} times daily`;

          reminders.push({
            id: Date.now() + index * 1000 + scheduleIndex,
            patientId,
            medicineName: medicineInfo,
            dosage,
            timing: scheduleItem.timing,
            frequency: frequencyText,
            instructions: instructions || `Take ${dosage} ${scheduleItem.label.toLowerCase()}`,
            status: "pending",
            createdAt: new Date().toISOString(),
          });
        });
      }
    });

    return reminders;
  };

  const handleAnalyzeAndCreateReminders = async (prescriptionFile) => {
    setAnalyzing(true);

    try {
      const prescriptionText = await extractTextFromPrescription(
        prescriptionFile.file
      );

      if (!prescriptionText) {
        setAnalyzing(false);
        return;
      }

      // FIXED: Use the correct function name
      const smartReminders = createSmartReminders(prescriptionText, patientId);

      // Show confirmation modal instead of directly saving
      setPendingReminders(smartReminders);
      setCurrentPrescriptionId(prescriptionFile.id);
      setShowConfirmModal(true);

      // Store medicine list for display
      setMedicineResults((prev) => ({
        ...prev,
        [prescriptionFile.id]: {
          success: true,
          medicineList: prescriptionText,
          smartReminders,
          analyzedAt: new Date().toLocaleString(),
        },
      }));
    } catch (error) {
      alert("Analysis failed: " + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmReminders = () => {
    // Save smart reminders to localStorage
    const existingReminders = JSON.parse(
      localStorage.getItem("smartReminders") || "[]"
    );
    const newReminders = [...existingReminders, ...pendingReminders];
    localStorage.setItem("smartReminders", JSON.stringify(newReminders));

    // Save medicine list for patient
    const patientMedicines = JSON.parse(
      localStorage.getItem("patientMedicines") || "[]"
    );
    patientMedicines.push({
      id: Date.now(),
      patientId,
      medicineList: medicineResults[currentPrescriptionId]?.medicineList || "",
      timestamp: new Date().toISOString(),
      doctorName: "Self-uploaded",
      prescribed: true,
    });
    localStorage.setItem("patientMedicines", JSON.stringify(patientMedicines));

    // Mark as analyzed
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === currentPrescriptionId ? { ...f, analyzed: true } : f
      )
    );

    // Close modal and reset
    setShowConfirmModal(false);
    setPendingReminders([]);
    setCurrentPrescriptionId(null);

    alert("Smart reminders confirmed and saved successfully!");
  };

  const handleEditReminder = (reminderId, field, value) => {
    setPendingReminders((prev) =>
      prev.map((r) => (r.id === reminderId ? { ...r, [field]: value } : r))
    );
  };

  const handleDeleteReminder = (reminderId) => {
    setPendingReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  const handleAddReminder = () => {
    const newReminder = {
      id: Date.now(),
      patientId,
      medicineName: "New Medicine",
      dosage: "1 tablet",
      timing: "morning",
      frequency: "once daily",
      instructions: "",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setPendingReminders((prev) => [...prev, newReminder]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          📋 Upload Your Prescriptions
        </h3>
        <Button variant="outline" size="sm">
          <label className="cursor-pointer flex items-center">
            <Icon name="Upload" size={16} className="mr-2" />
            Upload Prescription
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx,image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </Button>
      </div>

      <div className="space-y-4">
        {uploadedFiles.map((prescription) => (
          <div
            key={prescription.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900">{prescription.name}</p>
                <p className="text-sm text-gray-500">
                  Uploaded: {prescription.uploadDate}
                </p>
              </div>

              <div className="flex gap-2">
                {!prescription.analyzed && (
                  <Button
                    size="sm"
                    onClick={() =>
                      handleAnalyzeAndCreateReminders(prescription)
                    }
                    disabled={analyzing}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {analyzing
                      ? "Creating Smart Reminders..."
                      : "Create Smart Reminders"}
                  </Button>
                )}

                {prescription.analyzed && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-green-600"
                  >
                    <Icon name="Check" size={16} className="mr-1" />✓ Reminders
                    Created
                  </Button>
                )}
              </div>
            </div>

            {/* Show Smart Reminders Results */}
            {medicineResults[prescription.id] && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Smart Reminders Created
                </h4>
                <div className="space-y-2">
                  {medicineResults[prescription.id].smartReminders?.map(
                    (reminder) => (
                      <div
                        key={reminder.id}
                        className="flex items-center justify-between p-2 bg-white rounded border"
                      >
                        <div>
                          <span className="font-medium text-gray-900">
                            {reminder.medicineName}
                          </span>
                          <span className="text-sm text-gray-600 ml-2">
                            ({reminder.dosage})
                          </span>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                          {reminder.timing}
                        </span>
                      </div>
                    )
                  )}
                </div>
                <p className="text-xs text-green-700 mt-2 font-medium">
                  ✓ Smart reminders are now available in your Reminders tab
                </p>
              </div>
            )}
          </div>
        ))}

        {uploadedFiles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Upload" size={48} className="mx-auto mb-4 opacity-50" />
            <p>No prescriptions uploaded yet</p>
            <p className="text-sm">
              Upload prescription images (JPG, PNG) or PDFs to create smart
              medication reminders
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Smart Reminders */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                📋 Confirm & Edit Smart Reminders
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Review and edit the reminders generated from your prescription.
                You can modify timings, dosages, or add/remove medicines.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {pendingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Medicine Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Medicine Name
                        </label>
                        <input
                          type="text"
                          value={reminder.medicineName}
                          onChange={(e) =>
                            handleEditReminder(
                              reminder.id,
                              "medicineName",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Dosage */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage
                        </label>
                        <input
                          type="text"
                          value={reminder.dosage}
                          onChange={(e) =>
                            handleEditReminder(
                              reminder.id,
                              "dosage",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Timing */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timing
                        </label>
                        <select
                          value={reminder.timing}
                          onChange={(e) =>
                            handleEditReminder(
                              reminder.id,
                              "timing",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                          <option value="night">Night</option>
                        </select>
                      </div>

                      {/* Frequency */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency
                        </label>
                        <select
                          value={reminder.frequency}
                          onChange={(e) =>
                            handleEditReminder(
                              reminder.id,
                              "frequency",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="once daily">Once Daily</option>
                          <option value="twice daily">Twice Daily</option>
                          <option value="three times daily">
                            Three Times Daily
                          </option>
                          <option value="as needed">As Needed</option>
                        </select>
                      </div>

                      {/* Instructions */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Instructions
                        </label>
                        <input
                          type="text"
                          value={reminder.instructions}
                          onChange={(e) =>
                            handleEditReminder(
                              reminder.id,
                              "instructions",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Take after meals"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        <Icon name="Trash2" size={14} className="mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Add New Reminder Button */}
                <button
                  onClick={handleAddReminder}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center"
                >
                  <Icon name="Plus" size={20} className="mr-2" />
                  Add Another Medicine
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingReminders([]);
                  setCurrentPrescriptionId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReminders}
                disabled={pendingReminders.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Icon name="Check" size={16} className="mr-2" />
                Confirm & Save ({pendingReminders.length} reminders)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";
import { analyzePrescription } from "../../../utils/prescriptionAnalysis";
import { extractTextWithAzureVision } from "../../../services/azureVision";

export default function PrescriptionUploader({ patientId }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [medicineResults, setMedicineResults] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingReminders, setPendingReminders] = useState([]);
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState(null);

  // Upload file handling
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

  // ✅ Extract text (OCR + fallback)
  const extractTextFromPrescription = async (file) => {
    try {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        try {
          const azureText = await extractTextWithAzureVision(file);
          if (azureText?.trim()) {
            return azureText;
          }
        } catch (azureError) {
          console.error("Azure Vision OCR failed:", azureError);
        }
      }

      return await file.text();
    } catch (err) {
      console.error("OCR/Text read failed:", err);
      return "";
    }
  };

  // ✅ Convert structured meds → reminders
  // Convert structured meds to reminders
  const buildSmartReminders = (meds, patientId) => {
    const reminders = [];

    meds.forEach((m, i) => {
      // ✅ FIX: Ensure timings is always an array
      let timings = m.timings;

      // Convert string to array if needed
      if (typeof timings === "string") {
        timings = [timings];
      }

      // Default to morning if no timings provided
      if (!timings || timings.length === 0) {
        timings = ["morning"];
      }

      const freq =
        timings.length === 1
          ? "once daily"
          : timings.length === 2
          ? "twice daily"
          : timings.length === 3
          ? "three times daily"
          : `${timings.length} times daily`;

      // ✅ Now this won't crash
      timings.forEach((t, idx) => {
        reminders.push({
          id: Date.now() + i * 1000 + idx,
          patientId,
          medicineName: m.name,
          dosage: m.dosage || "1 tablet",
          timing: t,
          frequency: freq,
          instructions:
            m.notes || (m.food ? `Take ${m.food} food` : "as directed"),
          status: "pending",
          createdAt: new Date().toISOString(),
        });
      });
    });

    return reminders;
  };

  // ✅ MAIN logic
  const handleAnalyzeAndCreateReminders = async (prescriptionFile) => {
    setAnalyzing(true);

    try {
      // 1) Extract text
      const prescriptionText = await extractTextFromPrescription(
        prescriptionFile.file
      );

      if (!prescriptionText || !prescriptionText.trim()) {
        setAnalyzing(false);
        alert("Could not read prescription text.");
        return;
      }

      // 2) Make structured analysis call
      const result = await analyzePrescription(prescriptionText, {
        name: "Patient",
      });

      if (!result?.success || !result?.meds?.length) {
        alert("No medicines found in prescription.");
        setAnalyzing(false);
        return;
      }

      const meds = result.meds;

      // 3) Convert → reminders
      const smartReminders = buildSmartReminders(meds, patientId);

      // 4) Stage confirmation modal
      setPendingReminders(smartReminders);
      setCurrentPrescriptionId(prescriptionFile.id);
      setShowConfirmModal(true);

      // 5) Store results for UI display
      setMedicineResults((prev) => ({
        ...prev,
        [prescriptionFile.id]: {
          success: true,
          medicineList: meds
            .map((m) => `${m.name}${m.dosage ? " — " + m.dosage : ""}`)
            .join("\n"),
          smartReminders,
          analyzedAt: new Date().toLocaleString(),
        },
      }));
    } catch (error) {
      console.error(error);
      alert("Analysis failed: " + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // ✅ Confirm → save reminders + patient medicines
  const handleConfirmReminders = () => {
    // Save reminders
    const existingReminders = JSON.parse(
      localStorage.getItem("smartReminders") || "[]"
    );
    const newReminders = [...existingReminders, ...pendingReminders];
    localStorage.setItem("smartReminders", JSON.stringify(newReminders));

    // Save medicine list (for display)
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

    // Mark analyzed
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === currentPrescriptionId ? { ...f, analyzed: true } : f
      )
    );

    setShowConfirmModal(false);
    setPendingReminders([]);
    setCurrentPrescriptionId(null);

    alert("Smart reminders confirmed and saved successfully!");
  };

  // Inline reminder editing
  const handleEditReminder = (reminderId, field, value) =>
    setPendingReminders((prev) =>
      prev.map((r) => (r.id === reminderId ? { ...r, [field]: value } : r))
    );

  const handleDeleteReminder = (reminderId) =>
    setPendingReminders((prev) => prev.filter((r) => r.id !== reminderId));

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

      {/* ✅ Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                📋 Confirm & Edit Smart Reminders
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Review and edit the reminders generated from your prescription.
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
                      <div>
                        <label className="block text-sm font-medium mb-1">
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
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
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
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
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
                          className="w-full px-3 py-2 border rounded"
                        >
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                          <option value="night">Night</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
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
                          className="w-full px-3 py-2 border rounded"
                        >
                          <option value="once daily">Once Daily</option>
                          <option value="twice daily">Twice Daily</option>
                          <option value="three times daily">
                            Three Times Daily
                          </option>
                          <option value="as needed">As Needed</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">
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
                          placeholder="e.g., take after meals"
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                    </div>

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

                <button
                  onClick={handleAddReminder}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors flex items-center justify-center"
                >
                  <Icon name="Plus" size={20} className="mr-2" />
                  Add Another Medicine
                </button>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-between">
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

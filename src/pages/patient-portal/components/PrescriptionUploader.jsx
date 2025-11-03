import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

export default function PrescriptionUploader({ patientId }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [medicineResults, setMedicineResults] = useState({});

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

  const extractTextFromPrescription = async (file) => {
    try {
      if (file.type.startsWith('image/')) {
        // Enhanced image processing with Gemini Vision Pro
        const reader = new FileReader();
        const base64 = await new Promise(resolve => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(file);
        });

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Carefully extract all medicine information from this prescription image. For each medicine, provide: 1. Medicine Name (clean, no extra words) 2. Dosage (mg, ml, units) 3. Timing (morning, afternoon, evening, night, or specific times) 4. Frequency (once daily, twice daily, etc) Format as: MedicineName - Dosage - Timing"
              }, {
                inline_data: {
                  mime_type: file.type,
                  data: base64
                }
              }]
            }]
          })
        });

        const data = await response.json();
        const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!extractedText || extractedText.trim().length < 10) {
          alert('Could not extract text from prescription image. Please try a clearer image.');
          return null;
        }

        return extractedText.trim();
      } 
      else if (file.type === 'application/pdf') {
        // PDF processing with better error handling
        const text = await file.text();
        if (!text || text.trim().length < 10) {
          alert('Could not extract text from PDF. Please try a different file.');
          return null;
        }
        return text.trim();
      }
      else {
        // Try to read any other file as text
        const text = await file.text();
        if (!text || text.trim().length < 10) {
          alert('File appears to be empty or unreadable.');
          return null;
        }
        return text.trim();
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Could not read prescription. Please try a different file.');
      return null;
    }
  };

  const createSmartReminders = (prescriptionText, patientId) => {
    const lines = prescriptionText.split('\n').filter(line => line.trim());
    const reminders = [];

    lines.forEach((line, index) => {
      // Better parsing for medicine information
      const parts = line.split('-').map(p => p.trim());
      if (parts.length >= 2) {
        const medicineInfo = parts[0].replace(/^\d+\.?\s*/, ''); // Remove numbering
        const dosage = parts[1] || '1 tablet';
        const instructions = parts[2] || '';
        
        // Smart timing extraction
        let timing = 'morning'; // default
        const lowerInstructions = instructions.toLowerCase();
        
        // Check for specific timing keywords
        if (lowerInstructions.includes('evening') || lowerInstructions.includes('night') || lowerInstructions.includes('bedtime')) {
          timing = 'evening';
        } else if (lowerInstructions.includes('afternoon') || lowerInstructions.includes('lunch')) {
          timing = 'afternoon';  
        } else if (lowerInstructions.includes('twice') || lowerInstructions.includes('2 times')) {
          timing = 'morning'; // First dose, create second dose separately
        } else if (lowerInstructions.includes('morning') || lowerInstructions.includes('breakfast')) {
          timing = 'morning';
        }

        reminders.push({
          id: Date.now() + index,
          patientId,
          medicineName: medicineInfo,
          dosage,
          timing,
          frequency: lowerInstructions.includes('twice') ? 'twice daily' : 'once daily',
          instructions: instructions,
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        // Create second reminder for twice daily medicines
        if (lowerInstructions.includes('twice')) {
          reminders.push({
            id: Date.now() + index + 1000,
            patientId,
            medicineName: medicineInfo,
            dosage,
            timing: 'evening',
            frequency: 'twice daily',
            instructions: instructions + ' (Second dose)',
            status: 'pending',
            createdAt: new Date().toISOString()
          });
        }
      }
    });

    return reminders;
  };

  const handleAnalyzeAndCreateReminders = async (prescriptionFile) => {
    setAnalyzing(true);
    
    try {
      const prescriptionText = await extractTextFromPrescription(prescriptionFile.file);
      
      if (!prescriptionText) {
        setAnalyzing(false);
        return;
      }

      // FIXED: Use the correct function name
      const smartReminders = createSmartReminders(prescriptionText, patientId);
      
      // Save smart reminders to localStorage
      const existingReminders = JSON.parse(localStorage.getItem('smartReminders') || '[]');
      const newReminders = [...existingReminders, ...smartReminders];
      localStorage.setItem('smartReminders', JSON.stringify(newReminders));

      // Save medicine list for patient
      const patientMedicines = JSON.parse(localStorage.getItem('patientMedicines') || '[]');
      patientMedicines.push({
        id: Date.now(),
        patientId,
        medicineList: prescriptionText,
        timestamp: new Date().toISOString(),
        doctorName: 'Self-uploaded',
        prescribed: true
      });
      localStorage.setItem('patientMedicines', JSON.stringify(patientMedicines));

      // Update UI
      setMedicineResults(prev => ({
        ...prev,
        [prescriptionFile.id]: {
          success: true,
          medicineList: prescriptionText,
          smartReminders,
          analyzedAt: new Date().toLocaleString()
        }
      }));

      // Mark as analyzed
      setUploadedFiles(prev => 
        prev.map(f => f.id === prescriptionFile.id ? {...f, analyzed: true} : f)
      );

      // Simple success message
      alert('Prescription analyzed successfully! Smart reminders created and available in your Reminders tab.');

    } catch (error) {
      alert('Analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
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
        {uploadedFiles.map(prescription => (
          <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900">{prescription.name}</p>
                <p className="text-sm text-gray-500">Uploaded: {prescription.uploadDate}</p>
              </div>
              
              <div className="flex gap-2">
                {!prescription.analyzed && (
                  <Button
                    size="sm"
                    onClick={() => handleAnalyzeAndCreateReminders(prescription)}
                    disabled={analyzing}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {analyzing ? 'Creating Smart Reminders...' : 'Create Smart Reminders'}
                  </Button>
                )}
                
                {prescription.analyzed && (
                  <Button variant="outline" size="sm" disabled className="text-green-600">
                    <Icon name="Check" size={16} className="mr-1" />
                    ✓ Reminders Created
                  </Button>
                )}
              </div>
            </div>
            
            {/* Show Smart Reminders Results */}
            {medicineResults[prescription.id] && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Smart Reminders Created</h4>
                <div className="space-y-2">
                  {medicineResults[prescription.id].smartReminders?.map(reminder => (
                    <div key={reminder.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <span className="font-medium text-gray-900">{reminder.medicineName}</span>
                        <span className="text-sm text-gray-600 ml-2">({reminder.dosage})</span>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                        {reminder.timing}
                      </span>
                    </div>
                  ))}
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
            <p className="text-sm">Upload prescription images (JPG, PNG) or PDFs to create smart medication reminders</p>
          </div>
        )}
      </div>
    </div>
  );
}

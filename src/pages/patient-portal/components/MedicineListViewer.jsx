import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button.jsx';
import jsPDF from 'jspdf';

export default function MedicineListViewer({ patientId }) {
  const [medicineList, setMedicineList] = useState([]);
  const [medicineSchedule, setMedicineSchedule] = useState([]);

  useEffect(() => {
    // Load medicine lists from localStorage
    const storedMedicines = JSON.parse(localStorage.getItem('patientMedicines') || '[]');
    const patientMedicines = storedMedicines.filter(medicine => medicine.patientId === patientId);
    setMedicineList(patientMedicines.reverse());

    // Load existing schedule
    const storedSchedule = JSON.parse(localStorage.getItem('medicineSchedule') || '[]');
    const patientSchedule = storedSchedule.filter(schedule => schedule.patientId === patientId);
    setMedicineSchedule(patientSchedule);
  }, [patientId]);

  // AI function to create schedule from medicine list
  const createMedicineSchedule = async (medicineListText) => {
    const prompt = `Create a simple medication schedule from this medicine list:

${medicineListText}

For each medicine, provide:
1. Medicine name (clean)
2. Time to take (morning, afternoon, evening, night)
3. Instructions (with food, empty stomach, etc.)

Format as a simple schedule list. Keep it practical and easy to follow.`;

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 1000
          }
        })
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      console.error('Schedule creation error:', error);
      return null;
    }
  };

  const handleCreateSchedule = async (medicine) => {
    const schedule = await createMedicineSchedule(medicine.medicineList);
    
    if (schedule) {
      const newSchedule = {
        id: Date.now(),
        patientId,
        medicineListId: medicine.id,
        schedule: schedule,
        createdAt: new Date().toLocaleString(),
        active: true
      };

      // Save schedule
      const allSchedules = JSON.parse(localStorage.getItem('medicineSchedule') || '[]');
      allSchedules.push(newSchedule);
      localStorage.setItem('medicineSchedule', JSON.stringify(allSchedules));
      
      setMedicineSchedule([newSchedule, ...medicineSchedule]);
      alert('Medicine schedule created! Check your medication reminders.');
    }
  };

  const downloadMedicineList = (medicine) => {
    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.text('Your Medicine List', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`From: Dr. ${medicine.doctorName}`, 20, 50);
    pdf.text(`Date: ${new Date(medicine.timestamp).toLocaleDateString()}`, 20, 65);
    
    pdf.setFontSize(10);
    const splitText = pdf.splitTextToSize(medicine.medicineList, 170);
    pdf.text(splitText, 20, 85);
    
    pdf.save(`medicines_${new Date(medicine.timestamp).toLocaleDateString()}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Medicine Lists */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💊 Your Medicine Lists ({medicineList.length})
        </h3>
        
        <div className="space-y-4">
          {medicineList.map((medicine) => (
            <div key={medicine.id} className="border border-purple-200 bg-purple-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    From: Dr. {medicine.doctorName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Prescribed: {new Date(medicine.timestamp).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm"
                    onClick={() => handleCreateSchedule(medicine)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create Schedule
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={() => downloadMedicineList(medicine)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Download List
                  </Button>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded text-sm border">
                <div className="whitespace-pre-line text-gray-800">
                  {medicine.medicineList}
                </div>
              </div>
            </div>
          ))}
          
          {medicineList.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No medicine lists yet</p>
              <p className="text-sm">Medicine lists from doctors will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Medicine Schedules */}
      {medicineSchedule.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ⏰ Your Medicine Schedule ({medicineSchedule.length})
          </h3>
          
          <div className="space-y-4">
            {medicineSchedule.map((schedule) => (
              <div key={schedule.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Medicine Schedule
                    </h4>
                    <p className="text-sm text-green-600">
                      Created: {schedule.createdAt}
                    </p>
                  </div>
                  
                  <Button 
                    size="sm"
                    onClick={() => {
                      // Set up reminders (handled by the existing MedicationTimeline)
                      alert('Schedule activated! Check your medication timeline.');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Activate Reminders
                  </Button>
                </div>
                
                <div className="bg-white p-3 rounded text-sm border">
                  <div className="whitespace-pre-line text-gray-800">
                    {schedule.schedule}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

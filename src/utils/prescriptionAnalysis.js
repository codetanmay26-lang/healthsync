// Simple Prescription Analysis Service - Using Gemini
export async function analyzePrescription(prescriptionText, patientInfo) {
  const prompt = `Extract medicines from this prescription and create a clean list:

Patient: ${patientInfo.name} (Age: ${patientInfo.age})

Prescription Text:
${prescriptionText}

Please extract and list:
1. Medicine names (clean, without dosage)
2. Dosage for each medicine
3. Instructions (how to take)
4. Total number of medicines

Format the response as a clear medicine list that can be easily understood.`;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return {
      success: true,
      medicineList: analysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Prescription Analysis Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Send medicine list to patient (stored locally)
export function sendMedicineListToPatient(medicineData, patientId, doctorId) {
  const medicineList = JSON.parse(localStorage.getItem('patientMedicines') || '[]');
  medicineList.push({
    id: Date.now(),
    patientId,
    doctorId,
    medicineList: medicineData.medicineList,
    timestamp: medicineData.timestamp,
    doctorName: doctorId, // You can improve this
    prescribed: true
  });
  localStorage.setItem('patientMedicines', JSON.stringify(medicineList));
  
  return { success: true, message: 'Medicine list sent to patient' };
}

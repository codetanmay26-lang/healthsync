// utils/aiAnalysis.js - Simple version, no backend calls
export async function analyzeLabReport(reportText, patientInfo) {
  const prompt = `Analyze this lab report and give basic medical insights:

Patient: ${patientInfo.name} (Age: ${patientInfo.age})

Lab Report:
${reportText}

Provide simple analysis:
1. Main findings
2. Any abnormal values
3. What doctor should check
4. Urgency: Low/Medium/High

Keep it short and clear.`;

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
      analysis: analysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Simple function to simulate sending to doctor (just stores locally)
export function sendAnalysisToDoctor(analysisData, doctorId, patientId) {
  // Store in localStorage for demo purposes
  const analyses = JSON.parse(localStorage.getItem('doctorAnalyses') || '[]');
  analyses.push({
    id: Date.now(),
    doctorId,
    patientId,
    analysis: analysisData.analysis,
    timestamp: analysisData.timestamp,
    patientName: patientId // You can improve this
  });
  localStorage.setItem('doctorAnalyses', JSON.stringify(analyses));
  
  return { success: true, message: 'Analysis sent to doctor' };
}

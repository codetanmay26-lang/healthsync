/**
 * Real-Time Patient Analytics Service
 * All calculations from actual localStorage data - NO MOCK DATA
 */

// ==================== DATA FETCHERS ====================

const getPatientData = (patientId) => {
  const patients = JSON.parse(localStorage.getItem('patients') || '[]');
  return patients.find(p => p.id === patientId);
};

const getPatientMedicines = (patientId) => {
  const medicines = JSON.parse(localStorage.getItem('patientMedicines') || '[]');
  return medicines.filter(m => m.patientId === patientId);
};

const getAdherenceReports = (patientId, days = 90) => {
  const reports = JSON.parse(localStorage.getItem('adherenceReports') || '[]');
  const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  return reports.filter(r => 
    r.patientId === patientId && 
    new Date(r.timestamp).getTime() >= cutoffDate
  );
};

const getAppointments = (patientId) => {
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  return appointments.filter(apt => apt.patientId === patientId);
};

const getVitalsData = (patientId) => {
  const vitals = JSON.parse(localStorage.getItem('patientVitals') || '[]');
  return vitals.filter(v => v.patientId === patientId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const getLabReports = (patientId) => {
  const labReports = JSON.parse(localStorage.getItem('labReports') || '[]');
  return labReports.filter(r => r.patientId === patientId);
};

const getMessages = (patientId, days = 14) => {
  const messages = JSON.parse(localStorage.getItem('messages') || '[]');
  const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  return messages.filter(m => 
    m.patientId === patientId && 
    new Date(m.timestamp).getTime() >= cutoffDate
  );
};

const getUserSessions = (patientId, days = 14) => {
  const sessions = JSON.parse(localStorage.getItem('userSessions') || '[]');
  const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  return sessions.filter(s => 
    s.userId === patientId && 
    new Date(s.timestamp).getTime() >= cutoffDate
  );
};

const getSmartReminders = (patientId) => {
  const reminders = JSON.parse(localStorage.getItem('smartReminders') || '[]');
  return reminders.filter(r => r.patientId === patientId);
};

const getDoctorAnalyses = (patientId) => {
  const analyses = JSON.parse(localStorage.getItem('doctorAnalyses') || '[]');
  return analyses.filter(a => a.patientId === patientId);
};

// ==================== REAL-TIME CALCULATORS ====================

/**
 * Calculate Health Deterioration Score
 * Based on REAL patient data only
 */
export const calculateDeteriorationScore = (patientId) => {
  let score = 0;
  const factors = [];
  
  // 1. MEDICATION ADHERENCE (0-30 points)
  const adherenceReports = getAdherenceReports(patientId, 30);
  let adherenceRate = 100;
  
  if (adherenceReports.length > 0) {
    const taken = adherenceReports.filter(r => r.medicationTaken === true).length;
    adherenceRate = Math.round((taken / adherenceReports.length) * 100);
    
    if (adherenceRate < 50) {
      score += 30;
      factors.push({ 
        type: 'critical', 
        message: `Critical medication adherence: ${adherenceRate}%`, 
        weight: 30,
        category: 'adherence'
      });
    } else if (adherenceRate < 70) {
      score += 20;
      factors.push({ 
        type: 'high', 
        message: `Poor medication adherence: ${adherenceRate}%`, 
        weight: 20,
        category: 'adherence'
      });
    } else if (adherenceRate < 90) {
      score += 10;
      factors.push({ 
        type: 'medium', 
        message: `Below target adherence: ${adherenceRate}%`, 
        weight: 10,
        category: 'adherence'
      });
    }
  }
  
  // 2. MISSED APPOINTMENTS (0-20 points)
  const appointments = getAppointments(patientId);
  const last90Days = Date.now() - (90 * 24 * 60 * 60 * 1000);
  const recentAppointments = appointments.filter(apt => 
    new Date(apt.date).getTime() >= last90Days
  );
  
  const missedAppointments = recentAppointments.filter(apt => 
    apt.status === 'missed' || 
    (apt.status !== 'completed' && new Date(apt.date) < new Date())
  ).length;
  
  if (missedAppointments >= 3) {
    score += 20;
    factors.push({ 
      type: 'high', 
      message: `${missedAppointments} missed appointments in last 90 days`, 
      weight: 20,
      category: 'appointments'
    });
  } else if (missedAppointments >= 2) {
    score += 15;
    factors.push({ 
      type: 'medium', 
      message: `${missedAppointments} missed appointments recently`, 
      weight: 15,
      category: 'appointments'
    });
  } else if (missedAppointments >= 1) {
    score += 8;
    factors.push({ 
      type: 'low', 
      message: `${missedAppointments} missed appointment`, 
      weight: 8,
      category: 'appointments'
    });
  }
  
  // 3. VITAL SIGNS DATA (0-25 points)
  const vitals = getVitalsData(patientId);
  
  if (vitals.length > 0) {
    const latestVital = vitals[0];
    const daysSinceLastSync = Math.floor(
      (Date.now() - new Date(latestVital.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Check for abnormal vitals
    const vitalData = latestVital.data || latestVital;
    
    if (vitalData.heartRate) {
      if (vitalData.heartRate < 50 || vitalData.heartRate > 110) {
        score += 15;
        factors.push({ 
          type: 'critical', 
          message: `Abnormal heart rate: ${vitalData.heartRate} bpm`, 
          weight: 15,
          category: 'vitals'
        });
      }
    }
    
    if (vitalData.oxygenSaturation && vitalData.oxygenSaturation < 92) {
      score += 25;
      factors.push({ 
        type: 'critical', 
        message: `Low oxygen saturation: ${vitalData.oxygenSaturation}%`, 
        weight: 25,
        category: 'vitals'
      });
    }
    
    if (daysSinceLastSync > 7) {
      score += 10;
      factors.push({ 
        type: 'medium', 
        message: `No health data sync in ${daysSinceLastSync} days`, 
        weight: 10,
        category: 'vitals'
      });
    }
  } else {
    // No vitals data at all
    score += 15;
    factors.push({ 
      type: 'high', 
      message: 'No vital signs data available', 
      weight: 15,
      category: 'vitals'
    });
  }
  
  // 4. LAB RESULTS TRENDS (0-15 points)
  const labReports = getLabReports(patientId);
  if (labReports.length >= 2) {
    const sortedLabs = [...labReports].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Simple trend detection - if doctor flagged as concerning
    const recentAnalyses = getDoctorAnalyses(patientId);
    const concerningAnalyses = recentAnalyses.filter(a => 
      a.analysis && (
        a.analysis.toLowerCase().includes('abnormal') ||
        a.analysis.toLowerCase().includes('concern') ||
        a.analysis.toLowerCase().includes('elevated') ||
        a.analysis.toLowerCase().includes('low')
      )
    );
    
    if (concerningAnalyses.length > 0) {
      score += 15;
      factors.push({ 
        type: 'high', 
        message: 'Concerning lab result patterns detected', 
        weight: 15,
        category: 'labs'
      });
    }
  }
  
  // 5. PATIENT STATUS (0-10 points)
  const patient = getPatientData(patientId);
  if (patient) {
    if (patient.dischargeDate) {
      const daysSinceDischarge = Math.floor(
        (Date.now() - new Date(patient.dischargeDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceDischarge <= 7) {
        score += 10;
        factors.push({ 
          type: 'medium', 
          message: `${daysSinceDischarge} days post-discharge (high-risk window)`, 
          weight: 10,
          category: 'discharge'
        });
      } else if (daysSinceDischarge <= 30) {
        score += 5;
        factors.push({ 
          type: 'low', 
          message: `${daysSinceDischarge} days post-discharge`, 
          weight: 5,
          category: 'discharge'
        });
      }
    }
  }
  
  return {
    score: Math.min(score, 100),
    level: score >= 70 ? 'critical' : score >= 50 ? 'high' : score >= 30 ? 'medium' : 'low',
    factors,
    adherenceRate,
    lastCalculated: new Date().toISOString()
  };
};

/**
 * Calculate Engagement Momentum Score
 * Based on REAL behavioral data only
 */
export const calculateEngagementMomentum = (patientId) => {
  let momentumScore = 100;
  const alerts = [];
  const trendData = [];
  
  // 1. MESSAGE RESPONSE TIME ANALYSIS (0-25 points)
  const messages = getMessages(patientId, 14);
  const patientMessages = messages.filter(m => m.sender === patientId || m.from === patientId);
  
  if (patientMessages.length > 0) {
    // Calculate average response pattern
    const last7Days = messages.filter(m => 
      new Date(m.timestamp).getTime() >= Date.now() - (7 * 24 * 60 * 60 * 1000)
    );
    const previous7Days = messages.filter(m => {
      const msgTime = new Date(m.timestamp).getTime();
      return msgTime >= Date.now() - (14 * 24 * 60 * 60 * 1000) && 
             msgTime < Date.now() - (7 * 24 * 60 * 60 * 1000);
    });
    
    if (last7Days.length < previous7Days.length * 0.5) {
      momentumScore -= 20;
      alerts.push({ 
        severity: 'high', 
        message: 'Significant drop in communication activity' 
      });
      trendData.push({ 
        metric: 'Message Activity', 
        score: (last7Days.length / Math.max(previous7Days.length, 1)) * 100, 
        trend: 'declining' 
      });
    } else {
      trendData.push({ 
        metric: 'Message Activity', 
        score: Math.min((last7Days.length / 7) * 100, 100), 
        trend: 'stable' 
      });
    }
  } else {
    momentumScore -= 25;
    alerts.push({ 
      severity: 'critical', 
      message: 'No communication activity detected' 
    });
    trendData.push({ 
      metric: 'Message Activity', 
      score: 0, 
      trend: 'declining' 
    });
  }
  
  // 2. PORTAL LOGIN FREQUENCY (0-20 points)
  const sessions = getUserSessions(patientId, 14);
  const loginFrequency = sessions.length;
  
  const week1Logins = sessions.filter(s => 
    new Date(s.timestamp).getTime() >= Date.now() - (7 * 24 * 60 * 60 * 1000)
  ).length;
  
  const week2Logins = sessions.filter(s => {
    const loginTime = new Date(s.timestamp).getTime();
    return loginTime >= Date.now() - (14 * 24 * 60 * 60 * 1000) && 
           loginTime < Date.now() - (7 * 24 * 60 * 60 * 1000);
  }).length;
  
  if (loginFrequency < 2) {
    momentumScore -= 20;
    alerts.push({ 
      severity: 'high', 
      message: 'Very low portal engagement - less than 2 logins in 14 days' 
    });
  } else if (loginFrequency < 5) {
    momentumScore -= 10;
    alerts.push({ 
      severity: 'medium', 
      message: 'Below average portal activity' 
    });
  }
  
  if (week1Logins < week2Logins * 0.5 && week2Logins > 0) {
    momentumScore -= 15;
    alerts.push({ 
      severity: 'high', 
      message: '⚠️ Entering disengagement spiral - declining login pattern' 
    });
    trendData.push({ 
      metric: 'Portal Activity', 
      score: (week1Logins / 7) * 100, 
      trend: 'declining' 
    });
  } else {
    trendData.push({ 
      metric: 'Portal Activity', 
      score: (loginFrequency / 14) * 100, 
      trend: 'stable' 
    });
  }
  
  // 3. HEALTH DATA SYNC CONSISTENCY (0-20 points)
  const vitals = getVitalsData(patientId);
  
  if (vitals.length > 0) {
    const latestSync = vitals[0];
    const daysSinceLastSync = Math.floor(
      (Date.now() - new Date(latestSync.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastSync > 5) {
      momentumScore -= 20;
      alerts.push({ 
        severity: 'high', 
        message: `Health data sync stopped (${daysSinceLastSync} days ago)` 
      });
      trendData.push({ 
        metric: 'Health Tracking', 
        score: 20, 
        trend: 'declining' 
      });
    } else if (daysSinceLastSync > 2) {
      momentumScore -= 10;
      alerts.push({ 
        severity: 'medium', 
        message: 'Irregular health data syncing' 
      });
      trendData.push({ 
        metric: 'Health Tracking', 
        score: 60, 
        trend: 'declining' 
      });
    } else {
      trendData.push({ 
        metric: 'Health Tracking', 
        score: 95, 
        trend: 'stable' 
      });
    }
    
    // Check sync frequency decline
    const last7DaysVitals = vitals.filter(v => 
      new Date(v.timestamp).getTime() >= Date.now() - (7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const previous7DaysVitals = vitals.filter(v => {
      const vitalTime = new Date(v.timestamp).getTime();
      return vitalTime >= Date.now() - (14 * 24 * 60 * 60 * 1000) && 
             vitalTime < Date.now() - (7 * 24 * 60 * 60 * 1000);
    }).length;
    
    if (last7DaysVitals < previous7DaysVitals * 0.5 && previous7DaysVitals > 0) {
      momentumScore -= 15;
      alerts.push({ 
        severity: 'high', 
        message: '⚠️ Health tracking engagement dropping rapidly' 
      });
    }
  } else {
    momentumScore -= 20;
    alerts.push({ 
      severity: 'critical', 
      message: 'No health data syncing detected' 
    });
    trendData.push({ 
      metric: 'Health Tracking', 
      score: 0, 
      trend: 'declining' 
    });
  }
  
  // 4. MEDICATION LOGGING CONSISTENCY (0-20 points)
  const adherenceReports = getAdherenceReports(patientId, 14);
  const smartReminders = getSmartReminders(patientId);
  
  // Calculate expected logs based on smart reminders
  const expectedLogs = smartReminders.filter(r => r.active !== false).length * 14; // Daily for 14 days
  const actualLogs = adherenceReports.length;
  
  if (expectedLogs > 0) {
    const loggingConsistency = Math.round((actualLogs / expectedLogs) * 100);
    
    if (loggingConsistency < 50) {
      momentumScore -= 20;
      alerts.push({ 
        severity: 'critical', 
        message: `Severe medication logging gaps (${loggingConsistency}% logged)` 
      });
    } else if (loggingConsistency < 70) {
      momentumScore -= 12;
      alerts.push({ 
        severity: 'high', 
        message: `Medication logging inconsistency (${loggingConsistency}% logged)` 
      });
    }
    
    // Check for worsening pattern
    const week1Reports = adherenceReports.filter(r => 
      new Date(r.timestamp).getTime() >= Date.now() - (7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const week2Reports = adherenceReports.filter(r => {
      const reportTime = new Date(r.timestamp).getTime();
      return reportTime >= Date.now() - (14 * 24 * 60 * 60 * 1000) && 
             reportTime < Date.now() - (7 * 24 * 60 * 60 * 1000);
    }).length;
    
    if (week1Reports < week2Reports * 0.7 && week2Reports > 0) {
      momentumScore -= 15;
      alerts.push({ 
        severity: 'critical', 
        message: '⚠️ Medication adherence tracking pattern deteriorating' 
      });
      trendData.push({ 
        metric: 'Medication Tracking', 
        score: loggingConsistency, 
        trend: 'worsening' 
      });
    } else {
      trendData.push({ 
        metric: 'Medication Tracking', 
        score: loggingConsistency, 
        trend: 'stable' 
      });
    }
  } else {
    trendData.push({ 
      metric: 'Medication Tracking', 
      score: 0, 
      trend: 'unknown' 
    });
  }
  
  // 5. RAPID DISENGAGEMENT DETECTION
  const decliningTrends = trendData.filter(t => 
    t.trend === 'declining' || t.trend === 'worsening'
  ).length;
  
  if (momentumScore < 40 && decliningTrends >= 3) {
    alerts.unshift({ 
      severity: 'critical', 
      message: '🚨 RAPID DISENGAGEMENT DETECTED - Immediate intervention recommended' 
    });
  }
  
  return {
    score: Math.max(momentumScore, 0),
    level: momentumScore >= 80 ? 'excellent' : 
           momentumScore >= 60 ? 'good' : 
           momentumScore >= 40 ? 'declining' : 'critical',
    alerts,
    trendData,
    prediction: predictDisengagement(momentumScore, trendData),
    lastCalculated: new Date().toISOString()
  };
};

/**
 * Predict disengagement risk
 */
const predictDisengagement = (momentumScore, trendData) => {
  const decliningTrends = trendData.filter(t => 
    t.trend === 'declining' || t.trend === 'worsening'
  ).length;
  
  if (momentumScore < 40 && decliningTrends >= 3) {
    return {
      risk: 'imminent',
      timeframe: '2-3 weeks',
      confidence: 85
    };
  } else if (momentumScore < 60 && decliningTrends >= 2) {
    return {
      risk: 'likely',
      timeframe: '4-6 weeks',
      confidence: 70
    };
  }
  
  return {
    risk: 'low',
    timeframe: 'Not predicted',
    confidence: 90
  };
};

/**
 * Generate actionable recommendations
 */
export const generateRecommendations = (deterioration, engagement, patient) => {
  const recommendations = [];
  
  // Critical deterioration
  if (deterioration.score >= 50) {
    recommendations.push({
      priority: 'urgent',
      action: 'Schedule immediate clinical assessment',
      reason: `High health deterioration risk (${deterioration.score}/100)`,
      category: 'clinical'
    });
  }
  
  // Low engagement
  if (engagement.score < 40) {
    recommendations.push({
      priority: 'urgent',
      action: 'Initiate immediate patient outreach call',
      reason: `Critical engagement decline (${engagement.score}/100)`,
      category: 'engagement'
    });
  }
  
  // Disengagement spiral detected
  if (engagement.alerts.some(a => a.message.includes('disengagement spiral'))) {
    recommendations.push({
      priority: 'urgent',
      action: 'Activate care coordinator intervention',
      reason: 'Patient entering disengagement pattern - early intervention critical',
      category: 'intervention'
    });
  }
  
  // Specific adherence issues
  const adherenceFactors = deterioration.factors.filter(f => f.category === 'adherence');
  if (adherenceFactors.length > 0 && adherenceFactors[0].type === 'critical') {
    recommendations.push({
      priority: 'high',
      action: 'Review medication barriers with patient',
      reason: adherenceFactors[0].message,
      category: 'adherence'
    });
  }
  
  // Missed appointments
  const appointmentFactors = deterioration.factors.filter(f => f.category === 'appointments');
  if (appointmentFactors.length > 0) {
    recommendations.push({
      priority: 'high',
      action: 'Address appointment attendance barriers',
      reason: appointmentFactors[0].message,
      category: 'appointments'
    });
  }
  
  // Vitals concerns
  const vitalFactors = deterioration.factors.filter(f => f.category === 'vitals');
  if (vitalFactors.some(f => f.type === 'critical')) {
    recommendations.push({
      priority: 'urgent',
      action: 'Emergency vital signs assessment required',
      reason: vitalFactors.find(f => f.type === 'critical').message,
      category: 'vitals'
    });
  }
  
  // Communication drop
  if (engagement.alerts.some(a => a.message.includes('communication'))) {
    recommendations.push({
      priority: 'medium',
      action: 'Re-establish communication channels',
      reason: 'Patient communication frequency declining',
      category: 'communication'
    });
  }
  
  return recommendations;
};

/**
 * Calculate combined risk assessment
 */
export const calculateCombinedRisk = (patientId, patient) => {
  const deterioration = calculateDeteriorationScore(patientId);
  const engagement = calculateEngagementMomentum(patientId);
  
  // Weighted combination: 60% health deterioration, 40% engagement
  const combinedScore = Math.round(
    (deterioration.score * 0.6) + ((100 - engagement.score) * 0.4)
  );
  
  return {
    patient,
    deterioration,
    engagement,
    combinedScore,
    combinedLevel: combinedScore >= 70 ? 'critical' : 
                   combinedScore >= 50 ? 'high' : 
                   combinedScore >= 30 ? 'medium' : 'low',
    recommendedActions: generateRecommendations(deterioration, engagement, patient),
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Get all patients with risk scores
 */
export const getAllPatientsWithRiskScores = () => {
  const patients = JSON.parse(localStorage.getItem('patients') || '[]');
  
  const analyticsData = patients.map(patient => {
    return calculateCombinedRisk(patient.id, patient);
  }).sort((a, b) => b.combinedScore - a.combinedScore); // Sort by highest risk first
  
  return analyticsData;
};

export default {
  calculateDeteriorationScore,
  calculateEngagementMomentum,
  generateRecommendations,
  calculateCombinedRisk,
  getAllPatientsWithRiskScores
};

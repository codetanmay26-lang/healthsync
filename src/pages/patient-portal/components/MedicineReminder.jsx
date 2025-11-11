import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button.jsx';

export default function MedicineReminder({ patientId }) {
  const [reminders, setReminders] = useState([]);
  const [smartReminders, setSmartReminders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    loadReminders();
    return () => clearInterval(timer);
  }, [patientId]);

  const loadReminders = () => {
    // Load medicine schedules and create reminders
    const schedules = JSON.parse(localStorage.getItem('medicineSchedule') || '[]');
    const patientSchedules = schedules.filter(s => s.patientId === patientId && s.active);
    
    const todayReminders = patientSchedules.map(schedule => ({
      id: schedule.id,
      schedule: schedule.schedule,
      nextDue: getNextReminderTime(schedule.schedule),
      status: 'pending'
    }));
    
    setReminders(todayReminders);

    // Load smart reminders from prescription uploads
    const smartReminderData = JSON.parse(localStorage.getItem('smartReminders') || '[]');
    const patientSmartReminders = smartReminderData.filter(r => r.patientId === patientId);
    setSmartReminders(patientSmartReminders);
  };

  const getNextReminderTime = (scheduleText) => {
    const now = new Date();
    if (scheduleText.toLowerCase().includes('morning')) {
      const morning = new Date(now);
      morning.setHours(8, 0, 0, 0);
      return morning > now ? morning : new Date(morning.getTime() + 24 * 60 * 60 * 1000);
    }
    if (scheduleText.toLowerCase().includes('evening')) {
      const evening = new Date(now);
      evening.setHours(18, 0, 0, 0);
      return evening > now ? evening : new Date(evening.getTime() + 24 * 60 * 60 * 1000);
    }
    return new Date(now.getTime() + 60 * 60 * 1000);
  };

  const getTimingColor = (timing) => {
    const colors = {
      morning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      afternoon: 'bg-orange-100 text-orange-800 border-orange-200',
      evening: 'bg-blue-100 text-blue-800 border-blue-200',
      night: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[timing] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Clear all reminders function
  const handleClearAllReminders = () => {
    if (window.confirm('Are you sure you want to clear all reminders? This will remove all current reminders and medication schedules.')) {
      // Clear all reminder data
      localStorage.removeItem('smartReminders');
      localStorage.removeItem('medicineSchedule');
      localStorage.removeItem('adherenceReports');
      
      // Update state
      setReminders([]);
      setSmartReminders([]);
      
      alert('All reminders cleared successfully!');
    }
  };

  const markAsTaken = (reminderId, medicationName = 'Medicine') => {
    // Update reminders
    setReminders(prev => 
      prev.map(r => r.id === reminderId ? { ...r, status: 'taken' } : r)
    );

    // Update smart reminders
    setSmartReminders(prev => 
      prev.map(r => r.id === reminderId ? { ...r, status: 'taken' } : r)
    );

    // Update localStorage for smart reminders
    const allSmartReminders = JSON.parse(localStorage.getItem('smartReminders') || '[]');
    const updatedSmartReminders = allSmartReminders.map(r => 
      r.id === reminderId ? {...r, status: 'taken'} : r
    );
    localStorage.setItem('smartReminders', JSON.stringify(updatedSmartReminders));

    // Report to doctor for real-time sync
    const adherenceReport = {
      patientId,
      medicationTaken: true,
      medicationName,
      timestamp: new Date().toISOString(),
      reminderId
    };

    const reports = JSON.parse(localStorage.getItem('adherenceReports') || '[]');
    reports.push(adherenceReport);
    localStorage.setItem('adherenceReports', JSON.stringify(reports));
  };

  const markAsMissed = (reminderId, medicationName = 'Medicine') => {
    // Update reminders and localStorage (same as markAsTaken but with medicationTaken: false)
    setReminders(prev => 
      prev.map(r => r.id === reminderId ? { ...r, status: 'missed' } : r)
    );

    setSmartReminders(prev => 
      prev.map(r => r.id === reminderId ? { ...r, status: 'missed' } : r)
    );

    const allSmartReminders = JSON.parse(localStorage.getItem('smartReminders') || '[]');
    const updatedSmartReminders = allSmartReminders.map(r => 
      r.id === reminderId ? {...r, status: 'missed'} : r
    );
    localStorage.setItem('smartReminders', JSON.stringify(updatedSmartReminders));

    const adherenceReport = {
      patientId,
      medicationTaken: false,
      medicationName,
      timestamp: new Date().toISOString(),
      reminderId
    };

    const reports = JSON.parse(localStorage.getItem('adherenceReports') || '[]');
    reports.push(adherenceReport);
    localStorage.setItem('adherenceReports', JSON.stringify(reports));

    // Emergency alert if too many missed
    const recentReports = reports.filter(r => 
      new Date() - new Date(r.timestamp) < 24 * 60 * 60 * 1000 && !r.medicationTaken
    );

    if (recentReports.length >= 3) {
      const alerts = JSON.parse(localStorage.getItem('doctorAlerts') || '[]');
      alerts.push({
        id: Date.now(),
        type: 'medication',
        priority: 'high',
        title: 'Patient Medication Non-Adherence',
        message: `Patient has missed ${recentReports.length} medications in 24 hours`,
        patientId,
        timestamp: new Date().toISOString(),
        active: true
      });
      localStorage.setItem('doctorAlerts', JSON.stringify(alerts));
    }
  };

  const totalReminders = reminders.length + smartReminders.length;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          ⏰ Smart Medicine Reminders
        </h3>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            {currentTime.toLocaleTimeString()}
          </div>
          {totalReminders > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleClearAllReminders}
              iconName="Trash2"
              iconPosition="left"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* SMART REMINDERS - From prescription analysis with UI labels */}
        {smartReminders.map((reminder) => (
          <div key={reminder.id} className={`p-4 rounded-lg border-2 transition-all ${
            reminder.status === 'taken' ? 'border-green-200 bg-green-50' :
            reminder.status === 'missed' ? 'border-red-200 bg-red-50' :
            'border-blue-200 bg-blue-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Icon name="Pill" size={20} className="text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{reminder.medicineName}</h4>
                    <p className="text-sm text-gray-600">{reminder.dosage}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTimingColor(reminder.timing)}`}>
                    {reminder.timing}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    reminder.status === 'taken' ? 'bg-green-100 text-green-800' :
                    reminder.status === 'missed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reminder.status}
                  </span>
                </div>
              </div>

              {reminder.status === 'pending' && (
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm"
                    onClick={() => markAsMissed(reminder.id, reminder.medicineName)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    ✗ Skip
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => markAsTaken(reminder.id, reminder.medicineName)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    ✓ Taken
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* REGULAR REMINDERS - From existing medicine schedules */}
        {reminders.map((reminder) => (
          <div key={reminder.id} className={`p-4 rounded-lg border-2 ${
            reminder.status === 'taken' ? 'border-green-200 bg-green-50' :
            reminder.status === 'missed' ? 'border-red-200 bg-red-50' :
            'border-yellow-200 bg-yellow-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Medicine Schedule</p>
                <p className="text-sm text-gray-600">
                  Next due: {reminder.nextDue.toLocaleTimeString()}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  {reminder.schedule.substring(0, 100)}...
                </div>
              </div>

              {reminder.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button 
                    size="sm"
                    onClick={() => markAsTaken(reminder.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    ✓ Taken
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={() => markAsMissed(reminder.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    ✗ Missed
                  </Button>
                </div>
              )}

              {reminder.status !== 'pending' && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  reminder.status === 'taken' ? 'bg-green-200 text-green-800' :
                  'bg-red-200 text-red-800'
                }`}>
                  {reminder.status === 'taken' ? '✓ Taken' : '✗ Missed'}
                </span>
              )}
            </div>
          </div>
        ))}

        {(reminders.length === 0 && smartReminders.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <p>No active medicine reminders</p>
            <p className="text-sm">Upload a prescription to create smart reminders</p>
          </div>
        )}
      </div>
    </div>
  );
}

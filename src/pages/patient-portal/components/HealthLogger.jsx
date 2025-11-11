import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const HealthLogger = ({ onLogSubmit, patientId = 'patient_123' }) => {
  const [activeTab, setActiveTab] = useState('vitals');
  const [vitalsData, setVitalsData] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    weight: '',
    bloodSugar: '',
    oxygenSaturation: '',
    steps: ''
  });
  
  // Google Fit integration states
  const [googleFitConnected, setGoogleFitConnected] = useState(false);
  const [fetchingFitData, setFetchingFitData] = useState(false);
  const [fitData, setFitData] = useState({});
  const [autoSync, setAutoSync] = useState(false);

  // Check environment variables on mount
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID not found in .env file');
      console.log('Please add: VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com');
    } else {
      console.log('Google Client ID configured:', clientId.substring(0, 10) + '...');
    }
  }, []);

  // Check Google Fit connection on mount
  useEffect(() => {
    checkGoogleFitToken();
    if (autoSync) {
      const interval = setInterval(fetchGoogleFitData, 5 * 60 * 1000); // Every 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoSync]);

  const checkGoogleFitToken = () => {
    const token = localStorage.getItem('googleFitToken');
    setGoogleFitConnected(!!token);
    if (token) {
      fetchGoogleFitData();
    }
  };

  // Helper function to load Google script with proper timing
  const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }

      // Check if script tag exists
      const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (existingScript) {
        // Script exists but not loaded yet, wait for it
        existingScript.addEventListener('load', () => {
          // Wait a bit more for the library to fully initialize
          setTimeout(() => {
            if (window.google?.accounts?.oauth2) {
              resolve();
            } else {
              reject(new Error('Google Identity Services failed to load properly'));
            }
          }, 500);
        });
        existingScript.addEventListener('error', () => {
          reject(new Error('Failed to load Google Identity Services script'));
        });
        return;
      }

      // Create and load the script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Wait for the library to fully initialize
        setTimeout(() => {
          if (window.google?.accounts?.oauth2) {
            resolve();
          } else {
            reject(new Error('Google Identity Services library not available'));
          }
        }, 500);
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services script'));
      };
      
      document.head.appendChild(script);
    });
  };

  // FIXED: Google Fit connection with proper scope formatting
  const connectGoogleFit = async () => {
    try {
      // Load the Google Identity Services script if not already loaded
      await loadGoogleScript();
      
      // Now safely use Google Identity Services
      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google Identity Services failed to initialize');
      }

      // Initialize OAuth2 token client with fixed scope formatting
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.oxygen_saturation.read',
        callback: (tokenResponse) => {
          if (tokenResponse.access_token) {
            localStorage.setItem('googleFitToken', tokenResponse.access_token);
            setGoogleFitConnected(true);
            alert('Google Fit connected successfully!');
            fetchGoogleFitData();
          } else {
            throw new Error('No access token received');
          }
        },
      });

      // Request the access token
      tokenClient.requestAccessToken();

    } catch (error) {
      console.error('Google Fit connection error:', error);
      alert('Failed to connect to Google Fit: ' + error.message);
    }
  };

  // ENHANCED: Improved Google Fit data fetching with error handling
  const fetchGoogleFitData = async () => {
    const token = localStorage.getItem('googleFitToken');
    if (!token) return;

    setFetchingFitData(true);
    
    try {
      const now = Date.now();
      const startTime = now - (24 * 60 * 60 * 1000); // Last 24 hours
      
      // Fetch different data types with improved error handling
      const [stepsData, heartRateData, weightData, oxygenData] = await Promise.allSettled([
        fetchFitDataType(token, 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps', startTime, now),
        fetchFitDataType(token, 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm', startTime, now),
        fetchFitDataType(token, 'derived:com.google.weight:com.google.android.gms:merge_weight', startTime, now),
        fetchFitDataType(token, 'derived:com.google.oxygen_saturation:com.google.android.gms:merge_oxygen_saturation', startTime, now)
      ]);

      const extractedData = {
        steps: stepsData.status === 'fulfilled' ? extractLatestValue(stepsData.value, 'intVal') || '0' : '0',
        heartRate: heartRateData.status === 'fulfilled' ? extractLatestValue(heartRateData.value, 'fpVal') || '' : '',
        weight: weightData.status === 'fulfilled' ? ((extractLatestValue(weightData.value, 'fpVal') || 0) * 2.20462).toFixed(1) : '', // Convert kg to lbs
        oxygenSaturation: oxygenData.status === 'fulfilled' ? extractLatestValue(oxygenData.value, 'fpVal') || '' : '',
        lastUpdated: new Date().toLocaleString()
      };

      setFitData(extractedData);
      
      // Auto-fill vitals form with Google Fit data
      setVitalsData(prev => ({
        ...prev,
        steps: extractedData.steps,
        heartRate: extractedData.heartRate,
        weight: extractedData.weight,
        oxygenSaturation: extractedData.oxygenSaturation
      }));

      // Check for emergency conditions
      checkEmergencyConditions(extractedData);
      
    } catch (error) {
      console.error('Error fetching Google Fit data:', error);
      alert('Error syncing Google Fit data: ' + error.message);
    } finally {
      setFetchingFitData(false);
    }
  };

  // Helper function to fetch specific data type
  const fetchFitDataType = async (token, dataSourceId, startTime, endTime) => {
    const response = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSourceId}/datasets/${startTime * 1000000}-${endTime * 1000000}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, disconnect
        localStorage.removeItem('googleFitToken');
        setGoogleFitConnected(false);
        throw new Error('Google Fit token expired. Please reconnect.');
      }
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return response.json();
  };

  // Extract latest value from Google Fit response
  const extractLatestValue = (data, valueType) => {
    if (!data.point || data.point.length === 0) return null;
    
    const latestPoint = data.point[data.point.length - 1];
    return latestPoint.value?.[0]?.[valueType];
  };

  // ENHANCED: Emergency conditions checking with more parameters
  const checkEmergencyConditions = (data) => {
    const alerts = [];
    
    // Heart rate checks
    if (data.heartRate) {
      const hr = parseFloat(data.heartRate);
      if (hr < 50) {
        alerts.push({
          type: 'heart_rate_critical_low',
          message: `Heart rate critically low: ${hr} bpm - Seek immediate medical attention`,
          severity: 'critical'
        });
      } else if (hr < 60) {
        alerts.push({
          type: 'heart_rate_low',
          message: `Heart rate low: ${hr} bpm`,
          severity: 'high'
        });
      } else if (hr > 120) {
        alerts.push({
          type: 'heart_rate_critical_high',
          message: `Heart rate critically high: ${hr} bpm - Seek immediate medical attention`,
          severity: 'critical'
        });
      } else if (hr > 100) {
        alerts.push({
          type: 'heart_rate_high',
          message: `Heart rate elevated: ${hr} bpm`,
          severity: 'high'
        });
      }
    }

    // Oxygen saturation checks
    if (data.oxygenSaturation) {
      const o2 = parseFloat(data.oxygenSaturation);
      if (o2 < 90) {
        alerts.push({
          type: 'oxygen_critical_low',
          message: `Oxygen saturation critically low: ${o2}% - Seek immediate medical attention`,
          severity: 'critical'
        });
      } else if (o2 < 95) {
        alerts.push({
          type: 'oxygen_low',
          message: `Oxygen saturation low: ${o2}%`,
          severity: 'high'
        });
      }
    }

    // Send alerts to doctor if any
    if (alerts.length > 0) {
      sendEmergencyAlertsToDoctor(alerts);
    }
  };

  // ENHANCED: Emergency alerts with priority levels
  const sendEmergencyAlertsToDoctor = (alerts) => {
    alerts.forEach(alert => {
      const doctorAlert = {
        id: Date.now() + Math.random(),
        type: 'patient_vitals',
        priority: alert.severity,
        title: alert.severity === 'critical' ? 'CRITICAL - Patient Vital Alert' : 'Patient Vital Alert',
        message: `${patientId}: ${alert.message}`,
        patientId,
        timestamp: new Date().toISOString(),
        active: true,
        vitalsData: fitData,
        actionRequired: alert.severity === 'critical'
      };

      // Save to doctor alerts
      const doctorAlerts = JSON.parse(localStorage.getItem('doctorAlerts') || '[]');
      doctorAlerts.push(doctorAlert);
      localStorage.setItem('doctorAlerts', JSON.stringify(doctorAlerts));

      // Show user notification for critical alerts
      if (alert.severity === 'critical') {
        if (Notification.permission === 'granted') {
          new Notification('Critical Health Alert', {
            body: alert.message,
            icon: '/favicon.ico',
            requireInteraction: true
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Critical Health Alert', {
                body: alert.message,
                icon: '/favicon.ico',
                requireInteraction: true
              });
            }
          });
        }
      }
    });
  };

  // ENHANCED: Mock data function for testing without Google Fit
  const useMockGoogleFitData = () => {
    const mockData = {
      steps: '8,247',
      heartRate: '72',
      weight: '165.2',
      oxygenSaturation: '98',
      lastUpdated: new Date().toLocaleString()
    };
    
    setFitData(mockData);
    setGoogleFitConnected(true); // Mark as connected for UI testing
    setVitalsData(prev => ({
      ...prev,
      steps: mockData.steps,
      heartRate: mockData.heartRate,
      weight: mockData.weight,
      oxygenSaturation: mockData.oxygenSaturation
    }));
    
    // Test emergency alerts with mock data
    checkEmergencyConditions(mockData);
    
    alert('Mock Google Fit data loaded! You can now test the vitals system.');
  };

  // Save vitals to backend/localStorage with enhanced data
  const handleSubmit = (type) => {
    const timestamp = new Date().toISOString();
    let logData = { type, timestamp, patientId };

    switch (type) {
      case 'vitals':
        logData = { 
          ...logData, 
          data: vitalsData, 
          source: googleFitConnected ? 'google_fit_enhanced' : 'manual_entry',
          googleFitData: googleFitConnected ? fitData : null
        };
        
        // Save to patient vitals history
        const vitalsHistory = JSON.parse(localStorage.getItem('patientVitals') || '[]');
        vitalsHistory.push(logData);
        localStorage.setItem('patientVitals', JSON.stringify(vitalsHistory));
        
        // Reset form
        setVitalsData({
          bloodPressureSystolic: '',
          bloodPressureDiastolic: '',
          heartRate: '',
          temperature: '',
          weight: '',
          bloodSugar: '',
          oxygenSaturation: '',
          steps: ''
        });
        break;
    }

    if (onLogSubmit) {
      onLogSubmit(logData);
    }

    alert('Health data logged successfully!');
  };

  const getVitalStatus = (vital, value) => {
    const numValue = parseFloat(value);
    if (!numValue) return null;

    switch (vital) {
      case 'bloodPressureSystolic':
        if (numValue < 120) return { status: 'normal', color: 'text-success' };
        if (numValue < 140) return { status: 'elevated', color: 'text-warning' };
        return { status: 'high', color: 'text-error' };
      case 'heartRate':
        if (numValue >= 60 && numValue <= 100) return { status: 'normal', color: 'text-success' };
        return { status: 'abnormal', color: 'text-warning' };
      case 'oxygenSaturation':
        if (numValue >= 95) return { status: 'normal', color: 'text-success' };
        return { status: 'low', color: 'text-error' };
      default:
        return null;
    }
  };

  const renderVitalsTab = () => (
    <div className="space-y-6">
      {/* Google Fit Integration Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon name="Activity" size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Google Fit Integration</h3>
              <p className="text-sm text-gray-600">Sync data from your ColorFit smartwatch</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {googleFitConnected ? (
              <>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Connected</span>
                <Button
                  size="sm"
                  onClick={fetchGoogleFitData}
                  disabled={fetchingFitData}
                  iconName="RefreshCw"
                  iconPosition="left"
                  className="bg-blue-600 text-white"
                >
                  {fetchingFitData ? 'Syncing...' : 'Sync Now'}
                </Button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={connectGoogleFit}
                  iconName="Link"
                  iconPosition="left"
                  className="bg-blue-600 text-white"
                >
                  Connect Google Fit
                </Button>
                <Button
                  size="sm"
                  onClick={useMockGoogleFitData}
                  variant="outline"
                  className="text-blue-600 border-blue-600"
                >
                  Use Test Data
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Show connection status */}
        <div className="text-xs text-gray-500 mb-2">
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? 
            'Client ID configured ✓' : 
            '⚠️ Missing VITE_GOOGLE_CLIENT_ID in .env file'
          }
        </div>

        {/* Real-time Data Display */}
        {(googleFitConnected || Object.keys(fitData).length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="flex items-center space-x-2">
                <Icon name="Activity" size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Steps</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{fitData.steps || '0'}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="flex items-center space-x-2">
                <Icon name="Heart" size={16} className="text-red-600" />
                <span className="text-sm font-medium text-gray-700">Heart Rate</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{fitData.heartRate || '--'} bpm</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="flex items-center space-x-2">
                <Icon name="Scale" size={16} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">Weight</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{fitData.weight || '--'} lbs</p>
            </div>

            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="flex items-center space-x-2">
                <Icon name="Wind" size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Oxygen</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{fitData.oxygenSaturation || '--'}%</p>
            </div>
          </div>
        )}

        {/* Auto Sync Toggle */}
        {googleFitConnected && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-100">
            <span className="text-sm text-gray-700">Auto-sync every 5 minutes</span>
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoSync ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoSync ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {/* Last Updated */}
        {fitData.lastUpdated && (
          <div className="mt-2 text-xs text-gray-500">
            Last synced: {fitData.lastUpdated}
          </div>
        )}
      </div>

      {/* Manual Vitals Input */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Manual Vitals Entry</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Blood Pressure */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Blood Pressure</label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  type="number"
                  placeholder="Systolic"
                  value={vitalsData.bloodPressureSystolic}
                  onChange={(e) => setVitalsData(prev => ({...prev, bloodPressureSystolic: e.target.value}))}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-text-secondary">mmHg</span>
              </div>
              <span className="self-center text-text-secondary">/</span>
              <div className="flex-1 relative">
                <Input
                  type="number"
                  placeholder="Diastolic"
                  value={vitalsData.bloodPressureDiastolic}
                  onChange={(e) => setVitalsData(prev => ({...prev, bloodPressureDiastolic: e.target.value}))}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-text-secondary">mmHg</span>
              </div>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="relative">
            <Input
              label="Heart Rate"
              type="number"
              placeholder="Enter heart rate"
              value={vitalsData.heartRate}
              onChange={(e) => setVitalsData(prev => ({...prev, heartRate: e.target.value}))}
              className="pr-12"
            />
            <span className="absolute right-3 top-9 text-sm text-text-secondary">bpm</span>
            {getVitalStatus('heartRate', vitalsData.heartRate) && (
              <Icon
                name="Heart"
                size={16}
                className={`absolute right-8 top-9 ${getVitalStatus('heartRate', vitalsData.heartRate).color}`}
              />
            )}
          </div>

          {/* Steps */}
          <div className="relative">
            <Input
              label="Steps"
              type="number"
              placeholder="Daily steps"
              value={vitalsData.steps}
              onChange={(e) => setVitalsData(prev => ({...prev, steps: e.target.value}))}
              className="pr-16"
            />
            <span className="absolute right-3 top-9 text-sm text-text-secondary">steps</span>
          </div>

          {/* Weight */}
          <div className="relative">
            <Input
              label="Weight"
              type="number"
              step="0.1"
              placeholder="Enter weight"
              value={vitalsData.weight}
              onChange={(e) => setVitalsData(prev => ({...prev, weight: e.target.value}))}
              className="pr-8"
            />
            <span className="absolute right-3 top-9 text-sm text-text-secondary">lbs</span>
          </div>

          {/* Temperature */}
          <div className="relative">
            <Input
              label="Temperature"
              type="number"
              step="0.1"
              placeholder="Enter temperature"
              value={vitalsData.temperature}
              onChange={(e) => setVitalsData(prev => ({...prev, temperature: e.target.value}))}
              className="pr-8"
            />
            <span className="absolute right-3 top-9 text-sm text-text-secondary">°F</span>
          </div>

          {/* Blood Sugar */}
          <div className="relative">
            <Input
              label="Blood Sugar"
              type="number"
              placeholder="Enter blood sugar"
              value={vitalsData.bloodSugar}
              onChange={(e) => setVitalsData(prev => ({...prev, bloodSugar: e.target.value}))}
              className="pr-12"
            />
            <span className="absolute right-3 top-9 text-sm text-text-secondary">mg/dL</span>
          </div>

          {/* Oxygen Saturation */}
          <div className="relative">
            <Input
              label="Oxygen Saturation"
              type="number"
              placeholder="Enter O2 saturation"
              value={vitalsData.oxygenSaturation}
              onChange={(e) => setVitalsData(prev => ({...prev, oxygenSaturation: e.target.value}))}
              className="pr-8"
            />
            <span className="absolute right-3 top-9 text-sm text-text-secondary">%</span>
            {getVitalStatus('oxygenSaturation', vitalsData.oxygenSaturation) && (
              <Icon
                name="Activity"
                size={16}
                className={`absolute right-8 top-9 ${getVitalStatus('oxygenSaturation', vitalsData.oxygenSaturation).color}`}
              />
            )}
          </div>
        </div>

        <Button
          variant="default"
          onClick={() => handleSubmit('vitals')}
          iconName="Save"
          iconPosition="left"
          iconSize={16}
          className="w-full"
        >
          Log Vitals
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Health Logger</h2>
        <p className="text-sm text-text-secondary mt-1">
          Track your vitals with Google Fit integration and manual entry
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('vitals')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-medical ${
            activeTab === 'vitals' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon name="Activity" size={16} />
          <span>Vitals</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'vitals' && renderVitalsTab()}
    </div>
  );
};

export default HealthLogger;

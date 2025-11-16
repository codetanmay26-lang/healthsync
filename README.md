# HealthSync

> AI-powered continuity of care platform connecting hospitals, patients, and care teams

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## ▸ Overview

HealthSync bridges the healthcare gap post-discharge by creating a connected care loop between hospitals, patients, and dedicated care teams. Using AI-powered insights, smart reminders, and real-time monitoring, it ensures safe and effective patient recovery at home.

### ▸ Problem Statement

- 43% of patients miss medications within 30 days of discharge
- Poor coordination between healthcare providers
- Late detection of emergency situations
- Lack of automated follow-up systems

## ▸ Key Features

🔹 **AI-Powered OCR** - Automatically digitizes prescriptions and lab reports  
🔹 **Smart Reminders** - Personalized medication and appointment alerts  
🔹 **Lab Analysis** - AI flags abnormal values for immediate doctor attention  
🔹 **Emergency Prediction** - Real-time risk assessment from vitals and lab data  
🔹 **Care Team Coordination** - Shared workspaces for outreach and follow-ups  
🔹 **Multi-Role Dashboards** - Tailored interfaces for doctors, patients, and admins  
🔹 **Wearable Integration** - Real-time vitals from smartwatch

## ▸ Tech Stack

| Layer          | Technology/Libraries                                         |
| -------------- | ------------------------------------------------------------ |
| **Frontend**   | React 18, Vite, Tailwind CSS, Redux Toolkit, React Router v6 |
| **Styling**    | TailwindCSS (forms, typography, layouts), Framer Motion      |
| **Data Viz**   | D3.js, Recharts                                              |
| **Forms**      | React Hook Form                                              |
| **Testing**    | Jest, React Testing Library                                  |
| **AI/NLP/OCR** | Azure Computer Vision, spaCy, Google Vision, Gemini API      |
| **Backend**    | Node.js (Firebase & Realtime DB planned)                     |
| **APIs**       | Google Fit, Gemini API, Cloud Messaging (future)             |
| **Other**      | Axios, class-variance-authority, date-fns, jsPDF             |
| **Dev Tools**  | Vite, PostCSS, ESLint, Autoprefixer                          |

## ▸ Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## ▸ Installation

1. Install dependencies:

   ```bash
   npm install
   npm install jspdf react-pdftotext
   # or
   yarn install
   yarn add jspdf react-pdftotext

   ```

2. Configure environment variables (`.env`):

```env
VITE_AZURE_VISION_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com
VITE_AZURE_VISION_KEY=your-azure-vision-key
VITE_AZURE_VISION_API_VERSION=2024-02-01
```

The endpoint/key pair comes from the Azure AI Services resource that has Computer Vision enabled. Keep these values private.

````
2. Start the development server:
```bash
npm start
# or
yarn start
````

## ▸ Demo Data & Privacy

**Frontend prototype for demonstration purposes only**

- **Storage**: All data (prescriptions, labs, vitals, meds) stored in browser localStorage
- **Privacy**: Data never leaves your device • Completely isolated per user
- **Persistence**: Data survives browser restarts until manually cleared
- **Reset Options**:
  - 🔹 Use Incognito/Private mode (recommended)
  - 🔹 Clear browser cache: Settings → Privacy → Clear browsing data
- **Note**: Logout only clears auth tokens, not demo data

  **For fresh demo**: Open in Incognito mode and login with test credentials

## ▸ Demo Credentials

**Quick Login:** Simply click on any user card on the login page for instant access—no need to manually enter credentials!

| Role    | Email                  | Password   |
| ------- | ---------------------- | ---------- |
| Doctor  | doctor@healthsync.com  | doctor123  |
| Patient | patient@healthsync.com | patient123 |
| Admin   | admin@healthsync.com   | admin123   |

## ▸ Usage

1. **Login** with demo credentials
2. **Upload** prescriptions/lab reports (patients)
3. **View** AI-generated insights and schedules
4. **Monitor** real-time alerts and notifications
5. **Track** medication adherence and health metrics

## ▸ Project Structure

```
healthsync-main
├─ .coderabbit.yaml
├─ .env
├─ favicon.ico
├─ index.html
├─ jsconfig.json
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ assets
│  │  └─ images
│  │     ├─ favicon.ico
│  │     ├─ logo.png
│  │     └─ no_image.png
│  ├─ favicon.ico
│  ├─ manifest.json
│  └─ robots.txt
├─ README.md
├─ src
│  ├─ App.jsx
│  ├─ components
│  │  ├─ AppIcon.jsx
│  │  ├─ AppImage.jsx
│  │  ├─ ErrorBoundary.jsx
│  │  ├─ ProtectedRoute.jsx
│  │  ├─ ScrollToTop.jsx
│  │  └─ ui
│  │     ├─ BreadcrumbNavigation.jsx
│  │     ├─ Button.jsx
│  │     ├─ Checkbox.jsx
│  │     ├─ EmergencyAlertBanner.jsx
│  │     ├─ Header.jsx
│  │     ├─ Input.jsx
│  │     ├─ Select.jsx
│  │     ├─ Toast.jsx
│  │     └─ UserContextIndicator.jsx
│  ├─ contexts
│  │  └─ AuthContext.jsx
│  ├─ index.jsx
│  ├─ pages
│  │  ├─ admin-analytics
│  │  │  ├─ components
│  │  │  │  ├─ AnalyticsChart.jsx
│  │  │  │  ├─ MetricsOverview.jsx
│  │  │  │  ├─ PredictiveAnalytics.jsx
│  │  │  │  ├─ SystemStatusPanel.jsx
│  │  │  │  ├─ UserManagement.jsx
│  │  │  │  └─ UserManagementPanel.jsx
│  │  │  └─ index.jsx
│  │  ├─ doctor-dashboard
│  │  │  ├─ components
│  │  │  │  ├─ AnalysisReportsPanel.jsx
│  │  │  │  ├─ DoctorMessaging.jsx
│  │  │  │  ├─ EmergencyAlertsPanel.jsx
│  │  │  │  ├─ FilterControls.jsx
│  │  │  │  ├─ PatientAnalyticsRealTime.jsx
│  │  │  │  ├─ PatientListTable.jsx
│  │  │  │  ├─ PatientVitalsPanel.jsx
│  │  │  │  ├─ QuickActionsPanel.jsx
│  │  │  │  ├─ ReviewedReportsPage.jsx
│  │  │  │  └─ SummaryMetricsCards.jsx
│  │  │  └─ index.jsx
│  │  ├─ login
│  │  │  ├─ components
│  │  │  │  ├─ LoginForm.jsx
│  │  │  │  ├─ TestCredentials.jsx
│  │  │  │  └─ WelcomeHeader.jsx
│  │  │  └─ index.jsx
│  │  ├─ NotFound.jsx
│  │  ├─ patient-portal
│  │  │  ├─ components
│  │  │  │  ├─ AdherenceCalendar.jsx
│  │  │  │  ├─ EmergencyContactPanel.jsx
│  │  │  │  ├─ HealthLogger.jsx
│  │  │  │  ├─ LabReportUploader.jsx
│  │  │  │  ├─ MedicationTimeline.jsx
│  │  │  │  ├─ MedicineListViewer.jsx
│  │  │  │  ├─ MedicineReminder.jsx
│  │  │  │  ├─ MessagingInterface.jsx
│  │  │  │  ├─ NotificationCenter.jsx
│  │  │  │  └─ PrescriptionUploader.jsx
│  │  │  └─ index.jsx
│  │  ├─ patient-profile
│  │  │  ├─ components
│  │  │  │  ├─ AISuggestions.jsx
│  │  │  │  ├─ ChatMessaging.jsx
│  │  │  │  ├─ HealthLogsChart.jsx
│  │  │  │  ├─ LabReportsViewer.jsx
│  │  │  │  ├─ MedicationTimeline.jsx
│  │  │  │  └─ PatientHeader.jsx
│  │  │  └─ index.jsx
│  │  └─ welcome
│  │     ├─ background.css
│  │     ├─ CombinedIllustration.jsx
│  │     ├─ CustomCursor.jsx
│  │     └─ index.jsx
│  ├─ Routes.jsx
│  ├─ services
│  │  ├─ localStorageUserManagement.js
│  │  └─ realTimeAnalytics.js
│  ├─ styles
│  │  ├─ index.css
│  │  └─ tailwind.css
│  ├─ test
│  │  ├─ app.test.jsx
│  │  └─ setup.js
│  └─ utils
│     ├─ aiAnalysis.js
│     ├─ cn.js
│     └─ prescriptionAnalysis.js
├─ tailwind.config.js
├─ TESTING.md
├─ vercel.json
├─ vite.config.mjs
└─ vitest.config.mjs

```

## ▸ Achievements

- Addresses WHO SDG 3: Good Health & Well-being
- Solves critical post-discharge care gap
- Integrates multiple healthcare stakeholders
- AI-powered predictive healthcare approach.

## ▸ Acknowledgments

- React and Vite communities
- Healthcare professionals providing insights
- Open-source AI/ML libraries
- MedTech hackathon community

<div align="center">
  <strong>HealthSync - Transforming Post-Discharge Care</strong><br>
  Made with ❤️ by Team Sudo cure
</div>

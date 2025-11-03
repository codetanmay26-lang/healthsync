// src/pages/welcome/index.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import CombinedIllustration from './CombinedIllustration';
import CustomCursor from './CustomCursor';
import './background.css';

const WelcomePage = () => {
  const features = [
    {
      icon: 'Stethoscope',
      title: 'For Doctors',
      description: 'Monitor patient adherence, analyze vitals, and receive AI-powered insights.',
      color: 'text-blue-500',
    },
    {
      icon: 'User',
      title: 'For Patients',
      description: 'Track your medication, log health data, and connect with your care team.',
      color: 'text-emerald-500',
    },
    {
      icon: 'Pill',
      title: 'For Pharmacy',
      description: 'Manage inventory, process refills, and monitor medication storage.',
      color: 'text-amber-500',
    },
    {
      icon: 'Shield',
      title: 'For Admins',
      description: 'Oversee analytics, manage users, and ensure seamless continuity of care.',
      color: 'text-indigo-500',
    },
  ];

  return (
    <div className="min-h-screen text-gray-800 flex flex-col body-gradient">
      <CustomCursor />
      {/* Header */}
      <header className="relative z-10 p-4 flex justify-between items-center bg-transparent">
        <div className="flex items-center space-x-2">
          {/* Ensure this path points to your logo */}
          <img src="/assets/images/logo.png" alt="HealthSync Logo" className="w-9 h-9" />
          <span className="font-bold text-2xl text-gray-900">HealthSync</span>
        </div>
        <Button asChild className="bg-white/80 text-blue-600 font-semibold hover:bg-white shadow-sm">
          <Link to="/login">Sign In</Link>
        </Button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="text-left">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              AI-Powered Continuity of Care
            </h1>
            <p className="text-lg text-gray-700 mb-10">
              HealthSync optimizes patient recovery, reduces hospital readmissions, and empowers healthcare professionals with intelligent monitoring.
            </p>
            <Button
              size="xl"
              className="bg-blue-600 text-white shadow-lg hover:bg-blue-700 transform transition-transform duration-200 hover:scale-105"
              asChild
            >
              <Link to="/login">
                <Icon name="ArrowRight" className="mr-2" />
                Get Started
              </Link>
            </Button>
          </div>
          <div className="w-full h-80 md:h-96">
            <CombinedIllustration />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 w-full py-24">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6">
          {features.map((feature, index) => (
            <div key={index} className="glass-card p-8 rounded-2xl text-left">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/50 mb-5 pulse-animation">
                <Icon name={feature.icon} size={32} className={feature.color} />
              </div>
              <h3 className="font-semibold text-xl text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-sm text-gray-600 bg-transparent">
        © {new Date().getFullYear()} HealthSync. All rights reserved.
      </footer>
    </div>
  );
};

export default WelcomePage;

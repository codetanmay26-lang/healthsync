import React from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeHeader = () => {
  return (
    <div className="text-center space-y-4">
      {/* Logo */}
<div className="flex flex-col items-center space-y-3">
  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
    <Icon name="Heart" size={28} color="white" />
  </div>
  <div className="text-center">
    <h1 className="text-2xl font-bold text-text-primary">HealthSync</h1>
    <p className="text-sm text-text-secondary">AI-powered Continuity of Care</p>
  </div>
</div>

      {/* Welcome Message */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-text-primary">
          Welcome Back
        </h2>
        <p className="text-text-secondary max-w-md mx-auto">
          Sign in to manage post-discharge intelligence — optimizing recovery, reducing readmissions, and empowering patients and providers alike.
        </p>
      </div>
      {/* Current Time */}
      <div className="flex items-center justify-center space-x-2 text-sm text-text-secondary">
        <Icon name="Clock" size={16} />
        <span>
          {new Date()?.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>
    </div>
  );
};

export default WelcomeHeader;

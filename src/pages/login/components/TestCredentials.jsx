import React, { useState } from "react";
import Icon from "../../../components/AppIcon";

const TestCredentials = ({ onCredentialSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const testAccounts = [
    {
      role: "doctor",
      email: "doctor@healthsync.com",
      password: "doctor123",
      name: "Dr. Sarah Johnson",
      icon: "Stethoscope",
      color: "text-primary bg-primary/10",
    },
    {
      role: "patient",
      email: "patient@healthsync.com",
      password: "patient123",
      name: "Rakesh Sharma",
      icon: "User",
      color: "text-accent bg-accent/10",
    },
    {
      role: "admin",
      email: "admin@healthsync.com",
      password: "admin123",
      name: "System Administrator",
      icon: "Shield",
      color: "text-error bg-error/10",
    },
  ];

  const handleCredentialClick = (account) => {
    onCredentialSelect({
      email: account?.email,
      password: account?.password,
      role: account?.role,
    });
  };

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center space-x-2">
          <Icon name="TestTube" size={16} className="text-text-secondary" />
          <span className="text-sm font-medium text-text-primary">
            Demo Credentials
          </span>
        </div>
        <Icon
          name={isExpanded ? "ChevronUp" : "ChevronDown"}
          size={16}
          className="text-text-secondary"
        />
      </button>
      {isExpanded && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-text-secondary mb-3">
            Click any account below to auto-fill login credentials for testing:
          </p>

          {testAccounts?.map((account) => (
            <button
              key={account?.role}
              onClick={() => handleCredentialClick(account)}
              className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-surface transition-medical text-left"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${account?.color}`}
              >
                <Icon name={account?.icon} size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-text-primary">
                    {account?.name}
                  </span>
                  <span className="text-xs text-text-secondary capitalize">
                    ({account?.role})
                  </span>
                </div>
                <div className="text-xs text-text-secondary font-mono">
                  {account?.email}
                </div>
              </div>
              <Icon name="Copy" size={14} className="text-text-secondary" />
            </button>
          ))}

          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-text-secondary">
              <Icon name="Info" size={12} className="inline mr-1" />
              All demo accounts use simple passwords for testing purposes only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCredentials;

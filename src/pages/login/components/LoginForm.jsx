import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const LoginForm = ({ onLogin, isLoading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'doctor',
    rememberMe: false
  });
  const [validationErrors, setValidationErrors] = useState({});

  const roles = [
    { value: 'doctor', label: 'Doctor', icon: 'Stethoscope' },
    { value: 'patient', label: 'Patient', icon: 'User' },
    { value: 'pharmacy', label: 'Pharmacy', icon: 'Pill' },
    { value: 'admin', label: 'Administrator', icon: 'Shield' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors?.[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData?.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      errors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onLogin(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Input */}
      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        value={formData?.email}
        onChange={(e) => handleInputChange('email', e?.target?.value)}
        error={validationErrors?.email}
        required
        disabled={isLoading}
      />
      {/* Password Input */}
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={formData?.password}
        onChange={(e) => handleInputChange('password', e?.target?.value)}
        error={validationErrors?.password}
        required
        disabled={isLoading}
      />
      {/* Role Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-primary">
          Select Your Role
        </label>
        <div className="grid grid-cols-2 gap-3">
          {roles?.map((role) => (
            <button
              key={role?.value}
              type="button"
              onClick={() => handleInputChange('role', role?.value)}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-medical ${
                formData?.role === role?.value
                  ? 'border-primary bg-primary/10 text-primary' :'border-border bg-surface hover:bg-muted text-text-secondary'
              }`}
              disabled={isLoading}
            >
              <Icon name={role?.icon} size={20} />
              <span className="text-sm font-medium">{role?.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Remember Me */}
      <div className="flex items-center justify-between">
        <Checkbox
          label="Remember me"
          checked={formData?.rememberMe}
          onChange={(e) => handleInputChange('rememberMe', e?.target?.checked)}
          disabled={isLoading}
        />
        
        <button
          type="button"
          onClick={() => window.location.href = '/forgot-password'}
          className="text-sm text-primary hover:text-primary/80 transition-medical"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>
      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-error/10 border border-error/20 rounded-lg">
          <Icon name="AlertCircle" size={16} className="text-error" />
          <span className="text-sm text-error">{error}</span>
        </div>
      )}
      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        iconName="LogIn"
        iconPosition="right"
        iconSize={18}
        disabled={isLoading}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
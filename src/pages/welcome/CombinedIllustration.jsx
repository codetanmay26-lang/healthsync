// src/pages/welcome/CombinedIllustration.jsx
import React from 'react';
import Icon from '../../components/AppIcon';

const CombinedIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    {/* Floating Side Icons */}
    <div className="absolute w-full h-full">
      <Icon name="Heart" size={24} className="absolute top-10 left-16 text-red-400 opacity-60 animate-bounce" style={{ animationDelay: '0.2s' }} />
      <Icon name="Pill" size={20} className="absolute bottom-12 right-20 text-amber-500 opacity-70 animate-bounce" style={{ animationDelay: '0.7s' }} />
      <Icon name="Shield" size={22} className="absolute top-20 right-10 text-indigo-400 opacity-60 animate-bounce" style={{ animationDelay: '1.2s' }} />
      <Icon name="Activity" size={26} className="absolute bottom-20 left-12 text-emerald-500 opacity-70 animate-bounce" style={{ animationDelay: '1.5s' }} />
      <Icon name="Plus" size={18} className="absolute top-1/2 left-8 text-blue-400 opacity-60 animate-bounce" style={{ animationDelay: '0.5s' }} />
    </div>

    {/* Central SVG Illustration */}
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="relative w-full h-full"
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.4)' }} />
          <stop offset="100%" style={{ stopColor: 'rgba(37, 99, 235, 0.7)' }} />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="70" fill="rgba(255, 255, 255, 0.3)" opacity="0.5">
        <animate attributeName="r" values="70;80;70" dur="5s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="100" r="50" fill="url(#grad1)" opacity="0.8" />

      <path
        d="M 65 100 L 80 100 L 85 90 L 95 110 L 100 100 L 115 100"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="100"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="100;0"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  </div>
);

export default CombinedIllustration;

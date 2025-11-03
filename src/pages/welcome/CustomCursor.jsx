// src/pages/welcome/CustomCursor.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      id="custom-cursor"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)', // Center the icon on the cursor
      }}
    >
      <Icon name="Stethoscope" size={32} className="text-blue-500" />
    </div>
  );
};

export default CustomCursor;

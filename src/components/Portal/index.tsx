import React from 'react';

interface PortalProps {
  children: React.ReactNode;
}

// Simple Portal implementation - just renders children
// In a real app, you'd use a proper portal implementation
const Portal: React.FC<PortalProps> = ({ children }) => {
  return <>{children}</>;
};

export default Portal;

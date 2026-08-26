import React from 'react';

export const Toast: React.FC<{ message: string; type?: 'success' | 'error' }> = ({ message, type = 'success' }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 'var(--space-4)',
      right: 'var(--space-4)',
      background: type === 'success' ? 'var(--bg-elevated)' : 'var(--accent-red)',
      color: '#fff',
      padding: 'var(--space-3) var(--space-4)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 'var(--z-toast)',
      animation: 'slideInRight 0.3s ease-out',
    }}>
      {message}
    </div>
  );
};

import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, id, ...props }) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginBottom: 'var(--space-4)', ...style }}>
      {label && <label htmlFor={inputId} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{label}</label>}
      <input
        id={inputId}
        style={{
          background: 'var(--bg-input)',
          border: `1px solid ${error ? 'var(--border-error)' : 'var(--border-default)'}`,
          color: 'var(--text-primary)',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-base)',
          outline: 'none',
          transition: 'border-color var(--transition-fast)',
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-red)' }}>{error}</span>}
    </div>
  );
};

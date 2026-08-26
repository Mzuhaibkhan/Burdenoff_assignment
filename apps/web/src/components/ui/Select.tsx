import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, style, id, ...props }) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginBottom: 'var(--space-4)', ...style }}>
      {label && <label htmlFor={selectId} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{label}</label>}
      <select
        id={selectId}
        style={{
          background: 'var(--bg-input)',
          border: `1px solid ${error ? 'var(--border-error)' : 'var(--border-default)'}`,
          color: 'var(--text-primary)',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-base)',
          outline: 'none',
        }}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-red)' }}>{error}</span>}
    </div>
  );
};

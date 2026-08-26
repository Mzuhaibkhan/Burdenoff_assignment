import React from 'react';

export const EmptyState: React.FC<{ title: string; description: string; action?: React.ReactNode }> = ({ title, description, action }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-10) var(--space-4)', textAlign: 'center' }}>
      <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', maxWidth: '400px' }}>{description}</p>
      {action}
    </div>
  );
};

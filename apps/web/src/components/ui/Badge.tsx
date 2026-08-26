import React from 'react';

export const Badge: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = 'var(--text-secondary)', style }) => {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)',
      fontWeight: 500,
      background: `color-mix(in srgb, ${color} 15%, transparent)`,
      color: color,
      border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {children}
    </span>
  );
};

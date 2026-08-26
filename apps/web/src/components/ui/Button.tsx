import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  style,
  children,
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': return { background: 'var(--accent-blue)', color: '#fff', border: 'none' };
      case 'secondary': return { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' };
      case 'danger': return { background: 'var(--accent-red)', color: '#fff', border: 'none' };
      case 'ghost': return { background: 'transparent', color: 'var(--text-secondary)', border: 'none' };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--text-sm)' };
      case 'md': return { padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-base)' };
      case 'lg': return { padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--text-lg)' };
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || isLoading) ? 0.6 : 1,
        transition: 'all var(--transition-fast)',
        fontFamily: 'inherit',
        fontWeight: 500,
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

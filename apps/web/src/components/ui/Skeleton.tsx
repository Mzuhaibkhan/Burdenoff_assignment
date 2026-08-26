import React from 'react';

export const Skeleton: React.FC<{ width?: string | number; height?: string | number; style?: React.CSSProperties }> = ({ width = '100%', height = '1rem', style }) => {
  return <div className="skeleton" style={{ width, height, ...style }} />;
};

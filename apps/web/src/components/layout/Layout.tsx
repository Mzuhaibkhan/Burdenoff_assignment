import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: 'var(--space-6)', maxWidth: 'var(--content-max-width)', margin: '0 auto', width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

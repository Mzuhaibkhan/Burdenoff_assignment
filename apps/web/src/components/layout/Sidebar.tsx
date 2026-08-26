import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, Calendar } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export const Sidebar = () => {
  const { isAgent } = useAuth();

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/tickets', icon: <Ticket size={20} />, label: 'Tickets' },
    ...(isAgent ? [{ to: '/holidays', icon: <Calendar size={20} />, label: 'Holidays' }] : []),
  ];

  return (
    <aside style={{ width: 'var(--sidebar-width)', borderRight: '1px solid var(--border-default)', background: 'var(--bg-secondary)', height: 'calc(100vh - var(--navbar-height))', position: 'fixed', left: 0, top: 'var(--navbar-height)', padding: 'var(--space-4)' }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-elevated)' : 'transparent',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'all var(--transition-fast)',
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

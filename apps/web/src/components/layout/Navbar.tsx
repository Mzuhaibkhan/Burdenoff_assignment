import React from 'react';
import { useAuth } from '../../lib/auth';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  
  return (
    <nav className="glass-card" style={{ height: 'var(--navbar-height)', position: 'sticky', top: 0, zIndex: 'var(--z-sticky)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-6)', borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <div style={{ background: 'var(--gradient-primary)', width: 32, height: 32, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>B</div>
        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600, letterSpacing: '-0.5px' }}>BurdenOff</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{user?.name}</span>
            <Badge color={user?.role === 'AGENT' ? 'var(--accent-purple)' : 'var(--text-secondary)'}>{user?.role}</Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} title="Logout" style={{ padding: 'var(--space-2)' }}>
          <LogOut size={18} />
        </Button>
      </div>
    </nav>
  );
};

import React from 'react';
import { useQuery } from 'urql';
import { Link } from 'react-router-dom';
import { CircleDot, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

const DashboardQuery = `
  query GetDashboard {
    dashboard {
      openTickets
      inProgressTickets
      atRiskTickets
      breachedTickets
      totalTickets
    }
    tickets(take: 5) {
      nodes {
        id
        title
        status
        priority
        createdAt
        sla { firstResponseState resolutionState }
      }
    }
  }
`;

const StatCard = ({ title, value, icon, color, gradient }: { title: string; value: number | string; icon: React.ReactNode; color: string; gradient: string }) => (
  <div className="glass-card" style={{ padding: 'var(--space-6)', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: gradient }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>{title}</p>
        <h3 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</h3>
      </div>
      <div style={{ color, background: `color-mix(in srgb, ${color} 15%, transparent)`, padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}>
        {icon}
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const [{ data, fetching, error }] = useQuery({ query: DashboardQuery });

  if (fetching) return <div><Skeleton height="120px" /><Skeleton height="400px" style={{ marginTop: '2rem' }} /></div>;
  if (error) return <div style={{ color: 'var(--accent-red)' }}>Error: {error.message}</div>;

  const { dashboard, tickets } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, marginBottom: 'var(--space-6)' }}>Dashboard Overview</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
          <StatCard title="Open Tickets" value={dashboard.openTickets} color="var(--accent-blue)" gradient="var(--gradient-primary)" icon={<CircleDot size={24} />} />
          <StatCard title="In Progress" value={dashboard.inProgressTickets} color="var(--accent-yellow)" gradient="var(--gradient-warning)" icon={<Clock size={24} />} />
          <StatCard title="SLA At Risk" value={dashboard.atRiskTickets} color="var(--accent-orange)" gradient="var(--gradient-warning)" icon={<AlertTriangle size={24} />} />
          <StatCard title="SLA Breached" value={dashboard.breachedTickets} color="var(--accent-red)" gradient="var(--gradient-danger)" icon={<XCircle size={24} className={dashboard.breachedTickets > 0 ? 'sla-breached-pulse' : ''} />} />
        </div>
      </div>
      
      <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Recent Tickets</h2>
          <Link to="/tickets" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent-blue)' }}>View all</Link>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {tickets.nodes.map((ticket: any) => (
            <Link key={ticket.id} to={`/tickets/${ticket.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', transition: 'background var(--transition-fast)', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{ticket.title}</span>
                <Badge color={`var(--priority-${ticket.priority.toLowerCase()})`}>{ticket.priority}</Badge>
                <Badge color={`var(--status-${ticket.status.toLowerCase().replace('_', '-')})`}>{ticket.status.replace('_', ' ')}</Badge>
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {new Date(ticket.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
          {tickets.nodes.length === 0 && <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-secondary)' }}>No recent tickets.</div>}
        </div>
      </div>
    </div>
  );
}

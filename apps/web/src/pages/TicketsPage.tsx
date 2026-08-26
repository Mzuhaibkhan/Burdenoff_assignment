import React, { useState } from 'react';
import { useQuery, useMutation } from 'urql';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

const TicketsQuery = `
  query GetTickets($status: TicketStatus, $priority: Priority, $slaState: SLAState) {
    tickets(status: $status, priority: $priority, slaState: $slaState) {
      nodes {
        id title status priority createdAt
        assignee { id name }
        sla { firstResponseState resolutionState firstResponseRemainingMinutes resolutionRemainingMinutes firstResponseDueAt resolutionDueAt }
      }
      totalCount
    }
  }
`;

const CreateTicketMutation = `
  mutation CreateTicket($input: CreateTicketInput!) {
    createTicket(input: $input) {
      id
    }
  }
`;

function SLABadge({ sla }: { sla: any }) {
  const getDisplay = () => {
    if (sla.resolutionState === 'BREACHED' || sla.firstResponseState === 'BREACHED') return { color: 'var(--accent-red)', text: 'Breached', pulse: true };
    if (sla.resolutionState === 'AT_RISK' || sla.firstResponseState === 'AT_RISK') return { color: 'var(--accent-orange)', text: 'At Risk' };
    if (sla.resolutionState === 'COMPLETED' && sla.firstResponseState === 'COMPLETED') return { color: 'var(--accent-green)', text: 'Completed' };
    
    // Default to track
    const minRem = sla.resolutionState === 'PENDING' || sla.resolutionState === 'ON_TRACK' ? sla.resolutionRemainingMinutes : sla.firstResponseRemainingMinutes;
    const hours = Math.floor(minRem / 60);
    const mins = minRem % 60;
    return { color: 'var(--accent-green)', text: `${hours}h ${mins}m left` };
  };
  const display = getDisplay();
  return <Badge color={display.color} style={{ animation: display.pulse ? 'breathe 2s ease-in-out infinite' : 'none' }}>SLA: {display.text}</Badge>;
}

export default function TicketsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState({ title: '', description: '', priority: 'MEDIUM' });

  const [{ data, fetching, error }, reexecute] = useQuery({ 
    query: TicketsQuery,
    variables: { 
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
    }
  });

  const [{ fetching: creating }, createTicket] = useMutation(CreateTicketMutation);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTicket({ input: formState });
    setIsModalOpen(false);
    reexecute({ requestPolicy: 'network-only' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 600 }}>Tickets</h1>
        <Button onClick={() => setIsModalOpen(true)}><Plus size={18} style={{ marginRight: '4px' }} /> New Ticket</Button>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)' }}>
        <Select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          options={[{label: 'All Statuses', value: ''}, {label: 'Open', value: 'OPEN'}, {label: 'In Progress', value: 'IN_PROGRESS'}, {label: 'Resolved', value: 'RESOLVED'}, {label: 'Closed', value: 'CLOSED'}]}
          style={{ marginBottom: 0, minWidth: '150px' }}
        />
        <Select 
          value={priorityFilter} 
          onChange={e => setPriorityFilter(e.target.value)} 
          options={[{label: 'All Priorities', value: ''}, {label: 'Low', value: 'LOW'}, {label: 'Medium', value: 'MEDIUM'}, {label: 'High', value: 'HIGH'}, {label: 'Urgent', value: 'URGENT'}]}
          style={{ marginBottom: 0, minWidth: '150px' }}
        />
        {(statusFilter || priorityFilter) && (
          <Button variant="ghost" onClick={() => { setStatusFilter(''); setPriorityFilter(''); }}>Clear</Button>
        )}
      </div>

      {fetching ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <Skeleton height="60px" /><Skeleton height="60px" /><Skeleton height="60px" />
        </div>
      ) : error ? (
        <div style={{ color: 'var(--accent-red)' }}>Error loading tickets: {error.message}</div>
      ) : data?.tickets.nodes.length === 0 ? (
        <EmptyState title="No tickets found" description="There are no tickets matching your current filters." action={<Button onClick={() => setIsModalOpen(true)}>Create Ticket</Button>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {data.tickets.nodes.map((ticket: any) => (
            <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="glass-card" style={{ display: 'block', padding: 'var(--space-4)', transition: 'transform var(--transition-fast)', textDecoration: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 500, color: 'var(--text-primary)' }}>{ticket.title}</h3>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{new Date(ticket.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Badge color={`var(--priority-${ticket.priority.toLowerCase()})`}>{ticket.priority}</Badge>
                <Badge color={`var(--status-${ticket.status.toLowerCase().replace('_', '-')})`}>{ticket.status.replace('_', ' ')}</Badge>
                <SLABadge sla={ticket.sla} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                  {ticket.assignee ? `Assigned to ${ticket.assignee.name}` : 'Unassigned'}
                </span>
              </div>
            </Link>
          ))}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Showing {data.tickets.nodes.length} of {data.tickets.totalCount} tickets
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Ticket">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column' }}>
          <Input label="Title" required minLength={3} value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginBottom: 'var(--space-4)' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              required minLength={10}
              value={formState.description}
              onChange={e => setFormState({...formState, description: e.target.value})}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', minHeight: '100px', resize: 'vertical' }}
            />
          </div>
          <Select label="Priority" options={[{label: 'Low', value: 'LOW'}, {label: 'Medium', value: 'MEDIUM'}, {label: 'High', value: 'HIGH'}, {label: 'Urgent', value: 'URGENT'}]} value={formState.priority} onChange={e => setFormState({...formState, priority: e.target.value})} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={creating}>Create Ticket</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

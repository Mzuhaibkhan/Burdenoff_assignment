import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'urql';
import { useAuth } from '../lib/auth';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Select } from '../components/ui/Select';

const TicketQuery = `
  query GetTicket($id: ID!) {
    ticket(id: $id) {
      id title description status priority createdAt resolvedAt
      reporter { id name email }
      assignee { id name }
      sla { firstResponseDueAt resolutionDueAt firstResponseState resolutionState firstResponseRemainingMinutes resolutionRemainingMinutes }
      comments { id content createdAt author { id name role } }
    }
  }
`;

const AddCommentMutation = `
  mutation AddComment($ticketId: ID!, $content: String!) {
    addComment(ticketId: $ticketId, content: $content) { id }
  }
`;

const ChangeStatusMutation = `
  mutation ChangeStatus($ticketId: ID!, $status: TicketStatus!) {
    changeTicketStatus(ticketId: $ticketId, status: $status) { id status }
  }
`;

export default function TicketDetailPage() {
  const { id } = useParams();
  const { isAgent } = useAuth();
  const [{ data, fetching, error }, reexecute] = useQuery({ query: TicketQuery, variables: { id } });
  
  const [commentText, setCommentText] = useState('');
  const [{ fetching: addingComment }, addComment] = useMutation(AddCommentMutation);
  const [{ fetching: changingStatus }, changeStatus] = useMutation(ChangeStatusMutation);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment({ ticketId: id, content: commentText });
    setCommentText('');
    reexecute({ requestPolicy: 'network-only' });
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await changeStatus({ ticketId: id, status: e.target.value });
    reexecute({ requestPolicy: 'network-only' });
  };

  if (fetching) return <Skeleton height="400px" />;
  if (error) return <div style={{ color: 'var(--accent-red)' }}>Error: {error.message}</div>;
  if (!data?.ticket) return <div>Ticket not found</div>;

  const { ticket } = data;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-6)', alignItems: 'start' }}>
      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>{ticket.title}</h1>
          <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
            <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{ticket.description}</p>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Comments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            {ticket.comments.map((comment: any) => (
              <div key={comment.id} className="glass-card" style={{ padding: 'var(--space-4)', borderLeft: comment.author.role === 'AGENT' ? '4px solid var(--accent-purple)' : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontWeight: 500 }}>{comment.author.name}</span>
                    <Badge color={comment.author.role === 'AGENT' ? 'var(--accent-purple)' : 'var(--text-secondary)'}>{comment.author.role}</Badge>
                  </div>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
              </div>
            ))}
            {ticket.comments.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No comments yet.</div>}
          </div>

          <form onSubmit={handleAddComment} className="glass-card" style={{ padding: 'var(--space-4)' }}>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', minHeight: '100px', resize: 'vertical', marginBottom: 'var(--space-3)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" isLoading={addingComment} disabled={!commentText.trim()}>Post Comment</Button>
            </div>
          </form>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-4)' }}>Details</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</div>
              {isAgent ? (
                <select value={ticket.status} onChange={handleStatusChange} disabled={changingStatus} style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-sm)' }}>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              ) : (
                <Badge color={`var(--status-${ticket.status.toLowerCase().replace('_', '-')})`}>{ticket.status.replace('_', ' ')}</Badge>
              )}
            </div>

            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Priority</div>
              <Badge color={`var(--priority-${ticket.priority.toLowerCase()})`}>{ticket.priority}</Badge>
            </div>

            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Reporter</div>
              <div style={{ fontWeight: 500 }}>{ticket.reporter.name}</div>
            </div>

            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Assignee</div>
              <div style={{ fontWeight: 500 }}>{ticket.assignee ? ticket.assignee.name : 'Unassigned'}</div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-4)' }}>SLA Status</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>First Response</span>
                <span style={{ fontSize: 'var(--text-xs)', color: ticket.sla.firstResponseState === 'BREACHED' ? 'var(--accent-red)' : 'var(--text-secondary)' }}>{ticket.sla.firstResponseState}</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: ticket.sla.firstResponseState === 'BREACHED' ? '100%' : '50%', background: ticket.sla.firstResponseState === 'BREACHED' ? 'var(--accent-red)' : 'var(--accent-green)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Resolution</span>
                <span style={{ fontSize: 'var(--text-xs)', color: ticket.sla.resolutionState === 'BREACHED' ? 'var(--accent-red)' : 'var(--text-secondary)' }}>{ticket.sla.resolutionState}</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: ticket.sla.resolutionState === 'BREACHED' ? '100%' : '50%', background: ticket.sla.resolutionState === 'BREACHED' ? 'var(--accent-red)' : 'var(--accent-green)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

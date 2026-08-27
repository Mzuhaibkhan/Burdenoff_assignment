import { expect, test, describe, mock } from 'bun:test';
import { TicketService } from '../../../apps/server/src/services/ticket/ticket.service';
import { InvalidTransitionError, ForbiddenError } from '../../../apps/server/src/errors/graphql-errors';
import { TicketStatus } from '@shared/types';


describe('Ticket Service', () => {
  const mockPrisma = {
    ticket: {
      findUnique: mock(),
      update: mock(),
      create: mock(),
    },
    user: {
      findUnique: mock(),
    }
  } as any;
  const mockSLA = {} as any;
  const service = new TicketService(mockPrisma, mockSLA);

  test('Valid state transition: OPEN -> IN_PROGRESS', async () => {
    mockPrisma.ticket.findUnique.mockResolvedValueOnce({ id: '1', status: TicketStatus.OPEN });
    mockPrisma.ticket.update.mockResolvedValueOnce({ id: '1', status: TicketStatus.IN_PROGRESS });

    const result = await service.changeStatus('1', TicketStatus.IN_PROGRESS);
    expect(result.status).toBe(TicketStatus.IN_PROGRESS);
  });

  test('Invalid state transition: CLOSED -> IN_PROGRESS', async () => {
    mockPrisma.ticket.findUnique.mockResolvedValueOnce({ id: '1', status: TicketStatus.CLOSED });
    
    expect(service.changeStatus('1', TicketStatus.IN_PROGRESS)).rejects.toThrow(InvalidTransitionError);
  });
  
  test('Assign to AGENT', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'AGENT' });
    mockPrisma.ticket.update.mockResolvedValueOnce({ id: '1', assigneeId: 'u1' });
    
    const result = await service.assignTicket('1', 'u1');
    expect(result.assigneeId).toBe('u1');
  });

  test('Assign to REPORTER fails', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'REPORTER' });
    
    expect(service.assignTicket('1', 'u1')).rejects.toThrow(ForbiddenError);
  });
});

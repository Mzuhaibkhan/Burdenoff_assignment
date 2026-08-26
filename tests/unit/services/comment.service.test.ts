import { expect, test, describe, mock } from 'bun:test';
import { CommentService } from '../../../apps/server/src/services/comment/comment.service';

describe('Comment Service', () => {
  const mockPrisma = {
    ticket: {
      findUnique: mock(),
      update: mock(),
    },
    comment: {
      create: mock(),
    }
  } as any;
  const service = new CommentService(mockPrisma);

  test('Agent comment sets firstResponseAt if null', async () => {
    mockPrisma.ticket.findUnique.mockResolvedValueOnce({ id: 'cuid000000000000000000000', reporterId: 'cuidu00000000000000000000', firstResponseAt: null });
    mockPrisma.comment.create.mockResolvedValueOnce({ id: 'cuidc10000000000000000000', content: 'test', ticketId: 'cuid000000000000000000000', authorId: 'cuida00000000000000000000' });
    mockPrisma.ticket.update.mockResolvedValueOnce({ id: 'cuid000000000000000000000' });
    
    await service.addComment('cuid000000000000000000000', 'test', 'cuida00000000000000000000'); // agent is not reporter
    
    expect(mockPrisma.ticket.update).toHaveBeenCalled();
  });

  test('Reporter comment does NOT set firstResponseAt', async () => {
    mockPrisma.ticket.update.mockClear();
    mockPrisma.ticket.findUnique.mockResolvedValueOnce({ id: 'cuid000000000000000000000', reporterId: 'cuidu00000000000000000000', firstResponseAt: null });
    mockPrisma.comment.create.mockResolvedValueOnce({ id: 'cuidc20000000000000000000', content: 'test', ticketId: 'cuid000000000000000000000', authorId: 'cuidu00000000000000000000' });
    
    await service.addComment('cuid000000000000000000000', 'test', 'cuidu00000000000000000000'); // reporter
    
    expect(mockPrisma.ticket.update).not.toHaveBeenCalled();
  });
});

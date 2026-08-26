import { expect, test, describe, beforeAll, afterAll } from 'bun:test';
import { PrismaClient } from '@prisma/client';
import { TicketService } from '../../apps/server/src/services/ticket/ticket.service';
import { CommentService } from '../../apps/server/src/services/comment/comment.service';
import { SLAService } from '../../apps/server/src/services/sla/sla.service';
import { Priority, TicketStatus } from '../../packages/shared/src/enums';
import { hash } from '@node-rs/argon2';

describe('Ticket Lifecycle Integration', () => {
  let prisma: PrismaClient;
  let ticketService: TicketService;
  let commentService: CommentService;
  let slaService: SLAService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    
    const config = { timezone: 'UTC', startHour: 9, endHour: 18 };
    const getHolidays = () => [];
    
    slaService = new SLAService(config, getHolidays);
    ticketService = new TicketService(prisma, slaService);
    commentService = new CommentService(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Create ticket -> Add reporter comment -> Add agent comment -> Verify firstResponseAt', async () => {
    // 1. Setup users
    const reporter = await prisma.user.create({
      data: {
        name: 'Integration Reporter',
        email: `reporter-${Date.now()}@test.com`,
        passwordHash: await hash('password'),
        role: 'REPORTER',
      }
    });

    const agent = await prisma.user.create({
      data: {
        name: 'Integration Agent',
        email: `agent-${Date.now()}@test.com`,
        passwordHash: await hash('password'),
        role: 'AGENT',
      }
    });

    // 2. Create ticket
    const ticket = await ticketService.createTicket({
      title: 'Integration Test Ticket',
      description: 'Test description',
      priority: Priority.HIGH
    }, reporter.id);

    expect(ticket.firstResponseAt).toBeNull();
    expect(ticket.status).toBe(TicketStatus.OPEN);

    // 3. Reporter adds comment (should not set firstResponseAt)
    await commentService.addComment(ticket.id, 'Reporter initial comment', reporter.id);
    
    let updatedTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(updatedTicket?.firstResponseAt).toBeNull();

    // 4. Agent adds comment (should set firstResponseAt)
    await commentService.addComment(ticket.id, 'Agent responds', agent.id);

    updatedTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(updatedTicket?.firstResponseAt).not.toBeNull();

    // 5. Verify SLA Info calculation
    const slaInfo = slaService.computeSLA({
      priority: updatedTicket!.priority as Priority,
      createdAt: updatedTicket!.createdAt,
      firstResponseAt: updatedTicket!.firstResponseAt,
      resolvedAt: updatedTicket!.resolvedAt,
    });

    // Since the first response was immediate, it should be ON_TRACK
    expect(slaInfo.firstResponseState).toBe('ON_TRACK');
  });
});

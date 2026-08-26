import { PrismaClient, UserRole, Priority, TicketStatus } from '@prisma/client';
import { hash } from '@node-rs/argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('password123');

  // Reporters and Agents
  const reporter1 = await prisma.user.upsert({
    where: { email: 'reporter@example.com' },
    update: {},
    create: {
      email: 'reporter@example.com',
      name: 'Alice Reporter',
      passwordHash,
      role: UserRole.REPORTER,
    },
  });

  const agent1 = await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: {},
    create: {
      email: 'agent@example.com',
      name: 'Bob Agent',
      passwordHash,
      role: UserRole.AGENT,
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: 'agent2@example.com' },
    update: {},
    create: {
      email: 'agent2@example.com',
      name: 'Carol Agent',
      passwordHash,
      role: UserRole.AGENT,
    },
  });

  // Tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Payment gateway down',
      description: 'The payment gateway is not working.',
      priority: Priority.URGENT,
      status: TicketStatus.OPEN,
      reporterId: reporter1.id,
    }
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Login authentication failing',
      description: 'Users cannot log in.',
      priority: Priority.HIGH,
      status: TicketStatus.IN_PROGRESS,
      reporterId: reporter1.id,
      assigneeId: agent1.id,
      firstResponseAt: new Date(),
    }
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: 'Dashboard loading slowly',
      description: 'The dashboard takes too long to load.',
      priority: Priority.MEDIUM,
      status: TicketStatus.OPEN,
      reporterId: reporter1.id,
    }
  });

  const ticket4 = await prisma.ticket.create({
    data: {
      title: 'Update footer links',
      description: 'Please update the links in the footer.',
      priority: Priority.LOW,
      status: TicketStatus.RESOLVED,
      reporterId: reporter1.id,
      assigneeId: agent2.id,
      resolvedAt: new Date(),
    }
  });

  // Holidays
  await prisma.holiday.createMany({
    data: [
      { name: 'Independence Day', date: new Date('2026-08-15T00:00:00Z') },
      { name: 'Gandhi Jayanti', date: new Date('2026-10-02T00:00:00Z') },
      { name: 'Christmas', date: new Date('2026-12-25T00:00:00Z') },
    ],
    skipDuplicates: true,
  });

  // Comments
  await prisma.comment.create({
    data: {
      content: 'I will look into this immediately.',
      ticketId: ticket2.id,
      authorId: agent1.id,
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    }
  });
  
  await prisma.comment.create({
    data: {
      content: 'The issue has been resolved.',
      ticketId: ticket4.id,
      authorId: agent2.id,
      createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    }
  });

  console.log('Seed data inserted successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

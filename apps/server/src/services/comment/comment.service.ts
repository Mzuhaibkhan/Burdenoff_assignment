import { PrismaClient } from '@prisma/client';
import { addCommentSchema } from '../../validation/comment.validation';
import { NotFoundError } from '../../errors/graphql-errors';

export class CommentService {
  constructor(private prisma: PrismaClient) {}

  async addComment(ticketId: string, content: string, authorId: string) {
    addCommentSchema.parse({ content, ticketId });

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, reporterId: true, firstResponseAt: true },
    });

    if (!ticket) throw new NotFoundError('Ticket', ticketId);

    const comment = await this.prisma.comment.create({
      data: { content, ticketId, authorId },
      include: { author: true },
    });

    // First response: non-reporter comments set the clock
    const isFirstResponse = authorId !== ticket.reporterId && !ticket.firstResponseAt;
    if (isFirstResponse) {
      await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { firstResponseAt: new Date() },
      });
    }

    return comment;
  }
}

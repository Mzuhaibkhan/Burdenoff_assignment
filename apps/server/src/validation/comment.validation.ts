import { z } from 'zod';

export const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(5000),
  ticketId: z.string().cuid('Invalid ticket ID'),
});

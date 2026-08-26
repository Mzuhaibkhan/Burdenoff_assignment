import { PrismaClient } from '@prisma/client';
import { hash, verify } from '@node-rs/argon2';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../../validation/auth.validation';
import { DuplicateError, NotFoundError, UnauthorizedError } from '../../errors/graphql-errors';
import { signToken } from '../../auth/jwt';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(input: z.infer<typeof registerSchema>) {
    const data = registerSchema.parse(input);
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new DuplicateError('User', 'email');
    
    const passwordHash = await hash(data.password);
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
      }
    });
    
    const token = signToken({ userId: user.id, role: user.role });
    return { token, user };
  }
  
  async login(input: z.infer<typeof loginSchema>) {
    const data = loginSchema.parse(input);
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new NotFoundError('User');
    
    const valid = await verify(user.passwordHash, data.password);
    if (!valid) throw new UnauthorizedError('Invalid password');
    
    const token = signToken({ userId: user.id, role: user.role });
    return { token, user };
  }
}

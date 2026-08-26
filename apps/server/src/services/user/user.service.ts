import { PrismaClient, UserRole } from '@prisma/client';

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async listUsers(role?: UserRole) {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { name: 'asc' }
    });
  }
}

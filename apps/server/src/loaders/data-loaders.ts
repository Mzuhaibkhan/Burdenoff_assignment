import DataLoader from 'dataloader';
import type { PrismaClient, User } from '@prisma/client';

export function createLoaders(prisma: PrismaClient) {
  return {
    userLoader: new DataLoader<string, User>(async (ids) => {
      const users = await prisma.user.findMany({
        where: { id: { in: [...ids] } },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));
      return ids.map((id) => userMap.get(id)!);
    }),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;

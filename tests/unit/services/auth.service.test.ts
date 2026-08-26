import { expect, test, describe, mock } from 'bun:test';
import { AuthService } from '../../../apps/server/src/services/auth/auth.service';
import { DuplicateError, UnauthorizedError } from '../../../apps/server/src/errors/graphql-errors';
import { hash } from '@node-rs/argon2';

mock.module('../../../apps/server/src/auth/jwt', () => ({
  signToken: () => 'mock-token'
}));

describe('Auth Service', () => {
  const mockPrisma = {
    user: {
      findUnique: mock(),
      create: mock(),
    },
  } as any;
  const service = new AuthService(mockPrisma);

  test('Register duplicate email', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: '1', email: 'test@test.com' });
    
    expect(service.register({ name: 'Test', email: 'test@test.com', password: 'password123', role: 'REPORTER' })).rejects.toThrow(DuplicateError);
  });

  test('Login with wrong password', async () => {
    const passwordHash = await hash('password123');
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: '1', email: 'test@test.com', passwordHash });
    
    expect(service.login({ email: 'test@test.com', password: 'wrongpassword' })).rejects.toThrow(UnauthorizedError);
  });
});

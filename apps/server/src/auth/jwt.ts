import jwt from 'jsonwebtoken';
import { env } from '../env';

interface TokenPayload {
  userId: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRY,
    issuer: 'burdenoff',
  });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    issuer: 'burdenoff',
  });
  return decoded as TokenPayload;
}

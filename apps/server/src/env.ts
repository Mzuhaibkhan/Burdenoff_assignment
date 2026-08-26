import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRY: z.string().default('7d'),
  BUSINESS_TIMEZONE: z.string().default('Asia/Kolkata'),
  BUSINESS_HOUR_START: z.coerce.number().min(0).max(23).default(9),
  BUSINESS_HOUR_END: z.coerce.number().min(1).max(24).default(18),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;

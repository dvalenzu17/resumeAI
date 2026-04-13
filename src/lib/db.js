import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

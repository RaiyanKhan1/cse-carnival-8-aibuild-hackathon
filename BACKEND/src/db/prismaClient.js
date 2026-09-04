// SINGLETON PRISMA CLIENT INSTANCE USED BY ALL MODELS
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
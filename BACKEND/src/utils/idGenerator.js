import { prisma } from '../db/prismaClient.js';

export async function nextId(prefix, model) {
  // Count existing rows and pad to 3 digits, matching seed format (sch-001, room-001, ...).
  const count = await prisma[model].count();
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
}

export async function nextBookingId() {
  const count = await prisma.roomBooking.count();
  return `bk-${String(count + 1).padStart(3, '0')}`;
}
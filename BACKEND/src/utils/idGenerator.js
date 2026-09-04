import { prisma } from '../db/prismaClient.js';

// RETURNS THE NEXT SERIAL ID FOR A DOMAIN, PADDED TO THREE DIGITS
export async function nextId(prefix, model) {
  const count = await prisma[model].count();
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
}

// RETURNS THE NEXT SERIAL BOOKING ID (BK-NNN)
export async function nextBookingId() {
  const count = await prisma.roomBooking.count();
  return `bk-${String(count + 1).padStart(3, '0')}`;
}
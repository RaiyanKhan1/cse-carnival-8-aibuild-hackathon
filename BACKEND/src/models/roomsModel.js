import { prisma } from '../db/prismaClient.js';

// RETURNS ALL ROOMS WITH THEIR BOOKINGS SORTED BY ROOM NUMBER
async function all() {
  return prisma.room.findMany({
    orderBy: { room_number: 'asc' },
    include: { bookings: { orderBy: [{ date: 'asc' }, { start_time: 'asc' }] } },
  });
}

// RETURNS A SINGLE ROOM WITH BOOKINGS BY PRIMARY KEY
async function byId(id) {
  return prisma.room.findUnique({
    where: { id },
    include: { bookings: { orderBy: [{ date: 'asc' }, { start_time: 'asc' }] } },
  });
}

// RETURNS A SINGLE ROOM WITH BOOKINGS BY ROOM NUMBER
async function byNumber(roomNumber) {
  return prisma.room.findUnique({
    where: { room_number: roomNumber },
    include: { bookings: { orderBy: [{ date: 'asc' }, { start_time: 'asc' }] } },
  });
}

// RETURNS TRUE IF A BOOKING ON THE ROOM OVERLAPS THE GIVEN WINDOW
async function hasOverlap(roomId, date, start, end, excludeBookingId = null) {
  const rows = await prisma.roomBooking.findMany({
    where: {
      room_id: roomId,
      date,
      ...(excludeBookingId ? { NOT: { booking_id: excludeBookingId } } : {}),
    },
  });
  return rows.some(b => !(b.end_time <= start || b.start_time >= end));
}

// CREATES A NEW ROOM AND RETURNS IT WITH BOOKINGS
async function create(data) {
  return prisma.room.create({
    data: { ...data, equipment: data.equipment || [] },
    include: { bookings: true },
  });
}

// UPDATES AN EXISTING ROOM OR RETURNS NULL IF MISSING
async function update(id, data) {
  const cur = await prisma.room.findUnique({ where: { id } });
  if (!cur) return null;
  return prisma.room.update({
    where: { id },
    data,
    include: { bookings: { orderBy: [{ date: 'asc' }, { start_time: 'asc' }] } },
  });
}

// DELETES A ROOM AND RETURNS THE NUMBER OF ROWS REMOVED
async function remove(id) {
  try { await prisma.room.delete({ where: { id } }); return 1; }
  catch { return 0; }
}

// APPENDS A NEW BOOKING TO A ROOM AND RETURNS THE UPDATED ROOM
async function addBooking(roomId, booking) {
  await prisma.roomBooking.create({ data: { ...booking, room_id: roomId } });
  return byId(roomId);
}

// REMOVES A BOOKING BY ITS ID AND RETURNS THE NUMBER OF ROWS DELETED
async function removeBooking(_roomId, bookingId) {
  try {
    await prisma.roomBooking.delete({ where: { booking_id: bookingId } });
    return 1;
  } catch { return 0; }
}

export const RoomsModel = { all, byId, byNumber, hasOverlap, create, update, remove, addBooking, removeBooking };
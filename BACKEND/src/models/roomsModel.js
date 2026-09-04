import { prisma } from '../db/prismaClient.js';

export const RoomsModel = {
  async all() {
    return prisma.room.findMany({
      orderBy: { room_number: 'asc' },
      include: { bookings: { orderBy: [{ date: 'asc' }, { start_time: 'asc' }] } },
    });
  },

  async byId(id) {
    return prisma.room.findUnique({
      where: { id },
      include: { bookings: { orderBy: [{ date: 'asc' }, { start_time: 'asc' }] } },
    });
  },

  async byNumber(roomNumber) {
    return prisma.room.findUnique({
      where: { room_number: roomNumber },
      include: { bookings: { orderBy: [{ date: 'asc' }, { start_time: 'asc' }] } },
    });
  },

  async hasOverlap(roomId, date, start, end, excludeBookingId = null) {
    const rows = await prisma.roomBooking.findMany({
      where: {
        room_id: roomId,
        date,
        ...(excludeBookingId ? { NOT: { booking_id: excludeBookingId } } : {}),
      },
    });
    return rows.some(b => !(b.end_time <= start || b.start_time >= end));
  },

  async create(data) {
    return prisma.room.create({
      data: { ...data, equipment: data.equipment || [] },
      include: { bookings: true },
    });
  },

  async update(id, data) {
    const cur = await prisma.room.findUnique({ where: { id } });
    if (!cur) return null;
    return prisma.room.update({
      where: { id },
      data,
      include: { bookings: { orderBy: [{ date: 'asc' }, { start_time: 'asc' }] } },
    });
  },

  async remove(id) {
    try { await prisma.room.delete({ where: { id } }); return 1; }
    catch { return 0; }
  },

  async addBooking(roomId, booking) {
    await prisma.roomBooking.create({ data: { ...booking, room_id: roomId } });
    return this.byId(roomId);
  },

  async removeBooking(roomId, bookingId) {
    try {
      await prisma.roomBooking.delete({ where: { booking_id: bookingId } });
      return 1;
    } catch { return 0; }
  },
};
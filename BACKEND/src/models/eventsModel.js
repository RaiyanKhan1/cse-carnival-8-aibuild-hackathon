import { prisma } from '../db/prismaClient.js';

export const EventsModel = {
  async all() {
    return prisma.event.findMany({
      orderBy: [{ date: 'asc' }, { start_time: 'asc' }],
      include: { registrations: true },
    });
  },

  async byId(id) {
    return prisma.event.findUnique({
      where: { id },
      include: { registrations: true },
    });
  },

  async create(data) {
    const { registrations: _r, ...rest } = data;
    return prisma.event.create({ data: rest });
  },

  async update(id, data) {
    const cur = await prisma.event.findUnique({ where: { id } });
    if (!cur) return null;
    return prisma.event.update({ where: { id }, data });
  },

  async remove(id) {
    try { await prisma.event.delete({ where: { id } }); return 1; }
    catch { return 0; }
  },

  async register(eventId, student) {
    const ev = await this.byId(eventId);
    if (!ev) return { error: 'not_found' };
    if (ev.registrations.some(r => r.student_id === student.student_id)) return { error: 'already_registered' };
    if (ev.registered >= ev.capacity) return { error: 'full' };

    await prisma.eventRegistration.create({
      data: { event_id: eventId, student_id: student.student_id, name: student.name },
    });
    const newCount = ev.registered + 1;
    const newStatus = newCount >= ev.capacity ? 'full' : ev.status;
    await prisma.event.update({ where: { id: eventId }, data: { registered: newCount, status: newStatus } });
    return { event: await this.byId(eventId) };
  },

  async unregister(eventId, studentId) {
    try {
      await prisma.eventRegistration.delete({
        where: { event_id_student_id: { event_id: eventId, student_id } },
      });
    } catch { return { error: 'not_registered' }; }

    const ev = await this.byId(eventId);
    if (ev && ev.status === 'full') {
      await prisma.event.update({ where: { id: eventId }, data: { status: 'upcoming' } });
    }
    return { event: await this.byId(eventId) };
  },
};
import { prisma } from '../db/prismaClient.js';

export const SchedulesModel = {
  async all() {
    return prisma.schedule.findMany({ orderBy: [{ day: 'asc' }, { start_time: 'asc' }] });
  },
  async byId(id) {
    return prisma.schedule.findUnique({ where: { id } });
  },
  async byCourse(course) {
    return prisma.schedule.findMany({ where: { course: { equals: course } } });
  },
  async create(data) {
    return prisma.schedule.create({ data });
  },
  async update(id, data) {
    const cur = await prisma.schedule.findUnique({ where: { id } });
    if (!cur) return null;
    return prisma.schedule.update({ where: { id }, data });
  },
  async remove(id) {
    try { await prisma.schedule.delete({ where: { id } }); return 1; }
    catch { return 0; }
  },
};
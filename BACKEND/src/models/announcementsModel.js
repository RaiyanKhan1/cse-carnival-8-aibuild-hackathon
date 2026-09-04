import { prisma } from '../db/prismaClient.js';

export const AnnouncementsModel = {
  async all() { return prisma.announcement.findMany({ orderBy: { date: 'desc' } }); },
  async byId(id) { return prisma.announcement.findUnique({ where: { id } }); },
  async create(data) { return prisma.announcement.create({ data }); },
  async update(id, data) {
    const cur = await prisma.announcement.findUnique({ where: { id } });
    if (!cur) return null;
    return prisma.announcement.update({ where: { id }, data });
  },
  async remove(id) {
    try { await prisma.announcement.delete({ where: { id } }); return 1; }
    catch { return 0; }
  },
};
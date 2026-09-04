import { prisma } from '../db/prismaClient.js';

export const AssignmentsModel = {
  async all() { return prisma.assignment.findMany({ orderBy: { deadline: 'asc' } }); },
  async byId(id) { return prisma.assignment.findUnique({ where: { id } }); },
  async dueBetween(startISO, endISO) {
    return prisma.assignment.findMany({
      where: { deadline: { gte: startISO, lte: endISO } },
      orderBy: { deadline: 'asc' },
    });
  },
  async create(data) { return prisma.assignment.create({ data }); },
  async update(id, data) {
    const cur = await prisma.assignment.findUnique({ where: { id } });
    if (!cur) return null;
    return prisma.assignment.update({ where: { id }, data });
  },
  async remove(id) {
    try { await prisma.assignment.delete({ where: { id } }); return 1; }
    catch { return 0; }
  },
};